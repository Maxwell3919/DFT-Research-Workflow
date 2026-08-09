#!/usr/bin/env python3
"""Prepare the exact public Silicon replay model and pseudopotential outside the repository."""
from __future__ import annotations

import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
from importlib.metadata import version
import json
from pathlib import Path, PurePosixPath
import re
import shutil
import tarfile
import tempfile
import urllib.request

import numpy as np
from pymatgen.io.cif import CifParser
import spglib


ROOT = Path(__file__).resolve().parent
REPOSITORY_ROOT = ROOT.parents[2].resolve()
SOURCE_CIF = ROOT / "source" / "silicon-cod-9013102.cif"
SANITIZATION = ROOT / "source" / "silicon-cod-9013102.sanitization.json"
SOURCE_SHA256 = "cd12420b831cd62227a36865179d12c5eece74e4a40e8d135abc981ced42ca55"
SANITIZATION_SHA256 = "033b32c6c583ae213d7bb995a73e67ff9cc4a02ad16456118638eb7994f172b2"
ARCHIVE_URL = "https://archive.materialscloud.org/records/rcyfm-68h65/files/SSSP_1.3.0_PBE_precision.tar.gz?download=1"
ARCHIVE_BYTES = 62_963_841
ARCHIVE_MD5 = "fde94756886f32ada7bf597547557eb5"
ARCHIVE_SHA256 = "d91db6b4b3788501d535a5b84ebabf3859ea3e3ac6ea154c4be3718da50f0c85"
ARCHIVE_MEMBER = "./Si.pbe-n-rrkjus_psl.1.0.0.UPF"
UPF_FILENAME = "Si.pbe-n-rrkjus_psl.1.0.0.UPF"
UPF_BYTES = 1_299_382
UPF_SHA256 = "ae3aefd0811f9499dbc4a72f1f9ae02ef4fc7f3568bf6f559b68668719c69e2b"
SYMPREC = 1.0e-5
EXACT_TOL = 5.0e-10
MAX_ARCHIVE_BYTES = 512 * 1024 * 1024
MAX_ARCHIVE_MEMBERS = 4096
MAX_EXPANDED_BYTES = 2 * 1024 * 1024 * 1024
DECLARED_MODEL_INPUTS = [
    ROOT / "input" / "scf.in",
    ROOT / "input" / "bands.in",
    ROOT / "input" / "dos-nscf.in",
    *sorted((ROOT / "input").glob("si_e*_k*.in")),
]


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(f"PRECONDITION FAILED: {message}")


def file_digest(path: Path, algorithm: str) -> str:
    digest = (
        hashlib.md5(usedforsecurity=False)
        if algorithm == "md5"
        else hashlib.sha256()
    )
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def write_json(path: Path, value: object) -> None:
    path.write_text(
        json.dumps(value, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def match_periodic_positions(
    actual: np.ndarray,
    expected: np.ndarray,
    tolerance: float,
) -> None:
    remaining = [point.copy() for point in expected]
    for point in actual:
        match = None
        for index, target in enumerate(remaining):
            delta = point - target
            delta -= np.rint(delta)
            if np.max(np.abs(delta)) <= tolerance:
                match = index
                break
        require(match is not None, f"unexpected periodic site {point.tolist()}")
        remaining.pop(match)
    require(not remaining, "one or more expected periodic sites are absent")


def parse_qe_geometry(path: Path) -> tuple[np.ndarray, list[str], np.ndarray]:
    lines = path.read_text(encoding="utf-8").splitlines()
    try:
        cell_index = next(
            index
            for index, line in enumerate(lines)
            if line.strip().lower() == "cell_parameters angstrom"
        )
        position_index = next(
            index
            for index, line in enumerate(lines)
            if line.strip().lower() == "atomic_positions crystal"
        )
    except StopIteration as error:
        raise SystemExit(
            f"PRECONDITION FAILED: {path.relative_to(ROOT)} lacks the declared QE geometry cards"
        ) from error
    cell = np.array(
        [[float(value) for value in lines[cell_index + row + 1].split()] for row in range(3)],
        dtype=float,
    )
    symbols: list[str] = []
    positions: list[list[float]] = []
    for row in range(2):
        fields = lines[position_index + row + 1].split()
        require(len(fields) >= 4, f"malformed atomic position in {path.relative_to(ROOT)}")
        symbols.append(fields[0])
        positions.append([float(value) for value in fields[1:4]])
    require(
        lines[position_index + 3].strip().startswith("K_POINTS"),
        f"{path.relative_to(ROOT)} does not contain exactly two declared model sites",
    )
    return cell, symbols, np.array(positions, dtype=float)


def build_model() -> tuple[bytes, dict[str, object]]:
    require(version("pymatgen-core") == "2026.7.31", "pymatgen-core 2026.7.31 is required")
    require(version("numpy") == "2.5.1", "numpy 2.5.1 is required")
    require(spglib.__version__ == "2.7.0", "spglib 2.7.0 is required")
    require(file_digest(SOURCE_CIF, "sha256") == SOURCE_SHA256, "public CIF SHA-256 mismatch")
    require(
        file_digest(SANITIZATION, "sha256") == SANITIZATION_SHA256,
        "CIF sanitization record SHA-256 mismatch",
    )
    sanitization = json.loads(SANITIZATION.read_text(encoding="utf-8"))
    require(sanitization["public_sha256"] == SOURCE_SHA256, "sanitization record does not bind this CIF")
    require(sanitization["replacement_count"] == 1, "unexpected CIF sanitization history")

    structures = CifParser(
        SOURCE_CIF,
        occupancy_tolerance=1.0,
    ).parse_structures(primitive=False, symmetrized=False, check_occu=True)
    require(len(structures) == 1, "the exact CIF must produce one conventional structure")
    structure = structures[0]
    require(structure.is_ordered, "partial occupancy or disorder is not accepted by this bridge")
    require(len(structure) == 8, "the exact conventional model must contain eight sites")
    require(
        all(site.specie.symbol == "Si" and abs(site.species.num_atoms - 1.0) <= EXACT_TOL for site in structure),
        "the exact conventional model must contain eight fully occupied Si sites",
    )
    require(
        np.allclose(structure.lattice.abc, [5.4304] * 3, rtol=0.0, atol=EXACT_TOL),
        "conventional cell lengths differ from 5.4304 Angstrom",
    )
    require(
        np.allclose(structure.lattice.angles, [90.0] * 3, rtol=0.0, atol=EXACT_TOL),
        "conventional cell angles differ from 90 degrees",
    )

    expected_conventional = np.array(
        [
            [0.00, 0.00, 0.00],
            [0.00, 0.50, 0.50],
            [0.50, 0.00, 0.50],
            [0.50, 0.50, 0.00],
            [0.75, 0.75, 0.25],
            [0.75, 0.25, 0.75],
            [0.25, 0.75, 0.75],
            [0.25, 0.25, 0.25],
        ],
        dtype=float,
    )
    match_periodic_positions(
        np.mod(np.array(structure.frac_coords, dtype=float), 1.0),
        expected_conventional,
        EXACT_TOL,
    )

    conventional_lattice = np.array(structure.lattice.matrix, dtype=float)
    atomic_numbers = np.array([site.specie.Z for site in structure], dtype=int)
    spglib_cell = (
        conventional_lattice,
        np.mod(np.array(structure.frac_coords, dtype=float), 1.0),
        atomic_numbers,
    )
    dataset = spglib.get_symmetry_dataset(
        spglib_cell,
        symprec=SYMPREC,
        angle_tolerance=-1.0,
    )
    require(dataset is not None, "spglib did not identify the exact source structure")
    require(int(dataset.number) == 227, "spglib space-group number is not 227")
    require(str(dataset.international) == "Fd-3m", "spglib international symbol is not Fd-3m")
    standardized = spglib.standardize_cell(
        spglib_cell,
        to_primitive=True,
        no_idealize=False,
        symprec=SYMPREC,
        angle_tolerance=-1.0,
    )
    require(standardized is not None, "spglib did not produce a primitive-cell check")
    standard_lattice, standard_positions, standard_types = standardized
    require(len(standard_positions) == 2, "spglib primitive check did not contain two sites")
    require(set(int(value) for value in standard_types) == {14}, "spglib primitive check is not all Si")
    volume_ratio = abs(np.linalg.det(conventional_lattice)) / abs(np.linalg.det(standard_lattice))
    require(abs(volume_ratio - 4.0) <= EXACT_TOL, "conventional-to-primitive volume ratio is not four")

    cf_transform = np.array(
        [
            [0.0, 0.5, 0.5],
            [0.5, 0.0, 0.5],
            [0.5, 0.5, 0.0],
        ],
        dtype=float,
    )
    require(abs(abs(np.linalg.det(cf_transform)) - 0.25) <= EXACT_TOL, "invalid cF primitive transform")
    primitive_lattice = cf_transform @ conventional_lattice
    expected_lattice = np.array(
        [
            [0.0, 2.7152, 2.7152],
            [2.7152, 0.0, 2.7152],
            [2.7152, 2.7152, 0.0],
        ],
        dtype=float,
    )
    require(
        np.allclose(primitive_lattice, expected_lattice, rtol=0.0, atol=EXACT_TOL),
        "case-specific primitive lattice does not match the declared QE model",
    )
    mapped = np.mod(
        np.array(structure.cart_coords, dtype=float) @ np.linalg.inv(primitive_lattice),
        1.0,
    )
    canonical_positions = np.array([[0.0, 0.0, 0.0], [0.25, 0.25, 0.25]], dtype=float)
    counts = Counter()
    for point in mapped:
        matched = None
        for index, target in enumerate(canonical_positions):
            delta = point - target
            delta -= np.rint(delta)
            if np.max(np.abs(delta)) <= EXACT_TOL:
                matched = index
                break
        require(matched is not None, f"conventional site does not map to the declared primitive model: {point.tolist()}")
        counts[matched] += 1
    require(counts == Counter({0: 4, 1: 4}), "primitive site multiplicities are not four and four")

    validated_inputs = []
    for path in DECLARED_MODEL_INPUTS:
        cell, symbols, positions = parse_qe_geometry(path)
        require(symbols == ["Si", "Si"], f"unexpected symbols in {path.relative_to(ROOT)}")
        require(
            np.allclose(cell, expected_lattice, rtol=0.0, atol=EXACT_TOL),
            f"cell mismatch in {path.relative_to(ROOT)}",
        )
        require(
            np.allclose(positions, canonical_positions, rtol=0.0, atol=EXACT_TOL),
            f"position mismatch in {path.relative_to(ROOT)}",
        )
        validated_inputs.append(str(path.relative_to(ROOT)))

    fragment = (
        "! Symmetry-idealized primitive representation of exact COD 9013102 public bytes.\n"
        "! Selection status: NOT_RANKED. This is not relaxation or stability evidence.\n"
        "CELL_PARAMETERS angstrom\n"
        "0.0000000000 2.7152000000 2.7152000000\n"
        "2.7152000000 0.0000000000 2.7152000000\n"
        "2.7152000000 2.7152000000 0.0000000000\n"
        "ATOMIC_POSITIONS crystal\n"
        "Si 0.0000000000 0.0000000000 0.0000000000\n"
        "Si 0.2500000000 0.2500000000 0.2500000000\n"
    ).encode("ascii")
    receipt = {
        "schema_version": 1,
        "source": {
            "record": "COD 9013102",
            "path": str(SOURCE_CIF.relative_to(ROOT)),
            "sha256": SOURCE_SHA256,
            "conventional_formula": "Si8",
            "conventional_a_angstrom": 5.4304,
        },
        "transformation": {
            "pymatgen_core": version("pymatgen-core"),
            "numpy": version("numpy"),
            "spglib": spglib.__version__,
            "symprec": SYMPREC,
            "source_space_group_number": 227,
            "source_space_group_symbol": "Fd-3m",
            "primitive_basis": "case-specific cF transform [[0,1/2,1/2],[1/2,0,1/2],[1/2,1/2,0]]",
            "conventional_to_primitive_volume_ratio": volume_ratio,
            "conventional_site_multiplicities": [counts[0], counts[1]],
        },
        "model": {
            "formula": "Si2",
            "selection_status": "NOT_RANKED",
            "cell_angstrom": expected_lattice.tolist(),
            "fractional_positions": canonical_positions.tolist(),
            "qe_geometry_sha256": hashlib.sha256(fragment).hexdigest(),
            "validated_case_inputs": validated_inputs,
        },
        "claim_boundary": (
            "The exact source bytes, pinned parser versions, symmetry recognition, case-specific "
            "primitive transform, and declared QE geometry agree within their stated tolerances. "
            "This does not rank configurations, prove physical equivalence outside that bounded "
            "representation transform, relax the model, establish stability, or derive any "
            "pseudopotential, cutoff, k mesh, occupation, or SCF choice from the CIF."
        ),
    }
    return fragment, receipt


def safe_member_name(name: str) -> str:
    require("\x00" not in name, "archive member contains a NUL byte")
    require(not name.startswith(("/", "\\")), f"archive member is absolute: {name}")
    require(not re.match(r"^[A-Za-z]:", name), f"archive member has a drive prefix: {name}")
    parts = [part for part in PurePosixPath(name).parts if part not in ("", ".")]
    require(".." not in parts, f"archive member traverses a parent: {name}")
    return "/".join(parts)


def download_archive(path: Path) -> str:
    request = urllib.request.Request(
        ARCHIVE_URL,
        headers={"User-Agent": "DFT-Research-Workflow/1.0 exact-case-preparation"},
    )
    try:
        with urllib.request.urlopen(request, timeout=120) as response, path.open("xb") as output:
            content_length = response.headers.get("Content-Length")
            if content_length is not None:
                require(int(content_length) <= MAX_ARCHIVE_BYTES, "archive response is too large")
            total = 0
            while True:
                chunk = response.read(1024 * 1024)
                if not chunk:
                    break
                total += len(chunk)
                require(total <= MAX_ARCHIVE_BYTES, "archive download exceeded the size limit")
                output.write(chunk)
            return response.geturl()
    except (OSError, urllib.error.URLError) as error:
        raise SystemExit(f"PRECONDITION FAILED: archive download failed: {error}") from error


def read_pseudopotential(archive_path: Path) -> tuple[bytes, dict[str, object]]:
    require(archive_path.is_file(), f"archive not found: {archive_path}")
    require(archive_path.stat().st_size == ARCHIVE_BYTES, "Materials Cloud archive byte count mismatch")
    with archive_path.open("rb") as handle:
        require(handle.read(2) == b"\x1f\x8b", "archive is not gzip data")
    archive_sha256 = file_digest(archive_path, "sha256")
    require(archive_sha256 == ARCHIVE_SHA256, "Materials Cloud archive SHA-256 mismatch")
    archive_md5 = file_digest(archive_path, "md5")
    require(archive_md5 == ARCHIVE_MD5, "publisher-listed Materials Cloud archive MD5 mismatch")
    try:
        with tarfile.open(archive_path, "r:gz") as archive:
            members = archive.getmembers()
            require(len(members) <= MAX_ARCHIVE_MEMBERS, "archive contains too many members")
            require(
                sum(member.size for member in members if member.isreg()) <= MAX_EXPANDED_BYTES,
                "archive expanded size exceeds the limit",
            )
            normalized: set[str] = set()
            normalized_casefold: set[str] = set()
            for member in members:
                name = safe_member_name(member.name)
                if member.isdir():
                    continue
                require(member.isreg(), f"archive contains a non-regular member: {member.name}")
                require(name not in normalized, f"archive contains a duplicate path: {name}")
                require(name.casefold() not in normalized_casefold, f"archive contains a case-fold path collision: {name}")
                normalized.add(name)
                normalized_casefold.add(name.casefold())
            selected = [member for member in members if member.name == ARCHIVE_MEMBER]
            require(len(selected) == 1, f"archive must contain exactly one {ARCHIVE_MEMBER} member")
            member = selected[0]
            require(member.isreg() and member.size == UPF_BYTES, "UPF archive member size mismatch")
            handle = archive.extractfile(member)
            require(handle is not None, "UPF archive member cannot be read")
            payload = handle.read(UPF_BYTES + 1)
    except (OSError, tarfile.TarError) as error:
        raise SystemExit(f"PRECONDITION FAILED: archive inspection failed: {error}") from error
    require(len(payload) == UPF_BYTES, "extracted UPF byte count mismatch")
    require(hashlib.sha256(payload).hexdigest() == UPF_SHA256, "extracted UPF SHA-256 mismatch")
    return payload, {
        "archive_url": ARCHIVE_URL,
        "archive_bytes": ARCHIVE_BYTES,
        "archive_sha256": archive_sha256,
        "archive_md5": archive_md5,
        "archive_md5_role": "publisher-listed cross-check; archive SHA-256 is the fail-closed identity",
        "member": ARCHIVE_MEMBER,
        "member_bytes": len(payload),
        "member_sha256": UPF_SHA256,
    }


def publish(
    output_dir: Path,
    fragment: bytes,
    model_receipt: dict[str, object],
    pseudopotential: bytes,
    pseudo_receipt: dict[str, object],
) -> None:
    output = output_dir.expanduser().resolve()
    require(output != REPOSITORY_ROOT and REPOSITORY_ROOT not in output.parents, "output directory must be outside the repository")
    require(not output.exists(), f"refusing to overwrite existing output directory: {output}")
    model_dir = output / "model"
    pseudo_dir = output / "pseudo"
    model_dir.mkdir(parents=True)
    pseudo_dir.mkdir()
    (model_dir / "si-primitive-qe.inc").write_bytes(fragment)
    write_json(model_dir / "model-provenance.json", model_receipt)
    (pseudo_dir / UPF_FILENAME).write_bytes(pseudopotential)
    write_json(pseudo_dir / "pseudopotential-provenance.json", pseudo_receipt)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Build the exact declared Silicon primitive QE model and acquire its exact-hash SSSP archive member.",
    )
    parser.add_argument("--output-dir", required=True, type=Path)
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--download-pseudopotential", action="store_true")
    source.add_argument("--archive", type=Path, help="Use an already downloaded SSSP_1.3.0_PBE_precision.tar.gz")
    args = parser.parse_args()

    fragment, model_receipt = build_model()
    with tempfile.TemporaryDirectory(prefix="drw-silicon-prepare-") as temporary:
        if args.download_pseudopotential:
            archive_path = Path(temporary) / "SSSP_1.3.0_PBE_precision.tar.gz"
            resolved_url = download_archive(archive_path)
        else:
            archive_path = args.archive.expanduser().resolve()
            resolved_url = None
        payload, pseudo_receipt = read_pseudopotential(archive_path)
        pseudo_receipt.update(
            {
                "schema_version": 1,
                "resolved_url": resolved_url,
                "prepared_at": datetime.now(timezone.utc).isoformat(),
                "identity_status": "HASH_MATCHED_PINNED_ARCHIVE_MEMBER",
                "claim_boundary": (
                    "The archive byte count and SHA-256 bind the downloaded payload; the "
                    "publisher-listed MD5 is an independent cross-check. The exact member path, "
                    "byte count, and SHA-256 bind the extracted UPF to this recorded case. These "
                    "checks do not establish pseudopotential transferability, numerical "
                    "convergence, or scientific suitability."
                ),
            }
        )
        publish(args.output_dir, fragment, model_receipt, payload, pseudo_receipt)

    output = args.output_dir.expanduser().resolve()
    print(
        json.dumps(
            {
                "status": "PASS",
                "model": str(output / "model" / "si-primitive-qe.inc"),
                "model_selection_status": "NOT_RANKED",
                "pseudopotential": str(output / "pseudo" / UPF_FILENAME),
                "pseudopotential_sha256": UPF_SHA256,
                "next": f"PSEUDO_DIR={output / 'pseudo'} RUNTIME_DIR=/absolute/new/runtime bash {ROOT / 'run.sh'}",
            },
            indent=2,
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    main()
