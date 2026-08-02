# Website architecture

## Purpose

The site teaches the reasoning structure of a reliable DFT project. It does not
encode a production workflow engine, prescribe one universal protocol, or treat
software completion as scientific acceptance.

## Information architecture

```text
Home
├── Workflow map
│   ├── 1. Frame the question
│   ├── 2. Establish the structure
│   ├── 3. Design the protocol
│   ├── 4. Converge the numerics
│   ├── 5. Execute on HPC
│   ├── 6. Follow a property branch
│   ├── 7. Validate the result
│   └── 8. Preserve and communicate
├── Property branches
│   ├── Structures & energetics
│   ├── Electronic states
│   ├── Vibrations & response
│   ├── Charge & bonding
│   └── Magnetism & topology
├── Evidence gates
└── Operation registry
```

The eight stages are the teaching sequence. The operation registry is the
coverage authority: thirty-five operations are grouped beneath stages instead
of becoming thirty-five equal navigation pages.

## Static chain

`src/data/operations.json` and `src/data/stages.json` provide the structural
model. Astro pages render that model into static HTML. A small progressive-
enhancement script filters the workflow map; all operations remain visible and
understandable without JavaScript.

No production DFT executable, scheduler, backend, database, credential, or real
calculation workspace is connected to the website.

## Evidence boundary

Repository validators establish schema consistency, route integrity, TypeScript
correctness, and buildability. They cannot establish that a calculation
protocol is converged, a physical interpretation is correct, or a scientific
claim is accepted.
