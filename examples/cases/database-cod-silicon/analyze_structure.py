#!/usr/bin/env python3
"""Deterministic, case-local structural inspection for the downloaded CIF."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import ase
import spglib
from ase.io import read
from ase.neighborlist import neighbor_list

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "source/9013102.cif"
OUTPUT = ROOT / "derived/9013102.analysis.json"


def main() -> None:
    atoms = read(SOURCE)
    distances = neighbor_list("d", atoms, 3.0)
    if len(distances) == 0:
        raise SystemExit("FAIL no periodic neighbour below the documented 3.0 Ang cutoff")
    dataset = spglib.get_symmetry_dataset(
        (atoms.cell.array, atoms.get_scaled_positions(), atoms.numbers), symprec=1e-3
    )
    if dataset is None:
        raise SystemExit("FAIL spglib returned no symmetry dataset")
    structure = {
        "formula": atoms.get_chemical_formula(mode="reduce"),
        "atom_count": len(atoms),
        "cell_a_ang": round(float(atoms.cell.lengths()[0]), 4),
        "cell_vectors_ang": [[round(float(value), 6) for value in row] for row in atoms.cell.array],
        "minimum_distance_ang": round(float(min(distances)), 6),
        "neighbor_cutoff_ang": 3.0,
    }
    result = {
        "source_file": "source/9013102.cif",
        "source_sha256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
        "parser": {"ase": ase.__version__, "spglib": spglib.__version__},
        "structure": structure,
        "symmetry": {"status": "PASS", "international": str(dataset.international), "number": int(dataset.number), "symprec": 0.001},
        "boundary": "This is a format and geometry inspection of the downloaded representation. It does not validate database identity, experimental provenance, stability, or a calculation.",
    }
    OUTPUT.write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print("PASS inspected CIF with case-local ASE and spglib script")
    print(f"INFO formula={structure['formula']} atoms={structure['atom_count']} space_group={dataset.international}")


if __name__ == "__main__":
    main()
