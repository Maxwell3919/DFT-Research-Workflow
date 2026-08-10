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
media_ids: []
review: docs/reviews/2026-08-04-surface-energy-and-work-function.md
reviewed_at: "2026-08-04"
---

## Inspect the potential curve beside the slab

Open the slab in side view and identify its vacuum direction, inequivalent surfaces, and dipole orientation. Plot the planar or macroscopic potential on the same spatial coordinate, zoom into each vacuum region, and manually decide whether a field-free plateau exists. Read the Fermi energy from a compatible reference calculation and record the side of the slab to which each value belongs. Use [visual tools](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry), [electronic-property tools](/DFT-Research-Workflow/operations/resource-landscape/#electronic-properties), and [specialist post-processing](/DFT-Research-Workflow/operations/resource-landscape/#specialist-tools).

**Optional plateau check:** the potential profile is synthetic and conceptual. Use it only after plotting a real potential beside its slab; the script demonstrates window arithmetic and subtraction, not a real electrostatic output or converged work function.

Run the analytic plateau fixture:

```bash
python3 examples/practical-guides/work_function_potential.py
```

The command generates its own synthetic planar potential, checks two predefined plateau windows, and subtracts one compatible fixture Fermi level. It does not read VASP, GPAW, Quantum ESPRESSO, or another real calculation output.

## What this guide verifies

Choose a plateau by inspecting the field. For a real slab, retain the code-specific potential grid, surface normal, potential-component definition, averaging or smoothing convention, charge-density evidence for vacuum, and $E_F$ from the same energy gauge. Plot the profile before choosing any scalar vacuum level.

For each side, declare a charge-free window and record its mean, span, and slope. A field-free plateau, not a single endpoint, supplies $E_{\mathrm{vac}}$. Then calculate

$$
\Phi_{\mathrm{side}}=E_{\mathrm{vac,side}}-E_F.
$$

The fixture plateaus are `0.18` and `0.67 eV`, and its Fermi energy is `-4.65 eV`; the resulting `4.83` and `5.32 eV` values make the arithmetic inspectable. They are invented test values, not defaults or expected material results.

## Check the plateau before accepting the subtraction

Preserve left and right values separately for an asymmetric slab. Move each window within the charge-free region, increase vacuum and slab thickness, and inspect whether the plateau mean and slope remain stable. Compare corrected and uncorrected profiles when a dipole correction is used. The correction defines a boundary model; it does not by itself prove a physical dipole, adequate vacuum, or isolated-surface convergence.

Reject the extraction when the vacuum is sloped, the chosen window overlaps charge density or a correction discontinuity, the value changes materially with the window, or $E_F$ comes from an incompatible calculation. For a semiconductor, document whether the intended reference is $E_F$, the VBM, or the CBM.

Successful fixture execution verifies only deterministic profile generation, window arithmetic, plateau-flatness checks, side-specific subtraction, and rendering. It establishes no real work function, surface state, electrostatic convergence, electron chemical potential, or emission property.

## Official sources

- [Bengtsson, dipole correction for surface supercells](https://doi.org/10.1103/PhysRevB.59.12301)
- [VASP official work-function workflow](https://vasp.at/wiki/Computing_the_work_function)
- [GPAW dipole-layer tutorial](https://gpaw.readthedocs.io/tutorialsexercises/electrostatics/dipole_correction/dipole.html)
