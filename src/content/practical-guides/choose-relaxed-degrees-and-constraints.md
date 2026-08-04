---
topic_slug: optimize-structure
guide_slug: choose-relaxed-degrees-and-constraints
title: Choose Relaxed Degrees of Freedom and Constraints
kind: implementation
tools:
  - ase
  - quantum-espresso
status: reviewed
summary: Define which atomic and cell variables may change, express constraints explicitly, and verify that the executed optimization respects the intended active subspace.
tested_versions:
  - ASE 3.29.0
  - Python 3.12
execution_script: examples/practical-guides/silicon_qe_relax.py
source_ids:
  - ase-optimize
  - ase-constraints
  - ase-filters
  - vasp-isif
  - cp2k-geometry-cell-opt
  - cod-9013102
media_ids:
  - optimization-degrees-constraint-map
review: docs/reviews/2026-08-03-optimize-structure.md
reviewed_at: "2026-08-03"
---

A relaxation protocol begins with a declaration of active variables. “Relax the structure” is ambiguous until the atomic coordinates, cell components, constraints, symmetry treatment, and external stress condition are specified.

## Actual fixed-cell Silicon case

The accompanying QE 7.5 run starts from an intentionally displaced two-site
COD 9013102 Silicon primitive cell. Its `calculation='relax'` input uses BFGS,
keeps all cell vectors fixed, and leaves both atomic sites active. The committed
output and input have SHA-256 checks, so this is an actual executed degree-of-
freedom declaration rather than an invented trajectory. It does not test a
constraint, variable cell, or alternative starting basin.

## Map the active subspace before execution

Write a short degree-of-freedom record before generating code-specific input:

```text
atomic positions: all / selected atoms / selected Cartesian components
cell volume: fixed / active
cell shape: fixed / active / restricted
cell angles: fixed / active
external pressure or stress: declared value and convention
symmetry: detected / imposed / released
constraints: stable atom and component identities
nonperiodic directions: fixed by boundary model
```

This record should agree with the actual code input. A selective-dynamics flag, fixed-atom list, cell filter, or symmetry option that is absent from the record is an undeclared model assumption.

## Distinguish common optimization problems

**Positions only.** The lattice is fixed while active atomic coordinates move. This is appropriate for molecules in a chosen numerical box, atoms in an established bulk cell, strained materials, and many slab calculations.

**Full variable cell.** Atomic coordinates, cell shape, and volume respond to a declared stress condition. This is a different physical problem from positions-only relaxation.

**Restricted cell.** Only selected lattice directions, shape components, or volume changes are permitted. This is often necessary for epitaxial strain, coherent interfaces, two-dimensional materials, and fixed-volume studies.

**Constrained atoms or coordinates.** A subset of atomic motion is removed to represent a substrate, rigid region, reaction coordinate, or screening approximation. The stationary result applies only to the active subspace.

## Keep vacuum and imposed strain out of unintended cell motion

For a slab or monolayer, the nonperiodic cell length is normally a convergence and electrostatic-boundary parameter. It is not a physical lattice coordinate with an equilibrium value. A general cell optimizer can shrink or expand vacuum unless the relevant component is fixed.

Likewise, a coherent film or interface may intentionally inherit in-plane strain. Releasing those lattice vectors changes the model from constrained epitaxy to a free-standing structure. Record strain allocation and permitted cell components before relaxation.

## Express atomic constraints with stable identities

The executable example uses ASE `FixAtoms` on one atom of a deliberately distorted periodic Cu teaching model:

```python
from ase.build import bulk
from ase.calculators.emt import EMT
from ase.constraints import FixAtoms
from ase.optimize import BFGS

atoms = bulk("Cu", "fcc", a=3.6, cubic=True)
atoms.positions[1] += [0.18, -0.12, 0.08]
atoms.set_constraint(FixAtoms(indices=[0]))
atoms.calc = EMT()

optimizer = BFGS(atoms, logfile=None)
optimizer.run(fmax=0.05, steps=80)
```

The numerical value of `fmax` and the Cu/EMT model are test fixtures. They are not DFT settings or recommendations.

Index-based constraints are fragile if atom ordering changes. Preserve a mapping from source atom identity to executable index, and validate it after conversion, sorting, supercell generation, or restart. A geometric selection such as “bottom two layers” should be materialized into a recorded atom list rather than reevaluated silently after the structure moves.

## Treat cell filters as coordinate transformations

ASE optimizers act directly on atomic positions. Cell optimization is exposed through filter objects that present cell variables to the optimizer. Other codes use keywords such as `ISIF`, `vc-relax`, or `CELL_OPT` to define related active variables. These interfaces are implementations of the declared optimization problem, not interchangeable defaults.

For cell motion, verify:

- which strain components are exposed;
- how atomic coordinates transform with the cell;
- what stress sign and unit convention is used;
- whether symmetry or volume restrictions are active;
- whether the nonperiodic direction is excluded;
- whether the basis or real-space grid changes discontinuously with the cell.

## Verify the executed active subspace

Do not rely only on input text. Compare the initial and final objects:

- constrained coordinates must remain unchanged within representation precision;
- permitted coordinates should be capable of moving;
- the cell must remain identical in a fixed-cell run;
- only declared cell components may change in a restricted-cell run;
- the atom order, composition, periodicity, and constraint mapping must remain consistent.

If a supposedly fixed atom moved, or a vacuum vector changed, the optimization executed a different model from the intended one.

## What this guide verifies

`silicon_qe_relax.py` reconstructs the actual QE output, verifies the input/output
hashes, five electronic completions and the BFGS completion marker. The retained
ASE fixture illustrates an explicit fixed-atom constraint. Neither example sets
a universal force threshold, validates variable-cell behavior, or proves a
physical minimum.

## Common mistakes

**Using a fully variable cell for every periodic system.** Select only the cell variables required by the physical question.

**Allowing vacuum to relax.** Nonperiodic empty space is normally a boundary parameter.

**Keeping hidden selective-dynamics flags.** Constraints belong to model identity and provenance.

**Assuming constrained convergence means unconstrained stability.** The optimizer tests only the active subspace.

**Using atom indices without a mapping.** Reordering can silently constrain the wrong sites.

## Official sources

- [ASE structure optimization](https://docs.ase-lib.org/ase/optimize.html)
- [ASE constraints](https://docs.ase-lib.org/ase/constraints.html)
- [ASE filters for cell degrees of freedom](https://docs.ase-lib.org/ase/filters.html)
- [VASP `ISIF` degrees of freedom](https://vasp.at/wiki/ISIF)
- [CP2K geometry and cell optimization](https://manual.cp2k.org/trunk/methods/optimization/geometry_and_cell_opt.html)
- [Crystallography Open Database entry 9013102](https://www.crystallography.net/cod/9013102.html)
