---
topic_slug: band-structure
guide_slug: build-reciprocal-path-ledger
title: Build a Reciprocal-Path Ledger Before Plotting Bands
kind: implementation
tools:
  - python
  - quantum-espresso
  - seekpath
status: reviewed
summary: Reconstruct a Silicon reciprocal-path ledger and band plot from a COD structure, SeeK-path standardization, and actual Quantum ESPRESSO 7.5 output.
tested_versions:
  - Python 3.12
  - SeeK-path 2.2.1
  - spglib 2.7.0
  - Quantum ESPRESSO 7.5
execution_script: examples/practical-guides/silicon_qe_bands.py
source_ids:
  - seekpath-paper
  - seekpath-docs
  - qe-bands-docs
  - cod-9013102
media_ids:
  - silicon-qe-bands
review: docs/reviews/2026-08-04-band-structure.md
reviewed_at: "2026-08-04"
---

## Purpose

Turn one accepted structure and one SeeK-path result into a reproducible, warning-reviewed QE band calculation with an explicit path discontinuity, energy reference, plot, and full-zone next action.

## Start with a trusted fixed geometry and a declared path

Use a structure whose cell, atomic positions, pseudopotential family, cutoff, spin/SOC state, occupations, and SCF k mesh have already passed the tests needed for your claim. A band path does not repair an unaccepted parent state.

In the SeeK-path web interface, upload the structure, record whether it standardized or transformed the cell, and download or copy the primitive cell, reciprocal basis, labelled coordinates, and ordered segments. This Silicon example uses the `cF` route `Gamma-X-U | K-Gamma-L-W-X`; `|` is a discontinuity, not a line segment. The coordinates below are fractional in the reciprocal basis of this exact cell:

| Label | k1 | k2 | k3 |
| --- | ---: | ---: | ---: |
| Gamma | 0 | 0 | 0 |
| X | 0.5 | 0 | 0.5 |
| U | 0.625 | 0.25 | 0.625 |
| K | 0.375 | 0.375 | 0.75 |
| L | 0.5 | 0.5 | 0.5 |
| W | 0.5 | 0.25 | 0.75 |

Reopen the standardized structure before running QE. If SeeK-path changed the cell, use the transformed cell consistently in the SCF and band inputs; do not combine its reciprocal coordinates with the old cell.

## Create the QE inputs

Make a calculation directory containing `pseudo/`, an empty writable `out/`, the exact pseudopotential, and the accepted `scf.in`. The relevant parent fields are illustrated by the recorded case; replace every case-specific value with your accepted values.

```qe
&CONTROL
  calculation = 'scf',
  prefix = 'si_cod9013102',
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

QE's `K_POINTS crystal_b` interpolates consecutive anchors. Preserve the SeeK-path break by making two inputs, rather than silently connecting U to K. Copy the full accepted structure and method block from `scf.in`; change only the fields shown here and append the relevant path card.

Each `calculation='bands'` input is a new calculation that consumes the compatible parent SCF data through the matching `prefix` and `outdir`; it is not an interrupted-run continuation. Keep `restart_mode='from_scratch'`. QE reserves `restart_mode='restart'` for a cleanly interrupted compatible run and explicitly excludes new NSCF calculations from that mode.

The retained historical Silicon `bands.in` used `restart_mode='restart'` and produced the real warning-bearing output reconstructed later on this page. That immutable file remains execution evidence but is not the current recipe. The corrected input below preserves the case model and path while using the documented initialization; it is not presented as a retained rerun.

```qe
&CONTROL
  calculation = 'bands', restart_mode = 'from_scratch',
  prefix = 'si_cod9013102', outdir = './out', pseudo_dir = './pseudo',
/
&SYSTEM
  ibrav = 0, nat = 2, ntyp = 1,
  ecutwfc = 40.0, ecutrho = 320.0,
  occupations = 'fixed', nbnd = 8,
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
K_POINTS crystal_b
3
0.0000000000 0.0000000000 0.0000000000 20 ! Gamma
0.5000000000 0.0000000000 0.5000000000 20 ! X
0.6250000000 0.2500000000 0.6250000000 1  ! U
```

Save that as `bands-a.in`. Save a second copy as `bands-b.in`, replacing only its k-point card:

```qe
K_POINTS crystal_b
5
0.3750000000 0.3750000000 0.7500000000 20 ! K
0.0000000000 0.0000000000 0.0000000000 20 ! Gamma
0.5000000000 0.5000000000 0.5000000000 20 ! L
0.5000000000 0.2500000000 0.7500000000 20 ! W
0.5000000000 0.0000000000 0.5000000000 1  ! X
```

Create `bands-a.x.in` and `bands-b.x.in`. `prefix` and `outdir` must identify the state produced by the preceding `pw.x` command; `filband` must differ so that the second branch does not overwrite the first.

```qe
&BANDS
  prefix = 'si_cod9013102',
  outdir = './out',
  filband = 'si.bands-a.dat',
/
```

## Run locally or submit the same stages on HPC

Use separate stdout, stderr, and exit-code files so that warnings are not lost. Run `bands.x` immediately after each branch, before another path calculation reuses the save directory.

```bash
pw.x -in scf.in > scf.out 2> scf.err; printf '%s\n' "$?" > scf.exit
pw.x -in bands-a.in > bands-a.out 2> bands-a.err; printf '%s\n' "$?" > bands-a.exit
bands.x -in bands-a.x.in > bands-a.x.out 2> bands-a.x.err; printf '%s\n' "$?" > bands-a.x.exit
pw.x -in bands-b.in > bands-b.out 2> bands-b.err; printf '%s\n' "$?" > bands-b.exit
bands.x -in bands-b.x.in > bands-b.x.out 2> bands-b.x.err; printf '%s\n' "$?" > bands-b.x.exit
```

For Slurm, put the same five commands in the allocation after site-specific environment setup. Define executable paths explicitly; request resources from the local cluster guide rather than copying another machine's values.

```bash
#!/usr/bin/env bash
#SBATCH --job-name=qe-bands
#SBATCH --output=slurm-%j.out
set -u
: "${QE_PW:?set QE_PW to pw.x}"
: "${QE_BANDS:?set QE_BANDS to bands.x}"
srun "$QE_PW" -in scf.in > scf.out 2> scf.err || exit $?
srun "$QE_PW" -in bands-a.in > bands-a.out 2> bands-a.err || exit $?
srun "$QE_BANDS" -in bands-a.x.in > bands-a.x.out 2> bands-a.x.err || exit $?
srun "$QE_PW" -in bands-b.in > bands-b.out 2> bands-b.err || exit $?
srun "$QE_BANDS" -in bands-b.x.in > bands-b.x.out 2> bands-b.x.err
```

## Inspect before plotting

```bash
grep -E '^[[:space:]]+convergence has been achieved in[[:space:]]+[0-9]+ iterations[[:space:]]*$' scf.out | tail -1
for OUT in scf.out bands-a.out bands-a.x.out bands-b.out bands-b.x.out; do
  printf '%s: ' "$OUT"
  grep -F "JOB DONE." "$OUT" | tail -1
done
grep -Ei "warning|error|stopping|not converged|c_bands" \
  scf.out scf.err bands-a.out bands-a.err bands-a.x.out bands-a.x.err \
  bands-b.out bands-b.err bands-b.x.out bands-b.x.err || true
ls -lh si.bands-a.dat si.bands-a.dat.gnu si.bands-b.dat si.bands-b.dat.gnu
```

Success means more than all programs ending: the SCF converged, no unresolved diagonalization warning remains, both `filband` datasets exist and are non-empty, the number of bands covers the intended energy window, and the path labels and cell match the SeeK-path ledger. `JOB DONE.` alone is only a termination marker. If `c_bands` or eigenvalue-convergence warnings remain, increase the diagonalization effort or revisit the electronic setup and rerun before interpreting a crossing.

## Plot the fresh outputs with an explicit reference and path break

The companion has a fresh-data mode in addition to its retained-case replay.

- **Reads:** both new `bands.x` `.gnu` files, both corresponding `bands.x` stdout files, the declared energy reference, labels, and display window.
- **Produces:** one standalone SVG from those supplied files.
- **Checks:** both branches have the same number of bands and internally consistent path grids; label counts match the high-symmetry records printed by each `bands.x`; the two branches remain separated.
- **Does not check:** parent-state validity, convergence, energy-reference suitability, full-zone extrema, gap directness, or metallicity.

First inspect the x coordinates that `bands.x` actually printed. They must list three anchors for branch A and five for branch B in the same order as the two input cards.

```bash
grep -F "high-symmetry point:" bands-a.x.out
grep -F "high-symmetry point:" bands-b.x.out
python3 examples/practical-guides/silicon_qe_bands.py self-test-fresh
```

Choose `EREF_EV` yourself. For a qualified metal it may be the Fermi energy from the compatible reference calculation. For an insulator use an explicitly defined VBM or other reference derived from the compatible calculation and record how it was obtained. The displayed limits below are illustrative relative-energy limits, not a convergence criterion. Change the labels if your declared path differs.

```bash
EREF_EV='REPLACE_WITH_DECLARED_REFERENCE_IN_EV'
test "$EREF_EV" != 'REPLACE_WITH_DECLARED_REFERENCE_IN_EV'

python3 examples/practical-guides/silicon_qe_bands.py fresh \
  --branch-a si.bands-a.dat.gnu \
  --branch-b si.bands-b.dat.gnu \
  --bands-output-a bands-a.x.out \
  --bands-output-b bands-b.x.out \
  --energy-reference-ev "$EREF_EV" \
  --emin-ev -8 --emax-ev 8 \
  --labels-a 'Γ,X,U' \
  --labels-b 'K,Γ,L,W,X' \
  --reference-label 'REPLACE_WITH_FERMI_VBM_OR_OTHER_REFERENCE' \
  --title 'REPLACE_WITH_MATERIAL_AND_METHOD' \
  --svg bands-fresh.svg

test -s bands-fresh.svg
grep -F "path break" bands-fresh.svg
grep -F "E - E_ref (eV)" bands-fresh.svg
```

Open `bands-fresh.svg`. Confirm the axes and units, energy-zero label, energy window, special-point order, visible `U | K` break, band count, and any suspicious isolated segment against the raw files. A generated SVG is a transcription check, not acceptance. Test path-point density until the extrema and features used in the claim stop moving appreciably, and preserve the plot command beside its inputs and outputs.

## Inspect the committed execution evidence

```bash
python3 examples/practical-guides/silicon_qe_bands.py
```

The companion script replays the retained records without rerunning QE. It verifies path and input hashes, labels the special points, and preserves the U | K route break rather than presenting the unintended raw connector as valid evidence.

The retained QE 7.5 input listed all eight anchors in one `crystal_b` card, producing an unintended U-K connector. The raw 141-point artifact is preserved; the figure omits its 19 connector points and marks `U | K`. It also contains a `c_bands` warning. This is useful failure evidence, not a clean template or proof of a converged Silicon band gap. The recorded stages are an assembled set of retained outputs; the public artifacts do not independently prove one uninterrupted historical save-directory ancestry. The figure therefore supports a traceable corrected-display path dataset, not a converged Silicon band gap, full-zone metallicity claim, or material conclusion.

## Continue to the calculation that answers the question

A high-symmetry path describes dispersion on selected lines. It cannot prove full-zone metallicity, gap directness, or the absence of an off-path pocket. For a gap or metallicity claim, continue to the [full-zone extremum comparison](/DFT-Research-Workflow/operations/band-structure/guides/compare-band-path-and-full-zone-extrema/) and a converged [DOS calculation](/DFT-Research-Workflow/operations/density-of-states-and-projected-density-of-states/). Preserve the structure, inputs, exact pseudopotential identity, code version, path ledger, outputs, warning review, energy reference, plot data, and convergence tests together.

## Official sources

- [Hinuma and co-workers, SeeK-path](https://doi.org/10.1016/j.commatsci.2016.01.017)
- [SeeK-path documentation](https://seekpath.readthedocs.io/en/latest/)
- [Quantum ESPRESSO `bands.x` documentation](https://www.quantum-espresso.org/Doc/INPUT_BANDS.html)
- [COD entry 9013102](https://www.crystallography.net/cod/9013102.html)
