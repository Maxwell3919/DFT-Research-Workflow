---
topic_slug: equation-of-state-and-structural-phase-stability
status: reviewed
---

## Inspect structures and the full energy-volume record

Open each candidate structure in a crystal viewer before fitting an equation of state. Compare symmetry, coordination, magnetic state, and the degrees of freedom allowed to relax at every volume. The raw object to inspect is the complete energy-volume table together with its structures, not only the fitted minimum.

Plot the points, fitted curves, and residuals in a notebook, spreadsheet, or plotting program. Vary the fit window and model, then decide whether the sampled range actually brackets a smooth minimum and whether competing phases were compared at a common pressure and method. [Visual and symmetry tools](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry) support the structural inspection; [electronic-property tools](/DFT-Research-Workflow/operations/resource-landscape/#electronic-properties) and [literature sources](/DFT-Research-Workflow/operations/resource-landscape/#literature-learning) provide common analysis routes and published comparison data.

Use an equation of state when you need an equilibrium volume, hydrostatic bulk modulus, pressure-volume relation, or a common-pressure comparison between named structural branches. The deliverables are a state-labelled point table, accepted fit ensemble and residuals, and, when needed, enthalpy branches evaluated at the same pressure.

The attached guides form the operational path: **Design a Traceable Energy-Volume Series**, **Fit and Challenge an Equation of State**, and **Compare Phase Enthalpies at Common Pressure**.

## Decide whether the series is ready to fit

Do not fit yet if the sampled minimum is not bracketed, a structure or magnetic state changes without a separate branch label, an endpoint controls the answer, or the energy and stress precision is inadequate for the intended derivative or crossing. Open the affected structures and outputs before changing the fit window.

Only a state-consistent, numerically adequate point series may proceed to fitting. A smooth curve cannot repair an unverified parent and is not evidence that a structure is mechanically, dynamically, thermally, or compositionally stable.

## Begin with one structural or phase question

State whether the output is $V_0$, $B_0$, a pressure-volume relation, or a crossing between named phases. Record composition, charge, phase and magnetic identity, temperature model, pressure interval, energy normalization, and relaxation policy.

## Decide what changes when volume changes

Choose isotropic scaling, fixed-volume shape relaxation, internal relaxation, or full hydrostatic cell relaxation before generating points. A scalar volume does not identify the deformation path.

A clamped-ion curvature and a relaxed-ion curvature are different response quantities.

## Preserve phase and electronic identity across the series

For every point retain cell vectors, coordinates, parent structure, allowed degrees of freedom, energy, forces, stress, relaxation status, symmetry, magnetic and charge diagnostics, method identity, numerical settings, software version, and artifact hashes.

Investigate a symmetry switch, magnetic collapse, occupation change, or bond rearrangement as a branch boundary. Do not delete it to improve the fit.

## Sample the minimum and the intended pressure interval

Sample on both sides of an expected minimum and across the volume range required by the target pressure interval. Extend or refine the series when the minimum is not bracketed or endpoint choice controls the answer.

There is no universal number of points or percentage volume range.

## Make every energy point comparable

Use the same physical evaluator and compatible numerical accuracy. Volume changes can alter basis completeness, reciprocal-space density, FFT grids, occupations, and Pulay stress even when nominal settings are unchanged. Converge the derived minimum, curvature, pressure, and crossing.

## The equation of state is a derivative relation

For one static branch,

$$
P(V)=-\frac{\partial E(V)}{\partial V},
\qquad
B(V)=-V\frac{\partial P}{\partial V}
=V\frac{\partial^2E}{\partial V^2}.
$$

<!-- P(V) = -∂E(V) / ∂V -->
<!-- B(V) = -V ∂P/∂V = V ∂²E/∂V² -->

Differentiation amplifies noise. Keep energy and volume in the same cell or formula-unit normalization before converting pressure units.

## Fit a model, not a decorative curve

None is universally preferred.

Record fit form, code and version, data window, weights, pointwise residuals, parameters, covariance or resampling uncertainty, and unit conversion. A common third-order Birch-Murnaghan representation uses

$$
x=\left(\frac{V_0}{V}\right)^{2/3},
$$

<!-- x = (V₀ / V)^(2/3) -->

with $E_0$, $V_0$, $B_0$, and $B_0'$ fitted only over the supported branch.

## Challenge the fit form and window

Repeat the analysis with defensible forms and subsets. Structured residuals, endpoint leverage, or strong movement in $V_0$, $B_0$, or $B_0'$ require better data or a narrower claim. Do not choose a curve by appearance.

## Read equilibrium parameters within their scope

$V_0$ is the minimum of the represented branch under the declared relaxation and energy model. $B_0$ is hydrostatic curvature, not the full elastic tensor. $B_0'$ is often especially sensitive to sampling and fit form.

## Compare phases at one common pressure

At fixed composition and zero temperature, evaluate

$$
H_i(p)=\min_V\left[E_i(V)+pV\right].
$$

<!-- H_i(p) = min_V [E_i(V) + pV] -->

Each phase normally minimizes at a different volume. The pressure, potential, and normalization must be common.

## The common-tangent picture has the same content

On an energy-volume plot, the common tangent has slope $-p_t$ and touches the two phase branches at their separate minimizing volumes.

A represented crossing satisfies

$$
H_\alpha(p_t)=H_\beta(p_t).
$$

<!-- H_α(p_t) = H_β(p_t) -->

An intersection of two $E(V)$ curves at one common volume is not generally the transition condition. Retain both minimizing volumes, supported pressure ranges, phase inventory, and sensitivity to fit form and numerical settings.

## Metastability and hysteresis are not equilibrium boundaries

A branch can survive beyond an equilibrium enthalpy crossing or disappear before it. Those events concern basin survival and hysteresis.

An EOS analysis does not calculate a transformation pathway or rate.

## Hydrostatic curvature does not prove structural stability

A positive fitted bulk modulus shows positive curvature along the sampled hydrostatic direction near the fitted minimum. It does not establish shear stability, phonon stability, compositional stability, or experimental persistence.

## Temperature changes the potential being minimized

For every candidate phase, construct the same class of potential:

$$
G_i(T,p)=\min_V\left[
E_i(V)+F_{\mathrm{vib},i}(T,V)+F_{\mathrm{el},i}(T,V)
+F_{\mathrm{other},i}(T,V)+pV
\right].
$$

<!-- G_i(T,p) = min_V [E_i(V) + F_vib,i(T,V) + F_el,i(T,V) + F_other,i(T,V) + pV] -->

Numerical occupation smearing is not automatically $F_{\mathrm{el}}$. Do not add a thermal term to one candidate while leaving competitors at static energy.

## Diagnose failure before interpreting parameters

Stop and revisit the series when the lowest point is an endpoint, states switch, energy or stress jumps with grids, residuals have structure, the fitted minimum lies outside the data, or accepted forms predict incompatible crossings.

## Quantify uncertainty at the level of the conclusion

Separate pointwise numerical variation, fit uncertainty, fit-form sensitivity, phase-set incompleteness, and method bias. For a transition pressure, report the range from accepted settings and fits. If it matches the claimed resolution, the boundary is unresolved.

## Decide what the curves may support next

Store every structure, state, point, exclusion, fit, residual, convergence table, enthalpy branch, crossing uncertainty, and parent artifact. A stable minimum may continue to a bounded equilibrium-volume or hydrostatic-modulus statement; compatible phase branches may continue to a common-pressure enthalpy comparison. The result does not establish full elastic or dynamical stability, cross-composition stability, a pathway or rate, finite-temperature equilibrium without required terms, or experimental phase identity.

## Sources and methods

- [Birch, finite elastic strain of cubic crystals](https://doi.org/10.1103/PhysRev.71.809)
- [Murnaghan, compressibility under extreme pressures](https://doi.org/10.1073/pnas.30.9.244)
- [Vinet and co-workers, compressibility of solids](https://doi.org/10.1029/JB092iB09p09319)
- [Mouhat and Coudert, elastic stability conditions](https://doi.org/10.1103/PhysRevB.90.224104)
- [ASE equation-of-state documentation](https://docs.ase-lib.org/ase/eos.html)
- [VASP volume-relaxation and EOS guidance](https://vasp.at/wiki/Volume_relaxation)
- [Phonopy quasiharmonic documentation](https://phonopy.github.io/phonopy/qha.html)
- [OpenStax explanation of enthalpy](https://openstax.org/books/chemistry-2e/pages/5-3-enthalpy)
