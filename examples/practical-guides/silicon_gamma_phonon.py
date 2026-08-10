"""Reconstruct a bounded Silicon Gamma-point DFPT ledger from committed QE 7.5 output."""
from __future__ import annotations

import argparse
import csv
import hashlib
import html
import json
import math
import re
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parent / "data" / "silicon-qe" / "phonon"
FREQUENCY = re.compile(r"freq \(\s*(\d+)\) =\s*([-0-9.]+) \[THz\] =\s*([-0-9.]+) \[cm-1\]")
SCF_CONVERGENCE = re.compile(
    r"(?im)^\s+convergence has been achieved in\s+\d+\s+iterations\s*$"
)


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def run() -> dict[str, object]:
    scf = ROOT / "si-gamma-scf.out"
    phonon = ROOT / "si-gamma-ph.out"
    scf_text = scf.read_text()
    if not SCF_CONVERGENCE.search(scf_text) or "JOB DONE." not in scf_text:
        raise RuntimeError("SCF completion evidence missing")
    text = phonon.read_text()
    if "Program PHONON v.7.5" not in text or "Diagonalizing the dynamical matrix" not in text or "JOB DONE." not in text:
        raise RuntimeError("ph.x completion evidence missing")
    modes = [{"mode": int(n), "frequency_thz": float(thz), "frequency_cm-1": float(cm)} for n, thz, cm in FREQUENCY.findall(text)]
    if len(modes) != 6 or [mode["mode"] for mode in modes] != list(range(1, 7)):
        raise RuntimeError("expected six Gamma-point modes")
    if any(abs(mode["frequency_cm-1"] - 1.216451) > 1e-6 for mode in modes[:3]):
        raise RuntimeError("unexpected acoustic diagnostic")
    if any(abs(mode["frequency_cm-1"] - 514.442616) > 1e-6 for mode in modes[3:]):
        raise RuntimeError("unexpected optical diagnostic")
    files = ["si-gamma-scf.in", "si-gamma-scf.out", "si-gamma-scf.err", "si-gamma-ph.in", "si-gamma-ph.out", "si-gamma-ph.err", "si_gamma.dyn"]
    return {
        "schema_version": 1,
        "evidence_class": "real-execution",
        "material": {"formula": "Si", "structure_source": "COD 9013102 deterministic public copy", "structure_sha256": "cd12420b831cd62227a36865179d12c5eece74e4a40e8d135abc981ced42ca55", "raw_download_sha256": "99fb6c6c297f8407aa779de46bf7eaa663ac079f7f12b582c042313f9c82f77e"},
        "software": {"pw.x": "7.5", "ph.x": "7.5"},
        "workflow": "SCF followed by Gamma-point ph.x using the same prefix/outdir lineage",
        "q_point_fractional": [0.0, 0.0, 0.0],
        "modes": modes,
        "acoustic_diagnostic_cm-1": 1.216451,
        "optical_triplet_cm-1": 514.442616,
        "files_sha256": {name: sha(ROOT / name) for name in files},
        "convergence_status": "not assessed for phonon frequency; one Gamma point only",
        "claim_boundary": "This run documents a single QE 7.5 Gamma-point DFPT calculation. It is not a phonon dispersion, q-mesh/cutoff/k-mesh convergence study, acoustic-sum-rule study, dynamical-stability proof, finite-temperature result, or material conclusion.",
    }


def svg(result: dict[str, object], path: Path) -> None:
    modes = result["modes"]
    max_frequency = 560.0
    bars = "".join(f'<rect x="{65 + 65 * i}" y="{365 - mode["frequency_cm-1"] / max_frequency * 290:.1f}" width="36" height="{mode["frequency_cm-1"] / max_frequency * 290:.1f}" fill="{"#3273a8" if i < 3 else "#b96d2e"}"/><text x="{83 + 65 * i}" y="392" text-anchor="middle" font-size="13">{mode["mode"]}</text>' for i, mode in enumerate(modes))
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" width="900" height="470" viewBox="0 0 900 470" role="img" aria-labelledby="t d"><title id="t">Silicon Gamma-point phonon modes from a QE 7.5 DFPT run</title><desc id="d">Six real Silicon Gamma-point modes parsed from committed Quantum ESPRESSO output: three 1.216451 inverse-centimeter acoustic diagnostics and three 514.442616 inverse-centimeter optical modes.</desc><rect width="900" height="470" fill="#fffdf8"/><text x="55" y="48" font-size="25" font-family="sans-serif" font-weight="700" fill="#172a3a">Silicon Γ-point modes from QE 7.5 output</text><text x="55" y="76" font-size="15" font-family="sans-serif" fill="#52616b">Single DFPT q point · 8×8×8 SCF · not a dispersion or convergence result</text><line x1="55" y1="365" x2="500" y2="365" stroke="#334155"/><line x1="55" y1="75" x2="55" y2="365" stroke="#334155"/>{bars}<text x="55" y="425" font-size="14" font-family="sans-serif" fill="#52616b">blue: acoustic diagnostic (1.216451 cm⁻¹) · ochre: optical triplet (514.442616 cm⁻¹)</text></svg>''', encoding="utf-8")


def parse_matdyn_frequency_file(path: Path) -> tuple[list[tuple[float, float, float]], list[list[float]]]:
    """Parse the plot-format frequency file written by QE 7.5 matdyn.x."""
    text = path.read_text(encoding="utf-8")
    header = re.search(r"&plot\s+nbnd\s*=\s*(\d+)\s*,\s*nks\s*=\s*(\d+)\s*/", text, re.IGNORECASE)
    if not header:
        raise ValueError(f"{path}: missing &plot nbnd/nks header")
    nbnd, nks = (int(value) for value in header.groups())
    lines = [line.strip() for line in text[header.end():].splitlines() if line.strip()]
    qpoints: list[tuple[float, float, float]] = []
    rows: list[list[float]] = []
    position = 0
    number = re.compile(r"[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eEdD][-+]?\d+)?")
    for q_index in range(nks):
        if position >= len(lines):
            raise ValueError(f"{path}: ended before q point {q_index + 1}/{nks}")
        q_values = [float(value.replace("D", "E").replace("d", "e")) for value in number.findall(lines[position])]
        position += 1
        if len(q_values) < 3:
            raise ValueError(f"{path}: q point {q_index + 1} has fewer than three coordinates")
        qpoints.append((q_values[0], q_values[1], q_values[2]))
        frequencies: list[float] = []
        while len(frequencies) < nbnd and position < len(lines):
            frequencies.extend(float(value.replace("D", "E").replace("d", "e")) for value in number.findall(lines[position]))
            position += 1
        if len(frequencies) != nbnd:
            raise ValueError(f"{path}: q point {q_index + 1} has {len(frequencies)} frequencies instead of {nbnd}")
        rows.append(frequencies)
    return qpoints, rows


def path_distance(qpoints: list[tuple[float, float, float]]) -> list[float]:
    distances = [0.0]
    for left, right in zip(qpoints, qpoints[1:]):
        distances.append(distances[-1] + math.dist(left, right))
    return distances


def write_dispersion_svg(
    branch_a: Path,
    branch_b: Path,
    output: Path,
    labels_a: list[str],
    labels_b: list[str],
    indices_a: list[int],
    indices_b: list[int],
    minimum_cm: float,
    maximum_cm: float,
    title: str,
) -> dict[str, object]:
    if minimum_cm >= maximum_cm:
        raise ValueError("--fmin-cm must be smaller than --fmax-cm")
    qa, rows_a = parse_matdyn_frequency_file(branch_a)
    qb, rows_b = parse_matdyn_frequency_file(branch_b)
    if len(rows_a[0]) != len(rows_b[0]):
        raise ValueError("the two path branches contain different mode counts")
    da = path_distance(qa)
    db_raw = path_distance(qb)
    if len(labels_a) < 2 or len(labels_b) < 2 or len(labels_a) != len(indices_a) or len(labels_b) != len(indices_b):
        raise ValueError("each branch needs matching label and zero-based point-index lists")
    if any(index < 0 or index >= len(da) for index in indices_a) or any(index < 0 or index >= len(db_raw) for index in indices_b):
        raise ValueError("a label point index is outside its parsed matdyn path")
    gap = 0.08 * max(da[-1] + db_raw[-1], 1.0)
    offset_b = da[-1] + gap
    db = [value + offset_b for value in db_raw]

    width, height = 1120, 620
    left, right, top, bottom = 92, 36, 78, 82
    xmap = lambda value: left + (width - left - right) * value / db[-1]
    ymap = lambda value: height - bottom - (height - top - bottom) * (value - minimum_cm) / (maximum_cm - minimum_cm)
    curves: list[str] = []
    for distances, rows in ((da, rows_a), (db, rows_b)):
        for mode in range(len(rows[0])):
            points = " ".join(f"{xmap(distance):.2f},{ymap(row[mode]):.2f}" for distance, row in zip(distances, rows))
            curves.append(f'<polyline points="{points}" fill="none" stroke="#145a8d" stroke-width="1.35"/>')
    ticks: list[str] = []
    for label, index in zip(labels_a, indices_a):
        xx = xmap(da[index]); ticks.append(f'<line x1="{xx:.2f}" y1="{top}" x2="{xx:.2f}" y2="{height-bottom}" stroke="#d3cec5"/><text x="{xx:.2f}" y="{height-bottom+27}" text-anchor="middle" font-family="sans-serif" font-size="15">{html.escape(label)}</text>')
    for label, index in zip(labels_b, indices_b):
        xx = xmap(db[index]); ticks.append(f'<line x1="{xx:.2f}" y1="{top}" x2="{xx:.2f}" y2="{height-bottom}" stroke="#d3cec5"/><text x="{xx:.2f}" y="{height-bottom+27}" text-anchor="middle" font-family="sans-serif" font-size="15">{html.escape(label)}</text>')
    zero = ymap(0.0)
    gap_left, gap_right = xmap(da[-1]), xmap(db[0])
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("\n".join([
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">',
        f'<title id="title">{html.escape(title)}</title>',
        '<desc id="desc">Fresh matdyn.x frequency files plotted as two discontinuous path branches in inverse centimetres.</desc>',
        '<rect width="100%" height="100%" fill="white"/>',
        f'<clipPath id="plot"><rect x="{left}" y="{top}" width="{width-left-right}" height="{height-top-bottom}"/></clipPath>',
        *ticks,
        f'<line x1="{left}" y1="{zero:.2f}" x2="{width-right}" y2="{zero:.2f}" stroke="#a33d2d" stroke-dasharray="5 4"/>',
        f'<g clip-path="url(#plot)">{"".join(curves)}</g>',
        f'<rect x="{left}" y="{top}" width="{width-left-right}" height="{height-top-bottom}" fill="none" stroke="#555"/>',
        f'<line x1="{gap_left+7:.2f}" y1="{top+10}" x2="{gap_right-7:.2f}" y2="{top+10}" stroke="#a33d2d" stroke-width="2"/>',
        f'<text x="{(gap_left+gap_right)/2:.2f}" y="{top-5}" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#a33d2d">path break</text>',
        f'<text x="{left}" y="36" font-family="sans-serif" font-size="23" font-weight="700">{html.escape(title)}</text>',
        f'<text x="{left}" y="59" font-family="sans-serif" font-size="13" fill="#52616b">fresh matdyn.x data · displayed window {minimum_cm:g} to {maximum_cm:g} cm⁻¹</text>',
        f'<text x="{width/2}" y="{height-18}" text-anchor="middle" font-family="sans-serif" font-size="14">declared reciprocal-space path</text>',
        f'<text x="24" y="{(top+height-bottom)/2}" transform="rotate(-90 24 {(top+height-bottom)/2})" text-anchor="middle" font-family="sans-serif" font-size="14">frequency (cm⁻¹)</text>',
        '</svg>', ''
    ]), encoding="utf-8")
    return {"status": "PASS", "modes": len(rows_a[0]), "points": [len(rows_a), len(rows_b)], "svg": str(output), "boundary": "Plot transcription only; q-grid convergence and physical stability are not established."}


def parse_dos(path: Path) -> list[tuple[float, float]]:
    points: list[tuple[float, float]] = []
    for number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        stripped = line.strip()
        if not stripped or stripped.startswith(("#", "!")):
            continue
        fields = stripped.split()
        if len(fields) < 2:
            raise ValueError(f"{path}:{number}: expected frequency and DOS")
        points.append((float(fields[0]), float(fields[1])))
    if len(points) < 2 or any(right[0] <= left[0] for left, right in zip(points, points[1:])):
        raise ValueError(f"{path}: DOS grid is missing or non-increasing")
    return points


def write_dos_svg(data: Path, output: Path, expected_modes: int, title: str) -> dict[str, object]:
    points = parse_dos(data)
    integral = sum((right[0] - left[0]) * (left[1] + right[1]) / 2 for left, right in zip(points, points[1:]))
    width, height = 900, 560
    left, right, top, bottom = 92, 40, 72, 76
    xmin, xmax = points[0][0], points[-1][0]
    ymax = max(value for _, value in points) * 1.06 or 1.0
    xmap = lambda value: left + (width-left-right) * (value-xmin) / (xmax-xmin)
    ymap = lambda value: height-bottom-(height-top-bottom)*value/ymax
    polyline = " ".join(f"{xmap(x):.2f},{ymap(y):.2f}" for x, y in points)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("\n".join([
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">',
        f'<title id="title">{html.escape(title)}</title>',
        f'<desc id="desc">Fresh matdyn.x phonon density of states; trapezoid integral {integral:.8g}, expected mode count {expected_modes}.</desc>',
        '<rect width="100%" height="100%" fill="white"/>',
        f'<polyline points="{polyline}" fill="none" stroke="#145a8d" stroke-width="2"/>',
        f'<rect x="{left}" y="{top}" width="{width-left-right}" height="{height-top-bottom}" fill="none" stroke="#555"/>',
        f'<text x="{left}" y="34" font-family="sans-serif" font-size="23" font-weight="700">{html.escape(title)}</text>',
        f'<text x="{left}" y="57" font-family="sans-serif" font-size="13" fill="#52616b">trapezoid integral = {integral:.8g}; expected 3N = {expected_modes}; verify mesh convergence and matdyn normalization</text>',
        f'<text x="{width/2}" y="{height-18}" text-anchor="middle" font-family="sans-serif" font-size="14">frequency (cm⁻¹)</text>',
        f'<text x="24" y="{(top+height-bottom)/2}" transform="rotate(-90 24 {(top+height-bottom)/2})" text-anchor="middle" font-family="sans-serif" font-size="14">states per cm⁻¹</text>',
        '</svg>', ''
    ]), encoding="utf-8")
    return {"status": "PASS", "points": len(points), "integral": integral, "expected_modes": expected_modes, "svg": str(output), "boundary": "The numerical integral is a diagnostic, not proof of q-mesh convergence or physical stability."}


def self_test_fresh() -> dict[str, object]:
    with tempfile.TemporaryDirectory(prefix="drw-phonon-") as directory:
        root = Path(directory)
        branch = "&plot nbnd= 2, nks= 3 /\n0 0 0 1\n-1 2\n0.5 0 0 1\n-2 3\n1 0 0 1\n-1 4\n"
        a = root / "a.freq"; b = root / "b.freq"; a.write_text(branch, encoding="utf-8"); b.write_text(branch, encoding="utf-8")
        dispersion = write_dispersion_svg(a, b, root / "dispersion.svg", ["Γ", "X", "U"], ["K", "Γ", "X"], [0, 1, 2], [0, 1, 2], -5, 5, "Fresh phonon self-test")
        dos = root / "dos.dat"; dos.write_text("0 0\n1 1\n2 2\n3 1\n4 0\n", encoding="utf-8")
        dos_report = write_dos_svg(dos, root / "dos.svg", 4, "Fresh DOS self-test")
        assert "path break" in (root / "dispersion.svg").read_text(encoding="utf-8")
        return {"status": "PASS", "dispersion": dispersion, "dos": dos_report}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", type=Path)
    parser.add_argument("--csv", type=Path)
    parser.add_argument("--svg", type=Path)
    subparsers = parser.add_subparsers(dest="mode")
    subparsers.add_parser("self-test-fresh", help="exercise fresh dispersion and DOS plotting")
    dispersion_parser = subparsers.add_parser("fresh-dispersion", help="plot two fresh matdyn.x frequency files")
    dispersion_parser.add_argument("--branch-a", type=Path, required=True)
    dispersion_parser.add_argument("--branch-b", type=Path, required=True)
    dispersion_parser.add_argument("--labels-a", default="Γ,X,U")
    dispersion_parser.add_argument("--labels-b", default="K,Γ,L,W,X")
    dispersion_parser.add_argument("--label-indices-a", default="0,20,40", help="zero-based path-point indices for branch-A labels")
    dispersion_parser.add_argument("--label-indices-b", default="0,20,40,60,80", help="zero-based path-point indices for branch-B labels")
    dispersion_parser.add_argument("--fmin-cm", type=float, required=True)
    dispersion_parser.add_argument("--fmax-cm", type=float, required=True)
    dispersion_parser.add_argument("--title", default="Fresh QE phonon dispersion")
    dispersion_parser.add_argument("--output-svg", type=Path, required=True)
    dos_parser = subparsers.add_parser("fresh-dos", help="plot a fresh matdyn.x phonon DOS file")
    dos_parser.add_argument("--data", type=Path, required=True)
    dos_parser.add_argument("--expected-modes", type=int, required=True, help="3 times the atom count in the unit cell")
    dos_parser.add_argument("--title", default="Fresh QE phonon DOS")
    dos_parser.add_argument("--output-svg", type=Path, required=True)
    args = parser.parse_args()
    if args.mode == "self-test-fresh":
        result = self_test_fresh()
    elif args.mode == "fresh-dispersion":
        result = write_dispersion_svg(
            args.branch_a,
            args.branch_b,
            args.output_svg,
            [label.strip() for label in args.labels_a.split(",")],
            [label.strip() for label in args.labels_b.split(",")],
            [int(index) for index in args.label_indices_a.split(",")],
            [int(index) for index in args.label_indices_b.split(",")],
            args.fmin_cm,
            args.fmax_cm,
            args.title,
        )
    elif args.mode == "fresh-dos":
        result = write_dos_svg(args.data, args.output_svg, args.expected_modes, args.title)
    else:
        result = run()
        if args.json:
            args.json.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
        if args.csv:
            with args.csv.open("w", newline="", encoding="utf-8") as handle:
                writer = csv.DictWriter(handle, fieldnames=["mode", "frequency_thz", "frequency_cm-1"])
                writer.writeheader(); writer.writerows(result["modes"])
        if args.svg:
            svg(result, args.svg)
    print(json.dumps(result, indent=2))
