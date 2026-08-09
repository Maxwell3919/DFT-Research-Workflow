---
topic_slug: build-or-modify-computational-model
guide_slug: construct-defect-and-interface-candidates
title: Construct Defect and Interface Candidates without Overclaiming Them
kind: worked-example
tools:
  - ase
  - pymatgen
status: reviewed
summary: Rebuild one unrelaxed Silicon one-site-deletion candidate without an encoded charge state and one imposed-common-cell graphene/h-BN bilayer, then check their lineage before any DFT calculation.
tested_versions:
  - ASE 3.29.0
  - pymatgen-core 2026.7.31
  - Python 3.12
execution_script: examples/practical-guides/structure_defect_interface_candidates.py
source_ids:
  - ase-building
  - pymatgen-core-docs
media_ids:
  - structure-defect-interface-candidates
review: docs/reviews/2026-08-05-structure-candidate-construction.md
reviewed_at: "2026-08-05"
---

The smallest useful structure-operation record is not a screenshot of atoms. It is a reconstructable parent, an explicit transformation, exported calculation structures, before/after metrics, and a claim boundary. This worked example keeps those records for two candidate-building operations in one terminal-first case.

## Start from the recorded case directory

```text
examples/cases/structure-defect-interface-candidates/
├── source/
├── input/
├── output/
├── derived/
├── figures/
├── run.sh
├── check.sh
├── extract.sh
├── parse.py
└── manifest.json
```

The Silicon branch begins with an eight-atom conventional diamond cell, repeats it to a 64-atom `2×2×2` parent, and removes the explicitly recorded site at fractional coordinate `[0, 0, 0]`. The resulting 63-atom file is an unrelaxed one-site-deletion vacancy *candidate* with no encoded charge state. The geometry alone does not define a charged or neutral defect model.

The interface branch creates eight C atoms and an eight-atom alternating B/N layer in one imposed in-plane cell. The layers are separated by `3.35 Å` and use `pbc = [true, true, false]`. The reported `0.0%` in-plane mismatch is a construction constraint caused by assigning both layers the same coordinates; it is not a lattice-match prediction.

## Rebuild outside the repository

Use a new empty directory so the committed evidence is never overwritten:

```bash
mkdir /tmp/structure-candidate-run
CASE_RUN_ROOT=/tmp/structure-candidate-run \
  PYTHON=python3 \
  bash examples/cases/structure-defect-interface-candidates/run.sh
```

The recorded stdout is intentionally short and machine-readable:

```text
{"imposed_inplane_mismatch_percent": 0.0, "interface_candidate_atoms": 16, "interlayer_separation_ang": 3.35, "status": "PASS", "vacancy_candidate_atoms": 63, "vacancy_parent_atoms": 64}
```

Inspect the structures and metrics as text before looking at the rendered projection:

```bash
sed -n '1,12p' examples/cases/structure-defect-interface-candidates/output/si-2x2x2-vacancy.xyz
sed -n '1,12p' examples/cases/structure-defect-interface-candidates/output/graphene-hbn-bilayer.xyz
python3 -m json.tool examples/cases/structure-defect-interface-candidates/derived/structure-candidates-report.json
```

## Run the two acceptance layers

The case-level check verifies required files, the 64→63 deletion, the 16-atom bilayer, periodicity, separation, and the independent pymatgen materialization:

```bash
bash examples/cases/structure-defect-interface-candidates/check.sh
```

The page companion independently re-hashes every manifest artifact and rechecks the recorded metrics without regenerating public evidence:

```bash
python3 examples/practical-guides/structure_defect_interface_candidates.py
```

The construction and checking scripts complete and the expected manifest-bound artifacts and recorded metrics are present. This establishes bounded program-level script completion and artifact identity for the exported candidates. It does not assess DFT numerical convergence because no electronic solver or structural optimizer was run. It does not establish physical stability, and it supports no material-level claim. The PNG is only a projection of the exported structures.

## What this example does not establish

This example does not establish a vacancy formation energy, charge state, concentration, relaxed defect geometry, interface adhesion, stable registry, strain accommodation, band alignment, or any material-level conclusion. The [ASE build documentation](https://docs.ase-lib.org/ase/build/build.html) and [pymatgen core documentation](https://pymatgen.org/pymatgen.core.html) define the software interfaces used here; they do not validate this candidate geometry.

## Official sources

- [ASE build documentation](https://docs.ase-lib.org/ase/build/build.html)
- [pymatgen core documentation](https://pymatgen.org/pymatgen.core.html)
