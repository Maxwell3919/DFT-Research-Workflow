---
topic_slug: time-dependent-response-and-spectroscopy
guide_slug: check-time-dependent-response-ledger
title: Check a Time-Dependent Response Ledger
kind: worked-example
tools:
  - python
status: reviewed
summary: Reject a direct spectral comparison when perturbation, observable, or response representation differs.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/time_dependent_response_ledger.py
source_ids:
  - runge-gross-tddft
  - casida-linear-response
  - octopus-response-tutorial
media_ids:
  - time-dependent-response-ledger
review: docs/reviews/2026-08-04-time-dependent-response-and-spectroscopy.md
reviewed_at: "2026-08-04"
---

This deterministic fixture uses invented response metadata. It accepts a comparison only when the perturbation, reported observable, geometry convention, and response representation have the same declared meaning.

## What this example does not establish

It does not propagate time-dependent Kohn--Sham equations, solve a Casida or Sternheimer equation, construct a response kernel, calculate an excitation, transform a time trace, establish linearity, convergence, a lifetime, or a material spectrum. Metadata compatibility is necessary for a direct comparison but never validates either calculation.

## Primary sources

- [Runge and Gross, TDDFT](https://doi.org/10.1103/PhysRevLett.52.997)
- [Casida, linear-response TDDFT](https://doi.org/10.1103/PhysRevA.71.032514)
- [Octopus optical-response tutorials](https://octopus-code.org/documentation/main/tutorial/response/)
