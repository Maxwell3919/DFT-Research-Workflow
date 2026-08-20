---
topic_slug: document-and-preserve-study
guide_slug: migrate-and-verify-calculation-data
title: Migrate and Verify Calculation Data Between Hosts
kind: implementation
tools:
  - quantum-espresso
status: reviewed
summary: Move a calculation tree between hosts through an SSH pipe, verify byte-for-byte agreement with sha256sum manifests, and keep the software-version baseline explicit so energies are not mixed across lineages.
tested_versions:
  - Python 3.12 companion manifest comparison
  - GNU coreutils sha256sum
  - GNU tar
execution_script: examples/practical-guides/migrate_verify_data.py
source_ids:
  - qe-pw-75
  - gnu-coreutils-sha256sum
  - gnu-tar
media_ids: []
review: docs/reviews/2026-08-20-migrate-and-verify-calculation-data.md
reviewed_at: "2026-08-20"
---

## Purpose

When a calculation tree moves to another host, the destination must contain the same bytes as the source, and the study record must say which software version produced the numbers. This guide moves a declared file set through an SSH pipe without leaving an intermediate copy, verifies byte-for-byte agreement with `sha256sum` manifests, and records the version baseline so that energies from different software lineages are never mixed in one comparison.

Byte identity is a preservation claim, not a scientific one. Matching bytes do not prove that the calculation succeeded, converged, or is valid; they prove only that the reviewed files arrived unchanged.

## Move the declared file set through an SSH pipe

Choose the exact file set before moving anything: the structure files, the reference geometry, and the inputs for the series. Stream the archive directly from the source host to the destination host so that no intermediate machine holds a copy:

~~~bash
ssh source-host 'cd /path/to/source/study && tar -cf - \
  structures/initial \
  reference_stack03_relaxed.cif \
  convergence/cutoff/100/scf.in \
  convergence/cutoff/120/scf.in \
  convergence/cutoff/140/scf.in \
  convergence/cutoff/160/scf.in \
  convergence/cutoff/180/scf.in \
  convergence/cutoff/200/scf.in' \
  | ssh dest-host 'cd /path/to/dest/study && tar -xf -'
~~~

The [GNU tar manual](https://www.gnu.org/software/tar/manual/html_node/) documents the archive options; the local `tar` decides which features are available. The pipe proves that bytes flowed from one host to the other through the SSH connection. It does not prove that every declared file arrived, that no file was truncated, or that the destination path is the intended authority. Do not carry scratch directories, output files, or site-specific launchers in the migration; move the clean inputs and structures, then regenerate the run artifacts on the destination.

## Verify byte-for-byte agreement

After the move, compare `sha256sum` output produced on each host for the same declared file set:

~~~bash
diff \
  <(ssh source-host 'cd /path/to/source/study && sha256sum \
      structures/initial/*.cif \
      reference_stack03_relaxed.cif \
      convergence/cutoff/{100,120,140,160,180,200}/scf.in') \
  <(ssh dest-host 'cd /path/to/dest/study && sha256sum \
      structures/initial/*.cif \
      reference_stack03_relaxed.cif \
      convergence/cutoff/{100,120,140,160,180,200}/scf.in')
~~~

The [GNU coreutils manual](https://www.gnu.org/software/coreutils/manual/html_node/sha2-utilities.html) documents `sha256sum`; the local implementation decides the exact output format. `diff` with no output means the two manifests are identical: every declared file exists on both hosts with the same bytes. Any output means a missing, extra, or changed file, and the migration is not complete until the manifests agree. Matching hashes prove byte identity only; they do not prove that the files are the scientifically correct inputs.

## Record the version baseline

A migration is also a lineage boundary. If the source host ran one QE version and the destination runs another, the total energies are not directly comparable across the boundary. Record the baseline explicitly in the study record:

- the exact QE version that will interpret the results on the destination;
- the frozen structure and the exact pseudopotential set, carried across unchanged;
- the rule that new convergence, ranking, and relaxation results close inside the destination version's lineage;
- the rule that old energies from the previous version are not mixed into the new comparisons.

The [Quantum ESPRESSO `pw.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html) documents the input format for the current release; it does not guarantee that output text, defaults, or restart formats are unchanged in another release. A version baseline is a comparison boundary, not a claim that one version is more accurate than another.

## Run the companion comparison

The companion compares two `sha256sum` manifests and reports per-file agreement:

~~~bash
ssh source-host 'cd /path/to/source/study && sha256sum structures/initial/*.cif' > source.sha256
ssh dest-host 'cd /path/to/dest/study && sha256sum structures/initial/*.cif' > dest.sha256
python3 examples/practical-guides/migrate_verify_data.py \
  --source-manifest source.sha256 \
  --target-manifest dest.sha256
~~~

The companion reports which files are identical, missing, extra, or changed, and exits nonzero when the manifests disagree. It compares bytes only; it does not judge the content, the calculation, or the science.

## Next

With the bytes verified and the version baseline recorded, run the first gate on the destination and compare its rows inside the declared lineage. Keep the migration manifests and the baseline statement with the study record so a later reader can reconstruct what moved and under which version the numbers were produced.

## Official sources

- [Quantum ESPRESSO `pw.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [GNU coreutils manual: sha2 utilities](https://www.gnu.org/software/coreutils/manual/html_node/sha2-utilities.html)
- [GNU tar manual](https://www.gnu.org/software/tar/manual/html_node/)