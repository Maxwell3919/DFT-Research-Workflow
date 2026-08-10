# Operation Depth Matrix — 2026-08-11

This audit measures whether a researcher can complete an operation with DRW,
basic Linux, and the linked official manual. It does not grade the amount of
overview prose. `P0` means that a common backbone task still has an execution
break; `P1` means that a runnable route exists but an important inspection,
alternative, or evidence handoff is weak.

| Topic / route | Practical pages and current capability | Missing concrete operation | Missing evidence or recovery | Bridge / theory handoff | Priority |
| --- | --- | --- | --- | --- | --- |
| Obtain a Material Structure | COD Silicon record can be opened and provenance is bounded. | Browser record to downloaded CIF, text inspection, composition/cell checks, viewer reopen, symmetry check, conversion and next model were not one continuous route. | Real COD interface exists; derived structure/symmetry artifacts were not used at the point of action. | Multiple databases and viewers exist in Tools; crystallography handoff absent. | P0 |
| Build or Modify a Computational Model | ASE/pymatgen companion executions cover repeat cells, transformations, slabs, 2D models and candidate construction. | Pages led with repository helpers instead of the file a reader creates; primitive/conventional selection, tolerance choice, reopen-after-write and object acceptance were incomplete. | Exact case structure views exist but several operation pages had no before/after visual. | ASE/pymatgen/spglib bridges exist; surface/interface theory handoff absent. | P0 |
| Choose the DFT Method and Computational Setup | Overview identifies XC, pseudopotential and method boundaries; one Silicon case preserves one exact SSSP member. | No dedicated trusted-library-to-exact-file pseudopotential guide; no complete source/version/XC/valence/relativity/cutoff/hash receipt; generation was not clearly isolated as an advanced exception. | No multi-library human download route or model-specific continuation. | QE/VASP/ABINIT/CP2K/FHI-aims resources exist but were not joined into the operation. | P0 |
| Test Numerical Convergence — cutoffs | A real Silicon `ecutwfc × k` matrix and plot exist. | No clone-independent baseline input/generation loop, `ecutrho` branch, local and batch series, failure-first extraction, table/plot construction and force/observable boundary in one route. | Plot is readable but detached from the practical guide; PP DOI label needed correction. | QE reference implementation plus official alternatives; plane-wave theory link absent. | P0 |
| Test Numerical Convergence — k points / smearing | Guide states the insulator/metal/2D distinctions and warns that metal sampling and smearing are coupled. | No complete input matrix generator or transparent manual run; the adverse Aluminium series must remain a failed screen rather than be presented as convergence. | Real Silicon plot and Aluminium failed table exist but were not action-adjacent. | BZ theory handoff absent; software alternatives available only through Tools. | P0 |
| Calculate the Reference Ground State — SCF | Stored Silicon inputs/outputs and an audit helper exist. | No standalone complete `scf.in`, staging, local command, site-specific Slurm template, live monitoring, artifact list, anchored positive convergence marker, metallic Fermi-level branch and exact next calculation. | A substring check could misclassify `No convergence has been achieved` as success. | QE is reference implementation; alternative software bridge needs to remain visible; SCF theory link absent. | P0 |
| Optimize the Structure — relax | Real Silicon fixed-cell relaxation output, per-component force audit, force history and fresh static calculation exist. | No from-zero `relax.in`; no complete degrees-of-freedom/constraint example, monitor loop, final-coordinate extraction, visual reopen and acceptance-to-fresh-SCF route. | Force logic is strong; starting/final structure view and common recovery decisions were missing. | QE reference plus official alternatives; minimal theory only. | P0 |
| Optimize the Structure — vc-relax / restart | The site discusses cell relaxation and contains stored restart demonstrations. | No `vc-relax` or `if_pos` input. `restart_mode='restart'` examples needed correction: it is for cleanly interrupted compatible runs, not a new calculation. | No real vc-relax execution is available, so this branch must be documented-not-executed. | Current QE manual is authority; keep VASP/ABINIT bridges concise. | P0 |
| Reference-state acceptance | Charge/spin candidates and lineage are discussed; a real Fe adverse case exists. | Acceptance needed a clearer state comparison, same-model ledger, downstream-readiness gate and distinction between initialization from saved files and interrupted-run restart. | Program completion, SCF convergence, model comparison and scientific acceptance must stay separate. | Atlas link only when deeper SCF/magnetism theory is needed. | P1 |
| Band Structure | Stored bands and full-zone comparison preserve the path boundary. | No fresh complete SCF-to-path-to-`bands.x` input/command/plot route or SeeK-path-to-QE translation. | Stored path has a solver warning and connector caveat; assembled stages were over-described as execution lineage. | Path is not full-BZ metallicity proof; official VASP/ABINIT alternatives needed. | P0 |
| DOS / PDOS | Real stored DOS is reconstructable and plotted. | No complete dense NSCF → `dos.x` / `projwfc.x` inputs, data inspection, Fermi alignment, plotting and mesh/broadening test. | Real plot was isolated in the Worked Workflow. | QE reference plus software bridges; theory explanation should remain short. | P0 |
| Full-BZ / Fermi surface | Real adverse Aluminium full-zone matrix and band-path comparison exist. | No concrete official `fs.x` → BXSF → viewer bridge, and no explicit next route when a path misses an extremum. | Preserve negative/adverse evidence and tested isovalue boundary. | Full-zone object must remain separate from high-symmetry path. | P1 |
| Charge density / electrostatic potential | Overview and a synthetic closure exercise exist. | Need concrete compatible-grid `pp.x`/potential objects, inputs, commands, file checks and alignment/reference decisions. | No fake execution may be introduced; documented routes must be labelled. | Software bridges and minimal electrostatics theory handoff. | P1 |
| Harmonic Phonons | A real Gamma response artifact and harmonic ledger exist. | Current page said it was not the first action; no complete SCF → `ph.x` → q mesh → `q2r.x` → `matdyn.x`, phonon DOS/plot route, or finite-displacement force mapping. | Full dispersion is not real evidence here; ASR, imaginary-mode triage and mode visualization were incomplete. | QE/PH and Phonopy reference routes plus VASP/ABINIT bridges. | P0 |
| EPC / conventional superconductivity | Scientific boundary is cautious and no fake full workflow is claimed. | Need an explicit trusted metal → k/q/phonon → matrix elements → interpolation → `alpha2F` → lambda / omega-log / Tc object chain and observable-specific convergence. | No real complete workflow, so retain overview/resources and label every practical handoff. | QE/PH, EPW, Wannier90 and other verified tools. | P1 |
| Quick Reference | No dedicated copy-now route existed. | Needed `OUT=`-only SCF/relax/job/artifact/bands/DOS/phonon checks with anchored success markers and explicit scientific limits. | Commands must expose warnings and missing artifacts before extracting headline values. | Link official troubleshooting at the decision point. | P0 |
| Troubleshooting | Ten symptom records covered common SCF, geometry, restart, I/O, memory, MPI and phonon cases. | Missing job-not-start, very slow SCF, persistent forces, persistent stress, wall-time/missing artifact and bands/DOS inconsistency as direct symptom routes. | Each route needs first inspection, cause classes, safe tests and next action. | Software manual link, not a theory detour. | P0 |
| Tools & Resources | 184 resources, 234 links and 18 selective detail routes were registry-complete. | Desktop rendered a long prose list; mobile rows were 264–274 px median; `Research tasks:` repeated on every resource; operation tags were not links. | Live 1440 page was about 41,847 px tall and 360 page about 57,252 px. | Preserve full registry and bidirectional topic discovery. | P0 |
| Silicon / Aluminium Worked Workflows | Both workflows preserve real evidence and honest boundaries; Silicon fresh chain stops at static SCF and Aluminium convergence remains FAIL. | Workflow stages did not directly link their practical guide and guide backlinks returned to workflow top; some real command blocks lacked Copy. | Several high-value figures were isolated from the operation page. | Cases illustrate, never universalize, parameter choices. | P0 |

## Fresh human documentation tests at audit baseline

| Question | Baseline result | Blocking break |
| --- | --- | --- |
| I downloaded a CIF. What do I do next? | Partial | Could not complete symmetry, primitive/conventional choice, conversion and reopen as one route. |
| I need a pseudopotential. | Fail | No multi-library exact-file download and preservation guide. |
| I need to run an SCF. | Fail | No standalone complete input-to-monitor-to-accept page. |
| I need to relax a structure. | Fail | Stored-output audit did not teach creation and execution of a new relaxation. |
| I need a band structure. | Fail | No fresh path construction, complete inputs and plot chain. |
| I want phonons. | Fail | Gamma evidence was not a first runnable DFPT or finite-displacement route. |
| I use VASP instead of QE. | Partial | The bridge preserved the scientific objects but was not visible from most operation pages. |

The same seven questions must be repeated after implementation without using
repository knowledge that is not exposed on the rendered site.

## Post-pass rendered-only documentation test

An independent reviewer used only the fresh rendered site, the linked official
manuals, and basic Linux expectations. Repository source knowledge was excluded
from the test.

| Question | Post-pass result | Reader can now complete |
| --- | --- | --- |
| I downloaded a CIF. What do I do next? | Pass | Inspect the browser record and metadata, preserve/download the CIF, read the text, visualize it, check composition/cell/symmetry, convert or build the model, reopen the written structure, and choose the next operation. |
| I need a pseudopotential. | Pass | Compare trusted libraries, select an exact compatible file, inspect valence/relativity/type/cutoff metadata, download it, verify and record its identity/hash, then start model-specific convergence. |
| I need to run an SCF. | Pass | Create a complete QE 7.5 input, stage the pseudopotential and writable scratch, run locally or through a site-edited Slurm script, monitor it, distinguish program termination from SCF convergence, inspect energy/Fermi level/warnings, and continue. |
| I need to relax a structure. | Pass | Choose degrees of freedom, create and run `relax.in`, inspect electronic and ionic steps, forces/stress/final coordinates, reopen the final geometry, accept/restart/continue, and create a fresh fixed-geometry SCF. |
| I need a band structure. | Pass | Construct and preserve a path ledger, translate split paths to complete QE inputs, run `pw.x` and `bands.x`, plot fresh `.gnu` outputs with an explicit energy reference and path break, inspect failures, and continue to a full-zone/DOS route when the claim requires it. |
| I want phonons. | Pass | Choose complete-q DFPT or finite displacement; run the QE `ph.x`/`q2r.x`/`matdyn.x` route, plot fresh dispersion and DOS, or assemble Phonopy 4.4 structure-only displacements with a complete QE header before force jobs; then test convergence and inspect imaginary modes. |
| I use VASP instead of QE. | Pass | Keep the same scientific objects and acceptance boundaries while following the visible official VASP bridge; QE remains the in-depth reference implementation, not the definition of DFT. |

The Phonopy branch is documented but was not executed in the retained Silicon
case. Its example supercell and reciprocal meshes are not convergence
recommendations. Browser rendering, helper self-tests, real stored outputs, and
the 7/7 documentation result remain separate from observable convergence,
physical validity, and scientific acceptance.
