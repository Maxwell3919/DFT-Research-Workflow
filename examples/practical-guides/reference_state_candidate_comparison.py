from __future__ import annotations

import json


def run() -> dict[str, object]:
    """Filter and rank a deterministic electronic-state candidate table."""
    candidates = [
        {
            "id": "FM-A",
            "charge": 0,
            "evaluator": "fixture-H",
            "normalization": "per-cell",
            "completed": True,
            "state_identified": True,
            "energy": -20.1842,
        },
        {
            "id": "AFM-B",
            "charge": 0,
            "evaluator": "fixture-H",
            "normalization": "per-cell",
            "completed": True,
            "state_identified": True,
            "energy": -20.1915,
        },
        {
            "id": "charged-C",
            "charge": -1,
            "evaluator": "fixture-H",
            "normalization": "per-cell",
            "completed": True,
            "state_identified": True,
            "energy": -20.9500,
        },
        {
            "id": "NM-unconverged",
            "charge": 0,
            "evaluator": "fixture-H",
            "normalization": "per-cell",
            "completed": False,
            "state_identified": False,
            "energy": -20.2500,
        },
    ]

    reference_charge = 0
    reference_evaluator = "fixture-H"
    reference_normalization = "per-cell"
    accepted = [
        candidate
        for candidate in candidates
        if candidate["charge"] == reference_charge
        and candidate["evaluator"] == reference_evaluator
        and candidate["normalization"] == reference_normalization
        and candidate["completed"]
        and candidate["state_identified"]
    ]
    excluded = {
        candidate["id"]: (
            "different-charge-thermodynamic-branch"
            if candidate["charge"] != reference_charge
            else "incomplete-or-state-ambiguous"
        )
        for candidate in candidates
        if candidate not in accepted
    }
    selected = min(accepted, key=lambda candidate: candidate["energy"])

    assert [candidate["id"] for candidate in accepted] == ["FM-A", "AFM-B"]
    assert selected["id"] == "AFM-B"
    assert set(excluded) == {"charged-C", "NM-unconverged"}

    return {
        "fixture": "deterministic candidate table; no electronic calculation",
        "enumerated_candidates": [candidate["id"] for candidate in candidates],
        "accepted_candidates": [candidate["id"] for candidate in accepted],
        "excluded_candidates": excluded,
        "selected_reference": selected["id"],
        "selection_statement": (
            "lowest verified fixture candidate among the accepted enumerated set"
        ),
        "boundary": (
            "bounded table logic only; no candidate completeness, DFT convergence, "
            "physical energy ordering, or global ground-state claim"
        ),
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
