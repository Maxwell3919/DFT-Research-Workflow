---
topic_slug: interface-and-heterostructure-energetics
guide_slug: enumerate-lattice-matches-and-registry
title: Enumerate a Teaching Fixture of Lattice Matches and Registries
kind: implementation
tools:
  - python
status: reviewed
summary: Enumerate bounded integer supercell candidates for an invented two-dimensional lattice pair, then keep registry as a separate variable.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/interface_lattice_match.py
source_ids:
  - zur-mcgill
  - pymatgen-interface-docs
media_ids:
  - interface-lattice-match-map
review: docs/reviews/2026-08-04-interface-and-heterostructure-energetics.md
reviewed_at: "2026-08-04"
---

## Open candidate interfaces before choosing a match

Inspect both parent lattices and each shortlisted supercell in a viewer. Compare in-plane axes, strain partition, rotation, atom count, termination, registry, shortest contacts, thickness, and vacuum from top and side views. A human should reject geometrically nonsensical candidates before any expensive relaxation and should preserve an image or structure file for each retained match. Use [visual and symmetry tools](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry) and [specialist interface tools](/DFT-Research-Workflow/operations/resource-landscape/#specialist-tools).

**Audit the stored fixture:** the current mismatch map is an invented, secondary enumeration diagram. Its dots do not show atoms, termination, registry, separation, or a relaxed interface, so the companion script supports only the bounded integer-matching demonstration.

Run the bounded teaching enumeration:

```bash
python3 examples/practical-guides/interface_lattice_match.py \
  --svg public/media/practical-guides/interface-and-heterostructure-energetics/enumerate-lattice-matches-and-registry/interface-lattice-match-map.svg
```

The command enumerates diagonal integer repetitions for two invented square lattices, sorts the retained pairs by its declared scalar mismatch, adds three named fractional translations, and writes the SVG. It does not read material structures, execute the Zur--McGill method, or run DFT.

## Purpose

The fixture output lists integer pairs, repeated lengths, mismatch, and registry labels. Its lattice constants and retained range are invented. Rotations, general integer matrices, terminations, strain partition, relaxation, electrostatics, and proof of completeness are deliberately absent, so no fixture value is a recommended mismatch threshold.

For a real interface, begin with accepted parent cells and record the orientation relationship. Use a systematic matcher such as the [Zur--McGill construction](https://doi.org/10.1063/1.333084) or documented [pymatgen interface tools](https://pymatgen.org/pymatgen.analysis.interfaces.html), then preserve every transformation matrix, residual strain tensor, area, and applied strain allocation. Reject candidates that exceed the study's physical or computational boundary; do not infer that the smallest scalar mismatch is the best interface.

For each retained cell, enumerate terminations and lateral translations as separate variables. Relax under one policy, inspect the final registry, deduplicate equivalent outcomes, and retain metastable contacts. A matched periodic cell is candidate geometry only; energy, stability, and convergence come from later calculations and ledgers.

Successful fixture execution verifies bounded enumeration, sorting, mismatch arithmetic, registry labels, and rendering. It does not validate a production matcher, identify a real commensurate interface, establish strain convergence, or find a stable registry.

## Official sources

- [Zur and McGill, lattice-match construction](https://doi.org/10.1063/1.333084)
- [pymatgen interface documentation](https://pymatgen.org/pymatgen.analysis.interfaces.html)
