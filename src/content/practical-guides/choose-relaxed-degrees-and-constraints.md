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
  - Quantum ESPRESSO 7.5
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

## Create a fixed-cell QE relaxation from the starting geometry

Use a new directory for the run. Do not reuse an SCF, convergence-test, or another relaxation scratch tree merely because its files appear compatible:

```bash
run="$HOME/drw-runs/si-relax"
test ! -e "$run"
mkdir -p "$run"/{pseudo,tmp}
cd "$run"
```

Create `relax.in` in a text editor. This complete QE 7.5 input reproduces the model and numerical settings of the stored Silicon teaching case, with explicit force and stress printing added for inspection. The displaced second site is intentional. The cutoffs, mesh, thresholds, and Silicon model are case values, not recommendations for another material.

```qe
&CONTROL
  calculation = 'relax',
  prefix = 'si_relax',
  outdir = './tmp',
  pseudo_dir = './pseudo',
  tprnfor = .true.,
  tstress = .true.,
  etot_conv_thr = 1.0d-4,
  forc_conv_thr = 1.0d-4,
  nstep = 30,
/
&SYSTEM
  ibrav = 0,
  nat = 2,
  ntyp = 1,
  ecutwfc = 40.0,
  ecutrho = 320.0,
  occupations = 'fixed',
/
&ELECTRONS
  conv_thr = 1.0d-10,
/
&IONS
  ion_dynamics = 'bfgs',
/
ATOMIC_SPECIES
Si 28.0855 Si.pbe-n-rrkjus_psl.1.0.0.UPF
CELL_PARAMETERS angstrom
0.0000000000 2.7152000000 2.7152000000
2.7152000000 0.0000000000 2.7152000000
2.7152000000 2.7152000000 0.0000000000
ATOMIC_POSITIONS crystal
Si 0.0000000000 0.0000000000 0.0000000000
Si 0.2700000000 0.2500000000 0.2500000000
K_POINTS automatic
8 8 8 0 0 0
```

Replace values by provenance, not intuition:

| Input object | Where it comes from |
| --- | --- |
| cell, species, positions, periodicity | the accepted A-stage computational model |
| pseudopotential filename and XC/relativistic identity | the exact B-stage library receipt and file hash |
| `ecutwfc`, `ecutrho`, k mesh, occupations | the B-stage tests for forces, stress, energy differences, and the intended state |
| charge, spin, SOC, Hubbard, dispersion settings | the declared Hamiltonian and candidate-state protocol |
| `conv_thr` | an electronic threshold shown to make the forces and stress reliable for this run |
| `etot_conv_thr`, `forc_conv_thr`, `nstep`, active atoms/cell | the declared geometry-acceptance and recovery protocol; QE requires both ionic energy and force criteria for this minimization |

Stage the exact pseudopotential required by `ATOMIC_SPECIES`. Preserve its provider, release, URL, licence, and expected hash separately; a matching filename is not identity evidence:

```bash
: "${PSEUDO_SOURCE:?Set PSEUDO_SOURCE to the verified Silicon UPF}"
test -f "$PSEUDO_SOURCE"
test "$(basename -- "$PSEUDO_SOURCE")" = 'Si.pbe-n-rrkjus_psl.1.0.0.UPF'
sha256sum -- "$PSEUDO_SOURCE"
ln -s -- "$PSEUDO_SOURCE" "pseudo/$(basename -- "$PSEUDO_SOURCE")"
```

Review the executable objects before spending compute time:

```bash
command -v pw.x
grep -En 'calculation|prefix|outdir|pseudo_dir|etot_conv_thr|forc_conv_thr|nstep|ecutwfc|ecutrho|conv_thr|ion_dynamics' relax.in
sed -n '/^ATOMIC_SPECIES/,$p' relax.in
test -r pseudo/Si.pbe-n-rrkjus_psl.1.0.0.UPF
test -w tmp
```

The normal output is the authority for the executable version actually used. Stop if the structure, pseudopotential identity, method, state, active variables, or converged numerical setup is still unresolved.

## Run locally or through a site-specific Slurm job

For a small authorized local run, keep stdout, stderr, and shell status separate:

```bash
if pw.x -in relax.in > relax.out 2> relax.err; then
  pw_status=0
else
  pw_status=$?
fi
printf '%s\n' "$pw_status" > relax.exit-status
test "$pw_status" -eq 0
```

Do not run a production calculation on a login node. At a Slurm site, create `run-relax.slurm` and replace the module, allocation, time, memory, task count, and launcher with values documented for that site and QE build. `srun` below is a site-specific template, not a universal QE launcher:

```bash
#!/usr/bin/env bash
#SBATCH --job-name=qe-relax
#SBATCH --nodes=1
#SBATCH --ntasks=4
#SBATCH --cpus-per-task=1
#SBATCH --time=01:00:00
#SBATCH --mem=8G
#SBATCH --output=slurm-%j.out
#SBATCH --error=slurm-%j.err

set -euo pipefail
module purge
module load quantum-espresso/7.5  # replace with the site's documented module
export OMP_NUM_THREADS="${SLURM_CPUS_PER_TASK:-1}"

if srun pw.x -in relax.in > relax.out 2> relax.err; then
  pw_status=0
else
  pw_status=$?
fi
printf '%s\n' "$pw_status" > relax.exit-status
exit "$pw_status"
```

Submit and record the job identity:

```bash
job_id=$(sbatch --parsable run-relax.slurm)
printf '%s\n' "$job_id" | tee relax.job-id
squeue -j "$job_id"
```

`squeue` reports scheduler state, not QE or ionic convergence. While the job is active, inspect only complete text already flushed to disk; do not treat a partial last block as an accepted step:

```bash
tail -n 60 relax.out
tail -n 40 relax.err
grep -nE 'iteration #|convergence has been achieved|Forces acting on atoms|Total force =|total[[:space:]]+stress|Begin final coordinates|bfgs|maximum number of steps|JOB DONE' relax.out | tail -n 80
```

Preserve `relax.in`, the pseudopotential receipt/hash, `relax.out`, `relax.err`, `relax.exit-status`, job script, job ID, scheduler exit/resource record, and the `tmp/si_relax.save/` identity needed for a documented restart. Scratch wavefunctions may belong in controlled host storage rather than Git.

## Inspect termination, SCF, forces, stress, and final positions separately

After the process or batch job ends, use one reusable output variable:

```bash
OUT=relax.out
ERR=relax.err

cat relax.exit-status
test "$(grep -cF 'Program PWSCF v.' -- "$OUT")" -eq 1
test "$(grep -cF 'JOB DONE.' -- "$OUT")" -eq 1
grep -E '^[[:space:]]+convergence has been achieved in[[:space:]]+[0-9]+ iterations[[:space:]]*$' -- "$OUT"
grep -E 'bfgs converged|End of BFGS Geometry Optimization|maximum number of steps' -- "$OUT"
grep -niE 'warning|error in routine|stopping|not converged|no convergence' -- "$OUT" "$ERR" || true

awk '
  /Forces acting on atoms/ {block=$0 ORS; inside=1; next}
  inside {block=block $0 ORS}
  inside && /Total force =/ {last=block; inside=0}
  END {if (last == "") exit 1; printf "%s", last}
' "$OUT"

awk '
  /total[[:space:]]+stress/ {block=$0 ORS; rows=3; next}
  rows > 0 {block=block $0 ORS; rows--; if (rows == 0) last=block}
  END {if (last == "") exit 1; printf "%s", last}
' "$OUT"

awk '
  /Begin final coordinates/ {block=$0 ORS; inside=1; next}
  inside {block=block $0 ORS}
  inside && /End final coordinates/ {last=block; inside=0}
  END {if (last == "") exit 1; printf "%s", last}
' "$OUT"
```

For this unconstrained input, QE 7.5 documents the omitted `if_pos` values as `1`, so every printed Cartesian force component is active. Compare every component with `forc_conv_thr`; keep the printed aggregate `Total force` separate. QE's ionic convergence also uses its energy criterion, so confirm the optimizer's actual termination rather than constructing a component-only substitute. The stress printed in this fixed-cell run is a diagnostic; the cell was not optimized and no stress threshold is a fixed-cell stop condition.

Accept the geometry only when the shell/scheduler and QE termination are normal, every accepted ionic step has a usable electronic state, the optimizer satisfied the declared criteria, every active free-force component passes, the constraints and state remained intended, and the final structure is physically inspectable. A maximum-step message, a decreasing force, or `JOB DONE.` is a fail for geometry acceptance until the missing gate is resolved.

Copy the last complete final-coordinate block into a copy of the reviewed input named `final-geometry.in`. Reopen the starting and final files with identical display settings, for example with an installed ASE viewer:

```bash
ase gui -f espresso-in relax.in final-geometry.in
```

Check periodic images, atom mapping, coordination, cell, vacuum, and every declared constraint. A plausible picture is diagnostic only. Continue with [Prepare a Fixed-Geometry Reference Calculation](/DFT-Research-Workflow/operations/calculate-reference-ground-state/guides/prepare-fixed-geometry-reference-calculation/) to create and run a fresh static SCF on the accepted coordinates.

## Use `if_pos` only after defining the constrained model

QE 7.5 documents three optional integer flags after each atomic position. Each flag must be `0` or `1`; it multiplies the corresponding force component, and its default is `1`. This documented example fixes the first Silicon atom and lets the second move:

```qe
ATOMIC_POSITIONS crystal
Si 0.0000000000 0.0000000000 0.0000000000  0 0 0
Si 0.2700000000 0.2500000000 0.2500000000  1 1 1
```

This repository has not executed that constrained input. Before production, run a bounded pilot, verify that fixed coordinates remain unchanged, inspect reaction forces where scientifically relevant, and judge convergence only in the active subspace. The real stored Silicon case below omits `if_pos`; it is not constraint evidence.

## Document a bulk `vc-relax` without claiming it was executed

For a bulk equilibrium-cell question, a QE 7.5 variable-cell input adds `calculation='vc-relax'` and `&CELL`. The complete example below has been checked against the current official input grammar but has not been executed or numerically validated by this repository:

```qe
&CONTROL
  calculation = 'vc-relax',
  prefix = 'si_vc_relax',
  outdir = './tmp',
  pseudo_dir = './pseudo',
  tprnfor = .true.,
  tstress = .true.,
  etot_conv_thr = 1.0d-4,
  forc_conv_thr = 1.0d-4,
  nstep = 30,
/
&SYSTEM
  ibrav = 0,
  nat = 2,
  ntyp = 1,
  ecutwfc = 40.0,
  ecutrho = 320.0,
  occupations = 'fixed',
/
&ELECTRONS
  conv_thr = 1.0d-10,
/
&IONS
  ion_dynamics = 'bfgs',
/
&CELL
  cell_dynamics = 'bfgs',
  press = 0.0,
  press_conv_thr = 0.5,
  cell_dofree = 'all',
/
ATOMIC_SPECIES
Si 28.0855 Si.pbe-n-rrkjus_psl.1.0.0.UPF
CELL_PARAMETERS angstrom
0.0000000000 2.7152000000 2.7152000000
2.7152000000 0.0000000000 2.7152000000
2.7152000000 2.7152000000 0.0000000000
ATOMIC_POSITIONS crystal
Si 0.0000000000 0.0000000000 0.0000000000
Si 0.2500000000 0.2500000000 0.2500000000
K_POINTS automatic
8 8 8 0 0 0
```

The displayed `press`, `press_conv_thr`, cutoffs, thresholds, and `cell_dofree='all'` are teaching values for a bulk syntax example, not scientific recommendations. QE 7.5 documents `press` in kbar and `press_conv_thr` as a pressure criterion for `vc-relax` while the ionic criteria still apply. It documents `cell_dofree='all'` as moving all axes and angles. Do not use that setting for a slab, a vacuum direction, epitaxial strain, or a restricted interface model. Select a documented restricted `cell_dofree` only after defining the active strain subspace and checking lattice compatibility.

Run and monitor `vc-relax.in` with the same stdout/stderr/status discipline as fixed-cell relaxation. Inspect every active force component, the complete stress tensor and printed units, pressure relative to the declared target, cell history, and the final complete `CELL_PARAMETERS` plus `ATOMIC_POSITIONS`. A scalar pressure pass cannot replace active anisotropic stress inspection. Transfer both the accepted cell and positions into the fresh static SCF. Until a real run, output, convergence study, and physical review exist, this subsection supports documented input preparation only—not a `vc-relax` success claim.

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
grep -cE '^[[:space:]]+convergence has been achieved in[[:space:]]+[0-9]+ iterations[[:space:]]*$' -- "$relax_out"
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
