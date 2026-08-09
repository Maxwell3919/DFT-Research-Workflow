# Aluminium metallic electronic structure (QE 7.5)

This terminal-first case assembles several real fcc-Al QE 7.5 evidence routes:
an initial captured SCF/NSCF/bands output set, a later isolated
SCF -> full-zone NSCF -> `dos.x` -> bands rerun, and still later exploratory
SCF screens. The initial output set does not retain its exact launcher, shell
exit transcript, save tree, or scheduler record, so the bundle is not presented
as one continuous historical execution. It records exact inputs, full stdout,
separate stderr, input/output hashes, and a compact human-readable excerpt. The inputs use
`occupations='smearing'`, Marzari-Vanderbilt smearing (`degauss=0.02 Ry`), and
an 8x8x8 mesh; those are settings from this run, not universal or converged
recommendations.

Run `python3 parse.py`, `bash extract.sh`, and `bash check.sh` to reproduce the
case-local checks and the CSV tables/PNG directly from captured QE stdout.
The source `fixture-*.csv` files are retained only as a historical audit aid;
the parser never reads them.

## What the captured NSCF output can support

The independently rerun `output/dos-route/nscf-full.out` prints a 512-point Cartesian k list, QE-printed weights,
and 512 blocks of four eigenvalues plus four occupations.  The parser joins the
eigenvalue blocks to that Cartesian list, rather than assuming an 8x8x8 weight.
Its printed weight sum is `1.9999744`; that small difference from 2 comes from
the displayed decimal precision.  The parser does not renormalize it.

`derived/al-dos-gaussian.csv` and `figures/al-dos-gaussian.png` use all 2,048
printed band values and the following recorded transformation:

```text
D(E) = sum(n,k) w_k / [sigma sqrt(2 pi)]
       * exp(-0.5 * ((E - (epsilon_nk - E_F))/sigma)^2)
sigma = 0.15 eV; E-E_F grid = -12.00 ... 16.00 eV in 0.01 eV steps
```

The table, metadata, figure, source-output SHA-256, grid integral, and Fermi
sample are generated together by `parse.py`.  This is a **Gaussian-broadened
representation of one printed NSCF eigenvalue sample**, distinct from the
separate `dos.x` output below.
It is useful for showing the raw-output-to-table-to-plot lineage, but it cannot
validate a DOS or any numerical parameter.

## Real `dos.x` rerun

An isolated Talos single-process QE 7.5 rerun used byte-identical committed
`scf.in`, `nscf.in`, `bands.in`, and `dos.in`.  Its SCF, full-zone NSCF,
`dos.x`, and bands stdout/stderr are in `output/dos-route/`; `al.dos` is the
real 2,801-row QE table.  `derived/al-dos-x.csv`, its metadata, and
`figures/al-dos-x.png` are parsed directly from that file.  The real DOS route
uses the `dos.in` absolute energy window -12 to 16 eV and a Gaussian
`degauss=0.0110248 Ry`; that is the same nominal 0.15 eV width as the
Gaussian representation, but it is a different energy reference/window.

The final integrated value in this `al.dos` window is deliberately not called
a total state count: the window ends at 16 eV while the printed four-band NSCF
data extends higher.  The rerun NSCF and bands output also retain their
`c_bands: 1 eigenvalues not converged` markers.  Normal exit and a DOS file do
not erase those warnings or establish a converged DOS.

The QE-printed timestamps from `04:21:54` through `04:22:02` on 2026-08-05
belong only to this isolated DOS route. They are not a case-wide start/completion
window and do not include the initial captured outputs or later screens.

`run.sh` is an opt-in native replay template for the ordering SCF, full-zone
NSCF, `dos.x`, then the path calculation. It is not the missing historical
launcher. It writes only in a new caller-selected external directory, so
the DOS program consumes the full-zone NSCF save state rather than the later
band-path state. It requires `QE_PW`, `QE_DOS`, `QE_PSEUDO_DIR`, and
`RUN_OUTPUT_ROOT`; it hash-checks the declared UPF and refuses a path that
already exists or overlaps committed evidence. The exact route is:

```bash
QE_PW=/absolute/path/to/pw.x QE_DOS=/absolute/path/to/dos.x \
QE_PSEUDO_DIR=/absolute/path/to/pseudos \
RUN_OUTPUT_ROOT=/new/external/al-dos-run \
bash run.sh
```

## Real exploratory SCF screens

Two isolated Talos SCF routes use `ibrav=0` plus explicit fcc primitive
`CELL_PARAMETERS bohr`. They keep the declared PBE pseudopotential identity,
cutoff, and metallic policy fixed. `output/convergence-screen/` and
`output/eos-screen/` contain all five inputs, stdout and empty stderr files for
each route; the runners still refuse to overwrite an existing runtime directory:

```bash
QE_PW=/absolute/path/to/pw.x QE_PSEUDO_DIR=/absolute/path/to/pseudos \
RUN_OUTPUT_ROOT=/new/external/al-convergence bash input/run-convergence-matrix.sh
QE_PW=/absolute/path/to/pw.x QE_PSEUDO_DIR=/absolute/path/to/pseudos \
RUN_OUTPUT_ROOT=/new/external/al-eos bash input/run-eos.sh
```

The five-SCF k-mesh/smearing matrix has a predeclared 10x10x10-to-12x12x12
reported-energy/Fermi-level comparison and two fixed-k smearing probes. Its
real screen result is **FAIL**: the tail differences are `0.00164525 Ry/cell`
and `0.2449 eV`, above its teaching thresholds. The parser preserves that
negative result in `derived/aluminium-convergence-assessment.json`; it is not
a program-exit failure, G4 result, or scientific-acceptance decision.

The five-point E(V) route emits a real E(V) CSV/PNG and reports the
mathematical sign/residual of a bounded quadratic interpolation. The existing
case record reports that its first parser attempt blocked an erroneous
hand-entered volume declaration; no standalone shell transcript for that failed
attempt is published.
the corrected values are the exact determinants `a^3/4` of the already-run
explicit cells, so no QE calculation was rerun. The corrected fit has positive
quadratic coefficient `2.3302788526587085e-05 Ry/bohr^6` and residual
`5.341119878061937e-05 Ry`. Those are bounded fit facts only, not a converged
EOS, equilibrium lattice constant, bulk modulus, pressure fit, elastic tensor,
or materials result.

G1 covers the initial captured and isolated rerun program exits. G2 only
covers the rerun SCF electronic threshold; it does not promote retained NSCF
or bands eigenvalue warnings. G3 confirms raw stage artifacts, the real
`al.dos`, ten screen SCF outputs, and derived lineage. The Gaussian
representation, one real `dos.x` sample, and exploratory screens do not provide observable-specific
G4 evidence; G4 remains `NOT TESTED` and G5 remains `NOT CLAIMED`.

## Obtain and verify the exact UPF

Download the potential into an external pseudopotential directory, verify the recorded byte count and SHA-256, and only then expose that directory to `run.sh`:

```bash
set -euo pipefail
QE_PSEUDO_DIR=/absolute/path/to/pseudo
upf="$QE_PSEUDO_DIR/Al.pbe-n-rrkjus_psl.1.0.0.UPF"
partial="$upf.part"

mkdir -p "$QE_PSEUDO_DIR"
curl --fail --location --proto '=https' --tlsv1.2 --output "$partial" 'https://pseudopotentials.quantum-espresso.org/upf_files/Al.pbe-n-rrkjus_psl.1.0.0.UPF'
test "$(wc -c < "$partial" | tr -d '[:space:]')" = '1500731'
printf '%s  %s\n' 'cc4f5dc6afe09c8f482dc7645e6e7cca546a55f8d907c71c825c62bf85a38d3e' "$partial" | sha256sum --check -
mv "$partial" "$upf"
```

The retrieved file was verified on 2026-08-09 as 1,500,731 bytes with SHA-256 `cc4f5dc6afe09c8f482dc7645e6e7cca546a55f8d907c71c825c62bf85a38d3e`; its UPF header reports generation by `atomic v6.3`. These checks establish the exact file identity and public source only. They do not establish pseudopotential transferability, cutoff or k-mesh convergence, or scientific validity.
