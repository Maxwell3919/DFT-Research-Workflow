from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from tempfile import TemporaryDirectory

from pymatgen.core import Lattice, Structure
from pymatgen.transformations.site_transformations import ReplaceSiteSpeciesTransformation
from pymatgen.transformations.standard_transformations import (
    DeformStructureTransformation,
    SupercellTransformation,
)


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


def _write_cif(structure: Structure, path: Path) -> None:
    structure.to(filename=str(path))


def _execute(workdir: Path) -> dict[str, object]:
    root, source_dir, output_dir = _prepare_workdir(workdir)
    parent_path = source_dir / "li-o-parent.cif"
    supercell_path = output_dir / "li-o-supercell.cif"
    strained_path = output_dir / "li-o-strained.cif"
    substituted_path = output_dir / "na-o-substituted.cif"

    generated_parent = Structure(
        Lattice.cubic(4.0),
        ["Li", "O"],
        [[0, 0, 0], [0.5, 0.5, 0.5]],
    )
    _write_cif(generated_parent, parent_path)
    parent = Structure.from_file(str(parent_path))
    parent_copy = parent.copy()

    matrix = [[2, 0, 0], [0, 1, 0], [0, 0, 1]]
    supercell = SupercellTransformation(matrix).apply_transformation(parent)
    strained = DeformStructureTransformation(
        [[1.02, 0, 0], [0, 1.0, 0], [0, 0, 1.0]]
    ).apply_transformation(parent)
    substituted = ReplaceSiteSpeciesTransformation({0: "Na"}).apply_transformation(parent)

    _write_cif(supercell, supercell_path)
    _write_cif(strained, strained_path)
    _write_cif(substituted, substituted_path)
    reopened_parent = Structure.from_file(str(parent_path))
    reopened_supercell = Structure.from_file(str(supercell_path))
    reopened_strained = Structure.from_file(str(strained_path))
    reopened_substituted = Structure.from_file(str(substituted_path))

    assert len(reopened_supercell) == 2 * len(reopened_parent)
    assert abs(reopened_supercell.volume / reopened_parent.volume - 2.0) < 1e-6
    assert abs(reopened_strained.volume / reopened_parent.volume - 1.02) < 1e-6
    assert reopened_substituted.composition["Na"] == 1
    assert reopened_substituted.composition["Li"] == 0
    assert parent == parent_copy

    child_paths = [supercell_path, strained_path, substituted_path]
    result = {
        "origin": "generated illustrative Li/O parent written before transformation",
        "parent_file": str(parent_path.relative_to(root)),
        "child_files": [str(path.relative_to(root)) for path in child_paths],
        "parent_formula": reopened_parent.composition.reduced_formula,
        "parent_sites": len(reopened_parent),
        "supercell_matrix": matrix,
        "supercell_sites": len(reopened_supercell),
        "supercell_volume_ratio": round(reopened_supercell.volume / reopened_parent.volume, 8),
        "deformation_gradient": [[1.02, 0, 0], [0, 1.0, 0], [0, 0, 1.0]],
        "strained_volume_ratio": round(reopened_strained.volume / reopened_parent.volume, 8),
        "substitution": {"parent_site_index": 0, "from": "Li", "to": "Na"},
        "substituted_formula": reopened_substituted.composition.formula,
        "parent_preserved": parent == parent_copy,
        "sha256": {
            str(path.relative_to(root)): _sha256(path)
            for path in [parent_path, *child_paths]
        },
        "written_and_reopened": True,
        "manual_compare": "Open the parent and one child at a time; compare cell, composition, sites, and contacts.",
        "boundary": "file-backed candidate structures only; no relaxation, energy, phase, or transferability claim",
    }
    (root / "summary.json").write_text(
        json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    return result


def run(workdir: str | Path | None = None) -> dict[str, object]:
    """Write, reopen, and check the structures used by the pymatgen guide."""
    if workdir is not None:
        return _execute(Path(workdir))
    with TemporaryDirectory(prefix="pymatgen-transformations-") as temporary:
        return _execute(Path(temporary))


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Write and reopen one parent and three pymatgen descendants."
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
