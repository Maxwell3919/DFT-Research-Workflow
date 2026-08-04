#!/usr/bin/env python3
"""Fail-closed E(V) extractor for the prepared external Aluminium SCF inputs."""
from __future__ import annotations

import argparse
import csv
import json
import re
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np


ROOT = Path(__file__).resolve().parent
PLAN = json.loads((ROOT / "eos-plan.json").read_text(encoding="utf-8"))
ENERGY = re.compile(r"!\s+total energy\s+=\s+([+-]?\d+\.\d+)\s+Ry")


def need(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(f"FAIL {message}")


def read_energy(path: Path) -> float:
    text = path.read_text(encoding="utf-8")
    need(text.count("JOB DONE.") == 1, f"{path.name} must contain exactly one JOB DONE marker")
    need("Error in routine" not in text and "convergence NOT achieved" not in text, f"{path.name} contains a fatal/nonconvergence marker")
    values = ENERGY.findall(text)
    need(len(values) == 1, f"{path.name} must contain exactly one total energy")
    return float(values[0])


def validate_input(path: Path, sample: dict[str, object]) -> None:
    text = path.read_text(encoding="utf-8")
    need("ibrav = 0" in text and "celldm" not in text and "mixing_beta" not in text, f"{path.name} is not the guard-compatible explicit-cell input")
    need("CELL_PARAMETERS bohr" in text and "Al.pbe-n-rrkjus_psl.1.0.0.UPF" in text and "ecutwfc = 30.0" in text and "ecutrho = 240.0" in text and "  12 12 12 0 0 0" in text, f"{path.name} lacks fixed structure/pseudopotential/cutoffs/k mesh")
    lines = text.splitlines()
    start = lines.index("CELL_PARAMETERS bohr")
    matrix = np.asarray([[float(value) for value in lines[start + offset].split()] for offset in range(1, 4)], dtype=float)
    volume = abs(float(np.linalg.det(matrix)))
    need(abs(volume - float(sample["volume_bohr3"])) <= 1.0e-6, f"{path.name} explicit-cell determinant does not match declared volume")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-dir", type=Path, required=True, help="External directory containing generated .in and captured <id>.out files.")
    parser.add_argument("--out-dir", type=Path, required=True, help="New or empty output directory for CSV/JSON/PNG artifacts.")
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
        volume = sample["cubic_lattice_parameter_bohr"] ** 3 / 4.0
        need(abs(volume - sample["volume_bohr3"]) <= 1.0e-9, f"declared volume mismatch for {sample['id']}")
        rows.append({**sample, "total_energy_ry_per_cell": read_energy(output_path)})
    volumes = np.asarray([row["volume_bohr3"] for row in rows], dtype=float)
    energies = np.asarray([row["total_energy_ry_per_cell"] for row in rows], dtype=float)
    need(np.all(np.diff(volumes) > 0.0), "E(V) volume points are not strictly increasing")
    center = float(np.mean(volumes))
    c2, c1, c0 = np.polyfit(volumes - center, energies, 2)
    fitted = c2 * (volumes - center) ** 2 + c1 * (volumes - center) + c0
    residual_rms = float(np.sqrt(np.mean((energies - fitted) ** 2)))
    mathematical_status = "PASS" if c2 > 0.0 and np.isfinite(residual_rms) else "WARN"
    summary = {
        "case_id": PLAN["case_id"],
        "rows": rows,
        "analysis_contract": PLAN["analysis_contract"],
        "quadratic_fit": {
            "volume_center_bohr3": center,
            "c2_ry_per_bohr6": float(c2),
            "c1_ry_per_bohr3": float(c1),
            "c0_ry": float(c0),
            "curvature_d2e_dv2_ry_per_bohr6": float(2.0 * c2),
            "residual_rms_ry": residual_rms,
            "mathematical_status": mathematical_status,
        },
        "claim_boundary": PLAN["analysis_contract"]["boundary"],
    }
    fields = ["id", "cubic_lattice_parameter_bohr", "volume_bohr3", "total_energy_ry_per_cell"]
    with (args.out_dir / "aluminium-eos-samples.csv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
    (args.out_dir / "aluminium-eos-fit.json").write_text(json.dumps(summary, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    dense = np.linspace(float(volumes.min()), float(volumes.max()), 300)
    figure, axis = plt.subplots(figsize=(6.2, 3.8))
    axis.scatter(volumes, energies - energies.min(), color="#7f1d1d", zorder=3, label="Captured SCF samples")
    axis.plot(dense, c2 * (dense - center) ** 2 + c1 * (dense - center) + c0 - energies.min(), color="#374151", linewidth=1.2, label="Quadratic interpolation")
    axis.set(xlabel="Primitive-cell volume (bohr³)", ylabel="E − min(E) (Ry/cell)", title="Al: bounded five-point E(V) teaching fit")
    axis.margins(x=0)
    axis.legend(frameon=False, fontsize=8)
    figure.tight_layout()
    figure.savefig(args.out_dir / "aluminium-eos-fit.png", dpi=180)
    plt.close(figure)
    print(f"{mathematical_status} bounded E(V) quadratic fit; not an EOS/elastic acceptance result")


if __name__ == "__main__":
    main()
