#!/usr/bin/env python3
"""Read-only artifact and metric check for the recorded structure-candidate case."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
CASE = ROOT / "examples/cases/structure-defect-interface-candidates"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    manifest = json.loads((CASE / "manifest.json").read_text(encoding="utf-8"))
    report = json.loads((CASE / "derived/structure-candidates-report.json").read_text(encoding="utf-8"))
    for artifact in manifest["artifacts"]:
        path = CASE / artifact["path"]
        assert path.stat().st_size == artifact["bytes"], artifact["path"]
        assert sha256(path) == artifact["sha256"], artifact["path"]
    vacancy = report["vacancy_candidate"]
    interface = report["interface_candidate"]
    assert (vacancy["parent_atoms"], vacancy["candidate_atoms"]) == (64, 63)
    assert vacancy["vacancy_site_fractional_coordinate"] == [0.0, 0.0, 0.0]
    assert interface["candidate_atoms"] == 16
    assert interface["pbc"] == [True, True, False]
    assert interface["interlayer_separation_ang"] == 3.35
    assert interface["imposed_inplane_mismatch_percent"] == 0.0
    print(json.dumps({
        "status": "PASS",
        "case_id": manifest["case_id"],
        "artifacts_verified": len(manifest["artifacts"]),
        "vacancy_atoms": vacancy["candidate_atoms"],
        "interface_atoms": interface["candidate_atoms"],
        "G4": manifest["gates"]["G4"]["status"],
        "G5": manifest["gates"]["G5"]["status"],
    }, sort_keys=True))


if __name__ == "__main__":
    main()
