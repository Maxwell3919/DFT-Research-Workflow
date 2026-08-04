---
topic_slug: defect-formation-energies-and-charge-states
status: reviewed
---

A point-defect calculation compares a host crystal with a crystal in which atoms and electrons have been exchanged with declared reservoirs. Its primary result is therefore a formation free energy as a function of atomic chemical potentials and electron chemical potential, not a single intrinsic “defect energy.”

Charge-state ordering, transition levels, equilibrium populations, and doping limits are later constructions. Each remains conditional on the defect configurations considered, supercell convergence, electrostatic treatment, band edges, thermodynamic conditions, and electronic-structure method.

## Define the defect before assigning a charge

A defect identity includes the host phase and structure, crystallographic site or interstitial position, species added or removed, final local configuration, charge, spin or magnetic state, and any bound complex. A label such as `V_A` names only a nominal vacancy species. It does not distinguish inequivalent sites, symmetry-broken relaxations, polarons, charge-localization patterns, or complexes with the same stoichiometry.

Generate candidate configurations from crystallographic and chemical reasoning, then preserve the mapping from the starting site to the relaxed state. Relaxation can move an interstitial, exchange atoms, reconstruct a neighbourhood, form a complex, or delocalize a carrier. Identify the final structure rather than assuming that it remains the intended starting defect.

## Formation energy is a grand-canonical difference

Using the convention that `Δn_i` is positive when atoms of species `i` are added to the defective supercell and `q` is positive when electrons are removed, a common static expression is

```text
E_f(D^q; E_F, {μ_i}) = E_tot(D^q) - E_tot(host)
                       - Σ_i Δn_i μ_i
                       + q(E_VBM + E_F)
                       + E_corr^q .
```

`E_tot(D^q)` and `E_tot(host)` are comparable total energies for defective and pristine supercells. `μ_i` is the atomic chemical potential of reservoir `i`. `E_F` is measured upward from the host valence-band maximum `E_VBM`. `E_corr^q` is the complete finite-size and reference correction defined by one stated scheme.

The signs follow the bookkeeping convention. For a vacancy, an atom is removed, so `Δn_i < 0` and the reservoir contribution becomes positive. Another convention is acceptable only when the formula and stored ledger change consistently. The result is energy per defect supercell, normally reported per defect rather than per atom.

## Atomic reservoirs delimit growth conditions

Write each reservoir as

```text
μ_i = μ_i^ref + Δμ_i .
```

`μ_i^ref` is a declared elemental or molecular reference, while `Δμ_i` describes the environment relative to it. Avoiding elemental precipitation usually imposes `Δμ_i ≤ 0` under this convention. Equilibrium with the host constrains a stoichiometric sum, and every competing phase adds an inequality.

These allowed domains come from phase stability, not from selecting arbitrary “rich” and “poor” numbers. Defects with different stoichiometric changes can reorder across the chemical-potential domain. Experimental variables such as gas pressure, solution activity, voltage, or synthesis temperature enter only through a declared thermodynamic relation to the reservoirs.

## The Fermi level is an electron-reservoir coordinate

For one charge state, the formation-energy line has slope `q` with respect to `E_F`. Positive defects become more costly as the electron chemical potential rises; negative defects become less costly.

In a semiconductor or insulator, the plotted interval is usually bounded by method-consistent band edges. Selecting a point in that interval gives conditional formation energies. An equilibrium Fermi level must instead satisfy charge neutrality together with all included charged defects, dopants, electrons, and holes. It cannot be selected after viewing the diagram merely to favour one conclusion.

In a metal, scanning a notional band-gap Fermi coordinate is generally not the same construction. Delocalized screening and the absence of an insulating gap require a defect and thermodynamic model appropriate to the metallic state.

## Bulk and defect calculations must share one energy gauge

The pristine and defective supercells should use the same Hamiltonian, core or basis treatment, relativistic terms, Hubbard model, boundary conditions, numerical representation, and compatible cell vectors. The pristine reference should normally use the same supercell shape and sampling policy so that extensive terms cancel as intended.

Multiplying a primitive-cell energy can be valid only after numerical equivalence to the supercell reference is demonstrated. Differences in k-point folding, basis completeness, FFT grids, strain, occupation, or magnetic state otherwise enter the formation energy as uncontrolled offsets.

For every charge state, verify electronic convergence, occupation and spin identity, structural relaxation, and localization of the added or removed charge. A completed total-energy calculation does not prove that the nominal charge resides on the defect rather than in a host band.

## Structural search belongs inside every charge state

Changing charge can change bonding, symmetry, spin, and polaron localization. Reusing one geometry for every `q` can miss lower configurations and produce incorrect transition levels. Start from several physically plausible local distortions, occupation patterns, and spin states where warranted.

Retain metastable branches instead of overwriting them. They may matter for kinetics, optical processes, persistent states, or negative-`U` behaviour even when they do not form the thermodynamic lower envelope.

## A periodic charged supercell is not an isolated charged defect

A charged periodic supercell is commonly neutralized by a compensating background. The calculation then represents a periodic lattice of defects and backgrounds, not one isolated charged defect. Long-range electrostatic interactions shift both energy and potential reference.

Finite cells also introduce elastic image interactions, defect-band dispersion, wavefunction overlap, constrained strain fields, and concentration effects. An electrostatic correction targets only the terms in its derivation. It cannot repair a delocalized state, wrong structure, inadequate relaxation volume, or incompatible host and defect references.

## Correction schemes are models with required inputs

Makov--Payne, Freysoldt--Neugebauer--Van de Walle, and Kumagai--Oba-type corrections use different assumptions and inputs. The charge model, dielectric response, cell geometry, potential data, localization, dimensionality, and sign conventions must match the implementation.

The relevant screening may be electronic only or include ionic response, depending on whether ions are clamped or relaxed in the quantity being corrected. A scalar dielectric constant is not interchangeable with an anisotropic tensor.

Report the raw formation-energy component, every correction component, diagnostic data, dielectric input, implementation version, and estimated residual. Similar corrected numbers from two schemes do not demonstrate convergence if both share the same untested localization or dielectric assumptions.

## Potential alignment must not be counted twice

Charged and neutral periodic calculations do not share an absolute electrostatic-potential zero. Correction formalisms handle the resulting reference shift in different ways. In extended FNV-style analyses, the far-field alignment contribution is already part of the image-charge correction; adding another independent potential-alignment term can double count it.

Use one documented algebra and its implementation outputs. Do not assemble a correction by adding similarly named terms from different papers or software fields. A flat-looking far-field region is a diagnostic within a model, not proof that all finite-size errors have vanished.

## Supercell convergence tests the corrected observable

Test several supercell sizes and shapes where feasible while preserving the same physical defect, sampling policy, relaxation procedure, and correction model. Track raw and corrected formation energies, transition levels, potential residuals, localization, defect-band dispersion, structure, spin, and elastic sensitivity.

Agreement between two corrected sizes can result from compensating errors. Non-monotonic changes may indicate a geometry switch, band filling, or localization change rather than ordinary finite-size scaling. There is no universal supercell size or acceptable correction magnitude.

## Band edges define both a domain and a source of error

Approximate functionals can misplace host band edges and alter defect localization. This changes the allowed Fermi-level interval, carrier concentrations, reservoir contribution, and sometimes the defect structure itself.

A rigid experimental scissor shift changes extended band edges but does not automatically correct a localized defect state. If band edges are changed with another method, document the alignment and distinguish corrections to extended host states from changes to defect total energies and occupations.

## Thermodynamic transition levels come from total energies

Let `A_q` be the fully assembled formation energy of charge state `q` at `E_F = 0` for fixed atomic chemical potentials. Equality of two relaxed charge-state lines gives

```text
ε(q/q′) = (A_q - A_q′) / (q′ - q) .
```

Only crossings on the lower envelope delimit thermodynamically stable charge states. A pairwise intersection above a lower third state is not an equilibrium transition. Report the configurations on both sides and the common energy reference, not only a level position in the gap.

## A skipped charge state can be real negative-U behaviour

If structural relaxation and electronic correlation make adding two carriers more favourable than adding them one at a time, an intermediate charge state can lie above the envelope everywhere. The stable sequence then changes by more than one charge unit at one transition.

This interpretation requires verified configurations and charge localization for all relevant states. A missing intermediate line caused by failed SCF, incomplete structural search, or inconsistent correction is not evidence of negative `U`.

## Thermodynamic and optical levels are different processes

A thermodynamic transition compares separately relaxed charge states and includes lattice relaxation. A vertical optical event changes electronic occupation at fixed nuclei before subsequent relaxation. Configuration-coordinate and nonradiative-capture analyses require additional excited-state, vibrational, and coupling information.

A Kohn–Sham eigenvalue is neither automatically a thermodynamic transition level nor an optical excitation energy. Experimental deep-level spectroscopy, photoluminescence, absorption, and charge switching probe different combinations of thermodynamics and kinetics.

## Formation energy becomes concentration only through statistical mechanics

In a dilute, noninteracting approximation,

```text
c(D^q) = N_sites g_q
         exp[-G_f(D^q; T, p, E_F, {μ_i}) / (k_B T)] .
```

`N_sites` is the density of eligible sites, `g_q` contains declared degeneracies, and `G_f` is the formation free energy under the specified conditions. A static `E_f` may approximate only one enthalpic part of `G_f`; vibrational, electronic, spin, orientational, and configurational contributions can change populations.

The dilute expression fails when defects interact, cluster, share excluded sites, change the host phase, or approach substantial site fractions. A negative static formation energy can signal that the assumed dilute host and reservoir state is no longer self-consistent.

## Charge neutrality determines the equilibrium Fermi level

A schematic neutrality equation is

```text
Σ_{D,q} q c(D^q; E_F) + p(E_F) - n(E_F) + ρ_fixed/e = 0 .
```

The solution depends on the included defect inventory, site multiplicities, carrier density of states, chemical potentials, degeneracies, and temperature. A formation-energy plot at an arbitrarily selected Fermi level does not predict carrier density, compensation, or dopability.

## Synthesis and measurement can freeze different equilibria

Atomic defect populations may equilibrate at a growth or annealing temperature and then freeze during cooling, while electronic charge states continue to re-equilibrate. Quenching, illumination, bias, surfaces, and interfaces can produce populations outside a one-temperature bulk-equilibrium model.

Model the kinetic sequence when it matters: which defects form, migrate, associate, or dissociate at each stage, and which carriers can still exchange. A low equilibrium formation energy does not supply a migration barrier or equilibration time.

## Common failures reveal missing evidence

Warning signs include charge spread over the whole cell, inconsistent occupations between host and defect references, a correction larger than the interpreted energy differences, no usable far-field region, strong cell-shape sensitivity, and transition levels that move with k mesh or structural initialization.

Bookkeeping failures include reversed atom signs, chemical potentials from an incompatible phase diagram, a VBM from another energy gauge, double-counted alignment, charged-cell energy compared with an unmatched neutral reference, and rounded plot intersections substituted for stored values.

## Preserve every line and its lineage

A reusable record includes the host and defect structures; site mapping; final charge, spin, symmetry, and geometry; atom-count changes; reservoir definitions; raw energies; band edges; correction inputs, components, diagnostics, and implementation version; supercell and k-point settings; localization and convergence evidence; line intercepts and slopes; lower-envelope membership; transition levels; statistical model; and charge-neutrality solution.

Keep alternative configurations and excluded states with reasons. A rendered formation-energy diagram is not a substitute for this ledger.

## Keep adjacent questions separate

Compositional phase stability supplies allowed atomic chemical potentials. Reference-state, convergence, and structure-optimization work supplies compatible host and defect parents. Band-structure analysis supplies method-consistent edges and carrier density of states. Electrostatic-potential analysis can support alignment diagnostics but does not by itself validate a charged-defect correction.

Migration barriers describe motion; phonons and free-energy methods add finite-temperature contributions; spectroscopy addresses optical or vibrational signatures. Bulk three-dimensional correction assumptions must not be transferred unchanged to slabs, wires, two-dimensional materials, or explicit-field models.

## What this topic establishes

This topic establishes how a declared defective supercell, atomic and electronic reservoirs, comparable total energies, one coherent finite-size correction, and charge-state thermodynamics combine into formation-energy lines and equilibrium transition levels. It also identifies the additional statistical and charge-neutrality evidence required before those lines can support concentration or doping claims.

It does not establish exhaustive configuration search, isolated-defect convergence without size evidence, correct band edges, finite-temperature populations from static energies alone, optical levels, migration rates, experimental defect identity, or material performance.

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
