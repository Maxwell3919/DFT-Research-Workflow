"""Reconstruct a bounded Silicon Gamma-point DFPT ledger from committed QE 7.5 output."""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent / "data" / "silicon-qe" / "phonon"
FREQUENCY = re.compile(r"freq \(\s*(\d+)\) =\s*([-0-9.]+) \[THz\] =\s*([-0-9.]+) \[cm-1\]")


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def run() -> dict[str, object]:
    scf = ROOT / "si-gamma-scf.out"
    phonon = ROOT / "si-gamma-ph.out"
    if "convergence has been achieved" not in scf.read_text() or "JOB DONE." not in scf.read_text():
        raise RuntimeError("SCF completion evidence missing")
    text = phonon.read_text()
    if "Program PHONON v.7.5" not in text or "Diagonalizing the dynamical matrix" not in text or "JOB DONE." not in text:
        raise RuntimeError("ph.x completion evidence missing")
    modes = [{"mode": int(n), "frequency_thz": float(thz), "frequency_cm-1": float(cm)} for n, thz, cm in FREQUENCY.findall(text)]
    if len(modes) != 6 or [mode["mode"] for mode in modes] != list(range(1, 7)):
        raise RuntimeError("expected six Gamma-point modes")
    if any(abs(mode["frequency_cm-1"] - 1.216451) > 1e-6 for mode in modes[:3]):
        raise RuntimeError("unexpected acoustic diagnostic")
    if any(abs(mode["frequency_cm-1"] - 514.442616) > 1e-6 for mode in modes[3:]):
        raise RuntimeError("unexpected optical diagnostic")
    files = ["si-gamma-scf.in", "si-gamma-scf.out", "si-gamma-scf.err", "si-gamma-ph.in", "si-gamma-ph.out", "si-gamma-ph.err", "si_gamma.dyn"]
    return {
        "schema_version": 1,
        "evidence_class": "real-execution",
        "material": {"formula": "Si", "structure_source": "COD 9013102 deterministic public copy", "structure_sha256": "cd12420b831cd62227a36865179d12c5eece74e4a40e8d135abc981ced42ca55", "raw_download_sha256": "99fb6c6c297f8407aa779de46bf7eaa663ac079f7f12b582c042313f9c82f77e"},
        "software": {"pw.x": "7.5", "ph.x": "7.5"},
        "workflow": "SCF followed by Gamma-point ph.x using the same prefix/outdir lineage",
        "q_point_fractional": [0.0, 0.0, 0.0],
        "modes": modes,
        "acoustic_diagnostic_cm-1": 1.216451,
        "optical_triplet_cm-1": 514.442616,
        "files_sha256": {name: sha(ROOT / name) for name in files},
        "convergence_status": "not assessed for phonon frequency; one Gamma point only",
        "claim_boundary": "This run documents a single QE 7.5 Gamma-point DFPT calculation. It is not a phonon dispersion, q-mesh/cutoff/k-mesh convergence study, acoustic-sum-rule study, dynamical-stability proof, finite-temperature result, or material conclusion.",
    }


def svg(result: dict[str, object], path: Path) -> None:
    modes = result["modes"]
    max_frequency = 560.0
    bars = "".join(f'<rect x="{65 + 65 * i}" y="{365 - mode["frequency_cm-1"] / max_frequency * 290:.1f}" width="36" height="{mode["frequency_cm-1"] / max_frequency * 290:.1f}" fill="{"#3273a8" if i < 3 else "#b96d2e"}"/><text x="{83 + 65 * i}" y="392" text-anchor="middle" font-size="13">{mode["mode"]}</text>' for i, mode in enumerate(modes))
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" width="900" height="470" viewBox="0 0 900 470" role="img" aria-labelledby="t d"><title id="t">Silicon Gamma-point phonon modes from a QE 7.5 DFPT run</title><desc id="d">Six real Silicon Gamma-point modes parsed from committed Quantum ESPRESSO output: three 1.216451 inverse-centimeter acoustic diagnostics and three 514.442616 inverse-centimeter optical modes.</desc><rect width="900" height="470" fill="#fffdf8"/><text x="55" y="48" font-size="25" font-family="sans-serif" font-weight="700" fill="#172a3a">Silicon Γ-point modes from QE 7.5 output</text><text x="55" y="76" font-size="15" font-family="sans-serif" fill="#52616b">Single DFPT q point · 8×8×8 SCF · not a dispersion or convergence result</text><line x1="55" y1="365" x2="500" y2="365" stroke="#334155"/><line x1="55" y1="75" x2="55" y2="365" stroke="#334155"/>{bars}<text x="55" y="425" font-size="14" font-family="sans-serif" fill="#52616b">blue: acoustic diagnostic (1.216451 cm⁻¹) · ochre: optical triplet (514.442616 cm⁻¹)</text></svg>''', encoding="utf-8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", type=Path)
    parser.add_argument("--csv", type=Path)
    parser.add_argument("--svg", type=Path)
    args = parser.parse_args()
    result = run()
    if args.json:
        args.json.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    if args.csv:
        with args.csv.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=["mode", "frequency_thz", "frequency_cm-1"])
            writer.writeheader(); writer.writerows(result["modes"])
    if args.svg:
        svg(result, args.svg)
    print(json.dumps(result, indent=2))
