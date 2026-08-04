---
topic_slug: analyze-and-compare-results
status: reviewed
---

Analysis begins when raw program outputs are transformed into quantities that answer the scientific question. That transformation is part of the method: selecting a reference energy, integrating a spectrum, fitting an equation of state, identifying an extremum, or averaging a trajectory can change the object being compared. A plot is therefore not the result by itself. The result is a value or distribution with a defined physical meaning, lineage, normalization, and uncertainty boundary.

## Define the comparison before ranking values

A valid comparison specifies the object, observable, thermodynamic and boundary conditions, reference state, normalization, method, and numerical quality required to place results on the same scale. Two numbers with the same label may still answer different questions. Formation energies built from different elemental references, band gaps sampled on different k domains, surface energies for different terminations, and conductivities under different scattering models cannot be ranked without reconciling those differences.

Create a comparison table whose rows are physical cases and whose columns carry both the observable and its identity metadata. At minimum, retain structure and composition, charge and spin state, geometry treatment, functional and corrections, basis/core treatment, cell or area normalization, temperature or pressure, sampling domain, reference definition, units, convergence evidence, and source artifact. Missing metadata should remain missing; it must not be filled by assuming that two workflows used the same convention.

## Transform raw outputs with an explicit measurement model

Let the reported quantity be

```text
y = g(x_1, x_2, ..., x_n; c),
```

where the `x_i` are extracted values, `c` denotes conventions and fixed assumptions, and `g` is the analysis transformation. Examples include a difference of total energies, a tensor rotation, a fitted derivative, an integral over energy, or a time average. Record the versioned code and parameters implementing `g`, the input artifact hashes, and intermediate values needed to reproduce the result.

Unit conversion and normalization should occur once in a traceable layer. Extensive quantities must be divided by a declared atom count, formula unit, cell, area, length, or volume only when that denominator represents the scientific comparison. A two-dimensional sheet value, a slab supercell value, and a three-dimensional bulk density do not become comparable merely by attaching the same unit string.

For a difference

```text
Delta y = y_A - y_B,
```

the sign convention and the identities of `A` and `B` must travel with the value. If both results share reference calculations or fitted parameters, their errors are correlated. Treating them as independent can overestimate or underestimate the uncertainty of `Delta y`.

## Separate numerical variation from changes in the physical model

Numerical precision asks how the observable changes as representation and sampling are refined while the physical model is held fixed. Method sensitivity asks how it changes when the functional, pseudopotential family, Hubbard correction, relativistic treatment, finite-size correction, scattering model, or other physical approximation changes. Structural sensitivity asks whether the same geometry is evaluated or each method is allowed to relax to a different minimum. These variations answer different questions and should not be collapsed into one anonymous error bar.

A useful decomposition compares controlled pairs. A fixed-geometry method comparison isolates electronic-model changes more directly; a separately relaxed comparison includes both electronic and structural response. A convergence series estimates residual numerical variation for the target observable. Neither series alone measures error relative to nature.

Cross-code agreement is strongest when structures, physical approximations, core treatment, basis completeness targets, sampling, and analysis definitions are deliberately aligned. Agreement under one benchmark demonstrates reproducibility within that scope. It does not prove accuracy for a different chemistry or observable, and disagreement does not identify which implementation is correct until the comparison is decomposed.

## Uncertainty must correspond to a declared source

An uncertainty statement should say what varies, how it was estimated, and what coverage it represents. Replicate calculations can measure stochastic or sampling variability; convergence tests constrain selected numerical approximations; fit covariance describes uncertainty under a fitted model; an ensemble of functionals samples chosen model variation; and comparison with experiment mixes computational and experimental uncertainty with possible model discrepancy. These are not interchangeable.

When a measurement model is differentiable, a first-order propagation can be written

```text
u_y^2 approximately equals sum_i sum_j
  (partial g / partial x_i)(partial g / partial x_j) Cov(x_i, x_j),
```

where `u_y` is the standard uncertainty and `Cov` is the covariance of the inputs. The approximation assumes local linearity and an adequate covariance model. Monte Carlo propagation can handle nonlinear transformations, but it remains only as defensible as its input distributions and correlations. A spread across arbitrary methods is not automatically a calibrated probability distribution.

Report resolution and uncertainty at compatible precision. If two values differ by less than the demonstrated numerical sensitivity, ranking them as distinct is unsupported. Conversely, overlapping uncertainty intervals do not by themselves prove equality; the scientific decision depends on the comparison model, correlations, and required effect size.

## Use plots to expose evidence, not hide it

Choose axes and transformations that preserve the scientific question. Show individual observations with summaries when sample counts permit, distinguish interpolated curves from calculated points, and label energy zeros, normalization, smoothing, and fit domains. A broadened spectrum should preserve the raw discrete or less-smoothed data needed to test whether a feature is robust. A logarithmic scale can reveal orders of magnitude but must not conceal signs or zeros.

Avoid selecting only the most favourable structure, functional, trajectory window, or plotting range after viewing the result. Record exclusions and analysis changes with reasons. When many candidates or hypotheses are screened, distinguish exploratory ranking from confirmatory tests and account for selection effects before attaching a probability-like interpretation.

Correlations can guide mechanisms, but a shared trend does not establish causation. Test competing explanations through controlled perturbations, symmetry, limiting cases, independent observables, or predictions that were not used to construct the explanation.

## Comparisons end in an evidence table, not a slogan

For each proposed finding, link the derived value to source artifacts, transformation code, convergence evidence, reference and normalization, uncertainty components, controlled comparisons, and known alternatives. Record results that contradict the preferred interpretation as well as those that support it. Preserve machine-readable tables behind figures so that the reported comparison can be regenerated without digitizing an image.

This topic organizes and quantifies results. **Validate Results and Scientific Conclusions** asks whether those results survive numerical, physical, methodological, and external challenges and what claim they support. **Document and Preserve the Study** packages the lineage for independent reuse. Analysis cannot promote a calculated observable into a scientific conclusion without those later steps.

## Sources and methods

- [Lejaeghere and co-workers, cross-code reproducibility in DFT](https://doi.org/10.1126/science.aad3000)
- [Janssen and co-workers, numerical quality control for DFT databases](https://arxiv.org/abs/2008.10402)
- [Gabriel and co-workers, observable-specific DFT precision](https://arxiv.org/abs/2001.01851)
- [NIST guidance on uncertainty statements and comparison](https://pml.nist.gov/cuu/Uncertainty/international1.html)
- [Talirz and co-workers, Materials Cloud provenance and reuse](https://arxiv.org/abs/2003.12510)
