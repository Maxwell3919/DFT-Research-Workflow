"""Rebuild a binary convex hull from a frozen public OQMD Li-P snapshot."""

from __future__ import annotations

import argparse
import json
import re
from collections import defaultdict
from pathlib import Path
from typing import Any
from xml.sax.saxutils import escape


ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = ROOT / "examples/practical-guides/data/oqmd-li-p-binary-20260804.json"
FORMULA = re.compile(r"Li(?P<li>\d*)P(?P<p>\d*)$")


def phosphorus_fraction(formula: str) -> float:
    match = FORMULA.fullmatch(formula)
    if not match:
        raise ValueError(f"unsupported Li-P formula: {formula}")
    lithium = int(match.group("li") or "1")
    phosphorus = int(match.group("p") or "1")
    return phosphorus / (lithium + phosphorus)


def load_snapshot() -> tuple[dict[str, Any], list[dict[str, Any]]]:
    snapshot = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    fields = snapshot["fields"]
    entries = [dict(zip(fields, row, strict=True)) for row in snapshot["entries"]]
    if len(entries) != 46:
        raise RuntimeError(f"expected 46 frozen OQMD rows, found {len(entries)}")
    for entry in entries:
        entry["x_p"] = phosphorus_fraction(entry["name"])
    return snapshot, entries


def select_lowest_at_each_composition(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[float, list[dict[str, Any]]] = defaultdict(list)
    for entry in entries:
        grouped[entry["x_p"]].append(entry)
    selected = [
        min(group, key=lambda item: (item["delta_e_eV_per_atom"], item["entry_id"], item["calculation_label"]))
        for group in grouped.values()
    ]
    selected.extend([
        {"name": "Li", "entry_id": None, "x_p": 0.0, "delta_e_eV_per_atom": 0.0, "stability_eV_per_atom": 0.0},
        {"name": "P", "entry_id": None, "x_p": 1.0, "delta_e_eV_per_atom": 0.0, "stability_eV_per_atom": 0.0},
    ])
    return sorted(selected, key=lambda item: item["x_p"])


def lower_hull(points: list[dict[str, Any]]) -> list[dict[str, Any]]:
    hull: list[dict[str, Any]] = []
    for point in sorted(points, key=lambda item: item["x_p"]):
        while len(hull) >= 2:
            first, second = hull[-2], hull[-1]
            cross = ((second["x_p"] - first["x_p"]) * (point["delta_e_eV_per_atom"] - first["delta_e_eV_per_atom"])
                     - (second["delta_e_eV_per_atom"] - first["delta_e_eV_per_atom"]) * (point["x_p"] - first["x_p"]))
            if cross > 1e-12:
                break
            hull.pop()
        hull.append(point)
    return hull


def interpolate_hull(hull: list[dict[str, Any]], x_p: float) -> tuple[float, dict[str, Any], dict[str, Any], float, float]:
    for left, right in zip(hull, hull[1:], strict=True):
        if left["x_p"] - 1e-12 <= x_p <= right["x_p"] + 1e-12:
            span = right["x_p"] - left["x_p"]
            right_weight = (x_p - left["x_p"]) / span
            left_weight = 1.0 - right_weight
            energy = left_weight * left["delta_e_eV_per_atom"] + right_weight * right["delta_e_eV_per_atom"]
            return energy, left, right, left_weight, right_weight
    raise ValueError(f"composition {x_p} lies outside the hull")


def analyze(entries: list[dict[str, Any]], excluded_entry_id: int | None = None) -> dict[str, Any]:
    accepted = [entry for entry in entries if entry["entry_id"] != excluded_entry_id]
    selected = select_lowest_at_each_composition(accepted)
    hull = lower_hull(selected)
    assessed = []
    for entry in accepted:
        hull_energy, left, right, left_weight, right_weight = interpolate_hull(hull, entry["x_p"])
        assessed.append({
            **entry,
            "recomputed_above_hull_eV_per_atom": entry["delta_e_eV_per_atom"] - hull_energy,
            "left_product": left["name"],
            "right_product": right["name"],
            "left_atomic_fraction": left_weight,
            "right_atomic_fraction": right_weight,
        })
    return {"selected": selected, "hull": hull, "assessed": assessed}


def run() -> dict[str, Any]:
    snapshot, entries = load_snapshot()
    baseline = analyze(entries)
    residuals = [abs(row["recomputed_above_hull_eV_per_atom"] - row["stability_eV_per_atom"]) for row in baseline["assessed"]]
    li2p = next(row for row in baseline["assessed"] if row["entry_id"] == 2053605)
    li4p3 = next(row for row in baseline["assessed"] if row["entry_id"] == 2053607)
    without_lip = analyze(entries, excluded_entry_id=17007)
    li4p3_without_lip = next(row for row in without_lip["assessed"] if row["entry_id"] == 2053607)
    report = {
        "source": snapshot["source"],
        "source_timestamp": snapshot["source_timestamp"],
        "retrieved_at": snapshot["retrieved_at"],
        "license": snapshot["license"],
        "database_rows": len(entries),
        "unique_compositions": len({entry["x_p"] for entry in entries}),
        "hull_vertices": [
            {"formula": point["name"], "entry_id": point["entry_id"], "x_p": point["x_p"], "formation_energy_eV_per_atom": point["delta_e_eV_per_atom"]}
            for point in baseline["hull"]
        ],
        "max_abs_difference_from_oqmd_stability_eV_per_atom": max(residuals),
        "li2p_case": {
            "entry_id": li2p["entry_id"],
            "formation_energy_eV_per_atom": li2p["delta_e_eV_per_atom"],
            "recomputed_above_hull_eV_per_atom": li2p["recomputed_above_hull_eV_per_atom"],
            "decomposition_endpoints": [li2p["left_product"], li2p["right_product"]],
            "atomic_fractions": [li2p["left_atomic_fraction"], li2p["right_atomic_fraction"]],
        },
        "phase_set_sensitivity": {
            "excluded_entry_id": 17007,
            "excluded_formula": "LiP",
            "affected_entry_id": li4p3["entry_id"],
            "affected_formula": li4p3["name"],
            "above_hull_before_eV_per_atom": li4p3["recomputed_above_hull_eV_per_atom"],
            "above_hull_after_eV_per_atom": li4p3_without_lip["recomputed_above_hull_eV_per_atom"],
            "hull_vertices_after_exclusion": [point["name"] for point in without_lip["hull"]],
        },
        "evidence_boundary": (
            "This rebuilds geometry from a frozen public OQMD DFT-data snapshot. It does not rerun DFT, prove database completeness, "
            "establish finite-temperature equilibrium, or predict synthesis."
        ),
    }
    # The API snapshot rounds energies and stability values independently; agreement at
    # 1e-8 eV/atom is therefore a reconstruction check, not a numerical-precision claim.
    assert report["max_abs_difference_from_oqmd_stability_eV_per_atom"] < 1e-8
    assert [point["formula"] for point in report["hull_vertices"]] == ["Li", "Li3P", "LiP", "Li3P7", "Li3P11", "LiP7", "P"]
    assert report["li2p_case"]["decomposition_endpoints"] == ["Li3P", "LiP"]
    assert report["phase_set_sensitivity"]["above_hull_before_eV_per_atom"] > 0.004
    assert report["phase_set_sensitivity"]["above_hull_after_eV_per_atom"] < 1e-10
    return report


def render_svg(path: Path) -> None:
    snapshot, entries = load_snapshot()
    result = analyze(entries)
    width, height = 960, 540
    left, right, top, bottom = 92, 45, 58, 92
    plot_width, plot_height = width - left - right, height - top - bottom
    y_min, y_max = -0.84, 0.62

    def px(x: float) -> float:
        return left + x * plot_width

    def py(y: float) -> float:
        return top + (y_max - y) / (y_max - y_min) * plot_height

    hull_ids = {point["entry_id"] for point in result["hull"] if point["entry_id"] is not None}
    selected_ids = {point["entry_id"] for point in result["selected"] if point["entry_id"] is not None}
    hull_path = " ".join(f"{px(point['x_p']):.2f},{py(point['delta_e_eV_per_atom']):.2f}" for point in result["hull"])
    svg = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">',
        '<title id="title">Recomputed Li-P formation-energy convex hull from a frozen OQMD snapshot</title>',
        '<desc id="desc">Forty-six public OQMD database rows are shown by phosphorus fraction and formation energy. Lowest entries at each composition are emphasized and the recomputed lower hull connects Li, Li3P, LiP, Li3P7, Li3P11, LiP7, and P.</desc>',
        '<rect width="960" height="540" fill="#ffffff"/>',
        '<text x="92" y="30" font-family="Georgia,serif" font-size="20" fill="#1a1a1a">Li–P convex hull rebuilt from 46 public OQMD rows</text>',
    ]
    for tick in (-0.8, -0.6, -0.4, -0.2, 0.0, 0.2, 0.4, 0.6):
        svg.append(f'<line x1="{left}" y1="{py(tick):.2f}" x2="{width-right}" y2="{py(tick):.2f}" stroke="#e5e5e5"/>')
        svg.append(f'<text x="{left-12}" y="{py(tick)+5:.2f}" text-anchor="end" font-family="Arial,sans-serif" font-size="13" fill="#555">{tick:.1f}</text>')
    for tick in (0.0, 0.25, 0.5, 0.75, 1.0):
        svg.append(f'<line x1="{px(tick):.2f}" y1="{top}" x2="{px(tick):.2f}" y2="{height-bottom}" stroke="#eeeeee"/>')
        svg.append(f'<text x="{px(tick):.2f}" y="{height-bottom+25}" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" fill="#555">{tick:.2f}</text>')
    svg.extend([
        f'<line x1="{left}" y1="{height-bottom}" x2="{width-right}" y2="{height-bottom}" stroke="#222" stroke-width="1.5"/>',
        f'<line x1="{left}" y1="{top}" x2="{left}" y2="{height-bottom}" stroke="#222" stroke-width="1.5"/>',
        f'<polyline points="{hull_path}" fill="none" stroke="#171717" stroke-width="3"/>',
    ])
    for entry in entries:
        entry_id = entry["entry_id"]
        color = "#bd5d38" if entry_id in selected_ids else "#9aa1a8"
        radius = 5.2 if entry_id in hull_ids else (4.2 if entry_id in selected_ids else 3.0)
        svg.append(f'<circle cx="{px(entry["x_p"]):.2f}" cy="{py(entry["delta_e_eV_per_atom"]):.2f}" r="{radius}" fill="{color}" fill-opacity="0.85" stroke="#fff" stroke-width="0.8"/>')
    for point in result["hull"]:
        label = escape(point["name"])
        y_offset = 20 if point["name"] in {"Li3P11", "LiP7"} else -12
        svg.append(f'<text x="{px(point["x_p"]):.2f}" y="{py(point["delta_e_eV_per_atom"])+y_offset:.2f}" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="#171717">{label}</text>')
    svg.extend([
        f'<text x="{left+plot_width/2:.2f}" y="{height-43}" text-anchor="middle" font-family="Arial,sans-serif" font-size="15" fill="#222">phosphorus atomic fraction, x(P)</text>',
        f'<text x="25" y="{top+plot_height/2:.2f}" transform="rotate(-90 25 {top+plot_height/2:.2f})" text-anchor="middle" font-family="Arial,sans-serif" font-size="15" fill="#222">formation energy (eV/atom)</text>',
        '<circle cx="650" cy="32" r="3" fill="#9aa1a8"/><text x="660" y="37" font-family="Arial,sans-serif" font-size="12" fill="#555">all returned rows</text>',
        '<circle cx="785" cy="32" r="4" fill="#bd5d38"/><text x="796" y="37" font-family="Arial,sans-serif" font-size="12" fill="#555">lowest per composition</text>',
        '<text x="92" y="515" font-family="Arial,sans-serif" font-size="12" fill="#555">OQMD REST API snapshot (CC BY 4.0), retrieved 2026-08-04. Original plot generated by li_p_convex_hull.py; no DFT was executed.</text>',
        '</svg>',
    ])
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(svg) + "\n", encoding="utf-8")


def render_sensitivity_svg(path: Path) -> None:
    _, entries = load_snapshot()
    baseline = analyze(entries)
    changed = analyze(entries, excluded_entry_id=17007)
    width, height = 960, 500
    left, panel_width, gap, top, bottom = 82, 385, 70, 66, 94
    y_min, y_max = -0.84, 0.08

    def px(x: float, offset: float) -> float:
        return offset + x * panel_width

    def py(y: float) -> float:
        return top + (y_max - y) / (y_max - y_min) * (height - top - bottom)

    panels = [
        ("Complete frozen candidate set", baseline, left),
        ("OQMD entry 17007 (LiP) withheld", changed, left + panel_width + gap),
    ]
    svg = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">',
        '<title id="title">Li-P convex-hull sensitivity to withholding one competing phase</title>',
        '<desc id="desc">Two plots compare the same frozen public OQMD data. With LiP entry 17007 present, Li4P3 lies slightly above the hull. With that competitor withheld, Li4P3 becomes a hull vertex, demonstrating phase-set sensitivity.</desc>',
        '<rect width="960" height="500" fill="#ffffff"/>',
        '<text x="82" y="30" font-family="Georgia,serif" font-size="20" fill="#1a1a1a">One missing competitor changes the Li–P lower envelope</text>',
    ]
    for label, result, offset in panels:
        for tick in (-0.8, -0.6, -0.4, -0.2, 0.0):
            svg.append(f'<line x1="{offset}" y1="{py(tick):.2f}" x2="{offset+panel_width}" y2="{py(tick):.2f}" stroke="#e8e8e8"/>')
        svg.extend([
            f'<line x1="{offset}" y1="{height-bottom}" x2="{offset+panel_width}" y2="{height-bottom}" stroke="#222"/>',
            f'<line x1="{offset}" y1="{top}" x2="{offset}" y2="{height-bottom}" stroke="#222"/>',
            f'<text x="{offset+panel_width/2:.2f}" y="54" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" font-weight="700" fill="#333">{escape(label)}</text>',
        ])
        hull_path = " ".join(f"{px(point['x_p'], offset):.2f},{py(point['delta_e_eV_per_atom']):.2f}" for point in result["hull"])
        svg.append(f'<polyline points="{hull_path}" fill="none" stroke="#171717" stroke-width="3"/>')
        selected_ids = {point["entry_id"] for point in result["selected"] if point["entry_id"] is not None}
        hull_ids = {point["entry_id"] for point in result["hull"] if point["entry_id"] is not None}
        for entry in result["assessed"]:
            entry_id = entry["entry_id"]
            if entry_id not in selected_ids:
                continue
            color = "#bd5d38" if entry_id in hull_ids else "#78838c"
            radius = 4.8 if entry_id in hull_ids else 3.8
            svg.append(f'<circle cx="{px(entry["x_p"], offset):.2f}" cy="{py(entry["delta_e_eV_per_atom"]):.2f}" r="{radius}" fill="{color}" stroke="#fff" stroke-width="0.8"/>')
        target = next(row for row in result["assessed"] if row["entry_id"] == 2053607)
        svg.append(f'<circle cx="{px(target["x_p"], offset):.2f}" cy="{py(target["delta_e_eV_per_atom"]):.2f}" r="9" fill="none" stroke="#286f8e" stroke-width="2"/>')
        state = "4.526 meV/atom above hull" if result is baseline else "hull vertex in reduced set"
        svg.append(f'<text x="{px(target["x_p"], offset):.2f}" y="{py(target["delta_e_eV_per_atom"])-15:.2f}" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="700" fill="#286f8e">Li₄P₃: {state}</text>')
    svg.extend([
        '<text x="480" y="440" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#222">phosphorus atomic fraction, x(P)</text>',
        '<text x="22" y="238" transform="rotate(-90 22 238)" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#222">formation energy (eV/atom)</text>',
        '<text x="82" y="480" font-family="Arial,sans-serif" font-size="12" fill="#555">OQMD REST API snapshot (CC BY 4.0), retrieved 2026-08-04. Original comparison; no DFT was executed.</text>',
        '</svg>',
    ])
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(svg) + "\n", encoding="utf-8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--svg", type=Path)
    parser.add_argument("--sensitivity-svg", type=Path)
    arguments = parser.parse_args()
    report = run()
    if arguments.svg:
        render_svg(arguments.svg)
    if arguments.sensitivity_svg:
        render_sensitivity_svg(arguments.sensitivity_svg)
    print(json.dumps(report, indent=2))
