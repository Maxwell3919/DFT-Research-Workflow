from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from tempfile import TemporaryDirectory

import numpy as np
from ase.build import add_adsorbate, bulk, surface
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
    parent_path = source_dir / "al-fcc-parent.extxyz"
    bare_slab_path = output_dir / "al111-bare-slab.extxyz"
    candidate_path = output_dir / "al111-h-ontop-candidate.extxyz"

    generated_parent = bulk("Al", "fcc", a=4.05, cubic=True)
    write(parent_path, generated_parent, format="extxyz")
    parent = read(parent_path, format="extxyz")

    bare_slab = surface(parent, (1, 1, 1), layers=3, vacuum=None, periodic=False)
    bare_slab = bare_slab.repeat((2, 2, 1))
    bare_slab.pbc = (True, True, False)
    write(bare_slab_path, bare_slab, format="extxyz")
    bare_slab = read(bare_slab_path, format="extxyz")

    candidate = bare_slab.copy()
    top_index = int(np.argmax(candidate.positions[:, 2]))
    top_position = candidate.positions[top_index, :2].copy()
    add_adsorbate(candidate, "H", height=1.5, position=top_position)
    candidate.center(vacuum=10.0, axis=2)
    candidate.info.pop("adsorbate_info", None)
    write(candidate_path, candidate, format="extxyz")
    reopened = read(candidate_path, format="extxyz")

    symbols = reopened.get_chemical_symbols()
    h_index = symbols.index("H")
    substrate_z = np.delete(reopened.positions[:, 2], h_index)
    z_min = float(reopened.positions[:, 2].min())
    z_max = float(reopened.positions[:, 2].max())
    z_extent = z_max - z_min
    cell_z = float(reopened.cell[2, 2])
    empty_length = cell_z - z_extent
    surface_area = float(np.linalg.norm(np.cross(reopened.cell[0], reopened.cell[1])))

    assert len(reopened) == len(bare_slab) + 1
    assert symbols.count("H") == 1
    assert reopened.pbc.tolist() == [True, True, False]
    assert float(reopened.positions[h_index, 2]) > float(substrate_z.max())
    assert empty_length >= 19.9
    assert np.allclose(read(bare_slab_path).cell.array, bare_slab.cell.array)

    result = {
        "origin": "generated illustrative fcc-Al parent written before the slab cut",
        "parent_file": str(parent_path.relative_to(root)),
        "bare_slab_file": str(bare_slab_path.relative_to(root)),
        "candidate_file": str(candidate_path.relative_to(root)),
        "miller_plane": [1, 1, 1],
        "lateral_repeat": [2, 2, 1],
        "layers": 3,
        "substrate_atoms": len(bare_slab),
        "total_atoms": len(reopened),
        "adsorbate": "H",
        "initial_site": "on top of the highest exported Al atom",
        "initial_adsorbate_height": 1.5,
        "cell_z": round(cell_z, 8),
        "atomic_z_extent": round(z_extent, 8),
        "empty_cell_length": round(empty_length, 8),
        "surface_area": round(surface_area, 8),
        "initial_coverage_per_area": round(1.0 / surface_area, 8),
        "periodicity": reopened.pbc.tolist(),
        "sha256": {
            str(parent_path.relative_to(root)): _sha256(parent_path),
            str(bare_slab_path.relative_to(root)): _sha256(bare_slab_path),
            str(candidate_path.relative_to(root)): _sha256(candidate_path),
        },
        "written_and_reopened": True,
        "manual_compare": "Open the parent, bare slab, and adsorbate candidate in top and side views.",
        "boundary": "generated starting candidate only; no relaxation, convergence, site preference, or adsorption energy",
    }
    (root / "summary.json").write_text(
        json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    return result


def run(workdir: str | Path | None = None) -> dict[str, object]:
    """Write, reopen, and check the structures used by the surface-model guide."""
    if workdir is not None:
        return _execute(Path(workdir))
    with TemporaryDirectory(prefix="ase-surface-candidate-") as temporary:
        return _execute(Path(temporary))


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Write and reopen an illustrative Al(111) slab and H candidate."
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
