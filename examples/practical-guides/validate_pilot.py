from __future__ import annotations

import importlib.util
import json
import os
from importlib.metadata import version
from pathlib import Path
from types import ModuleType

ROOT = Path(__file__).resolve().parents[2]
EXAMPLE_DIR = Path(__file__).resolve().parent
EXPECTED_VERSIONS = {
    "ase": "3.29.0",
    "pymatgen-core": "2026.7.31",
}
SCRIPTS = [
    "ase_repeat_cells.py",
    "ase_surface_vacuum_adsorbates.py",
    "pymatgen_structure_transformations.py",
    "ase_monolayer_model.py",
]


def load_module(path: Path) -> ModuleType:
    spec = importlib.util.spec_from_file_location(path.stem, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> None:
    observed_versions = {name: version(name) for name in EXPECTED_VERSIONS}
    assert observed_versions == EXPECTED_VERSIONS, (
        f"Pinned practical-guide versions changed: {observed_versions}"
    )

    results: dict[str, object] = {}
    for script_name in SCRIPTS:
        path = EXAMPLE_DIR / script_name
        module = load_module(path)
        if not hasattr(module, "run"):
            raise RuntimeError(f"{path} does not define run()")
        results[path.stem] = module.run()

    report = {
        "schema_version": 1,
        "project_root": str(ROOT),
        "versions": observed_versions,
        "executed_scripts": SCRIPTS,
        "results": results,
        "evidence_boundary": (
            "Execution establishes the declared structural transformations only; "
            "it does not establish numerical convergence, energetic stability, "
            "transferability, or a scientific conclusion."
        ),
    }

    artifact_dir = os.environ.get("PRACTICAL_EXECUTION_ARTIFACT_DIR")
    if artifact_dir:
        output_dir = Path(artifact_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        (output_dir / "practical-guide-execution.json").write_text(
            json.dumps(report, indent=2) + "\n", encoding="utf-8"
        )

    print(json.dumps(report, indent=2))
    print("Practical guide execution passed: 4/4 structural examples with pinned versions.")


if __name__ == "__main__":
    main()
