---
topic_slug: defect-formation-energies-and-charge-states
status: reviewed
---

A point-defect calculation compares a host crystal with a crystal in which atoms and electrons have been exchanged with declared reservoirs. Its primary result is therefore a formation free energy as a function of atomic chemical potentials and electron chemical potential, not a single intrinsic “defect energy.” Charge-state ordering, transition levels, equilibrium populations, and doping limits require additional constructions. Every conclusion remains conditional on defect configurations, supercell convergence, electrostatic treatment, band edges, thermodynamic conditions, and the electronic-structure method.

## Define the defect before assigning a charge

A defect identity includes the host phase and structure, site or interstitial position, species added or removed, local configuration, charge state, spin or magnetic state, and any bound complex. A symbol such as `V_A` names only a vacancy species. It does not distinguish inequivalent sites, symmetry-broken relaxations, polarons, different charge localizations, or complexes that share the same nominal stoichiometry.

Enumerate configurations from crystallographic and chemical reasoning, then retain their parent-site mapping. A relaxation can move an interstitial, exchange atoms, reconstruct into a complex, or delocalize a carrier. The final structure must be identified rather than assumed to remain the intended starting defect.

## Formation energy is a grand-canonical difference

Using the convention that `Δn_i` is positive when atoms of species `i` are added to the defective supercell and `q` is positive when electrons are removed, a common static expression is

```text
E_f(D^q; E_F, {μ_i}) = E_tot(D^q) - E_tot(host)
                       - Σ_i Δn_i μ_i
                       + q(E_VBM + E_F)
                       + E_corr^q
```

`E_tot(D^q)` and `E_tot(host)` are total energies of comparable defective and pristine supercells. `μ_i` is the atomic chemical potential, in energy per atom, of the reservoir exchanging species `i`. `E_VBM` aligns the electron chemical potential to the host valence-band maximum, and `E_F` is measured upward from that reference. `E_corr^q` is the total correction defined by one stated finite-size and reference scheme. The result is energy per defect supercell, normally reported per defect rather than per atom.

The equation balances both atoms and charge. Reversing the sign convention for `Δn_i` is acceptable only if the formula changes with it. A vacancy has a removed atom; under the convention above its `Δn_i` is negative and the reservoir contribution becomes `+μ_i`.

## Atomic reservoirs delimit growth conditions

Write each reservoir as `μ_i = μ_i^ref + Δμ_i`, where `μ_i^ref` is a declared elemental or molecular reference and `Δμ_i` describes the environment relative to it. Avoiding elemental precipitation usually imposes `Δμ_i ≤ 0` under this convention. Equilibrium with a host compound constrains the stoichiometric sum of its chemical potentials, while every competing phase supplies an inequality.

These allowed domains come from phase stability, not from selecting arbitrary “rich” and “poor” numbers. A multicomponent host can have edges, vertices, and interior points in chemical-potential space; different points can change the ordering of defects with different stoichiometry. Defects that exchange the same atoms shift together and retain their charge-transition levels, but defects with different `Δn_i` need not.

Gas pressure, solution activity, voltage, and synthesis condition enter only through a thermodynamic relation to `μ_i` at a declared temperature and standard state. A static elemental energy is not automatically a finite-temperature experimental reservoir.

## The Fermi level is an electron reservoir coordinate

For one charge state, the formation-energy line has slope `q` with respect to `E_F`. A positive defect becomes more costly as the electron chemical potential rises because forming it releases electrons to a more expensive reservoir. A negative defect becomes less costly because it accepts electrons from that reservoir.

The plotted domain is usually bounded by the host band edges calculated under the same method and reference. Choosing an arbitrary Fermi level within that domain shows conditional formation energies. An equilibrium Fermi level must instead satisfy charge neutrality together with all included charged defects, dopants, electrons, and holes. It cannot be selected after viewing the diagram merely to favour one conclusion.

In a metal, a freely scanned band-gap Fermi coordinate is generally not the same construction. Delocalized screening and the absence of an insulating gap require a method and thermodynamic interpretation appropriate to the metallic system.

## Bulk and defect calculations must share one energy gauge

The host and defective supercells should share the same Hamiltonian, potential or basis family, relativistic treatment, Hubbard model, boundary conditions, numerical representation, and compatible cell vectors. The pristine reference should use the same supercell shape and sampling policy so that extensive bulk terms cancel as intended.

A separate primitive-cell bulk energy multiplied by a cell ratio can be useful only when numerical equivalence to the defect supercell reference is demonstrated. Differences in k-point folding, basis completeness, FFT grids, cell strain, or magnetic state otherwise enter the formation energy as uncontrolled offsets.

For each charge state, verify SCF completion, occupation and spin identity, force relaxation in the intended subspace, and the localization of the added or removed charge. A completed total energy does not prove that the nominal charge resides on the defect rather than in a host band.

## Structural search belongs inside every charge state

Charge changes can alter bonding, symmetry, spin, and polaron localization. Reusing one geometry for all `q` values can miss lower configurations and produce incorrect transition levels. Start from several physically distinct local distortions, occupation patterns, and spin states where warranted, and relax them without silently constraining the answer to the initial symmetry.

Retain metastable configurations rather than overwriting them with the lowest structure. They can matter for kinetics, optical excitation, persistent states, and negative-`U` behaviour. The thermodynamic envelope uses the lowest verified configuration for each charge at the chosen conditions, while excited or metastable branches remain separately labelled evidence.

## A periodic charged supercell is not an isolated charged defect

Periodic electronic-structure codes commonly neutralize a charged cell with a compensating background. The resulting calculation represents a lattice of charged defects, their periodic images, and the background—not one isolated defect in an infinite crystal. Long-range electrostatic interactions decay slowly with cell size and shift both energy and electrostatic reference.

Finite cells also create elastic image interactions, defect-band dispersion, wavefunction overlap, constrained strain fields, and concentration effects. An electrostatic correction targets only the terms in its derivation. It cannot repair a delocalized defect state, an incorrect structure, insufficient relaxation volume, or incompatible bulk and defect calculations.

## Correction schemes are models with required inputs

Makov and Payne derived a multipole expansion for charged localized systems under specific boundary assumptions. The Freysoldt–Neugebauer–Van de Walle approach separates a model long-range charge from the short-range defect-induced potential and determines a far-field offset. Kumagai and Oba extended this style of correction using atomic-site potentials and anisotropic dielectric screening.

Applying any scheme requires its charge model, dielectric response, cell geometry, potential data, localization assumptions, and sign conventions to match the calculation. The relevant dielectric screening may be electronic or include ionic response depending on whether ions are clamped or relaxed in the quantity being corrected. A scalar dielectric constant is not interchangeable with an anisotropic tensor.

Report the raw formation-energy component, every correction component, diagnostic plot or sampling region, input dielectric data, scheme and implementation version, and estimated residual. Similar corrected numbers from two schemes do not prove convergence when both share the same untested localization or dielectric assumptions.

## Potential alignment must not be counted twice

Charged and neutral periodic calculations do not share an absolute electrostatic-potential zero. Correction formalisms handle the resulting reference offset in different ways. In the extended FNV analysis, the far-field alignment contribution is part of the image-charge correction; adding another independent potential-alignment term can double count it.

Use the algebra and outputs of one documented implementation. Do not assemble a correction by adding labels taken from different papers or software fields. A flat-looking far-field region is a diagnostic within a model, not proof that all electrostatic and finite-size errors have vanished.

## Supercell convergence tests the corrected observable

Evaluate several supercell shapes and sizes when feasible, preserving comparable defect identity, k sampling, relaxation policy, and correction inputs. Track raw and corrected formation energies, transition levels, potential residuals, charge localization, defect-band width, forces, strain, and structural state.

Convergence is established only over the range relevant to the claim. A correction that makes one size agree with another can conceal compensating errors. Non-monotonic changes may reflect geometry switches, band filling, or localization changes rather than simple electrostatic scaling. There is no universal supercell size or acceptable correction magnitude.

## Band edges define both a domain and a source of error

Approximate density functionals can misplace the valence and conduction edges and underestimate a host gap. This changes the allowed Fermi-level interval, carrier concentrations, reservoir term, and sometimes the localization and structure of the defect itself. A rigid experimental scissor shift changes extended band edges but does not automatically give the correct energy of a localized defect state.

Align band edges between methods through a documented reference and distinguish corrections to host band edges, defect occupations, and total-energy differences. Hybrid functionals, quasiparticle calculations, or fitted corrections introduce their own convergence and compatibility requirements. Agreement with an experimental gap alone does not validate defect formation energies or transition levels.

## Thermodynamic transition levels come from total energies

Let `A_q` be the fully assembled formation energy of charge `q` at `E_F = 0` for fixed atomic chemical potentials. Equality of two relaxed charge-state lines gives

```text
ε(q/q′) = (A_q - A_q′) / (q′ - q)
```

`ε(q/q′)` is measured from the same VBM reference as `E_F`. It is the electron chemical potential at which the equilibrium formation energies of the two charge states are equal. Atomic chemical-potential terms cancel when the two states have identical stoichiometry; corrections and state-specific relaxations do not.

Only crossings on the lower envelope delimit thermodynamically stable charge states. A pairwise intersection above a lower third state is not an equilibrium transition. Report the configurations on both sides and the energy reference, not merely a level position inside a gap.

## A skipped charge state can be real negative-U behaviour

If lattice relaxation and electronic correlation make the energy gained by adding two carriers exceed that for adding them one at a time, an intermediate charge state can lie above the envelope everywhere. The stable sequence then changes by more than one unit of charge at a single thermodynamic transition.

This negative-`U` interpretation requires verified configurations and charge localization for all relevant states. A missing intermediate line caused by failed SCF, an incomplete structural search, or an inconsistent correction is not evidence of negative `U`. Preserve the unstable or metastable state and the disproportionation energy that diagnoses the ordering.

## Thermodynamic and optical levels are different processes

A thermodynamic transition compares separately relaxed initial and final charge states and therefore includes lattice relaxation. A vertical optical ionization or capture event changes electronic occupation faster than nuclei respond and is evaluated at a fixed geometry before subsequent relaxation. Configuration-coordinate and nonradiative-capture analyses add excited-state, vibrational, and coupling information.

A Kohn–Sham eigenvalue is neither automatically a thermodynamic transition level nor an optical excitation energy. Experimental deep-level spectroscopy, photoluminescence, absorption, and charge-state switching probe different combinations of thermodynamics and kinetics. Match the calculated observable to the measurement before assigning a peak to a defect.

## Formation energy becomes concentration only through statistical mechanics

In a dilute, noninteracting approximation, the equilibrium concentration of defect `D^q` can be written schematically as

```text
c(D^q) = N_sites g_q exp[-G_f(D^q; T, p, E_F, {μ_i}) / (k_B T)]
```

`N_sites` is the concentration of eligible sites, `g_q` contains declared configurational and internal degeneracies, `G_f` is a formation free energy under the stated conditions, `k_B` is Boltzmann's constant, and `T` is temperature. A static `E_f` may approximate only one enthalpic part of `G_f`; vibrational, electronic, spin, orientational, and configurational contributions can shift populations.

The dilute expression fails when defects interact, share excluded sites, cluster, alter the host phase, or approach significant site fractions. A negative static formation energy often signals that the assumed dilute host/reservoir state is no longer self-consistent, not an infinite independent-defect concentration.

## Charge neutrality determines the equilibrium Fermi level

For a homogeneous equilibrium semiconductor, a schematic neutrality condition is

```text
Σ_{D,q} q c(D^q; E_F) + p(E_F) - n(E_F) + ρ_fixed/e = 0
```

`p` and `n` are hole and electron concentrations derived from the host density of states and carrier statistics. `ρ_fixed/e` represents other declared ionized dopants or fixed charges in number-density units. Because each charged-defect concentration also depends exponentially on `E_F`, the equation must be solved self-consistently.

The result depends on the included defect inventory, site multiplicities, band structure, chemical potentials, temperature, degeneracies, and ionization model. A formation-energy diagram at an arbitrarily chosen Fermi level does not by itself predict carrier density, compensation, or dopability.

## Synthesis and measurement can freeze different equilibria

Defect populations may equilibrate at a growth or annealing temperature and then freeze as diffusion becomes slow, while electronic charge states continue to re-equilibrate at the measurement temperature. Quenching, illumination, bias, interfaces, surfaces, strain, and nonequilibrium chemical reservoirs can create populations outside a one-temperature bulk equilibrium model.

Model the kinetic sequence explicitly when needed: which atomic defects can form, migrate, associate, or dissociate at each stage, and which carriers can still exchange. A low equilibrium formation energy does not supply a migration barrier or equilibration time. Reaction-path and dynamics calculations address those separate quantities.

## Common failures reveal missing evidence

Warning signs include charge density spread over the entire cell, different band occupations between nominally comparable bulk and defect calculations, a correction larger than the energy differences being interpreted, no far-field potential region, a strong dependence on cell shape, and transition levels that move with k mesh or structural initialization.

Other failures are bookkeeping errors: reversed atom signs, chemical potentials from an incompatible phase diagram, a VBM from a different energy gauge, corrected energy corrected a second time, charged-cell energy compared with an unmatched neutral reference, and rounded plot intersections substituted for stored values. Diagnose these at the component level rather than tuning terms until a familiar diagram appears.

## Preserve every line and its lineage

A reusable defect record contains the host structure and reference calculation; defect type, site mapping, final configuration, charge, spin, and symmetry; atom-count changes and reservoir definitions; raw host and defect energies; VBM and band edges; correction inputs, components, diagnostics, and version; cell, k sampling, relaxation, localization, and convergence evidence; and links to every artifact.

Derived records should preserve line intercepts and slopes, lower-envelope membership, transition levels, chemical-potential condition, Fermi domain, statistical model, charge-neutrality solution, and uncertainty or sensitivity results. Keep alternative configurations and excluded states with reasons. A rendered formation-energy plot is not a substitute for this ledger.

## Keep adjacent questions separate

Compositional phase stability supplies allowed atomic chemical potentials. Bulk reference-state, convergence, and structure-optimization topics supply compatible host and defect parents. Band-structure work supplies method-consistent edges and carrier density of states. Electrostatic-potential analysis can support alignment diagnostics but does not by itself validate a charged-defect correction.

Migration barriers describe defect motion; phonons and free-energy methods add finite-temperature contributions; spectroscopy addresses optical or vibrational signatures; surfaces and interfaces change boundary conditions and electrostatics. The bulk three-dimensional correction assumptions described here should not be transferred unchanged to slabs, wires, two-dimensional materials, or explicit fields.

## What this topic establishes

This topic establishes how a declared defective supercell, atomic and electronic reservoirs, comparable total energies, one coherent finite-size correction, and charge-state thermodynamics combine into formation-energy lines and equilibrium transition levels. It also establishes the extra statistical and charge-neutrality evidence needed before those lines can support concentration or doping claims.

It does not establish exhaustive defect configurations, isolated-defect convergence without size evidence, correct band edges, finite-temperature populations from static energies alone, optical levels, migration rates, experimental defect identity, or material performance.

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
