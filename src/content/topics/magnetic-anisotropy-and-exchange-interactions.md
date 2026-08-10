---
topic_slug: magnetic-anisotropy-and-exchange-interactions
status: reviewed
---

## View the axes, spin arrangements, and fitted energy response

Open the crystallographic structure with the tested magnetization axes or spin pairs marked. Inspect the final moment directions and magnitudes for every constrained or spin-orbit calculation, then plot energy against direction or relative spin arrangement with the numerical noise floor visible. The fitted anisotropy or exchange model must name its sign and normalization convention.

A small energy difference is useful only after basis, k mesh, SCF threshold, spin-orbit setup, and state identity are tighter than the effect being interpreted. Compare several directions or configurations and inspect fit residuals rather than reading one pairwise subtraction. Use [electronic-property tools](/DFT-Research-Workflow/operations/resource-landscape/#electronic-properties), [specialist magnetic tools](/DFT-Research-Workflow/operations/resource-landscape/#specialist-tools), and [literature sources](/DFT-Research-Workflow/operations/resource-landscape/#literature-learning) for implementation-specific routes.

Calculate magnetic anisotropy or exchange only after a compatible magnetic reference state has been selected. They are different target quantities. Anisotropy compares the same magnetic texture rotated relative to the lattice, normally with spin--orbit coupling (SOC). Exchange maps relative changes among local-moment configurations to a declared effective Hamiltonian.

## Establish a compatible SOC reference before subtracting micro-energy differences

The parent object must retain the magnetic cell, final moment map, structure, charge, Hamiltonian, Hubbard treatment, spinor/noncollinear mode, SOC-capable potential data, occupations, k sampling, symmetry treatment, and energy normalization. A spin-polarized solution or local moment alone is not sufficient.

Start with [Fit an Anisotropy and Exchange Ledger](/DFT-Research-Workflow/operations/magnetic-anisotropy-and-exchange-interactions/guides/fit-anisotropy-and-exchange-ledger/) to inspect sign, normalization, and held-out reconstruction. That guide uses invented energies. It verifies ledger arithmetic only and does not run SOC or calculate a material parameter.

## Direction is a physical variable only when it is coupled to the lattice

Choose the crystallographic directions before running and map every code-coordinate spin axis to the cell axes. For each direction, keep the magnetic texture, structure, charge, pseudopotential/PAW set, functional, Hubbard settings, SOC mode, k points, occupations, smearing, basis/grid, and convergence thresholds compatible. Use the selected code's official noncollinear and SOC documentation; exact inputs vary by code and version.

For a direction $\mathbf u$ relative to a declared reference $\mathbf u_0$, compute

$$
\mathrm{MAE}(\mathbf u;\mathbf u_0)
= \frac{E(\mathbf u)-E(\mathbf u_0)}{N}.
$$

$N$ must be a declared magnetic ion, formula unit, area, or common cell. A positive value means only that $\mathbf u$ is higher than the chosen reference under this convention. Do not subtract a scalar-relativistic energy from an SOC energy, or mix collinear and noncollinear Hamiltonians.

If an angular model is required, fit the calculated directions rather than treating the coefficients as input-independent constants. For a uniaxial example,

$$
E(\theta,\phi)-E_{\mathrm{ref}}
= K_1\sin^2\theta+K_2\sin^4\theta+\cdots .
$$

Retain the sampled directions and test the fit on directions not used to determine the coefficients. Symmetry can change with a global spin rotation in a noncollinear calculation; use compatible full-zone sampling or demonstrate that changes in irreducible sampling do not control the micro-energy difference.

## Exchange parameters are a reduced model, not raw energy differences renamed

Choose the local-moment lattice, neighbor shells, pair-counting rule, spin-length convention, and candidate configurations before fitting. A common convention is

$$
H=-\sum_{ij}J_{ij}\,\mathbf e_i\cdot\mathbf e_j,
$$

where each $\mathbf e_i$ is a unit orientation. Under this written convention, positive $J_{ij}$ favours parallel alignment; a different sign or pair-counting convention changes the reported parameter.

Run enough compatible magnetic configurations to identify the chosen parameters, then fit their normalized energy differences. Preserve final moment magnitudes and directions because a configuration that collapses or changes moment length may not represent the assumed model. Predict held-out configurations before accepting the mapping. A fit to two collinear energies does not establish a unique interaction range or validate a classical-spin model.

## Converge the observable that is actually being subtracted

Confirm normal program termination and electronic convergence first, then reconstruct every reported difference from retained total energies and normalization. MAE and exchange energy differences can be much smaller than absolute energies. Keep adequate output precision and converge the difference and ranking with respect to k points, basis/grid, occupations, smearing, empty states where relevant, charge-density strategy, SOC implementation, symmetry, and independent compatible starts.

For exchange, also test whether fitted parameters change when candidate configurations or neighbor shells are added. Material changes indicate underdetermination or model inadequacy, not a reason to retain the smallest fit. For MAE, verify that the final magnetic texture remains the intended rotated state in every direction.

## Read results at the scope they support

An easy direction is conditional on the selected magnetic state, structure, Hamiltonian, SOC treatment, angular sampling, normalization, and numerical resolution. A fitted $J_{ij}$ set is conditional on the explicit effective model and mapping data.

It does not establish a complete magnetic Hamiltonian, Curie or Neel temperature, coercive field, domain pattern, switching barrier, spin-wave spectrum, or experimental easy axis. Finite-temperature predictions require a separate statistical-mechanics model, dimensionality and anisotropy treatment, finite-size analysis, and sensitivity to the fitted interactions.

## Sources and methods

- [Hohenberg and Kohn, density-functional foundation](https://doi.org/10.1103/PhysRev.136.B864)
- [Kohn and Sham, self-consistent equations](https://doi.org/10.1103/PhysRev.140.A1133)
- [Liechtenstein et al., exchange interactions from local spin-density theory](https://doi.org/10.1016/0304-8853%2887%2990721-9)
- [Quantum ESPRESSO `pw.x` noncollinear and spin--orbit inputs](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [VASP magnetic-anisotropy documentation](https://vasp.at/wiki/Determining_the_Magnetic_Anisotropy)
- [VASP `LSORBIT` documentation](https://vasp.at/wiki/LSORBIT)
