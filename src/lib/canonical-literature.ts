export interface CanonicalLiterature {
  citation: string;
  url: string;
  whyItMatters: string;
  lookFor: string;
  connection: string;
}

export const canonicalLiteratureByResource: Record<string, CanonicalLiterature[]> = {
  'quantum-espresso': [
    {
      citation: 'P. Giannozzi et al., “QUANTUM ESPRESSO: a modular and open-source software project for quantum simulations of materials,” Journal of Physics: Condensed Matter 21, 395502 (2009).',
      url: 'https://doi.org/10.1088/0953-8984/21/39/395502',
      whyItMatters: 'It establishes the suite architecture and the calculation objects behind the executables used throughout the workflow.',
      lookFor: 'Read the division among ground-state, response, and post-processing components; do not infer a current input keyword or release behaviour from the 2009 paper.',
      connection: 'The practical pages use current official documentation for executable semantics and retain the paper as method and software context.',
    },
    {
      citation: 'S. Baroni, S. de Gironcoli, A. Dal Corso, and P. Giannozzi, “Phonons and related crystal properties from density-functional perturbation theory,” Reviews of Modern Physics 73, 515–562 (2001).',
      url: 'https://doi.org/10.1103/RevModPhys.73.515',
      whyItMatters: 'It connects linear-response derivatives to phonons, dielectric quantities, and electron–phonon matrix elements without a finite-displacement approximation being silently assumed.',
      lookFor: 'Follow the perturbation, response, and Brillouin-zone sampling layers separately; a completed ph.x run is not an observable-convergence demonstration.',
      connection: 'The harmonic-phonon, dielectric-response, and electron–phonon workflow topics use this as the canonical method bridge.',
    },
  ],
  phonopy: [
    {
      citation: 'A. Togo and I. Tanaka, “First principles phonon calculations in materials science,” Scripta Materialia 108, 1–5 (2015).',
      url: 'https://doi.org/10.1016/j.scriptamat.2015.07.021',
      whyItMatters: 'It states the finite-displacement force-constant route and the practical symmetries that make a phonon calculation tractable.',
      lookFor: 'Check the supercell, displacement, force-quality, and interpolation assumptions before interpreting a dispersion or thermodynamic curve.',
      connection: 'Use alongside the harmonic-phonon topic when the selected route is finite displacement rather than DFPT.',
    },
  ],
  wannier90: [
    {
      citation: 'G. Pizzi et al., “Wannier90 as a community code: new features and applications,” Journal of Physics: Condensed Matter 32, 165902 (2020).',
      url: 'https://doi.org/10.1088/1361-648X/ab51ff',
      whyItMatters: 'It situates the code’s localized-orbital, interpolation, and post-processing capabilities in a reproducible community implementation.',
      lookFor: 'Distinguish the chosen band subspace, disentanglement window, gauge, and interpolation checks; a smooth plot alone does not establish faithful interpolation.',
      connection: 'The Wannier construction and band/full-zone topics use this software context alongside the original localization papers.',
    },
    {
      citation: 'N. Marzari and D. Vanderbilt, “Maximally localized generalized Wannier functions for composite energy bands,” Physical Review B 56, 12847–12865 (1997).',
      url: 'https://doi.org/10.1103/PhysRevB.56.12847',
      whyItMatters: 'It defines the spread-minimization construction that turns a selected composite band manifold into localized orbitals.',
      lookFor: 'Read the gauge freedom and spread functional before treating a Wannier function as a unique atom-centred orbital.',
      connection: 'This is the conceptual source for the workflow’s Wannier-function construction boundaries.',
    },
  ],
  epw: [
    {
      citation: 'S. Poncé et al., “EPW: Electron–phonon coupling, transport and superconducting properties using maximally localized Wannier functions,” Computer Physics Communications 209, 116–133 (2016).',
      url: 'https://doi.org/10.1016/j.cpc.2016.07.028',
      whyItMatters: 'It explains how coarse electronic and vibrational response data are connected to Wannier interpolation for electron–phonon observables.',
      lookFor: 'Inspect the parent electronic and phonon lineage, interpolation windows, k/q refinement, and the observable-specific convergence evidence.',
      connection: 'The electron–phonon-coupling and conventional-superconductivity topics use this implementation context without equating a code result to a transition-temperature claim.',
    },
  ],
  vasp: [
    {
      citation: 'G. Kresse and J. Furthmüller, “Efficient iterative schemes for ab initio total-energy calculations using a plane-wave basis set,” Physical Review B 54, 11169–11186 (1996).',
      url: 'https://doi.org/10.1103/PhysRevB.54.11169',
      whyItMatters: 'It gives the plane-wave iterative-solver context behind a widely used electronic-structure implementation.',
      lookFor: 'Separate algorithmic convergence from cutoff, k-point, state, and observable convergence; a fast solver does not choose those for the researcher.',
      connection: 'The workflow relies on current VASP documentation for inputs and preserves this paper as algorithm context.',
    },
    {
      citation: 'P. E. Blöchl, “Projector augmented-wave method,” Physical Review B 50, 17953–17979 (1994).',
      url: 'https://doi.org/10.1103/PhysRevB.50.17953',
      whyItMatters: 'It supplies the all-electron reconstruction and transformation logic behind PAW data and PAW-sensitive calculated quantities.',
      lookFor: 'Follow which quantities are pseudo-space objects and which require a declared reconstruction; never treat PAW data as interchangeable with an arbitrary pseudopotential.',
      connection: 'This is the canonical core-treatment context for VASP-linked practical guidance.',
    },
  ],
};
