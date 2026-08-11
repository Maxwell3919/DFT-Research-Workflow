---
topic_slug: harmonic-phonons
guide_slug: check-harmonic-mode-ledger
title: Check a Harmonic-Mode Ledger
kind: implementation
tools:
  - python
  - quantum-espresso
  - phonopy
status: reviewed
summary: Reconstruct a real Silicon Γ-point QE 7.5 DFPT mode ledger while keeping a one-q-point calculation separate from a phonon-dispersion or stability claim.
tested_versions:
  - Python 3.12
  - Quantum ESPRESSO 7.5
  - Phonopy 4.4 documented command interface; not executed in the retained case
execution_script: examples/practical-guides/silicon_gamma_phonon.py
source_ids:
  - qe-ph-75
  - qe-q2r-docs
  - qe-matdyn-docs
  - phonopy-command
  - phonopy-qe-interface
  - phonopy-setting-tags
media_ids:
  - silicon-qe-gamma-phonon
  - silicon-qe-gamma-phonon-output-terminal
review: docs/reviews/2026-08-04-harmonic-phonons.md
reviewed_at: "2026-08-04"
---

This is a bounded real-execution case: a COD 9013102 Silicon structure was used for an 8×8×8 QE 7.5 SCF calculation, followed by `ph.x` at Γ using the same `prefix`/`outdir` lineage. The committed output contains three 1.216451 cm⁻¹ acoustic diagnostics and a threefold 514.442616 cm⁻¹ optical result. The structure, SCF and DFPT inputs, standard output, stderr files, dynamical matrix, parsed CSV, and hashes are all committed as small public artifacts.

This replay is not the first action for a dynamical-stability question. Begin with the complete q-grid route in Quantum ESPRESSO (`pw.x` → `ph.x` → `q2r.x` → `matdyn.x`) or a one-to-one finite-displacement/force-set route in Phonopy, then open the dispersion and suspicious eigenvectors in a compatible viewer. Use this Γ ledger only afterwards to practise inspecting one bounded response object.

## Run the retained Gamma calculation yourself

Make a clean work directory containing `pseudo/`, a writable `out/`, and the exact pseudopotential. Create `si-gamma-scf.in`:

```qe
&CONTROL
  calculation = 'scf',
  prefix = 'si_gamma_phonon',
  outdir = './out',
  pseudo_dir = './pseudo',
/
&SYSTEM
  ibrav = 0, nat = 2, ntyp = 1,
  ecutwfc = 40.0, ecutrho = 320.0,
  occupations = 'fixed',
/
&ELECTRONS
  conv_thr = 1.0d-10,
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

The cell, pseudopotential, 40/320 Ry cutoffs and 8 x 8 x 8 mesh are retained case values. For your material they must come from the accepted structure and electronic/force convergence work. Create `si-gamma-ph.in`:

```qe
&INPUTPH
  tr2_ph = 1.0d-14,
  prefix = 'si_gamma_phonon',
  outdir = './out',
  fildyn = 'si_gamma.dyn',
/
0.0 0.0 0.0
```

Run locally with separate logs:

```bash
pw.x -in si-gamma-scf.in > si-gamma-scf.out 2> si-gamma-scf.err; printf '%s\n' "$?" > si-gamma-scf.exit
ph.x -in si-gamma-ph.in > si-gamma-ph.out 2> si-gamma-ph.err; printf '%s\n' "$?" > si-gamma-ph.exit
```

On HPC, put the same two commands after site-specific environment setup and launch them with the cluster's required MPI command. Use one calculation directory per job, stop after a failed SCF, and monitor both the scheduler and `tail -f si-gamma-ph.out`.

```bash
grep -E '^[[:space:]]+convergence has been achieved in[[:space:]]+[0-9]+ iterations[[:space:]]*$' si-gamma-scf.out | tail -1
grep -F "JOB DONE." si-gamma-scf.out si-gamma-ph.out
grep -F "Calculation of q =" si-gamma-ph.out
grep -F "freq (" si-gamma-ph.out
grep -Ei "warning|error|stopping|not converged" \
  si-gamma-scf.out si-gamma-scf.err si-gamma-ph.out si-gamma-ph.err || true
test -s si_gamma.dyn && ls -lh si_gamma.dyn
```

The retained `ph.x` output contains:

```output
     Calculation of q =    0.0000000   0.0000000   0.0000000
     freq (    1) =       0.036467 [THz] =       1.216451 [cm-1]
     freq (    4) =      15.422603 [THz] =     514.442616 [cm-1]
```

There are three acoustic entries at 1.216451 cm-1 and three optical entries at 514.442616 cm-1. Those are raw case observations. A `JOB DONE.` marker plus six frequencies is not a dispersion or a stability proof.

## Extend to a complete QE q-grid and dispersion

Choose a q mesh as a convergence variable. The illustrative 4 x 4 x 4 grid below is not a recommendation. Create `ph-grid.in` with the same accepted electronic `prefix` and `outdir`:

```qe
&INPUTPH
  tr2_ph = 1.0d-14,
  prefix = 'si_gamma_phonon',
  outdir = './out',
  ldisp = .true.,
  nq1 = 4, nq2 = 4, nq3 = 4,
  fildyn = 'si.dyn',
/
```

Run `ph.x`, then inventory every irreducible q point and every `si.dyn0`, `si.dyn1`, ... file before continuing. A scheduler completion state or the last q-point output cannot substitute for complete q coverage.

```bash
ph.x -in ph-grid.in > ph-grid.out 2> ph-grid.err; printf '%s\n' "$?" > ph-grid.exit
grep -F "Calculation of q =" ph-grid.out
grep -F "JOB DONE." ph-grid.out
grep -Ei "warning|error|stopping|not converged" ph-grid.out ph-grid.err || true
ls -lh si.dyn*
```

Create `q2r.in`. Start with `zasr='no'` so the raw force constants remain visible; apply and report a justified ASR separately rather than concealing the uncorrected result.

```qe
&INPUT
  fildyn = 'si.dyn',
  flfrc = 'si.fc',
  zasr = 'no',
/
```

Create `matdyn-a.in` for the first path branch. Coordinates must match the reciprocal basis of the structure used by the calculation.

```qe
&INPUT
  flfrc = 'si.fc',
  asr = 'no',
  flfrq = 'si.freq-a',
  flvec = 'si.modes-a',
  q_in_band_form = .true.,
  q_in_cryst_coord = .true.,
/
3
0.0000000000 0.0000000000 0.0000000000 20
0.5000000000 0.0000000000 0.5000000000 20
0.6250000000 0.2500000000 0.6250000000 1
```

Create a separate `matdyn-b.in` for `K-Gamma-L-W-X` so that U is not connected to K. Change `flfrq`/`flvec` and replace the q-point card with:

```qe
5
0.3750000000 0.3750000000 0.7500000000 20
0.0000000000 0.0000000000 0.0000000000 20
0.5000000000 0.5000000000 0.5000000000 20
0.5000000000 0.2500000000 0.7500000000 20
0.5000000000 0.0000000000 0.5000000000 1
```

```bash
q2r.x -in q2r.in > q2r.out 2> q2r.err; printf '%s\n' "$?" > q2r.exit
matdyn.x -in matdyn-a.in > matdyn-a.out 2> matdyn-a.err; printf '%s\n' "$?" > matdyn-a.exit
matdyn.x -in matdyn-b.in > matdyn-b.out 2> matdyn-b.err; printf '%s\n' "$?" > matdyn-b.exit
grep -F "JOB DONE." q2r.out matdyn-a.out matdyn-b.out
grep -Ei "warning|error|stopping|not converged" q2r.out q2r.err matdyn-a.out matdyn-a.err matdyn-b.out matdyn-b.err || true
test -s si.fc && test -s si.freq-a && test -s si.freq-b
```

## Plot the fresh QE dispersion

The companion has a fresh-data mode for the two `matdyn.x` frequency files. It reads the `&plot nbnd=..., nks=... /` records, preserves the branch break, and writes a standalone SVG.

- **Reads:** `si.freq-a`, `si.freq-b`, the exact labels and their zero-based path-point indices, and a displayed frequency window.
- **Produces:** `phonon-dispersion.svg` and a JSON inspection summary on stdout.
- **Checks:** both files parse, have the same number of modes, and contain every labelled point index.
- **Does not check:** q-grid completeness, force-constant ancestry, ASR choice, convergence, non-analytic corrections, eigenvector character, or stability.

The shown path inputs produce 41 points for branch A and 81 for branch B, so their label indices are `0,20,40` and `0,20,40,60,80`. Change both labels and indices if you change any `nptq` value.

```bash
python3 examples/practical-guides/silicon_gamma_phonon.py self-test-fresh
python3 examples/practical-guides/silicon_gamma_phonon.py fresh-dispersion \
  --branch-a si.freq-a \
  --branch-b si.freq-b \
  --labels-a 'Γ,X,U' \
  --labels-b 'K,Γ,L,W,X' \
  --label-indices-a '0,20,40' \
  --label-indices-b '0,20,40,60,80' \
  --fmin-cm -50 --fmax-cm 650 \
  --title 'REPLACE_WITH_MATERIAL_METHOD_AND_Q_MESH' \
  --output-svg phonon-dispersion.svg

test -s phonon-dispersion.svg
grep -F "path break" phonon-dispersion.svg
grep -F "frequency (cm⁻¹)" phonon-dispersion.svg
```

Open the SVG and compare suspicious branches with `si.modes-a` or `si.modes-b`, the raw frequencies, and a compatible mode viewer. The displayed limits are illustrative. Repeat the full chain for denser electronic k meshes, higher cutoffs, tighter `tr2_ph`, and q meshes until the frequencies and eigenvectors used in the claim are stable. Polar materials also require the documented dielectric/Born-charge and non-analytic-treatment route; a nonpolar Silicon template does not supply it.

## Calculate and plot a phonon DOS

Create `matdyn-dos.in`. The illustrative 20 x 20 x 20 interpolation mesh and 1 cm⁻¹ output step are convergence variables, not recommendations. With `degauss=0`, QE 7.5 uses tetrahedra; its current manual warns that this DOS route may not work properly for noncubic materials, so inspect the method boundary before relying on it.

```qe
&INPUT
  flfrc = 'si.fc',
  asr = 'no',
  dos = .true.,
  nk1 = 20, nk2 = 20, nk3 = 20,
  deltaE = 1.0,
  degauss = 0.0,
  fldos = 'si.phdos',
/
```

Run and inspect it separately from the path interpolation:

```bash
matdyn.x -in matdyn-dos.in > matdyn-dos.out 2> matdyn-dos.err; printf '%s\n' "$?" > matdyn-dos.exit
grep -F "JOB DONE." matdyn-dos.out
grep -Ei "warning|error|stopping|not converged" matdyn-dos.out matdyn-dos.err || true
test -s si.phdos
head -n 8 si.phdos

python3 examples/practical-guides/silicon_gamma_phonon.py fresh-dos \
  --data si.phdos \
  --expected-modes 6 \
  --title 'REPLACE_WITH_MATERIAL_METHOD_AND_DOS_MESH' \
  --output-svg phonon-dos.svg
test -s phonon-dos.svg
```

QE documents the DOS units as states per cm⁻¹ versus frequency in cm⁻¹, normalized to `3*nat`. The helper prints a trapezoidal integral so you can compare it with the expected mode count; grid truncation and discretization can leave a residual. Inspect that normalization, negative-frequency treatment, the frequency range, and changes under denser interpolation meshes and alternative justified broadening before continuing.

## Finite-displacement bridge with Phonopy

The alternative route is: accepted unit cell -> declared supercell -> symmetry-reduced displaced structures -> one force calculation per displacement -> complete force set -> force constants -> band/DOS mesh -> mode visualization. The commands below follow the documented Phonopy 4.4 QE interface; they are not part of the retained Silicon execution.

Start from a complete QE force input named `unitcell.in`: accepted cell/positions, exact pseudopotential, force-converged cutoffs and electronic mesh, occupations/spin, `tprnfor=.true.`, and isolated writable `prefix/outdir`. Install the pinned command interface, then generate a declared illustrative 2 x 2 x 2 displacement set:

```bash
python3 -m venv .phonopy-venv
. .phonopy-venv/bin/activate
python -m pip install 'phonopy==4.4.0'
phonopy-init --version

phonopy-init --qe -d --dim 2 2 2 --pa auto -c unitcell.in
test -s phonopy_disp.yaml
find . -maxdepth 1 -type f -name 'supercell-*.in' -print \
  | sort | tee displaced-inputs.txt
test -s displaced-inputs.txt
```

Phonopy deliberately writes only the structure-related part of each `supercell-*.in`; those files are **not complete `pw.x` inputs**. Create `header.in` and prepend it to every displaced structure. The following header is the concrete two-atom Silicon reference implementation for the declared 2 x 2 x 2 supercell. It assumes the exact pseudopotential is staged in `./pseudo/` before the per-displacement directories are created:

```qe
&CONTROL
  calculation = 'scf',
  prefix = 'si_phonopy_fd',
  outdir = './out',
  pseudo_dir = '../pseudo',
  tprnfor = .true.,
  tstress = .true.,
  disk_io = 'none',
/
&SYSTEM
  ibrav = 0,
  nat = 16,
  ntyp = 1,
  ecutwfc = 40.0,
  ecutrho = 320.0,
  occupations = 'fixed',
/
&ELECTRONS
  conv_thr = 1.0d-10,
/
K_POINTS automatic
4 4 4 0 0 0
```

Before running, replace `nat`, `ntyp`, cutoffs, occupations/spin fields, and the k mesh with values for **your generated supercell and accepted electronic-force protocol**. The displayed `nat=16` follows only from two atoms times 2 x 2 x 2; the 4 x 4 x 4 mesh preserves the nominal density of the earlier 8 x 8 x 8 primitive-cell example but is not a convergence recommendation. Keep `pseudo_dir='../pseudo'` only for the directory layout below. Check the generated structure header and the staged file before assembly:

```bash
head -n 6 "$(head -n 1 displaced-inputs.txt)"
test -s pseudo/Si.pbe-n-rrkjus_psl.1.0.0.UPF
grep -F 'Si.pbe-n-rrkjus_psl.1.0.0.UPF' "$(head -n 1 displaced-inputs.txt)"
```

Assemble and reopen representative **complete** inputs. Confirm atom order, displaced atom/direction, cell, pseudopotential identity, method, cutoffs, k mesh, charge/spin, `tprnfor`, and distinct scratch identity. Run every file; on HPC put the same one-input/one-output mapping into a Slurm array rather than sharing one `outdir`.

```bash
while IFS= read -r INPUT; do
  index=${INPUT#./supercell-}; index=${index%.in}
  run_dir="disp-$index"
  mkdir -p "$run_dir/out"
  cat header.in "$INPUT" > "$run_dir/supercell.in"
  test -s "$run_dir/supercell.in"
  (
    cd "$run_dir"
    pw.x -in supercell.in > supercell.out 2> supercell.err
    printf '%s\n' "$?" > supercell.exit
  )
done < displaced-inputs.txt
```

Reject incomplete force jobs before collection. The anchored SCF marker, `JOB DONE.`, force block, stderr, exit status, atom order, and displacement identity are separate checks.

```bash
while IFS= read -r INPUT; do
  index=${INPUT#./supercell-}; index=${index%.in}
  OUT="disp-$index/supercell.out"
  grep -E '^[[:space:]]+convergence has been achieved in[[:space:]]+[0-9]+ iterations[[:space:]]*$' "$OUT" | tail -1
  grep -F "Forces acting on atoms" "$OUT" | tail -1
  grep -F "JOB DONE." "$OUT"
  grep -Ei "warning|error|stopping|not converged" "$OUT" "disp-$index/supercell.err" || true
done < displaced-inputs.txt
```

Collect outputs in exactly the displacement order recorded by `phonopy_disp.yaml`, save the complete dataset, and produce a path plot and a DOS. Do not use a glob until you have checked that its lexical order is the intended displacement order.

```bash
mapfile -t FORCE_OUTPUTS < <(find disp-* -maxdepth 1 -type f -name supercell.out | sort)
test "${#FORCE_OUTPUTS[@]}" -eq "$(wc -l < displaced-inputs.txt)"
printf '%s\n' "${FORCE_OUTPUTS[@]}"

phonopy-init --sp -f "${FORCE_OUTPUTS[@]}"
test -s phonopy_params.yaml
phonopy --band auto -p -s phonopy_params.yaml
phonopy --mesh 20 20 20 --dos -p -s phonopy_params.yaml
ls -lh phonopy_params.yaml *.pdf total_dos.dat
```

Open the saved dispersion/DOS and use the current Phonopy animation settings for any suspicious q point and branch. Preserve `phonopy_disp.yaml`, the ordered input/output manifest, every force output and check, `phonopy_params.yaml`, plot inputs, and figures. Never mix force files from different cells, atom orders, methods, or incomplete jobs.

Converge supercell size, displacement amplitude where relevant, electronic force accuracy, and reciprocal sampling for the phonon observable. Open imaginary modes using the generated eigenvectors/animation route and inspect the actual displacement pattern. DFPT and finite displacement are independent implementations only when their parents and numerical tests are genuinely separate; either can share the same physical or convergence error.

## ASR, imaginary modes, and the next action

Compare raw frequencies with a clearly labelled justified ASR result. ASR can diagnose or correct translational drift; it must not be used to erase a finite-q instability. For an imaginary mode, first inspect execution completeness, electronic convergence, q mesh or supercell size, cutoff/k mesh, structure relaxation, constraints, long-range treatment, and eigenvector character. If the mode persists under tighter numerical settings, follow its displacement and test a lower-symmetry structure rather than declaring it numerical by appearance alone.

The next accepted object is a warning-reviewed dispersion and, when needed, phonon DOS with observable-specific convergence and inspected suspicious modes. Only then should the workflow continue to thermodynamics, EPC, or a stability claim.

## Read the one-point mode object before replaying it

This artifact contains frequencies at Gamma only. It has no phonon path, q-mesh interpolation, or interactive eigenvector animation. Read the six-mode figure as a frequency transcription, then return to the structure and ask which atomic displacement each mode represents; this stored public case cannot answer that mode-character question. A full human phonon workflow opens the dispersion, selects a q point and branch, and animates the eigenvector in a compatible viewer before deciding whether a feature is translational, structural, or physically suspicious. See [lattice-dynamics routes and viewers](/DFT-Research-Workflow/operations/resource-landscape/#lattice-dynamics).

For this stored case, open `examples/practical-guides/data/silicon-qe/phonon/si-gamma-scf.in` beside `si-gamma-scf.out` and `si-gamma-scf.err`, then do the same for `si-gamma-ph.in`, `si-gamma-ph.out`, and `si-gamma-ph.err`. Confirm the QE version banner, matching `prefix` and `outdir`, the requested q point, the raw frequency lines, and `si_gamma.dyn` before looking at the parsed CSV or SVG. A missing q point, incomplete dynamical matrix, non-empty unexplained stderr, or absent normal-termination marker is an execution failure; a small or imaginary frequency after successful execution is instead a numerical or physical question that requires tighter parents, q/supercell convergence, acoustic checks, and eigenvector inspection.

Inspect the stored run markers and frequency lines:

```bash
grep -F "JOB DONE" examples/cases/silicon-ground-state-electronic-structure/output/si-gamma-scf.out
grep -E '^[[:space:]]+convergence has been achieved in[[:space:]]+[0-9]+ iterations[[:space:]]*$' examples/cases/silicon-ground-state-electronic-structure/output/si-gamma-scf.out
grep -F "JOB DONE" examples/cases/silicon-ground-state-electronic-structure/output/si-gamma-ph.out
grep -F "Calculation of q =" examples/cases/silicon-ground-state-electronic-structure/output/si-gamma-ph.out
grep -F "freq (" examples/cases/silicon-ground-state-electronic-structure/output/si-gamma-ph.out
```

The `JOB DONE` lines check normal program termination only. The SCF marker checks the stored electronic solve. The q line identifies Gamma, and the frequency lines expose the six modes parsed below. They do not establish a q mesh, interpolation, acoustic-sum correction, dispersion, or dynamical stability.


## Optional reconstruction after the full-q workflow is understood

```bash
python3 examples/practical-guides/silicon_gamma_phonon.py \
  --json examples/practical-guides/data/silicon-qe/phonon/silicon-gamma-phonon.json \
  --csv examples/practical-guides/data/silicon-qe/phonon/silicon-gamma-phonon.csv \
  --svg public/media/practical-guides/harmonic-phonons/check-harmonic-mode-ledger/silicon-gamma-phonon.svg
```

## What this guide verifies

The companion verifies exact input/output hashes, QE completion markers, six parsed Γ frequencies, the acoustic diagnostic and optical-triplet values, and regeneration of the CSV/JSON/SVG from the committed `ph.x` output. The empty stderr files are also preserved.

This one Γ-point run does not establish a phonon dispersion, q-mesh/cutoff/k-mesh convergence, an acoustic-sum-rule correction, dynamical stability, finite-temperature behavior, agreement with experiment, or a material conclusion. The 1.216451 cm⁻¹ acoustic value is a diagnostic from this fixed setup, not an exact acoustic zero.

## Official sources

- [Quantum ESPRESSO `ph.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PH.html)
- [Quantum ESPRESSO `q2r.x` input description](https://www.quantum-espresso.org/Doc/INPUT_Q2R.html)
- [Quantum ESPRESSO `matdyn.x` input description](https://www.quantum-espresso.org/Doc/INPUT_MATDYN.html)
- [Phonopy command and force-constant workflow](https://phonopy.github.io/phonopy/phonopy.html)
- [Phonopy 4.4 Quantum ESPRESSO interface and required header assembly](https://phonopy.github.io/phonopy/qe.html)
- [Phonopy setting tags](https://phonopy.github.io/phonopy/setting-tags.html)
