from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from tempfile import TemporaryDirectory

from ase.build import mx2
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
    parent_path = source_dir / "mos2-2h-unit.extxyz"
    child_path = output_dir / "mos2-2h-2x2.extxyz"

    generated_parent = mx2(
        "MoS2",
        kind="2H",
        a=3.18,
        thickness=3.19,
        size=(1, 1, 1),
        vacuum=8.0,
    )
    write(parent_path, generated_parent, format="extxyz")
    parent = read(parent_path, format="extxyz")
    monolayer = parent.repeat((2, 2, 1))
    write(child_path, monolayer, format="extxyz")
    reopened_parent = read(parent_path, format="extxyz")
    reopened = read(child_path, format="extxyz")

    symbols = reopened.get_chemical_symbols()
    z_min = float(reopened.positions[:, 2].min())
    z_max = float(reopened.positions[:, 2].max())
    z_extent = z_max - z_min
    cell_z = float(reopened.cell[2, 2])
    empty_length = cell_z - z_extent
    in_plane_area = float(reopened.cell.area(2))

    assert len(reopened_parent) == 3
    assert len(reopened) == 4 * len(reopened_parent) == 12
    assert symbols.count("Mo") == 4
    assert symbols.count("S") == 8
    assert reopened.pbc.tolist() == reopened_parent.pbc.tolist() == [True, True, False]
    assert empty_length >= 15.9

    result = {
        "origin": "generated illustrative 2H-MoS2 unit written before repetition",
        "builder": "ase.build.mx2",
        "parent_file": str(parent_path.relative_to(root)),
        "child_file": str(child_path.relative_to(root)),
        "formula": reopened.get_chemical_formula(),
        "kind": "2H",
        "parent_atoms": len(reopened_parent),
        "child_atoms": len(reopened),
        "builder_a": 3.18,
        "builder_thickness": 3.19,
        "repeat": [2, 2, 1],
        "builder_vacuum": 8.0,
        "periodicity": reopened.pbc.tolist(),
        "cell_z": round(cell_z, 8),
        "atomic_z_extent": round(z_extent, 8),
        "empty_cell_length": round(empty_length, 8),
        "in_plane_area": round(in_plane_area, 8),
        "sha256": {
            str(parent_path.relative_to(root)): _sha256(parent_path),
            str(child_path.relative_to(root)): _sha256(child_path),
        },
        "written_and_reopened": True,
        "manual_compare": "Open the unit and repeated child in top and side views with cell boundaries visible.",
        "boundary": "illustrative file-backed model only; no source-phase, convergence, stability, or property claim",
    }
    (root / "summary.json").write_text(
        json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    return result


def run(workdir: str | Path | None = None) -> dict[str, object]:
    """Write, reopen, and check the structures used by the monolayer guide."""
    if workdir is not None:
        return _execute(Path(workdir))
    with TemporaryDirectory(prefix="ase-monolayer-") as temporary:
        return _execute(Path(temporary))


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Write and reopen an illustrative 2H-MoS2 unit and 2x2 child."
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
