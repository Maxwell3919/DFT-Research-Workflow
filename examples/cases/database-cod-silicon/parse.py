#!/usr/bin/env python3
"""Fail-closed parser for the hash-bound COD Silicon CIF download."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "source/9013102.cif"
ANALYSIS = ROOT / "derived/9013102.analysis.json"
SUMMARY = ROOT / "derived/parsed-summary.json"
EXPECTED_SHA256 = "99fb6c6c297f8407aa779de46bf7eaa663ac079f7f12b582c042313f9c82f77e"


def main() -> None:
    actual_hash = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
    if actual_hash != EXPECTED_SHA256:
        raise SystemExit(f"FAIL source SHA-256 mismatch: {actual_hash}")
    analysis = json.loads(ANALYSIS.read_text(encoding="utf-8"))
    structure = analysis["structure"]
    if analysis["source"]["sha256"] != actual_hash:
        raise SystemExit("FAIL analysis source hash does not bind to downloaded CIF")
    if structure["formula"] != "Si8" or structure["atom_count"] != 8:
        raise SystemExit("FAIL expected conventional Si8 structure was not parsed")
    if structure["cell"]["a"] != 5.4304:
        raise SystemExit("FAIL expected CIF a axis was not parsed")
    result = {
        "source_file": "source/9013102.cif",
        "source_sha256": actual_hash,
        "analysis_status": analysis["status"],
        "formula": structure["formula"],
        "atom_count": structure["atom_count"],
        "cell_a_ang": structure["cell"]["a"],
        "minimum_distance_ang": structure["nearest_distances"]["min_distance_ang"],
        "symmetry_status": structure["symmetry_attempt"]["status"],
        "boundary": "Parsing establishes file identity and selected representation only; it does not validate COD identity, structure quality, stability, or any DFT result.",
    }
    SUMMARY.write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print("PASS parsed COD 9013102: Si8 conventional representation")
    print(f"INFO source_sha256={actual_hash}")
    print(f"INFO analysis_status={analysis['status']}")


if __name__ == "__main__":
    main()
