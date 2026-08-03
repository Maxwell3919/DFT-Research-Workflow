---
topic_slug: equation-of-state-and-structural-phase-stability
status: reviewed
---

An equation of state connects the energy of one structural branch to its volume or pressure. It can locate an equilibrium volume, estimate resistance to hydrostatic compression, and compare candidate phases at a common pressure. Those conclusions depend on how the energy–volume points were generated, which state each point represents, which analytic form and range were fitted, and which thermodynamic potential is appropriate. A smooth curve by itself is not evidence that a structure is mechanically, dynamically, thermally, or compositionally stable.

## Begin with one structural or phase question

State whether the calculation seeks the equilibrium volume of one phase, its bulk modulus, a pressure–volume relation, or a pressure-induced crossing between named candidate phases. These are related uses of energy–volume data, but they do not share one automatic protocol.

For each candidate, define composition, charge, crystal and magnetic state, temperature model, pressure range, relaxation policy, energy convention, and normalization. A comparison between phases requires the same composition or a separately balanced chemical reaction. A pressure-driven transition claim also requires every relevant phase branch to be represented over the pressure interval where it may compete.

The result is therefore a family of state-labelled curves, not an anonymous list of volumes and energies.

## The equation of state is a derivative relation

For a static electronic branch at fixed particle number, the corresponding pressure and hydrostatic curvature are

```text
P(V) = -∂E(V) / ∂V
B(V) = -V ∂P/∂V = V ∂²E/∂V²
```

`E(V)` is the static energy of one declared structural branch after applying its stated internal relaxation policy. `P` is hydrostatic pressure, positive under compression in this convention. `B` is the bulk modulus; at the zero-pressure equilibrium volume `V₀`, it measures the local curvature of the energy with respect to uniform volume change. At finite temperature the analogous derivative is taken from the appropriate Helmholtz free energy rather than from the static `E(V)` alone.

If energy is in eV per cell and volume in Å³ per cell, `P` and `B` emerge in eV/Å³ and may be converted to pressure units. Both numerator and denominator must refer to the same cell. Replicating a cell multiplies `E` and `V` together and should not change an intensive pressure or bulk modulus, but mixing primitive-cell energies with conventional-cell volumes corrupts the derivatives.

The equations do not turn sparse or inconsistent data into a physical equation of state. Differentiation amplifies noise, which is why sampling and fit diagnostics matter.

## Decide what changes when volume changes

A volume point is not defined by its scalar volume alone. Several deformation policies can reach the same `V`:

- isotropic scaling holds cell shape fixed while changing all lattice vectors by one factor;
- fixed-volume shape relaxation allows deviatoric strain to change at constant determinant;
- internal relaxation moves atoms while the cell constraint remains active;
- a fully relaxed structure under external hydrostatic pressure changes both shape and internal coordinates.

These policies trace different energy branches except in special high-symmetry cases. Isotropic scaling of a low-symmetry cell can impose shear stress; full shape relaxation can instead move the calculation onto another structural path. A clamped-ion curvature and a relaxed-ion curvature are different response quantities.

Write the allowed degrees of freedom before generating the series. Do not merge points produced by different policies into one fit.

## Preserve phase and electronic identity across the series

Each point should remain on the intended structural and electronic branch. Compression or expansion can trigger a symmetry change, magnetic collapse, charge redistribution, occupation change, bond rearrangement, or discontinuous cell-shape switch. Such an event may be real physics, a solver-path effect, or both; in every case it breaks the assumption that one smooth branch is being sampled.

Track lattice metrics, atomic mapping, symmetry descriptors, magnetic observables, charge and occupation state, and relaxation history alongside energy and volume. Use branch-specific identifiers rather than relabelling every relaxed result with the starting phase name.

A discontinuity should be investigated as a possible branch boundary. Deleting it merely to improve a fit can erase the transition that the calculation was meant to detect.

## Sample the minimum and the intended pressure interval

An equilibrium fit needs points on both sides of its minimum. A pressure study needs data that cover the volumes selected by the target pressure range for every candidate phase. Points densely clustered on one side may yield a plausible extrapolated curve while leaving `V₀`, curvature, and high-pressure behaviour weakly constrained.

Choose sampling adaptively from observed curvature and residuals. Extend or refine the range when the minimum is not bracketed, the fit depends strongly on its endpoints, or competing forms diverge within the intended use interval. Excessively broad data can be equally misleading if one analytic expansion is asked to span electronic or structural changes.

There is no universal number of points or percentage volume range. The necessary range depends on compressibility, symmetry, target pressure, numerical noise, and whether one branch remains continuous.

## Make every energy point comparable

All points in one curve should share the physical method and compatible numerical representation. Functional, potential or basis family, relativistic treatment, Hubbard model, charge, spin constraints, boundary conditions, and energy field must remain controlled. Any intended refinement must be recorded rather than mistaken for physical volume dependence.

Volume changes can alter basis completeness, reciprocal-space density, occupation behaviour, FFT grids, and Pulay stress. A constant nominal cutoff or k-point count does not guarantee constant error as the cell changes. Converge the shape, minimum, pressure derivative, and any phase-crossing observable against the variables that change unequally across the series.

The VASP volume-relaxation documentation illustrates how discrete plane-wave and FFT-grid changes can make energy–volume curves jagged. That is an implementation example of a general rule: smoothness and comparability must be checked at the level of the derived observable, not assumed from successful exits.

## Fit a model, not a decorative curve

An analytic equation of state interpolates and differentiates a bounded dataset. Murnaghan, Birch–Murnaghan, Vinet, finite-strain expansions, and polynomial forms encode different assumptions outside the immediate neighbourhood of the data. None is universally preferred.

A third-order Birch–Murnaghan energy form is commonly written as

```text
x = (V₀ / V)^(2/3)
E(V) = E₀ + (9 V₀ B₀ / 16) { B₀′ (x - 1)^3 + (x - 1)^2 [6 - 4x] }
```

`E₀` and `V₀` are the fitted zero-pressure energy and volume of the branch, `B₀` is its zero-pressure bulk modulus, and `B₀′ = (∂B/∂P)₀` is the pressure derivative of that modulus. The form follows a finite-strain expansion associated with Birch's treatment; it is an approximation over a chosen range, not a new DFT observable.

The fitted parameters are correlated. In particular, `B₀′` can be poorly constrained by a narrow or noisy volume window and can in turn shift `V₀` and `B₀`. Report the fit form, parameter convention, data range, weights, residuals, covariance or resampling uncertainty, and any fixed parameters.

## Challenge the fit form and window

Inspect residuals as a function of volume rather than quoting only an aggregate error. Alternating or curved residuals reveal missing shape; one large endpoint residual may expose a branch change or numerical discontinuity. An excellent residual on a very narrow interval does not validate extrapolation to high compression.

Repeat the analysis with defensible alternative forms and subsets. Parameters that are stable across well-supported fits are more credible than those selected from one convenient curve. If the target is a transition pressure, propagate each acceptable phase fit through the enthalpy comparison; small energy residuals can still shift a crossing because phase differences are small.

Fit selection is part of model uncertainty. It should not be hidden by reporting more digits.

## Read equilibrium parameters within their scope

The fitted `V₀` is the minimum of the represented branch under the chosen relaxation and energy model. It is not automatically the experimental ambient-volume structure, because zero-point motion, temperature, pressure calibration, defects, composition, and method bias may differ.

`B₀` is a hydrostatic curvature. It is not the full elastic tensor and cannot diagnose shear instabilities. `B₀′` describes how the fitted bulk modulus changes near the reference state within the model and range; it is often more sensitive than `V₀` or `B₀` to sampling and fit form.

Convert pressure units only after confirming the energy and volume normalization. Retain the native fitted quantity and the conversion constant or library version used.

## Compare phases at one common pressure

At zero temperature and fixed composition, the stable candidate among a declared set at pressure `p` minimizes enthalpy:

```text
H_i(p) = min_V [E_i(V) + pV]
```

For phase `i`, the minimizing volume satisfies `P_i(V) = p`. The `pV` term has energy units and must use the same cell or formula-unit normalization as `E_i`. Comparing the raw minimum energies `E₀` ignores the work of occupying different volumes and therefore answers only the zero-pressure electronic-energy question.

A candidate crossing occurs when

```text
H_α(p_t) = H_β(p_t)
```

where `p_t` is the model transition pressure for the two represented branches. Both enthalpies must be evaluated at that same pressure, each at its own minimizing volume. An intersection of two `E(V)` curves at one common volume is not generally the transition condition.

## The common-tangent picture has the same content

On an energy–volume plot, a line tangent to both phase curves has slope `-p_t`. Equal tangent intercepts express equal enthalpy. This construction makes the volume discontinuity of a first-order transition visible: the two tangency points can occur at different volumes even though the pressure is common.

The tangent is meaningful only where both fitted branches are supported by data and remain identifiable. A crossing found by long extrapolation, or after one phase has already changed electronic or structural identity, is not a resolved transition.

For more than two candidates, compare all enthalpy branches. Pairwise selection of a preferred crossing can miss an intervening lower phase.

## Metastability and hysteresis are not equilibrium boundaries

An optimized branch can remain a local minimum beyond the pressure where another phase has lower enthalpy. Conversely, an optimizer can leave a metastable basin before the equilibrium crossing. The resulting path dependence and hysteresis concern barriers and basin survival, not the equality condition that defines an equilibrium boundary.

An EOS analysis does not calculate a transformation pathway or rate. Reaction-path methods, dynamics, nucleation models, and experimental kinetics address different questions. Preserve collapsed and surviving branches instead of forcing them into one equilibrium narrative.

## Hydrostatic curvature does not prove structural stability

A positive fitted bulk modulus shows positive curvature along the sampled hydrostatic direction near the fitted minimum. Mechanical stability requires the appropriate strain Hessian or elastic stability conditions for the crystal and stress state. Mouhat and Coudert give symmetry-resolved conditions for unstressed crystals; hydrostatic `B₀` alone cannot test shear directions.

Dynamical stability requires phonon or equivalent perturbation evidence over the relevant Brillouin zone. A structure can sit at a minimum of `E(V)` while possessing an unstable internal displacement or zone-boundary mode. Compositional stability against other compounds belongs to convex-hull analysis. These tests are complementary and cannot be replaced by the visual quality of an EOS curve.

## Temperature changes the potential being minimized

A static electronic `E(V)` curve is commonly interpreted near 0 K within the selected electronic model. Finite-temperature phase comparison requires the relevant free-energy contributions. A schematic quasiharmonic construction is

```text
G_i(T,p) = min_V [E_i(V) + F_vib,i(T,V) + F_el,i(T,V) + F_other,i(T,V) + pV]
```

`F_vib,i` is the vibrational Helmholtz contribution, `F_el,i` an explicitly physical electronic thermal term, and `F_other,i` any declared configurational, magnetic, rotational, or additional contribution. Every term must refer to the same phase, volume, normalization, and thermodynamic model. Numerical occupation smearing is not automatically `F_el`.

Phonopy's quasiharmonic documentation shows the volume-indexed free-energy construction and its pressure term. Quasiharmonic validity can fail near strong anharmonicity, soft modes, disorder, or a reconstructive transition; adding the label “QHA” does not remove those limitations.

## Diagnose failure before interpreting parameters

Common warning patterns include:

- the lowest sampled energy lies at an endpoint;
- relaxed structures switch symmetry or electronic state mid-series;
- energies or stresses jump when numerical grids change;
- residuals have structured curvature rather than random scatter;
- fitted `B₀′` is extreme or changes sharply with the fit window;
- different credible forms predict incompatible pressure ranges or crossings;
- the fitted minimum lies outside the sampled interval;
- a candidate phase is extrapolated far beyond its surviving branch.

These are reasons to revisit data generation, state identity, range, or model selection. They are not repaired by suppressing points, fixing a parameter without justification, or quoting only the most favourable fit.

## Quantify uncertainty at the level of the conclusion

Separate numerical variation in the energy points from fit uncertainty, fit-form sensitivity, phase-set incompleteness, and method bias. Resampling can estimate how point noise affects parameters; window and form comparisons expose model dependence; repeated structural and electronic initializations test branch robustness.

For a phase boundary, report the range of transition pressures produced by accepted convergence settings and fit choices. If that variation is comparable to the claimed pressure resolution, the boundary is unresolved within the tested model. Agreement between several fits to the same underlying data is not independent physical validation.

Experimental comparison requires matching temperature, pressure scale, composition, phase identity, and the measured response. A calculated static bulk modulus and an experimental isothermal or adiabatic modulus need not be identical quantities.

## Preserve the curves and the decisions around them

A reusable EOS record includes every structure and state identifier; exact volumes, cell metrics, energies, forces, stresses, and relaxation status; method and numerical identity; excluded points with reasons; fit forms, code versions, ranges, weights, residuals, parameters, covariance, and unit conversion; convergence studies; and links to parent artifacts.

For phase comparison, also retain the full candidate inventory, common pressure grid or tangent construction, enthalpy branches, crossing uncertainty, and any range where a phase ceases to be identifiable. Store machine-readable point tables and derived results rather than reconstructing them from a rounded plot.

Downstream elastic, phonon, quasiharmonic, phase-diagram, and kinetics work should consume these state-labelled records while adding their own evidence. It should not inherit an unqualified “stable” flag.

## What this topic establishes

This topic establishes how to build and interpret bounded energy–volume relations, equilibrium parameters, and common-pressure enthalpy comparisons for declared candidate phases. It can support an equilibrium volume or candidate phase crossing within a tested structural, numerical, and thermodynamic model.

It does not establish full elastic stability, phonon stability, stability against other compositions, finite-temperature equilibrium without free-energy terms, transformation barriers or rates, experimental realization, or accuracy beyond the tested method and phase set.

## Sources and methods

- [Birch, finite elastic strain of cubic crystals](https://doi.org/10.1103/PhysRev.71.809)
- [Murnaghan, compressibility under extreme pressures](https://doi.org/10.1073/pnas.30.9.244)
- [Vinet and co-workers, compressibility of solids](https://doi.org/10.1029/JB092iB09p09319)
- [Mouhat and Coudert, elastic stability conditions](https://doi.org/10.1103/PhysRevB.90.224104)
- [ASE equation-of-state documentation](https://docs.ase-lib.org/ase/eos.html)
- [VASP volume-relaxation and EOS guidance](https://vasp.at/wiki/Volume_relaxation)
- [Phonopy quasiharmonic documentation](https://phonopy.github.io/phonopy/qha.html)
- [IUPAC definition of enthalpy](https://goldbook.iupac.org/terms/view/H02752)
