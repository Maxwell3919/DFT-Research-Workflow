from __future__ import annotations

import json
from collections import defaultdict


def analyse_basis_grid_table() -> dict[str, object]:
    """Analyse an illustrative coupled basis/grid table.

    The numbers are synthetic and carry no recommendation for any DFT code.
    """
    rows = [
        {"basis": 40, "grid_ratio": 4, "delta_e": 0.084, "max_force": 0.061, "stress": 0.31, "state": "A"},
        {"basis": 40, "grid_ratio": 6, "delta_e": 0.061, "max_force": 0.043, "stress": 0.24, "state": "A"},
        {"basis": 50, "grid_ratio": 4, "delta_e": 0.031, "max_force": 0.025, "stress": 0.13, "state": "A"},
        {"basis": 50, "grid_ratio": 6, "delta_e": 0.018, "max_force": 0.016, "stress": 0.08, "state": "A"},
        {"basis": 60, "grid_ratio": 4, "delta_e": 0.012, "max_force": 0.013, "stress": 0.07, "state": "A"},
        {"basis": 60, "grid_ratio": 6, "delta_e": 0.004, "max_force": 0.006, "stress": 0.03, "state": "A"},
        {"basis": 70, "grid_ratio": 4, "delta_e": 0.009, "max_force": 0.010, "stress": 0.05, "state": "A"},
        {"basis": 70, "grid_ratio": 6, "delta_e": 0.003, "max_force": 0.005, "stress": 0.02, "state": "A"},
    ]
    tolerances = {"delta_e": 0.002, "max_force": 0.003, "stress": 0.02}
    reference = next(row for row in rows if row["basis"] == 70 and row["grid_ratio"] == 6)

    coverage: dict[int, set[int]] = defaultdict(set)
    for row in rows:
        coverage[row["basis"]].add(row["grid_ratio"])
    assert all(len(ratios) >= 2 for ratios in coverage.values())
    assert len({row["state"] for row in rows}) == 1

    stable = []
    for row in rows:
        deviations = {
            key: abs(float(row[key]) - float(reference[key]))
            for key in tolerances
        }
        if all(deviations[key] <= tolerances[key] for key in tolerances):
            stable.append({**row, "deviations": deviations})

    accepted = next(row for row in stable if row["basis"] == 60 and row["grid_ratio"] == 6)
    stricter = next(row for row in stable if row["basis"] == 70 and row["grid_ratio"] == 6)
    assert stricter["basis"] > accepted["basis"]
    assert accepted["grid_ratio"] == stricter["grid_ratio"]
    assert len(stable) >= 2

    unresolved_at_low_grid = [row for row in rows if row["grid_ratio"] == 4 and row["basis"] >= 60]
    assert any(abs(row["stress"] - reference["stress"]) > tolerances["stress"] for row in unresolved_at_low_grid)

    return {
        "data_origin": "synthetic illustrative convergence table",
        "controls": ["basis", "grid_ratio"],
        "observables": list(tolerances),
        "tolerances": tolerances,
        "accepted_region": [{"basis": row["basis"], "grid_ratio": row["grid_ratio"]} for row in stable],
        "selected_point": {"basis": accepted["basis"], "grid_ratio": accepted["grid_ratio"]},
        "stricter_confirmation": {"basis": stricter["basis"], "grid_ratio": stricter["grid_ratio"]},
        "coupled_dependence_detected": True,
        "boundary": "analysis logic only; no real cutoff, grid, pseudopotential, or material is converged",
    }


def run() -> dict[str, object]:
    return analyse_basis_grid_table()


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
