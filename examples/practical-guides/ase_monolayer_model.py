from __future__ import annotations

import json

from ase.build import mx2


def run() -> dict[str, object]:
    """Execute the structural assertions used by the monolayer worked example."""
    monolayer = mx2(
        "MoS2",
        kind="2H",
        a=3.18,
        thickness=3.19,
        size=(2, 2, 1),
        vacuum=8.0,
    )

    symbols = monolayer.get_chemical_symbols()
    z_min = float(monolayer.positions[:, 2].min())
    z_max = float(monolayer.positions[:, 2].max())
    z_extent = z_max - z_min
    cell_z = float(monolayer.cell[2, 2])
    empty_length = cell_z - z_extent
    in_plane_area = float(monolayer.cell.area(2))

    assert len(monolayer) == 12
    assert symbols.count("Mo") == 4
    assert symbols.count("S") == 8
    assert monolayer.pbc.tolist() == [True, True, False]
    assert empty_length >= 15.9

    return {
        "origin": "generated illustrative structure",
        "builder": "ase.build.mx2",
        "formula": monolayer.get_chemical_formula(),
        "kind": "2H",
        "atoms": len(monolayer),
        "builder_a": 3.18,
        "builder_thickness": 3.19,
        "repeat": [2, 2, 1],
        "builder_vacuum": 8.0,
        "periodicity": monolayer.pbc.tolist(),
        "cell_z": round(cell_z, 8),
        "atomic_z_extent": round(z_extent, 8),
        "empty_cell_length": round(empty_length, 8),
        "in_plane_area": round(in_plane_area, 8),
        "boundary": "illustrative model only; no source-phase, convergence, stability, or property claim",
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
