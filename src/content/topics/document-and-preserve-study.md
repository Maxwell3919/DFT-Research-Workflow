---
topic_slug: document-and-preserve-study
status: reviewed
---

A completed calculation tree is not yet a preserved study. Scratch directories contain transient files, failed attempts, machine-specific paths, and outputs whose relationship to a reported result may exist only in the researcher's memory.

Preservation turns that working history into an identifiable research object. Another researcher should be able to discover what was studied, recover the evidence behind a result, reconstruct the transformation from inputs to claims, and understand what cannot be redistributed or rerun.

The unit of preservation is the study and its lineage, not every byte ever written.

## Preserve a versioned research object

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

## Preserve the route from question to claim

Computational provenance is naturally represented as a graph. Data nodes describe structures, parameters, inputs, outputs, and derived products. Process nodes describe calculations, conversions, fits, and analyses. Directed edges identify what each process consumed and produced.

For every calculation branch, the record should answer:

- Which structure, composition, charge, spin state, boundary model, and reference states were used?
- Which code, version, build features, potentials or basis sets, and libraries defined the calculation?
- Which input and command produced each output, and in what execution environment?
- Which convergence and physical-consistency checks made the result eligible for analysis?
- Which versioned script, parameters, units, and intermediate values produced the reported observable?
- Which table, figure, or scientific claim uses that observable?

Record identifiers and checksums for external assets even when their contents cannot be redistributed. Licensed potentials, credentials, tokens, and private host details do not belong in a public package. Their omission should be explicit, with an acquisition route and compatibility metadata where permitted.

Automatic provenance capture can reduce omissions, but a live workflow database is not a durable research object unless it can be exported, versioned, restored, and interpreted independently. Manual calculations can also be preserved rigorously when their graph and identities are recorded.

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

## Test recovery, not only deposit

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
