---
topic_slug: calculate-reference-ground-state
guide_slug: package-reusable-reference-state-lineage
title: Package a Reusable Reference-State Lineage
kind: implementation
tools:
  - quantum-espresso
  - python
status: reviewed
summary: Bind structure, method, state, charge density, wavefunctions, outputs, and downstream compatibility into one hashed reference-state manifest.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/qe_manual_handoff.py
source_ids:
  - qe-pw-75
  - vasp-electronic-ground-state-properties
  - vasp-lcharg
  - vasp-lwave
  - cp2k-dft
  - cod-9013102
media_ids: []
review: docs/reviews/2026-08-03-calculate-reference-ground-state.md
reviewed_at: "2026-08-03"
---

## Purpose

A reusable calculation is a directory that can be identified, restored, checked, and regenerated without relying on shell history or memory. Packaging does not make the calculation scientifically valid; it preserves the evidence needed to evaluate it.


## Lay out what another researcher must inspect

Before creating hashes or an archive, arrange the record in the order a collaborator will actually use it: source identity and acquisition notes; accepted geometry; visual inspection notes; exact inputs and pseudopotentials by identity rather than licensed contents; launch commands and scheduler context; raw outputs; parsed tables; figures; failed or rejected branches; literature and manual decisions; and the claim boundary. A short human-readable README should say what was calculated, which state was accepted, what remains untested, and how the next calculation consumes the reference state.

Open the accepted structure, principal output, convergence table, and key figure once as a reader would. Check that paths are portable, captions identify the object, candidate labels agree across files, and a failed branch has not been silently replaced. The [visual and symmetry index](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry), [code and manual index](/DFT-Research-Workflow/operations/resource-landscape/#electronic-structure-codes), and [learning resources](/DFT-Research-Workflow/operations/resource-landscape/#literature-learning) should be linked where they explain how to inspect or reproduce a step; they are not substitutes for preserving the local record.

Only then use ordinary checksum and archive commands. Hashes support byte-identity checks, not scientific acceptance. Do not package credentials, private host details, licensed potential contents, copyrighted PDFs, or large restart data that belong in controlled storage; record their authorized location and identity instead. Reopen the packaged README and a representative input, output, table, and figure before handing the lineage to another person.

## Assemble one study directory

Create a new directory outside the repository and refuse to reuse an existing path:

~~~bash
study="$HOME/drw-archives/si-study"
test ! -e "$study"
mkdir -p "$study"/{source,input,commands,output,parsed,figures,environment}
~~~

Use a text editor to write `README.md` for this study, in the vocabulary of the scientific question rather than a fixed site form. It should identify the model and source, accepted geometry and state, software and version, pseudopotential library receipt and hashes, exact execution route, declared numerical decisions, target observable, failed or excluded branches, claim boundary, controlled-storage references, and what a downstream calculation may consume. Continue only after it is nonempty:

~~~bash
test -s "$study/README.md"
~~~

Use the directories consistently:

| Path | Preserve |
| --- | --- |
| <code>source/</code> | downloaded structure, source URL/identifier, access date, and original hash |
| <code>input/</code> | exact QE inputs and exact pseudopotential identity records; include a redistributable UPF only when its terms allow it |
| <code>commands/</code> | run, extraction, and regeneration commands |
| <code>output/</code> | raw stdout/stderr and native post-processing data needed for audit |
| <code>parsed/</code> | machine-readable tables derived from <code>output/</code> |
| <code>figures/</code> | figures generated from the parsed data |
| <code>environment/</code> | QE/MPI versions, scheduler script, host-independent environment notes |

Do not package restart wavefunctions, scratch trees, credentials, private host paths, licensed potentials, or unrelated raw data merely because they share a directory.

## Preserve the study's own regeneration route

Copy the exact, reviewed run and parsing scripts used by this study into `commands/`; do not substitute a DFT Research Workflow repository helper merely because it can parse a teaching fixture. Write a short `commands/regenerate.sh` that reads only preserved raw/native data, names every derived target it recreates, and refuses to overwrite the raw `output/` directory. Record interpreter and library versions in `environment/`.

Run that study-specific script once from a fresh work copy, compare every regenerated table and figure with the retained derived objects, and inspect differences rather than updating hashes automatically. A deterministic parser result shows that those derived bytes can be recreated on the recorded stack; it does not validate the raw calculation.

## Inventory, archive, restore, and inspect

From the study directory, inventory the human-readable contents, reject empty files that should contain evidence, and create checksums without including the checksum file in itself:

~~~bash
(
  cd "$study"
  find source input commands output parsed figures environment -type f \
    -printf '%12s %p\n' | sort
  find source input commands output parsed figures environment -type f -size 0 -print
  {
    printf '%s\0' README.md
    find source input commands output parsed figures environment -type f -print0
  } | sort -z | xargs -0 -r sha256sum > SHA256SUMS
  sha256sum -c SHA256SUMS
)
~~~

Choose new archive and restore paths, then use ordinary `tar` and `sha256sum` commands:

~~~bash
archive="$HOME/drw-archives/si-study.tar.gz"
restore_parent="$HOME/drw-restores"
restored="$HOME/drw-restores/si-study"
test ! -e "$archive"
test ! -e "$restored"

study=${study%/}
tar -C "$(dirname -- "$study")" -czf "$archive" "$(basename -- "$study")"
sha256sum -- "$archive"

mkdir -p "$restore_parent"
tar -C "$restore_parent" -xzf "$archive"
test -d "$restored"
(
  cd "$restored"
  sha256sum -c SHA256SUMS
)
~~~

Open the restored README and representative source, input, stdout, stderr, parsed table, and figure. Confirm that controlled-storage references are usable by the intended collaborator and that no private or licensed body leaked into the archive. Then rerun the study-specific parser in a separate fresh copy if regeneration is part of the handoff.

`sha256sum -c` proves only that restored bytes match the package checksum list. It does not prove that the source URL was genuine, QE completed, SCF or ionic criteria passed, the target observable converged, the model was physically appropriate, or the scientific claim is supported.

## Optional DFT Research Workflow companion check

The page remains bound to a repository companion for its educational assertions. Run this only after understanding the ordinary human package above:

~~~bash
python3 examples/practical-guides/qe_manual_handoff.py self-test
~~~

The self-test creates and restores its own deterministic teaching fixture. It does not package this study, run a DFT code, establish provenance for an external file, or support numerical or scientific acceptance.

## If it fails

Do not overwrite the archive. Fix the missing file, unsafe path, nondeterministic parser, undeclared dependency, or checksum mismatch in a new study directory. Regenerate and package again, then preserve both the failed audit and the replacement identity if the failed package was already shared.

## Next

Cite the archive hash and manifest identity in the study record. A collaborator should be able to restore the archive, read <code>README.md</code>, verify checksums, rerun the documented extraction, and understand exactly what remains untested.

## Official sources

- [Quantum ESPRESSO pw.x input reference](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [COD silicon record 9013102](https://www.crystallography.net/cod/9013102.html)
- [CP2K DFT input reference](https://manual.cp2k.org/trunk/CP2K_INPUT/FORCE_EVAL/DFT.html)
- [VASP electronic ground-state properties](https://vasp.at/wiki/Electronic_ground-state_properties)
- [VASP LCHARG reference](https://vasp.at/wiki/LCHARG)
- [VASP LWAVE reference](https://vasp.at/wiki/LWAVE)
