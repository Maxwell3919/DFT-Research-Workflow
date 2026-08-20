# Review - Migrate and Verify Calculation Data Between Hosts

## Scope and routing

The page adds one subordinate implementation guide under `document-and-preserve-study` without changing the A-E topic registry or treating data migration as a new research operation.

`migrate-and-verify-calculation-data` is an implementation guide. It covers moving a declared file set between hosts through an SSH pipe, byte-for-byte verification with `sha256sum` manifests, and recording the software-version baseline so that energies from different lineages are not mixed in one comparison.

## Command and executable review

The page provides runnable Bash commands for `ssh`, `tar`, `sha256sum`, `diff`, and process substitution. It explains that the SSH pipe avoids an intermediate copy, that `diff` with no output means the two manifests agree, and that a version baseline is a comparison boundary rather than an accuracy claim.

The page is reviewed within the declared migration and byte-identity scope. Byte-for-byte agreement does not establish content correctness, calculation success, or scientific validity. Version baselines are a comparison boundary, not a claim that one version is more accurate. Site configuration, archive options, and `sha256sum` output format remain local facts that must be checked on the target hosts. No cross-site portability claim is made.

## Source and version record

The page reuses the existing tool ID `quantum-espresso` and source ID `qe-pw-75`. It adds two official GNU source records: the coreutils manual's sha2 utilities page and the GNU tar manual.

- [Quantum ESPRESSO `pw.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [GNU coreutils manual: sha2 utilities](https://www.gnu.org/software/coreutils/manual/html_node/sha2-utilities.html)
- [GNU tar manual](https://www.gnu.org/software/tar/manual/html_node/)

The companion scope is pinned to Python 3.12, GNU coreutils `sha256sum`, and GNU tar. The page does not claim that archive options, digest output format, or QE output text are unchanged in another release.

## Companion and artifact review

`migrate_verify_data.py` uses only the Python standard library. It parses two `sha256sum` manifests, compares the file-path sets and the common-file hashes, prints per-file PASS/FAIL with a summary, and exits nonzero when the manifests disagree. It does not write files, run `ssh`, `tar`, or `sha256sum`, or access any host.

## Scientific and claim boundary

The page separates byte identity from content correctness, calculation success, and scientific validity. It supports teaching how to move and verify a calculation tree. It does not establish that the moved files are the scientifically correct inputs, that any calculation succeeded or converged, or that one software version is more accurate than another.

No media are added. Source reachability, companion execution, content validation, build, and browser behavior remain separate checks and were not run as part of this file-creation task.

## Operational closure

The guide requires the exact file set to be declared before moving, requires the manifests to agree before the migration is considered complete, and requires the version baseline to be recorded in the study record. The migration is presented as a preservation step, not a scientific validation.