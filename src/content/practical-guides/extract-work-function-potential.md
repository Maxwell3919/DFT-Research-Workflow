---
topic_slug: surface-energy-and-work-function
guide_slug: extract-work-function-potential
title: Extract Side-Specific Work Functions from a Potential Profile
kind: implementation
tools:
  - python
status: reviewed
summary: Detect two field-free vacuum plateaus in a synthetic planar potential and subtract one compatible Fermi level without averaging unlike surfaces.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/work_function_potential.py
source_ids:
  - bengtsson-dipole-correction
  - vasp-work-function
  - gpaw-dipole-correction
media_ids:
  - work-function-potential
review: docs/reviews/2026-08-04-surface-energy-and-work-function.md
reviewed_at: "2026-08-04"
---

This guide isolates the post-processing logic behind `Φ = E_vac - E_F`. Its analytic fixture mimics an asymmetric slab: atomic-scale oscillations occupy the middle, while the two sides approach different constant vacuum levels.

## Define windows before reading values

The script selects left and right vacuum windows by position, then records the mean and span of each. The span is the first gate: a region with a residual slope is not accepted merely because one grid point looks plausible. A real parser should also retain the original potential grid, surface normal, smoothing convention, charge-density evidence, and uncertainty from moving the window.

The VASP [official work-function workflow](https://vasp.at/wiki/Computing_the_work_function) defines the vacuum plateau and explicitly notes two surface-normal directions. The GPAW [dipole-layer tutorial](https://gpaw.readthedocs.io/tutorialsexercises/electrostatics/dipole_correction/dipole.html) demonstrates planar averaging and the need for field-free vacuum. Bengtsson's [primary method](https://doi.org/10.1103/PhysRevB.59.12301) explains the periodic-slab dipole correction.

## Preserve the two physical sides

The invented plateaus are `0.18` and `0.67 eV`, and the common fixture Fermi energy is `−4.65 eV`. The script therefore recovers `4.83` and `5.32 eV`. These numbers exist only to make the subtraction independently checkable. They are not defaults, expected material values, or recommendations.

## Rebuild the diagram

```text
python3 examples/practical-guides/work_function_potential.py \
  --svg public/media/practical-guides/surface-energy-and-work-function/extract-work-function-potential/work-function-potential.svg
```

The resulting original SVG labels both plateaus, the common Fermi level, and the slab region. It does not copy a software screenshot or publisher figure.

## What this guide verifies

The script verifies deterministic planar-profile generation, plateau-window arithmetic, plateau flatness, and side-specific work-function subtraction. It does not parse VASP, GPAW, Quantum ESPRESSO, or another electronic-structure output.

Execution success is not electrostatic or work-function convergence for a real slab. It establishes no physical dipole, vacuum width, surface state, electron chemical potential, or experimental emission property.

## Official sources

- [Bengtsson, dipole correction for surface supercells](https://doi.org/10.1103/PhysRevB.59.12301)
- [VASP official work-function workflow](https://vasp.at/wiki/Computing_the_work_function)
- [GPAW dipole-layer tutorial](https://gpaw.readthedocs.io/tutorialsexercises/electrostatics/dipole_correction/dipole.html)
