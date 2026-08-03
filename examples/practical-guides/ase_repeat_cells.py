from __future__ import annotations

import json

import numpy as np
from ase.build import bulk, make_supercell


def run() -> dict[str, object]:
    """Execute the structural assertions used by the cell-repetition guide."""
    parent = bulk("Si", "diamond", a=5.43)
    repeated = parent.repeat((2, 2, 1))
    transform = np.array([[2, 1, 0], [0, 2, 0], [0, 0, 1]], dtype=int)
    general = make_supercell(parent, transform)

    multiplier = int(round(abs(np.linalg.det(transform))))
    assert len(parent) == 2
    assert len(repeated) == 4 * len(parent)
    assert len(general) == multiplier * len(parent)
    assert repeated.pbc.tolist() == parent.pbc.tolist() == [True, True, True]
    assert general.pbc.tolist() == parent.pbc.tolist()

    return {
        "parent_atoms": len(parent),
        "diagonal_repeat": [2, 2, 1],
        "diagonal_atoms": len(repeated),
        "general_transform": transform.tolist(),
        "general_multiplier": multiplier,
        "general_atoms": len(general),
        "parent_cell": np.asarray(parent.cell).round(8).tolist(),
        "diagonal_cell": np.asarray(repeated.cell).round(8).tolist(),
        "general_cell": np.asarray(general.cell).round(8).tolist(),
        "periodicity": parent.pbc.tolist(),
        "boundary": "structural transformation only; no energy, convergence, or stability claim",
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
