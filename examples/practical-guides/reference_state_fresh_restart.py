from __future__ import annotations

import json


FIXTURE_ENERGY_TOLERANCE = 2.0e-5


def run() -> dict[str, object]:
    """Compare deterministic fresh and restart state records."""
    records = [
        {
            "id": "fresh-fm-a",
            "initialization": "fresh",
            "parent": None,
            "completed": True,
            "residual": 4.0e-10,
            "state": "FM-A",
            "energy": -15.432100,
            "density_signature": "density-fm-a-1",
        },
        {
            "id": "restart-fm-a",
            "initialization": "restart",
            "parent": "optimization-final-state",
            "completed": True,
            "residual": 3.0e-10,
            "state": "FM-A",
            "energy": -15.432112,
            "density_signature": "density-fm-a-2",
        },
        {
            "id": "restart-afm-b",
            "initialization": "restart",
            "parent": "alternative-magnetic-seed",
            "completed": True,
            "residual": 5.0e-10,
            "state": "AFM-B",
            "energy": -15.431400,
            "density_signature": "density-afm-b",
        },
    ]

    fresh = records[0]
    compatible_restart = records[1]
    separate_restart = records[2]

    same_state = (
        fresh["completed"]
        and compatible_restart["completed"]
        and fresh["state"] == compatible_restart["state"]
        and abs(fresh["energy"] - compatible_restart["energy"])
        <= FIXTURE_ENERGY_TOLERANCE
    )
    assert same_state
    assert separate_restart["state"] != fresh["state"]

    return {
        "fixture": "deterministic state records; no SCF solver",
        "fixture_energy_tolerance": FIXTURE_ENERGY_TOLERANCE,
        "same_state_paths": [fresh["id"], compatible_restart["id"]],
        "separate_state_paths": [separate_restart["id"]],
        "same_state_reproduced": same_state,
        "different_completed_state_retained": True,
        "boundary": (
            "state-lineage logic only; no DFT restart validation, SCF convergence, "
            "energy accuracy, or ground-state claim"
        ),
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
