# Resource benchmark for the DRW research operating bridge

Date: 2026-08-10

Status: internal editorial decision record; not reader-facing

Scope: official DFT tutorials, materials infrastructure, specialist property
tools, reproducibility systems, and the three textbook roles already adopted by
DRW. The benchmark asks which upstream patterns reduce the cost of taking the
next correct research action. It does not rank software or reproduce manuals.

## Decision criteria

Adopt a pattern only when it is:

- high impact for choosing, executing, inspecting, recovering, or continuing a
  calculation;
- static, low maintenance, and understandable without JavaScript or AI;
- supported by official documentation or a primary maintained source;
- compatible with the existing A-E registry and stable routes;
- explicit about execution, numerical, physical, and claim boundaries.

Reject a pattern when an authoritative upstream project already implements it
better, when it introduces a second taxonomy, or when it hides the calculation
behind automation.

## Benchmark matrix

| Resource | What it does well | What DRW already has | What DRW lacks | Adopt | Do not copy | Target DRW location | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Quantum ESPRESSO documentation and tutorials | Versioned executable input references, explicit input/output files, examples, and symptom-oriented PW/PH troubleshooting | Real QE 7.5 cases, terminal inspection, and software-neutral topics | A compact task-to-executable and artifact map; direct symptom links | Map `reads -> runs -> writes -> inspect`; link exact PW/PH/post-processing help | Parameter encyclopedias, workshop defaults, or magic mixing values | Troubleshooting, Software Bridge, topic references | P0 |
| VASP Wiki and official tutorials | Fast `Task -> Input -> Calculation -> Output -> Questions` rhythm; clear parent artifacts such as `CHGCAR`; strong beginner sequencing | VASP tool entry and neutral topic pages | Task/artifact translation and license-aware first steps | Reuse the page rhythm and artifact handoff idea | POTCAR content, licensed material, long transcripts, notebooks as a requirement, or unguarded cleanup commands | Software Bridge and contextual official links | P0 |
| ABINIT tutorials and guides | Explicit prerequisites; clear distinction among log, archival output, density, wavefunction, eigenvalue, and NetCDF artifacts; superseded labels | ABINIT tool entry and evidence boundaries | Cross-code artifact vocabulary and prerequisite labels | Add prerequisite and artifact-role language; retain failed logs | Mandatory course sequencing, multi-dataset syntax, variable catalogues, or discardable-log advice | Navigator, Troubleshooting, Software Bridge | P0 |
| GPAW tutorials | Complete runnable scripts appear early; checkpoint, trajectory, and log roles are clear | Python and ASE tools | No GPAW implementation bridge | Adopt only the early runnable-action and checkpoint design | A new GPAW tool, Python-object workflow, or molecular vibrations as periodic phonons | Internal design reference only | P1 |
| Materials Project | Stable material/task identities, structure export, property origins, and database-version boundary | Materials Project tool and source/model topics | A database-to-model receipt including release, origin task, exported representation, and transformations | Teach what identity and raw structure to preserve before DFT | Property dashboards, account UX, aggregated values as immutable truth, or generated VASP sets as accepted models | Structure Navigator path and Materials Project tool | P0 |
| Crystallography Open Database | Direct CIF retrieval, persistent COD ID, revision history, experimental metadata, disorder flag, and CC0 boundary | Real Silicon COD evidence | A generic `known ID -> record -> exact CIF -> inspect` route | Preserve ID, revision, paper, conditions, raw hash, and reported symmetry | Search infrastructure or the assumption that an experimental CIF is DFT-ready | Obtain Structure and CIF contextual path | P0 |
| NOMAD | Separates raw files, parsed entries, normalized archives, logs, workflow relations, and publishing identity | Preservation and evidence-boundary topics | A concise raw/parsed/summary lineage and parser-failure distinction | Preserve raw evidence, processing version, entry identity, and adverse processing evidence | Metainfo tree, dashboard, plugin system, parser pipeline, or processing success as simulation success | E, preservation, and post-processing troubleshooting | P1 |
| ASE | Immediate `read -> inspect -> transform -> write`; a common structure object; explicit format limitations | ASE tool and model pages | Frame/data-block, PBC, cell, and conversion-loss checks | Show the first inspection action and record parser/version/output identity | API catalogue, all file formats, CLI stability assumptions, or calculator automation | ASE tool, Structure and Model, band-path handoff | P0 |
| pymatgen | Clear structure/transformation objects and explicit primitive/conventional and symmetry operations | pymatgen tool and model pages | A transformation ledger and site-property preservation check | Record before/after cell, composition, sites, tolerances, mappings, warnings, and hashes | Full API, VASP automation, or heuristic transformations as physical truth | Model construction and reproducibility | P0 |
| spglib | Minimal input contract plus symmetry dataset, standardized cell, transformations, origin shift, and atom mappings | Symmetry discussion | Tolerance sensitivity and mapping-first inspection | Inspect the dataset rather than only a space-group symbol; never overwrite the source structure | Hall-setting tables, crystallographic derivations, or a universal `symprec` | Structure and Model, symmetry troubleshooting | P0 |
| SeeK-path | Returns a standardized cell and path together, with transformations, warnings, and time-reversal state; web and Python entry points | SeeK-path tool and band topic | A cell-plus-path artifact contract | Bind the exact calculation cell to path, convention, tolerance, warnings, and time-reversal assumption | BZ engine, visualizer, Bravais decision tree, or path bands as full-BZ evidence | Band practical, Navigator, Software Bridge | P0 |
| Phonopy and QE PHonon | Calculator-neutral displacement/force/force-constant workflow; explicit `ph.x -> q2r.x -> matdyn.x` artifact chain; symptom-based imaginary-mode guidance | Harmonic phonon overview and bounded Gamma evidence | Complete artifact roles and a fail-closed imaginary-mode recovery route | Map unit cell/displacements/forces/IFC/modes; separate numerical artifacts from physical instability | Workflow diagrams, tag tables, universal displacements, grids, or ASR as a stability proof | Troubleshooting, Software Bridge, Phonopy tool | P0 |
| Wannier90 | Tutorial outlines, input manifests, artifact lineage, and direct-versus-interpolated validation | Wannier and Berry topics | Prerequisite and interpolation-fidelity gates | Map `.nnkp/.amn/.mmn/.eig/.wout/.chk`; compare direct and interpolated bands in the target window | Tutorial catalogue, spread convergence as physical correctness, or path plots as BZ-integral convergence | Wannier topic, Troubleshooting, Software Bridge | P0 |
| EPW | Coarse-to-fine interpolation gates, restart layers, commensurate grids, and explicit validation of bands, phonons, and matrix elements | EPC and superconductivity topics | Independent coarse/fine/interpolation/observable gates | Require a qualified phonon parent and validate interpolation before lambda, transport, or Tc | Tutorial grids, broadenings, Coulomb values, directory trees, or printed lambda/Tc as convergence | EPC, superconductivity, preservation, restart troubleshooting | P0 |
| AiiDA | Immutable process identity, provenance links, exit states, caller/callee relations, restart ancestry, and portable archives | Calculation audit and preservation | A compact attempt/correction record | Preserve each retry as a new attempt with parent, reason, changed inputs, output, and claim ceiling | Daemon, graph UI, message broker, caching engine, or workflow automation | Troubleshooting, E, Worked Workflows | P0 |
| atomate2/jobflow | Original and effective inputs, correction history, task documents, replacement identity, and output references | Raw/parsed evidence distinction | A visible correction ledger | Record symptom, evidence, change, new attempt, and result | Silent custodian corrections, databases, or execution engine | Troubleshooting and Worked Workflows | P0 |
| pyiron | Job identity, predecessor/master links, scheduler identity, HDF artifacts, and project pack/unpack | Manual case manifests | Index-versus-artifact and restart-role explanation | State that database/catalog identity does not replace artifacts and hashes | Job manager, dashboard, HDF object model, or scheduler abstraction | E and preservation | P1 |
| Materials Cloud Learn and Work | Curated schools plus no-install tools such as QE input generation and SeeK-path | Official tool links | A clear statement of when upstream interactive tools are useful | Link the upstream tool and explain the object to save and verify | Rebuilt viewers, course catalogue, embedded cloud execution, or DRW-hosted automation | Tools and contextual links | P1 |
| Martin | Formal meaning, method relationships, and claim limitations | Necessary scientific boundaries | No missing reader-facing theory body | Use as an internal why/what review authority | Derivations, chapter summaries, or Theory Atlas duplication | Authoritative reference crosswalk | P0 |
| Sholl and Steckel | Practical plane-wave reasoning and the distinction between numerical convergence and physical accuracy | Operation-first B/C and practical guides | Explicit internal textbook-role assignment | Use for hold-fixed/vary/compare/decide checks | Example numbers as defaults or a visible course sequence | A-C, D1/D4, validation reference crosswalk | P0 |
| Giustino | Connects theory, calculated observables, and measurable properties | Property topics and claim ceilings | Explicit internal textbook-role assignment | Use for observable and interpretation boundaries | Property-theory lectures or full formula development | D2/D3/D5 and analysis crosswalk | P0 |

## Adopted release scope

The benchmark authorizes six bounded changes:

1. A ten-question static navigator at the top of Research Workflow. Each entry
   maps question, observable, existing topic, prerequisite, first practical
   action or honest no-guide state, validation, and claim limitation.
2. One symptom-first supporting Troubleshooting page under Research Workflow.
   It preserves failed attempts before retry and links official software help.
3. One static Software Bridge under Research Workflow. It maps six common
   scientific tasks and their parent/result artifacts across QE, VASP, ABINIT,
   and CP2K. It translates task and artifact names, not parameters or defaults.
4. A build-time authoritative-reference crosswalk for all 46 topics. Each topic
   receives at most one textbook role, one selected implementation or method
   source, and one optional specialist reference. Existing reviewed sources are
   reused where possible.
5. A `verify` field for the existing 17 tools, plus first-action and artifact
   wording where the benchmark found a concrete gap. No tool is added.
6. Eleven bounded source pages with fourteen contextual links for the
   highest-friction routes: CIF to model, SCF and phonons to troubleshooting,
   reference state to full-zone/DOS, and code tools to Software Bridge.

## Explicit non-adoption decisions

The release will not add:

- a new top-level navigation item, topic, or taxonomy;
- a questionnaire, client state, recommendation algorithm, or giant flowchart;
- a workflow engine, database, provenance graph, daemon, or automatic repair;
- a parameter translator, default table, or claim of software equivalence;
- GPAW, COD, NOMAD, or any eighteenth tool entry;
- copied textbook/manual passages, licensed VASP content, or POTCAR material;
- a new worked workflow, synthetic execution transcript, or DFT rerun;
- a search system, dashboard, badges, progress state, or client hydration.

## Authoritative source policy

Technical statements use official documentation first, official tutorials or
examples second, and maintained primary/specialist sources third. Community
sources may reveal a symptom but cannot be its sole technical authority. Links
must be live-audited, version/access context must be recorded where aliases move,
and a tutorial parameter must never become a universal recommendation.

## Gold workflow candidates

The public v1 baseline remains Silicon (semiconductor) and Aluminium (metal).
Possible future evidence-driven candidates are an ionic insulator, a 2D model,
a magnetic model, a surface, a full phonon workflow, and an EPC workflow. This
is an internal roadmap only. No candidate is authorized for execution or public
promotion by this benchmark.
