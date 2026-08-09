---
topic_slug: density-of-states-and-projected-density-of-states
status: reviewed
---

Calculate a density of states (DOS) when the question concerns how many electronic states occur in an energy interval across the Brillouin zone. A DOS needs an accepted structure and reference electronic state followed by a sufficiently dense, compatible uniform-zone calculation; a high-symmetry band path is not a DOS parent. [Check a DOS Integral and Projected-Weight Closure](/DFT-Research-Workflow/operations/density-of-states-and-projected-density-of-states/guides/check-dos-normalization-and-projection-closure/) reconstructs a real QE 7.5 total-DOS result and states explicitly which diagnostics were not validated.

## Run a total DOS from a uniform-zone state

Prepare `scf.in`, a denser compatible `dos-nscf.in`, and `dos.x.in`. Keep the structure, pseudopotentials, basis settings, charge, spin/SOC treatment, Hubbard definition, `prefix`, and accessible `outdir` consistent. The NSCF mesh, occupations, number of bands, and energy coverage must be chosen for the DOS question rather than copied from a path calculation.

```bash
pw.x -in scf.in > scf.out
grep -F "convergence has been achieved" scf.out
grep -F "JOB DONE." scf.out
```

This creates the parent density. The first check asks whether QE reported electronic SCF convergence; the second checks program termination only.

```bash
pw.x -in dos-nscf.in > dos-nscf.out
grep -F "JOB DONE." dos-nscf.out
dos.x -in dos.x.in > dosx.out
grep -F "JOB DONE." dosx.out
```

The uniform NSCF run supplies full-zone eigenvalues and weights. `dos.x` integrates them and writes the total-DOS file named by `fildos`. The markers show that the programs terminated; they do not establish mesh, broadening, energy-grid, empty-band, or DOS convergence.

If the question requires site- or orbital-projected weight, run the separate projector route against the same compatible state:

```bash
projwfc.x -in projwfc.in > projwfc.out
grep -F "JOB DONE." projwfc.out
```

`projwfc.x` produces projection-resolved files under its declared projector convention. This command is not evidence that the total-DOS example ran a PDOS calculation or that projected components close to the total.

## A DOS is a full-zone integration, not a band path

For the declared one-electron model,

$$
g(E) = \sum_n \int_{\mathrm{BZ}} \delta\!\left(E-\varepsilon_n(\mathbf{k})\right)\,\frac{d\mathbf{k}}{\Omega_{\mathrm{BZ}}}.
$$

Record the mesh and weights, symmetry reduction, integration or smearing rule, broadening, energy grid, number of bands, occupations, spin/SOC state, energy reference, and normalization. States/eV/cell, states/eV/formula unit, states/eV/atom, and per-spin values are not interchangeable.

## Discrete eigenvalues need a stated integration method

Finite meshes replace delta functions with a declared tetrahedron or smearing construction. Increasing it merges nearby peaks when the broadening width is enlarged, while a smaller width can expose an insufficient mesh. Changing the kernel can make a smooth curve; a smooth curve may be a consequence of the chosen kernel rather than a physical feature.

The integrated DOS,

$$
N(E)=\int_{-\infty}^{E} g(E')\,dE',
$$

can be compared with the expected occupation under a declared normalization and integration convention. Treat that comparison as a diagnostic that must be carried out, not as an automatic PASS: agreement does not prove adequate k sampling or spectral accuracy, and disagreement can arise from the energy window, band count, grid, normalization, or parser.

## Projected DOS is a partition chosen by a projector

A projected DOS uses weights from a specified subspace,

$$
g_A(E)=\sum_n \int_{\mathrm{BZ}} w_{A,n}(\mathbf{k})\,\delta\!\left(E-\varepsilon_n(\mathbf{k})\right)\,\frac{d\mathbf{k}}{\Omega_{\mathrm{BZ}}}.
$$

Compare the sum of displayed projections with the total DOS on the same grid and report the residual. Incomplete or nonorthogonal projectors, interstitial weight, truncation, and normalization choices can prevent exact closure. Do not silently renormalize components until they add up, and do not infer a basis-independent bond or oxidation state from a projector label.

## Spin, spinors, and orbital labels need their own meaning

Collinear spin channels use a declared quantization axis. With noncollinear SOC, an up/down curve can instead be a spinor projection onto a chosen axis. Preserve that axis, the magnetic state, SOC setting, local orbital convention, and projector definition before interpreting spin or orbital weight.

## Set the energy reference before comparing curves

Displaying $E-E_F$ is a convention for one calculation. Separate compositions, charge states, surfaces, interfaces, or Hamiltonians need a physically justified common alignment before their curves support an energy comparison.

## Decide whether the DOS is usable

Inspect the produced file header, energy range, grid spacing, Fermi or chosen alignment reference, spin channels, finite values, and expected number of rows. Then repeat the calculation while changing the full-zone mesh, integration method or broadening, energy grid, number of bands, and any state variable relevant to the intended conclusion. Compare the actual target: near-edge DOS, a peak separation, integrated weight, spin asymmetry, or another stated observable. A smooth curve alone is not convergence.

A DOS integrates full-zone weight but does not locate a band edge or pocket. A low-DOS interval needs a full-zone extremum search before it supports a gap claim, and a band path cannot establish that search. Plot broadening is not a quasiparticle lifetime; aligning separate curves at their reported $E_F$ values is not a band offset.

## DOS is not a measured spectral function

Photoemission, tunnelling, and optical spectra include matrix elements, resolution, temperature, surface sensitivity, excitations, and possibly many-body self-energy. Numerical DOS broadening is not a calculated lifetime, and visual agreement with an experimental peak is not observable-level validation.

## What this topic establishes

A converged and normalized DOS can support energy-resolved state counts for the declared model and integration procedure. A declared projection can support a basis-dependent decomposition with a reported closure diagnostic. It does not establish a band-edge location, reciprocal-space pocket, fundamental or experimental gap, chemical bond, charge transfer, oxidation state, magnetic mechanism, quasiparticle spectrum, transport coefficient, material stability, or device performance. Preserve total and projected arrays, inputs, parent-state identity, integration settings, diagnostics, convergence series, plotting transforms, and source hashes.

## Sources and methods

- [Bloch, wave functions in periodic potentials](https://doi.org/10.1007/BF01341914)
- [Kohn and Sham, self-consistent equations](https://doi.org/10.1103/PhysRev.140.A1133)
- [Blöchl, Jepsen, and Andersen, improved tetrahedron integration](https://doi.org/10.1103/PhysRevB.49.16223)
- [Methfessel and Paxton, high-precision sampling](https://doi.org/10.1103/PhysRevB.40.3616)
- [Marzari and co-workers, cold smearing](https://doi.org/10.1103/PhysRevLett.82.3296)
- [Quantum ESPRESSO `dos.x` documentation](https://www.quantum-espresso.org/Doc/INPUT_DOS.html)
- [Quantum ESPRESSO `projwfc.x` documentation](https://www.quantum-espresso.org/Doc/INPUT_PROJWFC.html)
- [VASP `DOSCAR` documentation](https://vasp.at/wiki/DOSCAR)
- [VASP `LORBIT` documentation](https://vasp.at/wiki/LORBIT)
