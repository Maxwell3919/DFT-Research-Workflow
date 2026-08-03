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

This companion script is deliberately smaller than a production lattice matcher. It enumerates diagonal integer repetitions for two invented square lattices and reports their scalar mismatch. It makes the search boundary visible: neither rotations nor general integer matrices, terminations, strain partition, relaxation, or a proof of completeness are included.

## A matched cell is not a selected interface

The [Zur--McGill method](https://doi.org/10.1063/1.333084) is a systematic superlattice search, and the [pymatgen interface documentation](https://pymatgen.org/pymatgen.analysis.interfaces.html) describes coherent-interface construction tools. This fixture does not implement either full method. Its useful lesson is narrower: a chosen periodic cell is only one candidate, while translation or registry must still be sampled and relaxed.

## Run the bounded enumeration

```text
python3 examples/practical-guides/interface_lattice_match.py \
  --svg public/media/practical-guides/interface-and-heterostructure-energetics/enumerate-lattice-matches-and-registry/interface-lattice-match-map.svg
```

The output lists the bounded integer pairs, repeated lengths, mismatch, and three named fractional translations for each retained candidate. The numeric lattice constants are invented teaching values, not a recommended mismatch criterion or a model for a material.

## What this guide verifies

Execution verifies deterministic enumeration, sorting, explicit mismatch arithmetic, registry labels, and SVG rendering. It does not validate a Zur--McGill implementation, identify a real commensurate interface, establish strain convergence, or find a stable registry.

## Official sources

- [Zur and McGill, lattice-match construction](https://doi.org/10.1063/1.333084)
- [pymatgen interface documentation](https://pymatgen.org/pymatgen.analysis.interfaces.html)
