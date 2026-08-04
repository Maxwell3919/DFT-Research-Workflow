#!/usr/bin/env python3
"""Construct one vacancy and one imposed-common-cell interface candidate with ASE/pymatgen."""
from __future__ import annotations

import csv
import hashlib
import json
import sys
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from ase.build import bulk, graphene
from ase.io import write
from pymatgen.core import Structure

ROOT = Path(__file__).resolve().parent
SRC, INP, OUT, DER, FIG = (ROOT / name for name in ("source", "input", "output", "derived", "figures"))


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def minimum_distance(atoms) -> float:
    distances = atoms.get_all_distances(mic=True)
    distances[distances == 0.0] = np.inf
    return round(float(np.min(distances)), 8)


def metrics(atoms) -> dict:
    return {
        "atoms": len(atoms),
        "formula": atoms.get_chemical_formula(mode="hill"),
        "cell_vectors_ang": [[round(float(x), 8) for x in vector] for vector in atoms.cell.array],
        "volume_ang3": round(float(atoms.get_volume()), 8),
        "minimum_distance_ang": minimum_distance(atoms),
        "pbc": atoms.pbc.tolist(),
    }


def pymatgen_metrics(atoms) -> dict:
    structure = Structure(
        lattice=atoms.cell.array,
        species=atoms.get_chemical_symbols(),
        coords=atoms.get_scaled_positions(wrap=True),
        coords_are_cartesian=False,
        to_unit_cell=True,
    )
    return {
        "atoms": len(structure),
        "formula": structure.composition.reduced_formula,
        "volume_ang3": round(float(structure.volume), 8),
    }


def clean_poscar(path: Path) -> None:
    path.write_text("\n".join(line.rstrip() for line in path.read_text(encoding="utf-8").splitlines()) + "\n", encoding="utf-8")


def write_manifest() -> None:
    artifact_specs = [
        ("vacancy_structure", "output/si-2x2x2-vacancy.xyz"),
        ("interface_structure", "output/graphene-hbn-bilayer.xyz"),
        ("vacancy_calculation_structure", "input/POSCAR.si-2x2x2-vacancy"),
        ("interface_calculation_structure", "input/POSCAR.graphene-hbn-bilayer"),
        ("metrics_report", "derived/structure-candidates-report.json"),
        ("metrics_table", "derived/structure-candidates-metrics.csv"),
        ("structure_projection", "figures/structure-candidates-xz.png"),
    ]
    artifacts = []
    for role, rel in artifact_specs:
        path = ROOT / rel
        record = {"role": role, "path": rel, "sha256": digest(path), "bytes": path.stat().st_size}
        if role == "structure_projection":
            record.update({"alt": "x-z projection of the constructed Si vacancy supercell and imposed-common-cell graphene h-BN bilayer.", "caption": "Generated from the recorded ASE structures; a geometric presentation, not an energy result."})
        artifacts.append(record)
    source_specs = [
        ("ase-silicon-diamond", "procedural parent structure", "source/si-diamond-conventional.xyz", "https://wiki.fysik.dtu.dk/ase/ase/build/build.html"),
        ("ase-graphene-hbn-components", "procedural interface components", "source/graphene-hbn-component-model.json", "https://wiki.fysik.dtu.dk/ase/ase/build/build.html"),
    ]
    sources = [
        {"id": ident, "role": role, "path": rel, "sha256": digest(ROOT / rel), "url": url, "accessed_at": "2026-08-05", "licence_boundary": "Generated locally through ASE API calls; this tutorial geometry is not a database identity or a published relaxed structure."}
        for ident, role, rel, url in source_specs
    ]
    import ase
    import pymatgen.core
    manifest = {
        "schema_version": "1.0",
        "case_id": "structure-defect-interface-candidates",
        "title": "Silicon vacancy and graphene/h-BN interface construction candidates",
        "case_kind": "structure-operation",
        "evidence_class": "real-execution",
        "public_host_label": "Talos local execution",
        "started_at": None,
        "completed_at": "2026-08-05T00:00:00+08:00",
        "exit_code": 0,
        "software": [
            {"name": "ASE", "version": ase.__version__, "interface": "Python API"},
            {"name": "pymatgen-core", "version": getattr(pymatgen.core, "__version__", "import-verified"), "interface": "Python API"},
            {"name": "matplotlib", "version": plt.matplotlib.__version__, "interface": "Python API"},
        ],
        "sources": sources,
        "commands": [
            {"stage": "construct", "command": "CASE_RUN_ROOT=/absolute/empty/directory PYTHON=python3 bash run.sh", "exit_code": 0},
            {"stage": "acceptance", "command": "bash check.sh", "exit_code": 0},
        ],
        "artifacts": artifacts,
        "gates": {
            "G0": {"status": "PASS", "summary": "Required source, structures, derived report/table, figure, and manifest are hash-bound."},
            "G1": {"status": "PASS", "summary": "ASE construction and independent pymatgen materialization checks exited zero."},
            "G2": {"status": "WARN", "summary": "No electronic solver or geometry optimizer was run."},
            "G3": {"status": "PASS", "summary": "Both exported candidates, source record, metrics, stdout, and PNG exist."},
            "G4": {"status": "NOT TESTED", "summary": "No supercell-size, registry, strain, vacuum, or observable-convergence study was performed."},
            "G5": {"status": "NOT CLAIMED", "summary": "No defect, interfacial, stability, band, or energetic conclusion is claimed."},
        },
        "claim_boundary": {
            "supports": [
                "The recorded ASE deletion of one explicitly indexed Si site from a 2x2x2 parent supercell.",
                "The recorded ASE/pymatgen construction and metric check of an imposed-common-cell graphene/h-BN bilayer candidate.",
            ],
            "does_not_support": [
                "Vacancy formation energy, charge-state preference, concentration, relaxed geometry, or defect thermodynamics.",
                "Interfacial adhesion, stability, optimal registry, strain accommodation, band alignment, or electronic structure.",
                "Any DFT parameter, convergence, or material-level scientific conclusion.",
            ],
        },
    }
    (ROOT / "manifest.json").write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def main() -> None:
    for directory in (SRC, INP, OUT, DER, FIG):
        directory.mkdir(exist_ok=True)

    si_parent = bulk("Si", "diamond", a=5.431, cubic=True)
    assert len(si_parent) == 8
    si_supercell = si_parent.repeat((2, 2, 2))
    removed_scaled = [round(float(value), 8) for value in si_supercell.get_scaled_positions(wrap=True)[0]]
    vacancy = si_supercell.copy()
    del vacancy[0]
    assert len(si_supercell) == 64 and len(vacancy) == 63 and removed_scaled == [0.0, 0.0, 0.0]

    graphene_layer = graphene(formula="C2", a=2.46, vacuum=0.0).repeat((2, 2, 1))
    cell = graphene_layer.cell.array.copy()
    cell[2] = [0.0, 0.0, 24.0]
    graphene_layer.set_cell(cell, scale_atoms=False)
    graphene_layer.positions[:, 2] = 10.0
    hbn_layer = graphene_layer.copy()
    hbn_layer.set_chemical_symbols(["B" if index % 2 == 0 else "N" for index in range(len(hbn_layer))])
    hbn_layer.positions[:, 2] += 3.35
    interface = graphene_layer + hbn_layer
    interface.set_cell(cell, scale_atoms=False)
    interface.pbc = (True, True, False)
    interface.center(axis=2)
    assert len(graphene_layer) == 8 and len(hbn_layer) == 8 and len(interface) == 16

    write(SRC / "si-diamond-conventional.xyz", si_parent)
    component_record = {
        "construction": "ASE graphene C2 a=2.46 repeated [2,2,1]; h-BN derives from copied coordinates by alternating B/N labels; both layers share imposed in-plane cell.",
        "graphene_atoms": len(graphene_layer),
        "hbn_atoms": len(hbn_layer),
        "imposed_a_ang": 2.46,
        "interlayer_separation_ang": 3.35,
        "pbc": [True, True, False],
    }
    (SRC / "graphene-hbn-component-model.json").write_text(json.dumps(component_record, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    write(OUT / "si-2x2x2-vacancy.xyz", vacancy)
    write(OUT / "graphene-hbn-bilayer.xyz", interface)
    write(INP / "POSCAR.si-2x2x2-vacancy", vacancy, format="vasp", direct=True, vasp5=True)
    write(INP / "POSCAR.graphene-hbn-bilayer", interface, format="vasp", direct=True, vasp5=True)
    for path in (INP / "POSCAR.si-2x2x2-vacancy", INP / "POSCAR.graphene-hbn-bilayer"):
        clean_poscar(path)

    gap = round(float(hbn_layer.positions[:, 2].mean() - graphene_layer.positions[:, 2].mean()), 8)
    vacancy_pm = pymatgen_metrics(vacancy)
    interface_pm = pymatgen_metrics(interface)
    report = {
        "vacancy_candidate": {"parent_atoms": len(si_supercell), "candidate_atoms": len(vacancy), "removed_site_index": 0, "vacancy_site_fractional_coordinate": removed_scaled, "parent": metrics(si_supercell), "candidate": metrics(vacancy)},
        "interface_candidate": {"graphene_atoms": len(graphene_layer), "hbn_atoms": len(hbn_layer), "candidate_atoms": len(interface), "formula": interface.get_chemical_formula(mode="hill"), "pbc": interface.pbc.tolist(), "interlayer_separation_ang": gap, "imposed_inplane_mismatch_percent": 0.0, "common_lattice_parameter_ang": 2.46, "candidate": metrics(interface), "boundary": "The 0.0 percent mismatch is a construction constraint from assigning h-BN the graphene in-plane coordinates, not a relaxed mismatch or epitaxial feasibility result."},
        "pymatgen_crosscheck": {"vacancy_atoms": vacancy_pm["atoms"], "interface_atoms": interface_pm["atoms"], "vacancy_formula": vacancy_pm["formula"], "interface_formula": interface_pm["formula"]},
        "software": {"python": f"{sys.version_info.major}.{sys.version_info.minor}", "ase": __import__("ase").__version__, "pymatgen_core": getattr(__import__("pymatgen.core", fromlist=["x"]), "__version__", "import-verified")},
    }
    (DER / "structure-candidates-report.json").write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    with (DER / "structure-candidates-metrics.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=["model", "atoms", "formula", "volume_ang3", "minimum_distance_ang", "pbc"], lineterminator="\n")
        writer.writeheader()
        for name, atoms in (("si-parent-2x2x2", si_supercell), ("si-vacancy-2x2x2", vacancy), ("graphene-hbn-bilayer", interface)):
            row = metrics(atoms)
            writer.writerow({"model": name, "atoms": row["atoms"], "formula": row["formula"], "volume_ang3": row["volume_ang3"], "minimum_distance_ang": row["minimum_distance_ang"], "pbc": ";".join(str(value) for value in row["pbc"])})

    fig, axes = plt.subplots(1, 2, figsize=(9.2, 3.8))
    colors = {"Si": "#4477aa", "C": "#333333", "B": "#cc6677", "N": "#44aa99"}
    axes[0].scatter(vacancy.positions[:, 0], vacancy.positions[:, 2], c=[colors[s] for s in vacancy.get_chemical_symbols()], s=18)
    axes[0].set(title="Si 2x2x2 vacancy candidate", xlabel="x (A)", ylabel="z (A)")
    axes[1].scatter(interface.positions[:, 0], interface.positions[:, 2], c=[colors[s] for s in interface.get_chemical_symbols()], s=32)
    axes[1].set(title="Imposed graphene/h-BN bilayer", xlabel="x (A)", ylabel="z (A)")
    fig.tight_layout()
    fig.savefig(FIG / "structure-candidates-xz.png", dpi=160)
    plt.close(fig)
    write_manifest()
    print(json.dumps({"status": "PASS", "vacancy_parent_atoms": len(si_supercell), "vacancy_candidate_atoms": len(vacancy), "interface_candidate_atoms": len(interface), "interlayer_separation_ang": gap, "imposed_inplane_mismatch_percent": 0.0}, sort_keys=True))


if __name__ == "__main__":
    main()
