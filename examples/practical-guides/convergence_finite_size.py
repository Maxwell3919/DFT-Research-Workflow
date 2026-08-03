from __future__ import annotations

import json


def analyse_finite_size_table() -> dict[str, object]:
    """Analyse a synthetic lateral-size/vacuum convergence table."""
    rows = [
        {"lateral": 2, "vacuum": 12, "observable": 0.244, "dipole_probe": 0.81, "state": "slab-A"},
        {"lateral": 2, "vacuum": 18, "observable": 0.222, "dipole_probe": 0.56, "state": "slab-A"},
        {"lateral": 2, "vacuum": 24, "observable": 0.214, "dipole_probe": 0.47, "state": "slab-A"},
        {"lateral": 3, "vacuum": 12, "observable": 0.208, "dipole_probe": 0.68, "state": "slab-A"},
        {"lateral": 3, "vacuum": 18, "observable": 0.198, "dipole_probe": 0.42, "state": "slab-A"},
        {"lateral": 3, "vacuum": 24, "observable": 0.195, "dipole_probe": 0.36, "state": "slab-A"},
        {"lateral": 4, "vacuum": 12, "observable": 0.203, "dipole_probe": 0.64, "state": "slab-A"},
        {"lateral": 4, "vacuum": 18, "observable": 0.195, "dipole_probe": 0.39, "state": "slab-A"},
        {"lateral": 4, "vacuum": 24, "observable": 0.193, "dipole_probe": 0.34, "state": "slab-A"},
    ]
    reference = next(row for row in rows if row["lateral"] == 4 and row["vacuum"] == 24)
    tolerances = {"observable": 0.006, "dipole_probe": 0.09}

    laterals = sorted({row["lateral"] for row in rows})
    vacua = sorted({row["vacuum"] for row in rows})
    assert len(rows) == len(laterals) * len(vacua)
    assert len({row["state"] for row in rows}) == 1

    stable = []
    for row in rows:
        deviations = {
            key: abs(float(row[key]) - float(reference[key]))
            for key in tolerances
        }
        if all(deviations[key] <= tolerances[key] for key in tolerances):
            stable.append({**row, "deviations": deviations})

    accepted = next(row for row in stable if row["lateral"] == 3 and row["vacuum"] == 18)
    lateral_check = next(row for row in stable if row["lateral"] == 4 and row["vacuum"] == 18)
    vacuum_check = next(row for row in stable if row["lateral"] == 3 and row["vacuum"] == 24)
    strictest = next(row for row in stable if row["lateral"] == 4 and row["vacuum"] == 24)

    assert lateral_check["lateral"] > accepted["lateral"]
    assert vacuum_check["vacuum"] > accepted["vacuum"]
    assert strictest["lateral"] > accepted["lateral"] and strictest["vacuum"] > accepted["vacuum"]

    false_plateau = [row for row in rows if row["lateral"] == 2 and row["vacuum"] >= 18]
    assert abs(false_plateau[-1]["observable"] - false_plateau[-2]["observable"]) < 0.01
    assert abs(false_plateau[-1]["observable"] - reference["observable"]) > tolerances["observable"]

    return {
        "data_origin": "synthetic illustrative finite-size table",
        "controls": ["lateral", "vacuum"],
        "tolerances": tolerances,
        "accepted_region": [
            {"lateral": row["lateral"], "vacuum": row["vacuum"]}
            for row in stable
        ],
        "selected_point": {"lateral": accepted["lateral"], "vacuum": accepted["vacuum"]},
        "independent_lateral_confirmation": {"lateral": lateral_check["lateral"], "vacuum": lateral_check["vacuum"]},
        "independent_vacuum_confirmation": {"lateral": vacuum_check["lateral"], "vacuum": vacuum_check["vacuum"]},
        "false_plateau_detected": True,
        "boundary": "analysis logic only; no real slab, defect, vacuum, correction, or infinite-size limit is validated",
    }


def run() -> dict[str, object]:
    return analyse_finite_size_table()


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
