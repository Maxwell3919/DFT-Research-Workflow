from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "examples/practical-guides/data/silicon-qe/relax"
OUTPUT_SHA256 = "546a5b13878429c434e3957b115eb620dcaa5f5464ab0492b690c66d0ec1fac7"
INPUT_SHA256 = "5c1ac303baa15b1414f1fbbcf4552a978d45246876c6b49540ca917662ba5aff"


def run() -> dict[str, object]:
    source = (DATA / "si-relax.out").read_text(encoding="utf8")
    assert hashlib.sha256(source.encode()).hexdigest() == OUTPUT_SHA256
    assert hashlib.sha256((DATA / "si-relax.in").read_bytes()).hexdigest() == INPUT_SHA256
    assert "End of BFGS Geometry Optimization" in source and "JOB DONE" in source
    energies = [float(value) for value in re.findall(r"!\s+total energy\s+=\s+([-0-9.]+) Ry", source)]
    forces = [float(value) for value in re.findall(r"Total force =\s*([-0-9.]+)", source)]
    assert len(energies) == len(forces) == 5
    assert forces[-1] < forces[0]
    return {
        "material": "COD 9013102 silicon, intentionally displaced two-site primitive cell",
        "software": "Quantum ESPRESSO 7.5 pw.x",
        "calculation": "fixed-cell BFGS relax; all atomic coordinates active",
        "input_sha256": INPUT_SHA256,
        "output_sha256": OUTPUT_SHA256,
        "ionic_steps": [{"step": i + 1, "energy_Ry": energy, "total_force_Ry_per_bohr": force} for i, (energy, force) in enumerate(zip(energies, forces))],
        "electronic_completion_each_step": True,
        "geometry_completion_marker": True,
        "boundary": "One fixed-cell Silicon teaching relaxation only; no cell optimization, independent starts, force/stress convergence, global-minimum, or material-structure claim.",
    }


if __name__ == "__main__":
    report = run()
    rows = report["ionic_steps"]
    points = " ".join(f"{160 + 145*i},{390 - 5200*row['total_force_Ry_per_bohr']}" for i, row in enumerate(rows))
    output = ROOT / "public/media/practical-guides/optimize-structure/diagnose-forces-stress-and-state/silicon-qe-relax-force.svg"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="520" viewBox="0 0 1000 520" role="img" aria-labelledby="t d"><title id="t">Actual Silicon QE relaxation force trace</title><desc id="d">Total force from five ionic steps of a bounded Quantum ESPRESSO Silicon BFGS relaxation.</desc><rect width="1000" height="520" fill="#f8f5ee"/><text x="70" y="55" font-family="sans-serif" font-size="27" font-weight="700" fill="#172a3a">Actual Silicon QE fixed-cell relaxation</text><text x="70" y="82" font-family="sans-serif" font-size="15" fill="#52616b">QE 7.5 · COD 9013102 · displaced two-site cell · all atoms active, cell fixed</text><path d="M120 100V410H850" fill="none" stroke="#243746" stroke-width="3"/><polyline points="{points}" fill="none" stroke="#2b6f8c" stroke-width="5"/>{''.join(f'<circle cx="{160+145*i}" cy="{390-5200*row["total_force_Ry_per_bohr"]}" r="7" fill="#a33d2d"/>' for i,row in enumerate(rows))}<text x="500" y="465" text-anchor="middle" font-family="sans-serif" font-size="17">ionic step</text><text x="38" y="270" transform="rotate(-90 38 270)" text-anchor="middle" font-family="sans-serif" font-size="17">total force (Ry/bohr)</text><text x="500" y="505" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#52616b">Stored-output reconstruction only; no cell, force-threshold, or global-minimum conclusion.</text></svg>''', encoding="utf8")
    print(json.dumps(report, indent=2))
