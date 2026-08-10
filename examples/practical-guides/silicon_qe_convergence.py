from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "examples/practical-guides/data/silicon-qe/convergence"
EXPECTED = {
    "si_e30_k6.out": "349854748a5288dcd27704797bf4e63ee86414b802591dd3b2d4738c234b86b5",
    "si_e30_k8.out": "3f70ca07183b77ac0e2322077b0d3d3fe929fcda9710afa37840ca3c0e3ef2a7",
    "si_e30_k10.out": "8b5424b52f08ebb1e079f0293d6c03c599e05c6737e8ee6d17e6bffd975290e6",
    "si_e40_k6.out": "cebd59aa635954352dd07a4f4150d4db50901a66b4e2df01f50c80e5aaa772ea",
    "si_e40_k8.out": "d4abab49a805fb8a7808e0f82dc4dcbf1548d3c7482b726c66c266fd84c0d6c2",
    "si_e40_k10.out": "943502816834623b7ffdbaff75300208a0a296ab9613e9dc5c46a45ee133a4eb",
    "si_e50_k6.out": "31ad9449e0dcb920942c2e2eae6091e85187dafb9b70941a686ea58d3ed9337f",
    "si_e50_k8.out": "94d7173a584cd2b8c4dcc181a3fb02c2553bdb1db60577725f0c724b1ca0348d",
    "si_e50_k10.out": "4593e3586e535581d5035765dc74654d2946ad62887e340b2105dec768fc6b2d",
}
SCF_CONVERGENCE = re.compile(
    r"(?im)^\s+convergence has been achieved in\s+\d+\s+iterations\s*$"
)


def _sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def run() -> dict[str, object]:
    rows = []
    for name, expected in EXPECTED.items():
        path = DATA / name
        assert _sha(path) == expected, f"hash mismatch: {name}"
        text = path.read_text(encoding="utf8")
        assert SCF_CONVERGENCE.search(text) and "JOB DONE" in text
        energy = float(re.findall(r"!\s+total energy\s+=\s+([-0-9.]+) Ry", text)[-1])
        ecut, mesh = map(int, re.match(r"si_e(\d+)_k(\d+).out", name).groups())
        rows.append({"ecutwfc_Ry": ecut, "k_mesh": mesh, "energy_Ry": energy, "file": name})
    rows.sort(key=lambda row: (row["ecutwfc_Ry"], row["k_mesh"]))
    reference = next(row for row in rows if row["ecutwfc_Ry"] == 50 and row["k_mesh"] == 10)
    for row in rows:
        row["delta_to_50Ry_10cubed_mRy"] = (row["energy_Ry"] - reference["energy_Ry"]) * 1000
    return {
        "material": "COD 9013102 silicon primitive cell",
        "software": "Quantum ESPRESSO 7.5 pw.x",
        "pseudopotential_sha256": "ae3aefd0811f9499dbc4a72f1f9ae02ef4fc7f3568bf6f559b68668719c69e2b",
        "rows": rows,
        "reference_row": reference,
        "all_runs_electronically_converged": True,
        "boundary": "A bounded 3 by 3 teaching matrix only. It does not establish a transferable cutoff, a converged force/stress or band observable, experimental agreement, or a material conclusion.",
    }


def _svg(report: dict[str, object], output: Path, mode: str) -> None:
    rows = report["rows"]
    assert isinstance(rows, list)
    if mode == "cutoff":
        groups = {k: [r for r in rows if r["k_mesh"] == k] for k in (6, 8, 10)}
        title, xkey, label = "Actual Silicon QE cutoff matrix", "ecutwfc_Ry", "wavefunction cutoff (Ry)"
        series_label = lambda key: f"{key}×{key}×{key} k mesh"
        fixed_note = "fixed: structure, PBE UPF, occupations='fixed'; ecutrho = 8 × ecutwfc"
    else:
        groups = {e: [r for r in rows if r["ecutwfc_Ry"] == e] for e in (30, 40, 50)}
        title, xkey, label = "Actual Silicon QE k-mesh matrix", "k_mesh", "cubic k mesh"
        series_label = lambda key: f"ecutwfc = {key} Ry"
        fixed_note = "fixed: structure, PBE UPF, occupations='fixed'; ecutrho = 8 × ecutwfc"
    x_values = sorted({int(row[xkey]) for row in rows})
    x_positions = {value: 150 + index * 280 for index, value in enumerate(x_values)}
    y_top, y_bottom, y_max = 120.0, 390.0, 2.0

    def y_position(value: float) -> float:
        return y_bottom - min(max(value, 0.0), y_max) / y_max * (y_bottom - y_top)

    colors = ["#2b6f8c", "#a33d2d", "#5c7d46"]
    lines = []
    for color, (key, group) in zip(colors, groups.items()):
        group.sort(key=lambda r: r[xkey])
        points = " ".join(
            f"{x_positions[int(row[xkey])]},{y_position(float(row['delta_to_50Ry_10cubed_mRy'])):.1f}"
            for row in group
        )
        circles = "".join(
            f'<circle cx="{x_positions[int(row[xkey])]}" cy="{y_position(float(row["delta_to_50Ry_10cubed_mRy"])):.1f}" r="5" fill="{color}"/>'
            for row in group
        )
        legend_y = 145 + 31 * len(lines)
        lines.append(
            f'<polyline points="{points}" fill="none" stroke="{color}" stroke-width="3"/>{circles}'
            f'<line x1="770" y1="{legend_y - 5}" x2="804" y2="{legend_y - 5}" stroke="{color}" stroke-width="3"/>'
            f'<circle cx="787" cy="{legend_y - 5}" r="4" fill="{color}"/>'
            f'<text x="814" y="{legend_y}" font-family="sans-serif" font-size="15" fill="{color}">{series_label(key)}</text>'
        )
    x_ticks = "".join(
        f'<line x1="{x_positions[value]}" y1="390" x2="{x_positions[value]}" y2="398" stroke="#243746"/>'
        f'<text x="{x_positions[value]}" y="420" text-anchor="middle" font-family="sans-serif" font-size="15">{value}</text>'
        for value in x_values
    )
    y_ticks = "".join(
        f'<line x1="142" y1="{y_position(value):.1f}" x2="710" y2="{y_position(value):.1f}" stroke="#d9d4ca"/>'
        f'<text x="130" y="{y_position(value) + 5:.1f}" text-anchor="end" font-family="sans-serif" font-size="14">{value:.1f}</text>'
        for value in (0.0, 0.5, 1.0, 1.5, 2.0)
    )
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="540" viewBox="0 0 1000 540" role="img" aria-labelledby="t d"><title id="t">{title}</title><desc id="d">Nine actual Quantum ESPRESSO Silicon SCF total energies, plotted relative to the 50 Ry, ten by ten by ten mesh row. {fixed_note}.</desc><rect width="1000" height="540" fill="#f8f5ee"/><text x="60" y="48" font-family="sans-serif" font-size="26" font-weight="700" fill="#172a3a">{title}</text><text x="60" y="75" font-family="sans-serif" font-size="14" fill="#52616b">QE 7.5 · COD 9013102 · nine actual electronically converged SCF points</text>{y_ticks}<path d="M142 110V390H710" fill="none" stroke="#243746" stroke-width="2"/>{x_ticks}<text x="426" y="456" text-anchor="middle" font-family="sans-serif" font-size="16">{label}</text><text x="34" y="255" transform="rotate(-90 34 255)" text-anchor="middle" font-family="sans-serif" font-size="16">E − E(50 Ry, 10³) (mRy/cell)</text>{''.join(lines)}<text x="60" y="489" font-family="sans-serif" font-size="13" fill="#52616b">{fixed_note}</text><text x="60" y="516" font-family="sans-serif" font-size="13" fill="#52616b">Bounded teaching series: no independent ecutrho, force/stress, band, DOS, or material-convergence claim.</text></svg>''', encoding="utf8")


if __name__ == "__main__":
    report = run()
    public = ROOT / "public/media/practical-guides/test-numerical-convergence"
    _svg(report, public / "converge-basis-cutoffs-and-grids/silicon-qe-cutoff-matrix.svg", "cutoff")
    _svg(report, public / "converge-k-points-and-smearing/silicon-qe-kmesh-matrix.svg", "mesh")
    print(json.dumps(report, indent=2))
