---
topic_slug: calculate-reference-ground-state
guide_slug: prepare-fixed-geometry-reference-calculation
title: Prepare a Fixed-Geometry Reference Calculation
kind: implementation
tools:
  - python
status: reviewed
summary: Convert an accepted optimization result into a fixed-geometry reference protocol while preserving model and Hamiltonian identity and recording every numerical refinement.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/reference_state_protocol_continuity.py
source_ids:
  - qe-pw-75
  - vasp-electronic-minimization
  - cp2k-scf
  - abinit-basic1
media_ids:
  - reference-protocol-continuity
review: docs/reviews/2026-08-03-calculate-reference-ground-state.md
reviewed_at: "2026-08-03"
---

A reference-state calculation begins from one exact accepted structure and one declared electronic method. The final fixed-geometry protocol should preserve that identity while allowing documented numerical refinement.

## Bind the exact final structure

Record the final geometry checksum, cell, composition, atom order, and optimization lineage. The reference calculation must consume that exact object. Reordering atoms, changing the cell representation, restoring symmetry, or editing coordinates creates a derived structure and requires a recorded transformation.

Set the calculation type to a fixed-geometry electronic-state evaluation. Forces and stress may still be requested as diagnostics, but atomic and cell variables are not silently updated.

## Separate method identity from numerical refinement

Method-defining fields include the exchange–correlation treatment, potentials or all-electron setup, dispersion correction, Hubbard parameters, relativistic treatment, charge, electrostatic boundary, and external fields.

Numerical controls such as basis size, k-point density, grids, and internal solver thresholds may be tightened for the final calculation. Record old and new values, why the refinement was made, and which observables established its adequacy.

The companion fixture uses an explicit immutable-key set and a refinement ledger:

```python
from reference_state_protocol_continuity import run

report = run()
print(report["method_identity_preserved"])
print(report["declared_refinements"])
```

A change to an immutable field fails the continuity check instead of being relabeled as a harmless refinement.

## Request verification and reusable outputs

The final protocol should request the outputs needed for the intended downstream work:

```text
total energy or declared free-energy quantity
electron count and occupations
Fermi level where meaningful
total and local magnetic diagnostics
forces and stress
charge density or potential
wavefunctions when justified
warnings and solver history
```

Output generation should follow a retention policy. Large restart objects may remain in calculation storage while the public or archival record retains hashes, identifiers, and reconstruction paths.

## Preserve the optimization-to-reference edge

A minimal lineage record contains:

```text
optimization final-structure checksum
reference calculation identifier
fixed-geometry declaration
method-identity comparison
declared numerical refinements
fresh or restart initialization
software and environment identity
```

This edge prevents the later reference calculation from becoming an untraceable replacement for the optimization result.

## What this guide verifies

The companion script checks deterministic protocol records. It verifies one exact structure checksum, fixed geometry, preserved method and potential identity, unchanged charge and boundary fields, and a declared refinement of selected numerical controls.

It does not run a DFT code, calculate an electronic state, validate the fixture settings, or establish that the resulting protocol would produce a ground state.

## Common mistakes

**Using the last relaxation step as the final reference.** Create an independently identified fixed-geometry calculation.

**Changing a potential or Hamiltonian parameter silently.** That creates a new method branch.

**Treating tighter settings as automatically compatible.** Recheck state identity and the observable used to justify refinement.

**Losing atom order or structure identity.** Bind the exact geometry checksum and mapping.

## Official sources

- [Quantum ESPRESSO `pw.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [VASP electronic minimization](https://vasp.at/wiki/Electronic_minimization)
- [CP2K SCF section](https://manual.cp2k.org/trunk/CP2K_INPUT/FORCE_EVAL/DFT/SCF.html)
- [ABINIT basic ground-state tutorial](https://docs.abinit.org/tutorial/base1/)