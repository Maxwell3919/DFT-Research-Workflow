---
topic_slug: band-structure
status: reviewed
---

## Work from a labelled Brillouin-zone path and a real band plot

Upload or enter the accepted structure in a path generator such as SeeK-path, inspect the standardized cell, Brillouin zone, labels, and ordered segments, then preserve the returned path definition with the calculation. After execution, open the plotted eigenvalues with labelled ticks and an explicit energy reference; check discontinuities, missing bands, spin channels, and whether the path matches the recorded structure.

A high-symmetry path is a selected visualization, not full-zone evidence. Use [visual and symmetry tools](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry) for the reciprocal path, [electronic-property tools](/DFT-Research-Workflow/operations/resource-landscape/#electronic-properties) for plotting and inspection, and [literature sources](/DFT-Research-Workflow/operations/resource-landscape/#literature-learning) when comparing a reported gap or band character.

Use a band calculation when the question depends on eigenvalue dispersion along a declared reciprocal-space path: visible crossings, curvature, symmetry labels, or candidate band extrema. Start only after accepting a structure and a self-consistent electronic state. The real Quantum ESPRESSO 7.5 route in [Build a Reciprocal-Path Ledger Before Plotting Bands](/DFT-Research-Workflow/operations/band-structure/guides/build-reciprocal-path-ledger/) shows the complete SCF-to-path-to-`bands.x` lineage; [Compare a Band Path with a Full-Zone Extremum Search](/DFT-Research-Workflow/operations/band-structure/guides/compare-band-path-and-full-zone-extrema/) shows why the path cannot establish a fundamental gap or full-zone metallicity.

## Run from the accepted reference state

Prepare an SCF input and a compatible `calculation='bands'` input. They must use the same structure, pseudopotentials, basis settings, charge, spin/SOC treatment, Hubbard definition, `prefix`, and accessible `outdir`. Put the declared ordered path in `K_POINTS crystal_b` or the matching format for the QE version in use.

Run these commands only inside a prepared calculation directory containing the named inputs, pseudopotential receipt, and writable scratch path. The repository's stored Silicon files are evidence to inspect and reconstruct; they are not a universal launch directory.

```bash
pw.x -in scf.in > scf.out
grep -F "convergence has been achieved" scf.out
grep -F "JOB DONE." scf.out
```

`pw.x` creates the self-consistent parent density. The first `grep` checks the electronic solver condition reported by this run. The second checks normal program termination only; neither establishes basis, k-point, structural, or observable convergence.

```bash
pw.x -in bands.in > bands.out
grep -F "JOB DONE." bands.out
bands.x -in bands.x.in > bandsx.out
grep -F "JOB DONE." bandsx.out
```

The path-mode `pw.x` run diagonalizes the accepted Hamiltonian at the requested path points. `bands.x` reads that result and writes the file named by `filband`, with optional reordering or symmetry analysis controlled by its input. These termination checks do not show that the path, number of bands, energy reference, or target feature is adequate.

## The reciprocal cell is part of the result

Before plotting, inspect the path ledger rather than only the image. Record the direct and reciprocal cells, every fractional path coordinate in order, labels, cell standardization and path-generator version, number of bands, spin/SOC state, occupations, units, and energy reference. A primitive-cell path and a conventional- or supercell path are different reciprocal objects even when they describe the same crystal.

## What the plotted quantity is

For a periodic effective one-electron problem,

$$
\hat H_{\mathrm{KS}}(\mathbf{k}) u_{n\mathbf{k}} = \varepsilon_{n\mathbf{k}} u_{n\mathbf{k}}.
$$

A band plot joins selected $\varepsilon_{n\mathbf{k}}$ along the declared path. Its horizontal coordinate is cumulative path distance, not a real-space distance or a density of states. Labels such as $\Gamma$, $X$, $K$, and $L$ depend on the reciprocal cell and convention; they are not universal Cartesian points.

## A path is a visual cut, not a full-zone search

A high-symmetry path is a visual cut. It can miss a small Fermi pocket, an off-path crossing, or the true valence- and conduction-band extrema. Use an independently tested uniform full-zone mesh or a validated interpolation for claims about metallicity, directness, carrier valleys, or a fundamental eigenvalue gap. Conversely, a dense uniform mesh does not replace the readable path plot: retain which dataset supports each statement.

## Gap labels require their own definitions

For a single specified eigenvalue model, define the full-zone eigenvalue gap as

$$
E_g = \min_{\mathbf{k}} \varepsilon_c(\mathbf{k}) - \max_{\mathbf{k}} \varepsilon_v(\mathbf{k}).
$$

The gap is direct only if those extrema occur at the same $\mathbf{k}$ within the stated numerical resolution. Do not apply this definition by reading one path image. Metallic occupations, finite-temperature sampling, and defect or spin states can also make the valence/conduction partition nontrivial.

## Check the decision-relevant feature

First confirm program termination and the accepted parent SCF state. Then check that the expected path and `filband` artifact were produced, that adjacent points follow the intended order, and that all bands needed across the plotted window are present. Inspect warnings and preserve the raw ordering before applying overlap- or symmetry-based reordering.

SCF convergence at one mesh does not show that a gap, curvature, splitting, degeneracy, or ordering is converged. Converge the quantity used in the claim, not merely total energy. Test it against basis settings, parent k sampling, occupations, number of computed states, path/full-zone resolution, structural and magnetic candidates, and SOC treatment.

## Choose an energy reference that survives comparison

Subtracting the Fermi energy and setting $E_F=0$ is a display convention for one state, not an alignment between separate bulk calculations. Band offsets need a common electrostatic, interface, core-level, or other justified reference.

## Occupations, magnetism, and spin--orbit coupling change the object

A spin-polarized calculation can have separate spin channels, while a noncollinear SOC calculation generally has no globally conserved up/down label. The path must inherit the parent charge, occupations, magnetic order, relativistic Hamiltonian, and Hubbard definition. Magnetic supercells fold the Brillouin zone and require an explicit mapping or unfolding before comparison with a primitive-cell result.

## Interpolation is an approximation with a validation task

Compare interpolated and directly calculated eigenvalues at held-out path points and around every feature used in the conclusion. Preserve projections, subspace and disentanglement windows, spinor treatment, and interpolation version. A smooth Wannier curve is not validation of the fitted Hamiltonian.

## Band connectivity deserves care

Energy sorting can exchange branch identity at crossings or near-degeneracies. Preserve the raw eigenvalue order and any overlap- or symmetry-based reordering metadata. A visually continuous branch is not evidence that a crossing is symmetry protected.

## Decide what may be read from the path

A checked path calculation can support a statement about dispersion and candidate features on that exact path for the declared Kohn--Sham model. It does not establish a complete full-zone electronic topology, full-zone metallicity, a fundamental or experimental gap, a quasiparticle or optical spectrum, a transport coefficient, carrier mobility, material stability, or device performance. Preserve the parent calculation, path ledger, eigenvalues, occupations, energy reference, convergence evidence, plotting transformation, and hashes with the figure.

## Sources and methods

- [Bloch, wave functions in periodic potentials](https://doi.org/10.1007/BF01341914)
- [Kohn and Sham, self-consistent equations](https://doi.org/10.1103/PhysRev.140.A1133)
- [Setyawan and Curtarolo, standardized band paths](https://doi.org/10.1016/j.commatsci.2010.05.010)
- [Hinuma and co-workers, SeeK-path](https://doi.org/10.1016/j.commatsci.2016.01.017)
- [SeeK-path official documentation](https://seekpath.readthedocs.io/en/latest/)
- [Quantum ESPRESSO `bands.x` documentation](https://www.quantum-espresso.org/Doc/INPUT_BANDS.html)
- [Quantum ESPRESSO post-processing guide](https://quantum-espresso.org/Doc/pp_user_guide/node8.html)
- [Marzari and Vanderbilt, maximally localized Wannier functions](https://doi.org/10.1103/PhysRevB.56.12847)
- [Wannier90 official interpolation notes](https://wannier90.readthedocs.io/en/latest/user_guide/wannier90/notes_interpolations/)
- [Hedin, GW approximation](https://doi.org/10.1103/PhysRev.139.A796)
- [Heyd, Scuseria, and Ernzerhof, screened hybrid functional](https://doi.org/10.1063/1.1564060)
