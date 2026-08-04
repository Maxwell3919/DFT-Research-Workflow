#!/usr/bin/env python3
"""Fail-closed raw-QE parser for the captured aluminium workflow."""
from __future__ import annotations

import csv
import hashlib
import json
import re
from datetime import datetime
from pathlib import Path

import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parent
EXPECTED = {
    "input/scf.in": "660983565543f2bc154fe3d79a7bf480b2e02b9ae705d706457c661a64087ac0",
    "input/nscf.in": "1fdef0bc99e977e96b5d7cec1b750fe009170253a2953f197212c01103ff259d",
    "input/bands.in": "62a0406cd30f6b85c358e2f8efb76aab1ee79f8d4fbc494329e9d5c906c53141",
    "output/scf.out": "3a48a4fade8c52fd1b5e4d816be439de79911b3c9d7ea3d71f16257b6c9e0b39",
    "output/nscf-full.out": "fe4e1ecb29004cfadecff46d6b81748b085682c0abfc987be0be4e28205fed66",
    "output/bands.out": "312a05a44bbb15ed5ee5c437ac52fd658a2e43e35b56a2b49cfb231d711b4a95",
    "output/compact-source-excerpt.txt": "3177b6ab03f645ff35656b115cae0c179a59221cc42aa48b3cbda6e6bf0633a9",
}
FLOAT = re.compile(r"[-+]?\d+\.\d+")
BLOCK = re.compile(r"^\s*k\s*=\s*(.*?)\s*\(\s*\d+\s+PWs\)\s+bands \(ev\):\s*\n\s*([^\n]+)", re.MULTILINE)


def sha(relative: str) -> str:
    return hashlib.sha256((ROOT / relative).read_bytes()).hexdigest()


def need(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(f"FAIL {message}")


def artifact(role: str, relative: str) -> dict[str, object]:
    path = ROOT / relative
    return {"role": role, "path": relative, "sha256": sha(relative), "bytes": path.stat().st_size}


def output_text(relative: str, markers: list[str]) -> str:
    text = (ROOT / relative).read_text(encoding="utf-8")
    need("Program PWSCF v.7.5" in text, f"{relative} missing QE 7.5 banner")
    need(text.count("JOB DONE.") == 1, f"{relative} must have exactly one JOB DONE marker")
    for marker in ["Error in routine", "convergence NOT achieved", "stopping ..."]:
        need(marker not in text, f"{relative} contains fatal/nonconvergence marker {marker}")
    for marker in markers:
        need(marker in text, f"{relative} missing {marker}")
    return text


def parse_eigenvalues(text: str, label: str) -> list[dict[str, float | int]]:
    rows = []
    for index, (coord_text, energy_text) in enumerate(BLOCK.findall(text)):
        coords = [float(value) for value in FLOAT.findall(coord_text)]
        energies = [float(value) for value in FLOAT.findall(energy_text)]
        need(len(coords) == 3, f"{label} k-point {index} does not have three coordinates")
        need(len(energies) == 4, f"{label} k-point {index} does not have four bands")
        rows.append({"index": index, "kx_cart_2pi_over_alat": coords[0], "ky_cart_2pi_over_alat": coords[1], "kz_cart_2pi_over_alat": coords[2], **{f"band_{band + 1}_ev": energy for band, energy in enumerate(energies)}})
    need(rows, f"{label} contains no parseable eigenvalue blocks")
    return rows


def timestamp(text: str, pattern: str, layout: str) -> str:
    match = re.search(pattern, text)
    need(match is not None, "missing captured QE timestamp")
    parsed = datetime.strptime(" ".join(match.groups()), layout)
    return parsed.isoformat(timespec="seconds") + "+08:00"


def write_table(relative: str, rows: list[dict[str, float | int]], fermi: float) -> None:
    fields = ["index", "kx_cart_2pi_over_alat", "ky_cart_2pi_over_alat", "kz_cart_2pi_over_alat", "band_1_ev", "band_2_ev", "band_3_ev", "band_4_ev", "fermi_ev"]
    with (ROOT / relative).open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, lineterminator="\n")
        writer.writeheader()
        for row in rows:
            writer.writerow({**row, "fermi_ev": fermi})


def main() -> None:
    for relative, expected in EXPECTED.items():
        need(sha(relative) == expected, f"SHA-256 mismatch for {relative}")
    for relative in ("output/scf.err", "output/nscf-full.err", "output/bands.err"):
        need((ROOT / relative).read_bytes() == b"", f"{relative} is not empty")
    scf = output_text("output/scf.out", ["convergence has been achieved in   5 iterations", "the Fermi energy is     7.8018 ev"])
    nscf = output_text("output/nscf-full.out", ["End of band structure calculation", "the Fermi energy is     7.8018 ev"])
    bands = output_text("output/bands.out", ["End of band structure calculation"])
    for relative in ("input/scf.in", "input/nscf.in", "input/bands.in"):
        input_text = (ROOT / relative).read_text(encoding="utf-8")
        need("occupations = 'smearing'" in input_text and "smearing = 'mv'" in input_text and "degauss = 0.02" in input_text, f"{relative} lacks explicit metallic policy")
    need("K_POINTS automatic\n  8 8 8 0 0 0" in (ROOT / "input/scf.in").read_text(), "SCF 8x8x8 mesh missing")
    nscf_input = (ROOT / "input/nscf.in").read_text()
    need("nosym = .true." in nscf_input and "noinv = .true." in nscf_input, "full-zone NSCF policy missing")
    need("K_POINTS crystal_b" in (ROOT / "input/bands.in").read_text(), "explicit bands path missing")
    fermi = float(re.search(r"the Fermi energy is\s+([0-9.]+) ev", nscf).group(1))
    mesh, path = parse_eigenvalues(nscf, "full-zone NSCF"), parse_eigenvalues(bands, "bands path")
    need(len(mesh) == 512, f"full-zone raw parser produced {len(mesh)} rows, not 512")
    need(len(path) == 145, f"bands raw parser produced {len(path)} rows, not 145")
    crossings = sum((left["band_2_ev"] - fermi) * (right["band_2_ev"] - fermi) < 0 for left, right in zip(path, path[1:]))
    near = sum(abs(row["band_2_ev"] - fermi) <= 0.25 for row in mesh)
    need(crossings == 3 and near == 48, "raw-derived crossing/near-Fermi ledger mismatch")
    (ROOT / "derived").mkdir(exist_ok=True)
    (ROOT / "figures").mkdir(exist_ok=True)
    write_table("derived/al-mesh.csv", mesh, fermi)
    write_table("derived/al-path.csv", path, fermi)
    started = timestamp(scf, r"starts on\s+(\d+\w+\d+)\s+at\s+(\d{1,2}:\d{2}:\d{2})", "%d%b%Y %H:%M:%S")
    completed = timestamp(bands, r"This run was terminated on:\s+(\d{1,2}:\d{2}:\d{2})\s+(\d+\w+\d+)", "%H:%M:%S %d%b%Y")
    summary = {"qe_version": "7.5", "started_at": started, "completed_at": completed, "captured_stages": ["scf", "nscf-full-zone", "bands"], "scf_iterations": 5, "fermi_energy_ev": fermi, "mesh_points": len(mesh), "path_points": len(path), "selected_band_crossing_intervals": crossings, "near_fermi_mesh_points_abs_delta_leq_0_25_ev": near, "evidence_boundary": "Tables and figure are directly parsed from captured raw output. This proves neither numerical convergence nor a material conclusion."}
    (ROOT / "derived/captured-run-summary.json").write_text(json.dumps(summary, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    figure, axis = plt.subplots(figsize=(6.2, 3.8))
    axis.hist([row["band_2_ev"] - fermi for row in mesh], bins=42, color="#2b6cb0")
    axis.axvline(0.0, color="#b91c1c", label="Fermi reference")
    axis.set(xlabel="Band 2 minus Fermi level (eV)", ylabel="Raw-NSCF sampled k points", title="Al 8x8x8 captured NSCF: raw-output-derived sampling")
    axis.legend(frameon=False)
    figure.tight_layout()
    figure.savefig(ROOT / "figures/raw-nscf-band2-sampling.png", dpi=160)
    plt.close(figure)
    artifacts = [artifact("deterministic public output excerpt rendered by the Worked Workflow", "output/compact-source-excerpt.txt"), artifact("SCF input", "input/scf.in"), artifact("NSCF input", "input/nscf.in"), artifact("bands input", "input/bands.in"), artifact("SCF stdout", "output/scf.out"), artifact("SCF stderr", "output/scf.err"), artifact("NSCF stdout", "output/nscf-full.out"), artifact("NSCF stderr", "output/nscf-full.err"), artifact("bands stdout", "output/bands.out"), artifact("bands stderr", "output/bands.err"), artifact("raw-derived mesh table", "derived/al-mesh.csv"), artifact("raw-derived path table", "derived/al-path.csv"), artifact("raw-derived summary", "derived/captured-run-summary.json"), artifact("raw-output-derived NSCF band sampling histogram", "figures/raw-nscf-band2-sampling.png")]
    artifacts[-1]["alt"] = "Histogram of Aluminium band 2 eigenvalues minus the Fermi level over the captured 8 by 8 by 8 NSCF k-point sample, with the zero-energy Fermi reference marked in red."
    manifest = {"schema_version": "1.0", "case_id": "aluminium-metallic-electronic-structure", "title": "Aluminium metallic electronic structure captured QE workflow", "case_kind": "worked-workflow", "evidence_class": "real-execution", "public_host_label": "Talos-captured public case evidence", "started_at": started, "completed_at": completed, "exit_code": 0, "software": [{"name": "Quantum ESPRESSO PWSCF", "version": "7.5", "interface": "MPI CLI (one recorded process)"}, {"name": "case-local raw-output parser", "version": "2.0", "interface": "Python CLI"}], "sources": [{"id": "captured-qe-outputs", "role": "hash-bound raw execution output", "path": "output/scf.out", "sha256": sha("output/scf.out"), "licence_boundary": "No private host path, pseudopotential body, restart tree, or wavefunction payload is published."}], "commands": [{"stage": "scf", "command": "pw.x -in scf.in > scf.out 2> scf.err", "exit_code": 0}, {"stage": "full-zone-nscf", "command": "pw.x -in nscf.in > nscf-full.out 2> nscf-full.err", "exit_code": 0}, {"stage": "bands", "command": "pw.x -in bands.in > bands.out 2> bands.err", "exit_code": 0}, {"stage": "raw-output-parse", "command": "python3 parse.py", "exit_code": 0}], "artifacts": artifacts, "gates": {"G0": {"status": "PASS", "summary": "Required tree and declared raw-input/output hashes pass strict parsing."}, "G1": {"status": "PASS", "summary": "Captured QE 7.5 SCF, NSCF, and bands outputs each have one terminal marker and empty captured stderr."}, "G2": {"status": "PASS", "summary": "Captured SCF reports electronic convergence in 5 iterations at its declared threshold; this is not a convergence study."}, "G3": {"status": "PASS", "summary": "Three-stage stdout/stderr and raw-output-derived tables/PNG are present."}, "G4": {"status": "NOT TESTED", "summary": "No observable-specific k-mesh, smearing, cutoff, empty-band, or DOS-broadening convergence series."}, "G5": {"status": "NOT CLAIMED", "summary": "No physical or material-level scientific conclusion is claimed."}}, "claim_boundary": {"supports": ["A captured QE 7.5 metallic SCF, full-zone NSCF, and band-path execution record with raw-output-derived tables and figure."], "does_not_support": ["A converged DOS, Fermi surface, EOS, elastic property, carrier density, or transport result.", "A universal smearing/k-mesh prescription.", "A material-level physical or scientific conclusion."]}}
    (ROOT / "manifest.json").write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print("PASS captured QE Al raw outputs parsed with G4/G5 explicitly unclaimed")


if __name__ == "__main__":
    main()
