from __future__ import annotations

import json
from pathlib import Path
from tempfile import TemporaryDirectory

import numpy as np
from ase.build import bulk
from ase.calculators.emt import EMT
from ase.io import read
from ase.optimize import BFGS


def _max_force(atoms) -> float:
    return max(float(np.linalg.norm(force)) for force in atoms.get_forces())


def run() -> dict[str, object]:
    """Interrupt, restart, and independently verify a small ASE/EMT relaxation."""
    atoms = bulk("Cu", "fcc", a=3.6, cubic=True)
    atoms.positions[1] += np.array([0.24, -0.16, 0.10])
    atoms.positions[2] += np.array([-0.12, 0.20, -0.08])
    atoms.calc = EMT()
    initial_max_force = _max_force(atoms)

    with TemporaryDirectory(prefix="dft-workflow-opt-") as temporary_directory:
        workdir = Path(temporary_directory)
        restart_path = workdir / "bfgs.json"
        trajectory_path = workdir / "relax.traj"

        first = BFGS(
            atoms,
            restart=restart_path,
            trajectory=trajectory_path,
            logfile=None,
        )
        first_converged = bool(first.run(fmax=0.05, steps=2))
        first_steps = first.get_number_of_steps()
        interrupted_max_force = _max_force(atoms)

        assert restart_path.is_file()
        assert trajectory_path.is_file()
        assert first_steps == 2
        assert first_converged is False

        continued = BFGS(
            atoms,
            restart=restart_path,
            trajectory=trajectory_path,
            append_trajectory=True,
            logfile=None,
        )
        continued_converged = bool(continued.run(fmax=0.05, steps=100))
        continued_steps = continued.get_number_of_steps()

        verified = atoms.copy()
        verified.calc = EMT()
        final_max_force = _max_force(verified)
        frames = read(trajectory_path, index=":")

        assert continued_converged
        assert continued_steps > 0
        assert len(frames) >= 4
        assert final_max_force <= 0.05 + 1e-10
        assert final_max_force < initial_max_force
        assert restart_path.stat().st_size > 0
        assert trajectory_path.stat().st_size > 0

        report = {
            "model": "distorted periodic Cu teaching fixture evaluated with ASE EMT",
            "initial_max_force": round(initial_max_force, 8),
            "interrupted_max_force": round(interrupted_max_force, 8),
            "verified_final_max_force": round(final_max_force, 8),
            "first_segment_steps": first_steps,
            "first_segment_converged": first_converged,
            "continued_segment_steps": continued_steps,
            "continued_segment_converged": continued_converged,
            "trajectory_frames": len(frames),
            "restart_file_created": True,
            "trajectory_file_created": True,
            "fresh_final_calculator": True,
            "fixture_force_criterion": 0.05,
            "boundary": (
                "ASE/EMT restart mechanics only; no DFT calculation, universal force "
                "criterion, optimizer-portability proof, or physical-minimum claim"
            ),
        }

    return report


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
