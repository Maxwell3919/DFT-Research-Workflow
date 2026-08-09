---
topic_slug: ab-initio-molecular-dynamics
status: reviewed
---

Ab initio molecular dynamics (AIMD) propagates nuclei through time while electronic forces are evaluated from a declared electronic-structure model. It asks how a specified finite model samples a specified statistical ensemble over a finite observation window. A successful run is a trajectory, not an equilibrium distribution, a free-energy surface, a diffusion coefficient, or a finite-temperature material property by itself.

## Prepare and diagnose the trajectory as data

Choose the ensemble, integrator, time step, thermostat or barostat, initial velocities, constraints, equilibration rule, production interval, and observables before execution. During the run inspect electronic convergence, force quality, temperature and controlled quantities, conserved-quantity drift where applicable, structural events, and restart continuity. Afterward separate equilibration from production, estimate correlation and uncertainty, and converge the claimed observable against time step, cell, k sampling, trajectory length, and independent starts. This overview does not claim an executed AIMD trajectory.

## The trajectory has a physical model and a numerical model

In Born--Oppenheimer dynamics, an electronic state is solved at each nuclear step and the resulting forces advance the nuclei. Car--Parrinello dynamics instead introduces a coupled fictitious electronic dynamics and therefore has different adiabatic-separation checks. Both routes retain the exchange--correlation model, pseudopotentials, cell, composition, charge, spin, and boundary conditions of their force evaluation. A thermostat or barostat changes the sampled ensemble and the interpretation of energy, temperature, volume, and pressure fluctuations.

For a classical NVE trajectory, the target is a microcanonical distribution of fixed particle number, cell, and total energy. NVT adds a heat bath to sample a canonical model; NPT adds a pressure/cell model. These labels are not decorations: an NVE energy drift is an integration and force-quality diagnostic, while instantaneous NVT total-energy fluctuations are expected and should not be judged by the same criterion. State the intended ensemble, conserved or controlled variables, thermostat/barostat algorithm and coupling, and whether a trajectory is equilibration or production.

## Initialization and equilibration cannot be hidden inside a time series

Initial positions, velocities, electronic wavefunctions, spin state, and cell may bias a finite trajectory. Assign velocities from a declared distribution or restart lineage, and identify any constraints, mass scaling, or frozen degrees of freedom. A thermostat can bring kinetic temperature toward a target but does not prove structural equilibration. Examine stationarity of observables relevant to the question, decorrelation, and independent starts or blocks rather than selecting a convenient portion of a trace after looking at a desired result.

The time step resolves the fastest relevant nuclear motion and couples to force noise and integration scheme. It has no material-independent value. Test stability and the claimed observable against time step, electronic convergence, mass choice, thermostat/barostat settings, finite cell, k sampling, trajectory length, and initialization. A trajectory with no obvious crash can still have poor energy conservation, resonance with a thermostat, spurious heating, or insufficient sampling of a rare event.

## Averages require an estimator and an uncertainty model

For a time series $A(t)$, the trajectory average is an estimator such as

$$
\langle A\rangle_T
= \frac{1}{T}\int_0^T A(t)\,dt.
$$

$T$ is the retained production time after a declared equilibration treatment. Correlated frames do not supply one independent sample each; block analysis, autocorrelation times, independent replicas, or another appropriate uncertainty method are needed. A radial distribution function, mean-square displacement, residence time, reaction count, or free-energy estimate each consumes different coordinates, time origins, finite-size assumptions, and statistical evidence.

For example, a linear mean-square displacement regime can be mapped to a diffusion coefficient only under declared dimensionality, long-time and finite-size conditions. A single crossing event does not establish a rate. A histogram is not automatically a free energy unless the sampling measure, bias, normalization, and reweighting model support that conversion.

## Evidence boundary and reuse

Preserve the initial-state and restart lineage, force model, ensemble and integrator settings, time-step tests, thermostat/barostat parameters, electronic convergence records, trajectory frames or an auditable reduced representation, equilibration decision, estimators, block/replica uncertainty, and analysis code. Separate trajectory integrity, sampling adequacy, numerical convergence, physical-model validity, and scientific interpretation.

AIMD can support a conditional observation within a stated finite model and time window. It does not establish ergodicity, a phase boundary, equilibrium composition, experimental dynamics, macroscopic transport, a reaction mechanism, free-energy barrier, or material stability without the additional sampling and model evidence those claims require.

## Sources and methods

- [Car and Parrinello, unified molecular dynamics and density-functional theory](https://doi.org/10.1103/PhysRevLett.55.2471)
- [Nosé, constant-temperature molecular dynamics](https://doi.org/10.1063/1.447334)
- [Quantum ESPRESSO `pw.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [Quantum ESPRESSO `cp.x` input description](https://www.quantum-espresso.org/Doc/INPUT_CP.html)
- [Quantum ESPRESSO documentation](https://www.quantum-espresso.org/documentation/)
- [ASE molecular-dynamics documentation](https://ase.gitlab.io/ase/ase/md.html)
