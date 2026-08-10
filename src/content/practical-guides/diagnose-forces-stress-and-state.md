---
topic_slug: optimize-structure
guide_slug: diagnose-forces-stress-and-state
title: Diagnose Forces, Stress, and Electronic-State Continuity
kind: implementation
tools:
  - quantum-espresso
  - python
status: reviewed
summary: Read an optimization history as coupled evidence from force, stress, displacement, electronic convergence, and state identity instead of trusting one stop message.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/silicon_qe_relax.py
source_ids:
  - qe-pw-75
  - vasp-structure-optimization
  - cp2k-geometry-cell-opt
  - pulay-force-paper
  - nielsen-martin-stress
  - cod-9013102
media_ids:
  - silicon-qe-relax-force
  - silicon-qe-relax-scf-history
review: docs/reviews/2026-08-03-optimize-structure.md
reviewed_at: "2026-08-03"
---

An optimization trajectory is a sequence of coupled electronic and structural calculations. A final “converged” line is interpretable only when the forces or stress are trustworthy, the active stopping conditions are satisfied, and the calculations remain on the intended electronic and magnetic branch.

## Look at the trajectory and the histories together

Open the initial structure, several accepted intermediate frames, the first suspicious frame, and the final or last accepted frame in the same viewer. Keep cell display, periodic images, atom radii, and orientation fixed so that apparent motion is not a rendering change. Look for collisions, broken coordination, vacuum collapse, a sudden cell jump, layer inversion, atom swapping, reconstruction, or motion inconsistent with declared constraints. The [visualization and symmetry index](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry) gives suitable GUI and library routes.

Next, align that visual trajectory with the text history. For every accepted ionic step, inspect the electronic iteration history, every free Cartesian force component, stress components when the cell is active, displacement, energy or enthalpy, state diagnostics, warnings, and the optimizer decision. Do not infer a component-force pass from QE's printed aggregate `Total force`. Do not infer structural convergence from an SCF marker or program termination.

If the structure looks implausible, preserve the source, start, suspect frame, last accepted frame, full trajectory, inputs, and outputs, then use [The geometry looks physically wrong](/DFT-Research-Workflow/operations/troubleshooting/#geometry-looks-physically-wrong). Visual inspection is a diagnostic observation. It neither proves numerical failure nor proves a physical instability; numerical checks and model review remain separate.

Only after this alignment should a parser make tables or plots for repeated comparison. The stored Silicon companion below parses every active Cartesian component, reports QE's aggregate `Total force` separately, and maps each ordered SCF completion record to its following force evaluation. Use the [official code manuals](/DFT-Research-Workflow/operations/resource-landscape/#electronic-structure-codes) to interpret implementation-specific force, stress, trajectory, and stop records.

## Inspect the stored output before parsing it

```bash
relax_in=examples/practical-guides/data/silicon-qe/relax/si-relax.in
relax_out=examples/practical-guides/data/silicon-qe/relax/si-relax.out

grep -En 'calculation|forc_conv_thr|nstep|ion_dynamics' -- "$relax_in"
sed -n '/^ATOMIC_POSITIONS/,/^K_POINTS/p' "$relax_in"
grep -F '!    total energy' -- "$relax_out"
grep -cE '^[[:space:]]+convergence has been achieved in[[:space:]]+[0-9]+ iterations[[:space:]]*$' -- "$relax_out"
test "$(grep -cF 'Program PWSCF v.' -- "$relax_out")" -eq 1
test "$(grep -cF 'JOB DONE.' -- "$relax_out")" -eq 1

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

if grep -n 'total[[:space:]]\+stress' -- "$relax_out"; then
  printf '%s\n' 'Inspect the final complete 3 x 3 stress block and its printed units.'
else
  printf '%s\n' 'No stress block is stored; stress and cell convergence are not assessed.'
fi
grep -niE 'warning|error in routine|stopping|not converged|no convergence|magnetization|occupation' \
  -- "$relax_out" || true
```

The input rows show whether `if_pos` masks constrain individual Cartesian components; when masks are absent, confirm the documented default before treating the printed components as active. The final complete force block, final geometry, missing-or-present stress block, state diagnostics, termination, and SCF records remain separate inspection objects. The aggregate `Total force` printed inside the block is diagnostic only and cannot substitute for the maximum absolute free component.

After this manual pass, the optional companion can reproduce the five stored energy, component-force, aggregate-force, SCF-iteration, and final-residual rows and regenerate its figures:

```bash
python3 examples/practical-guides/silicon_qe_relax.py
```

Ordered parsing maps each electronic completion record to the force evaluation that follows it; that mapping still does not make SCF convergence an ionic convergence test.

Next inspect `JOB DONE`, the BFGS termination marker, warnings, the final coordinates, and every state diagnostic required by the model. Accept the geometry only when the intended active force/stress conditions and state identity are satisfied under a fresh final evaluation. A decreasing total-force trace alone is not a stopping test.

## Record one row for every accepted structural step

A useful optimization table contains more than energy. For every accepted structural step, retain the segment identity and structure checksum or trajectory frame; energy or enthalpy; maximum and RMS active force; relevant stress or pressure components; maximum displacement or strain step; electronic residual and iteration count; total and local magnetic moments; occupation or charge-state label; symmetry and active constraints; and warnings or recovery events.

Keep rejected line-search points or failed electronic steps distinguishable from accepted optimizer steps. Otherwise an energy or force plot can mix objects that did not participate in the same path.

## Separate electronic and structural criteria

An electronic threshold controls the state evaluator within one geometry. An ionic threshold controls the gradient or step across geometries. Reaching the first does not imply the second, and a noisy electronic solve can make the second unreliable.

The companion checks one input hash and one output hash, parses every force component
for all five ionic evaluations, preserves QE's printed aggregate force separately,
maps the five ordered electronic convergence records to their following force blocks,
and checks the BFGS and program-completion markers. The final maximum absolute free
component is below the declared $10^{-4}$ Ry/bohr threshold for this fixed-cell run.
There is no stress history because the cell was not active; the result cannot support
a cell-relaxation or stress-convergence claim.

## Examine force and stress in the active subspace

For positions-only relaxation, inspect forces after applying the declared constraints. Also preserve unconstrained or reaction forces where they are scientifically relevant, because a fixed region can carry substantial load even though those components do not drive the optimizer.

For cell relaxation, inspect the stress components that correspond to active strain variables. Scalar pressure alone cannot diagnose an anisotropic shape optimization. Confirm code sign and unit conventions before comparing to an external stress target.

Force and stress thresholds are downstream-use decisions. This page does not define one generally sufficient numerical value.

## Track state identity as a categorical observable

A smooth geometry path can cross between electronic solutions. Track magnetic order, total and local moments, occupation pattern, charge localization, spin direction, symmetry, and any constraints that identify the intended branch.

If a history changes state label partway through, reject a single-branch convergence interpretation even when its last force value is small. A discontinuity cannot be repaired by averaging adjacent points or fitting a smooth tail.

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

Wall-time restarts, optimizer changes, tighter electronic settings, changed constraints, and manual structure edits create new trajectory segments. Link each new segment to the previous accepted frame, reason for restart or intervention, old and new evaluator and optimizer identities, any compatible state reused, and the first verified frame of the new segment.

A plot may display the segments together, but it should not conceal their different settings or imply a single uninterrupted method.

## What this guide verifies

The declared companion verifies one input hash, one output hash, `JOB DONE` and
BFGS markers, five ordered electronic-convergence records, five energy rows, every
atomic Cartesian force component, and five separately reported aggregate forces.
It confirms the final component gate only for this fixed-cell run. It does not
establish stress or cell convergence, state continuity, a local/global minimum,
observable convergence, or material-model validity.

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
- [Crystallography Open Database entry 9013102](https://www.crystallography.net/cod/9013102.html)
