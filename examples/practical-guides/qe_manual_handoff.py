#!/usr/bin/env python3
"""Deterministic, local handoffs for the manual Quantum ESPRESSO guides.

The commands in this module never launch Quantum ESPRESSO.  They transform or
audit files produced by an explicitly documented run.  The default self-test
uses manifest-bound public silicon artifacts as parser fixtures and writes only
to a temporary directory.
"""

from __future__ import annotations

import argparse
import csv
import gzip
import hashlib
import html
import json
import math
import re
import shutil
import subprocess
import tarfile
import tempfile
from pathlib import Path
from typing import Iterable


SCRIPT = Path(__file__).resolve()
REPO_ROOT = SCRIPT.parents[2]
SILICON_FIXTURES = {
    "scf.in": "examples/cases/silicon-ground-state-electronic-structure/input/scf.in",
    "si-relax.out": "examples/cases/silicon-ground-state-electronic-structure/output/si-relax.out",
    "scf-main.out": "examples/cases/silicon-ground-state-electronic-structure/output/scf-main.out",
    "si.bands.dat": "examples/cases/silicon-ground-state-electronic-structure/output/si.bands.dat",
    "si.dos.dat": "examples/cases/silicon-ground-state-electronic-structure/output/si.dos.dat",
}


class HandoffError(RuntimeError):
    pass


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def write_json(path: Path, value: object) -> None:
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def require_new_directory(path: Path) -> None:
    if path.exists():
        raise HandoffError(f"refusing to reuse an existing output directory: {path}")
    path.mkdir(parents=True)


def parse_nat(text: str) -> int:
    matches = re.findall(r"(?im)^\s*nat\s*=\s*(\d+)", text)
    if len(matches) != 1:
        raise HandoffError("the SCF template must declare exactly one nat value")
    return int(matches[0])


def last_final_coordinates(relax_text: str, nat: int) -> tuple[str, list[str]]:
    blocks = list(
        re.finditer(
            r"(?ims)^\s*Begin final coordinates\s*$"
            r"(.*?)"
            r"^\s*End final coordinates\s*$",
            relax_text,
        )
    )
    if not blocks:
        raise HandoffError("no complete Begin/End final coordinates block was found")

    body = blocks[-1].group(1)
    lines = body.splitlines()
    card_indexes = [
        index for index, line in enumerate(lines)
        if re.match(r"^\s*ATOMIC_POSITIONS(?:\s|\()", line, re.I)
    ]
    if len(card_indexes) != 1:
        raise HandoffError("the last final-coordinate block must contain one ATOMIC_POSITIONS card")
    card_index = card_indexes[0]
    card = lines[card_index].strip()
    coordinates: list[str] = []
    for line in lines[card_index + 1 :]:
        stripped = line.strip()
        if not stripped:
            continue
        if re.match(r"^[A-Z_]+(?:\s|\(|$)", stripped):
            break
        fields = stripped.split()
        if len(fields) < 4:
            raise HandoffError(f"malformed coordinate row: {stripped}")
        for token in fields[1:4]:
            float(token)
        coordinates.append(" ".join(fields))
        if len(coordinates) == nat:
            break
    if len(coordinates) != nat:
        raise HandoffError(f"expected {nat} coordinate rows, found {len(coordinates)}")
    return card, coordinates


def replace_positions(template_text: str, nat: int, card: str, coordinates: list[str]) -> str:
    lines = template_text.splitlines()
    indexes = [
        index for index, line in enumerate(lines)
        if re.match(r"^\s*ATOMIC_POSITIONS(?:\s|\()", line, re.I)
    ]
    if len(indexes) != 1:
        raise HandoffError("the SCF template must contain exactly one ATOMIC_POSITIONS card")
    start = indexes[0]
    stop = start + 1
    old_rows = 0
    while stop < len(lines) and old_rows < nat:
        stripped = lines[stop].strip()
        if stripped and re.match(r"^[A-Z_]+(?:\s|\(|$)", stripped):
            break
        if stripped:
            fields = stripped.split()
            if len(fields) < 4:
                break
            try:
                for token in fields[1:4]:
                    float(token)
            except ValueError:
                break
            old_rows += 1
        stop += 1
    if old_rows != nat:
        raise HandoffError(f"the SCF template position card contains {old_rows} rows, expected {nat}")
    new_lines = lines[:start] + [card, *coordinates] + lines[stop:]
    return "\n".join(new_lines) + "\n"


def prepare_reference(relax_output: Path, scf_template: Path, output_dir: Path) -> dict[str, object]:
    relax_output = relax_output.resolve()
    scf_template = scf_template.resolve()
    if not relax_output.is_file() or not scf_template.is_file():
        raise HandoffError("relax output and SCF template must both be existing files")
    require_new_directory(output_dir)
    template_text = scf_template.read_text(encoding="utf-8", errors="strict")
    nat = parse_nat(template_text)
    card, coordinates = last_final_coordinates(
        relax_output.read_text(encoding="utf-8", errors="replace"), nat
    )
    geometry_path = output_dir / "accepted-geometry.inc"
    static_input = output_dir / "static-scf.in"
    geometry_path.write_text("\n".join([card, *coordinates]) + "\n", encoding="utf-8")
    static_input.write_text(
        replace_positions(template_text, nat, card, coordinates), encoding="utf-8"
    )
    report: dict[str, object] = {
        "status": "PREPARED",
        "source_relax_output": str(relax_output),
        "source_relax_output_sha256": sha256(relax_output),
        "source_scf_template": str(scf_template),
        "source_scf_template_sha256": sha256(scf_template),
        "selected_coordinate_block": "last complete Begin/End final coordinates block",
        "nat": nat,
        "accepted_geometry": geometry_path.name,
        "accepted_geometry_sha256": sha256(geometry_path),
        "static_scf_input": static_input.name,
        "static_scf_input_sha256": sha256(static_input),
        "boundary": (
            "This records a new file handoff. It does not by itself establish ionic "
            "convergence, scientific acceptance, or ancestry of any historical static run."
        ),
    }
    write_json(output_dir / "geometry-handoff.json", report)
    return report


def audit_scf(input_path: Path, stdout_path: Path, stderr_path: Path, report_path: Path) -> dict[str, object]:
    for path in (input_path, stdout_path, stderr_path):
        if not path.is_file():
            raise HandoffError(f"missing required run artifact: {path}")
    input_text = input_path.read_text(encoding="utf-8", errors="replace")
    stdout = stdout_path.read_text(encoding="utf-8", errors="replace")
    stderr = stderr_path.read_text(encoding="utf-8", errors="replace")
    if not re.search(r"(?im)^\s*calculation\s*=\s*['\"]scf['\"]", input_text):
        raise HandoffError("input does not declare calculation='scf'")
    termination_count = stdout.count("JOB DONE")
    scf_count = len(re.findall(r"convergence has been achieved", stdout, re.I))
    fatal_patterns = [
        r"(?im)^\s*Error in routine",
        r"(?im)^\s*%%%%%%%%",
        r"(?im)stopping\s+\.\.\.",
    ]
    fatal = sorted({match.group(0).strip() for pattern in fatal_patterns for match in re.finditer(pattern, stdout)})
    energies = re.findall(
        r"(?im)^\s*!\s+total energy\s*=\s*([-+0-9.eEdD]+)\s+Ry", stdout
    )
    passed = termination_count == 1 and scf_count >= 1 and not fatal
    report: dict[str, object] = {
        "status": "PASS" if passed else "FAIL",
        "input": str(input_path.resolve()),
        "input_sha256": sha256(input_path),
        "stdout": str(stdout_path.resolve()),
        "stdout_sha256": sha256(stdout_path),
        "stderr": str(stderr_path.resolve()),
        "stderr_sha256": sha256(stderr_path),
        "stderr_bytes": len(stderr.encode("utf-8")),
        "job_done_count": termination_count,
        "electronic_convergence_marker_count": scf_count,
        "fatal_output_markers": fatal,
        "last_total_energy_ry": float(energies[-1].replace("D", "E").replace("d", "e")) if energies else None,
        "boundary": (
            "PASS means this pw.x process reached one normal termination marker and reported "
            "electronic SCF convergence. It does not establish geometry acceptance, cutoff or "
            "k-point convergence, observable convergence, model validity, or a scientific claim."
        ),
    }
    report_path.parent.mkdir(parents=True, exist_ok=True)
    write_json(report_path, report)
    if not passed:
        raise HandoffError(f"SCF audit failed; inspect {report_path}")
    return report


def parse_convergence_outputs(runtime_dir: Path) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    for path in sorted(runtime_dir.rglob("si_e*_k*.out")):
        match = re.search(r"si_e(\d+)_k(\d+)\.out$", path.name)
        if not match:
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        energies = re.findall(
            r"(?im)^\s*!\s+total energy\s*=\s*([-+0-9.eEdD]+)\s+Ry", text
        )
        if not energies:
            raise HandoffError(f"no total energy found in {path}")
        rows.append(
            {
                "cutoff_ry": int(match.group(1)),
                "k_mesh": int(match.group(2)),
                "total_energy_ry": float(energies[-1].replace("D", "E").replace("d", "e")),
                "job_done": int(text.count("JOB DONE") == 1),
                "scf_marker": int(bool(re.search(r"convergence has been achieved", text, re.I))),
                "source": path.relative_to(runtime_dir).as_posix(),
                "sha256": sha256(path),
            }
        )
    return rows


def parse_bands(path: Path) -> list[dict[str, object]]:
    text = path.read_text(encoding="utf-8", errors="replace")
    header = re.search(r"nbnd\s*=\s*(\d+)\s*,\s*nks\s*=\s*(\d+)", text, re.I)
    if not header:
        raise HandoffError(f"cannot read nbnd/nks from bands.x data: {path}")
    nbnd, nks = int(header.group(1)), int(header.group(2))
    tokens = [float(token.replace("D", "E").replace("d", "e")) for token in re.findall(
        r"[-+]?(?:\d+\.\d*|\.\d+|\d+)(?:[EeDd][-+]?\d+)?", text[header.end():]
    )]
    expected = nks * (3 + nbnd)
    if len(tokens) != expected:
        raise HandoffError(f"bands.x data has {len(tokens)} values after header, expected {expected}")
    rows: list[dict[str, object]] = []
    offset = 0
    distance = 0.0
    previous: tuple[float, float, float] | None = None
    for k_index in range(nks):
        k = tuple(tokens[offset : offset + 3])
        values = tokens[offset + 3 : offset + 3 + nbnd]
        offset += 3 + nbnd
        if previous is not None:
            distance += math.sqrt(sum((a - b) ** 2 for a, b in zip(k, previous)))
        previous = k
        for band_index, energy in enumerate(values, start=1):
            rows.append(
                {
                    "k_index": k_index + 1,
                    "k_distance": distance,
                    "kx": k[0],
                    "ky": k[1],
                    "kz": k[2],
                    "band_index": band_index,
                    "energy_ev": energy,
                }
            )
    return rows


def parse_dos(path: Path) -> list[dict[str, float]]:
    rows: list[dict[str, float]] = []
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        fields = stripped.split()
        if len(fields) < 3:
            continue
        try:
            energy, dos, integrated = map(float, fields[:3])
        except ValueError:
            continue
        rows.append({"energy_ev": energy, "dos_states_per_ev": dos, "integrated_dos": integrated})
    if not rows:
        raise HandoffError(f"no numeric DOS rows found in {path}")
    return rows


def write_csv(path: Path, rows: list[dict[str, object]]) -> None:
    if not rows:
        raise HandoffError(f"refusing to write an empty CSV: {path}")
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)


def svg_document(title: str, paths: Iterable[str], x_label: str, y_label: str) -> str:
    path_markup = "\n".join(paths)
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" '
        'viewBox="0 0 900 560" role="img" aria-labelledby="title desc">\n'
        f'<title id="title">{html.escape(title)}</title>\n'
        '<desc id="desc">A generated plot from explicitly supplied runtime data.</desc>\n'
        '<rect width="900" height="560" fill="white"/>\n'
        '<g stroke="#222" stroke-width="1.5" fill="none"><path d="M90 30 V480 H870"/></g>\n'
        f'{path_markup}\n'
        '<g fill="#111" font-family="Georgia, serif" font-size="18">\n'
        f'<text x="450" y="535" text-anchor="middle">{html.escape(x_label)}</text>\n'
        f'<text x="22" y="255" text-anchor="middle" transform="rotate(-90 22 255)">{html.escape(y_label)}</text>\n'
        f'<text x="90" y="22" font-size="20">{html.escape(title)}</text>\n'
        '</g>\n</svg>\n'
    )


def scale(value: float, minimum: float, maximum: float, low: float, high: float) -> float:
    if maximum == minimum:
        return (low + high) / 2
    return low + (value - minimum) * (high - low) / (maximum - minimum)


def convergence_svg(rows: list[dict[str, object]]) -> str:
    xs = [float(row["cutoff_ry"]) for row in rows]
    ys = [float(row["total_energy_ry"]) for row in rows]
    colors = ["#006d77", "#bb3e03", "#3a5a40", "#7f5539", "#5e548e"]
    paths: list[str] = []
    for index, mesh in enumerate(sorted({int(row["k_mesh"]) for row in rows})):
        subset = sorted((row for row in rows if int(row["k_mesh"]) == mesh), key=lambda row: int(row["cutoff_ry"]))
        points = " ".join(
            f'{scale(float(row["cutoff_ry"]), min(xs), max(xs), 90, 870):.2f},'
            f'{scale(float(row["total_energy_ry"]), min(ys), max(ys), 480, 40):.2f}'
            for row in subset
        )
        paths.append(
            f'<polyline points="{points}" fill="none" stroke="{colors[index % len(colors)]}" '
            f'stroke-width="2"><title>k mesh {mesh}</title></polyline>'
        )
    return svg_document("Fresh runtime convergence energies", paths, "Plane-wave cutoff (Ry)", "Total energy (Ry)")


def bands_svg(rows: list[dict[str, object]]) -> str:
    xs = [float(row["k_distance"]) for row in rows]
    ys = [float(row["energy_ev"]) for row in rows]
    paths: list[str] = []
    for band in sorted({int(row["band_index"]) for row in rows}):
        subset = [row for row in rows if int(row["band_index"]) == band]
        points = " ".join(
            f'{scale(float(row["k_distance"]), min(xs), max(xs), 90, 870):.2f},'
            f'{scale(float(row["energy_ev"]), min(ys), max(ys), 480, 40):.2f}'
            for row in subset
        )
        paths.append(f'<polyline points="{points}" fill="none" stroke="#264653" stroke-width="1"/>')
    return svg_document("Fresh bands.x data", paths, "Cumulative path coordinate", "Eigenvalue (eV)")


def dos_svg(rows: list[dict[str, float]]) -> str:
    xs = [row["energy_ev"] for row in rows]
    ys = [row["dos_states_per_ev"] for row in rows]
    points = " ".join(
        f'{scale(row["energy_ev"], min(xs), max(xs), 90, 870):.2f},'
        f'{scale(row["dos_states_per_ev"], min(ys), max(ys), 480, 40):.2f}'
        for row in rows
    )
    return svg_document(
        "Fresh dos.x data",
        [f'<polyline points="{points}" fill="none" stroke="#9b2226" stroke-width="2"/>'],
        "Energy (eV)",
        "DOS (states/eV)",
    )


def extract_runtime(runtime_dir: Path, output_dir: Path, bands_data: Path | None, dos_data: Path | None) -> dict[str, object]:
    runtime_dir = runtime_dir.resolve()
    if not runtime_dir.is_dir():
        raise HandoffError(f"runtime directory does not exist: {runtime_dir}")
    require_new_directory(output_dir)
    convergence = parse_convergence_outputs(runtime_dir)

    if bands_data is None:
        candidates = sorted(runtime_dir.rglob("*.bands.dat"))
        bands_data = candidates[0] if len(candidates) == 1 else None
    if dos_data is None:
        candidates = sorted(runtime_dir.rglob("*.dos.dat"))
        dos_data = candidates[0] if len(candidates) == 1 else None

    products: list[str] = []
    source_hashes: dict[str, str] = {}
    if convergence:
        write_csv(output_dir / "convergence.csv", convergence)
        (output_dir / "convergence.svg").write_text(convergence_svg(convergence), encoding="utf-8")
        products.extend(["convergence.csv", "convergence.svg"])
        source_hashes.update({str(row["source"]): str(row["sha256"]) for row in convergence})

    report: dict[str, object] = {
        "status": "PARSED",
        "runtime_dir": ".",
        "convergence_runs": len(convergence),
        "products": products,
        "source_hashes": source_hashes,
        "boundary": (
            "These files reconstruct supplied runtime data. They do not set an acceptance "
            "tolerance, establish observable convergence, or support a scientific claim."
        ),
    }
    if bands_data is not None:
        bands_data = bands_data.resolve()
        bands = parse_bands(bands_data)
        write_csv(output_dir / "bands.csv", bands)
        (output_dir / "bands.svg").write_text(bands_svg(bands), encoding="utf-8")
        report["products"].extend(["bands.csv", "bands.svg"])
        try:
            report["bands_source"] = bands_data.relative_to(runtime_dir).as_posix()
        except ValueError:
            report["bands_source"] = str(bands_data)
        report["bands_source_sha256"] = sha256(bands_data)
    if dos_data is not None:
        dos_data = dos_data.resolve()
        dos = parse_dos(dos_data)
        write_csv(output_dir / "dos.csv", dos)
        (output_dir / "dos.svg").write_text(dos_svg(dos), encoding="utf-8")
        report["products"].extend(["dos.csv", "dos.svg"])
        try:
            report["dos_source"] = dos_data.relative_to(runtime_dir).as_posix()
        except ValueError:
            report["dos_source"] = str(dos_data)
        report["dos_source_sha256"] = sha256(dos_data)
    if not report["products"]:
        raise HandoffError(
            "no convergence outputs, bands.x data, or dos.x data were supplied"
        )
    write_json(output_dir / "analysis.json", report)
    return report


def safe_relative(raw: str) -> Path:
    path = Path(raw)
    if path.is_absolute() or ".." in path.parts or not path.parts:
        raise HandoffError(f"unsafe relative path: {raw}")
    return path


def study_files(study_dir: Path, excluded: set[str]) -> list[Path]:
    return sorted(
        path for path in study_dir.rglob("*")
        if path.is_file() and path.relative_to(study_dir).as_posix() not in excluded
    )


def deterministic_archive(study_dir: Path, archive_path: Path) -> None:
    archive_path.parent.mkdir(parents=True, exist_ok=True)
    with archive_path.open("wb") as raw:
        with gzip.GzipFile(filename="", mode="wb", fileobj=raw, mtime=0) as gz:
            with tarfile.open(fileobj=gz, mode="w", format=tarfile.PAX_FORMAT) as tar:
                for path in sorted(study_dir.rglob("*")):
                    relative = path.relative_to(study_dir)
                    info = tar.gettarinfo(str(path), arcname=relative.as_posix())
                    info.uid = info.gid = 0
                    info.uname = info.gname = ""
                    info.mtime = 0
                    if path.is_file():
                        with path.open("rb") as handle:
                            tar.addfile(info, handle)
                    else:
                        tar.addfile(info)


def safe_extract(archive_path: Path, restore_dir: Path) -> None:
    require_new_directory(restore_dir)
    with tarfile.open(archive_path, "r:gz") as tar:
        for member in tar.getmembers():
            safe_relative(member.name)
        tar.extractall(restore_dir, filter="data")


def package_study(
    study_dir: Path,
    archive_path: Path,
    restore_dir: Path,
    run_regeneration_check: bool,
) -> dict[str, object]:
    study_dir = study_dir.resolve()
    required = [
        "README.md",
        "source",
        "input",
        "commands",
        "output",
        "parsed",
        "figures",
        "environment",
    ]
    missing = [name for name in required if not (study_dir / name).exists()]
    if missing:
        raise HandoffError("study package is missing: " + ", ".join(missing))
    admin = {"manifest.json", "INVENTORY.tsv", "SHA256SUMS"}
    payload = study_files(study_dir, admin)
    entries = [
        {
            "path": path.relative_to(study_dir).as_posix(),
            "bytes": path.stat().st_size,
            "sha256": sha256(path),
        }
        for path in payload
    ]
    manifest = {
        "format": "DRW manual study package v1",
        "files": entries,
        "boundary": (
            "The package records bytes and regeneration instructions. Hash agreement "
            "establishes artifact identity, not numerical or scientific validity."
        ),
    }
    write_json(study_dir / "manifest.json", manifest)
    (study_dir / "INVENTORY.tsv").write_text(
        "path\tbytes\tsha256\n"
        + "".join(f'{entry["path"]}\t{entry["bytes"]}\t{entry["sha256"]}\n' for entry in entries),
        encoding="utf-8",
    )
    checksum_paths = study_files(study_dir, {"SHA256SUMS"})
    (study_dir / "SHA256SUMS").write_text(
        "".join(f"{sha256(path)}  {path.relative_to(study_dir).as_posix()}\n" for path in checksum_paths),
        encoding="utf-8",
    )
    deterministic_archive(study_dir, archive_path)
    safe_extract(archive_path, restore_dir)
    checksum = subprocess.run(
        ["sha256sum", "-c", "SHA256SUMS"],
        cwd=restore_dir,
        text=True,
        capture_output=True,
        check=False,
    )
    if checksum.returncode != 0:
        raise HandoffError("restored sha256sum check failed:\n" + checksum.stdout + checksum.stderr)

    regenerated: list[dict[str, str]] = []
    if run_regeneration_check:
        target_file = restore_dir / "commands" / "regeneration-targets.txt"
        script = restore_dir / "commands" / "regenerate.sh"
        if not target_file.is_file() or not script.is_file():
            raise HandoffError("regeneration check requires commands/regeneration-targets.txt and regenerate.sh")
        targets = [
            safe_relative(line.strip())
            for line in target_file.read_text(encoding="utf-8").splitlines()
            if line.strip() and not line.lstrip().startswith("#")
        ]
        expected: dict[Path, str] = {}
        for relative in targets:
            target = restore_dir / relative
            if not target.is_file():
                raise HandoffError(f"regeneration target is absent from the archive: {relative}")
            expected[relative] = sha256(target)
            target.unlink()
        regeneration = subprocess.run(
            ["bash", "commands/regenerate.sh"],
            cwd=restore_dir,
            text=True,
            capture_output=True,
            check=False,
        )
        if regeneration.returncode != 0:
            raise HandoffError("regeneration command failed:\n" + regeneration.stdout + regeneration.stderr)
        for relative in targets:
            target = restore_dir / relative
            if not target.is_file():
                raise HandoffError(f"regeneration did not recreate {relative}")
            actual = sha256(target)
            if actual != expected[relative]:
                raise HandoffError(f"regenerated bytes differ for {relative}")
            regenerated.append({"path": relative.as_posix(), "sha256": actual})

    report = {
        "status": "PASS",
        "study_dir": str(study_dir),
        "archive": str(archive_path.resolve()),
        "archive_sha256": sha256(archive_path),
        "restored_to": str(restore_dir.resolve()),
        "sha256sum_check": "PASS",
        "regeneration_check": "PASS" if run_regeneration_check else "NOT_RUN",
        "regenerated": regenerated,
        "boundary": (
            "Restore and byte-for-byte regeneration passed. This proves packaging and "
            "determinism for the listed artifacts only, not scientific correctness."
        ),
    }
    write_json(restore_dir / "restore-audit.json", report)
    return report


def hash_registry_entries(value: object) -> Iterable[dict[str, object]]:
    if isinstance(value, list):
        for item in value:
            yield from hash_registry_entries(item)
    elif isinstance(value, dict):
        if isinstance(value.get("path"), str) and isinstance(value.get("sha256"), str):
            yield value
        for item in value.values():
            yield from hash_registry_entries(item)


def locate_registry_bound_silicon(repo_root: Path) -> tuple[Path, dict[str, Path], dict[str, str]]:
    registry = repo_root / "workflow" / "case-file-hashes.json"
    document = json.loads(registry.read_text(encoding="utf-8"))
    entries = {str(item["path"]): str(item["sha256"]) for item in hash_registry_entries(document)}
    files: dict[str, Path] = {}
    hashes: dict[str, str] = {}
    for name, relative in SILICON_FIXTURES.items():
        expected = entries.get(relative)
        if expected is None:
            raise HandoffError(f"hash registry does not declare {relative}")
        path = repo_root / relative
        if not path.is_file():
            raise HandoffError(f"hash-registry file is missing: {relative}")
        actual = sha256(path)
        if actual != expected:
            raise HandoffError(f"hash-registry mismatch for {relative}")
        files[name] = path
        hashes[relative] = expected
    return registry, files, entries


def run_self_test(repo_root: Path) -> dict[str, object]:
    registry, fixtures, registry_entries = locate_registry_bound_silicon(repo_root)
    case_root = repo_root / "examples" / "cases" / "silicon-ground-state-electronic-structure"
    convergence_files = sorted((case_root / "output").glob("si_e*_k*.out"))
    if len(convergence_files) != 9:
        raise HandoffError(f"expected 9 silicon convergence outputs, found {len(convergence_files)}")
    for path in convergence_files:
        relative = path.relative_to(repo_root).as_posix()
        expected = registry_entries.get(relative)
        if expected is None or sha256(path) != expected:
            raise HandoffError(f"convergence fixture is not bound by the hash registry: {relative}")

    with tempfile.TemporaryDirectory(prefix="drw-qe-handoff-") as raw_temp:
        temp = Path(raw_temp)
        reference = temp / "reference"
        prepare = prepare_reference(fixtures["si-relax.out"], fixtures["scf.in"], reference)
        empty_stderr = temp / "scf-main.err"
        empty_stderr.write_text("", encoding="utf-8")
        audit = audit_scf(
            fixtures["scf.in"],
            fixtures["scf-main.out"],
            empty_stderr,
            temp / "stored-static-audit.json",
        )

        runtime = temp / "runtime"
        convergence_dir = runtime / "convergence"
        convergence_dir.mkdir(parents=True)
        for path in convergence_files:
            shutil.copy2(path, convergence_dir / path.name)
        shutil.copy2(fixtures["si.bands.dat"], runtime / "si.bands.dat")
        shutil.copy2(fixtures["si.dos.dat"], runtime / "si.dos.dat")
        extracted = extract_runtime(runtime, temp / "analysis", None, None)

        study = temp / "study"
        for directory in ("source", "input", "commands", "output", "parsed", "figures", "environment"):
            (study / directory).mkdir(parents=True, exist_ok=True)
        (study / "README.md").write_text(
            "Deterministic packaging fixture only; this is not calculation evidence.\n",
            encoding="utf-8",
        )
        (study / "source" / "identity.txt").write_text("fixture\n", encoding="utf-8")
        (study / "input" / "input.txt").write_text("fixture\n", encoding="utf-8")
        (study / "output" / "program.txt").write_text("fixture bytes only\n", encoding="utf-8")
        (study / "environment" / "version.txt").write_text("fixture\n", encoding="utf-8")
        (study / "commands" / "regeneration-targets.txt").write_text(
            "parsed/summary.csv\nfigures/summary.svg\n", encoding="utf-8"
        )
        (study / "commands" / "regenerate.sh").write_text(
            "#!/usr/bin/env bash\n"
            "set -euo pipefail\n"
            "mkdir -p parsed figures\n"
            "printf 'value\\n1\\n' > parsed/summary.csv\n"
            "printf '<svg xmlns=\"http://www.w3.org/2000/svg\"><title>fixture</title></svg>\\n' > figures/summary.svg\n",
            encoding="utf-8",
        )
        subprocess.run(
            ["bash", "commands/regenerate.sh"], cwd=study, check=True, capture_output=True, text=True
        )
        packaged = package_study(
            study,
            temp / "study.tar.gz",
            temp / "restored",
            run_regeneration_check=True,
        )

        return {
            "status": "PASS",
            "hash_registry": str(registry.relative_to(repo_root)),
            "hash_registry_sha256": sha256(registry),
            "prepare_reference": prepare["status"],
            "stored_static_audit": audit["status"],
            "runtime_products": extracted["products"],
            "package_restore": packaged["status"],
            "regeneration_check": packaged["regeneration_check"],
            "boundary": (
                "The stored relax and static outputs are independent parser fixtures. The "
                "self-test does not assert that the stored static run descended from the "
                "stored relax output, does not run QE, and makes no observable-convergence claim."
            ),
        }


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(description=__doc__)
    sub = root.add_subparsers(dest="command")

    prepare = sub.add_parser("prepare-reference")
    prepare.add_argument("--relax-output", type=Path, required=True)
    prepare.add_argument("--scf-template", type=Path, required=True)
    prepare.add_argument("--output-dir", type=Path, required=True)

    audit = sub.add_parser("audit-scf")
    audit.add_argument("--input", type=Path, required=True)
    audit.add_argument("--stdout", type=Path, required=True)
    audit.add_argument("--stderr", type=Path, required=True)
    audit.add_argument("--report", type=Path, required=True)

    extract = sub.add_parser("extract-runtime")
    extract.add_argument("--runtime-dir", type=Path, required=True)
    extract.add_argument("--output-dir", type=Path, required=True)
    extract.add_argument("--bands-data", type=Path)
    extract.add_argument("--dos-data", type=Path)

    package = sub.add_parser("package-study")
    package.add_argument("--study-dir", type=Path, required=True)
    package.add_argument("--archive", type=Path, required=True)
    package.add_argument("--restore-dir", type=Path, required=True)
    package.add_argument("--run-regeneration-check", action="store_true")

    self_test = sub.add_parser("self-test")
    self_test.add_argument("--repo-root", type=Path, default=REPO_ROOT)
    return root


def main() -> int:
    args = parser().parse_args()
    try:
        if args.command in (None, "self-test"):
            report = run_self_test(getattr(args, "repo_root", REPO_ROOT).resolve())
        elif args.command == "prepare-reference":
            report = prepare_reference(args.relax_output, args.scf_template, args.output_dir)
        elif args.command == "audit-scf":
            report = audit_scf(args.input, args.stdout, args.stderr, args.report)
        elif args.command == "extract-runtime":
            report = extract_runtime(args.runtime_dir, args.output_dir, args.bands_data, args.dos_data)
        elif args.command == "package-study":
            report = package_study(
                args.study_dir, args.archive, args.restore_dir, args.run_regeneration_check
            )
        else:
            raise HandoffError(f"unsupported command: {args.command}")
    except (HandoffError, OSError, ValueError, subprocess.SubprocessError) as error:
        print(json.dumps({"status": "FAIL", "error": str(error)}, indent=2))
        return 1
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
