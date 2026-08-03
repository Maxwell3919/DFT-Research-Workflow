---
topic_slug: optimize-structure
guide_slug: restart-and-verify-optimization
title: Restart and Verify a Structural Optimization
kind: implementation
tools:
  - ase
status: reviewed
summary: Continue an interrupted relaxation without erasing its lineage, then perform a fresh final energy-and-gradient check on the exact accepted structure.
tested_versions:
  - ASE 3.29.0
  - Python 3.12
execution_script: examples/practical-guides/optimization_restart_verification.py
source_ids:
  - ase-optimize
  - qe-pw-75
  - cp2k-geometry-cell-opt
media_ids:
  - optimization-restart-verification-chain
review: docs/reviews/2026-08-03-optimize-structure.md
reviewed_at: "2026-08-03"
---

A restart is a continuation of a traceable optimization problem, not permission to overwrite an unfinished calculation. Geometry, optimizer state, constraints, electronic restart data, software identity, and the reason for continuation must remain connected.

## Distinguish restartable objects

Several objects may be reused, and they have different compatibility requirements:

```text
last accepted structure and cell
atom ordering and constraint mapping
electronic density or wavefunction
optimizer Hessian or limited-memory history
trajectory and accepted-step log
scheduler or workflow checkpoint
```

The last structure can often seed a new calculation even when optimizer history is incompatible. An electronic restart may become invalid after a large cell, basis, symmetry, or method change. A quasi-Newton Hessian belongs to a particular coordinate representation and active subspace.

Record which objects were reused and which were rebuilt.

## Create a new segment after a meaningful change

Continue the same segment only when the scientific model, calculator, coordinate order, active variables, constraints, and optimizer representation remain compatible. Begin a new segment when changing:

- method, pseudopotential, basis, grid, occupation, or electronic-state initialization;
- optimizer family or coordinate filter;
- fixed atoms, cell constraints, or symmetry treatment;
- atom order, composition, cell convention, or active state branch;
- a structure by manual intervention.

The new segment should point to the last accepted parent frame and state why the change was required.

## Retain trajectory and optimizer history

ASE optimizers can store a trajectory and an optimizer-specific restart object:

```python
from ase.optimize import BFGS

first = BFGS(
    atoms,
    trajectory="relax.traj",
    restart="bfgs.json",
    logfile=None,
)
first.run(fmax=0.05, steps=2)

continued = BFGS(
    atoms,
    trajectory="relax.traj",
    restart="bfgs.json",
    append_trajectory=True,
    logfile=None,
)
continued.run(fmax=0.05, steps=80)
```

The executable example uses a distorted periodic Cu model with ASE's EMT calculator. It tests restart mechanics only. The force criterion and model are fixtures, not DFT recommendations.

Optimizer restart files are not necessarily portable between optimizer classes or versions. A trajectory may permit replay or reconstruction of useful history, but only when positions, forces, cell variables, and coordinate conventions are compatible.

## Verify the last accepted structure, not merely the last file

A run may stop at a rejected trial step, a failed electronic solve, a maximum-step boundary, or an incomplete file write. Identify the last structurally and electronically accepted frame from the program output and workflow state.

Before continuing, check:

- structure and cell parse correctly;
- composition, atom order, and constraints match the intended model;
- the frame belongs to the expected state branch;
- no atom collision or unintended cell jump occurred;
- restart files match the structure and software identity;
- all relevant parent outputs are complete.

A file named `FINAL`, `CONTCAR`, or similar is not sufficient evidence by itself.

## Perform a fresh final energy-and-gradient evaluation

After the optimizer reports completion, evaluate the exact final structure again with a fresh calculator or state solve under the declared verification settings. Confirm:

- active force components;
- relevant stress or pressure components;
- electronic convergence and state identity;
- cell, periodicity, constraints, and atom ordering;
- absence of new warnings;
- compatibility with the downstream method.

This check can reveal stale extrapolated states, a loosely converged last ionic step, restart incompatibility, or changes caused by the final cell update.

A fresh check does not establish dynamical stability or the global minimum. It establishes that the accepted coordinates have the reported energy-and-gradient evidence under the verification evaluator.

## Preserve failed and superseded segments

Do not delete a failed segment merely because a later continuation succeeded. Keep its inputs, outputs, trajectory, exit reason, and recovery decision. Mark it superseded for production use while preserving its causal role.

If a manual edit repairs a collision or maps atoms into a different cell convention, save both structures and the transformation. The edited object is a new child, not an invisible replacement of the failed frame.

## Separate preliminary and production relaxation

A low-cost preliminary optimization can reduce extreme forces before a more expensive method. The production relaxation should begin from a checksummed preliminary result and state which method identity changed.

Do not concatenate the energy histories as if they came from one potential-energy surface. Compare only quantities that remain method-compatible, and run the final verification with the intended production evaluator.

## What this guide verifies

The companion script deliberately interrupts a small ASE/EMT BFGS relaxation, confirms that trajectory and restart evidence exist, continues from the same compatible state, and performs a fresh final force evaluation.

It does not run DFT, validate the teaching model, establish a universal stopping criterion, prove optimizer portability, or demonstrate that the final structure is the physical or global minimum.

## Common mistakes

**Overwriting the first trajectory.** Preserve the complete path and append or link new segments.

**Reusing incompatible optimizer state.** Hessian history depends on coordinates, constraints, optimizer, and version.

**Restarting from the last written coordinates without checking acceptance.** Trial or failed steps may be present.

**Calling a restart a new independent calculation.** Preserve the causal parent and reused state.

**Skipping the fresh final evaluation.** Optimizer-internal completion should be checked on the exact final object.

## Official sources

- [ASE structure optimization, trajectories, and restart files](https://docs.ase-lib.org/ase/optimize.html)
- [Quantum ESPRESSO `pw.x` relaxation and restart controls](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [CP2K geometry and cell optimization, outputs, and restarts](https://manual.cp2k.org/trunk/methods/optimization/geometry_and_cell_opt.html)
