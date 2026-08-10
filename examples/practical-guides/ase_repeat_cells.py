from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from tempfile import TemporaryDirectory

import numpy as np
from ase.build import bulk, make_supercell
from ase.io import read, write


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _prepare_workdir(workdir: Path) -> tuple[Path, Path, Path]:
    workdir.mkdir(parents=True, exist_ok=True)
    if any(workdir.iterdir()):
        raise ValueError(f"workdir must be empty: {workdir}")
    source_dir = workdir / "source"
    output_dir = workdir / "output"
    source_dir.mkdir()
    output_dir.mkdir()
    return workdir, source_dir, output_dir


def _execute(workdir: Path) -> dict[str, object]:
    root, source_dir, output_dir = _prepare_workdir(workdir)
    parent_path = source_dir / "si-diamond-parent.extxyz"
    repeated_path = output_dir / "si-repeat-2x2x1.extxyz"
    general_path = output_dir / "si-general-supercell.extxyz"

    generated_parent = bulk("Si", "diamond", a=5.43)
    write(parent_path, generated_parent, format="extxyz")
    parent = read(parent_path, format="extxyz")

    repeated = parent.repeat((2, 2, 1))
    transform = np.array([[2, 1, 0], [0, 2, 0], [0, 0, 1]], dtype=int)
    general = make_supercell(parent, transform)
    write(repeated_path, repeated, format="extxyz")
    write(general_path, general, format="extxyz")

    reopened_parent = read(parent_path, format="extxyz")
    reopened_repeated = read(repeated_path, format="extxyz")
    reopened_general = read(general_path, format="extxyz")
    multiplier = int(round(abs(np.linalg.det(transform))))

    assert len(reopened_parent) == 2
    assert len(reopened_repeated) == 4 * len(reopened_parent)
    assert len(reopened_general) == multiplier * len(reopened_parent)
    assert reopened_repeated.pbc.tolist() == reopened_parent.pbc.tolist() == [True, True, True]
    assert reopened_general.pbc.tolist() == reopened_parent.pbc.tolist()
    assert np.allclose(reopened_repeated.cell.array, repeated.cell.array)
    assert np.allclose(reopened_general.cell.array, general.cell.array)

    result = {
        "origin": "generated illustrative diamond-Si parent written before transformation",
        "parent_file": str(parent_path.relative_to(root)),
        "child_files": [
            str(repeated_path.relative_to(root)),
            str(general_path.relative_to(root)),
        ],
        "parent_atoms": len(reopened_parent),
        "diagonal_repeat": [2, 2, 1],
        "diagonal_atoms": len(reopened_repeated),
        "general_transform": transform.tolist(),
        "general_multiplier": multiplier,
        "general_atoms": len(reopened_general),
        "parent_cell": np.asarray(reopened_parent.cell).round(8).tolist(),
        "diagonal_cell": np.asarray(reopened_repeated.cell).round(8).tolist(),
        "general_cell": np.asarray(reopened_general.cell).round(8).tolist(),
        "periodicity": reopened_parent.pbc.tolist(),
        "sha256": {
            str(parent_path.relative_to(root)): _sha256(parent_path),
            str(repeated_path.relative_to(root)): _sha256(repeated_path),
            str(general_path.relative_to(root)): _sha256(general_path),
        },
        "written_and_reopened": True,
        "manual_compare": "Open the parent and both child files together with cell boundaries visible.",
        "boundary": "file-backed structural transformations only; no energy, convergence, or stability claim",
    }
    (root / "summary.json").write_text(
        json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    return result


def run(workdir: str | Path | None = None) -> dict[str, object]:
    """Write, reopen, and check the structures used by the cell-repetition guide."""
    if workdir is not None:
        return _execute(Path(workdir))
    with TemporaryDirectory(prefix="ase-repeat-cells-") as temporary:
        return _execute(Path(temporary))


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Write and reopen a parent Si fixture and two integer supercells."
    )
    parser.add_argument(
        "--workdir",
        type=Path,
        help="Empty directory in which source/, output/, and summary.json are retained.",
    )
    args = parser.parse_args()
    result = run(args.workdir)
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
