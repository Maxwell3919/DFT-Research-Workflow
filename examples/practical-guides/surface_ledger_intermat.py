"""Check the frozen public Si-surface ledger used beside the synthetic drift diagram."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "examples/practical-guides/data/intermat-si-surfaces-20260804.json"


def run() -> dict[str, object]:
    raw = DATA.read_bytes()
    record = json.loads(raw)
    rows = record["rows"]
    assert record["source"]["doi"] == "https://doi.org/10.1039/D4DD00031E"
    assert record["source"]["license"] == "CC BY 3.0"
    assert [row["miller"] for row in rows] == ["111", "110", "001"]
    assert [row["surface_energy_opt_J_m2"] for row in rows] == [1.60, 1.66, 2.22]
    return {
        "fixture_type": "frozen public-data ledger",
        "snapshot_sha256": hashlib.sha256(raw).hexdigest(),
        "material": "published unreconstructed Si surfaces (JVASP-1002)",
        "method": record["calculation_scope"]["method_label_reported_by_source"],
        "surface_energy_opt_J_m2": {row["miller"]: row["surface_energy_opt_J_m2"] for row in rows},
        "boundary": "Hashes and checks the attributed three-row InterMat snapshot only; no slab-series rerun, bulk-reference compatibility, reconstruction, termination, convergence, or new surface-energy claim.",
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
