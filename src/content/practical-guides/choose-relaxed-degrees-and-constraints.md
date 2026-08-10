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
media_ids: []
review: docs/reviews/2026-08-03-optimize-structure.md
reviewed_at: "2026-08-03"
---

A relaxation protocol begins with a declaration of active variables. “Relax the structure” is ambiguous until the atomic coordinates, cell components, constraints, symmetry treatment, and external stress condition are specified.

## Mark the movable model before choosing the run mode

Open the source structure and the computational model in a GUI viewer from the [visualization and symmetry resource index](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry). Rotate the cell, show periodic images, and identify vacuum, surfaces, interfaces, defect neighborhoods, and any atoms that represent a fixed support. Measure suspicious short contacts. Write down, atom by atom and cell component by cell component, what may move and what must remain fixed.

Open the actual input beside the viewer. Match every atom and lattice vector to the intended constraint map; verify units, atom order, coordinate convention, symmetry, and boundary conditions. Decide whether the question requires fixed-cell relaxation, variable-cell relaxation, or a deliberately restricted subspace. Then run one bounded step or short pilot through the normal executable or scheduler and reopen the produced structure. Check that the observed displacement and cell change match the declared degrees of freedom before committing expensive resources.

During the production run, compare start, intermediate accepted frames, and the endpoint with the same display settings. Audit every free Cartesian force component and every active stress component, not only an aggregate norm or a final marker. A visually stationary atom can still carry an unacceptable free force; a visually attractive endpoint can still violate the numerical criterion or the scientific model.

The stored script later on reconstructs a bounded QE example and is optional automation after this manual map has been checked. It does not demonstrate a universal constraint choice or a variable-cell acceptance rule. For other implementations, use the [code and manual index](/DFT-Research-Workflow/operations/resource-landscape/#electronic-structure-codes) to open the authoritative constraint and cell-optimization reference.

## Start with the stored Silicon input and output

The bounded case reads the exact input `examples/practical-guides/data/silicon-qe/relax/si-relax.in` and output `examples/practical-guides/data/silicon-qe/relax/si-relax.out`. Inspect those objects before running the companion:

```bash
relax_in=examples/practical-guides/data/silicon-qe/relax/si-relax.in
relax_out=examples/practical-guides/data/silicon-qe/relax/si-relax.out
test -f "$relax_in"
test -f "$relax_out"

grep -En 'calculation|forc_conv_thr|nstep|ion_dynamics' -- "$relax_in"
sed -n '/^ATOMIC_POSITIONS/,/^K_POINTS/p' "$relax_in"
test "$(grep -cF 'Program PWSCF v.' -- "$relax_out")" -eq 1
test "$(grep -cF 'JOB DONE.' -- "$relax_out")" -eq 1
grep -cF 'convergence has been achieved' -- "$relax_out"
grep -F 'End of BFGS Geometry Optimization' -- "$relax_out"

awk '
  /Forces acting on atoms/ {block=$0 ORS; inside=1; next}
  inside {block=block $0 ORS}
  inside && /Total force =/ {last=block; inside=0}
  END {if (last == "") exit 1; printf "%s", last}
' "$relax_out"

awk '
  /Begin final coordinates/ {block=$0 ORS; inside=1; next}
  inside {block=block $0 ORS}
  inside && /End final coordinates/ {last=block; inside=0}
  END {if (last == "") exit 1; printf "%s", last}
' "$relax_out"
```

The input has no explicit `if_pos` columns, so verify the documented default and treat all printed Cartesian components as active for this bounded case. The final complete force block exposes every component; its aggregate `Total force` remains a separate diagnostic. This fixed-cell input does not request a cell move and the output contains no stress history, so it cannot support a stress or variable-cell gate.

`JOB DONE.` checks normal program termination only. The literal electronic-convergence marker occurs five times, but the manual count does not claim a one-to-one mapping between those markers and ionic force evaluations. The BFGS marker records the optimizer's stopping condition; it does not establish that the active subspace was scientifically appropriate or that another start could not reach a lower state.

After the input, final geometry, and final complete force block are intelligible, run the optional companion reconstruction:

```bash
python3 examples/practical-guides/silicon_qe_relax.py
```

Use the input to decide which variables were active, then compare the initial and final cell and coordinates. If the executed motion differs from the declared subspace, reject the run as the wrong model. If it agrees, continue to force/state diagnosis rather than declaring the structure accepted from the marker alone.

## Actual fixed-cell Silicon case

The published QE 7.5 input declares an intentionally displaced two-site COD
9013102 Silicon cell, `calculation='relax'`, fixed cell vectors, and two active
sites. The companion verifies the exact input and output hashes, five energy and
total-force rows, and the `JOB DONE` and BFGS completion markers. It does not test
a constraint, variable cell, alternative basin, or the physical adequacy of the
declared active subspace.

## Map the active subspace before execution

Before generating code-specific input, write down whether all atoms or only selected atoms and Cartesian components may move; whether cell volume, shape, and angles are fixed, active, or restricted; the external pressure or stress target and convention; whether symmetry is detected, imposed, or released; the stable identities of constrained atoms and components; and which nonperiodic directions the boundary model keeps fixed.

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

The following ASE `FixAtoms` snippet is a conceptual implementation example for
a deliberately distorted Cu teaching model. It is not executed by the declared
companion and supplies no evidence about the stored QE case:

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

`silicon_qe_relax.py` verifies the input/output hashes, `JOB DONE` and BFGS
markers, five literal electronic-convergence markers, five parsed energy/total-force
pairs, and that the last reported total force is lower than the first. The marker
count is not a step-by-step mapping. The script does not execute the conceptual ASE
constraint or validate variable-cell behavior, a force threshold, or a physical
minimum.

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
