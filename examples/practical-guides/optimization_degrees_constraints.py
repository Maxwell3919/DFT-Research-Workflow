from __future__ import annotations

import json

import numpy as np
from ase.build import bulk
from ase.calculators.emt import EMT
from ase.constraints import FixAtoms
from ase.optimize import BFGS


def _max_force(atoms, indices: list[int]) -> float:
    forces = atoms.get_forces()
    return max(float(np.linalg.norm(forces[index])) for index in indices)


def run() -> dict[str, object]:
    """Verify a bounded positions-only ASE optimization with one fixed atom."""
    atoms = bulk("Cu", "fcc", a=3.6, cubic=True)
    atoms.positions[1] += np.array([0.18, -0.12, 0.08])
    atoms.positions[2] += np.array([-0.08, 0.10, -0.06])

    initial_cell = atoms.cell.array.copy()
    initial_positions = atoms.positions.copy()
    fixed_indices = [0]
    free_indices = [index for index in range(len(atoms)) if index not in fixed_indices]

    atoms.set_constraint(FixAtoms(indices=fixed_indices))
    atoms.calc = EMT()
    initial_free_max_force = _max_force(atoms, free_indices)

    optimizer = BFGS(atoms, logfile=None)
    converged = bool(optimizer.run(fmax=0.05, steps=80))
    final_free_max_force = _max_force(atoms, free_indices)

    assert converged
    assert np.allclose(atoms.positions[fixed_indices], initial_positions[fixed_indices], atol=1e-12)
    assert np.allclose(atoms.cell.array, initial_cell, atol=1e-12)
    assert not np.allclose(atoms.positions[free_indices], initial_positions[free_indices], atol=1e-8)
    assert final_free_max_force <= 0.05 + 1e-10
    assert final_free_max_force < initial_free_max_force

    return {
        "model": "distorted periodic Cu teaching fixture evaluated with ASE EMT",
        "atoms": len(atoms),
        "fixed_indices": fixed_indices,
        "free_indices": free_indices,
        "cell_unchanged": bool(np.allclose(atoms.cell.array, initial_cell, atol=1e-12)),
        "fixed_positions_unchanged": bool(
            np.allclose(atoms.positions[fixed_indices], initial_positions[fixed_indices], atol=1e-12)
        ),
        "free_positions_changed": bool(
            not np.allclose(atoms.positions[free_indices], initial_positions[free_indices], atol=1e-8)
        ),
        "initial_free_max_force": round(initial_free_max_force, 8),
        "final_free_max_force": round(final_free_max_force, 8),
        "optimizer_steps": optimizer.get_number_of_steps(),
        "fixture_force_criterion": 0.05,
        "boundary": (
            "ASE/EMT software test only; no DFT calculation, transferable force threshold, "
            "cell optimization, or physical-minimum claim"
        ),
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
