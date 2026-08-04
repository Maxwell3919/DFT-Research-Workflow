# Silicon ground-state and electronic-structure evidence chain

This terminal-first teaching case reconstructs a continuous, evidence-bound
Quantum ESPRESSO 7.5 workflow for the two-atom diamond-Si primitive cell
derived from COD 9013102.  It preserves the actual public inputs and compact
outputs needed to inspect the following recorded stages: a 3 by 3 cutoff/
k-mesh matrix, fixed-cell relaxation, a restart pair, SCF, line-path bands,
uniform-mesh NSCF plus `dos.x`, Gamma-point phonons, and Gamma-point
`epsil=.true.` response.

The model is PBE with the scalar-relativistic ultrasoft
`Si.pbe-n-rrkjus_psl.1.0.0.UPF` identified by filename, source and SHA-256 in
`source/pseudopotentials.json`; the UPF body is deliberately not redistributed.
The fixed 8 by 8 by 8 SCF uses 40 Ry / 320 Ry wavefunction/charge-density
cutoffs, and the DOS NSCF uses 12 by 12 by 12.  These are recorded settings,
not transferable recommendations.

Run the byte-checked reconstruction and acceptance checks:

```bash
bash replay-derived.sh
bash extract.sh
bash check.sh
```

`run.sh` records the actual QE program order used for the public evidence,
including the corrected full-zone SCF -> `bands` -> `bands.x` chain. It
accepts `QE_PW`, `QE_BANDS`, `QE_DOS`, `QE_PH`, `QE_LAUNCHER`, and `PSEUDO_DIR`
only where a separately supplied potential is staged; it intentionally stops
before execution unless a separately obtained UPF with the
declared hash is supplied at `pseudo/Si.pbe-n-rrkjus_psl.1.0.0.UPF`; it never
uses a redistributed potential. `derived/full-zone-status.json` and its table
are reconstructed directly from the corrected 260-point, eight-band raw data.
They remain a bounded 8x8x8 sample, not a converged gap result.

The six gates are deliberately independent.  Completed QE markers and parser
success support stored-output provenance, not cutoff/k-mesh/DOS/phonon/
dielectric convergence, a fundamental band gap, stability, or experimental
agreement.
