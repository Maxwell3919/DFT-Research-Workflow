"""Validate a deterministic energy-volume sampling ledger without running DFT."""

from __future__ import annotations


EXPECTED = {
    "composition": "A2B2",
    "atom_count": 4,
    "charge": 0,
    "evaluator": "fixture-method-v1",
    "relaxation_policy": "fixed-volume-shape-and-internal-relaxation",
    "electronic_state": "state-A",
}

RECORDS = [
    {"id": "v34", "volume": 34.0, "energy": -19.925, "complete": True, "state_verified": True, **EXPECTED},
    {"id": "v36", "volume": 36.0, "energy": -19.968, "complete": True, "state_verified": True, **EXPECTED},
    {"id": "v38", "volume": 38.0, "energy": -19.992, "complete": True, "state_verified": True, **EXPECTED},
    {"id": "v40", "volume": 40.0, "energy": -20.000, "complete": True, "state_verified": True, **EXPECTED},
    {"id": "v42", "volume": 42.0, "energy": -19.991, "complete": True, "state_verified": True, **EXPECTED},
    {"id": "v44", "volume": 44.0, "energy": -19.963, "complete": True, "state_verified": True, **EXPECTED},
    {"id": "v46", "volume": 46.0, "energy": -19.916, "complete": True, "state_verified": True, **EXPECTED},
    {"id": "v32-state-switch", "volume": 32.0, "energy": -19.910, "complete": True, "state_verified": True, **{**EXPECTED, "electronic_state": "state-B"}},
    {"id": "v48-unfinished", "volume": 48.0, "energy": -19.850, "complete": False, "state_verified": False, **EXPECTED},
]


def exclusion_reason(record: dict[str, object]) -> str | None:
    for field, value in EXPECTED.items():
        if record[field] != value:
            return f"different-{field.replace('_', '-')}"
    if not record["complete"] or not record["state_verified"]:
        return "incomplete-or-state-unverified"
    return None


def run() -> dict[str, object]:
    accepted = []
    excluded = {}
    for record in RECORDS:
        reason = exclusion_reason(record)
        if reason:
            excluded[record["id"]] = reason
        else:
            accepted.append(record)

    accepted.sort(key=lambda record: record["volume"])
    volumes = [record["volume"] for record in accepted]
    energies = [record["energy"] for record in accepted]
    assert len(volumes) == len(set(volumes)) == 7
    minimum_index = energies.index(min(energies))
    assert 0 < minimum_index < len(energies) - 1
    assert energies[minimum_index - 1] > energies[minimum_index] < energies[minimum_index + 1]
    assert excluded == {
        "v32-state-switch": "different-electronic-state",
        "v48-unfinished": "incomplete-or-state-unverified",
    }

    return {
        "fixture": "invented A2B2 energy-volume ledger; no electronic-structure calculation",
        "comparison_identity": EXPECTED,
        "accepted_ids": [record["id"] for record in accepted],
        "accepted_volumes_angstrom3_per_cell": volumes,
        "minimum_sample": accepted[minimum_index]["id"],
        "minimum_is_bracketed": True,
        "excluded": excluded,
        "required_production_additions": [
            "structure and parent hashes",
            "cell metric and strain map",
            "force, stress, and convergence evidence",
            "software and numerical representation",
        ],
        "boundary": "ledger continuity and minimum bracketing only; no DFT execution, EOS fit, equilibrium volume, bulk modulus, phase transition, or stability claim",
    }


if __name__ == "__main__":
    print(run())
