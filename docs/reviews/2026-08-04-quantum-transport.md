# Review — Quantum Transport

## Scope and semantic review

The overview treats quantum transport as an open-boundary contacts--central-region--contacts problem. It connects electrode self-energies, broadening matrices, retarded Green functions, coherent transmission, reservoir occupations, Landauer current, DFT--NEGF self-consistency, and finite-bias electrostatics without treating an isolated band structure or DOS as a device calculation.

It explicitly separates bulk conductivity from device conductance, DOS from transmission, zero-bias transmission from nonlinear current, Kohn--Sham transport from an interacting conductance, SCF convergence from observable convergence, and phenomenological broadening from a conserving inelastic-scattering treatment. It prescribes no universal electrode length, k mesh, energy mesh, basis, electronic temperature, voltage step, imaginary broadening, or convergence threshold.

Landauer and Büttiker provide the scattering and multi-terminal conductance foundations. Brandbyge and co-workers support the atomistic DFT--NEGF open-system formulation. Papior and co-workers and the current official SIESTA reference support contact self-energies, finite-bias self-consistency, TBtrans post-processing, charge conservation, boundary matching, and the practical distinction between density convergence and transmission convergence.

## Source and rendering record

- [Landauer, spatially localized scattering and resistance](https://doi.org/10.1147/rd.13.0223)
- [Büttiker, four-terminal phase-coherent conductance](https://research.ibm.com/publications/four-terminal-phase-coherent-conductance)
- [Brandbyge and co-workers, DFT--NEGF transport](https://arxiv.org/abs/cond-mat/0110650)
- [Papior and co-workers, next-generation TranSIESTA and TBtrans](https://arxiv.org/abs/1607.04464)
- [SIESTA 5.4 TranSIESTA reference](https://docs.siesta-project.org/projects/siesta/en/5.4/reference/siesta.html#transiesta)

The rendered topic page must contain the same five URLs. Manifest validation verifies exact article/review/source-manifest identity without network access; the external audit separately records time-bounded reachability.

## Practical-page decision

No subordinate page is added in this batch. A minimal tight-binding resonance would only validate textbook matrix arithmetic and could be mistaken for evidence about a material junction; a genuine DFT--NEGF worked example would require identity-bound electrode and device outputs, convergence evidence, and a reusable licence. The overview already explains the required objects and validation boundary, while the preceding Electronic Transport topic supplies a provenance-bound real-material post-processing example. This decision does not imply that practical quantum-transport evidence is unnecessary for a real research project.

## Claim boundary

The overview does not claim that an electrode, surface Green function, NEGF density, transmission, current, interaction self-energy, or finite-bias calculation ran. It does not establish a converged device conductance, bulk conductivity, experimental junction geometry, many-body transport regime, or material conclusion.
