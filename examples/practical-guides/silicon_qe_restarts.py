from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
FRESH = ROOT / "examples/practical-guides/data/silicon-qe/restart"
RELAX = ROOT / "examples/practical-guides/data/silicon-qe/relax-restart"
HASHES = {
    FRESH / "fresh.out": "86266d6cf5a38b86e3a3918c8c73e4d29a7d84c0b1771cb5c32d166bd4af64a5",
    FRESH / "restart.out": "44743a2471b5714fb4799a447f0a615c7c6e8219e78044ce4c9963f66bd195eb",
    RELAX / "segment1.out": "8ad09cca7e20d1872c0ef3d4c1e018dae65e4cc1c60052d70d812373dd24204b",
    RELAX / "segment2-restart.out": "8c294032f4dc59db136957c90cb665f8ad376be5c3b4c4590257ec6ad1b7c421",
}


def _energy(text: str) -> float:
    return float(re.findall(r"!\s+total energy\s+=\s+([-0-9.]+) Ry", text)[-1])


def run() -> dict[str, object]:
    texts = {path.name: path.read_text(encoding="utf8") for path in HASHES}
    for path, expected in HASHES.items():
        assert hashlib.sha256(path.read_bytes()).hexdigest() == expected
        assert "convergence has been achieved" in texts[path.name] and "JOB DONE" in texts[path.name]
    fresh, restart = texts["fresh.out"], texts["restart.out"]
    e_fresh, e_restart = _energy(fresh), _energy(restart)
    assert e_fresh == e_restart
    first, continued = texts["segment1.out"], texts["segment2-restart.out"]
    assert "maximum number of steps has been reached" in first
    assert "End of BFGS Geometry Optimization" in continued
    return {
        "material": "COD 9013102 Silicon primitive cell",
        "software": "Quantum ESPRESSO 7.5 pw.x",
        "fresh_restart_energy_Ry": {"fresh": e_fresh, "restart": e_restart},
        "fresh_restart_match_at_printed_precision": True,
        "relaxation_segments": {"first_segment_incomplete": True, "restart_segment_bfgs_completion": True},
        "boundary": "Hash-bound completion and declared restart-lineage checks only; no restart-format portability, observable convergence, candidate-state completeness, or ground-state/material claim.",
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
