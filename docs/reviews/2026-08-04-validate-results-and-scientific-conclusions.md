# Review — Validate Results and Scientific Conclusions

## Scope and semantic review

The overview separates artifact and execution verification, observable-specific numerical convergence, physical consistency, model-form sensitivity, external comparison, computational reproducibility, and scientific claim support. Validation is framed as an attempt to falsify a bounded conclusion rather than a completion label.

It explicitly distinguishes verification from validation, calibration from withheld external tests, cross-code reproducibility from accuracy, necessary physical constraints from sufficient evidence, numerical sensitivity from an error estimate, and missing evidence from positive support. It prescribes no universal convergence threshold, number of methods, agreement tolerance, uncertainty, or validation score.

Oberkampf–Trucano and NISTIR 8298 support the verification/validation/model-credibility distinctions. The National Academies supports the separation of computational reproducibility and independent replicability and warns that reproducibility does not prove correctness. Lejaeghere and co-workers support controlled cross-code DFT precision tests. Perdew–Schmidt supports treating density-functional approximations as a hierarchy with different physical content rather than interchangeable software settings.

## Source and rendering record

- [Oberkampf and Trucano, verification and validation in computational science](https://doi.org/10.1016/S0376-0421%2802%2900005-2)
- [NISTIR 8298, verification, validation, and uncertainty procedures](https://doi.org/10.6028/NIST.IR.8298)
- [National Academies, reproducibility and replicability in science](https://doi.org/10.17226/25303)
- [Lejaeghere and co-workers, controlled cross-code DFT comparison](https://doi.org/10.1126/science.aad3000)
- [Perdew and Schmidt, hierarchy of density-functional approximations](https://doi.org/10.1063/1.1390175)

The rendered page must contain the same five URLs. Manifest validation checks semantic-review identity without network access; external reachability remains a separate time-bounded audit.

## Practical-page decision and claim boundary

Two bounded subordinate pages are linked: terminal inspection supplies command-level checks, and Calculation Audit assembles them into a fail-closed case readback. Validation criteria are observable- and claim-specific, and the existing practical companions already distinguish deterministic execution from DFT convergence and scientific acceptance. A generic pass/fail checklist would erase that dependence. This page does not validate a project result, reproduce a calculation, compare with an experiment, resolve a method conflict, or endorse a scientific conclusion.

## Batch 5A operational closure

The public topic now opens with eight natural-language questions from executable start through the exact scientific claim. Ionic or cell convergence is explicitly not applicable for fixed-geometry runs, target-observable convergence remains separate from SCF convergence, and every failed decision returns to A, B, C, or D.
