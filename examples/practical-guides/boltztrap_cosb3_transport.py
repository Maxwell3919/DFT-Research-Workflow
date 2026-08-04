from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path


DATA = Path(__file__).with_name("data") / "boltztrap-cosb3-condtens-20260804.json"
EXPECTED_SNAPSHOT_SHA256 = "1970e5083fb97a4f92ce7112f7d426929bddd566a0b05378226982e4d3e0691e"


def run() -> dict[str, object]:
    raw = DATA.read_bytes()
    snapshot_hash = hashlib.sha256(raw).hexdigest()
    record = json.loads(raw)
    source = record["source"]
    rows = record["rows"]

    assert snapshot_hash == EXPECTED_SNAPSHOT_SHA256
    assert source["commit"] == "7ed9146c42d671562daee86d87e253fcbdedaeab"
    assert source["archive_sha256"] == "ec88d20ae4d00bd58ea98277ef8ee45281eb807160d3955406a819931f3f5169"
    assert source["member_sha256"] == "67b6d7e26fa62b4e0a0b56415fa87bade2b764f472b2ed627b09484fa7f81939"
    assert source["license"] == "GPL-3.0-or-later"
    assert record["material"] == "CoSb3"
    assert len(rows) == 14

    temperatures = [row["temperature_K"] for row in rows]
    assert temperatures == list(range(100, 751, 50))
    assert record["selection"]["energy_coordinate_Ry"] == 0.5547
    assert rows[0]["sigma_xx_per_tau"] == 2.49273e18
    assert rows[4]["sigma_xx_per_tau"] == 1.3139e18
    assert rows[-1]["seebeck_xx_V_per_K"] == 0.000157637
    assert all(a < b for a, b in zip(temperatures, temperatures[1:]))

    sign_brackets = []
    for left, right in zip(rows, rows[1:]):
        if left["seebeck_xx_V_per_K"] * right["seebeck_xx_V_per_K"] < 0:
            sign_brackets.append([left["temperature_K"], right["temperature_K"]])
    assert sign_brackets == [[200, 250]]

    return {
        "fixture_type": "frozen public-output post-processing",
        "material": record["material"],
        "snapshot_sha256": snapshot_hash,
        "source_commit": source["commit"],
        "source_archive_sha256": source["archive_sha256"],
        "source_member_sha256": source["member_sha256"],
        "row_count": len(rows),
        "temperature_range_K": [temperatures[0], temperatures[-1]],
        "seebeck_sign_change_brackets_K": sign_brackets,
        "rows": rows,
        "evidence_boundary": record["evidence_boundary"],
    }


def render_svg(report: dict[str, object], target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    rows = report["rows"]
    left, right = 105, 900
    top1, bottom1 = 105, 315
    top2, bottom2 = 375, 585
    tmin, tmax = 100, 750
    sig_min, sig_max = 1.2e18, 3.0e18
    see_min, see_max = -400.0, 200.0

    sx = lambda value: left + (value - tmin) / (tmax - tmin) * (right - left)
    sy1 = lambda value: bottom1 - (value - sig_min) / (sig_max - sig_min) * (bottom1 - top1)
    sy2 = lambda value: bottom2 - (value - see_min) / (see_max - see_min) * (bottom2 - top2)
    sigma_points = " ".join(f'{sx(row["temperature_K"]):.1f},{sy1(row["sigma_xx_per_tau"]):.1f}' for row in rows)
    seebeck_points = " ".join(f'{sx(row["temperature_K"]):.1f},{sy2(row["seebeck_xx_V_per_K"] * 1e6):.1f}' for row in rows)

    parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700" viewBox="0 0 1000 700" role="img" aria-labelledby="title desc">',
        '<title id="title">CoSb3 BoltzTraP transport output as a function of temperature</title>',
        '<desc id="desc">Original two-panel redraw of a published CoSb3 condtens output. The upper panel shows diagonal conductivity divided by relaxation time and the lower panel shows diagonal Seebeck coefficient, which changes sign between 200 and 250 kelvin.</desc>',
        '<rect width="1000" height="700" fill="#f8f5ee"/>',
        '<text x="55" y="46" font-family="sans-serif" font-size="25" font-weight="700" fill="#172a3a">CoSb₃: a real output still carries a model boundary</text>',
        '<text x="55" y="72" font-family="sans-serif" font-size="14" fill="#52616b">Fixed source energy coordinate 0.5547 Ry · diagonal xx components</text>',
    ]
    for top, bottom in [(top1, bottom1), (top2, bottom2)]:
        parts += [
            f'<line x1="{left}" y1="{top}" x2="{left}" y2="{bottom}" stroke="#263746"/>',
            f'<line x1="{left}" y1="{bottom}" x2="{right}" y2="{bottom}" stroke="#263746"/>',
        ]
    for tick in [100, 200, 300, 400, 500, 600, 700]:
        x = sx(tick)
        parts += [
            f'<line x1="{x:.1f}" y1="{top1}" x2="{x:.1f}" y2="{bottom1}" stroke="#dde2e4"/>',
            f'<line x1="{x:.1f}" y1="{top2}" x2="{x:.1f}" y2="{bottom2}" stroke="#dde2e4"/>',
            f'<text x="{x:.1f}" y="610" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#52616b">{tick}</text>',
        ]
    for value in [1.5e18, 2.0e18, 2.5e18, 3.0e18]:
        y = sy1(value)
        parts += [f'<line x1="{left}" y1="{y:.1f}" x2="{right}" y2="{y:.1f}" stroke="#dde2e4"/>', f'<text x="{left-12}" y="{y+5:.1f}" text-anchor="end" font-family="sans-serif" font-size="13" fill="#52616b">{value/1e18:.1f}</text>']
    for value in [-400, -200, 0, 200]:
        y = sy2(value)
        color = "#87949b" if value == 0 else "#dde2e4"
        width = 2 if value == 0 else 1
        parts += [f'<line x1="{left}" y1="{y:.1f}" x2="{right}" y2="{y:.1f}" stroke="{color}" stroke-width="{width}"/>', f'<text x="{left-12}" y="{y+5:.1f}" text-anchor="end" font-family="sans-serif" font-size="13" fill="#52616b">{value}</text>']
    parts += [
        f'<polyline points="{sigma_points}" fill="none" stroke="#2b6f8c" stroke-width="4" stroke-linejoin="round"/>',
        f'<polyline points="{seebeck_points}" fill="none" stroke="#d45b45" stroke-width="4" stroke-linejoin="round"/>',
    ]
    for row in rows:
        x = sx(row["temperature_K"])
        parts += [
            f'<circle cx="{x:.1f}" cy="{sy1(row["sigma_xx_per_tau"]):.1f}" r="5" fill="#2b6f8c"/>',
            f'<circle cx="{x:.1f}" cy="{sy2(row["seebeck_xx_V_per_K"] * 1e6):.1f}" r="5" fill="#d45b45"/>',
        ]
    x_a, x_b = sx(200), sx(250)
    parts += [
        f'<rect x="{x_a:.1f}" y="{top2}" width="{x_b-x_a:.1f}" height="{bottom2-top2}" fill="#f0c86a" opacity="0.22"/>',
        f'<text x="{(x_a+x_b)/2:.1f}" y="{top2+20}" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#6b5520">stored sign-change bracket</text>',
        '<text x="28" y="210" transform="rotate(-90 28 210)" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#263746">σxx/τ (10¹⁸ in source units)</text>',
        '<text x="28" y="480" transform="rotate(-90 28 480)" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#263746">Sxx (µV K⁻¹)</text>',
        '<text x="500" y="635" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#263746">Temperature (K)</text>',
        '<text x="500" y="666" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#52616b">Original redraw of BoltzTraP2 GPL-3.0-or-later data · commit 7ed9146 · no DFT or transport rerun</text>',
        '<text x="500" y="684" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#52616b">A plotted source output does not establish relaxation time, convergence, or experimental behaviour.</text>',
        '</svg>',
    ]
    target.write_text("".join(parts), encoding="utf-8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--svg", type=Path)
    args = parser.parse_args()
    result = run()
    if args.svg:
        render_svg(result, args.svg)
    print(json.dumps(result, indent=2))
