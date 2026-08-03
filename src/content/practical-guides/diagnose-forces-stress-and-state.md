---
topic_slug: optimize-structure
guide_slug: diagnose-forces-stress-and-state
title: Diagnose Forces, Stress, and Electronic-State Continuity
kind: implementation
tools:
  - python
status: reviewed
summary: Read an optimization history as coupled evidence from force, stress, displacement, electronic convergence, and state identity instead of trusting one stop message.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/optimization_history_diagnostics.py
source_ids:
  - qe-pw-75
  - vasp-structure-optimization
  - cp2k-geometry-cell-opt
  - pulay-force-paper
  - nielsen-martin-stress
media_ids:
  - optimization-history-diagnostics
review: docs/reviews/2026-08-03-optimize-structure.md
reviewed_at: "2026-08-03"
---

An optimization trajectory is a sequence of coupled electronic and structural calculations. A final “converged” line is interpretable only when the forces or stress are trustworthy, the active stopping conditions are satisfied, and the calculations remain on the intended electronic and magnetic branch.

## Record one row for every accepted structural step

A useful optimization table contains more than energy:

```text
step and segment identity
structure checksum or trajectory frame
energy or enthalpy
maximum and RMS active force
relevant stress or pressure components
maximum displacement or strain step
electronic residual and iteration count
total and local magnetic moments
occupation or charge-state label
symmetry and active constraints
warnings and recovery events
```

Keep rejected line-search points or failed electronic steps distinguishable from accepted optimizer steps. Otherwise an energy or force plot can mix objects that did not participate in the same path.

## Separate electronic and structural criteria

An electronic threshold controls the state evaluator within one geometry. An ionic threshold controls the gradient or step across geometries. Reaching the first does not imply the second, and a noisy electronic solve can make the second unreliable.

The executable teaching fixture applies three independent checks:

```python
from optimization_history_diagnostics import analyse_history

report = analyse_history()
print(report["accepted_branch"])
print(report["state_switches"])
```

It requires each accepted structural step to carry a successful electronic-state label, a maximum active force, the relevant stress diagnostic, and a consistent state identity.

## Examine force and stress in the active subspace

For positions-only relaxation, inspect forces after applying the declared constraints. Also preserve unconstrained or reaction forces where they are scientifically relevant, because a fixed region can carry substantial load even though those components do not drive the optimizer.

For cell relaxation, inspect the stress components that correspond to active strain variables. Scalar pressure alone cannot diagnose an anisotropic shape optimization. Confirm code sign and unit conventions before comparing to an external stress target.

Force and stress thresholds are downstream-use decisions. This page does not define one generally sufficient numerical value.

## Track state identity as a categorical observable

A smooth geometry path can cross between electronic solutions. Track magnetic order, total and local moments, occupation pattern, charge localization, spin direction, symmetry, and any constraints that identify the intended branch.

The synthetic history includes a second series that changes its state label partway through. The analysis rejects a single convergence interpretation for that series even though its last force value is small. A discontinuity cannot be repaired by averaging adjacent points or fitting a smooth tail.

Useful recovery tests include:

- restart from the last pre-switch structure with a controlled electronic initialization;
- repeat a selected geometry from independent charge or magnetic starts;
- compare energies and forces of the competing branches at the same structure;
- split the optimization into separately identified state lineages.

## Detect noise, stalls, and false progress

A falling energy can coexist with force oscillation. A small displacement can result from a small trust radius rather than proximity to a stationary point. Repeated SCF difficulty can make quasi-Newton curvature information unreliable. A variable-cell path may show grid-induced energy or stress jumps.

Flag patterns such as:

- force or stress alternating without a decreasing envelope;
- many steps with almost unchanged coordinates but gradients above the criterion;
- abrupt changes in electronic iterations or state labels;
- sudden cell-volume or angle jumps;
- energy discontinuities correlated with basis or grid changes;
- maximum-step termination before all active criteria are satisfied.

The correct response may be to improve the model or state evaluator, not merely to change the optimizer.

## Interpret energy changes carefully

Local optimizers use gradients, approximate curvature, line searches, damping, or trust regions. An intermediate energy increase does not automatically invalidate the path. Conversely, a small energy change does not prove that all force components are small.

Near a claimed final structure, verify consistency among energy, force, stress, displacement, and state. Where derivatives will feed sensitive downstream calculations, repeat a fresh energy-and-gradient evaluation rather than relying only on optimizer-internal values.

## Preserve segment and recovery boundaries

Wall-time restarts, optimizer changes, tighter electronic settings, changed constraints, and manual structure edits create new trajectory segments. Link them explicitly:

```text
previous accepted frame
reason for restart or intervention
old and new evaluator identity
old and new optimizer identity
compatible state reused
first verified frame of the new segment
```

A plot may display the segments together, but it should not conceal their different settings or imply a single uninterrupted method.

## What this guide verifies

The companion script analyses deterministic synthetic histories. It confirms one branch only when all declared force, stress, electronic, and state-continuity checks are satisfied, and it identifies a state switch in a second branch.

It does not run an electronic-structure code, calculate forces or stress, validate a stopping threshold, or establish that any structure is a local or global minimum.

## Common mistakes

**Plotting total energy alone.** The optimizer is driven by active gradients, and cell motion requires stress evidence.

**Treating an SCF-converged step as a relaxed structure.** Electronic and structural criteria are different.

**Ignoring magnetic or charge-state changes.** A state switch changes the surface being optimized.

**Calling maximum-step termination convergence.** It only records that the iteration budget ended.

**Merging recovery segments without settings.** Preserve every change to the evaluator or optimizer.

## Official sources and primary papers

- [Quantum ESPRESSO `pw.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [VASP structure optimization](https://vasp.at/wiki/Structure_optimization)
- [CP2K geometry and cell optimization](https://manual.cp2k.org/trunk/methods/optimization/geometry_and_cell_opt.html)
- [Pulay, force derivatives and equilibrium geometry](https://doi.org/10.1080/00268976900100941)
- [Nielsen and Martin, stress and forces in solids](https://doi.org/10.1103/PhysRevB.32.3780)
