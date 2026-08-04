---
topic_slug: defect-formation-energies-and-charge-states
status: reviewed
---

A point-defect calculation compares a host crystal with a crystal that has exchanged atoms and electrons with declared reservoirs. Its primary result is therefore not an intrinsic “defect energy,” but a formation energy or free energy defined for a particular defect configuration, charge state, chemical environment, and electron chemical potential.

Charge-state ordering, transition levels, equilibrium concentrations, and doping limits are later constructions. Each requires additional evidence about supercell convergence, electrostatic corrections, band edges, structural alternatives, thermodynamic conditions, and the electronic-structure method.

## Define the physical defect state first

A defect identity includes the host phase, crystallographic site or interstitial position, species added or removed, final local geometry, charge, spin or magnetic state, and any bound complex. A label such as `V_A` identifies only a nominal vacancy species. It does not distinguish inequivalent sites, symmetry-broken relaxations, polarons, charge localization patterns, or complexes with the same stoichiometry.

Generate candidate configurations from crystallographic and chemical reasoning, then preserve the mapping from the starting site to the relaxed state. Relaxation can move an interstitial, exchange atoms, reconstruct the neighbourhood, form a complex, or delocalize a carrier. The final structure must be identified rather than assumed.

Charge states can favour different geometries, spins, and localization patterns. Search more than one physically plausible initialization where warranted. Retain metastable branches instead of overwriting them, because they may matter for kinetics, optical processes, persistent states, or negative-`U` behaviour even when they do not form the thermodynamic lower envelope.

## Formation energy is a balanced reservoir equation

Using the convention that `Δn_i` is positive when atoms of species `i` are added to the defective supercell and `q` is positive when electrons are removed, a common static expression is

```text
E_f(D^q; E_F, {μ_i}) = E_tot(D^q) - E_tot(host)
                       - Σ_i Δn_i μ_i
                       + q(E_VBM + E_F)
                       + E_corr^q .
```

`E_tot(D^q)` and `E_tot(host)` are comparable total energies for the defective and pristine supercells. `μ_i` is the atomic chemical potential of reservoir `i`. `E_F` is the electron chemical potential measured upward from the host valence-band maximum `E_VBM`. `E_corr^q` is the complete finite-size and reference correction defined by one stated scheme.

The signs follow the bookkeeping convention. For a vacancy, an atom is removed, so `Δn_i < 0` and the reservoir contribution becomes positive. Another sign convention is acceptable only when the formula and stored ledger change consistently with it.

The value is normally reported per defect, not per atom. Keep every component separately so the final line can be audited and recomputed.

## Atomic chemical potentials define the environment

Write each reservoir as

```text
μ_i = μ_i^ref + Δμ_i .
```

`μ_i^ref` is a declared elemental or molecular reference, while `Δμ_i` describes the environment relative to that reference. Avoiding elemental precipitation usually imposes `Δμ_i ≤ 0` under this convention. Equilibrium with the host constrains a stoichiometric sum, and every competing phase adds an inequality.

The allowed region is therefore supplied by compositional phase stability. “Element-rich” and “element-poor” limits should correspond to documented boundaries or vertices of that region, not arbitrary values. Defects with different stoichiometric changes can reorder across the allowed chemical-potential domain.

Experimental variables such as gas pressure, solution activity, voltage, or synthesis temperature enter only through a declared thermodynamic relation to the chemical potentials. A static elemental energy is not automatically a finite-temperature reservoir.

## The Fermi level is a coordinate until charge neutrality fixes it

For one charge state, the formation-energy line has slope `q` with respect to `E_F`. Positive defects become more costly as the electron chemical potential rises; negative defects become less costly.

In a semiconductor or insulator, the plotted interval is usually bounded by method-consistent band edges. Selecting a point within that interval gives conditional formation energies. An equilibrium Fermi level must instead be solved from charge neutrality using all included charged defects, dopants, electrons, and holes. It cannot be chosen after viewing the diagram merely to favour a desired defect.

In a metal, scanning a notional band-gap Fermi coordinate is generally not the same construction. Delocalized screening and the absence of an insulating gap require a defect and thermodynamic model appropriate to the metallic state.

## Host and defect calculations must share one energy model

The pristine and defective supercells should use the same Hamiltonian, core or basis treatment, relativistic terms, Hubbard model, boundary conditions, numerical representation, and compatible cell vectors. The pristine reference should normally use the same supercell shape and sampling policy so that extensive terms cancel as intended.

Multiplying a primitive-cell energy can be valid only after numerical equivalence to the supercell reference is demonstrated. Differences in k-point folding, basis completeness, FFT grids, strain, occupations, or magnetic state otherwise enter the formation energy as uncontrolled offsets.

For every charge state, verify electronic convergence, occupation and spin identity, structural relaxation, and localization of the added or removed charge. A completed total-energy calculation does not prove that the nominal charge resides on the defect rather than in a host band.

## Charged periodic cells require an explicit finite-size model

A charged periodic supercell is commonly neutralized by a compensating background. The calculation then represents a periodic lattice of defects and backgrounds, not one isolated charged defect. Long-range electrostatic interactions shift both the energy and the potential reference.

Finite cells also introduce elastic image interactions, defect-band dispersion, wavefunction overlap, constrained strain fields, and concentration effects. An electrostatic correction addresses only the terms contained in its derivation. It cannot repair a delocalized state, wrong structure, inadequate relaxation volume, or incompatible bulk and defect references.

Makov--Payne, Freysoldt--Neugebauer--Van de Walle, and Kumagai--Oba-type corrections use different assumptions and inputs. The charge model, dielectric response, cell geometry, potential data, localization, dimensionality, and sign conventions must match the implementation. The appropriate screening may be electronic only or include ionic response, depending on the quantity being corrected.

Potential alignment is not an extra term to add automatically. Some correction formalisms already incorporate the far-field reference shift. Combining labels or components from different schemes can double count the same contribution. Use one documented algebra and retain its raw components and diagnostics.

## Converge the corrected observable and the defect identity

Test several supercell sizes and shapes where feasible while preserving the same physical defect, sampling policy, relaxation procedure, and correction model. Track:

- raw and corrected formation energies;
- transition levels and lower-envelope ordering;
- residual potential diagnostics;
- localization and defect-band dispersion;
- structure, spin, and symmetry;
- elastic and electrostatic size sensitivity.

Agreement between two corrected sizes can result from compensating errors. Non-monotonic changes may indicate a geometry switch, band filling, or localization change rather than ordinary finite-size scaling. There is no universal supercell size or acceptable correction magnitude.

Approximate functionals can also misplace host band edges and alter localization. A rigid gap correction does not automatically correct a localized defect state. If band edges are changed with another method, document the alignment and distinguish corrections to extended host states from changes to defect total energies and occupations.

## Transition levels come from the lower envelope

Let `A_q` be the fully assembled formation energy of charge state `q` at `E_F = 0` for fixed atomic chemical potentials. Equality of two relaxed charge-state lines gives

```text
ε(q/q′) = (A_q - A_q′) / (q′ - q) .
```

Only crossings on the lowest formation-energy envelope define thermodynamically stable transitions. A pairwise intersection that lies above a third charge state is not an equilibrium transition.

If an intermediate charge state never reaches the lower envelope, the system may exhibit negative-`U` behaviour. That interpretation requires complete structural and localization searches for all relevant charge states. A missing line caused by failed SCF, an incomplete relaxation, or an inconsistent correction is not evidence of negative `U`.

Thermodynamic and optical levels are different observables. A thermodynamic transition compares separately relaxed charge states. A vertical optical event changes the electronic occupation at fixed nuclei before relaxation. A Kohn--Sham eigenvalue is not automatically either quantity.

## Concentrations require free energies and statistical mechanics

In a dilute, noninteracting approximation,

```text
c(D^q) = N_sites g_q
         exp[-G_f(D^q; T, p, E_F, {μ_i}) / (k_B T)] .
```

`N_sites` is the density of eligible sites, `g_q` contains declared degeneracies, and `G_f` is the formation free energy under the specified conditions. A static formation energy supplies only part of this quantity; vibrational, electronic, spin, orientational, and configurational contributions may matter.

The equilibrium Fermi level follows from a charge-neutrality equation such as

```text
Σ_{D,q} q c(D^q; E_F) + p(E_F) - n(E_F) + ρ_fixed/e = 0 .
```

The solution depends on the included defect inventory, site multiplicities, carrier density of states, chemical potentials, degeneracies, and temperature. A formation-energy plot at an arbitrarily selected Fermi level does not predict carrier density or dopability.

Atomic defects may equilibrate at a growth or annealing temperature and then freeze during cooling, while electronic charge states continue to re-equilibrate. Quenching, illumination, bias, interfaces, and nonequilibrium reservoirs require an explicit kinetic sequence. A low formation energy does not supply a migration barrier or equilibration time.

## Preserve a defect ledger, not only a diagram

A reusable record includes the host and defect structures; site mapping; final charge, spin, and geometry; atom-count changes; reservoir definitions; raw energies; band edges; correction inputs, components, diagnostics, and implementation version; supercell and k-point settings; localization and convergence evidence; line intercepts and slopes; lower-envelope membership; transition levels; statistical model; and charge-neutrality solution.

Common failures become visible at this component level: reversed atom signs, incompatible chemical potentials, unmatched host and defect states, delocalized nominal charges, correction double counting, moving transition levels, or a correction larger than the energy ordering being interpreted.

This topic can establish formation-energy lines and thermodynamic transition levels for a declared defect set and model. It does not establish exhaustive configuration search, isolated-defect convergence without size evidence, correct band edges, finite-temperature concentrations from static energies alone, optical levels, migration rates, experimental defect identity, or material performance. Bulk three-dimensional correction assumptions must not be transferred unchanged to slabs, wires, two-dimensional materials, or explicit-field models.

## Sources and methods

- [Zhang and Northrup, chemical-potential dependence of defect formation energies](https://doi.org/10.1103/PhysRevLett.67.2339)
- [Van de Walle and Neugebauer, first-principles defects and impurities](https://doi.org/10.1063/1.1682673)
- [Freysoldt, Neugebauer, and Van de Walle, point-defect methods review](https://doi.org/10.1103/RevModPhys.86.253)
- [Freysoldt, Neugebauer, and Van de Walle, finite-size correction](https://doi.org/10.1103/PhysRevLett.102.016402)
- [Kumagai and Oba, anisotropic electrostatic correction](https://doi.org/10.1103/PhysRevB.89.195205)
- [Makov and Payne, periodic charged systems](https://doi.org/10.1103/PhysRevB.51.4014)
- [Lany and Zunger, band-gap and finite-size correction assessment](https://doi.org/10.1103/PhysRevB.78.235104)
- [Mosquera-Lois and co-workers, finite-temperature defect free energies](https://doi.org/10.1039/D3CS00432E)
- [Broberg and co-workers, PyCDT](https://doi.org/10.1016/j.cpc.2018.01.004)
- [doped thermodynamics documentation](https://doped.readthedocs.io/en/stable/doped.thermodynamics.html)
