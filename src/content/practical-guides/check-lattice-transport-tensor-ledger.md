---
topic_slug: lattice-thermal-transport
guide_slug: check-lattice-transport-tensor-ledger
title: Check a Lattice-Transport Tensor Ledger
kind: implementation
tools:
  - python
status: reviewed
summary: Keep invented modal arithmetic separate from calculated phonon lifetimes, RTA, LBTE, and material transport claims.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/thermal_transport_tensor_ledger.py
source_ids:
  - phono3py-direct-lbte
  - phono3py-api
media_ids:
  - lattice-transport-tensor-ledger
review: docs/reviews/2026-08-04-lattice-thermal-transport.md
reviewed_at: "2026-08-04"
---

This deterministic fixture multiplies invented heat-capacity, velocity, and response factors. An explicit zero-response row illustrates excluded boundary physics rather than modelling a boundary.

## Run the deterministic ledger

```text
python3 examples/practical-guides/thermal_transport_tensor_ledger.py \
  --svg public/media/practical-guides/lattice-thermal-transport/check-lattice-transport-tensor-ledger/lattice-transport-tensor-ledger.svg
```

## What this guide verifies

Execution verifies invented modal multiplication, declared normalization text, an excluded row, and original SVG rendering. It does not calculate phonons, heat capacity, group velocity, lifetime, RTA, LBTE, Wigner transport, boundary scattering, or material thermal conductivity.

## Official sources

- [Phono3py direct LBTE documentation](https://phonopy.github.io/phono3py/direct-solution.html)
- [Phono3py API reference](https://phonopy.github.io/phono3py/api-reference.html)
