---
topic_slug: test-numerical-convergence
guide_slug: converge-k-points-and-smearing
title: Converge k-Point Sampling and Smearing
kind: implementation
tools:
  - quantum-espresso
  - python
status: reviewed
summary: Test Brillouin-zone sampling and occupation broadening as a coupled problem, especially when metallic states or Fermi-surface-sensitive observables are involved.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/silicon_qe_convergence.py
source_ids:
  - qe-pw-75
  - monkhorst-pack
  - methfessel-paxton
  - blochl-tetrahedron
  - cod-9013102
media_ids:
  - convergence-k-smearing-matrix
  - silicon-qe-kmesh-matrix
review: docs/reviews/2026-08-03-test-numerical-convergence.md
reviewed_at: "2026-08-03"
---

Run the declared companion:

~~~bash
python3 examples/practical-guides/silicon_qe_convergence.py > silicon-kmesh-reconstruction.json
less silicon-kmesh-reconstruction.json
~~~

It reconstructs a committed QE 7.5 Silicon matrix and its figure. A k-point label is meaningful only together with the reciprocal cell, offsets, symmetry treatment, occupations, and target observable.

The stored evidence is deliberately limited: the published Silicon inputs use <code>occupations='fixed'</code>, and the output filenames encode 6³, 8³, and 10³ meshes at 30, 40, and 50 Ry. The companion hashes and parses the outputs; it does not parse the inputs, execute QE, or test any smearing width.

Inspect that evidence:

~~~bash
find examples/practical-guides/data/silicon-qe/convergence -maxdepth 1 -type f -name 'si_e*_k*.out' | sort
grep -H "JOB DONE" examples/practical-guides/data/silicon-qe/convergence/si_e*_k*.out
grep -H "convergence has been achieved" examples/practical-guides/data/silicon-qe/convergence/si_e*_k*.out
grep -H "total energy" examples/practical-guides/data/silicon-qe/convergence/si_e*_k*.out
~~~

These commands check stored-file inventory, normal termination, the reported electronic solver condition, and printed energy lines. They do not establish k-point convergence for DOS, bands, a Fermi surface, phonons, or a metal.

## Design a metallic mesh-by-smearing study

For a metallic calculation, predeclare:

~~~text
target observable and units:
tolerance:
reciprocal-resolution series and offsets:
smearing kernels:
smearing widths and units:
energy or free-energy convention:
fixed structure, method, pseudopotential, cutoff, bands, symmetry, charge, and spin state:
state checks, including Fermi level and magnetization:
~~~

Use at least several mesh densities and several widths that span the material's integration regime. The values are study parameters, not universal defaults. Generate the complete input matrix before inspecting results.

Run the reader's prepared QE inputs with one naming rule:

~~~bash
mkdir -p metallic-convergence/outputs
for input in metallic-convergence/inputs/*.in; do
  name=$(basename "$input" .in)
  pw.x -in "$input" > "metallic-convergence/outputs/$name.out"
done
~~~

This is a protocol for a new metallic study. No such smearing outputs are supplied or claimed by the Silicon companion.

## Check, extract, and compare

Start with:

~~~bash
grep -H "JOB DONE" metallic-convergence/outputs/*.out
grep -H "convergence has been achieved" metallic-convergence/outputs/*.out
grep -HiE "total energy|fermi energy|smearing" metallic-convergence/outputs/*.out
~~~

The first command checks termination only. The second checks the electronic solver marker reported by QE. The third locates version-dependent energy, Fermi-level, and smearing lines for inspection; define a parser for the exact quantity used in the decision.

Forces, energy differences, DOS near $E_F$, Fermi-surface geometry, and electron–phonon integrals require their own extraction and tolerance. Force convergence does not establish DOS convergence, and DOS convergence does not establish phonon convergence.

## Decide on a two-dimensional stable region

Inspect denser meshes at fixed width, narrower widths at fixed mesh, and more than one dense-mesh/narrow-width combination. Do not accept agreement along one diagonal; coarse sampling and broad smearing can cancel.

Accept a point only when the target observable remains inside tolerance under both a denser mesh and a narrower or otherwise stricter integration treatment, with the same electronic state. Record the occupation function, width, entropy or free-energy convention, Fermi level, and residual uncertainty.

A smearing width used as a numerical integration device is not automatically a physical electronic temperature. Tetrahedra and smearing also have different force and integration properties; choose the method for the intended observable.

## What this guide verifies

The companion verifies stored-output hashes, marker presence, parsed total energies, and filename-encoded Silicon mesh coverage. It does not verify the input cell, potential, occupation mode, execution provenance, or a smearing series.

It does not establish a transferable k-point density, converge DOS or bands, resolve a Fermi surface, or establish a physical material property. The conceptual mesh-by-smearing figure is not a real calculation result.

## Official sources

- [Quantum ESPRESSO 7.5 <code>pw.x</code> input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [Monkhorst and Pack, special points for Brillouin-zone integrations](https://doi.org/10.1103/PhysRevB.13.5188)
- [Methfessel and Paxton, high-precision sampling for metals](https://doi.org/10.1103/PhysRevB.40.3616)
- [Blöchl, Jepsen, and Andersen, improved tetrahedron method](https://doi.org/10.1103/PhysRevB.49.16223)
- [Crystallography Open Database entry 9013102](https://www.crystallography.net/cod/9013102.html)
