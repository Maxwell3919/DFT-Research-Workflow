---
topic_slug: finite-temperature-structural-sampling
status: reviewed
---

Finite-temperature structural sampling asks which configurations of a declared finite model contribute to an equilibrium observable, and with what statistical weight. It begins after a trajectory or configuration generator exists. It does not turn a finite set of frames into an equilibrium phase, a free-energy landscape, or a material property merely by plotting a histogram.

## Turn configurations into a qualified distribution

Start with an identified ensemble and trajectory or window set. Define the collective variable, retained interval, bias and reweighting data, binning or estimator, correlation treatment, and uncertainty target before plotting. Inspect stationarity, independent support, window overlap or bias evolution, effective sample size, finite-size sensitivity, and stability to analysis choices. Converge the population or free-energy difference that supports the claim. This overview does not claim that a finite-temperature sampling calculation was run.

## A structural distribution has a measure, an ensemble, and a coordinate

For a configuration $\mathbf R$, a canonical configurational distribution is proportional to $\exp[-\beta U(\mathbf R)]$, where $\beta=1/(k_{\mathrm B}T)$, $T$ is the declared temperature, $k_{\mathrm B}$ is Boltzmann's constant, and $U$ is the potential-energy surface supplied by the chosen electronic-structure model. In NPT sampling the cell also fluctuates, and the relevant measure contains the volume and pressure terms appropriate to the chosen barostat formulation. The structure, composition, charge, spin, exchange--correlation approximation, finite cell, k-point treatment, constraints, and ensemble therefore remain part of every probability statement.

Most questions use a reduced collective variable `s(R)`: a coordination number, displacement, lattice metric, order parameter, or another stated mapping of the atomic configuration. A probability density `P(s)` depends on that mapping and its binning or kernel estimator. When the sampling measure is canonical and the normalization is defined, the potential of mean force is

$$
F(s) = -k_{\mathrm B}T\ln P(s)+C.
$$

`C` is an arbitrary additive constant. `F(s)` is a free-energy projection along the declared `s`, not the full free-energy surface, a transition-state free energy, or a kinetic rate. Two studies cannot compare it directly unless their temperature, composition, boundary conditions, reference convention, collective variable, and sampling/reweighting treatment are compatible.

## Ordinary sampling and enhanced sampling answer different coverage problems

An unbiased trajectory may estimate an equilibrium average if it repeatedly samples the important regions with sufficient independent weight. Slow barrier crossing can leave the observed distribution dominated by the initial basin even though local temperature looks stable. Extending a trajectory is one response; independent starts, replica exchange, umbrella windows, adaptive biasing, or metadynamics are others. Each changes either how configurations are proposed or the probability with which they are visited.

In umbrella sampling a window adds a declared bias, often $W_i(s)=\tfrac{1}{2}k_i(s-s_i)^2$. Its raw histogram samples the biased potential $U(\mathbf R)+W_i[s(\mathbf R)]$, not the target distribution. Overlap between neighbouring windows is evidence needed to combine them; a row of windows with no shared support does not become a continuous free-energy curve by interpolation. WHAM and related estimators combine counts only after the window biases, temperatures, normalization convention, and correlation treatment are specified.

Metadynamics deposits a history-dependent bias in selected collective variables. It can improve exploration, but it also makes a raw time histogram non-canonical. A reconstructed free energy requires the method-specific bias, time convention, collective-variable choice, and reweighting or convergence evidence. A visually filled basin is not proof that omitted slow variables are equilibrated.

## Sampling uncertainty is not frame counting

Frames close in time can be highly correlated. Report the retained interval, stride, autocorrelation or block treatment, independent replicas where available, and how uncertainty propagates through the estimator. For a histogram, inspect whether the estimated density and its uncertainty are stable to block boundaries, binning or kernel width, and the removal or addition of statistically independent production segments. For enhanced sampling, also inspect replica/window exchange or overlap, bias evolution, reweighting weights, and stability under an independently justified analysis choice.

Finite size has a physical role as well as a statistical one. A small periodic cell can suppress long-wavelength distortions, force a particular defect concentration, or make a rare phase switch recurrent for purely finite-size reasons. A stable local structural distribution therefore does not establish a thermodynamic phase fraction or a bulk transition temperature without the relevant size, ensemble, and model checks.

## From structures to a defensible claim

Preserve the force-model and run lineage, initial conditions, ensemble and constraint definitions, trajectory or window boundaries, collective-variable definition, bias parameters, retained frames, estimator implementation, reweighting records, and uncertainty analysis. Keep raw coordinates or a lossless auditable representation when possible. A structural population can support a conditional statement about the sampled finite model; it cannot by itself validate force accuracy, ergodicity, experimental observability, a phase boundary, a reaction rate, or a material synthesis claim.

This topic concerns equilibrium structural populations and free-energy projections. **Ab Initio Molecular Dynamics** establishes how a trajectory is generated and diagnosed; **Reaction Paths and Transition States** treats a minimum-energy path and a saddle; **Diffusion Barriers** treats hops and transport modelling. A barrier profile or a short time trace cannot substitute for a reweighted, uncertainty-qualified finite-temperature distribution.

## Sources and methods

- [Torrie and Valleau, umbrella sampling](https://doi.org/10.1016%2F0021-9991%2877%2990121-8)
- [Kumar et al., weighted histogram analysis method](https://doi.org/10.1002/jcc.540130812)
- [Laio and Parrinello, metadynamics](https://doi.org/10.1073/pnas.202427399)
- [PLUMED bias documentation](https://www.plumed.org/doc-v2.10/user-doc/html/_bias.html)
- [PLUMED weighted ensemble-average documentation](https://www.plumed.org/doc-v2.10/user-doc/html/_a_v_e_r_a_g_e.html)
- [Quantum ESPRESSO `cp.x` input description](https://www.quantum-espresso.org/Doc/INPUT_CP.html)
