#!/usr/bin/env python3
"""Fail-closed parser for captured and independently rerun Aluminium QE data.

The one Gaussian representation and the separately rerun ``dos.x`` table are
kept distinct. Neither product is numerical-convergence evidence.
"""
from __future__ import annotations

import csv
import hashlib
import json
import math
import re
from datetime import datetime
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np


ROOT = Path(__file__).resolve().parent
EXPECTED = {
    "input/scf.in": "660983565543f2bc154fe3d79a7bf480b2e02b9ae705d706457c661a64087ac0",
    "input/nscf.in": "1fdef0bc99e977e96b5d7cec1b750fe009170253a2953f197212c01103ff259d",
    "input/bands.in": "62a0406cd30f6b85c358e2f8efb76aab1ee79f8d4fbc494329e9d5c906c53141",
    "input/dos.in": "879806b9ba78e52d0d5fe17d29312bd0a29d592faa527fee8a900f3ec4c50a8f",
    "output/scf.out": "3a48a4fade8c52fd1b5e4d816be439de79911b3c9d7ea3d71f16257b6c9e0b39",
    "output/nscf-full.out": "fe4e1ecb29004cfadecff46d6b81748b085682c0abfc987be0be4e28205fed66",
    "output/bands.out": "312a05a44bbb15ed5ee5c437ac52fd658a2e43e35b56a2b49cfb231d711b4a95",
    "output/dos-route/scf.out": "c3e3e16a1fc50fd1d93103b5cebb84da380e462579ad59154388d3a6fe73a741",
    "output/dos-route/nscf-full.out": "fd648c510ee3ff4e1e92be2d71fd5e53743ee0b6295f14d8acbbcd60ed94ded1",
    "output/dos-route/bands.out": "8affb038e5e4fbf4a2250933fd8a6689c2f4d26c26f87dd8cad84bec163670ba",
    "output/dos-route/dos.out": "c930a07ec54184fe102d308668a5895b629087fdd977ce36b9a602e705616f6e",
    "output/dos-route/al.dos": "95c3342cb9229b0ff2fbc8cb17d48aa13ebd6f3ddea7a5a1c4797de9e64be5f8",
}
EMPTY = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
FLOAT = re.compile(r"[-+]?\d+\.\d+")
K_LIST = re.compile(r"^\s*k\(\s*(\d+)\)\s*=\s*\(\s*([+-]?\d+\.\d+)\s+([+-]?\d+\.\d+)\s+([+-]?\d+\.\d+)\),\s*wk\s*=\s*([+-]?\d+\.\d+)", re.MULTILINE)
NSCF_BLOCK = re.compile(r"^\s*k\s*=\s*([+-]?\d+\.\d+)\s*([+-]?\d+\.\d+)\s*([+-]?\d+\.\d+)\s*\(\s*\d+\s+PWs\)\s+bands \(ev\):\s*\n\s*([^\n]+)\s*\n\s*occupation numbers\s*\n\s*([^\n]+)", re.MULTILINE)
PATH_BLOCK = re.compile(r"^\s*k\s*=\s*(.*?)\s*\(\s*\d+\s+PWs\)\s+bands \(ev\):\s*\n\s*([^\n]+)", re.MULTILINE)
DOS_HEADER = re.compile(r"^#\s+E \(eV\)\s+dos\(E\)\s+Int dos\(E\) EFermi =\s+([+-]?\d+\.\d+) eV$", re.MULTILINE)
DOS_ROW = re.compile(r"^\s*([+-]?\d+\.\d+)\s+([+-]?\d+\.\d+E[+-]\d+)\s+([+-]?\d+\.\d+E[+-]\d+)\s*$", re.MULTILINE)
GAUSSIAN_SIGMA_EV = 0.15
GRID_START_EV, GRID_STOP_EV, GRID_STEP_EV = -12.0, 16.0, 0.01


def need(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(f"FAIL {message}")


def sha(relative: str) -> str:
    return hashlib.sha256((ROOT / relative).read_bytes()).hexdigest()


def artifact(role: str, relative: str) -> dict[str, object]:
    path = ROOT / relative
    return {"role": role, "path": relative, "sha256": sha(relative), "bytes": path.stat().st_size}


def numbers(text: str) -> list[float]:
    return [float(value) for value in FLOAT.findall(text)]


def output_text(relative: str, program: str, markers: list[str]) -> str:
    text = (ROOT / relative).read_text(encoding="utf-8")
    need(program in text, f"{relative} missing expected program banner")
    need(text.count("JOB DONE.") == 1, f"{relative} must have exactly one JOB DONE marker")
    for marker in ["Error in routine", "convergence NOT achieved", "stopping ..."]:
        need(marker not in text, f"{relative} contains fatal/nonconvergence marker {marker}")
    for marker in markers:
        need(marker in text, f"{relative} missing {marker}")
    return text


def parse_cartesian_weights(text: str) -> dict[tuple[float, float, float], float]:
    point_header = text.index("     number of k points=")
    cartesian_header = text.index("                       cart. coord.", point_header)
    crystal_header = text.index("                       cryst. coord.", cartesian_header)
    rows = K_LIST.findall(text[cartesian_header:crystal_header])
    need(len(rows) == 512, f"Cartesian k list has {len(rows)} rows, not 512")
    need([int(row[0]) for row in rows] == list(range(1, 513)), "Cartesian k list indices are not 1..512")
    weights = {(float(x), float(y), float(z)): float(weight) for _, x, y, z, weight in rows}
    need(len(weights) == 512, "Cartesian k coordinates are not unique")
    need(abs(sum(weights.values()) - 2.0) <= 5.0e-5, "printed QE k-weight sum is not near expected spin-degenerate 2")
    return weights


def parse_nscf_mesh(text: str) -> list[dict[str, float | int]]:
    weights = parse_cartesian_weights(text)
    rows: list[dict[str, float | int]] = []
    for index, (x, y, z, energy_text, occupation_text) in enumerate(NSCF_BLOCK.findall(text)):
        coord, energies, occupations = (float(x), float(y), float(z)), numbers(energy_text), numbers(occupation_text)
        need(coord in weights and len(energies) == 4 and len(occupations) == 4, f"NSCF block {index} lacks matching weight/four bands/four occupations")
        rows.append({"index": index, "kx_cart_2pi_over_alat": coord[0], "ky_cart_2pi_over_alat": coord[1], "kz_cart_2pi_over_alat": coord[2], "k_weight_qe_printed": weights[coord], **{f"band_{band + 1}_ev": energy for band, energy in enumerate(energies)}, **{f"occupation_{band + 1}": occupation for band, occupation in enumerate(occupations)}})
    need(len(rows) == 512, f"NSCF parser produced {len(rows)} rows, not 512")
    return rows


def parse_path(text: str) -> list[dict[str, float | int]]:
    rows: list[dict[str, float | int]] = []
    for index, (coord_text, energy_text) in enumerate(PATH_BLOCK.findall(text)):
        coords, energies = numbers(coord_text), numbers(energy_text)
        need(len(coords) == 3 and len(energies) == 4, f"bands-path block {index} lacks three coordinates/four bands")
        rows.append({"index": index, "kx_cart_2pi_over_alat": coords[0], "ky_cart_2pi_over_alat": coords[1], "kz_cart_2pi_over_alat": coords[2], **{f"band_{band + 1}_ev": energy for band, energy in enumerate(energies)}})
    need(len(rows) == 145, f"bands parser produced {len(rows)} rows, not 145")
    return rows


def write_csv(relative: str, rows: list[dict[str, object]]) -> None:
    with (ROOT / relative).open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]), lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def derive_gaussian(mesh: list[dict[str, float | int]], fermi: float) -> tuple[list[dict[str, str]], dict[str, object]]:
    energy, weight = [], []
    for row in mesh:
        for band in range(1, 5):
            energy.append(float(row[f"band_{band}_ev"]) - fermi)
            weight.append(float(row["k_weight_qe_printed"]))
    energy_a, weight_a = np.asarray(energy), np.asarray(weight)
    grid = np.arange(GRID_START_EV, GRID_STOP_EV + 0.5 * GRID_STEP_EV, GRID_STEP_EV)
    prefactor = 1.0 / (GAUSSIAN_SIGMA_EV * math.sqrt(2.0 * math.pi))
    dos = np.sum(weight_a[:, None] * prefactor * np.exp(-0.5 * ((grid[None, :] - energy_a[:, None]) / GAUSSIAN_SIGMA_EV) ** 2), axis=0)
    expected = float(np.sum(weight_a))
    integral = float(np.sum((dos[:-1] + dos[1:]) * 0.5 * GRID_STEP_EV))
    need(np.isfinite(dos).all() and np.all(dos >= 0.0) and abs(integral - expected) <= 1.0e-5, "Gaussian representation fails finite/nonnegative/integral checks")
    # Explicit decimal formatting keeps the public CSV byte-stable across
    # supported NumPy builds.  Default float repr can differ in the final
    # insignificant digits even when the numerical array is equivalent.
    rows = [
        {
            "energy_relative_fermi_ev": f"{float(x):.8f}",
            "energy_absolute_ev": f"{float(x + fermi):.8f}",
            "dos_states_per_ev_per_cell": f"{float(y):.12e}",
        }
        for x, y in zip(grid, dos)
    ]
    meta = {"source_output": "output/dos-route/nscf-full.out", "source_output_sha256": sha("output/dos-route/nscf-full.out"), "source_k_point_count": 512, "source_band_count_per_k_point": 4, "source_printed_k_weight_sum": float(sum(float(row["k_weight_qe_printed"]) for row in mesh)), "source_printed_weighted_state_sum": expected, "energy_reference": "epsilon_nk minus Fermi energy printed by rerun nscf-full.out", "fermi_energy_ev": fermi, "formula": "D(E)=sum_{n,k} w_k*[sigma*sqrt(2*pi)]^-1*exp(-0.5*((E-(epsilon_nk-E_F))/sigma)^2)", "weight_convention": "QE-printed weights are used without renormalization; their 512-point sum is approximately 2 because the non-spin-polarized output carries spin-degenerate weighting.", "gaussian_sigma_ev": GAUSSIAN_SIGMA_EV, "energy_grid_start_relative_fermi_ev": GRID_START_EV, "energy_grid_stop_relative_fermi_ev": GRID_STOP_EV, "energy_grid_step_ev": GRID_STEP_EV, "energy_grid_points": len(rows), "trapezoidal_integral_states_per_cell": integral, "dos_at_fermi_states_per_ev_per_cell": float(dos[np.argmin(np.abs(grid))]), "claim_boundary": "A Gaussian-broadened representation of one printed 8x8x8 NSCF eigenvalue sample only; it is distinct from the separate dos.x table and establishes no numerical convergence."}
    return rows, meta


def parse_dos_x() -> tuple[list[dict[str, float]], dict[str, object]]:
    text = (ROOT / "output/dos-route/al.dos").read_text(encoding="utf-8")
    header = DOS_HEADER.search(text)
    rows = DOS_ROW.findall(text)
    need(header is not None and len(rows) == 2801, "al.dos lacks its expected header/2801 data rows")
    fermi = float(header.group(1))
    values = np.asarray([[float(value) for value in row] for row in rows], dtype=float)
    need(np.all(np.isfinite(values)) and np.all(np.diff(values[:, 0]) > 0.0) and np.all(np.diff(values[:, 2]) >= -1.0e-12) and np.all(values[:, 1] >= 0.0), "al.dos has invalid grid/DOS/integral data")
    need(abs(values[0, 0] + 12.0) <= 1.0e-12 and abs(values[-1, 0] - 16.0) <= 1.0e-12 and np.allclose(np.diff(values[:, 0]), 0.01, atol=1.0e-12), "al.dos grid differs from dos.in")
    parsed = [{"energy_absolute_ev": float(row[0]), "energy_relative_fermi_ev": float(row[0] - fermi), "dos_states_per_ev_per_cell": float(row[1]), "integrated_states_per_cell": float(row[2])} for row in values]
    metadata = {"source_output": "output/dos-route/al.dos", "source_output_sha256": sha("output/dos-route/al.dos"), "source_dos_stdout": "output/dos-route/dos.out", "source_dos_stdout_sha256": sha("output/dos-route/dos.out"), "input": "input/dos.in", "input_sha256": sha("input/dos.in"), "qe_version": "7.5", "fermi_energy_ev_as_printed_by_dos_x": fermi, "energy_grid_absolute_ev": [-12.0, 16.0], "energy_grid_step_ev": 0.01, "energy_grid_points": len(parsed), "dos_at_nearest_fermi_grid_point_states_per_ev_per_cell": float(values[np.argmin(abs(values[:, 0] - fermi)), 1]), "integrated_states_at_grid_end_per_cell": float(values[-1, 2]), "claim_boundary": "This is a real dos.x output from the hash-bound rerun. Its -12 to 16 eV absolute window does not include all four printed NSCF bands, so the final integral is not a total-state count; neither the output nor its plot establishes DOS convergence."}
    return parsed, metadata


def timestamp(text: str, pattern: str, layout: str) -> str:
    match = re.search(pattern, text)
    need(match is not None, "missing QE timestamp")
    normalized = re.sub(r":\s+(\d)", r":0\1", " ".join(match.groups()))
    return datetime.strptime(normalized, layout).isoformat(timespec="seconds") + "+08:00"


def main() -> None:
    for relative, expected in EXPECTED.items():
        need(sha(relative) == expected, f"SHA-256 mismatch for {relative}")
    pseudo = json.loads((ROOT / "source/pseudopotential-metadata.json").read_text(encoding="utf-8"))
    need(pseudo.get("schema_version") == "1.0" and isinstance(pseudo.get("pseudopotentials"), list) and len(pseudo["pseudopotentials"]) == 1, "pseudopotential metadata lacks schema_version 1.0/single entry")
    pseudo_entry = pseudo["pseudopotentials"][0]
    need(pseudo_entry.get("filename") == "Al.pbe-n-rrkjus_psl.1.0.0.UPF" and pseudo_entry.get("sha256") == "cc4f5dc6afe09c8f482dc7645e6e7cca546a55f8d907c71c825c62bf85a38d3e", "pseudopotential metadata identity mismatch")
    need(
        pseudo_entry.get("source_url") == "https://pseudopotentials.quantum-espresso.org/upf_files/Al.pbe-n-rrkjus_psl.1.0.0.UPF"
        and pseudo_entry.get("source_url_status")
        and pseudo_entry.get("source_bytes") == 1500731
        and pseudo_entry.get("source_verified_at") == "2026-08-09"
        and pseudo_entry.get("header_generator") == "atomic v6.3",
        "pseudopotential exact source metadata mismatch",
    )
    plan = json.loads((ROOT / "qe_plan.json").read_text(encoding="utf-8"))
    need(plan.get("case_id") == "aluminium-metallic-electronic-structure" and plan.get("tolerance") is None, "qe_plan case identity or fail-closed tolerance mismatch")
    provenance = json.loads((ROOT / "source/execution-provenance.json").read_text(encoding="utf-8"))
    need(provenance.get("case_id") == "aluminium-metallic-electronic-structure", "execution provenance case identity mismatch")
    for relative in ("output/scf.err", "output/nscf-full.err", "output/bands.err", "output/dos-route/scf.err", "output/dos-route/nscf-full.err", "output/dos-route/bands.err", "output/dos-route/dos.err"):
        need(sha(relative) == EMPTY, f"{relative} is not empty")
    captured_scf = output_text("output/scf.out", "Program PWSCF v.7.5", ["convergence has been achieved in   5 iterations"])
    captured_nscf = output_text("output/nscf-full.out", "Program PWSCF v.7.5", ["End of band structure calculation"])
    captured_bands = output_text("output/bands.out", "Program PWSCF v.7.5", ["End of band structure calculation"])
    rerun_scf = output_text("output/dos-route/scf.out", "Program PWSCF v.7.5", ["convergence has been achieved in   5 iterations"])
    rerun_nscf = output_text("output/dos-route/nscf-full.out", "Program PWSCF v.7.5", ["End of band structure calculation"])
    rerun_bands = output_text("output/dos-route/bands.out", "Program PWSCF v.7.5", ["End of band structure calculation"])
    rerun_dos = output_text("output/dos-route/dos.out", "Program DOS v.7.5", ["Gaussian broadening (read from input): ngauss,degauss=   0    0.011025"])
    for relative in ("input/scf.in", "input/nscf.in", "input/bands.in"):
        content = (ROOT / relative).read_text(encoding="utf-8")
        need("occupations = 'smearing'" in content and "smearing = 'mv'" in content and "degauss = 0.02" in content, f"{relative} lacks captured metallic policy")
    need("K_POINTS automatic\n  8 8 8 0 0 0" in (ROOT / "input/scf.in").read_text(), "SCF 8x8x8 mesh missing")
    need("nosym = .true." in (ROOT / "input/nscf.in").read_text(), "full-zone NSCF policy missing")
    need("K_POINTS crystal_b" in (ROOT / "input/bands.in").read_text(), "explicit bands path missing")
    dos_input = (ROOT / "input/dos.in").read_text(encoding="utf-8")
    need("fildos = 'al.dos'" in dos_input and "ngauss = 0" in dos_input and "degauss = 0.0110248" in dos_input, "dos.x input lacks the declared Gaussian route")
    fermi = float(re.search(r"the Fermi energy is\s+([0-9.]+) ev", rerun_nscf).group(1))
    mesh, path = parse_nscf_mesh(rerun_nscf), parse_path(rerun_bands)
    crossings = sum((float(left["band_2_ev"]) - fermi) * (float(right["band_2_ev"]) - fermi) < 0 for left, right in zip(path, path[1:]))
    near = sum(abs(float(row["band_2_ev"]) - fermi) <= 0.25 for row in mesh)
    need(crossings == 3 and near == 48, "rerun crossing/near-Fermi ledger mismatch")
    (ROOT / "derived").mkdir(exist_ok=True)
    (ROOT / "figures").mkdir(exist_ok=True)
    write_csv("derived/al-mesh.csv", [{**row, "fermi_ev": fermi} for row in mesh])
    write_csv("derived/al-path.csv", [{**row, "fermi_ev": fermi} for row in path])
    gaussian_rows, gaussian_meta = derive_gaussian(mesh, fermi)
    write_csv("derived/al-dos-gaussian.csv", gaussian_rows)
    (ROOT / "derived/al-dos-gaussian-metadata.json").write_text(json.dumps(gaussian_meta, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    dos_rows, dos_meta = parse_dos_x()
    write_csv("derived/al-dos-x.csv", dos_rows)
    (ROOT / "derived/al-dos-x-metadata.json").write_text(json.dumps(dos_meta, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    started = timestamp(rerun_scf, r"starts on\s+(\d+\w+\d+)\s+at\s+(\d{1,2}:\d{2}:\s*\d{1,2})", "%d%b%Y %H:%M:%S")
    completed = timestamp(rerun_bands, r"This run was terminated on:\s+(\d{1,2}:\d{2}:\s*\d{1,2})\s+(\d+\w+\d+)", "%H:%M:%S %d%b%Y")
    convergence = json.loads((ROOT / "derived/aluminium-convergence-assessment.json").read_text(encoding="utf-8"))
    eos = json.loads((ROOT / "derived/aluminium-eos-fit.json").read_text(encoding="utf-8"))
    need(convergence.get("exploratory_screen_status") == "FAIL", "convergence screen status must retain the observed FAIL")
    need(eos.get("quadratic_fit", {}).get("mathematical_status") == "PASS", "bounded E(V) fit lacks its observed mathematical PASS")
    for route, ids in (("convergence-screen", ["al-k08-d002", "al-k10-d002", "al-k12-d002", "al-k12-d001", "al-k12-d004"]), ("eos-screen", ["al-eos-a7450", "al-eos-a7550", "al-eos-a7653", "al-eos-a7750", "al-eos-a7850"])):
        for identifier in ids:
            for suffix in ("in", "out", "err"):
                need((ROOT / "output" / route / f"{identifier}.{suffix}").is_file(), f"missing committed {route} artifact {identifier}.{suffix}")
    summary = {"qe_version": "7.5", "started_at": started, "completed_at": completed, "captured_stages": ["scf", "nscf-full-zone", "bands"], "rerun_stages": ["scf", "nscf-full-zone", "dos.x", "bands"], "public_host": "Talos", "scf_iterations": 5, "fermi_energy_ev": fermi, "mesh_points": len(mesh), "path_points": len(path), "selected_band_crossing_intervals": crossings, "near_fermi_mesh_points_abs_delta_leq_0_25_ev": near, "rerun_nscf_c_bands_unconverged_markers": rerun_nscf.count("c_bands:  1 eigenvalues not converged"), "rerun_bands_c_bands_unconverged_markers": rerun_bands.count("c_bands:  1 eigenvalues not converged"), "gaussian_dos_like": gaussian_meta, "dos_x": dos_meta, "exploratory_convergence_screen": convergence, "bounded_eos_screen": eos, "evidence_boundary": "The separate rerun establishes real dos.x execution and a real al.dos file. The committed k/smearing screen remains FAIL and the E(V) quadratic result remains a bounded mathematical fit; observable convergence and material acceptance are not established."}
    summary.pop("started_at")
    summary.pop("completed_at")
    summary["timing_boundary"] = "No case-wide start/completion window is claimed; the named timestamps in execution_routes are route-scoped."
    summary["execution_routes"] = provenance["execution_routes"]
    summary["initial_captured_stages"] = summary.pop("captured_stages")
    summary["isolated_dos_route_stages"] = summary.pop("rerun_stages")
    summary["evidence_boundary"] = "The initial captured output set, isolated DOS rerun, and later screens are separate evidence routes. The DOS route establishes real dos.x execution and al.dos; observable convergence is not established and no scientific conclusion is claimed."
    (ROOT / "derived/captured-run-summary.json").write_text(json.dumps(summary, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    metrics = convergence["metrics"]
    fit = eos["quadratic_fit"]
    excerpt = "\n".join([
        "SCF/NSCF/bands: Quantum ESPRESSO 7.5; 8x8x8 full-zone NSCF; Fermi energy 7.8018 eV; each recorded program reached JOB DONE.",
        f"Native DOS: dos.x 7.5 reached JOB DONE; al.dos has {dos_meta['energy_grid_points']} rows and prints E_F={dos_meta['fermi_energy_ev_as_printed_by_dos_x']:.3f} eV.",
        f"Native DOS lineage: dos.out SHA-256 {sha('output/dos-route/dos.out')}; al.dos SHA-256 {sha('output/dos-route/al.dos')}.",
        f"Exploratory k/smearing screen: {convergence['exploratory_screen_status']}; k10-to-k12 delta E={metrics['k_mesh_tail_total_energy_delta_ry_per_cell']:.8f} Ry/cell and delta E_F={metrics['k_mesh_tail_fermi_delta_ev']:.4f} eV.",
        f"Five-point E(V) entry: mathematical fit {fit['mathematical_status']}; c2={fit['c2_ry_per_bohr6']:.12g} Ry/bohr^6; residual RMS={fit['residual_rms_ry']:.12g} Ry.",
        "The k/smearing screen FAIL is retained; the E(V) fit is not a converged EOS, bulk modulus, or elastic tensor. Observable convergence is not established; no scientific conclusion is claimed.",
    ]) + "\n"
    (ROOT / "output/compact-source-excerpt.txt").write_text(excerpt, encoding="utf-8")
    for relative, rows, label in (("figures/al-dos-gaussian.png", gaussian_rows, "Printed NSCF eigenvalues; Gaussian sigma = 0.15 eV"), ("figures/al-dos-x.png", dos_rows, "Real QE dos.x output")):
        figure, axis = plt.subplots(figsize=(6.5, 3.9))
        axis.plot([float(row["energy_relative_fermi_ev"]) for row in rows], [float(row["dos_states_per_ev_per_cell"]) for row in rows], color="#7f1d1d", linewidth=1.35, label=label)
        axis.axvline(0.0, color="#1f2937", linewidth=0.9, linestyle="--", label="Printed Fermi reference")
        axis.set_xlim(float(rows[0]["energy_relative_fermi_ev"]), float(rows[-1]["energy_relative_fermi_ev"]))
        axis.margins(x=0)
        axis.set(xlabel="Energy relative to printed Fermi level (eV)", ylabel="DOS states / (eV cell)", title="Al: one 8x8x8 NSCF sample; not convergence tested")
        axis.legend(frameon=False, fontsize=8)
        figure.tight_layout()
        figure.savefig(ROOT / relative, dpi=180)
        plt.close(figure)
    histogram, axis = plt.subplots(figsize=(6.2, 3.8))
    axis.hist([float(row["band_2_ev"]) - fermi for row in mesh], bins=42, color="#2b6cb0")
    axis.axvline(0.0, color="#b91c1c", label="Fermi reference")
    axis.set(xlabel="Band 2 minus Fermi level (eV)", ylabel="Raw-NSCF sampled k points", title="Al 8x8x8 rerun NSCF: raw-output-derived sampling")
    axis.legend(frameon=False)
    histogram.tight_layout()
    histogram.savefig(ROOT / "figures/raw-nscf-band2-sampling.png", dpi=160)
    plt.close(histogram)
    artifacts = [artifact("SCF input", "input/scf.in"), artifact("NSCF input", "input/nscf.in"), artifact("bands input", "input/bands.in"), artifact("real dos.x input", "input/dos.in"), artifact("exploratory convergence plan", "input/convergence-matrix-plan.json"), artifact("convergence input generator", "input/generate_convergence_inputs.py"), artifact("convergence assessor", "input/parse_convergence.py"), artifact("direct external convergence runner", "input/run-convergence-matrix.sh"), artifact("bounded E(V) plan", "input/eos-plan.json"), artifact("E(V) input generator", "input/generate_eos_inputs.py"), artifact("E(V) assessor", "input/parse_eos.py"), artifact("direct external E(V) runner", "input/run-eos.sh"), artifact("initial captured SCF stdout", "output/scf.out"), artifact("initial captured NSCF stdout", "output/nscf-full.out"), artifact("initial captured bands stdout", "output/bands.out"), artifact("deterministic source-bound excerpt rendered by the Worked Workflow", "output/compact-source-excerpt.txt"), artifact("rerun SCF stdout", "output/dos-route/scf.out"), artifact("rerun SCF stderr", "output/dos-route/scf.err"), artifact("rerun NSCF stdout", "output/dos-route/nscf-full.out"), artifact("rerun NSCF stderr", "output/dos-route/nscf-full.err"), artifact("rerun dos.x stdout", "output/dos-route/dos.out"), artifact("rerun dos.x stderr", "output/dos-route/dos.err"), artifact("real QE dos.x table", "output/dos-route/al.dos"), artifact("rerun bands stdout", "output/dos-route/bands.out"), artifact("rerun bands stderr", "output/dos-route/bands.err"), artifact("raw-derived mesh table", "derived/al-mesh.csv"), artifact("raw-derived path table", "derived/al-path.csv"), artifact("Gaussian raw-NSCF representation", "derived/al-dos-gaussian.csv"), artifact("Gaussian representation metadata", "derived/al-dos-gaussian-metadata.json"), artifact("real dos.x parsed table", "derived/al-dos-x.csv"), artifact("real dos.x metadata", "derived/al-dos-x-metadata.json"), artifact("case summary", "derived/captured-run-summary.json"), artifact("raw NSCF sampling histogram", "figures/raw-nscf-band2-sampling.png"), artifact("Gaussian DOS-like plot", "figures/al-dos-gaussian.png"), artifact("real dos.x plot", "figures/al-dos-x.png")]
    for route, ids in (("convergence-screen", ["al-k08-d002", "al-k10-d002", "al-k12-d002", "al-k12-d001", "al-k12-d004"]), ("eos-screen", ["al-eos-a7450", "al-eos-a7550", "al-eos-a7653", "al-eos-a7750", "al-eos-a7850"])):
        for identifier in ids:
            artifacts.extend([artifact(f"real {route} input {identifier}", f"output/{route}/{identifier}.in"), artifact(f"real {route} stdout {identifier}", f"output/{route}/{identifier}.out"), artifact(f"real {route} stderr {identifier}", f"output/{route}/{identifier}.err")])
    artifacts.extend([artifact("real convergence screen CSV", "derived/aluminium-convergence-matrix.csv"), artifact("real convergence screen assessment", "derived/aluminium-convergence-assessment.json"), artifact("real bounded E(V) CSV", "derived/aluminium-eos-samples.csv"), artifact("real bounded E(V) fit metadata", "derived/aluminium-eos-fit.json"), artifact("real bounded E(V) fit plot", "figures/aluminium-eos-fit.png")])
    figure_metadata = {
        "figures/raw-nscf-band2-sampling.png": ("Histogram of QE band 2 minus the printed Fermi energy for 512 full-zone Aluminium k points; one 8 by 8 by 8 sample, not convergence evidence.", "Raw-output-derived full-zone sampling histogram from the real Aluminium NSCF rerun."),
        "figures/al-dos-gaussian.png": ("Gaussian representation of the recorded Aluminium NSCF eigenvalues relative to the printed Fermi level; distinct from native dos.x and not convergence tested.", "Gaussian representation reconstructed from QE-printed eigenvalues and k weights."),
        "figures/al-dos-x.png": ("Total density of states parsed from the real QE dos.x Aluminium output and referenced to its printed Fermi energy; no DOS-convergence claim is made.", "Native QE dos.x table plotted from the hash-bound al.dos output."),
        "figures/aluminium-eos-fit.png": ("Five real Aluminium SCF energy points versus primitive-cell volume with a bounded quadratic interpolation; not a converged EOS, bulk modulus, or elastic tensor.", "Bounded five-point E(V) teaching fit after the volume-declaration parser correction."),
    }
    for record in artifacts:
        if record["path"] in figure_metadata:
            record["alt"], record["caption"] = figure_metadata[record["path"]]
    artifacts.append(artifact("route command and provenance boundary", "output/recorded-commands.txt"))
    manifest = {"schema_version": "1.0", "case_id": "aluminium-metallic-electronic-structure", "title": "Aluminium metallic electronic structure captured QE workflow", "case_kind": "worked-workflow", "evidence_class": "real-execution", "public_host_label": "Talos", "started_at": started, "completed_at": completed, "exit_code": 0, "software": [{"name": "Quantum ESPRESSO PWSCF and DOS", "version": "7.5", "interface": "single-process CLI"}, {"name": "case-local raw-output parser", "version": "2.3", "interface": "Python CLI"}], "sources": [{"id": "rerun-qe-dos-route", "role": "hash-bound isolated real execution output", "path": "output/dos-route/dos.out", "sha256": sha("output/dos-route/dos.out"), "licence_boundary": "No private runtime path, pseudopotential body, restart tree, or wavefunction payload is published."}], "commands": [{"stage": "scf", "command": "pw.x -in scf.in > scf.out 2> scf.err", "exit_code": 0}, {"stage": "full-zone-nscf", "command": "pw.x -in nscf.in > nscf-full.out 2> nscf-full.err", "exit_code": 0}, {"stage": "dos", "command": "dos.x -in dos.in > dos.out 2> dos.err", "exit_code": 0}, {"stage": "bands", "command": "pw.x -in bands.in > bands.out 2> bands.err", "exit_code": 0}, {"stage": "exploratory-convergence-failed-screen-retained", "command": "bash input/run-convergence-matrix.sh", "exit_code": 0}, {"stage": "bounded-eos-five-scf-program-exits", "command": "pw.x -in al-eos-*.in > al-eos-*.out 2> al-eos-*.err", "exit_code": 0}, {"stage": "bounded-eos-initial-parser-blocked-volume-mismatch", "command": "python3 input/parse_eos.py", "exit_code": 1}, {"stage": "bounded-eos-corrected-parser-mathematical-fit-only", "command": "python3 input/parse_eos.py", "exit_code": 0}, {"stage": "raw-output-parse", "command": "python3 parse.py", "exit_code": 0}], "artifacts": artifacts, "gates": {"G0": {"status": "PASS", "summary": "Declared inputs, captured outputs, rerun outputs, screen artifacts, and derived files pass strict hashes and parsing."}, "G1": {"status": "PASS", "summary": "The isolated Talos reruns have terminal markers and empty captured stderr; the exploratory screen FAIL is a numerical screen result, not a program-exit failure."}, "G2": {"status": "PASS", "summary": "The rerun SCF reports electronic convergence in five iterations. NSCF/bands c_bands warning counts are retained and are not upgraded to a general eigenvalue-convergence claim."}, "G3": {"status": "PASS", "summary": "Real al.dos, real screen outputs, hash-bound stdout/stderr, parser tables, and figures are present."}, "G4": {"status": "NOT TESTED", "summary": "One 8x8x8 dos.x sample plus exploratory k/smearing and E(V) screens do not establish observable-specific convergence; the convergence screen is explicitly FAIL."}, "G5": {"status": "NOT CLAIMED", "summary": "No physical or material-level scientific conclusion is claimed."}}, "claim_boundary": {"supports": ["A real isolated QE 7.5 SCF, full-zone NSCF, dos.x, bands, exploratory k/smearing screen, and bounded E(V) execution record with raw-output-derived tables/figures."], "does_not_support": ["A converged DOS, Fermi surface, EOS, elastic property, carrier density, transport result, universal parameter prescription, or material-level conclusion."]}}
    manifest.update({
        "title": "Aluminium QE 7.5 assembled metallic electronic-structure evidence",
        "started_at": None,
        "completed_at": None,
        "exit_code": None,
        "completion_boundary": provenance["completion_boundary"],
        "execution_routes": provenance["execution_routes"],
        "commands": provenance["commands"],
        "claim_boundary": provenance["claim_boundary"],
        "sources": [
            {
                "id": "al-pseudopotential-identity",
                "role": "exact public QE UPF source identity; potential body not stored",
                "path": "source/pseudopotential-metadata.json",
                "sha256": sha("source/pseudopotential-metadata.json"),
                "url": pseudo_entry["source_url"],
                "exact_url_status": pseudo_entry["source_url_status"],
                "verified_bytes": pseudo_entry["source_bytes"],
                "verified_at": pseudo_entry["source_verified_at"],
                "header_generator": pseudo_entry["header_generator"],
                "licence_boundary": "No UPF body is published; replay supplies the exact-hash file outside the repository.",
            },
            {
                "id": "al-qe-plan",
                "role": "fail-closed assembled-route plan",
                "path": "qe_plan.json",
                "sha256": sha("qe_plan.json"),
            },
            {
                "id": "al-execution-provenance",
                "role": "route timing, command, exit-status, ancestry, and claim boundary",
                "path": "source/execution-provenance.json",
                "sha256": sha("source/execution-provenance.json"),
            },
            {
                "id": "initial-command-boundary",
                "role": "historical command/exit/continuity boundary and replay-equivalent commands",
                "path": "output/recorded-commands.txt",
                "sha256": sha("output/recorded-commands.txt"),
            },
            {
                "id": "rerun-qe-dos-route",
                "role": "hash-bound isolated real execution output",
                "path": "output/dos-route/dos.out",
                "sha256": sha("output/dos-route/dos.out"),
                "licence_boundary": "No private runtime path, pseudopotential body, restart tree, or wavefunction payload is published.",
            },
        ],
    })
    manifest["gates"]["G0"]["summary"] = "Declared inputs, route-scoped outputs, screen artifacts, and derived files retain strict hashes and parsing relationships; this edit records no fresh replay."
    manifest["gates"]["G1"]["summary"] = "The isolated Talos rerun outputs have terminal markers and empty captured stderr; initial historical shell exits remain unrecorded."
    manifest["gates"]["G2"]["summary"] = "The isolated rerun SCF reports electronic convergence in five iterations. NSCF/bands c_bands warnings remain retained."
    manifest["gates"]["G3"]["summary"] = "Real al.dos, real screen outputs, hash-bound stdout/stderr, parser tables, figures, and route ancestry records are present."
    (ROOT / "manifest.json").write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print("PASS captured/rerun QE Al outputs parsed; real dos.x lineage present; G4/G5 remain explicitly unclaimed")


if __name__ == "__main__":
    main()
