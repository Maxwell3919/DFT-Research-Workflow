---
topic_slug: surface-energy-and-work-function
status: reviewed
---

A surface calculation replaces bulk translational symmetry in one direction with two boundaries between a solid and its environment. It can answer two different questions: how much free energy is associated with creating a specified surface, and how much energy is required to remove an electron from that surface to a field-free vacuum. Neither quantity belongs to the bulk alone. Both depend on orientation, termination, reconstruction, composition, charge distribution, environment, and the numerical boundary model.

## Name the surface as a physical state

A Miller index identifies an orientation, not a unique surface. The scientific object also includes the bulk phase, exposed termination, surface stoichiometry, reconstruction, defects and adsorbates, lateral cell, strain, magnetic and charge state, and external chemical environment. For polar or multicomponent crystals, one orientation can admit several chemically distinct terminations with different excess energies and dipoles.

Preserve the mapping from the parent bulk to both sides of the final relaxed slab. If relaxation changes bonding, stoichiometry, symmetry, or the intended reconstruction, the result belongs to the final surface state rather than the initial label.

## Surface energy is an excess per area

For a stoichiometric symmetric slab with two equivalent faces, a common static expression is

```text
γ = [E_slab(N) - N e_bulk] / (2A)
```

`E_slab(N)` is the total energy of the slab containing `N` bulk formula units or atoms under a stated counting convention, `e_bulk` is the energy of the same unit in the compatible bulk reference, and `A` is the area of one face. The factor two counts the two equivalent surfaces. If energies are in eV and area in Å², `γ` is first obtained in eV Å⁻² and may be converted to J m⁻².

This subtraction isolates an excess only when the extensive bulk term cancels. It is not a raw slab energy divided by area, and it is not automatically a finite-temperature surface free energy.

## An asymmetric slab supplies a sum, not two separate energies

If the top and bottom faces differ but the slab remains stoichiometric, the same subtraction gives

```text
E_slab - N e_bulk = A(γ_top + γ_bottom)
```

One equation determines only the sum of the two surface excesses. It cannot assign `γ_top` and `γ_bottom` separately without additional slabs, a cleavage construction, passivation model, or thermodynamic cycle. Dividing by two would silently report their average as though both faces were identical.

Work functions are different: when the electrostatics provide two field-free vacuum plateaus, the two sides can have distinct vacuum levels and therefore distinct side-specific work functions.

## Open stoichiometry requires chemical potentials

When a termination adds or removes species relative to a bulk reference, the surface free energy becomes a grand-potential excess. A general form is

```text
γ(T, p, {μ_i}) = [G_slab - Σ_i N_i μ_i] / Σ_j A_j
```

`G_slab` is the free energy of the slab model, `N_i` is the number of atoms of species `i`, `μ_i` is the corresponding reservoir chemical potential, and the denominator sums the areas of the explicitly represented interfaces. Bulk equilibrium and avoidance of competing phases constrain the allowed `μ_i`; gas pressure, activity, or electrode conditions require their own thermodynamic mappings.

A surface-energy ordering at one reservoir point need not persist at another. Static DFT total energies provide only part of `G_slab`; vibrational, configurational, magnetic, adsorbate, and environmental contributions can matter.

## Cleavage, unrelaxed creation, and relaxed surfaces differ

Cleavage energy is the reversible work per area to split a bulk crystal into two complementary surfaces under a defined path. An unrelaxed surface energy measures the excess before ionic response, while a relaxed surface energy includes the energy lowering within the allowed structural degrees of freedom. These quantities coincide only under restrictive constructions.

Report whether the in-plane lattice is fixed to a bulk reference, whether ions and cell components were relaxed, and whether both resulting faces are the same. A cleavage pair can be useful for asymmetric or polar terminations, but its sum does not uniquely determine either isolated surface.

## The bulk reference can create thickness drift

The surface excess subtracts two large extensive energies. If `e_bulk` differs slightly from the slope implicit in the slab series because of incompatible k-point sampling, basis completeness, strain, pseudopotential, functional, magnetism, or numerical grids, the residual error grows with `N`. The derived `γ` then drifts linearly with slab thickness even though every SCF calculation has converged internally.

Fiorentini and Methfessel proposed obtaining the bulk-like slope and surface intercept from a sequence `E_slab(N) = N e_bulk^fit + E_excess`; Boettger analyzed the nonconvergence caused by inconsistent bulk subtraction. A fit does not repair state changes or unconverged slabs. It is a diagnostic and estimator only when the series shares one orientation, termination, lateral cell, relaxation convention, and electronic branch.

## Orientation, termination, and reconstruction must be searched

Different facets break different bonds and expose different coordination environments. A nominally low-index cut can reconstruct, change stoichiometry, order vacancies, adsorb residual gas, or choose a larger lateral periodicity. A constrained unreconstructed slab answers the energy of that constrained state, not necessarily the equilibrium surface.

Search candidate terminations and reconstructions at the resolution demanded by the conclusion. Preserve higher-energy and metastable states rather than overwriting them. Surface-energy differences are bounded by the represented state set in the same way that bulk relative energies are bounded by enumerated structures.

## Polar surfaces may not possess the naive slab limit

Tasker's electrostatic classification shows why stacking charged planes can create a dipole that grows with thickness. An ideal unreconstructed polar termination can then have a divergent electrostatic energy rather than a well-defined neutral-slab surface energy. Real surfaces may compensate through reconstruction, stoichiometry change, adsorption, electronic redistribution, or defects.

A dipole correction removes a chosen periodic-image field; it does not supply the missing physical compensation mechanism. Before interpreting a polar slab, verify charge neutrality, layer sequence, potential behaviour with thickness, and the state by which the surface is stabilized.

## Periodic slabs contain interacting images

Vacuum separates repeated slabs geometrically but does not guarantee electrostatic or wavefunction decoupling. The needed vacuum depends on density spill-out, dipole and multipole moments, electrostatic solver, Coulomb treatment, basis, and target observable. Slab thickness must also be sufficient for a bulk-like interior or for a controlled finite-size extrapolation.

Increase thickness and vacuum independently where possible. Track surface energy, relaxation, layer-resolved charge, central-layer geometry, electrostatic potential, work function, and any surface-state splitting. A single visually empty region is not a convergence test.

## Relaxation must preserve the intended comparison

Surface atoms can undergo large normal and lateral relaxations while deeper layers approach the bulk. Choices about fixed layers, symmetric relaxation, in-plane strain, and cell shape define different physical constraints. Compare only slabs that use a consistent constraint and strain model, or quantify the work needed to transform between them.

Check residual forces together with surface identity and thickness. A low force threshold does not show that the selected reconstruction is globally lowest, nor that the slab interior reproduces the intended bulk state.

## Converge the surface observables, not only the SCF cycle

Surface energy and work function respond differently to numerical choices. The former is a cancellation of extensive energies; the latter is a difference between an electronic chemical potential and a vacuum reference. Converge both against slab thickness, vacuum, lateral cell, k sampling, basis or cutoff, electrostatic grids, occupation treatment, and relaxation policy over the range relevant to the claim.

Metallic surface states can make k sampling and occupation treatment especially important. Asymmetric dipoles can make vacuum and electrostatic boundary conditions dominant. There is no transferable slab thickness, vacuum width, mesh, smearing, force threshold, or work-function tolerance for all materials.

## Work function is referenced to field-free vacuum

For a conducting slab at electronic equilibrium,

```text
Φ = E_vac - E_F
```

`E_vac` is the electrostatic energy of an electron in a charge-density-free, field-free region outside a specified face, and `E_F` is the slab Fermi energy in the same energy gauge. Both are energies, usually reported in eV; their difference is the minimum reversible electronic removal energy within the stated surface model.

The expression is meaningful only when the vacuum reference is flat and both quantities come from one compatible calculation or a documented alignment. A value read at a cell boundary where the potential is sloped is not a vacuum level.

## Planar and macroscopic averages reveal the reference

Average the appropriate electrostatic potential over planes parallel to the surface to obtain `V(z)`. Oscillations inside the slab reflect atomic layers, while a plateau in a charge-free region supplies `E_vac`. A macroscopic average can expose slowly varying fields or a bulk-like interior but must state its smoothing window.

Potential definitions differ among codes. Use the documented Hartree-plus-ionic or local potential appropriate to the implementation, and do not mix an electrostatic plateau from one convention with a Fermi level from another. Store the raw grid, averaging direction, window, plateau mean, span or slope, and code version.

## Asymmetric slabs can have two work functions

A surface dipole shifts the vacuum level. When the two faces differ, the left and right plateaus may be unequal even though the slab has one equilibrium `E_F`:

```text
Φ_left = E_vac,left - E_F
Φ_right = E_vac,right - E_F
```

Report the side, termination, surface normal, and plateau window with each value. Averaging the two work functions discards a physically meaningful asymmetry. If a periodic sawtooth or residual slope contaminates either vacuum region, neither endpoint value should be treated as a plateau.

## Dipole corrections enforce a boundary model

An asymmetric periodic slab produces an artificial electric field through the vacuum because the repeated dipoles interact. Bengtsson's correction introduces a compensating discontinuity so a field-free region can be recovered. Official VASP and GPAW guidance likewise treats a flat vacuum potential as a prerequisite for side-specific work functions.

The correction must be placed consistently with the slab and vacuum and converged with cell dimensions. Compare corrected and uncorrected potential profiles, inspect discontinuities away from charge density, and verify that the intended plateaus become insensitive to vacuum. A corrected number is not automatically a physical field response, charged-electrode potential, or isolated-surface energy.

## Semiconductor surfaces require an electronic reference choice

For an ideal intrinsic semiconductor calculation, the numerical Fermi level can lie at a convention-dependent position inside the gap because no states occupy that interval. Surface states, doping, finite-temperature occupations, defects, and band bending can move the electron chemical potential. A single slab may be too thin to represent a space-charge region found experimentally.

Therefore state how `E_F` is defined. Depending on the question, ionization potential `E_vac - E_VBM` and electron affinity `E_vac - E_CBM` may be better-defined surface quantities than a work function based on an arbitrary in-gap Fermi level. Experimental work functions require declared doping, temperature, surface preparation, and electrostatic conditions.

## Environment changes both excess energy and electron removal

Adsorbates, oxidation, hydroxylation, defects, contamination, solvent, electric fields, and charge transfer modify surface stoichiometry and dipole. A clean-vacuum calculation should not be compared casually with an ambient Kelvin-probe value. The reviewed clean-metal compilation by Derry, Kern, and Worth demonstrates that experimental values require surface-specific evaluation rather than one elemental constant.

At finite gas pressure, atomistic thermodynamics compares surface grand potentials over allowed chemical potentials, as in Reuter and Scheffler's treatment of RuO₂(110). Electrochemical interfaces additionally require electrode potential, charge compensation, solvent, and a reference-electrode scale; a vacuum work function alone does not define an operating electrochemical potential.

## Surface energy supports an equilibrium shape only with a complete model

Herring's formulation relates orientation-dependent equilibrium surface free energies to the Wulff construction. The distance of a facet from the construction center is proportional to its `γ` at the same thermodynamic conditions. Missing orientations, terminations, reconstructions, or environmental states can change the predicted shape.

The Wulff shape is an equilibrium construction. Growth morphology also depends on attachment kinetics, diffusion, precursors, supersaturation, strain, and defects. The lowest calculated surface energy does not by itself identify the facet observed during synthesis.

## Real Si data illustrate comparison without proving agreement

The InterMat study reports OptB88vdW results for unreconstructed non-polar Si slabs alongside experimental values. For JARVIS `JVASP-1002`, its Table 1 lists work functions of `5.00`, `5.30`, and `5.64 eV` and surface energies of `1.60`, `1.66`, and `2.22 J m⁻²` for (111), (110), and (001), respectively. The corresponding experimental columns differ by orientation and by quantity.

The subordinate worked example freezes those six pairs, hashes the snapshot, and creates an original plot under the article's CC BY 3.0 terms. It is evidence that real published surface results can be traced and compared. It is not a rerun of InterMat, an independent validation of its DFT, or proof that unreconstructed calculations and experimentally prepared surfaces represent identical states.

## Failure patterns identify the missing control

Surface energy that drifts with thickness often signals a mismatched bulk slope, state switch, or insufficient interior. Odd-even oscillation can reflect quantum-size or stacking effects. A reconstructed top face paired with an unintended bottom face invalidates a symmetric divisor. A polar potential that grows with thickness indicates unresolved compensation rather than a need to report more digits.

For work functions, a sloped vacuum potential, plateau dependence on window, unequal values accidentally averaged, inconsistent potential components, or sensitivity to dipole placement indicates an incomplete electrostatic reference. Large apparent agreement with experiment can also arise from cancellation between method error and a mismatched experimental surface condition.

## Preserve the surface ledger and potential evidence

A reusable surface record includes the parent bulk structure and energy reference; orientation, termination, reconstruction, stoichiometry, lateral cell, area, surface count, strain, charge, spin, constraints, and relaxation history; slab and vacuum series; total energies; chemical potentials; electrostatic boundary treatment; and convergence decisions.

For each work function retain `E_F`, both planar potential profiles, averaging definition, plateau windows and slopes, side labels, dipole settings, and charge density used to identify vacuum. Derived figures should link to source data, code, units, hashes, and exclusions. A rendered atomic slab or a single scalar cannot replace this provenance.

## Keep adjacent scientific questions separate

Adsorption energy measures binding relative to chosen gas or molecular references and belongs to the next topic. Interface energetics and band alignment replace vacuum with a second material and require strain, registry, interface stoichiometry, and lineup evidence. Electrostatic-potential analysis provides techniques used here but does not by itself establish a surface energy.

Bulk convex-hull stability constrains reservoirs but does not rank facets. Defect thermodynamics supplies surface-defect populations only after changing dimensionality and correction assumptions. Reaction paths, kinetics, phonons, and finite-temperature sampling are needed for reconstruction rates and free-energy contributions.

## What this topic establishes

This topic establishes how compatible bulk and slab energies define a conditional surface excess, how stoichiometry and reservoirs alter that excess, and how a field-free side-specific vacuum reference combines with an electron chemical potential to define a work function. It also establishes the evidence needed to compare facets, thicknesses, terminations, calculations, and experiments without confusing them.

It does not establish the exhaustive lowest-energy reconstruction, an experimental surface composition, a finite-temperature equilibrium shape, growth kinetics, emission current, catalytic activity, electrochemical operating potential, or method accuracy from one slab calculation.

## Sources and methods

- [Fiorentini and Methfessel, convergent surface energies](https://doi.org/10.1088/0953-8984/8/36/005)
- [Boettger, thin-film surface-energy nonconvergence](https://doi.org/10.1103/PhysRevB.49.16798)
- [Bengtsson, dipole correction for surface supercells](https://doi.org/10.1103/PhysRevB.59.12301)
- [Tasker, stability of ionic crystal surfaces](https://doi.org/10.1088/0022-3719/12/22/036)
- [Herring, surface free energies and equilibrium crystal shape](https://doi.org/10.1103/PhysRev.82.87)
- [Reuter and Scheffler, atomistic thermodynamics of RuO₂(110)](https://doi.org/10.1103/PhysRevB.65.035406)
- [Lin and co-workers, work-function review](https://doi.org/10.1103/PhysRevApplied.19.037001)
- [Derry, Kern, and Worth, clean-metal work functions](https://doi.org/10.1116/1.4934685)
- [Choudhary and Garrity, InterMat surface dataset](https://doi.org/10.1039/D4DD00031E)
- [VASP official work-function workflow](https://vasp.at/wiki/Computing_the_work_function)
- [GPAW official dipole-correction tutorial](https://gpaw.readthedocs.io/tutorialsexercises/electrostatics/dipole_correction/dipole.html)
