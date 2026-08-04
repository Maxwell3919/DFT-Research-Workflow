---
topic_slug: diffusion-barriers
guide_slug: check-diffusion-network-ledger
title: Check a Diffusion-Network Ledger
kind: worked-example
tools:
  - python
status: reviewed
summary: Keep invented hop-network arithmetic separate from a calculated barrier or diffusivity.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/diffusion_network_ledger.py
source_ids:
  - ase-neb
  - vineyard-frequency-factor
media_ids:
  - diffusion-network-ledger
review: docs/reviews/2026-08-04-diffusion-barriers.md
reviewed_at: "2026-08-04"
---

This deterministic fixture combines explicitly invented jump multiplicity, length, correlation factor, and rate labels. It does not infer any one of them from a path calculation.

## What this example does not establish

It verifies invented network arithmetic and original SVG rendering. It does not construct an NEB, locate a saddle point, calculate a barrier, vibrational free energy, prefactor, hop rate, material diffusion coefficient, or transport conclusion.

## Official sources

- [ASE NEB documentation](https://docs.ase-lib.org/ase/neb.html)
- [Vineyard frequency-factor method](https://doi.org/10.1016%2F0022-3697%2857%2990059-8)
