"""Reconstruct a labelled teaching plot from committed QE 7.5 Silicon evidence."""
from __future__ import annotations

import csv
import hashlib
import json
import math
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
    public = ROOT / "public/media/practical-guides/band-structure/build-reciprocal-path-ledger"
    public.mkdir(parents=True, exist_ok=True)
    print(json.dumps(run(public / "silicon-qe-bands.svg", DATA / "silicon-qe-bands.csv"), indent=2))
