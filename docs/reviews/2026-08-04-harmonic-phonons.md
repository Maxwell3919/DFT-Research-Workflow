# Scientific review — Harmonic Phonons

Reviewed 2026-08-04. The overview defines harmonic phonons from local force-constant curvature and a mass-weighted dynamical matrix, distinguishes DFPT from finite displacements, retains polar non-analytic and acoustic-sum-rule conditions, and diagnoses imaginary frequencies without making finite-temperature or synthesis claims. It is **reviewed within the declared educational and execution scope**.

The bound case contains a real QE 7.5 Silicon SCF followed by one Γ-point `ph.x` execution and retains its inputs, outputs, stderr, dynamical matrix, hashes, parsed frequencies, and original result figure. That evidence supports only the stated one-q-point transcription. It is not a q-grid, `q2r.x`/`matdyn.x` execution, dispersion, DOS, acoustic-sum closure, dynamical-stability result, thermal property, electron--phonon calculation, or scientific conclusion.

The complete QE q-grid, fresh dispersion/DOS plotting, and Phonopy 4.4 finite-displacement routes are implementation instructions checked against current official syntax. Their small helper self-tests validate parsers and SVG generation with synthetic fixtures; they do not claim that the documented full-q or finite-displacement calculations were executed. The guide keeps raw versus ASR-treated frequencies, numerical versus physical imaginary modes, and DFPT versus finite-displacement evidence separate.

Primary and official sources checked for semantic support and rendered-link inclusion:

- https://doi.org/10.1016/j.scriptamat.2015.07.021
- https://doi.org/10.1103/RevModPhys.73.515
- https://www.quantum-espresso.org/Doc/INPUT_PH.html
- https://www.quantum-espresso.org/Doc/INPUT_Q2R.html
- https://www.quantum-espresso.org/Doc/INPUT_MATDYN.html
- https://quantum-espresso.org/Doc/INPUT_DYNMAT.html
- https://www.quantum-espresso.org/Doc/ph_user_guide/node8.html
- https://phonopy.github.io/phonopy/phonopy.html
- https://phonopy.github.io/phonopy/setting-tags.html
