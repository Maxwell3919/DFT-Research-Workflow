---
topic_slug: finite-temperature-structural-sampling
guide_slug: check-structural-sampling-window-overlap
title: Check Structural-Sampling Window Overlap
kind: worked-example
tools:
  - python
status: reviewed
summary: Distinguish declared neighbouring support from a valid reweighted free-energy estimate.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/structural_sampling_overlap.py
source_ids:
  - torrie-valleau-umbrella
  - kumar-wham
media_ids:
  - structural-sampling-window-overlap
review: docs/reviews/2026-08-04-finite-temperature-structural-sampling.md
reviewed_at: "2026-08-04"
---

This deterministic fixture uses invented discrete supports for three nominal umbrella windows. It checks only that each neighbouring pair shares declared bins.

## What this example does not establish

It does not run a trajectory, define a collective variable, apply a bias, estimate autocorrelation, solve WHAM, reweight a distribution, calculate a free-energy surface, or support a material conclusion. Window overlap is necessary for many combined estimators but never sufficient evidence for sampling adequacy.

## Primary sources

- [Torrie and Valleau, umbrella sampling](https://doi.org/10.1016%2F0021-9991%2877%2990121-8)
- [Kumar et al., WHAM](https://doi.org/10.1002/jcc.540130812)
