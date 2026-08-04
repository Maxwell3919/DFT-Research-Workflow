---
topic_slug: validate-results-and-scientific-conclusions
status: reviewed
---

Validation asks whether a result is credible for the scientific use assigned to it and whether the proposed conclusion is no stronger than the evidence. It is not a final checkbox after plotting. It is a structured attempt to make the result fail through numerical, physical, methodological, and external challenges.

Two questions must remain separate. Verification asks whether the equations, software, and analysis were executed as intended. Validation asks whether the chosen model represents the relevant physical system adequately for a stated purpose. The workflow must distinguish verification from validation. A reproducible calculation can reproduce the same omission, while agreement with one experiment can arise from compensating errors.

## Build a claim–evidence map

Write each candidate conclusion as a proposition that names:

- the material or model state;
- the observable;
- the thermodynamic or operating conditions;
- the method and approximations;
- the uncertainty or tested tolerance;
- the domain over which the statement applies.

Then identify the evidence required for that proposition and the alternative explanations that could produce the same observation.

This prevents common category errors. A negative formation energy is relative to specified reservoirs, not proof of convex-hull stability. A real phonon spectrum on the sampled q mesh is not proof of finite-temperature survival. A high-symmetry-path band gap is not a full-zone guarantee, optical onset, or device prediction. The wording of the claim must preserve the actual evidence boundary.

## Verify identity, execution, and analysis first

First confirm that the intended inputs produced the inspected outputs. Check file identity and lineage, program termination, parsed units and normalization, structure and electronic state, reference energies, spin and symmetry conventions, and the exact transformations used in analysis.

Where practical, recompute selected derived quantities independently from the raw outputs. This can expose parser, unit, sign, normalization, or plotting errors.

These checks establish artifact integrity and software behaviour within their scope. They do not establish numerical convergence or physical accuracy. `JOB DONE`, SCF convergence, force convergence, a passing validator, and a correctly rendered figure are different evidence classes.

## Challenge numerical completion at the observable level

Vary the numerical representation while holding the physical problem fixed. Relevant axes may include basis size, real-space grid, k and q sampling, supercell and vacuum, smearing or integration, band count, interpolation, time step, trajectory length, and solver thresholds.

For a sequence controlled by resolution `h`, one may inspect

```text
Δ_h = y(h_finer) - y(h_coarser) .
```

This is a measured sensitivity over the tested interval. It is not automatically the remaining numerical error. Extrapolation requires a justified convergence model and evidence that the sequence has reached its asymptotic regime.

If the structure, magnetic order, occupation, phase, or state character changes along the sequence, the test no longer isolates discretization error. Treat the change as a physical-state diagnostic and compare like states separately.

## Test physical consistency and limiting behaviour

Apply constraints that follow from the model: conservation of charge or current, acoustic sum rules, Hermiticity, tensor symmetry, protected degeneracies, thermodynamic cycles, and appropriate zero-field, long-wavelength, non-interacting, or other limiting behaviour.

Violating a required constraint can falsify a result. Satisfying it is usually necessary but not sufficient for accuracy.

Cross-check related quantities through genuinely independent routes where possible: forces against finite differences of energy, terminal currents from both contacts, a phase-energy difference through an alternative balanced cycle, or a derived quantity recomputed with an independent parser. Two figures generated from the same incorrect intermediate are not independent confirmation.

## Probe model-form and methodological sensitivity

Change assumptions that could alter the conclusion: exchange--correlation approximation, core treatment, relativistic terms, charge and magnetic candidates, structural ensemble, finite-size correction, quasiparticle or excitonic treatment, scattering channels, or environment.

Keep comparisons controlled so a method change is not silently mixed with a new structure, reference state, or numerical quality. Robustness does not mean that every method returns the same number. It means that the stated conclusion survives the defensible alternatives relevant to its intended scope.

If the sign, ordering, phase assignment, or mechanism changes under a plausible alternative, report the result as method-dependent or unresolved. Cross-code agreement within the same approximation tests reproducibility more directly than physical accuracy.

## Compare with external evidence without tuning after the fact

Before comparing with experiment or another calculation, align the physical objects. Temperature, pressure, composition, defects, surfaces, domains, sample history, instrument response, and data reduction may differ from the idealized model.

Separate calibration from withheld external tests. A fitted datum is calibration, not independent validation. Stronger tests use withheld conditions, independent observables, or systems not used to choose the model. A discrepancy should be separated into numerical uncertainty, model discrepancy, experimental uncertainty, and mismatch of the compared object rather than assigned automatically to either theory or experiment.

Agreement with one value is not sufficient when other features that the model should also reproduce are absent or incorrect.

## Decide what the evidence can support

For each test, record its scope, result, and consequence for the claim. A useful final classification is:

- supported within the tested model and domain;
- sensitive, but the qualitative conclusion is unchanged;
- unresolved because essential evidence is missing;
- contradicted by a reliable check;
- outside the method's capability.

Absence of a detected failure is not proof that none exists. State which alternatives were tested, which were not, and what new evidence would change the conclusion. Preserve negative and null results when their omission would make the evidence base misleading.

The final conclusion should match the weakest essential link. **Analyze and Compare Results** constructs comparable observables and uncertainty statements. **Document and Preserve the Study** keeps the evidence and its limits recoverable. Neither reproducibility nor archival completeness alone proves that the physical conclusion is correct. This page does not validate a project result; it defines the evidence needed to do so.

## Sources and methods

- [Oberkampf and Trucano, verification and validation in computational science](https://doi.org/10.1016/S0376-0421%2802%2900005-2)
- [NISTIR 8298, verification, validation, and uncertainty procedures](https://doi.org/10.6028/NIST.IR.8298)
- [National Academies, reproducibility and replicability in science](https://www.nationalacademies.org/read/25303/chapter/3)
- [Lejaeghere and co-workers, controlled cross-code DFT comparison](https://doi.org/10.1126/science.aad3000)
- [Perdew and Schmidt, hierarchy of density-functional approximations](https://doi.org/10.1063/1.1390175)
