from __future__ import annotations

import json

from pymatgen.core import Lattice, Structure
from pymatgen.transformations.standard_transformations import (
    DeformStructureTransformation,
    ReplaceSiteSpeciesTransformation,
    SupercellTransformation,
)


def run() -> dict[str, object]:
    """Execute the assertions used by the pymatgen transformation guide."""
    parent = Structure(
        Lattice.cubic(4.0),
        ["Li", "O"],
        [[0, 0, 0], [0.5, 0.5, 0.5]],
    )
    parent_copy = parent.copy()

    matrix = [[2, 0, 0], [0, 1, 0], [0, 0, 1]]
    supercell = SupercellTransformation(matrix).apply_transformation(parent)
    strained = DeformStructureTransformation(
        [[1.02, 0, 0], [0, 1.0, 0], [0, 0, 1.0]]
    ).apply_transformation(parent)
    substituted = ReplaceSiteSpeciesTransformation({0: "Na"}).apply_transformation(parent)

    assert len(supercell) == 2 * len(parent)
    assert abs(supercell.volume / parent.volume - 2.0) < 1e-10
    assert abs(strained.volume / parent.volume - 1.02) < 1e-10
    assert substituted[0].specie.symbol == "Na"
    assert parent[0].specie.symbol == "Li"
    assert parent == parent_copy

    return {
        "parent_formula": parent.composition.reduced_formula,
        "parent_sites": len(parent),
        "supercell_matrix": matrix,
        "supercell_sites": len(supercell),
        "supercell_volume_ratio": round(supercell.volume / parent.volume, 8),
        "strained_volume_ratio": round(strained.volume / parent.volume, 8),
        "substituted_formula": substituted.composition.formula,
        "parent_preserved": parent == parent_copy,
        "boundary": "candidate structures only; no relaxation, energy, phase, or transferability claim",
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
