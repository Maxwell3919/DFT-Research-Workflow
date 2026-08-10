"""Plot fresh split-path QE bands or reconstruct the committed Silicon evidence."""
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


ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "examples/practical-guides/data/silicon-qe"
RAW = DATA / "output/si.bands.dat"
SEEKPATH = ROOT / "examples/cases/silicon-ground-state-electronic-structure/source/seekpath.json"
INPUT = DATA / "bands.in"
RAW_SHA256 = "4903acde7e33eb79906fbcf72e3ea9f5d19593f65b3946818febf36678b6cc3f"
SEEKPATH_SHA256 = "a1ea0fd1012a41cbeab015b390e5a35c77fb7f10c638b87f414f5a3087eb1c5d"
INPUT_SHA256 = "5f017a9583b23e6e4a75bc14d5cb560bead47418dc690fb1453ca2b5f7c47c62"
EXPECTED_SEGMENTS = [
    ["GAMMA", "X"],
    ["X", "U"],
    ["K", "GAMMA"],
    ["GAMMA", "L"],
    ["L", "W"],
    ["W", "X"],
]
ANCHORS = [("GAMMA", 0), ("X", 20), ("U", 40), ("K", 60), ("GAMMA", 80), ("L", 100), ("W", 120), ("X", 140)]
CONNECTOR_INTERIOR = set(range(41, 60))


def parse_gnu_bands(path: Path) -> list[list[tuple[float, float]]]:
    """Read the blank-line-separated two-column file written by bands.x."""
    blocks: list[list[tuple[float, float]]] = []
    block: list[tuple[float, float]] = []
    for number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        stripped = line.strip()
        if not stripped:
            if block:
                blocks.append(block)
                block = []
            continue
        fields = stripped.split()
        if len(fields) < 2:
            raise ValueError(f"{path}:{number}: expected distance and eigenvalue")
        block.append((float(fields[0]), float(fields[1])))
    if block:
        blocks.append(block)
    if not blocks:
        raise ValueError(f"{path}: no band blocks found")
    reference_x = [x for x, _ in blocks[0]]
    if len(reference_x) < 2:
        raise ValueError(f"{path}: fewer than two path points")
    for index, band in enumerate(blocks, start=1):
        xs = [x for x, _ in band]
        if len(xs) != len(reference_x) or any(not math.isclose(a, b, abs_tol=1e-8) for a, b in zip(xs, reference_x)):
            raise ValueError(f"{path}: band {index} does not share one path grid")
        if any(right < left for left, right in zip(xs, xs[1:])):
            raise ValueError(f"{path}: band {index} path coordinate decreases")
    return blocks


def parse_special_point_x(path: Path) -> list[float]:
    pattern = re.compile(r"high-symmetry point:.*x coordinate\s+([-+0-9.eEdD]+)", re.IGNORECASE)
    values = [float(match.group(1).replace("D", "E").replace("d", "e")) for match in pattern.finditer(path.read_text(encoding="utf-8"))]
    if not values:
        raise ValueError(f"{path}: no bands.x high-symmetry x coordinates found")
    return values


def write_fresh_svg(
    branch_a_path: Path,
    branch_b_path: Path,
    output_a_path: Path,
    output_b_path: Path,
    svg: Path,
    energy_reference_ev: float,
    energy_min_ev: float,
    energy_max_ev: float,
    labels_a: list[str],
    labels_b: list[str],
    reference_label: str,
    title: str,
) -> dict[str, object]:
    """Render two independently generated QE path branches with a visible break."""
    if not energy_min_ev < energy_max_ev:
        raise ValueError("--emin-ev must be smaller than --emax-ev")
    bands_a = parse_gnu_bands(branch_a_path)
    bands_b = parse_gnu_bands(branch_b_path)
    if len(bands_a) != len(bands_b):
        raise ValueError("the two branches contain different numbers of bands")
    ticks_a = parse_special_point_x(output_a_path)
    ticks_b = parse_special_point_x(output_b_path)
    if len(ticks_a) != len(labels_a) or len(ticks_b) != len(labels_b):
        raise ValueError("label counts must match the high-symmetry records in each bands.x output")

    xa = [value for value, _ in bands_a[0]]
    xb_raw = [value for value, _ in bands_b[0]]
    for value in ticks_a:
        if value < xa[0] - 1e-6 or value > xa[-1] + 1e-6:
            raise ValueError(f"{output_a_path}: special point {value} is outside branch-a data")
    for value in ticks_b:
        if value < xb_raw[0] - 1e-6 or value > xb_raw[-1] + 1e-6:
            raise ValueError(f"{output_b_path}: special point {value} is outside branch-b data")

    span_a = xa[-1] - xa[0]
    span_b = xb_raw[-1] - xb_raw[0]
    gap = 0.08 * max(span_a + span_b, 1.0)
    offset_b = xa[-1] + gap - xb_raw[0]
    xb = [value + offset_b for value in xb_raw]
    ticks_b_shifted = [value + offset_b for value in ticks_b]

    width, height = 1120, 620
    left, right, top, bottom = 92, 36, 78, 82
    xmin, xmax = xa[0], xb[-1]
    xmap = lambda value: left + (width - left - right) * (value - xmin) / (xmax - xmin)
    ymap = lambda value: height - bottom - (height - top - bottom) * (value - energy_min_ev) / (energy_max_ev - energy_min_ev)

    curves: list[str] = []
    for branch, shifted_x in ((bands_a, xa), (bands_b, xb)):
        for band in branch:
            points = " ".join(
                f"{xmap(x_value):.2f},{ymap(energy - energy_reference_ev):.2f}"
                for x_value, (_, energy) in zip(shifted_x, band)
            )
            curves.append(f'<polyline points="{points}" fill="none" stroke="#145a8d" stroke-width="1.35"/>')

    ticks: list[str] = []
    for label, value in [*zip(labels_a, ticks_a), *zip(labels_b, ticks_b_shifted)]:
        position = xmap(value)
        ticks.append(
            f'<line x1="{position:.2f}" y1="{top}" x2="{position:.2f}" y2="{height-bottom}" stroke="#d3cec5"/>'
            f'<text x="{position:.2f}" y="{height-bottom+27}" text-anchor="middle" font-family="sans-serif" font-size="15">{html.escape(label)}</text>'
        )
    zero = ymap(0.0)
    gap_left, gap_right = xmap(xa[-1]), xmap(xb[0])
    svg.parent.mkdir(parents=True, exist_ok=True)
    svg.write_text(
        "\n".join(
            [
                f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">',
                f'<title id="title">{html.escape(title)}</title>',
                f'<desc id="desc">Fresh bands.x data plotted relative to {html.escape(reference_label)} = {energy_reference_ev:.8g} eV; the two input branches remain discontinuous.</desc>',
                '<rect width="100%" height="100%" fill="white"/>',
                f'<clipPath id="plot"><rect x="{left}" y="{top}" width="{width-left-right}" height="{height-top-bottom}"/></clipPath>',
                *ticks,
                f'<line x1="{left}" y1="{zero:.2f}" x2="{width-right}" y2="{zero:.2f}" stroke="#555" stroke-dasharray="5 4"/>',
                f'<g clip-path="url(#plot)">{"".join(curves)}</g>',
                f'<rect x="{left}" y="{top}" width="{width-left-right}" height="{height-top-bottom}" fill="none" stroke="#555"/>',
                f'<line x1="{gap_left+7:.2f}" y1="{top+10}" x2="{gap_right-7:.2f}" y2="{top+10}" stroke="#a33d2d" stroke-width="2"/>',
                f'<text x="{(gap_left+gap_right)/2:.2f}" y="{top-5}" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#a33d2d">path break</text>',
                f'<text x="{left}" y="34" font-family="sans-serif" font-size="23" font-weight="700">{html.escape(title)}</text>',
                f'<text x="{left}" y="57" font-family="sans-serif" font-size="13" fill="#52616b">E_ref = {energy_reference_ev:.8g} eV ({html.escape(reference_label)}) · displayed window {energy_min_ev:g} to {energy_max_ev:g} eV</text>',
                f'<text x="{width/2}" y="{height-18}" text-anchor="middle" font-family="sans-serif" font-size="14">declared high-symmetry route</text>',
                f'<text x="24" y="{(top+height-bottom)/2}" transform="rotate(-90 24 {(top+height-bottom)/2})" text-anchor="middle" font-family="sans-serif" font-size="14">E - E_ref (eV)</text>',
                '</svg>',
                '',
            ]
        ),
        encoding="utf-8",
    )
    return {
        "mode": "fresh",
        "branch_a": str(branch_a_path),
        "branch_b": str(branch_b_path),
        "bands": len(bands_a),
        "points_a": len(xa),
        "points_b": len(xb),
        "energy_reference_ev": energy_reference_ev,
        "display_window_ev": [energy_min_ev, energy_max_ev],
        "svg": str(svg),
        "boundary": "The SVG transcribes the supplied path data. It does not establish full-zone extrema, numerical convergence, or state validity.",
    }


def self_test_fresh_plot() -> dict[str, object]:
    """Exercise the fresh-data parser and SVG path-break renderer."""
    with tempfile.TemporaryDirectory(prefix="drw-bands-") as directory:
        root = Path(directory)
        branch_a = root / "a.gnu"
        branch_b = root / "b.gnu"
        output_a = root / "a.out"
        output_b = root / "b.out"
        svg = root / "bands.svg"
        branch_a.write_text("0 -1\n0.5 0\n1 1\n\n0 2\n0.5 3\n1 4\n", encoding="utf-8")
        branch_b.write_text("0 -0.5\n0.25 0\n0.5 0.5\n0.75 1\n1 1.5\n\n0 2.5\n0.25 3\n0.5 3.5\n0.75 4\n1 4.5\n", encoding="utf-8")
        output_a.write_text(
            "high-symmetry point: 0 0 0 x coordinate 0.0\n"
            "high-symmetry point: 0 0 0 x coordinate 0.5\n"
            "high-symmetry point: 0 0 0 x coordinate 1.0\n",
            encoding="utf-8",
        )
        output_b.write_text(
            "".join(f"high-symmetry point: 0 0 0 x coordinate {value}\n" for value in (0, 0.25, 0.5, 0.75, 1)),
            encoding="utf-8",
        )
        report = write_fresh_svg(
            branch_a,
            branch_b,
            output_a,
            output_b,
            svg,
            1.0,
            -3.0,
            4.0,
            ["Γ", "X", "U"],
            ["K", "Γ", "L", "W", "X"],
            "test reference",
            "Fresh plotting self-test",
        )
        rendered = svg.read_text(encoding="utf-8")
        assert "path break" in rendered and "E - E_ref (eV)" in rendered and report["bands"] == 2
        return {"status": "PASS", "checks": ["two branches", "high-symmetry labels", "energy reference", "visible path break"]}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def parse_bands(path: Path) -> list[tuple[tuple[float, float, float], list[float]]]:
    lines = path.read_text(encoding="utf-8").splitlines()[1:]
    rows = []
    for index in range(0, len(lines), 2):
        k = tuple(float(value) for value in lines[index].split())
        bands = [float(value) for value in lines[index + 1].split()]
        rows.append((k, bands))
    assert len(rows) == 141 and all(len(bands) == 8 for _, bands in rows)
    return rows


def cumulative(rows: list[tuple[tuple[float, float, float], list[float]]]) -> list[float]:
    result = [0.0]
    for (left, _), (right, _) in zip(rows, rows[1:]):
        result.append(result[-1] + math.dist(left, right))
    return result


def parse_input_anchors(source: str) -> list[tuple[str, tuple[float, float, float], int]]:
    lines = source.splitlines()
    start = next(index for index, line in enumerate(lines) if line.strip().lower() == "k_points crystal_b")
    count = int(lines[start + 1].strip())
    records = []
    for line in lines[start + 2 : start + 2 + count]:
        values, label = line.split("!", maxsplit=1)
        tokens = values.split()
        records.append((label.strip(), tuple(float(value) for value in tokens[:3]), int(tokens[3])))
    return records


def run(svg: Path | None = None, csv_path: Path | None = None) -> dict[str, object]:
    assert sha256(RAW) == RAW_SHA256
    assert sha256(SEEKPATH) == SEEKPATH_SHA256
    assert sha256(INPUT) == INPUT_SHA256
    rows = parse_bands(RAW)
    seekpath = json.loads(SEEKPATH.read_text(encoding="utf-8"))
    assert seekpath["path"] == EXPECTED_SEGMENTS
    assert seekpath["bravais_lattice"] == "cF" and seekpath["spacegroup_number"] == 227
    input_anchors = parse_input_anchors(INPUT.read_text(encoding="utf-8"))
    assert [label for label, _, _ in input_anchors] == [label for label, _ in ANCHORS]
    assert [weight for _, _, weight in input_anchors] == [20, 20, 20, 20, 20, 20, 20, 1]
    for label, coordinates, _ in input_anchors:
        expected = seekpath["point_coords"][label]
        assert all(math.isclose(actual, target, abs_tol=1e-8) for actual, target in zip(coordinates, expected))
    # bands.x writes reciprocal Cartesian coordinates, not the crystal_b fractions above.
    # Repeated special points still provide a representation-local ordering check.
    assert rows[0][0] == rows[80][0]
    assert rows[20][0] == rows[140][0]

    raw_distance = cumulative(rows)
    first = rows[:41]
    second = rows[60:]
    first_distance = cumulative(first)
    second_internal = cumulative(second)
    gap = 0.16
    second_distance = [first_distance[-1] + gap + value for value in second_internal]

    if csv_path:
        with csv_path.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.writer(handle)
            writer.writerow(["distance", "kx", "ky", "kz", *[f"band_{i}" for i in range(1, 9)]])
            for value, (kpoint, bands) in zip(raw_distance, rows):
                writer.writerow([f"{value:.9f}", *kpoint, *bands])

    if svg:
        width, height, margin = 1000, 560, 72
        xmin, xmax, ymin, ymax = 0.0, second_distance[-1], -7.0, 18.0
        x = lambda value: margin + (width - 2 * margin) * (value - xmin) / (xmax - xmin)
        y = lambda value: height - margin - (height - 2 * margin) * (value - ymin) / (ymax - ymin)
        paths = []
        for band in range(8):
            first_points = " ".join(
                f"{x(value):.2f},{y(energies[band]):.2f}" for value, (_, energies) in zip(first_distance, first)
            )
            second_points = " ".join(
                f"{x(value):.2f},{y(energies[band]):.2f}" for value, (_, energies) in zip(second_distance, second)
            )
            paths.extend(
                [
                    f'<polyline fill="none" stroke="#145a8d" stroke-width="1.35" points="{first_points}"/>',
                    f'<polyline fill="none" stroke="#145a8d" stroke-width="1.35" points="{second_points}"/>',
                ]
            )

        tick_data = [
            ("Γ", first_distance[0]),
            ("X", first_distance[20]),
            ("U", first_distance[40]),
            ("K", second_distance[0]),
            ("Γ", second_distance[20]),
            ("L", second_distance[40]),
            ("W", second_distance[60]),
            ("X", second_distance[80]),
        ]
        ticks = []
        for label, value in tick_data:
            xx = x(value)
            ticks.append(
                f'<line x1="{xx:.2f}" y1="{margin}" x2="{xx:.2f}" y2="{height-margin}" stroke="#c8c1b7" stroke-width="1"/>'
                f'<text x="{xx:.2f}" y="{height-margin+25}" text-anchor="middle" font-family="sans-serif" font-size="15">{label}</text>'
            )
        gap_left, gap_right = x(first_distance[-1]), x(second_distance[0])
        svg.parent.mkdir(parents=True, exist_ok=True)
        svg.write_text(
            "\n".join(
                [
                    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">',
                    '<title id="title">Silicon QE band plot on the declared SeeK-path route</title>',
                    '<desc id="desc">Eight Kohn-Sham bands along Gamma-X-U, then a visible route break, then K-Gamma-L-W-X. The unintended U-K connector in the raw sequential input is not drawn as a valid path segment.</desc>',
                    '<rect width="100%" height="100%" fill="white"/>',
                    f'<line x1="{margin}" y1="{y(0):.2f}" x2="{width-margin}" y2="{y(0):.2f}" stroke="#555" stroke-dasharray="4 3"/>',
                    *ticks,
                    *paths,
                    f'<line x1="{gap_left+5:.2f}" y1="{margin+8}" x2="{gap_right-5:.2f}" y2="{margin+8}" stroke="#a33d2d" stroke-width="2"/>',
                    f'<text x="{(gap_left+gap_right)/2:.2f}" y="{margin-2}" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#a33d2d">U | K route break</text>',
                    f'<text x="{margin}" y="32" font-family="sans-serif" font-size="22" font-weight="700">Silicon: labelled QE 7.5 band-path output</text>',
                    f'<text x="{margin}" y="55" font-family="sans-serif" font-size="13" fill="#52616b">SeeK-path cF route · 19 interior points from the unintended raw U-K connector omitted from the display</text>',
                    f'<text x="{width/2}" y="{height-12}" text-anchor="middle" font-family="sans-serif" font-size="14">declared high-symmetry route</text>',
                    f'<text x="20" y="{height/2}" transform="rotate(-90 20 {height/2})" text-anchor="middle" font-family="sans-serif" font-size="14">eigenvalue (eV)</text>',
                    '</svg>',
                    '',
                ]
            ),
            encoding="utf-8",
        )

    return {
        "raw_sha256": RAW_SHA256,
        "seekpath_sha256": SEEKPATH_SHA256,
        "bands_input_sha256": INPUT_SHA256,
        "raw_kpoints": len(rows),
        "displayed_kpoints": len(first) + len(second),
        "omitted_u_k_connector_interior_points": len(CONNECTOR_INTERIOR),
        "bands": 8,
        "declared_segments": EXPECTED_SEGMENTS,
        "boundary": (
            "The raw sequential QE input contains an unintended U-K connector. The plot preserves the raw dataset but "
            "does not draw that connector as part of the SeeK-path route. This path evidence is not full-zone sampling "
            "or a converged band-gap claim."
        ),
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="mode")
    subparsers.add_parser("self-test-fresh", help="exercise the fresh-data plotting route")
    fresh = subparsers.add_parser("fresh", help="plot two fresh bands.x .gnu branches")
    fresh.add_argument("--branch-a", type=Path, required=True)
    fresh.add_argument("--branch-b", type=Path, required=True)
    fresh.add_argument("--bands-output-a", type=Path, required=True)
    fresh.add_argument("--bands-output-b", type=Path, required=True)
    fresh.add_argument("--energy-reference-ev", type=float, required=True)
    fresh.add_argument("--emin-ev", type=float, required=True, help="lower displayed energy relative to the reference")
    fresh.add_argument("--emax-ev", type=float, required=True, help="upper displayed energy relative to the reference")
    fresh.add_argument("--labels-a", default="Γ,X,U", help="comma-separated labels for branch A")
    fresh.add_argument("--labels-b", default="K,Γ,L,W,X", help="comma-separated labels for branch B")
    fresh.add_argument("--reference-label", default="declared reference")
    fresh.add_argument("--title", default="Fresh QE band-path output")
    fresh.add_argument("--svg", type=Path, required=True)
    args = parser.parse_args()

    if args.mode == "self-test-fresh":
        report = self_test_fresh_plot()
    elif args.mode == "fresh":
        report = write_fresh_svg(
            args.branch_a,
            args.branch_b,
            args.bands_output_a,
            args.bands_output_b,
            args.svg,
            args.energy_reference_ev,
            args.emin_ev,
            args.emax_ev,
            [label.strip() for label in args.labels_a.split(",")],
            [label.strip() for label in args.labels_b.split(",")],
            args.reference_label,
            args.title,
        )
    else:
        public = ROOT / "public/media/practical-guides/band-structure/build-reciprocal-path-ledger"
        public.mkdir(parents=True, exist_ok=True)
        report = run(public / "silicon-qe-bands.svg", DATA / "silicon-qe-bands.csv")
    print(json.dumps(report, indent=2))
