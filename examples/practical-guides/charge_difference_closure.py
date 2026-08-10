#!/usr/bin/env python3
"""Deterministic invented charge-difference closure fixture; no DFT."""
from __future__ import annotations

import json


COMBINED = [1.02, 0.98, 1.10, 0.90]
FRAGMENTS = [1.00, 1.00, 1.00, 1.00]


def run() -> dict[str, object]:
    delta = [combined - fragment for combined, fragment in zip(COMBINED, FRAGMENTS)]
    if abs(sum(delta)) > 1e-12:
        raise SystemExit("fixture must close")
    return {
        "fixture": "invented compatible density cells",
        "grid_cells": 4,
        "full_cell_delta_integral": sum(delta),
        "positive_cell_sum": sum(value for value in delta if value > 0),
        "negative_cell_sum": sum(value for value in delta if value < 0),
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
    print("Execution establishes invented-grid arithmetic only; it is not a density field or DFT calculation.")
