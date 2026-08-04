# Review — Electronic Transport

## Scope and semantic review

The overview treats bulk diffusive electronic transport as a response of a non-equilibrium distribution. It relates band velocities, Fermi-window weighting, relaxation times or a collision operator, transport moments, conductivity, Seebeck response, electronic thermal conductivity, carrier concentration, and mobility without treating any single band descriptor as transport.

The article explicitly separates constant-relaxation-time transport functions from absolute coefficients, chemical-potential scans from realizable doping, quasiparticle and transport lifetimes, SERTA and iterative BTE, electronic and lattice heat conduction, and bulk conductivity from the device-scale quantum transport topic. It prescribes no universal k mesh, q mesh, smearing, lifetime, carrier density, temperature, band count, or convergence threshold.

The primary method papers support Fourier/Wannier interpolation and semiclassical Onsager transport. The carrier-transport review and official EPW tutorial support the collision-operator, SERTA/IBTE, scattering, mobility, and evidence-boundary discussion.

## Source and rendering record

- [Madsen and Singh, the original BoltzTraP method](https://arxiv.org/abs/cond-mat/0602203)
- [Madsen, Carrete, and Verstraete, BoltzTraP2](https://arxiv.org/abs/1712.07946)
- [Pizzi and co-workers, BoltzWann](https://arxiv.org/abs/1305.1587)
- [Ponce and co-workers, first-principles carrier transport review](https://arxiv.org/abs/1908.01733)
- [EPW GaN-II tutorial: SERTA and iterative BTE](https://docs.epw-code.org/tutorials/GaN-II.html)

The rendered topic page must contain the same five URLs. Manifest validation verifies article/review/source-manifest identity without network access; the external audit separately records time-bounded reachability.

## Practical and media review

The CoSb3 worked example is reviewed within the declared educational and execution scope. The repository does not claim to have rerun the underlying WIEN2k or BoltzTraP calculations. A compact JSON snapshot transcribes all 14 data rows from `CoSb3.condtens` in the GPL-3.0-or-later BoltzTraP2 public branch at commit `7ed9146c42d671562daee86d87e253fcbdedaeab`. It records the source archive SHA-256, exact member SHA-256, column mapping, units, and source commit.

The companion uses Python 3.12 standard-library parsing and SVG generation. It asserts the snapshot hash, source hashes, temperature sequence, fixed chemical potential, electron count trend, selected `sigma/tau` and Seebeck values, and the bracket in which the stored Seebeck component changes sign. Execution success is not transport convergence for a real calculation.

The media asset is an original derived-public-data redraw, not a source screenshot or publisher figure. It shows a real material output and says explicitly that no DFT or BoltzTraP rerun occurred. Its provenance, attribution, reuse basis, caption, and alt text are declared in the media manifest.

## Claim boundary

The example verifies frozen-output identity, transcription, unit conversion from V/K to microvolts/K, a sign-change bracket, and deterministic rendering. It does not independently validate the source electronic structure, relaxation-time approximation, k-point or interpolation convergence, carrier model, scattering time, experimental thermopower, or any new CoSb3 scientific conclusion.
