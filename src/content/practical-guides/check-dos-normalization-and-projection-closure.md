---
topic_slug: density-of-states-and-projected-density-of-states
guide_slug: check-dos-normalization-and-projection-closure
title: Reconstruct a Stored Total DOS and Define Closure Tests
kind: implementation
tools:
  - python
  - quantum-espresso
status: reviewed
summary: Reconstruct a bounded Silicon total-DOS plot from stored Quantum ESPRESSO 7.5 SCF, uniform-NSCF, and dos.x output, then define the electron-count and projected-weight closure tests that remain unperformed.
tested_versions:
  - Python 3.12
  - Quantum ESPRESSO 7.5
execution_script: examples/practical-guides/dos_projection_closure.py
source_ids:
  - qe-dos-docs
  - qe-projwfc-docs
  - vasp-doscar
  - vasp-lorbit
  - cod-9013102
media_ids:
  - silicon-qe-total-dos
review: docs/reviews/2026-08-04-density-of-states-and-projected-density-of-states.md
reviewed_at: "2026-08-04"
---

## Purpose

Create a compatible dense uniform-zone state, run QE total-DOS and projected-DOS post-processing, inspect the real files, plot a declared energy reference, and test sampling, normalization, and projection closure without turning one finished run into a convergence claim.

## Prepare a uniform-zone parent

DOS and PDOS start from a trusted fixed-geometry SCF state and a denser **uniform** NSCF mesh. Do not reuse a high-symmetry band-path calculation. Keep the structure, pseudopotential, cutoffs, spin/SOC state, charge, and `prefix` compatible with the accepted parent; choose enough `nbnd` to cover the requested unoccupied-energy window.

The retained Silicon case used the same 12 x 12 x 12 mesh, eight bands, energy range, and cutoffs shown below; those are case values, not recommendations. Its immutable historical `dos-nscf.in` set `restart_mode='restart'` and did execute, but QE 7.5 does not document that value as a valid new NSCF recipe. The corrected reusable input below has not been substituted into the historical evidence or claimed as a retained rerun.

This is a new NSCF calculation that consumes compatible parent SCF data through the matching `prefix` and `outdir`; it is not an interrupted-run continuation. QE 7.5 explicitly excludes NSCF calculations from `restart_mode='restart'`, so keep `restart_mode='from_scratch'`.

```qe
&CONTROL
  calculation = 'nscf', restart_mode = 'from_scratch',
  prefix = 'si_cod9013102', outdir = './out', pseudo_dir = './pseudo',
/
&SYSTEM
  ibrav = 0, nat = 2, ntyp = 1,
  ecutwfc = 40.0, ecutrho = 320.0,
  occupations = 'tetrahedra', nbnd = 8,
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
12 12 12 0 0 0
```

For a metal, the k mesh and smearing/integration treatment are coupled choices: retain the accepted SCF occupations, run a denser uniform NSCF calculation with a documented integration method, and test the DOS feature or Fermi-level quantity against both sampling and broadening. Do not mix curves generated with different normalization or spin conventions without relabelling them.

Create `dos.x.in` for total DOS:

```qe
&DOS
  prefix = 'si_cod9013102',
  outdir = './out',
  fildos = 'si.dos.dat',
  Emin = -12.0,
  Emax = 12.0,
  DeltaE = 0.05,
/
```

If orbital or atom projections are required, create `projwfc.in` from the same NSCF parent. `filpdos` is a filename stem; `projwfc.x` writes one total-projection file and atom/wavefunction-resolved files whose names encode the projector.

```qe
&PROJWFC
  prefix = 'si_cod9013102',
  outdir = './out',
  filpdos = 'si.pdos',
  Emin = -12.0,
  Emax = 12.0,
  DeltaE = 0.05,
/
```

## Run, monitor, and inventory the output

```bash
pw.x -in scf.in > scf.out 2> scf.err; printf '%s\n' "$?" > scf.exit
pw.x -in dos-nscf.in > dos-nscf.out 2> dos-nscf.err; printf '%s\n' "$?" > dos-nscf.exit
dos.x -in dos.x.in > dosx.out 2> dosx.err; printf '%s\n' "$?" > dosx.exit
projwfc.x -in projwfc.in > projwfc.out 2> projwfc.err; printf '%s\n' "$?" > projwfc.exit
```

On Slurm, place the same ordered commands after the site's module/container setup and run each executable with the launcher required by the cluster. Stop the job after any failed stage; do not let a stale `prefix.save` make a later post-processor appear successful.

```bash
grep -E '^[[:space:]]+convergence has been achieved in[[:space:]]+[0-9]+ iterations[[:space:]]*$' scf.out | tail -1
for OUT in scf.out dos-nscf.out dosx.out projwfc.out; do
  printf '%s: ' "$OUT"
  grep -F "JOB DONE." "$OUT" | tail -1
done
grep -Ei "warning|error|stopping|not converged|c_bands" \
  scf.out scf.err dos-nscf.out dos-nscf.err dosx.out dosx.err \
  projwfc.out projwfc.err || true
head -n 5 si.dos.dat
ls -lh si.dos.dat si.pdos.pdos_tot si.pdos.pdos_atm* 2>/dev/null
```

The retained output begins:

```output
#  E (eV)   dos(E)     Int dos(E) EFermi =    6.655 eV
 -12.000  0.0000E+00  0.0000E+00
 -11.950  0.0000E+00  0.0000E+00
 -11.900  0.0000E+00  0.0000E+00
```

This shows the file format and the Fermi value written in the header. It does not prove electron-count normalization. Program termination, electronic convergence, non-empty data files, warning review, expected columns, energy coverage, and band coverage are separate checks.

## Plot with an explicit energy reference

The first manual plot can use columns 1 and 2 of `si.dos.dat`. Shift the x coordinate by the header's Fermi energy only when that is the intended reference; for a semiconductor, also state how the band edges were identified.

```gnuplot
set xlabel "E - E_F (eV)"
set ylabel "DOS (states/eV/cell)"
set arrow from 0,graph(0,0) to 0,graph(1,1) nohead dt 2
plot "si.dos.dat" using ($1-6.655):2 with lines title "12x12x12"
```

Save those lines as `plot-dos.gnuplot`, then run:

```bash
gnuplot -persist plot-dos.gnuplot
```

For PDOS, first read the generated headers and projector filenames. Plot compatible files on the same energy grid and label atom, angular momentum, spin channel, normalization, and energy zero. Do not describe projector weight as a unique atomic charge or bonding measure.

## Test the quantity you will interpret

Repeat the uniform NSCF and post-processing steps with a systematic mesh series such as 12 x 12 x 12, 16 x 16 x 16, and 20 x 20 x 20. That series is an example design, not a pass criterion. Keep structure, method, `nbnd`, energy window, grid spacing, and integration treatment fixed; give every mesh a separate `outdir` or archived output filename. Compare a table of the actual target: band edge, DOS at the Fermi level, peak position/area, occupied integral, or projected feature. For a metal, repeat the comparison over the justified smearing/broadening choices rather than declaring convergence from one diagonal mesh sequence.

Integrate under the declared per-cell/per-spin convention and compare the occupied-window result with the expected occupation only when the energy window and band set are complete. Compare summed projected weights with the total DOS on the same grid and report missing or unrepresented weight. Exact closure is not guaranteed for an incomplete or nonorthogonal projector set; renormalizing the PDOS to force closure hides that diagnostic.

## Retained evidence and next action

```bash
python3 examples/practical-guides/dos_projection_closure.py \
  --svg public/media/practical-guides/density-of-states-and-projected-density-of-states/check-dos-normalization-and-projection-closure/silicon-qe-dos.svg
```

The stored QE 7.5 case contains SCF, 12 x 12 x 12 NSCF, `dos.x`, and 481 total-DOS rows. It contains no `projwfc.x` output and performs no mesh, broadening, electron-count, or projection-closure test. The retained stages are separately recorded outputs; their historical save-tree continuity is not independently demonstrated by the public artifacts. Use the page to inspect the real file format, then run the denser-mesh and PDOS branches needed for your own observable. A DOS can test full-zone spectral weight, but a labelled band path remains useful for dispersion; neither replaces the other.

The reconstruction checks the committed total-DOS file and plot. It does not validate electron count, projection closure, parent-state ancestry, or DOS convergence.

## Official sources

- [Quantum ESPRESSO `dos.x` documentation](https://www.quantum-espresso.org/Doc/INPUT_DOS.html)
- [Quantum ESPRESSO `projwfc.x` documentation](https://www.quantum-espresso.org/Doc/INPUT_PROJWFC.html)
- [VASP `DOSCAR` documentation](https://vasp.at/wiki/DOSCAR)
- [VASP `LORBIT` documentation](https://vasp.at/wiki/LORBIT)
- [COD entry 9013102](https://www.crystallography.net/cod/9013102.html)
