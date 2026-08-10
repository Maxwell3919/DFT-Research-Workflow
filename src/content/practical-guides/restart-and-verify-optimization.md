---
topic_slug: optimize-structure
guide_slug: restart-and-verify-optimization
title: Restart and Verify a Structural Optimization
kind: implementation
tools:
  - ase
  - quantum-espresso
status: reviewed
summary: Continue an interrupted relaxation without erasing its lineage, then perform a fresh final energy-and-gradient check on the exact accepted structure.
tested_versions:
  - Quantum ESPRESSO 7.5
  - ASE 3.29.0
  - Python 3.12
execution_script: examples/practical-guides/silicon_qe_restarts.py
source_ids:
  - ase-optimize
  - qe-pw-75
  - cp2k-geometry-cell-opt
  - cod-9013102
media_ids: []
review: docs/reviews/2026-08-03-optimize-structure.md
reviewed_at: "2026-08-03"
---

A restart is a continuation of a traceable interrupted optimization problem, not permission to overwrite an unfinished calculation or reuse arbitrary scratch. Geometry, optimizer state, constraints, electronic restart data, software identity, parallel layout, and the reason for continuation must remain connected.

## Separate an interrupted-run restart from a new initialization

QE 7.5 gives `restart_mode='restart'` a narrow meaning. It is for continuing a run that stopped cleanly after `max_seconds` or a `prefix.EXIT` request. The official input description says to keep the same number of processors and parallelization, and not to use this mode to start a new calculation or an NSCF calculation.

This differs from starting a new fixed-geometry SCF from an existing density or wavefunction. That separate operation keeps `restart_mode='from_scratch'` and, after compatibility checks, uses `startingpot='file'` and optionally `startingwfc='file'`. It is a file-initialized new solve, not an interrupted-run restart. [Compare Fresh and File-Initialized Electronic States](/DFT-Research-Workflow/operations/calculate-reference-ground-state/guides/compare-fresh-and-restarted-electronic-states/) now keeps these two operations distinct.

## Resume from a known physical state

Open the previous output and the last several trajectory frames before choosing a restart command. Identify the last accepted geometry rather than the last coordinates merely printed, read the stop reason, and inspect the segment for collisions, cell jumps, state switching, or a constraint mismatch. Keep the source, initial frame, last accepted frame, and failed tail available for comparison in a viewer from the [visualization and symmetry index](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry).

Inventory the restart objects separately: geometry, charge density, wavefunctions, optimizer state, checkpoint metadata, pseudopotentials, executable version, parallel layout requirements, and scratch path. File existence alone does not establish that an object is complete, compatible, or descended from the intended parent. Open the implementation's restart reference through the [electronic-structure code and manual index](/DFT-Research-Workflow/operations/resource-landscape/#electronic-structure-codes) before changing restart modes.

Write continuation output to a new file or directory and submit it through the normal executable or scheduler. Once it starts, compare the first accepted continuation frame and electronic state with the preserved parent boundary. Inspect the full new SCF, force, stress, displacement, warning, and state histories; a continuous-looking energy is not enough. Reopen the combined trajectory to look for a jump at the segment boundary.

After the optimizer reports its condition, run the required fresh fixed-geometry energy-and-gradient verification and compare it with the accepted endpoint. The companion reconstruction below is optional automation for the stored case. It cannot make an incompatible restart valid, and VASP `CONTCAR` or any other endpoint file being present does not prove convergence.

## Prepare a documented clean stop before wall time

For a new QE 7.5 relaxation that may exceed one batch allocation, first use the complete `relax.in` from [Choose Relaxed Degrees of Freedom and Constraints](/DFT-Research-Workflow/operations/optimize-structure/guides/choose-relaxed-degrees-and-constraints/). Set `max_seconds` shorter than the scheduler wall time so QE has time to write a clean checkpoint:

```qe
&CONTROL
  calculation = 'relax',
  restart_mode = 'from_scratch',
  prefix = 'si_relax',
  outdir = './tmp',
  pseudo_dir = './pseudo',
  max_seconds = 3000.0,
  tprnfor = .true.,
  tstress = .true.,
  etot_conv_thr = 1.0d-4,
  forc_conv_thr = 1.0d-4,
  nstep = 100,
/
```

The displayed time and thresholds are teaching values, not site or scientific recommendations. QE documents `max_seconds` as CPU time; do not assume it maps one-to-one to a site's requested wall time. Choose it from a measured run and checkpoint-write time under the actual build and scheduler limit, leaving enough margin for QE to stop and write the save tree.

Alternatively, request a clean stop while the run is active by creating `prefix.EXIT` in the working directory or `outdir`. For the input above:

```bash
touch tmp/si_relax.EXIT
```

Do not kill the process immediately after the request. Wait for QE to stop, then preserve the first segment's stdout, stderr, exit/scheduler record, input, save-tree inventory, and last complete accepted structural step. A file named `si_relax.EXIT` requests a stop; it is not itself evidence that the checkpoint completed.

Before restarting, verify the exact QE version/build, input, pseudopotential identity, `prefix`, `outdir`, atom order, cell, active constraints, save tree, task count, pools and other parallelization choices from the parent segment. If the stop used `prefix.EXIT`, move the request out of `outdir` so it cannot immediately stop the continuation:

```bash
if test -f tmp/si_relax.EXIT; then
  mv tmp/si_relax.EXIT segment-01.stop-request.EXIT
fi
test -d tmp/si_relax.save
find tmp/si_relax.save -maxdepth 2 -type f -printf '%12s %p\n' | sort
```

Create `relax-restart.in` by copying the exact parent input and changing only the controls justified for continuation:

```qe
&CONTROL
  calculation = 'relax',
  restart_mode = 'restart',
  prefix = 'si_relax',
  outdir = './tmp',
  pseudo_dir = './pseudo',
  max_seconds = 3000.0,
  tprnfor = .true.,
  tstress = .true.,
  etot_conv_thr = 1.0d-4,
  forc_conv_thr = 1.0d-4,
  nstep = 100,
/
```

Retain the complete unchanged `&SYSTEM`, `&ELECTRONS`, `&IONS`, structure, species, and k-point sections beneath this control block. Review the diff and stop if any model, representation, active degree, or parallel-layout field changed:

```bash
diff -u relax.in relax-restart.in || true
test ! -e relax-segment-02.out
test ! -e relax-segment-02.err
```

Run the continuation with the same processor count and parallelization used by the cleanly stopped segment. The exact launcher remains site-specific:

```bash
if srun --ntasks=4 pw.x -in relax-restart.in > relax-segment-02.out 2> relax-segment-02.err; then
  pw_status=0
else
  pw_status=$?
fi
printf '%s\n' "$pw_status" > relax-segment-02.exit-status
test "$pw_status" -eq 0
```

Do not copy `--ntasks=4` until it matches the recorded parent and current allocation. Preserve segment 01 and segment 02 separately. At the boundary, compare the last accepted parent frame with the first accepted continuation frame, electronic state, constraints, force, stress, cell, and warnings. A readable checkpoint or continuous-looking energy does not prove compatible ancestry.

## Run, inspect, decide, then continue

Inspect the stored segment boundary before running the helper:

```bash
segment_root=examples/practical-guides/data/silicon-qe/relax-restart
first_in="$segment_root/segment1.in"
first_out="$segment_root/segment1.out"
continued_in="$segment_root/segment2-restart.in"
continued_out="$segment_root/segment2-restart.out"

grep -En 'calculation|restart_mode|prefix|outdir|forc_conv_thr|nstep' \
  -- "$first_in" "$continued_in"
if diff -u -- "$first_in" "$continued_in"; then
  printf '%s\n' 'The two inputs are byte-for-byte identical.'
else
  diff_status=$?
  case "$diff_status" in
    1) printf '%s\n' 'Inputs differ; inspect the unified diff above.' ;;
    *) exit "$diff_status" ;;
  esac
fi
grep -En 'maximum number of steps|End of BFGS Geometry Optimization|JOB DONE.' \
  -- "$first_out" "$continued_out"
tail -n 60 -- "$first_out" "$continued_out"

awk '
  /Forces acting on atoms/ {block=$0 ORS; inside=1; next}
  inside {block=block $0 ORS}
  inside && /Total force =/ {last=block; inside=0}
  END {if (last == "") exit 1; printf "%s", last}
' "$continued_out"

awk '
  /Begin final coordinates/ {block=$0 ORS; inside=1; next}
  inside {block=block $0 ORS}
  inside && /End final coordinates/ {last=block; inside=0}
  END {if (last == "") exit 1; printf "%s", last}
' "$continued_out"

grep -niE 'warning|error in routine|stopping|not converged|no convergence' \
  -- "$first_out" "$continued_out" || true
```

The diff exposes every changed input line; it is not a compatibility decision. The last complete force block must be interpreted component by component using the input's `if_pos` mask or documented defaults, with aggregate `Total force` separate. The final coordinate block establishes which endpoint was printed. This stored fixed-cell case has no stress history, so it cannot support a stress or cell-convergence gate.

After the manual boundary is intelligible, run the optional bounded stored-output checker:

```bash
python3 examples/practical-guides/silicon_qe_restarts.py
```

The report checks the hashes and literal markers of the stored fresh/restart SCF pair and two relaxation segments. It does not execute a restart or verify that the saved electronic and optimizer objects were compatible.

Before continuing your own run, identify the last accepted geometry, the parent segment, the exact restart objects, and the unchanged model fields. Inspect the previous stdout for its termination reason and electronic/ionic state; do not select a file merely because its name contains `final` or `restart`. Write the continuation to a new output and retain the original segment.

After the continuation stops, run a fresh fixed-geometry energy-and-gradient calculation on the accepted coordinates. If fresh and restarted paths disagree in state, energy, forces, or warnings, keep them as separate branches and resolve the discrepancy before using either as the reference state.

## Stored bounded QE segment record

The published inputs describe an intentionally displaced COD 9013102 Silicon
cell, a two-step QE 7.5 `relax` segment, and a second input with the same prefix
and outdir plus `restart_mode='restart'`. The companion does not read or hash
those inputs or any restart object. It verifies the two output hashes, completion
markers, the first segment's maximum-step message, and the second segment's BFGS
marker. The first segment ended through `nstep=2`, not the documented
`max_seconds` or `prefix.EXIT` clean-interruption route. The stored continuation
did execute, but it is historical bounded evidence, not the general QE 7.5
restart recipe. Do not copy its `restart_mode` transition into a new workflow.

## Distinguish restartable objects

Several objects may be reused, and they have different compatibility requirements: the last accepted structure and cell; atom ordering and constraint mapping; electronic density or wavefunctions; optimizer Hessian or limited-memory history; trajectory and accepted-step log; and scheduler or workflow checkpoint.

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
from ase.build import bulk
from ase.calculators.emt import EMT
from ase.optimize import BFGS

atoms = bulk("Cu", "fcc", a=3.6, cubic=True)
atoms.positions[1] += [0.18, -0.12, 0.08]
atoms.calc = EMT()

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

This ASE/EMT snippet is a conceptual restart example. It is not executed by the
declared companion and provides no evidence about the QE continuation. Its force
criterion and model are not DFT recommendations.

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

The declared companion verifies hashes and literal completion markers for four
stored outputs, the first relaxation segment's maximum-step message, the second
segment's BFGS marker, and equality of a separate fresh/restart SCF pair at printed
energy precision. It does not validate input compatibility, restart files, ASE
mechanics, a fresh final gradient evaluation, observable convergence, or a
physical/global minimum.

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
- [Crystallography Open Database entry 9013102](https://www.crystallography.net/cod/9013102.html)
