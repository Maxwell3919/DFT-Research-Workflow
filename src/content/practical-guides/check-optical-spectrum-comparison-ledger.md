---
topic_slug: independent-particle-optical-properties
guide_slug: check-optical-spectrum-comparison-ledger
title: Check an Optical-Spectrum Comparison Ledger
kind: worked-example
tools:
  - python
status: reviewed
summary: Reject a pointwise spectrum comparison when the declared response component or representation differs.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/optical_spectrum_comparison_ledger.py
source_ids:
  - adler-dielectric-response
  - wiser-dielectric-constant
  - vasp-loptics
media_ids:
  - optical-spectrum-comparison-ledger
review: docs/reviews/2026-08-04-independent-particle-optical-properties.md
reviewed_at: "2026-08-04"
---

This deterministic fixture uses invented metadata rows. It accepts a comparison only when the two spectra declare the same response component, energy reference, broadening convention, and volume or sheet normalization.

## What this example does not establish

It does not calculate Kohn--Sham states, optical matrix elements, a dielectric function, Kramers--Kronig transform, absorption coefficient, quasiparticle correction, exciton, lifetime, or material spectrum. Matching labels is necessary for a direct comparison, not evidence that either spectrum is numerically converged or physically accurate.

## Primary sources

- [Adler, dielectric response](https://doi.org/10.1103/PhysRev.126.413)
- [Wiser, dielectric constant with energy bands](https://doi.org/10.1103/PhysRev.129.62)
- [VASP `LOPTICS` documentation](https://vasp.at/wiki/index.php/LOPTICS)
