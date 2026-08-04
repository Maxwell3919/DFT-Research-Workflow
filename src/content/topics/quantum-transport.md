---
topic_slug: quantum-transport
status: reviewed
---

Quantum transport asks how charge crosses a finite, atomically resolved region connected to macroscopic reservoirs. The physical object is an open system: semi-infinite contacts inject and absorb carriers, a scattering region changes their amplitudes and phases, and an electrostatic boundary-value problem aligns the junction.

A band structure of the isolated central fragment cannot answer this question because it contains neither reservoir occupations nor contact-induced shifts and broadening. Quantum transport is also distinct from **Electronic Transport**, which describes an extended material through a bulk distribution, scattering model, and conductivity. Inferring bulk conductivity from device conductance requires an additional geometry and scaling model; it is not a direct conversion.

## The device is defined by its boundaries

A two-terminal model contains a left electrode, a central region, and a right electrode. The electrode Hamiltonians should reproduce bulk-like leads. The central region must contain the interface and enough electrode-like material for the perturbation from the junction to decay before the matching planes.

Contact orientation, transverse periodicity, principal layers, atomic order, basis, spin and SOC treatment, electrostatic reference, and charge state are part of the physical model. They are not interchangeable implementation details.

The reservoirs are described by electrochemical potentials `μ_L` and `μ_R` and temperatures `T_L` and `T_R`. At equilibrium, their occupations agree. Under bias, the potential drop must be determined or imposed consistently with the open-boundary calculation. Rigidly shifting isolated molecular levels is not equivalent to a self-consistent finite-bias junction.

## Green functions turn contacts into energy-dependent boundary conditions

In a non-orthogonal localized basis, the retarded Green function of the central region is

```text
G^r(E) = [(E + iη)S - H_C
          - Σ_L^r(E) - Σ_R^r(E)]⁻¹ .
```

`S` is the overlap matrix, `H_C` is the central Hamiltonian, and `Σ_L^r` and `Σ_R^r` are the energy-dependent electrode self-energies. These self-energies shift and broaden central-region states according to the lead surface Green functions and contact couplings.

The contact broadening matrices are

```text
Γ_α(E) = i[Σ_α^r(E) - Σ_α^a(E)] .
```

For coherent elastic transport,

```text
T(E) = Tr[Γ_L G^r Γ_R G^a] .
```

`T(E)` is dimensionless and sums transmission probabilities over the channels, spin convention, and transverse k points included in the calculation. It is not a density of states. A localized state can create a strong DOS peak while transmitting poorly if it couples weakly or asymmetrically to the contacts.

## Landauer current is a reservoir imbalance filtered by transmission

For a two-terminal coherent conductor, a common spin-resolved convention is

```text
I = (e/h) ∫ dE T(E,V)
    [f(E,μ_L,T_L) - f(E,μ_R,T_R)] .
```

If `T` already includes twofold spin degeneracy, the prefactor is often written `2e/h`. Preserve the channel and spin convention with the data.

At small bias, an equilibrium transmission can support a linear-response conductance. It cannot by itself support a nonlinear current--voltage curve. The workflow must distinguish zero-bias transmission from nonlinear current: finite bias changes the charge density, electrostatic potential, level alignment, and often the transmission function itself. A finite-bias `I--V` therefore requires a bias-dependent, normally self-consistent sequence.

## Self-consistency and many-body content define what the result means

In DFT--NEGF, the non-equilibrium density matrix is constructed from contact-resolved Green functions and reservoir occupations, and the Hamiltonian and electrostatic potential are iterated to self-consistency.

Separate SCF convergence from observable convergence. Convergence of the charge or Hamiltonian iteration is necessary but not sufficient: transmission and current can remain sensitive to central-region length, electrode representation, transverse k sampling, energy grids, contour integration, basis completeness, bias stepping, and matching between the device and bulk leads.

Standard exchange--correlation approximations can misplace molecular resonances and charging energies. A Kohn--Sham transmission is therefore a result of a stated effective one-electron model, not automatically the exact interacting conductance. Coulomb blockade, Kondo physics, quasiparticle shifts, electron--phonon scattering, disorder, heating, and decoherence require additional theory and a clear treatment of double counting.

A phenomenological imaginary potential can broaden states but is not automatically a conserving inelastic-scattering model. When interaction self-energies are added, current conservation and consistency between the self-energy and charge update become explicit validation targets.

## Converge the open system and the observable

First verify the electrodes: their bulk Hamiltonian, surface Green function, and principal-layer construction must be stable. Then verify the matching planes by inspecting charge, potential, density, and Hamiltonian blocks across the lead-like parts of the central region.

Increase the amount of electrode-like material until the reported transmission or current is insensitive within the scientific tolerance. Also test:

- transverse k sampling;
- real-energy resolution near narrow resonances;
- charge-contour integration;
- basis and real-space grids;
- electrode principal layers;
- temperature and Fermi functions;
- bias sequence and restart dependence;
- terminal current and charge conservation at finite bias.

Symmetry and reciprocity checks apply only under the magnetic, spin, bias, and terminal conditions required by the corresponding relation.

Interpretive quantities such as eigenchannels, local currents, bond currents, and orbital projections can clarify a transmission feature, but they inherit the basis and partition choices of the model. They do not define a unique chemical pathway without further evidence.

## Preserve a reusable device record

Archive the complete electrode and central geometries, matching planes, principal layers, Hamiltonian and overlap conventions, basis and potentials, functional, spin and SOC state, transverse k weights, reservoir potentials and temperatures, electrostatic boundary conditions, charge and energy grids, bias history, interaction self-energies, convergence series, and channel normalization.

A calculated `T(E)` supports transmission for the declared open-system Hamiltonian and contact partition. With aligned occupations it can support linear-response conductance; with a self-consistent bias series it can support the corresponding model current. It does not establish bulk mobility, experimental contact geometry, operating-temperature phase coherence, reliability, or a many-body material conclusion. It also does not claim that an electrode model is an experimentally realized contact without separate structural evidence.

## Sources and methods

- [Landauer, spatially localized scattering and resistance](https://doi.org/10.1147/rd.13.0223)
- [Büttiker, four-terminal phase-coherent conductance](https://research.ibm.com/publications/four-terminal-phase-coherent-conductance)
- [Brandbyge and co-workers, DFT--NEGF transport](https://arxiv.org/abs/cond-mat/0110650)
- [Papior and co-workers, next-generation TranSIESTA and TBtrans](https://arxiv.org/abs/1607.04464)
- [SIESTA 5.4 TranSIESTA reference](https://docs.siesta-project.org/projects/siesta/en/5.4/reference/siesta.html#transiesta)
