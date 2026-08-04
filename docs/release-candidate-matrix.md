# Terminal-first release candidate matrix

This matrix defines the bounded acceptance target for the terminal-first
release candidate. It does not redefine the A–E topic registry, prescribe one
universal scientific sequence, or turn a teaching case into a material claim.

## Shared case contract

Every case under `examples/cases/<case-id>/` must contain:

```text
README.md
environment.txt
source/
input/
output/
run.sh
check.sh
extract.sh
parse.py
derived/
figures/
manifest.json
```

`manifest.json` must validate against `workflow/case-schema.json`. Commands,
output excerpts, tables, and figures shown on the site must be generated from
or hash-bound to this directory. Host-private raw, restart, wavefunction, and
licensed potential payloads remain outside the public repository.

## Release matrix

| Area | Required release-candidate evidence | Initial bounded target | Claim ceiling |
| --- | --- | --- | --- |
| Information architecture | Framework removed from primary navigation; useful Framework prose migrated; `/framework/*` remains a migration surface; `/workflows/` is primary and `/recipes/*` redirects | Silicon and Aluminium worked workflows | Route/build success is software evidence only |
| Database retrieval | Per-service access matrix plus hash-bound tested downloads and explicit unsupported/unverified methods | Open COD, NOMAD or OPTIMADE routes first; Materials Project only with a safely configured key | Retrieval does not validate structure quality or a calculation |
| Structure operations | Executed scripts, stdout, before/after structures and metrics | Read/inspect, conversion, symmetry/tolerance, standardization, supercell, 2D vacuum, slab/adsorbate and reciprocal path | Geometry transformation does not establish physical stability |
| Silicon | Continuous source → structure → QE input/output → checks → parsed data → figures chain | Ground-state/electronic path assembled from existing real evidence without fabricating missing raw data | G1/G2 do not imply all-observable G4 or G5 |
| Aluminium | Metallic occupations, SCF/NSCF, DOS/full-zone and bounded convergence evidence | Continuous metallic electronic-structure workflow assembled from existing and newly bounded execution | One smearing or mesh does not establish metallic convergence |
| Polar response | Real MgO or GaAs entry if low-cost open inputs and bounded execution are available | SCF plus response input/output or an explicit verified blocker | No LO–TO or dielectric conclusion without matching response and convergence evidence |
| Graphene | Real 2D input and at least one bounded execution plus vacuum-series entry or blocker | Vacuum, `kz=1`, 2D sampling and band-path evidence | One vacuum or path does not establish convergence or a material conclusion |
| Magnetism | Real bcc Fe spin-polarized entry and bounded candidate comparison or blocker | FM and NM candidates when resource-safe | One FM run does not prove a magnetic ground state |
| Surface/adsorption | Real slab construction and executable input; energy comparison only when references are complete | Al(111) slab and one simple adsorbate construction | Construction or one site does not establish preferred adsorption |
| Headless GUI | Reproducible isolated display validation and original screenshots | Xvfb/Mesa/browser; VESTA only if installed and stable under the verified display route | A screenshot proves display only |
| Validation | Case syntax, checks, parsers, hashes, figures, manifests, local build, browser, hosted CI, exact-SHA Pages | All required gates fresh at final candidate | Software validation is separate from numerical and scientific acceptance |

## G0–G5 reporting

- G0: required files exist, are non-empty where applicable, and declared hashes match.
- G1: the declared program execution ended normally.
- G2: the solver or optimizer reached its declared software threshold.
- G3: artifacts required by the next declared stage are complete.
- G4: the named observable meets a declared numerical-convergence protocol.
- G5: the bounded physical consistency or scientific conclusion is supported.

Every case reports all six gates. Untested gates remain `NOT TESTED`; unsupported
scientific conclusions remain `NOT CLAIMED`. A failed required gate returns a
nonzero exit status from `check.sh`.
