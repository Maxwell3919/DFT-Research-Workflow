---
topic_slug: fermi-surface-and-full-brillouin-zone-analysis
status: reviewed
---

## Rotate the full-zone object

Load dense-mesh eigenvalues into a Fermi-surface viewer such as FermiSurfer, XCrySDen, PyProcar, or an equivalent code-specific tool. Display the Brillouin-zone boundary, rotate the isosurface, identify sheets and pockets, and inspect whether apparent crossings survive changes in mesh and interpolation. Keep the exact energy reference and band selection visible.

A connected line through unrelated mesh points is not a Fermi surface, and a high-symmetry band path cannot exclude an off-path pocket. Find suitable [electronic-property tools](/DFT-Research-Workflow/operations/resource-landscape/#electronic-properties), [visual tools](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry), and [specialist post-processing routes](/DFT-Research-Workflow/operations/resource-landscape/#specialist-tools) before making a topology or metallicity claim.

Use a full-Brillouin-zone calculation when the question depends on where a band reaches a chosen energy: a possible Fermi-surface sheet, pocket, neck, off-path crossing, or extremum. Start from an accepted structure and electronic reference state, then create a compatible uniform-zone eigenvalue field. [Compare a Full-Zone Isovalue with a Band-Path Crossing](/DFT-Research-Workflow/operations/fermi-surface-and-full-brillouin-zone-analysis/guides/compare-full-zone-isovalue-and-band-path/) reconstructs a real QE 7.5 aluminium mesh and path while keeping sampled crossings separate from a converged Fermi-surface claim.

## Produce the full-zone state

Prepare compatible `scf.in` and `nscf.in` files with the same structure, pseudopotentials, basis settings, charge, spin/SOC treatment, Hubbard definition, `prefix`, and accessible `outdir`. Choose a uniform mesh and enough bands for the energy window being searched.

```bash
pw.x -in scf.in > scf.out
grep -F "convergence has been achieved" scf.out
grep -F "JOB DONE." scf.out
```

This establishes the parent density and checks, separately, the electronic solver message and normal program termination. It does not establish full-zone resolution.

```bash
pw.x -in nscf.in > nscf.out
grep -F "JOB DONE." nscf.out
```

The NSCF run supplies eigenvalues over the declared uniform mesh. Preserve the coordinates and weights actually represented; disabling symmetry may be useful when a downstream format needs every grid point, but it is not a universal requirement and does not make the mesh converged.

## A high-symmetry path cannot establish a Fermi surface

A path calculation may be generated from the same accepted state for visual comparison:

```bash
pw.x -in bands.in > bands.out
grep -F "JOB DONE." bands.out
```

This produces eigenvalues only on the requested lines. A path crossing is not a substitute for the full-zone field and cannot prove metallicity, a pocket, or a fundamental gap.

## The object is an equal-energy set over the full zone

For band $n$, an equal-energy sheet at chemical potential $\mu$ satisfies

$$
\varepsilon_n(\mathbf{k})=\mu.
$$

Use $\mu$ and $\varepsilon_n(\mathbf{k})$ from the same electronic state. Keep the reciprocal basis, periodic-zone convention, mesh, weights, band and spin/SOC labels, occupations, and interpolation method with the surface or contour. In three dimensions the object is generally a surface; in two dimensions it is a contour. A slab calculation should not be presented as an ordinary three-dimensional bulk surface without addressing the intended dimensional reciprocal manifold.

Inspect point and band counts, energy range, finite eigenvalues, chemical-potential marker, coordinate order, and the scalar-field or vertex artifact used by the renderer. A screenshot alone cannot recover the band assignment, pocket volume, mesh, or isovalue.

## Interpolation makes a dense mesh practical, not automatically reliable

If Wannier interpolation supplies a denser grid, compare direct and interpolated eigenvalues at held-out points near every claimed sheet. Preserve the subspace, projections, disentanglement and frozen windows, spinor treatment, and interpolation version. A dense smooth surface can still be wrong near a crossing.

## Electron and hole labels require a declared reference

Electron- and hole-like labels require local curvature and filling in the declared band model, not the apparent convexity of one rendering. Luttinger's relation connects the volume enclosed by a Fermi surface to particle density only under its stated translational and many-body assumptions; a Kohn--Sham isosurface is not automatically an experimental carrier density.

## Test the feature before naming it

Refine the uniform mesh and vary the isovalue over the numerical and physical uncertainty relevant to the question. Repeat the check for basis settings, number of bands, occupations or smearing, structural and magnetic candidates, and SOC treatment. A pocket, neck, touching point, or topology that disappears under these tests is not established.

Supercells and magnetic order fold the zone; compare with a primitive-cell result only after an explicit mapping or unfolding. For noncollinear SOC, a "spin-up" sheet is generally a projection onto a declared axis rather than a conserved quantum number.

## Geometry alone is not a transport calculation

The band velocity is

$$
\mathbf{v}_n(\mathbf{k})=\frac{1}{\hbar}\nabla_{\mathbf{k}}\varepsilon_n(\mathbf{k}),
$$

but sheet geometry and velocity do not supply scattering times, interactions, contacts, or a conductivity tensor. A nesting-like geometry does not establish an instability, electron-phonon coupling, superconductivity, or density-wave response without the corresponding calculation.

## What this topic establishes

A converged full-zone field can support a state-specific equal-energy geometry for the declared model, mesh or validated interpolation, and isovalue. It does not establish an experimental Fermi surface, carrier concentration, effective mass, scattering rate, conductivity, quantum-oscillation frequency, instability, superconductivity, topology, material stability, or device performance. Preserve the parent state, full field, mesh/isovalue sensitivity, any path comparison, interpolation checks, rendering method, machine-readable surface data, and hashes.

## Sources and methods

- [Bloch, wave functions in periodic potentials](https://doi.org/10.1007/BF01341914)
- [Kohn and Sham, self-consistent equations](https://doi.org/10.1103/PhysRev.140.A1133)
- [Luttinger, Fermi surface and equilibrium properties](https://doi.org/10.1103/PhysRev.119.1153)
- [Marzari and Vanderbilt, maximally localized Wannier functions](https://doi.org/10.1103/PhysRevB.56.12847)
- [Yates and co-workers, Fermi-surface properties from Wannier interpolation](https://doi.org/10.1103/PhysRevB.75.195121)
- [Wannier90 Fermi-surface parameters](https://wannier90.readthedocs.io/en/latest/user_guide/wannier90/parameters/)
- [Wannier90 copper Fermi-surface tutorial](https://wannier90.readthedocs.io/en/latest/tutorials/tutorial_6/)
- [Quantum ESPRESSO band/Fermi-surface post-processing guide](https://quantum-espresso.org/Doc/pp_user_guide/node8.html)
