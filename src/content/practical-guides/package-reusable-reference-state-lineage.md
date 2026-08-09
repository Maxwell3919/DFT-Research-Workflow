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
media_ids:
  - reference-state-lineage
review: docs/reviews/2026-08-03-calculate-reference-ground-state.md
reviewed_at: "2026-08-03"
---

## Purpose

A reusable calculation is a directory that can be identified, restored, checked, and regenerated without relying on shell history or memory. Packaging does not make the calculation scientifically valid; it preserves the evidence needed to evaluate it.

## Verify the packaging tool

From the repository root:

~~~bash
python3 examples/practical-guides/qe_manual_handoff.py self-test
~~~

The self-test creates a deterministic fixture in a temporary directory, archives it, restores it cleanly, runs <code>sha256sum -c</code>, deletes declared derived targets, regenerates them, and compares their hashes. No fixture output is presented as scientific evidence.

## Assemble one study directory

Create a new directory outside the repository and copy, rather than link, the files required to understand and reproduce the calculation:

~~~bash
study="$HOME/drw-archives/si-study"
mkdir -p "$study"/{source,input,commands,output,parsed,figures,environment}

cat > "$study/README.md" <<'TXT'
Scientific question:
Model and source identity:
Software and version:
Pseudopotential filenames and SHA-256:
Execution context and command:
Declared numerical acceptance rules:
Target observable and claim boundary:
Known failures or exclusions:
TXT
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

## Record deterministic regeneration

Copy the reviewed helper and write a regeneration script that reads only preserved raw/native data:

~~~bash
cp examples/practical-guides/qe_manual_handoff.py \
  "$study/commands/qe_manual_handoff.py"

cat > "$study/commands/regenerate.sh" <<'SH'
#!/usr/bin/env bash
set -euo pipefail

python3 commands/qe_manual_handoff.py extract-runtime \
  --runtime-dir output \
  --bands-data output/si.bands.dat \
  --dos-data output/si.dos.dat \
  --output-dir regeneration-work

mkdir -p parsed figures
mv regeneration-work/*.csv parsed/
mv regeneration-work/analysis.json parsed/
mv regeneration-work/*.svg figures/
rmdir regeneration-work
SH

cat > "$study/commands/regeneration-targets.txt" <<'TXT'
parsed/convergence.csv
parsed/bands.csv
parsed/dos.csv
parsed/analysis.json
figures/convergence.svg
figures/bands.svg
figures/dos.svg
TXT

(
  cd "$study"
  bash commands/regenerate.sh
)
~~~

Adjust the explicit native filenames and target list to the files your branch actually produces. The helper refuses a non-empty analysis destination. Keep raw output immutable during regeneration.

## Create, restore, and audit the package

Choose new paths; the command refuses to restore over an existing directory:

~~~bash
archive="$HOME/drw-archives/si-study.tar.gz"
restored="$HOME/drw-restores/si-study"

python3 examples/practical-guides/qe_manual_handoff.py package-study \
  --study-dir "$study" \
  --archive "$archive" \
  --restore-dir "$restored" \
  --run-regeneration-check
~~~

The tool writes:

- <code>manifest.json</code>: path, byte count, and SHA-256 for each payload file;
- <code>INVENTORY.tsv</code>: a plain tabular inventory;
- <code>SHA256SUMS</code>: checksums for payload plus manifest and inventory;
- a deterministic <code>tar.gz</code> archive;
- <code>restore-audit.json</code> in the clean restore.

Repeat the byte-integrity check manually:

~~~bash
(
  cd "$restored"
  sha256sum -c SHA256SUMS
)
sha256sum "$archive"
cat "$restored/restore-audit.json"
~~~

<code>sha256sum -c</code> proves that restored bytes match the package inventory. The regeneration check proves only that the declared derived files are reproduced byte-for-byte by the preserved command on this software stack. Neither proves numerical convergence, model correctness, physical plausibility, or the scientific claim.

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
