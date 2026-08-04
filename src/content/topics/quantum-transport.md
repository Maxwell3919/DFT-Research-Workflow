---
topic_slug: quantum-transport
status: reviewed
---

Quantum transport asks how charge crosses a finite, atomically resolved region connected to macroscopic reservoirs. The physical object is therefore an open system: semi-infinite contacts inject and absorb carriers, a scattering region changes their amplitudes and phases, and an electrostatic boundary-value problem aligns the whole junction. A band structure of the isolated central fragment cannot answer this question because it contains neither reservoir occupations nor contact-induced level shifts and broadening.

This is distinct from **Electronic Transport**, which describes an extended material through a bulk non-equilibrium distribution, scattering times, and conductivity. Quantum transport normally reports a terminal-to-terminal conductance, transmission, or current for a declared device geometry. Converting that result into a bulk conductivity by choosing an arbitrary device length or cross-section does not create a bulk material property.

## The device is defined by its boundaries

A two-terminal model contains a left electrode, a central region, and a right electrode. The electrode Hamiltonians must reproduce bulk-like leads, while the central region must include enough repeated lead material for the perturbation from the junction to be screened before the matching planes. Atomic order, transverse periodicity, principal-layer choice, basis, spin treatment, electrostatic reference, and contact orientation are part of the model rather than post-processing details.

The reservoirs are characterized by electrochemical potentials `mu_L` and `mu_R` and temperatures `T_L` and `T_R`. At equilibrium their occupations agree. Under a voltage bias, the difference in electrochemical potential is commonly related to the applied voltage, but how the potential drops through the junction must be obtained or prescribed consistently with the open-boundary calculation. A rigid shift of molecular levels is not equivalent to a self-consistent finite-bias solution.

## Green functions turn contacts into energy-dependent boundary conditions

In a non-orthogonal localized basis, the retarded Green function of the central region is

```text
G^r(E) = [(E + i eta) S - H_C - Sigma_L^r(E) - Sigma_R^r(E)]^(-1).
```

`E` is electron energy, `eta` is a positive infinitesimal represented numerically, `S` is the overlap matrix, `H_C` is the central-region Hamiltonian, and `Sigma_L^r` and `Sigma_R^r` are retarded electrode self-energies. A self-energy is not an empirical lifetime attached afterward: it embeds a semi-infinite lead and shifts and broadens central-region states according to the lead surface Green function and coupling matrices.

The corresponding contact broadening matrices are

```text
Gamma_alpha(E) = i [Sigma_alpha^r(E) - Sigma_alpha^a(E)],
```

where `alpha` labels an electrode and the advanced self-energy is the Hermitian conjugate of the retarded one for the usual elastic problem. For coherent elastic transport, the total transmission is

```text
T(E) = Tr[Gamma_L G^r Gamma_R G^a].
```

`T(E)` is dimensionless and sums transmission probabilities over available channels, spin conventions, and any sampled transverse wavevectors. It is not a density of states: a state localized in the central region can produce a DOS peak yet transmit poorly if it couples weakly or asymmetrically to the contacts.

## Landauer current is a reservoir imbalance filtered by transmission

For a two-terminal coherent elastic conductor, one common spin-resolved convention gives

```text
I = (e / h) integral dE T(E, V)
    [f(E, mu_L, T_L) - f(E, mu_R, T_R)].
```

`I` is current, `e` is the positive elementary-charge magnitude, `h` is Planck's constant, `f` is a reservoir Fermi function, and `T(E,V)` is the transmission of the junction at bias `V`. If `T` already includes a twofold spin degeneracy, the prefactor is often written `2e/h`; the convention must accompany the data. At zero temperature and small bias, the conductance reduces to the conductance quantum times the transmission at the common Fermi energy under the same channel convention.

The integration window is set by the occupation difference, but finite-temperature tails and bias-dependent spectral changes can matter outside a naive interval between `mu_L` and `mu_R`. A zero-bias transmission curve supports a linear-response conductance. It does not by itself support a nonlinear current--voltage curve, because finite bias can alter charge, potential, level alignment, and therefore `T(E,V)`.

## Self-consistency and many-body content define what the result means

In DFT--NEGF, the non-equilibrium density matrix is constructed from contact-resolved Green functions and reservoir occupations, and the Hamiltonian and electrostatic potential are iterated to self-consistency. Convergence of the density or Hamiltonian is necessary but does not prove that transmission or current is converged with respect to device length, electrode representation, transverse k sampling, energy contour, real-axis grid, basis, or bias stepping.

Standard ground-state exchange--correlation functionals can misplace molecular resonances and underestimate charging or derivative-discontinuity effects. A Kohn--Sham transmission is therefore a result of a stated effective one-electron model, not automatically the interacting many-body conductance. Corrections, quasiparticle methods, Coulomb blockade, Kondo physics, electron--phonon scattering, disorder, heating, and decoherence require additional theory whose applicable regime and double-counting choices must be declared.

Adding a phenomenological imaginary potential can broaden states, but it is not automatically a conserving inelastic-scattering model. More general NEGF calculations introduce interaction self-energies and lesser/greater Green functions; current conservation and consistency between the chosen self-energy and charge update then become explicit validation targets.

## Converge the open system and the observable

Electrode calculations must converge their bulk Hamiltonian and surface Green function, and the central cell must reproduce the electrode blocks at its boundaries. Inspect charge mismatch, potential and density across the matching planes, rather than trusting geometric repetition alone. Increase the amount of electrode-like material until the reported transmission or current is insensitive within the scientific tolerance chosen for the study.

Converge transverse k sampling for periodic contacts, the energy mesh against narrow resonances and Fermi tails, the contour integration used for charge, basis and real-space grids, central-region size, electrode principal layers, temperature, and bias sequence. At finite bias, check charge and current conservation and calculate both terminal currents when the implementation exposes them. Symmetry or reciprocity tests apply only when magnetic field, magnetization, spin--orbit coupling, bias, and terminal definitions satisfy the required conditions.

A transmission feature should be traced to contact-resolved spectral weight, eigenchannels, local or bond currents, and perturbations of the model only when those quantities are defined consistently. Orbital projections depend on the basis and partition; they can aid interpretation but do not uniquely identify a chemical pathway.

## Preserve a reusable device record

Archive the complete electrode and central geometries; matching and principal-layer definitions; Hamiltonian, overlap, basis, pseudopotential, functional, spin and SOC identity; transverse k weights; contact chemical potentials and temperatures; electrostatic boundary conditions; charge-contour and real-energy grids; bias history and restart lineage; interaction self-energies; convergence series; channel and spin normalization; and hashes of all transport inputs and outputs. Store the energy zero and voltage sign convention with every transmission or current table.

A calculated `T(E)` supports transmission for that open-system Hamiltonian and contact partition. With aligned occupations it can support linear-response conductance; with a self-consistent bias series it can support the corresponding model current. It does not alone establish a bulk mobility, device reliability, experimental contact geometry, phase coherence at operating temperature, or a many-body materials conclusion.

## Sources and methods

- [Landauer, spatially localized scattering and resistance](https://doi.org/10.1147/rd.13.0223)
- [Büttiker, four-terminal phase-coherent conductance](https://research.ibm.com/publications/four-terminal-phase-coherent-conductance)
- [Brandbyge and co-workers, DFT--NEGF transport](https://arxiv.org/abs/cond-mat/0110650)
- [Papior and co-workers, next-generation TranSIESTA and TBtrans](https://arxiv.org/abs/1607.04464)
- [SIESTA 5.4 TranSIESTA reference](https://docs.siesta-project.org/projects/siesta/en/5.4/reference/siesta.html#transiesta)
