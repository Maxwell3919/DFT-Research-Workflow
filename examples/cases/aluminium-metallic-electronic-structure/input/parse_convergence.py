#!/usr/bin/env python3
"""Fail-closed assessor for the prepared, external Aluminium SCF matrix."""
from __future__ import annotations

import argparse
import csv
import json
import re
from pathlib import Path

import numpy as np


ROOT = Path(__file__).resolve().parent
PLAN = json.loads((ROOT / "convergence-matrix-plan.json").read_text(encoding="utf-8"))
ENERGY = re.compile(r"!\s+total energy\s+=\s+([+-]?\d+\.\d+)\s+Ry")
FERMI = re.compile(r"the Fermi energy is\s+([+-]?\d+\.\d+)\s+ev")


def need(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(f"FAIL {message}")


def read_output(path: Path) -> tuple[float, float]:
    text = path.read_text(encoding="utf-8")
    need(text.count("JOB DONE.") == 1, f"{path.name} must contain exactly one JOB DONE marker")
    need("Error in routine" not in text and "convergence NOT achieved" not in text, f"{path.name} contains a fatal/nonconvergence marker")
    energies = ENERGY.findall(text)
    fermis = FERMI.findall(text)
    need(len(energies) == 1, f"{path.name} must contain exactly one total energy")
    need(len(fermis) == 1, f"{path.name} must contain exactly one Fermi energy")
    return float(energies[0]), float(fermis[0])


def validate_input(path: Path, sample: dict[str, object]) -> None:
    text = path.read_text(encoding="utf-8")
    need("ibrav = 0" in text and "celldm" not in text and "mixing_beta" not in text, f"{path.name} is not the guard-compatible explicit-cell input")
    need("CELL_PARAMETERS bohr" in text and "Al.pbe-n-rrkjus_psl.1.0.0.UPF" in text and "ecutwfc = 30.0" in text and "ecutrho = 240.0" in text, f"{path.name} lacks fixed structure/pseudopotential/cutoffs")
    lines = text.splitlines()
    start = lines.index("CELL_PARAMETERS bohr")
    matrix = np.asarray([[float(value) for value in lines[start + offset].split()] for offset in range(1, 4)], dtype=float)
    a = float(PLAN["fixed_protocol"]["cubic_lattice_parameter_bohr"])
    need(abs(abs(float(np.linalg.det(matrix))) - a ** 3 / 4.0) <= 1.0e-6, f"{path.name} cell determinant does not match declared fcc primitive volume")
    kx, ky, kz = sample["k_mesh"]
    need(f"  {kx} {ky} {kz} 0 0 0" in text and f"degauss = {float(sample['degauss_ry']):.2f}" in text, f"{path.name} lacks declared k mesh/degauss")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-dir", type=Path, required=True, help="External directory containing generated .in and captured <id>.out files.")
    parser.add_argument("--out-dir", type=Path, required=True, help="New or empty output directory for CSV/JSON assessment artifacts.")
    args = parser.parse_args()
    need(args.run_dir.is_dir(), f"run directory is not a directory: {args.run_dir}")
    need(not args.out_dir.exists() or not any(args.out_dir.iterdir()), f"assessment output directory is not empty: {args.out_dir}")
    args.out_dir.mkdir(parents=True, exist_ok=True)
    rows = []
    for sample in PLAN["samples"]:
        input_path = args.run_dir / f"{sample['id']}.in"
        output_path = args.run_dir / f"{sample['id']}.out"
        need(input_path.is_file() and output_path.is_file(), f"missing expected external input/output for {sample['id']}")
        validate_input(input_path, sample)
        energy, fermi = read_output(output_path)
        rows.append({**sample, "total_energy_ry_per_cell": energy, "fermi_energy_ev": fermi})
    by_id = {row["id"]: row for row in rows}
    tail = PLAN["predeclared_assessment"]["k_mesh_tail"]
    probe = PLAN["predeclared_assessment"]["smearing_probe"]
    k10, k12 = by_id["al-k10-d002"], by_id["al-k12-d002"]
    energy_tail = abs(k12["total_energy_ry_per_cell"] - k10["total_energy_ry_per_cell"])
    fermi_tail = abs(k12["fermi_energy_ev"] - k10["fermi_energy_ev"])
    probes = [by_id["al-k12-d001"], by_id["al-k12-d004"]]
    probe_energy = max(abs(row["total_energy_ry_per_cell"] - k12["total_energy_ry_per_cell"]) for row in probes)
    probe_fermi = max(abs(row["fermi_energy_ev"] - k12["fermi_energy_ev"]) for row in probes)
    assessment = {
        "case_id": PLAN["case_id"],
        "rows": rows,
        "predeclared_assessment": PLAN["predeclared_assessment"],
        "metrics": {
            "k_mesh_tail_total_energy_delta_ry_per_cell": energy_tail,
            "k_mesh_tail_fermi_delta_ev": fermi_tail,
            "smearing_probe_max_total_energy_delta_ry_per_cell": probe_energy,
            "smearing_probe_max_fermi_delta_ev": probe_fermi,
        },
        "exploratory_screen_status": "PASS" if energy_tail <= tail["max_abs_total_energy_delta_ry_per_cell"] and fermi_tail <= tail["max_abs_fermi_delta_ev"] and probe_energy <= probe["max_abs_total_energy_delta_ry_per_cell"] and probe_fermi <= probe["max_abs_fermi_delta_ev"] else "FAIL",
        "claim_boundary": "Only the named SCF energy/Fermi samples are assessed as an exploratory screen. This cannot establish G4, DOS, EOS, elastic, Fermi-surface, transport, or material-level convergence."
    }
    fields = ["id", "k_mesh", "degauss_ry", "total_energy_ry_per_cell", "fermi_energy_ev"]
    with (args.out_dir / "aluminium-convergence-matrix.csv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, lineterminator="\n")
        writer.writeheader()
        for row in rows:
            writer.writerow({**row, "k_mesh": "x".join(str(value) for value in row["k_mesh"])})
    (args.out_dir / "aluminium-convergence-assessment.json").write_text(json.dumps(assessment, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(f"{assessment['exploratory_screen_status']} exploratory SCF energy/Fermi screen; G4 remains NOT TESTED")


if __name__ == "__main__":
    main()
