---
topic_slug: chemical-bonding-analysis
guide_slug: integrate-a-declared-cohp-energy-window
title: Integrate a Declared COHP Energy Window
kind: implementation
tools:
  - python
status: reviewed
summary: Use an invented pair curve to make sign, energy zero, and integration limits explicit.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/cohp_window_fixture.py
source_ids:
  - dronskowski-bloechl-cohp
  - deringer-plane-wave-cohp
media_ids:
  - cohp-window-fixture
review: docs/reviews/2026-08-04-chemical-bonding-analysis.md
reviewed_at: "2026-08-04"
---

The fixture uses invented energy-resolved pair contributions. It demonstrates a declared sign convention and occupied-window integration, not a projected calculation for a real material.

## Run the deterministic ledger

```text
python3 examples/practical-guides/cohp_window_fixture.py \
  --svg public/media/practical-guides/chemical-bonding-analysis/integrate-a-declared-cohp-energy-window/cohp-window-fixture.svg
```

[Dronskowski and Blöchl](https://doi.org/10.1021/j100135a014) define COHP as an energy-resolved pair construction. [Deringer, Tchougréeff, and Dronskowski](https://doi.org/10.1021/jp202489s) describe the plane-wave projection boundary.

## What this guide verifies

Execution verifies deterministic invented-term arithmetic and SVG rendering. It does not project wavefunctions, evaluate charge spilling, calculate COHP/COOP for a material, establish a bond strength, or establish a scientific conclusion.

## Official sources

- [COHP original method](https://doi.org/10.1021/j100135a014)
- [Plane-wave COHP projection](https://doi.org/10.1021/jp202489s)
