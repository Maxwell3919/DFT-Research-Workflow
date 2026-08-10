from __future__ import annotations

import hashlib
import json
import math
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "examples/practical-guides/data/silicon-qe/relax"
OUTPUT_SHA256 = "546a5b13878429c434e3957b115eb620dcaa5f5464ab0492b690c66d0ec1fac7"
INPUT_SHA256 = "5c1ac303baa15b1414f1fbbcf4552a978d45246876c6b49540ca917662ba5aff"


def log_y(value: float, top: float, bottom: float, y_min: float, y_max: float) -> float:
    bounded = min(max(value, y_min), y_max)
    fraction = (math.log10(bounded) - math.log10(y_min)) / (math.log10(y_max) - math.log10(y_min))
    return bottom - fraction * (bottom - top)


def parse_force_blocks(source: str) -> list[list[float]]:
    blocks = re.findall(
        r"Forces acting on atoms \(cartesian axes, Ry/au\):\s*(.*?)(?=\n\s*Total force)",
        source,
        flags=re.S,
    )
    parsed: list[list[float]] = []
    for block in blocks:
        components = [
            float(value)
            for row in re.findall(
                r"atom\s+\d+\s+type\s+\d+\s+force\s*=\s*"
                r"([-+0-9.Ee]+)\s+([-+0-9.Ee]+)\s+([-+0-9.Ee]+)",
                block,
            )
            for value in row
        ]
        if not components:
            raise ValueError("force block contains no atomic Cartesian components")
        parsed.append(components)
    return parsed


def parse_final_scf_accuracies(source: str) -> list[float]:
    sections = source.split("convergence has been achieved")[:-1]
    accuracies = []
    for section in sections:
        values = re.findall(r"estimated scf accuracy\s*<\s*([-+0-9.Ee]+) Ry", section)
        if not values:
            raise ValueError("SCF convergence marker has no preceding estimated accuracy")
        accuracies.append(float(values[-1]))
    return accuracies


def run() -> dict[str, object]:
    output_bytes = (DATA / "si-relax.out").read_bytes()
    input_bytes = (DATA / "si-relax.in").read_bytes()
    assert hashlib.sha256(output_bytes).hexdigest() == OUTPUT_SHA256
    assert hashlib.sha256(input_bytes).hexdigest() == INPUT_SHA256
    source = output_bytes.decode("utf-8")
    input_source = input_bytes.decode("utf-8")
    assert "End of BFGS Geometry Optimization" in source and "JOB DONE" in source

    threshold_match = re.search(r"forc_conv_thr\s*=\s*([-+0-9.dDeE]+)", input_source)
    if not threshold_match:
        raise ValueError("input has no declared forc_conv_thr")
    component_threshold = float(threshold_match.group(1).replace("d", "e").replace("D", "E"))

    energies = [float(value) for value in re.findall(r"!\s+total energy\s+=\s+([-0-9.]+) Ry", source)]
    total_forces = [float(value) for value in re.findall(r"Total force =\s*([-0-9.]+)", source)]
    force_blocks = parse_force_blocks(source)
    max_components = [max(abs(value) for value in block) for block in force_blocks]
    scf_iterations = [int(value) for value in re.findall(r"convergence has been achieved in\s+(\d+) iterations", source)]
    scf_accuracies = parse_final_scf_accuracies(source)
    assert len(energies) == len(total_forces) == len(force_blocks) == len(scf_iterations) == len(scf_accuracies) == 5
    assert max_components[-1] <= component_threshold

    ionic_steps = [
        {
            "step": index + 1,
            "energy_Ry": energy,
            "max_abs_free_component_Ry_per_bohr": max_component,
            "qe_total_force_Ry_per_bohr": total_force,
            "scf_iterations": iterations,
            "final_estimated_scf_accuracy_Ry": accuracy,
        }
        for index, (energy, max_component, total_force, iterations, accuracy) in enumerate(
            zip(energies, max_components, total_forces, scf_iterations, scf_accuracies)
        )
    ]
    return {
        "material": "COD 9013102 silicon, intentionally displaced two-site primitive cell",
        "software": "Quantum ESPRESSO 7.5 pw.x",
        "calculation": "fixed-cell BFGS relax; all atomic coordinates active",
        "input_sha256": INPUT_SHA256,
        "output_sha256": OUTPUT_SHA256,
        "declared_component_threshold_Ry_per_bohr": component_threshold,
        "ionic_steps": ionic_steps,
        "electronic_convergence_markers": len(scf_iterations),
        "geometry_completion_marker": True,
        "final_component_gate_passed": max_components[-1] <= component_threshold,
        "stress_history_present": False,
        "boundary": (
            "The final free Cartesian force components pass the declared threshold for this fixed-cell teaching run, "
            "and QE reports BFGS completion. The printed aggregate Total force is retained separately. No stress/cell "
            "optimization, independent-start, global-minimum, observable-convergence, or material-validity claim follows."
        ),
    }


def write_force_svg(report: dict[str, object], output: Path) -> None:
    rows = report["ionic_steps"]
    width, height = 1000, 540
    left, right, top, bottom = 120, 900, 105, 420
    x = lambda index: left + (right - left) * index / max(1, len(rows) - 1)
    y = lambda value: log_y(float(value), top, bottom, 1e-5, 1e-1)
    component_points = " ".join(
        f'{x(index):.1f},{y(row["max_abs_free_component_Ry_per_bohr"]):.1f}' for index, row in enumerate(rows)
    )
    total_points = " ".join(
        f'{x(index):.1f},{y(row["qe_total_force_Ry_per_bohr"]):.1f}' for index, row in enumerate(rows)
    )
    threshold = float(report["declared_component_threshold_Ry_per_bohr"])
    ticks = []
    for exponent in range(-1, -6, -1):
        value = 10.0**exponent
        yy = y(value)
        ticks.append(
            f'<line x1="{left}" y1="{yy:.1f}" x2="{right}" y2="{yy:.1f}" stroke="#d8d2c8"/>'
            f'<text x="{left-14}" y="{yy+5:.1f}" text-anchor="end" font-family="sans-serif" font-size="14">10^{exponent}</text>'
        )
    circles = []
    for index, row in enumerate(rows):
        circles.append(
            f'<circle cx="{x(index):.1f}" cy="{y(row["max_abs_free_component_Ry_per_bohr"]):.1f}" r="6" fill="#a33d2d"/>'
            f'<circle cx="{x(index):.1f}" cy="{y(row["qe_total_force_Ry_per_bohr"]):.1f}" r="5" fill="#2b6f8c"/>'
            f'<text x="{x(index):.1f}" y="{bottom+27}" text-anchor="middle" font-family="sans-serif" font-size="14">{index+1}</text>'
        )
    threshold_y = y(threshold)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        "\n".join(
            [
                f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">',
                '<title id="title">Actual Silicon fixed-cell force history</title>',
                '<desc id="desc">Maximum absolute free Cartesian force component and the separately reported Quantum ESPRESSO aggregate Total force for five ionic evaluations.</desc>',
                '<rect width="100%" height="100%" fill="white"/>',
                '<text x="70" y="42" font-family="sans-serif" font-size="25" font-weight="700">Silicon fixed-cell relaxation: inspect components, not one stop line</text>',
                '<text x="70" y="70" font-family="sans-serif" font-size="15" fill="#52616b">QE 7.5 · hash-bound output · all atomic components active · cell fixed</text>',
                *ticks,
                f'<line x1="{left}" y1="{top}" x2="{left}" y2="{bottom}" stroke="#243746" stroke-width="2"/>',
                f'<line x1="{left}" y1="{bottom}" x2="{right}" y2="{bottom}" stroke="#243746" stroke-width="2"/>',
                f'<line x1="{left}" y1="{threshold_y:.1f}" x2="{right}" y2="{threshold_y:.1f}" stroke="#7b2f24" stroke-width="2" stroke-dasharray="7 5"/>',
                f'<text x="{right}" y="{threshold_y-8:.1f}" text-anchor="end" font-family="sans-serif" font-size="13" fill="#7b2f24">declared component threshold 1e-4 Ry/bohr</text>',
                f'<polyline points="{component_points}" fill="none" stroke="#a33d2d" stroke-width="3"/>',
                f'<polyline points="{total_points}" fill="none" stroke="#2b6f8c" stroke-width="3"/>',
                *circles,
                '<line x1="650" y1="91" x2="688" y2="91" stroke="#a33d2d" stroke-width="3"/><text x="697" y="96" font-family="sans-serif" font-size="13">max |free Cartesian component|</text>',
                '<line x1="650" y1="113" x2="688" y2="113" stroke="#2b6f8c" stroke-width="3"/><text x="697" y="118" font-family="sans-serif" font-size="13">QE printed Total force</text>',
                '<text x="510" y="480" text-anchor="middle" font-family="sans-serif" font-size="16">ionic evaluation</text>',
                '<text x="32" y="270" transform="rotate(-90 32 270)" text-anchor="middle" font-family="sans-serif" font-size="16">force (Ry/bohr, log scale)</text>',
                '<text x="500" y="520" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#52616b">Component gate passes only for this fixed-cell run; no stress, cell, global-minimum, or material conclusion.</text>',
                '</svg>',
                '',
            ]
        ),
        encoding="utf-8",
    )


def write_scf_svg(report: dict[str, object], output: Path) -> None:
    rows = report["ionic_steps"]
    width, height = 1000, 520
    bar_left, bar_right = 90, 460
    residual_left, residual_right = 570, 930
    top, bottom = 110, 405
    bar_x = lambda index: bar_left + 45 + index * 68
    residual_x = lambda index: residual_left + 25 + index * 78
    residual_y = lambda value: log_y(float(value), top, bottom, 1e-13, 1e-10)
    bars = []
    residual_points = []
    for index, row in enumerate(rows):
        iterations = int(row["scf_iterations"])
        bx = bar_x(index)
        bar_height = iterations / 12 * (bottom - top)
        bars.append(
            f'<rect x="{bx-17}" y="{bottom-bar_height:.1f}" width="34" height="{bar_height:.1f}" fill="#2b6f8c"/>'
            f'<text x="{bx}" y="{bottom-bar_height-8:.1f}" text-anchor="middle" font-family="sans-serif" font-size="14">{iterations}</text>'
            f'<text x="{bx}" y="{bottom+24}" text-anchor="middle" font-family="sans-serif" font-size="13">{index+1}</text>'
        )
        residual_points.append(f'{residual_x(index):.1f},{residual_y(row["final_estimated_scf_accuracy_Ry"]):.1f}')
    residual_marks = []
    for index, row in enumerate(rows):
        xx = residual_x(index)
        yy = residual_y(row["final_estimated_scf_accuracy_Ry"])
        residual_marks.append(
            f'<circle cx="{xx:.1f}" cy="{yy:.1f}" r="6" fill="#a33d2d"/>'
            f'<text x="{xx:.1f}" y="{bottom+24}" text-anchor="middle" font-family="sans-serif" font-size="13">{index+1}</text>'
        )
    residual_ticks = []
    for exponent in range(-10, -14, -1):
        yy = residual_y(10.0**exponent)
        residual_ticks.append(
            f'<line x1="{residual_left}" y1="{yy:.1f}" x2="{residual_right}" y2="{yy:.1f}" stroke="#d8d2c8"/>'
            f'<text x="{residual_left-10}" y="{yy+5:.1f}" text-anchor="end" font-family="sans-serif" font-size="13">10^{exponent}</text>'
        )
    output.write_text(
        "\n".join(
            [
                f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">',
                '<title id="title">Actual Silicon electronic convergence history during relaxation</title>',
                '<desc id="desc">SCF iteration counts and final estimated SCF accuracies for the five ordered ionic evaluations in the stored Quantum ESPRESSO relaxation output.</desc>',
                '<rect width="100%" height="100%" fill="white"/>',
                '<text x="60" y="42" font-family="sans-serif" font-size="25" font-weight="700">Electronic solves inside the Silicon ionic relaxation</text>',
                '<text x="60" y="70" font-family="sans-serif" font-size="15" fill="#52616b">Five ordered SCF completion records mapped to five subsequent force evaluations</text>',
                '<text x="90" y="98" font-family="sans-serif" font-size="16" font-weight="700">SCF iterations</text>',
                f'<line x1="{bar_left}" y1="{top}" x2="{bar_left}" y2="{bottom}" stroke="#243746" stroke-width="2"/>',
                f'<line x1="{bar_left}" y1="{bottom}" x2="{bar_right}" y2="{bottom}" stroke="#243746" stroke-width="2"/>',
                *bars,
                '<text x="275" y="460" text-anchor="middle" font-family="sans-serif" font-size="14">ionic evaluation</text>',
                '<text x="570" y="98" font-family="sans-serif" font-size="16" font-weight="700">Final estimated SCF accuracy (Ry)</text>',
                *residual_ticks,
                f'<line x1="{residual_left}" y1="{top}" x2="{residual_left}" y2="{bottom}" stroke="#243746" stroke-width="2"/>',
                f'<line x1="{residual_left}" y1="{bottom}" x2="{residual_right}" y2="{bottom}" stroke="#243746" stroke-width="2"/>',
                f'<polyline points="{" ".join(residual_points)}" fill="none" stroke="#a33d2d" stroke-width="3"/>',
                *residual_marks,
                '<text x="750" y="460" text-anchor="middle" font-family="sans-serif" font-size="14">ionic evaluation</text>',
                '<text x="500" y="500" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#52616b">SCF completion at each geometry does not establish ionic, cell, observable, or scientific convergence.</text>',
                '</svg>',
                '',
            ]
        ),
        encoding="utf-8",
    )


if __name__ == "__main__":
    report = run()
    public = ROOT / "public/media/practical-guides/optimize-structure/diagnose-forces-stress-and-state"
    write_force_svg(report, public / "silicon-qe-relax-force.svg")
    write_scf_svg(report, public / "silicon-qe-relax-scf-history.svg")
    print(json.dumps(report, indent=2))
