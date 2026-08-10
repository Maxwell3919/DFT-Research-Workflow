---
topic_slug: document-and-preserve-study
status: reviewed
---

A completed calculation tree is not yet a preserved study. Scratch directories contain transient files, failed attempts, machine-specific paths, and outputs whose relationship to a reported result may exist only in the researcher's memory.

Preservation turns that working history into an identifiable research object. Another researcher should be able to discover what was studied, recover the evidence behind a result, reconstruct the transformation from inputs to claims, and understand what cannot be redistributed or rerun.

## Preserve the human research record first

Start with the record a researcher needs to understand the work. Keep the scientific question, candidate models, decisions, rejected alternatives, acceptance criteria, unresolved anomalies, and the reason for each return to A, B, C, or D. A laboratory notebook, dated text record, or electronic notebook is suitable when it identifies the objects and decisions rather than merely stating that a calculation was run.

Preserve operations that happened outside the terminal:

- database record URLs, identifiers, access dates, downloaded files, and the metadata inspected before selection;
- the original paper, Methods or Supplementary Information citation, and a note identifying which parameters or experimental conditions were compared;
- structure-viewer or plotting-program exports, measurement notes, selected views, and settings needed to understand what was inspected;
- spreadsheet or notebook tables together with formulas, filters, exclusions, and the unmodified source data;
- screenshots only when they show where an action occurred, what state was inspected, or what failure was observed, with source, date, and reuse boundary;
- failed attempts and manual observations that affected the next scientific decision.

For structure work, the [VESTA tool page](/DFT-Research-Workflow/tools/vesta/) identifies the object to open and what visual inspection can and cannot establish. For provenance automation, [AiiDA](/DFT-Research-Workflow/tools/aiida/) is an optional implementation; a manual calculation remains preservable when its interfaces, objects, decisions, and lineage are recorded.

## Preserve the path from question to claim

For every calculation branch, the record should answer:

- Which structure, composition, charge, spin state, boundary model, and reference states were used?
- Which code, version, build features, potentials or basis sets, and libraries defined the calculation?
- Which input and command produced each output, and in what execution environment?
- Which convergence and physical-consistency checks made the result eligible for analysis?
- Which versioned script, parameters, units, and intermediate values produced the reported observable?
- Which table, figure, or scientific claim uses that observable?

Draw the connections in whatever form the research group can maintain: dated notes, a table of parent and child files, or an exported provenance graph. The representation matters less than being able to start from a claim and walk back through its figure, table, analysis, output, input, and source. If a parent calculation or decision is missing, record the gap and the work needed to close it instead of inventing continuity.

Record identifiers and checksums for external assets even when their contents cannot be redistributed. Licensed potentials, credentials, tokens, and private host details do not belong in a public package. Their omission should be explicit, with an acquisition route and compatibility metadata where permitted.

Automatic provenance capture can reduce omissions, but a live workflow database is not a durable research object unless it can be exported, versioned, restored, and interpreted independently. Manual calculations can also be preserved rigorously when their connections and identities are recorded.


## Preserve a minimum usable study

A minimum usable release preserves functional roles, not a mandatory directory name:

- `README`: question, observable, model, method, human workflow, branch order, acceptance criteria, claim boundary, and the first recovery action;
- `source/`: structure or public-data origin, browser/database receipt, access record, license/reuse boundary, and any manual or automated conversion step;
- `input/`: every human-authored input, pseudopotential identifier and hash where redistribution is restricted, and scheduler script;
- `commands/`: exact launch, extraction, plotting, and validation commands with working directories and exit status, without pretending that unrecorded GUI or manual actions were commands;
- `output/`: retained raw stdout, stderr, and the smallest downstream artifacts needed to inspect or regenerate the result;
- `parsed/`: versioned machine-readable values with units, normalization, source-file hash, and parser identity;
- `figures/`: published figures together with the exact plotted tables and plotting command;
- `environment/`: software and launcher versions, platform/scheduler facts, and dependency lock or environment export;
- `manifest.json`: model, method, parent-child ancestry, expected artifacts, evidence status, and claim boundary;
- `SHA256SUMS`: byte identities for the files selected into the release.

Generate and verify hashes from the exact release directory:

```bash
set -euo pipefail
study=${study:?Set study to the exact release directory}
(
  cd -- "$study"
  for required in README source input commands output parsed figures environment manifest.json; do
    test -e "$required"
  done
  find README source input commands output parsed figures environment manifest.json \
    -type f -print0 | sort -z | xargs -0 -r sha256sum > SHA256SUMS
  sha256sum -c SHA256SUMS
)
```

This command covers only the named paths and fails if one is absent. A checksum fixes bytes; it does not authenticate the depositor, validate the scientific model, or prove that omitted files were unnecessary.

Before publication, restore the package into a new directory, recreate the documented environment, rerun the documented parsers and plot commands, reopen portable GUI/browser exports where relevant, and compare regenerated tables and figures with the preserved identities. If that recovery fails, the study is not yet preserved even if the archive can be downloaded.

## Treat provenance as a working connection, not a separate appendix

Provenance connects the A–E workflow whenever a browser record is selected, a structure is inspected or transformed, a GUI export is made, an input is prepared, a calculation is restarted, an output is parsed, a literature value is compared, or a figure is derived. Capture the source identity, human observation, and transformation at the point of work, then preserve the resulting lineage at study completion. This makes later diagnosis possible without pretending that a registry or archive validates the scientific result.

Reproducibility has layers. A checksum can establish byte-level fixity, an executable reconstruction can establish a bounded rerun path, and an independently prepared comparison can test a result more strongly. None of these alone establishes numerical convergence, physical validity, or a broader scientific conclusion.

The unit of preservation is the study and its lineage, not every byte ever written.

## Give every preserved state an identity

Freeze a release instead of silently updating a shared directory. Assign it a version, creation date, responsible authors, and stable identifier. Cite that version from the article or report. A later correction should create a new version with a change record and a link to the state it supersedes.

A machine-readable manifest should identify each retained object with:

- a logical role;
- a relative path or external location;
- format or media type;
- size;
- checksum algorithm and digest;
- relationships to parent and derived objects.

Relative paths make a package relocatable. Logical identifiers keep the graph stable when storage locations change. A cryptographic checksum detects byte changes after the manifest was created; it does not prove scientific correctness, authorship, or trustworthiness of the original machine.

Persistent identifiers solve discoverability and citation rather than fixity. A DOI or repository record should resolve to metadata that identifies the version, creators, license or access conditions, related publications, and object. A checksum without a durable location is difficult to find; a DOI without usable files and metadata is difficult to reuse.

## Select artifacts by reconstruction value

Preserve source structures and reference data, irreplaceable raw outputs, the inputs and metadata required to interpret them, and the compact derived data behind every reported table and figure. Retain analysis code, environment specifications, test fixtures, and instructions that regenerate the released results.

If a large raw or restart object is omitted, record:

- why it was omitted;
- where it remains;
- how long it will be retained;
- which reconstruction becomes impossible without it.

Restart files deserve a deliberate decision. They can save expensive computation but may depend on code version, architecture, parallel decomposition, or binary format. They are not substitutes for portable inputs and interpretable outputs. Preserve them when continuation value justifies their size and compatibility risk; otherwise state that restart-level recovery is unavailable.

Keep native formats when they contain unique information, and add open documented representations for structures, arrays, tables, and metadata where possible. Store plotting data separately from rendered figures. Compression is useful only when decompression and payload integrity can be tested.

## Package meaning as well as files

A human-readable landing document should explain the scientific question, package scope, object or directory model, reconstruction entry points, software requirements, expected outputs, known omissions, licenses, citation, and stewardship responsibility.

Machine-readable metadata should express the same identities and relationships without requiring prose parsing. RO-Crate can describe a research object and its context in JSON-LD. BagIt can package payload and tag manifests for transfer. These standards can complement each other, but neither supplies the material-specific scientific meaning automatically.

Licenses and access conditions may differ between code, original data, external structures, database extracts, and figures. Record them at the appropriate object level. FAIR data are findable, accessible under stated conditions, interoperable, and reusable; FAIR does not require unrestricted release of every byte.

Choose repositories according to object size, retention commitment, versioning, identifiers, access controls, and domain metadata. A source-code host is suitable for small text, scripts, schemas, and review history, but not automatically for large calculation outputs. The manifest can link code, archival datasets, restricted assets, and host-canonical raw data without pretending that one service is authoritative for every object class.

## Test recovery, not just deposit

Preservation is demonstrated by retrieval and reconstruction from the released state. In a clean environment:

1. fetch the identified version;
2. verify declared checksums;
3. resolve external assets;
4. create the documented software environment;
5. run bounded reconstruction steps;
6. compare generated tables or figures with declared expected artifacts.

Record which steps were executed, which were inspected only, and which expensive calculations were intentionally not rerun.

A checksum audit establishes fixity for the declared files. A successful restore establishes that the tested package can be retrieved and interpreted under the tested environment. Regenerating a figure establishes one analysis path. None of these proves DFT convergence, physical validity, experimental agreement, or the scientific conclusion.

Long-term stewardship repeats fixity checks, monitors persistent identifiers and external dependencies, maintains backups on independent failure domains, and periodically tests restoration. When formats or repositories change, preserve the original identifiers and checksums, record the migration, and create a new version whenever bytes or interpretation change.

A backup that has never been restored is an untested recovery hypothesis.

## Connect preservation to analysis and validation

**Analyze and Compare Results** defines the transformations and comparable observables. **Validate Results and Scientific Conclusions** determines which claims survive the relevant challenges. Preservation keeps that exact evidence state and the route from calculations to claims recoverable.

Documentation increases transparency and reuse. It cannot repair an invalid physical model, supply missing convergence evidence, or strengthen a conclusion beyond the study that was actually performed.

## Sources and standards

- [Wilkinson and co-workers, FAIR Guiding Principles](https://doi.org/10.1038/sdata.2016.18)
- [Pizzi and co-workers, provenance graphs for computational science](https://doi.org/10.1016/j.commatsci.2015.09.013)
- [Talirz and co-workers, Materials Cloud provenance and reuse](https://arxiv.org/abs/2003.12510)
- [RO-Crate 1.1 specification](https://www.researchobject.org/ro-crate/specification/1.1/introduction.html)
- [RFC 8493, the BagIt File Packaging Format](https://datatracker.ietf.org/doc/rfc8493/)
- [DataCite Metadata Schema](https://schema.datacite.org/)
