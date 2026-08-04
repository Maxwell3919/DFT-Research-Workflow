#!/usr/bin/env python3
"""Fail-closed input and output parser for the bounded graphene QE case."""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import re
from pathlib import Path

CASE = Path(__file__).resolve().parent
INPUT = CASE / "input"
OUTPUT = CASE / "output"
DERIVED = CASE / "derived"
FIGURES = CASE / "figures"
PSEUDO_FILE = "C.pbe-n-kjpaw_psl.1.0.0.UPF"
PSEUDO_SHA256 = "9900d1efd50b9848e31849f39094b33348486b400ee51e0f3922f716137cf3d7"
INPUT_NAMES = ("graphene.scf.in", "graphene.bands.in", "graphene.bands.x.in")
OUTPUT_NAMES = ("graphene.scf.stdout", "graphene.scf.stderr", "graphene.scf.exit", "execution-environment.txt", "graphene.scf-qeguard-audit.json", "scf-parent-evidence.json", "graphene.bands.parent-scf.stdout", "graphene.bands.parent-scf.stderr", "graphene.bands.parent-scf.exit", "graphene.bands.pw.stdout", "graphene.bands.pw.stderr", "graphene.bands.pw.exit", "graphene.bands.x.stdout", "graphene.bands.x.stderr", "graphene.bands.x.exit", "graphene.bands.dat", "bands-execution-environment.txt")


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def require(text: str, fragment: str, name: str) -> None:
    if fragment not in text:
        raise ValueError(f"{name}: missing required fragment {fragment!r}")


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def static_audit() -> dict:
    plan = read_json(CASE / "qe_plan.json")
    provenance = read_json(CASE / "pseudo-provenance.json")
    model = read_json(CASE / "source/graphene-primitive-model.json")
    if plan["qe_version"] != "7.5" or plan["task_type"] != "bands":
        raise ValueError("plan is not pinned to QE 7.5")
    if plan["minimum_workflow"] != ["pw.x:scf", "pw.x:bands", "bands.x"] or plan["decision"] != "pass" or plan["state"] != "plan_ready":
        raise ValueError("plan is not a qe_guard 1.1 bands workflow")
    parameters = plan["case_parameters"]
    if parameters["pseudopotential"]["file"] != PSEUDO_FILE or parameters["pseudopotential"]["sha256"] != PSEUDO_SHA256:
        raise ValueError("plan pseudopotential identity differs from the fixed public provenance")
    if provenance["file"] != PSEUDO_FILE or provenance["sha256"] != PSEUDO_SHA256:
        raise ValueError("pseudo provenance identity differs from the fixed SHA-256")
    pseudo_manifest = read_json(CASE / "pseudo-manifest.json")
    entries = pseudo_manifest.get("pseudopotentials")
    if pseudo_manifest.get("schema_version") != "1.0" or not isinstance(entries, list) or len(entries) != 1:
        raise ValueError("pseudo manifest is not qe_guard-compatible schema 1.0")
    entry = entries[0]
    if not isinstance(entry, dict) or entry.get("filename") != PSEUDO_FILE or entry.get("sha256") != PSEUDO_SHA256 or entry.get("xc_functional") != "SLA  PW   PBX  PBC" or entry.get("relativistic") != "scalar":
        raise ValueError("pseudo manifest does not declare the exact KJPAW identity and UPF metadata")
    if parameters["numerical_starting_choices"]["scf_k_mesh"] != [18, 18, 1]:
        raise ValueError("plan must retain 18x18x1 SCF sampling")
    if parameters["model"]["cell_height_angstrom"] != 20.0 or parameters["model"]["z_sampling"] != 1:
        raise ValueError("plan must retain the 20 Angstrom / kz=1 2D boundary")
    if len(model["sites"]) != 2 or model["vacuum_model"]["cell_height_angstrom"] != 20.0:
        raise ValueError("source model is not the declared two-atom 20 Angstrom graphene cell")

    scf = (INPUT / "graphene.scf.in").read_text(encoding="utf-8")
    bands = (INPUT / "graphene.bands.in").read_text(encoding="utf-8")
    bandsx = (INPUT / "graphene.bands.x.in").read_text(encoding="utf-8")
    for name, text, calculation in (("scf", scf, "calculation = 'scf'"), ("bands", bands, "calculation = 'bands'")):
        require(text, calculation, name)
        for fragment in ("prefix = 'graphene'", "outdir = './tmp'", "pseudo_dir = './pseudo'", f"C 12.011 {PSEUDO_FILE}", "ecutwfc = 50.0", "ecutrho = 400.0", "nbnd = 8", "degauss = 0.01", "CELL_PARAMETERS angstrom", "20.000000000"):
            require(text, fragment, name)
    require(scf, "K_POINTS automatic\n18 18 1 0 0 0", "scf")
    require(bands, "K_POINTS crystal_b\n4", "bands")
    for fragment in ("0.3333333333 0.3333333333 0.0000000000 40", "0.5000000000 0.0000000000 0.0000000000 40"):
        require(bands, fragment, "bands")
    for fragment in ("prefix = 'graphene'", "outdir = './tmp'", "filband = 'graphene.bands.dat'"):
        require(bandsx, fragment, "bands.x")
    actual_input_hashes = {name: digest(INPUT / name) for name in INPUT_NAMES}
    if parameters["input_sha256"] != actual_input_hashes:
        raise ValueError("qe_plan input_sha256 does not bind the exact committed inputs")
    return {"input_sha256": actual_input_hashes, "model_sha256": digest(CASE / "source/graphene-primitive-model.json"), "pseudo_provenance_sha256": digest(CASE / "pseudo-provenance.json")}


def output_available() -> bool:
    return all((OUTPUT / name).is_file() for name in OUTPUT_NAMES)


def validate_scf_parent_evidence() -> None:
    evidence = read_json(OUTPUT / "scf-parent-evidence.json")
    expected = {
        "schema_version": "1.0",
        "case_id": "graphene-qe-2d-teaching",
        "scientific_protocol_id": "graphene-qe-7.5-band-path-teaching-v1",
        "stage": "scf",
    }
    for key, value in expected.items():
        if evidence.get(key) != value:
            raise ValueError(f"SCF parent evidence {key} differs from the active contract")
    artifacts = evidence.get("artifacts")
    if not isinstance(artifacts, dict):
        raise ValueError("SCF parent evidence lacks the artifact hash map")
    for relative in ("input/graphene.scf.in", "output/graphene.scf.stdout", "output/graphene.scf.stderr", "output/graphene.scf.exit", "output/execution-environment.txt"):
        if artifacts.get(relative) != digest(CASE / relative):
            raise ValueError(f"SCF parent evidence does not bind {relative}")
    audit = read_json(OUTPUT / "graphene.scf-qeguard-audit.json")
    if evidence.get("scf_qeguard_audit_sha256") != digest(OUTPUT / "graphene.scf-qeguard-audit.json"):
        raise ValueError("SCF parent evidence does not bind its QE guard audit")
    if audit.get("decision") != "pass" or audit.get("gates", {}).get("execution_completion") != "pass":
        raise ValueError("SCF parent QE guard audit is not a passing execution-completion record")


def parse_number(text: str, pattern: str, label: str) -> float:
    match = re.search(pattern, text, flags=re.IGNORECASE | re.MULTILINE)
    if not match:
        raise ValueError(f"missing {label}")
    return float(match.group(1).replace("D", "E").replace("d", "e"))


def parse_bands_data(path: Path) -> tuple[int, list[tuple[tuple[float, float, float], list[float]]]]:
    lines = [line.strip() for line in path.read_text(encoding="utf-8", errors="replace").splitlines() if line.strip()]
    if not lines or not lines[0].lower().startswith("&plot"):
        raise ValueError("bands.x data lacks the expected &plot header")
    header = " ".join(lines[:2])
    nbnd_match = re.search(r"nbnd\s*=\s*(\d+)", header, flags=re.I)
    nks_match = re.search(r"nks\s*=\s*(\d+)", header, flags=re.I)
    if not nbnd_match or not nks_match:
        raise ValueError("bands.x header lacks nbnd or nks")
    nbnd, nks = int(nbnd_match.group(1)), int(nks_match.group(1))
    if nbnd != 8 or nks < 100:
        raise ValueError(f"unexpected band dimensions nbnd={nbnd}, nks={nks}")
    if "/" in lines[0]:
        start = 1
    else:
        start = next((i + 1 for i, line in enumerate(lines) if line == "/"), None)
    if start is None:
        raise ValueError("bands.x &plot header is not closed")
    records = []
    index = start
    number = re.compile(r"[-+]?\d+(?:\.\d*)?(?:[EeDd][-+]?\d+)?")
    while index < len(lines) and len(records) < nks:
        coordinates = [float(token.replace("D", "E").replace("d", "e")) for token in number.findall(lines[index])]
        if len(coordinates) != 3:
            raise ValueError(f"bands.x k-point line {index + 1} is not exactly three numbers")
        index += 1
        values: list[float] = []
        while index < len(lines) and len(values) < nbnd:
            values.extend(float(token.replace("D", "E").replace("d", "e")) for token in number.findall(lines[index]))
            index += 1
        if len(values) != nbnd:
            raise ValueError("bands.x eigenvalue block does not match nbnd")
        records.append(((coordinates[0], coordinates[1], coordinates[2]), values))
    if len(records) != nks or index != len(lines):
        raise ValueError("bands.x record count does not match nks exactly")
    return nbnd, records


def execution_record() -> dict:
    static = static_audit()
    if not output_available():
        raise ValueError("complete QE output set is not available")
    validate_scf_parent_evidence()
    scf = (OUTPUT / "graphene.scf.stdout").read_text(encoding="utf-8", errors="replace")
    bands_parent_scf = (OUTPUT / "graphene.bands.parent-scf.stdout").read_text(encoding="utf-8", errors="replace")
    bands_pw = (OUTPUT / "graphene.bands.pw.stdout").read_text(encoding="utf-8", errors="replace")
    bands_x = (OUTPUT / "graphene.bands.x.stdout").read_text(encoding="utf-8", errors="replace")
    for stage in ("graphene.scf", "graphene.bands.parent-scf", "graphene.bands.pw", "graphene.bands.x"):
        if (OUTPUT / f"{stage}.exit").read_text(encoding="utf-8") != "exit_code=0\n":
            raise ValueError(f"{stage} did not record exit_code=0")
    for name, text in (("scf", scf), ("bands pw.x", bands_pw)):
        require(text, "JOB DONE.", name)
        require(text, "Program PWSCF v.7.5", name)
    require(scf.lower(), "convergence has been achieved", "scf")
    require(bands_parent_scf, "JOB DONE.", "bands parent SCF")
    require(bands_parent_scf, "Program PWSCF v.7.5", "bands parent SCF")
    require(bands_parent_scf.lower(), "convergence has been achieved", "bands parent SCF")
    require(bands_x.lower(), "bands written to file", "bands.x")
    total_energy = parse_number(bands_parent_scf, r"!\s+total energy\s+=\s+([-+0-9.DEded]+)\s+Ry", "bands-parent SCF total energy")
    fermi = parse_number(bands_parent_scf, r"the Fermi energy is\s+([-+0-9.DEded]+)\s+ev", "bands-parent SCF Fermi energy")
    nbnd, records = parse_bands_data(OUTPUT / "graphene.bands.dat")
    distances = [0.0]
    for left, right in zip(records, records[1:]):
        distances.append(distances[-1] + math.dist(left[0], right[0]))
    min_distance = min(abs(value - fermi) for _, values in records for value in values)
    return {
        "case_id": "graphene-electronic-structure-qe",
        "input_sha256": static["input_sha256"],
        "pseudo_sha256": PSEUDO_SHA256,
        "bands_parent_scf_sha256": digest(OUTPUT / "graphene.bands.parent-scf.stdout"),
        "scf_total_energy_ry": total_energy,
        "fermi_energy_ev": fermi,
        "band_count": nbnd,
        "band_kpoints": len(records),
        "minimum_path_distance_to_fermi_ev": min_distance,
        "path_labels": ["Gamma", "K", "M", "Gamma"],
        "path_fractional_coordinates": [list(coords) for coords, _ in records],
        "path_distances": distances,
        "eigenvalues_ev": [values for _, values in records],
        "output_sha256": {name: digest(OUTPUT / name) for name in OUTPUT_NAMES},
        "claim_boundary": "The values are confined to this one input and Gamma-K-M-Gamma path. They do not establish vacuum, cutoff, k-mesh, smearing, path, or observable convergence; a path-local distance to the Fermi energy is not a full-zone band gap or a topology claim."
    }


def write_derived(record: dict) -> None:
    DERIVED.mkdir(exist_ok=True)
    FIGURES.mkdir(exist_ok=True)
    summary = {key: value for key, value in record.items() if key not in {"path_fractional_coordinates", "path_distances", "eigenvalues_ev"}}
    (DERIVED / "graphene-band-summary.json").write_text(json.dumps(summary, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    with (DERIVED / "graphene-band-path.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["index", "distance_fractional", "kx_fractional", "ky_fractional", "kz_fractional", *[f"band_{i + 1}_ev" for i in range(record["band_count"])]] )
        for index, (coords, distance, values) in enumerate(zip(record["path_fractional_coordinates"], record["path_distances"], record["eigenvalues_ev"])):
            writer.writerow([index, f"{distance:.12f}", *[f"{value:.12f}" for value in coords], *[f"{value:.12f}" for value in values]])
    import matplotlib.pyplot as plt
    fig, axis = plt.subplots(figsize=(6.2, 4.2))
    for band in range(record["band_count"]):
        axis.plot(record["path_distances"], [row[band] - record["fermi_energy_ev"] for row in record["eigenvalues_ev"]], color="#1f2937", linewidth=0.8)
    total = record["path_distances"][-1]
    marks = [0.0, total / 3.0, 2.0 * total / 3.0, total]
    for mark in marks[1:-1]: axis.axvline(mark, color="#9ca3af", linewidth=0.6)
    axis.axhline(0.0, color="#b91c1c", linewidth=0.8, linestyle="--")
    axis.set(xlim=(0.0, total), xticks=marks, xticklabels=[r"$\Gamma$", "K", "M", r"$\Gamma$"], ylabel="E - Fermi energy (eV)", title="Graphene QE 7.5 teaching path")
    fig.tight_layout()
    fig.savefig(FIGURES / "graphene-band-path.png", dpi=170)
    plt.close(fig)


def artifact(role: str, relative: str) -> dict:
    path = CASE / relative
    return {"role": role, "path": relative, "sha256": digest(path), "bytes": path.stat().st_size}


def manifest(record: dict | None) -> dict:
    static = static_audit()
    artifacts = [
        artifact("graphene source model", "source/graphene-primitive-model.json"),
        artifact("SCF input", "input/graphene.scf.in"),
        artifact("bands pw.x input", "input/graphene.bands.in"),
        artifact("bands.x input", "input/graphene.bands.x.in"),
        artifact("QE execution plan", "qe_plan.json"),
        artifact("public pseudopotential provenance", "pseudo-provenance.json"),
        artifact("qe_guard-compatible pseudopotential manifest", "pseudo-manifest.json"),
        artifact("prepared environment record", "environment.txt"),
    ]
    base = {
        "schema_version": "1.0",
        "case_id": "graphene-electronic-structure-qe",
        "title": "Graphene QE 7.5 SCF and Gamma-K-M-Gamma electronic-structure entry",
        "case_kind": "calculation",
        "evidence_class": "real-execution",
        "public_host_label": "QE 7.5 execution environment; host identity withheld",
        "software": [{"name": "Quantum ESPRESSO PWscf", "version": "7.5", "interface": "pw.x command-line entry"}, {"name": "Quantum ESPRESSO bands", "version": "7.5", "interface": "bands.x command-line entry"}],
        "sources": [
            {"id": "original-graphene-teaching-model", "role": "two-atom 2D periodic teaching geometry", "path": "source/graphene-primitive-model.json", "sha256": static["model_sha256"], "licence_boundary": "Original teaching model; it does not assert a database identity or relaxed geometry."},
            {"id": "pslibrary-carbon-kjpaw", "role": "public pseudopotential provenance and identity", "path": "pseudo-provenance.json", "sha256": static["pseudo_provenance_sha256"], "url": "https://pseudopotentials.quantum-espresso.org/upf_files/C.pbe-n-kjpaw_psl.1.0.0.UPF", "accessed_at": "2026-08-05", "licence_boundary": "Only provenance and SHA-256 are retained; the UPF payload is not redistributed."}
        ],
        "artifacts": artifacts,
        "claim_boundary": {"supports": ["The fixed, hash-bound QE 7.5 input contract for a two-atom 2D graphene model with 20.0 Angstrom cell height, kz=1, and a Gamma-K-M-Gamma teaching path."], "does_not_support": ["Vacuum, cutoff, k-mesh, smearing, path, or observable convergence.", "A full-zone band property, Dirac topology, stability assessment, or any broader material conclusion."]}
    }
    if record is None:
        base.update({"started_at": None, "completed_at": None, "exit_code": None, "commands": [{"stage": "read-only-QE-preflight", "command": "QE 7.5 executable and public pseudo identity checked without job submission", "exit_code": 0}, {"stage": "static-input-audit", "command": "python3 parse.py --static", "exit_code": 0}], "gates": {"G0": {"status": "PASS", "summary": "Prepared source, inputs, public pseudo provenance, hashes, and strict static audit are present."}, "G1": {"status": "NOT TESTED", "summary": "No SCF, bands pw.x, or bands.x calculation has been run for this case."}, "G2": {"status": "NOT TESTED", "summary": "No SCF convergence marker has been returned."}, "G3": {"status": "NOT TESTED", "summary": "No SCF-to-bands output chain has been returned."}, "G4": {"status": "NOT TESTED", "summary": "No comparative vacuum, cutoff, k-mesh, smearing, path, or observable series has been run."}, "G5": {"status": "NOT CLAIMED", "summary": "The prepared inputs support no electronic or material conclusion."}}})
        return base
    for role, relative in (("independent SCF stdout", "output/graphene.scf.stdout"), ("independent SCF stderr", "output/graphene.scf.stderr"), ("independent SCF exit status", "output/graphene.scf.exit"), ("independent SCF execution environment", "output/execution-environment.txt"), ("independent SCF QE guard audit", "output/graphene.scf-qeguard-audit.json"), ("independent SCF parent evidence", "output/scf-parent-evidence.json"), ("bands-parent SCF stdout", "output/graphene.bands.parent-scf.stdout"), ("bands-parent SCF stderr", "output/graphene.bands.parent-scf.stderr"), ("bands-parent SCF exit status", "output/graphene.bands.parent-scf.exit"), ("bands pw.x stdout", "output/graphene.bands.pw.stdout"), ("bands pw.x stderr", "output/graphene.bands.pw.stderr"), ("bands pw.x exit status", "output/graphene.bands.pw.exit"), ("bands.x stdout", "output/graphene.bands.x.stdout"), ("bands.x stderr", "output/graphene.bands.x.stderr"), ("bands.x exit status", "output/graphene.bands.x.exit"), ("bands.x data", "output/graphene.bands.dat"), ("bands execution environment", "output/bands-execution-environment.txt"), ("strict band summary", "derived/graphene-band-summary.json"), ("band-path table", "derived/graphene-band-path.csv"), ("band-path figure", "figures/graphene-band-path.png")):
        artifacts.append(artifact(role, relative))
    base.update({"started_at": None, "completed_at": None, "exit_code": 0, "commands": [{"stage": "independent-SCF", "command": "Historical RUN_STAGE=scf wrapper returned 1 after a successful QE stage because of a final false conditional; retained graphene.scf.exit and QE guard audit both record the QE result independently.", "exit_code": 1}, {"stage": "bands-parent-SCF-and-bands", "command": "RUN_STAGE=bands QE_LAUNCHER=<allocation launcher> PW_COMMAND=pw.x BANDS_COMMAND=bands.x bash run.sh", "exit_code": 0}, {"stage": "strict-parse", "command": "python3 parse.py --write-derived --write-manifest", "exit_code": 0}], "gates": {"G0": {"status": "PASS", "summary": "Inputs and all declared retained artifacts are SHA-256 bound."}, "G1": {"status": "PASS", "summary": "Independent SCF, actual bands-parent SCF, bands pw.x, and bands.x each retain separate stdout, stderr, explicit exit_code=0, and required completion markers."}, "G2": {"status": "PASS", "summary": "Both retained SCF stages explicitly report electronic convergence; no ionic optimization was requested."}, "G3": {"status": "PASS", "summary": "Independent SCF evidence, bands-parent SCF, bands pw.x, bands.x, parseable band data, summary, CSV, and PNG are present."}, "G4": {"status": "NOT TESTED", "summary": "One run does not test vacuum, cutoff, k mesh, smearing, path, or observable convergence."}, "G5": {"status": "NOT CLAIMED", "summary": "The single fixed teaching path does not establish a full-zone property, topology, stability, or material conclusion."}}})
    return base


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--static", action="store_true", help="validate prepared source/input/provenance contracts")
    parser.add_argument("--write-derived", action="store_true", help="write summary, CSV, and PNG from complete QE output")
    parser.add_argument("--write-manifest", action="store_true", help="write prepared or executed manifest after validation")
    args = parser.parse_args()
    static = static_audit()
    record = execution_record() if output_available() else None
    if args.write_derived:
        if record is None: raise SystemExit("FAIL cannot write derived data without a complete QE output set")
        write_derived(record)
    if args.write_manifest:
        if record is not None and not (DERIVED / "graphene-band-summary.json").is_file():
            raise SystemExit("FAIL write derived data before writing an executed manifest")
        (CASE / "manifest.json").write_text(json.dumps(manifest(record), indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({"status": "PASS", "state": "executed" if record else "prepared-not-run", "input_sha256": static["input_sha256"]}, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
