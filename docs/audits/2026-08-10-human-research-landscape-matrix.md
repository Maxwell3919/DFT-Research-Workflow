# Human Research Landscape Audit

Date: 2026-08-10
Baseline: `2a94eb0d9d49844b4b4370ef63f8785ae6ec8c79`
Scope: 46 topic overviews, 49 practical guides, 17 depth Tool pages, two Worked Workflows, Home, Research Workflow, Research Question Navigator, Troubleshooting and Software Bridge.

This is an internal editorial artifact. It does not define a second public taxonomy or a required calculation sequence.

## Decision rule

Design for the researcher, not for the agent maintaining the site. For every operation, establish the realistic human route before deciding what may be scripted:

```text
object in hand
-> scientific objective
-> browser, paper or manual lookup
-> GUI or visual inspection where natural
-> terminal, editor or HPC execution where natural
-> table, plot, output or structure inspection
-> numerical and scientific decision
-> next operation
-> optional automation for repeated work
```

Visual inspection complements numerical validation. Interface execution, terminal execution, artifact identity, numerical convergence, model validity and scientific support remain separate evidence classes.

## Coverage and systemic findings

| Surface | Audited | Main bias detected | Human-first correction |
| --- | ---: | --- | --- |
| A topics / guides | 2 / 5 | Database API, `curl` and Python transformations precede browser records, CIF viewers and parent/child visual comparison | Browser and paper discovery first; real CIF and GUI inspection before optional parsing or conversion |
| B topics / guides | 2 / 4 | QE/UPF and parser-first convergence routes dominate method choice | Method, access, portal metadata, literature and manual choice first; real series and plots before optional parsers |
| C topics / guides | 2 / 8 | Markers, fixtures and aggregate values replace trajectory, SCF-history and state inspection | Open and compare structures/trajectories/states; inspect every active criterion; automate only repeated extraction |
| D1-D2 topics / guides | 15 / 24 | All guide entries are code-first; 16 of 26 assets are invented/synthetic SVGs | Put slabs, defects, interfaces, BZs, spectra, densities and magnetic objects before scripts |
| D3-D5 topics / guides | 22 / 6 | Only six guides; tensor ledgers and parser plots stand in for modes, trajectories, spectra and orbitals | Link real specialist environments and teach what object to open, animate, compare and distrust |
| E topics / guides | 3 / 2 | Ledgers, hashes and terminal audit dominate comparison, anomaly review and literature/experiment checks | Scientific object and decision first; fixity/replay as supporting evidence |
| Worked Workflows | 2 | Clone, SHA, manifest, routes and hashes precede material, source, figures and decisions | Human research story first; exact evidence reproduction in a secondary section |
| Tools | 17 | Python/API order and automation-environment capability notes imply programmability ranking | Order by research use; expose Web/GUI/CLI/API as modes, not ranks; remove maintainer-environment leakage |
| Supporting routes | 3 | Navigator and Bridge reach calculations quickly but underrepresent common human tools and inspected objects | Add common human route, object to inspect and high-recall Resource Landscape links |

## A-E operation matrix

The compact cells below cover the full suggested audit fields. `Web`, `GUI`, `T/HPC` and `Manual` state the natural interaction modes; resources name families rather than recommendations.

### A - Structure and Model

| Operation | Human objective and realistic route | Modes and visual objects | Resource families | Bias and correction |
| --- | --- | --- | --- | --- |
| Obtain a Material Structure | Identify the intended phase and conditions; search papers, SI and experimental/computed repositories; compare records; download an unchanged source; inspect CIF text, cell, sites, occupancy and provenance; visualize; check symmetry; preserve source identity | Web: record search/filter/download. GUI: rotate cell, periodic images, distances, coordination and vacuum. T: inspect/hash/parse. Manual: compare publication, disorder and conditions. Visual: record, CIF, source structure | COD, ICSD, CSD, MPDS, Materials Project, NOMAD, AFLOW, OQMD, JARVIS, 2DHub, Materials Cloud, repositories and paper SI | API/`curl` came first and A had no acquisition guide. Make browser/paper route primary; API is optional repeated-query automation |
| Build or Modify a Computational Model | Define the physical object and alternatives; select cell, orientation, termination, defect, interface, strain, vacuum and constraints; build; reopen parent and child; compare cell, composition, mapping, contacts and periodicity; record transformation | Web/GUI builders where useful; GUI parent/child comparison; T/library construction; manual site/registry choice. Visual: atomistic parent/child, slab, defect, interface, vacuum | VESTA, OVITO, XCrySDen, ASE, pymatgen, spglib, Bilbao, FINDSYM, AFLOW Online, Crystal Toolkit | Five guides were Python-first and four assets were generic SVGs. Make visual/model choice primary; scripts optional and lineage evidence secondary |

### B - Method and Numerical Setup

| Operation | Human objective and realistic route | Modes and visual objects | Resource families | Bias and correction |
| --- | --- | --- | --- | --- |
| Choose the DFT Method and Computational Setup | Define the observable and required capabilities; compare code/basis/access; inspect manuals and Methods/SI; choose XC, PP/PAW/all-electron, spin, SOC, U, vdW, charge and boundaries; open PP/basis portal; inspect family, valence, relativity, tests and cutoff guidance; preserve exact data | Web: manuals, portals, literature. GUI: licensed/integrated environments when used. T: version/input pilot/hash. Manual: compatibility and model-sensitivity decision. Visual: portal report and method sheet | SSSP, PseudoDojo, code data libraries, Libxc; QE, VASP, ABINIT, CASTEP, CP2K, FHI-aims, WIEN2k, SIESTA, GPAW, Octopus and others by task | QE command and UPF grep preceded the scientific choice. Put decision/access/metadata first and label QE as one demonstrated implementation |
| Test Numerical Convergence | Predeclare target quantity and tolerance; hold method/model fixed; build a series; inspect every input; submit; tabulate in notebook/spreadsheet; plot; look for plateaus, non-monotonicity or state changes; extend or reject; repeat for each observable | Web/manual definitions; GUI structure/BZ checks; T/HPC sweeps and extraction; manual plot/table decision. Visual: real convergence table/curve and relevant structures | Code manuals, PP reports, notebooks/spreadsheets, plotting tools, BZ viewers | Four guides were parser-first and four of six visuals conceptual. Make real series/plot and human decision primary; parser is optional audit |

### C - Reference State

| Operation | Human objective and realistic route | Modes and visual objects | Resource families | Bias and correction |
| --- | --- | --- | --- | --- |
| Optimize the Structure | Choose free degrees and constraints from the model; inspect starting geometry; run relax/cell route; watch SCF and ionic histories; animate trajectory; compare initial/final frames; inspect every free force component and relevant stress; decide acceptance or diagnosis | GUI: trajectory/cell/contacts. T/HPC: run, monitor, extract histories. Manual: assess reconstruction/state switch. Visual: trajectory, force/energy/stress/SCF curves, start/final structures | ASE GUI, OVITO, VESTA, XCrySDen, Jmol, GIMS, code-native trajectories and tutorials | Eight of nine C visuals were conceptual; aggregate force and scripts dominated. Put actual structures/history first; visual checks never replace criteria |
| Calculate the Reference Ground State | Enumerate relevant structures, magnetic, charge, constrained and metastable states from chemistry/literature; prepare comparable branches; inspect state diagnostics and structures; run fixed-geometry SCF where appropriate; compare full histories, moments, occupations and energies; decide whether the lowest relevant state was identified and is scientifically appropriate | Web/literature for candidates; GUI spin/charge/structure views; T/HPC comparable runs; manual candidate table. Visual: SCF history, state table, spin/charge density | Major code tutorials/manuals, state-specific literature, visualization tools | Synthetic ledgers and final markers led the route. Make candidate construction and state inspection primary; package/replay second |

### D1 - Energetics and Stability

| Operation | Human objective and realistic route | Modes and visual objects | Resource families | Bias and correction |
| --- | --- | --- | --- | --- |
| Relative and Formation Energies | Define reaction, reservoirs and normalization from literature; assemble comparable records; balance manually; inspect exclusions; compare energies and uncertainty/sensitivity; optionally automate ledger | Web/literature; spreadsheet/notebook; T extraction; manual reaction balance. Visual: reaction ledger and difference plot | Primary Methods/SI, thermochemistry/phase references, spreadsheet/notebook | Invented Python ledger came first. Put source records and manual comparability table first |
| Equation of State and Structural Phase Stability | Generate and visually inspect structures across volume/strain; preserve states; run series; plot raw points; inspect outliers/residuals; fit only justified region; compare phases at common pressure | GUI structure series; T/HPC; notebook/spreadsheet. Visual: real E-V points/residuals and phase geometries | Code tutorials, plotting/fitting tools, experimental P-V literature | Analytic fixtures replaced calculation series. Teach geometry/state inspection and raw points before fit automation |
| Compositional Phase Stability and Convex Hulls | Explore chemical system in browser; inspect corrections/data table and candidate records; view structures; export receipt; reconstruct/stress-test offline; inspect decomposition | Web phase-diagram service; GUI structures; notebook. Visual: interactive/source hull, entries and structures | Materials Project, OQMD, AFLOW, phase-diagram tools | Good public-data hull began from local snapshot. Add browser exploration before optional API/Python reconstruction |
| Defect Formation Energies and Charge States | Build several defect sites/charges; inspect pristine/defect cells and periodic images; relax; inspect local distortion/localization; assemble aligned charge-state lines and neutrality | GUI defect comparison/density; T/HPC; manual site/state table. Visual: structures, localization and charge-state envelope | doped, ShakeNBreak, pymatgen defects, py-sc-fermi, VESTA/OVITO | Synthetic arithmetic plots lacked a defect object. Make structure/localization inspection primary |
| Surface Energy and Work Function | Choose orientation/termination; inspect slab, frozen layers, two surfaces and vacuum; run thickness/vacuum series; inspect planar potential and select plateau; compare surface energies | GUI slab side view; T/HPC; notebook/manual plateau. Visual: atomistic slab, convergence and real potential profile | VESTA/ASE GUI/OVITO, code postprocessors | No actual slab; synthetic potential dominated. Put slab and real plateau decision first |
| Adsorption Energies | Construct several sites/coverages/orientations; view start/final structures; detect migration, dissociation, desorption or reconstruction; compare compatible energies and references | GUI placement and geometry comparison; T/HPC; manual site labels. Visual: top/side structures and site-energy plot | Structure builders/viewers, primary adsorption literature | Real scalar data but no adsorbate geometry. Make visual candidate identity precede ranking |
| Interface and Heterostructure Energetics | Inspect parents; choose planes/terminations; enumerate strain/registry/separation; view top/side contacts and both interfaces; relax; compare adhesion and profiles | Web/GUI builder; GUI registry/contacts; T/HPC. Visual: atomistic interface, strain/registry map, separation/profile | JARVIS interfaces, pymatgen/Ogre, VESTA/OVITO | Dot/mismatch SVG showed no interface. Replace its primary role with atomistic registry inspection |

### D2 - Electronic Structure, Charge and Magnetism

| Operation | Human objective and realistic route | Modes and visual objects | Resource families | Bias and correction |
| --- | --- | --- | --- | --- |
| Band Structure | Standardize accepted cell; inspect BZ/path; record transformation; prepare/run path; plot labels and reference energy; inspect crossings/extrema and limitations | Web SeeK-path; GUI BZ; T/HPC; manual plot review. Visual: labelled BZ and band plot | SeeK-path, code tools, sumo, PyProcar, VASPKIT | Real QE plot lacked path labels/BZ. Browser path inspection must precede ledger/script |
| Density of States and Projected Density of States | Run compatible dense zone sampling; plot total/projected channels; inspect units, normalization, Fermi reference, broadening and integration; compare with bands/spectroscopy | T/HPC and plotting GUI/notebook. Visual: real TDOS/PDOS with axes and legend | Code postprocessors, sumo/PyProcar/VASPKIT | Real TDOS exists, but no real PDOS closure. Keep that absence explicit and teach human plot checks |
| Fermi Surface and Full-Brillouin-Zone Analysis | Generate dense uniform/Wannier field; open isosurface tool; show BZ; rotate sheets/pockets/necks; compare cross-sections and denser grids | GUI Fermi-surface inspection; T/HPC. Visual: actual 3D isosurface/BZ | FermiSurfer, XCrySDen, PyProcar, Wannier90 | Connected unordered mesh polyline was misleading. Demote/replace; never call it a Fermi surface |
| Charge Density and Charge Redistribution | Export volumetric field; overlay structure; inspect signed isosurfaces/slices and periodicity; test difference definition and integrated closure | GUI volume viewer; T postprocess. Visual: real signed density and scale | VESTA, XCrySDen, critic2, Bader tools | Invented color blocks displaced real density inspection. Treat fixture as arithmetic only |
| Electrostatic Potential and Band Alignment | Plot planar/macroscopic potential; view structure/density to identify vacuum or bulk-like windows; record gauge/windows; align comparable edges | GUI structure/profile; notebook/T extraction; manual window selection. Visual: real profile with marked regions | Code outputs, VASPKIT/notebooks | No real object/guide. Teach plateau/window inspection and defer claims until evidence exists |
| Chemical Bonding Analysis | Select question and bond from structure; choose COHP/COOP, QTAIM/ELF or charge partition; inspect projection quality; plot curves/fields; compare geometry | GUI structure/field; specialist code; manual bond selection. Visual: real COHP/ELF/QTAIM and selected bond | LOBSTER, critic2, Bader, VESTA | No practical or visual route. Do not replace bonding with a scalar/parser |
| Magnetic Configuration and Ground-State Comparison | Enumerate candidates with symmetry/literature; build magnetic cells; run comparable starts; inspect final moments, spin density and collapsed states; compare energies | Web/literature; GUI moment/spin density; T/HPC. Visual: candidate cell, final moment map, state table | Major codes and magnetic analysis tools | No real candidate/visual route. Initial moments alone do not define final state |
| Magnetic Anisotropy and Exchange Interactions | Prepare compatible SOC directions/states; converge small differences; inspect final moments/direction; plot angular dependence; map exchange under declared Hamiltonian | GUI magnetic objects; T/HPC; manual mapping. Visual: directional MAE and exchange plots | Code manuals/tutorials | Sparse invented bars lacked a physical magnetic object. Mark fixture conceptual until real evidence exists |

### D3 - Response, Lattice Dynamics and Coupling

| Operation | Human objective and realistic route | Modes and visual objects | Resource families | Bias and correction |
| --- | --- | --- | --- | --- |
| Elastic Constants and Mechanical Properties | Choose strain/stress route and symmetry; inspect deformed cells and fitted region; compare tensor symmetry/eigenvalues and mechanical criteria | GUI deformed cells; T/HPC; notebook. Visual: stress-strain curves and tensor | QE/VASP/ABINIT/CASTEP and symmetry services | Parser/tensor alone is insufficient; include deformation and fit inspection |
| Dielectric Response and Born Effective Charges | Establish reference/symmetry; run response; inspect tensor conventions/principal components and structural direction; compare sum rules and LO-TO context | Browser symmetry; GUI structure; T/HPC. Visual: tensor, directions, mode context | Major DFPT codes, Bilbao tensor tools | Real Gamma tensor bar lacks orientation and scope. Put tensor/structure interpretation first |
| Polarization and Ferroelectricity | Define branch/path/reference; inspect polar/nonpolar structures; calculate continuous path; unwrap branch; compare displacement and polarization | GUI structures/path; T/HPC; manual branch continuity. Visual: path and structures | Berry-phase codes, symmetry tools | Synthetic path must be labelled a format exercise, not execution evidence |
| Piezoelectric Response | Choose proper/frozen-ion/relaxed-ion convention; inspect symmetry and strain/polarization directions; run and compare tensor components | GUI structure/directions; T/HPC. Visual: tensor/orientation | DFPT/finite-difference codes, Bilbao | Synthetic ledger must be secondary and plainly synthetic |
| Harmonic Phonons | Choose DFPT or finite displacement; calculate dispersion/DOS; click suspect q/mode; animate eigenvector; inspect displaced structures; test sampling, electronic convergence, ASR/NAC | GUI mode animation; T/HPC. Visual: dispersion, DOS, animation, displaced geometry | QE PHonon, VASP, ABINIT, Phonopy, phononwebsite | One Gamma bar and parser stood in for phonon workflow. Mode visualization is essential where interpreting instability |
| Anharmonic Phonons | Choose perturbative, TDEP/SCPH/SSCHA or MD route; inspect training/displaced configurations and fit residuals; compare temperature-dependent spectra | GUI trajectories/configurations; T/HPC. Visual: spectral function, residuals | ALAMODE, TDEP, SSCHA and related tools | No route-choice or visual workflow; do not fabricate a guide |
| Lattice Thermal Transport | Validate harmonic/anharmonic parents; calculate; inspect modal/cumulative contributions and convergence; compare temperature/size dependence | T/HPC and plotting. Visual: kappa(T), cumulative MFP, mode contributions | Phono3py, ShengBTE, almaBTE | Overview-only; link real ecosystems and inspected outputs |
| Electron-Phonon Coupling | Qualify electronic/phonon parents; converge k/q and delta treatment; inspect interpolation, linewidths, mode/q coupling, alpha2F and cumulative lambda | T/HPC plus plotting/FS tools. Visual: linewidth dispersion, alpha2F, lambda accumulation | EPW, Perturbo, ABINIT/VASP routes | No practical guide; keep honest and add human-visible target map without fake data |
| Conventional Superconductivity | Inspect normal-state and phonon qualification; examine alpha2F/lambda/omega-log and anisotropy where relevant; test all derived quantities; state model ceiling | T/HPC and plots. Visual: alpha2F, cumulative lambda, gap/Fermi-surface variation | EPW/Perturbo/other maintained routes | Scalar lambda/Tc must not replace coupled visual/convergence audit |

### D4 - Kinetics and Finite Temperature

| Operation | Human objective and realistic route | Modes and visual objects | Resource families | Bias and correction |
| --- | --- | --- | --- | --- |
| Reaction Paths and Transition States | Build/inspect endpoints; generate image chain; remove swaps/collisions; run; monitor image forces; view chain; inspect barrier and saddle geometry | GUI image-chain/movie; T/HPC. Visual: structures, barrier, force per image | ASE NEB, VASP/QE/CP2K routes, OVITO | Overview says inspect images but gives no concrete viewer route |
| Diffusion Barriers | Define mechanism and equivalent sites; inspect periodic mapping and image chain; run/refine; compare barriers and local environments | GUI structures/path; T/HPC. Visual: mechanism movie and barrier | NEB tools and literature | Parser-only barrier would miss bad atom mapping; teach manual chain inspection |
| Ab Initio Molecular Dynamics | Inspect initial model; run; watch trajectory; inspect energy/temperature/pressure/drift and anomalous frames; compute structural statistics; assess equilibration | GUI trajectory; T/HPC; notebook. Visual: movie, traces, RDF/CV | OVITO, ASE GUI, VMD, PLUMED, major codes | No human trajectory route; visual inspection is intrinsic |
| Finite-Temperature Structural Sampling | Define ensemble and observable; inspect trajectories and independent segments; identify state transitions/anomalies; compute distributions/free-energy objects; test sampling | GUI trajectory; T/HPC/notebook. Visual: distributions, CV/FES, representative frames | MD/sampling codes and PLUMED | Automated metrics cannot replace frame/state inspection |

### D5 - Excited States, Wannier and Transport

| Operation | Human objective and realistic route | Modes and visual objects | Resource families | Bias and correction |
| --- | --- | --- | --- | --- |
| Independent-Particle Optical Properties | Choose polarization/response; run; inspect epsilon/absorption spectra and transition context; test bands, k grid, broadening and frequency grid; compare orientation/experiment | T/HPC and plotting. Visual: real spectra | VASP, Yambo, GPAW, Octopus, ABINIT, exciting | Overview-only; link spectrum workflow, not scalar outputs |
| Time-Dependent Response and Spectroscopy | Choose time/frequency route; inspect time signal, Fourier transform, spectra and numerical window; compare physical broadening and experiment | T/HPC and plotting. Visual: time trace and spectrum | Octopus, GPAW, Yambo and others | No visual operation route |
| Quasiparticle Corrections | Converge parent/empty states/dielectric cutoff/k grid; inspect state-resolved corrections and nonuniformity; compare gap and spectrum | T/HPC/notebook. Visual: corrections by state/k and convergence | BerkeleyGW, Yambo, GPAW, ABINIT, VASP | Scalar gap alone is insufficient; link real tutorial objects |
| Excitons and the Bethe-Salpeter Equation | Build converged parent/BSE; inspect spectrum, exciton composition and real-space electron-hole object; test bands/k/screening | T/HPC and visualization. Visual: absorption and exciton object | BerkeleyGW, Yambo, GPAW, ABINIT/VASP | No visible object or practical route; do not invent one |
| Wannier Function Construction | Choose projections; inspect spreads/centers; compare interpolated and parent bands; export/open orbital isosurfaces; refine disentanglement | GUI orbital viewer; T. Visual: isosurface, centers, band overlay | Wannier90, VESTA/XCrySDen | Add actual GUI/export operation; parser metrics alone do not establish quality |
| Berry Phase and Berry Curvature | Define gauge/mesh/path; compute; inspect continuity, symmetry and convergence; plot curvature/WCC/polarization path; compare branches | T and plotting/browser symmetry. Visual: curvature or WCC map | Wannier90, Z2Pack, symmetry services | Need human plot inspection without turning it into theory derivation |
| Topological Invariants and Boundary States | Establish bulk invariant with appropriate method; use Bilbao/symmetry tools where applicable; inspect WCC/indicator; calculate boundary spectrum and localization; verify robustness | Browser Bilbao; T specialist tools; GUI plots. Visual: WCC, surface spectrum, localization | Bilbao, Z2Pack, WannierTools, databases | Browser service was a footnote; make it an operation and preserve bulk/boundary distinction |
| Electronic Transport | Choose scattering model; inspect full-zone parent; calculate moments/mobility; inspect k/mode-resolved and cumulative contributions; test tau/model sensitivity | T/HPC/notebook. Visual: transport coefficients and resolved contributions | BoltzTraP2, AMSET, EPW, Perturbo | One public plot is useful but route breadth and human interpretation are thin |
| Quantum Transport | Define leads/device/contact model; view device and matching; calculate T(E,k)/eigenchannels/current/potential; inspect conservation and convergence | GUI device; T/HPC. Visual: device, transmission map, eigenchannels | TranSIESTA/TBtrans, QuantumATK and other maintained routes | No device/visual route; commercial GUI must remain visible even when the maintainer or automation environment cannot execute it |

### E - Validation, Interpretation and Reproducibility

| Operation | Human objective and realistic route | Modes and visual objects | Resource families | Bias and correction |
| --- | --- | --- | --- | --- |
| Analyze and Compare Results | Open plots/tables side by side; inspect axes, units, normalization, outliers and exclusions; compare methods, states, literature and experiment; decide whether difference is meaningful | GUI/notebook/spreadsheet/manual. Visual: real comparison tables/plots | Plotting tools, notebooks, literature and experimental databases | Ledger/hash came before scientific objects. Put the comparison and decision first |
| Validate Results and Scientific Conclusions | Inspect structures, complete outputs, convergence curves, warnings, anomalous modes and competing states; compare independent calculations/experiment; state strongest supported claim and return to A/B/C/D if needed | GUI/manual/literature plus T audit. Visual: anomaly, convergence and cross-check objects | Official troubleshooting, primary literature, experimental sources | Terminal/Python audit nearly defined E. Add multimodal exits while retaining evidence ladder |
| Document and Preserve the Study | Maintain notebook/decision history; save source records, GUI exports, manual measurements, rejected branches, figures and correspondence with exact inputs/outputs; create manifest/hash; restore and regenerate | Browser/GUI/manual records; T packaging. Visual: human-readable study record | Repositories/archives, notebooks, checksums, identifiers | Archive schema dominated. Make human research record primary and fixity/replay supporting evidence |

## Practical-guide audit contract

All 49 guides were audited. A compliant guide does not require every modality, but it must make the natural modality explicit.

| Check | Required reader answer |
| --- | --- |
| Objective | What am I trying to establish? |
| Place | Where would a researcher normally go or what would they open? |
| Route | Which browser, GUI, editor, terminal, HPC, notebook or manual route is demonstrated? |
| Object | What file, structure, output, table, plot, spectrum or trajectory is inspected? |
| Human inspection | What should look reasonable or suspicious? |
| Numerical decision | Which criterion remains distinct from visual judgement? |
| Alternatives | Which common tool or route exists without implying equivalence? |
| Automation | Is the script a natural operation, optional repetition aid, fixture audit or site-figure reproduction? |
| Evidence | Is the demonstrated interface/output real, derived-public, conceptual or synthetic, with the boundary visible? |
| Continue | What should the researcher do next or where should a failure return? |

## Tool and resource decision

Keep the 17 Tool pages as reviewed depth pages. Do not make their count define the resource landscape. Add a separate classified supporting index with high recall and these metadata:

```text
category
authority level
access: Open | Registration | Institutional | Subscription | Commercial | Mixed
interfaces: Web | GUI | CLI | API | Python | HPC
use when
first human action
what to inspect or compare
what object to bring back
boundary
official or primary links
```

Ordering must follow human research use, not programmability. Materials Project and SeeK-path are browser-first for ordinary use; APIs are optional for repeated/high-throughput queries. VESTA, OVITO, Bilbao, FINDSYM, checkCIF and other browser/GUI environments are first-class operations. Major licensed or institutional resources remain visible with honest access labels.

## Visual-media decisions

Prioritize real structures, interfaces, trajectories, convergence curves, outputs, band/DOS/phonon/spectral plots, volumetric fields and decision tables. Demote or retire graphics that exist mainly because they are easy to generate:

- generic input-to-output or box-and-arrow lineage SVGs;
- connected lines through unordered full-zone samples;
- colored rectangles standing in for a volumetric charge-density field;
- sparse invented magnetic bars without a magnetic object;
- registry/mismatch dots without atomistic interface views;
- dual-axis combinations of unrelated response quantities;
- conceptual fixtures presented before the real scientific object.

A screenshot must show where to act, what correct or anomalous state looks like, what to inspect, or what object is exported. A screenshot that only proves a website exists is not sufficient.

## Adopt / do not adopt

Adopt:

- browser and paper discovery before optional API use;
- GUI/manual inspection where the scientific object is naturally visual;
- terminal and HPC where they are the natural execution interface;
- action-oriented manual links at the decision point;
- literature and SI lookup before model/method choice, during troubleshooting and during validation;
- real interface execution as legitimate evidence with source, date, object and boundary;
- broad classified resources separated from concise operational prose;
- scripts after manual understanding as optional repeatability aids.

Do not adopt:

- a second public taxonomy, wizard, dashboard or client-side filter app;
- software ranking or an implication that four audited bridges cover the ecosystem;
- parameter encyclopedias or copied manuals;
- licensed VASP data, subscription record screenshots or restricted content;
- fake GUI states, terminal transcripts, spectra, errors or scientific plots;
- a requirement that every operation have a command or an image;
- dropping a resource because it lacks an API, the maintainer environment lacks access or its output is not machine-verifiable;
- treating visual inspection as numerical validation;
- publishing unreviewed community or multilingual link dumps solely for breadth.

## Acceptance boundary

The Human-First pass may be called complete only after a main-agent manual reading of representative A, B, C, D, E, Silicon, Tools, Navigator, Troubleshooting, Software Bridge and Resource Landscape pages establishes that scientific objects and human decisions lead the narrative. Build, link and browser checks establish implementation behavior and transport only; they do not establish the scientific validity of external resources, a calculation, or a claim.
