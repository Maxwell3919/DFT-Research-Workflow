from __future__ import annotations

from decimal import Decimal


def run() -> dict[str, object]:
    """Filter a deterministic energy ledger before a bounded relative-energy comparison."""

    fixture = "deterministic abstract energy ledger; no electronic-structure calculation"
    entries = [
        {
            "id": "alpha-a2b3",
            "composition": {"A": 2, "B": 3},
            "charge": 0,
            "formula_units": 2,
            "energy_ev_per_cell": Decimal("-90.000"),
            "evaluator": "fixture-method-v1",
            "energy_field": "electronic_energy",
            "complete": True,
            "state_verified": True,
        },
        {
            "id": "beta-a2b3",
            "composition": {"A": 2, "B": 3},
            "charge": 0,
            "formula_units": 1,
            "energy_ev_per_cell": Decimal("-44.880"),
            "evaluator": "fixture-method-v1",
            "energy_field": "electronic_energy",
            "complete": True,
            "state_verified": True,
        },
        {
            "id": "charged-a2b3",
            "composition": {"A": 2, "B": 3},
            "charge": 1,
            "formula_units": 1,
            "energy_ev_per_cell": Decimal("-45.400"),
            "evaluator": "fixture-method-v1",
            "energy_field": "electronic_energy",
            "complete": True,
            "state_verified": True,
        },
        {
            "id": "mixed-method-a2b3",
            "composition": {"A": 2, "B": 3},
            "charge": 0,
            "formula_units": 1,
            "energy_ev_per_cell": Decimal("-45.200"),
            "evaluator": "fixture-method-v2",
            "energy_field": "electronic_energy",
            "complete": True,
            "state_verified": True,
        },
        {
            "id": "unfinished-a2b3",
            "composition": {"A": 2, "B": 3},
            "charge": 0,
            "formula_units": 1,
            "energy_ev_per_cell": Decimal("-45.300"),
            "evaluator": "fixture-method-v1",
            "energy_field": "electronic_energy",
            "complete": False,
            "state_verified": False,
        },
    ]

    target_composition = {"A": 2, "B": 3}
    accepted: list[dict[str, object]] = []
    excluded: dict[str, str] = {}
    for entry in entries:
        reason = None
        if entry["composition"] != target_composition:
            reason = "different-composition"
        elif entry["charge"] != 0:
            reason = "different-charge"
        elif entry["evaluator"] != "fixture-method-v1":
            reason = "different-evaluator"
        elif entry["energy_field"] != "electronic_energy":
            reason = "different-energy-field"
        elif not entry["complete"] or not entry["state_verified"]:
            reason = "incomplete-or-state-unverified"

        if reason:
            excluded[str(entry["id"])] = reason
            continue

        energy_per_formula = entry["energy_ev_per_cell"] / int(entry["formula_units"])
        accepted.append({"id": entry["id"], "energy_ev_per_formula_unit": energy_per_formula})

    assert [entry["id"] for entry in accepted] == ["alpha-a2b3", "beta-a2b3"]
    reference = min(accepted, key=lambda entry: entry["energy_ev_per_formula_unit"])
    comparison = []
    atom_count = sum(target_composition.values())
    for entry in accepted:
        delta_per_formula = entry["energy_ev_per_formula_unit"] - reference["energy_ev_per_formula_unit"]
        comparison.append(
            {
                "id": entry["id"],
                "delta_ev_per_formula_unit": float(delta_per_formula),
                "delta_ev_per_atom": float(delta_per_formula / atom_count),
            }
        )

    assert comparison == [
        {"id": "alpha-a2b3", "delta_ev_per_formula_unit": 0.0, "delta_ev_per_atom": 0.0},
        {"id": "beta-a2b3", "delta_ev_per_formula_unit": 0.12, "delta_ev_per_atom": 0.024},
    ]
    assert excluded == {
        "charged-a2b3": "different-charge",
        "mixed-method-a2b3": "different-evaluator",
        "unfinished-a2b3": "incomplete-or-state-unverified",
    }

    return {
        "fixture": fixture,
        "enumerated_entries": [entry["id"] for entry in entries],
        "accepted_entries": [entry["id"] for entry in accepted],
        "excluded_entries": excluded,
        "reference": reference["id"],
        "comparison": comparison,
        "normalization": {
            "raw": "eV per computational cell",
            "comparison": ["eV per A2B3 formula unit", "eV per atom"],
        },
        "boundary": (
            "ledger and normalization logic only; no DFT execution, energy convergence, "
            "physical ordering, global minimum, formation energy, or stability claim"
        ),
    }


if __name__ == "__main__":
    print(run())
