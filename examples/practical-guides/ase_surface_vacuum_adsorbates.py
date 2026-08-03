from __future__ import annotations

import json

import numpy as np
from ase.build import add_adsorbate, fcc111


def run() -> dict[str, object]:
    """Execute the structural assertions used by the surface-model guide."""
    slab = fcc111("Al", size=(2, 2, 3))
    substrate_atoms = len(slab)
    top_before = float(slab.positions[:, 2].max())

    add_adsorbate(slab, "H", height=1.5, position="ontop")
    slab.center(vacuum=10.0, axis=2)

    symbols = slab.get_chemical_symbols()
    z_min = float(slab.positions[:, 2].min())
    z_max = float(slab.positions[:, 2].max())
    z_extent = z_max - z_min
    cell_z = float(slab.cell[2, 2])
    empty_length = cell_z - z_extent
    h_index = symbols.index("H")
    substrate_z_max = float(np.delete(slab.positions[:, 2], h_index).max())

    assert len(slab) == substrate_atoms + 1
    assert symbols.count("H") == 1
    assert slab.pbc.tolist() == [True, True, False]
    assert float(slab.positions[h_index, 2]) > substrate_z_max
    assert empty_length >= 19.9

    return {
        "substrate_atoms": substrate_atoms,
        "total_atoms": len(slab),
        "adsorbate": "H",
        "initial_adsorbate_height": 1.5,
        "top_before_centering": round(top_before, 8),
        "cell_z": round(cell_z, 8),
        "atomic_z_extent": round(z_extent, 8),
        "empty_cell_length": round(empty_length, 8),
        "periodicity": slab.pbc.tolist(),
        "boundary": "generated adsorption candidate only; no relaxation, convergence, or adsorption energy",
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
