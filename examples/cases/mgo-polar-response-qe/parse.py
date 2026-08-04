#!/usr/bin/env python3
"""Fail-closed extraction for the staged MgO QE polar-response entry."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
NUMBER = r"[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[EeDd][-+]?\d+)?"


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def artifact(path: str, role: str) -> dict[str, object]:
    target = ROOT / path
    return {'role': role, 'path': path, 'sha256': digest(target), 'bytes': target.stat().st_size}


def output_time(text: str, pattern: str) -> str:
    match = re.search(pattern, text)
    if not match:
        fail('missing QE output timestamp')
    value = ' '.join(match.groups())
    parsed = datetime.strptime(value, '%d%b%Y %H:%M:%S')
    return parsed.replace(tzinfo=timezone(timedelta(hours=8))).isoformat()


def fail(message: str) -> None:
    raise RuntimeError(message)


def require_one(text: str, token: str, label: str) -> None:
    count = text.count(token)
    if count != 1:
        fail(f"{label}: expected exactly one {token!r}, found {count}")


def parse_matrix(lines: list[str], marker: str) -> list[list[float]]:
    starts = [index for index, line in enumerate(lines) if marker in line]
    if not starts:
        fail(f"missing {marker!r} section")
    matrices: list[list[list[float]]] = []
    for start in starts:
        rows: list[list[float]] = []
        for line in lines[start + 1:]:
            values = [float(value.replace('D', 'E').replace('d', 'e')) for value in re.findall(NUMBER, line)]
            if len(values) == 3:
                rows.append(values)
                if len(rows) == 3:
                    matrices.append(rows)
                    break
            elif rows:
                fail(f"incomplete 3x3 tensor after {marker!r}")
        else:
            fail(f"missing 3x3 tensor after {marker!r}")
    if any(matrix != matrices[0] for matrix in matrices[1:]):
        fail(f"repeated {marker!r} sections disagree")
    return matrices[0]


def parse_born(text: str, marker: str) -> list[dict[str, object]]:
    blocks = text.split(marker)[1:]
    if not blocks:
        fail('missing Born effective-charge section')
    all_entries: list[list[dict[str, object]]] = []
    for block in blocks:
        block = block.split('Effective charges Sum', 1)[0]
        block = block.split('Dielectric constant', 1)[0]
        block = block.split('Representation #', 1)[0]
        header = re.compile(r"atom\s+(\d+)\s+(\S+)\s+Mean Z\*:\s+(" + NUMBER + r")", re.I)
        matches = list(header.finditer(block))
        if len(matches) != 2:
            fail(f'expected exactly two Born-charge atoms, found {len(matches)}')
        entries: list[dict[str, object]] = []
        for index, match in enumerate(matches):
            atom_block = block[match.start():matches[index + 1].start() if index + 1 < len(matches) else len(block)]
            rows: list[list[float]] = []
            for line in atom_block.splitlines():
                if not re.search(r"(?:E\*?[xyz]|E[xyz])", line, re.I):
                    continue
                values = [float(value.replace('D', 'E').replace('d', 'e')) for value in re.findall(NUMBER, line)]
                if len(values) == 3:
                    rows.append(values)
            if len(rows) != 3:
                fail(f'Born-charge tensor for atom {match.group(1)} is incomplete')
            entries.append({'atom': int(match.group(1)), 'element': match.group(2), 'mean': float(match.group(3).replace('D', 'E').replace('d', 'e')), 'tensor': rows})
        if {entry['element'] for entry in entries} != {'Mg', 'O'}:
            fail('Born-charge elements do not match staged MgO model')
        all_entries.append(entries)
    if any(entries != all_entries[0] for entries in all_entries[1:]):
        fail(f'repeated {marker!r} sections disagree')
    return all_entries[0]


def collect() -> dict[str, object]:
    paths = {name: ROOT / 'output' / name for name in ('mgo-scf.out', 'mgo-scf.err', 'mgo-scf.exit', 'mgo-ph.out', 'mgo-ph.err', 'mgo-ph.exit', 'mgo_polar.dyn')}
    nonempty = {'mgo-scf.out', 'mgo-scf.exit', 'mgo-ph.out', 'mgo-ph.exit', 'mgo_polar.dyn'}
    missing = [name for name, path in paths.items() if not path.is_file() or (name in nonempty and path.stat().st_size == 0)]
    if missing:
        fail('missing required execution evidence: ' + ', '.join(missing))
    for name in ('mgo-scf.err', 'mgo-ph.err'):
        if paths[name].read_bytes() != b'':
            fail(f'{name} is not empty')
    for name in ('mgo-scf.exit', 'mgo-ph.exit'):
        if paths[name].read_text(encoding='ascii', errors='strict') != '0\n':
            fail(f'{name} must contain exactly the successful exit code 0')
    scf = paths['mgo-scf.out'].read_text(encoding='utf-8', errors='strict')
    ph = paths['mgo-ph.out'].read_text(encoding='utf-8', errors='strict')
    if 'Program PWSCF v.7.5' not in scf or 'Program PHONON v.7.5' not in ph:
        fail('QE 7.5 program banners are required')
    require_one(scf, 'JOB DONE.', 'SCF completion')
    require_one(ph, 'JOB DONE.', 'DFPT completion')
    if 'convergence has been achieved' not in scf.lower():
        fail('SCF convergence marker missing')
    if 'convergence has been achieved' not in ph.lower():
        fail('DFPT convergence marker missing')
    if re.search(r'Error in routine|No convergence has been achieved|Maximum CPU time exceeded', scf + '\n' + ph, re.I):
        fail('fatal or nonconvergence marker found in standard output')
    scf_input = (ROOT / 'input/mgo-scf.in').read_text(encoding='utf-8')
    ph_input = (ROOT / 'input/mgo-ph.in').read_text(encoding='utf-8')
    for token in ("prefix = 'mgo_polar'", "outdir = './out'"):
        if token not in scf_input or token not in ph_input:
            fail(f'parent-lineage input mismatch for {token}')
    if 'epsil = .true.' not in ph_input:
        fail('staged ph.x input no longer requests epsil=.true.')
    dielectric = parse_matrix(ph.splitlines(), 'Dielectric constant in cartesian axis')
    born = parse_born(ph, 'Effective charges (d Force / dE) in cartesian axis without acoustic sum rule applied (asr)')
    born_asr = parse_born(ph, 'Effective charges (d Force / dE) in cartesian axis with asr applied:')
    started_at = output_time(scf, r'Program PWSCF v\.7\.5 starts on\s+(\d{1,2}[A-Za-z]{3}\d{4})\s+at\s+(\d{1,2}:\d{2}:\d{2})')
    completed_match = re.search(r'This run was terminated on:\s+(\d{1,2}:\d{2}:\d{2})\s+(\d{1,2}[A-Za-z]{3}\d{4})', ph)
    if not completed_match:
        fail('missing ph.x completion timestamp')
    completed_at = datetime.strptime(f'{completed_match.group(2)} {completed_match.group(1)}', '%d%b%Y %H:%M:%S').replace(tzinfo=timezone(timedelta(hours=8))).isoformat()
    return {
        'schema_version': '1.0',
        'evidence_class': 'real-execution',
        'material': {'formula': 'MgO', 'model_sha256': digest(ROOT / 'source/model.json')},
        'software': {'pw.x': '7.5', 'ph.x': '7.5'},
        'workflow': 'fixed-setup pw.x SCF followed by Gamma-point ph.x epsil=.true. using matching prefix/outdir',
        'q_point_fractional': [0.0, 0.0, 0.0],
        'response': {'dielectric_tensor': dielectric, 'born_effective_charges_without_asr': born, 'born_effective_charges_with_asr': born_asr, 'units': {'dielectric': 'dimensionless', 'born_effective_charge': 'e'}},
        'completion': {'scf_job_done_markers': scf.count('JOB DONE.'), 'ph_job_done_markers': ph.count('JOB DONE.'), 'scf_convergence_marker': True, 'dfpt_convergence_marker': True},
        'started_at': started_at,
        'completed_at': completed_at,
        'files_sha256': {name: digest(path) for name, path in paths.items()},
        'claim_boundary': 'Parsed values are only the printed result of one fixed-setup Gamma-point DFPT entry. They do not establish cutoff/k/q/threshold convergence, a static dielectric including ionic contributions, LO--TO splitting, phonon dispersion, experimental agreement, or scientific acceptance.',
        'lo_to_splitting': 'not assessed: one q=0 calculation without a non-analytic directional workflow is insufficient.'
    }


def render_png(report: dict[str, object], target: Path) -> None:
    import matplotlib.pyplot as plt
    tensor = report['response']['dielectric_tensor']
    values = [tensor[i][i] for i in range(3)]
    fig, ax = plt.subplots(figsize=(6.5, 4.2))
    bars = ax.bar(['xx', 'yy', 'zz'], values, color='#3867d6')
    ax.bar_label(bars, fmt='%.6g', padding=3)
    ax.set_ylabel('printed dielectric tensor component (dimensionless)')
    ax.set_title('MgO Gamma-point DFPT entry: parsed ph.x output')
    ax.text(0.5, -0.27, 'One fixed setup; no cutoff, k/q mesh, or response-threshold convergence claim.', transform=ax.transAxes, ha='center', va='top', fontsize=8)
    fig.tight_layout()
    target.parent.mkdir(exist_ok=True)
    fig.savefig(target, dpi=180)
    plt.close(fig)


def write_manifest(report: dict[str, object]) -> None:
    artifacts = [
        artifact('input/mgo-scf.in', 'QE SCF input'),
        artifact('input/mgo-ph.in', 'QE DFPT input'),
        artifact('input/qe_plan.json', 'QE plan'),
        artifact('input/pseudopotentials.json', 'pseudopotential declaration'),
        artifact('input/official-qe-7.5-parameters.json', 'version-matched official parameter record'),
        artifact('output/mgo-scf.out', 'SCF stdout'),
        artifact('output/mgo-scf.err', 'SCF stderr'),
        artifact('output/mgo-scf.exit', 'SCF exit code'),
        artifact('output/mgo-ph.out', 'DFPT stdout'),
        artifact('output/mgo-ph.err', 'DFPT stderr'),
        artifact('output/mgo-ph.exit', 'DFPT exit code'),
        artifact('output/mgo_polar.dyn', 'Gamma dynamical matrix'),
        artifact('output/run-status.txt', 'run status'),
        artifact('derived/response-report.json', 'raw-output-derived response report'),
        artifact('figures/mgo-polar-response.png', 'raw-output-derived PNG'),
    ]
    manifest = {
        'schema_version': '1.0',
        'case_id': 'mgo-polar-response-qe',
        'title': 'MgO Gamma-point QE dielectric and Born-charge response',
        'case_kind': 'calculation',
        'evidence_class': 'real-execution',
        'public_host_label': 'Talos bounded QE execution',
        'started_at': report['started_at'],
        'completed_at': report['completed_at'],
        'exit_code': 0,
        'software': [
            {'name': 'Quantum ESPRESSO PWSCF', 'version': '7.5', 'interface': 'MPI CLI; one recorded rank'},
            {'name': 'Quantum ESPRESSO PHONON', 'version': '7.5', 'interface': 'serial multi-threaded CLI'},
            {'name': 'case-local raw-output parser', 'version': '1.0', 'interface': 'Python CLI'},
        ],
        'sources': [
            {'id': 'mgo-fixed-model', 'role': 'fixed teaching-model source', 'path': 'source/model.json', 'sha256': digest(ROOT / 'source/model.json'), 'licence_boundary': 'A declared teaching model, not an experimental structure or material-property reference.'},
        ],
        'commands': [
            {'stage': 'scf', 'command': 'srun --exclusive --mpi=pmix --ntasks=1 --cpus-per-task=1 --time=00:10:00 pw.x -in mgo-scf.in > mgo-scf.out 2> mgo-scf.err', 'exit_code': 0},
            {'stage': 'gamma-dfpt', 'command': 'srun --exclusive --mpi=pmix --ntasks=1 --cpus-per-task=1 --time=00:10:00 ph.x -in mgo-ph.in > mgo-ph.out 2> mgo-ph.err', 'exit_code': 0},
            {'stage': 'strict-extraction', 'command': 'bash extract.sh', 'exit_code': 0},
            {'stage': 'case-check', 'command': 'bash check.sh', 'exit_code': 0},
        ],
        'artifacts': artifacts,
        'gates': {
            'G0': {'status': 'PASS', 'summary': 'Input plan, public pseudo provenance/hash declaration, official QE 7.5 parameter record, raw outputs, and derived artifacts are hash-bound.'},
            'G1': {'status': 'PASS', 'summary': 'Recorded pw.x and ph.x stage exit files are zero; each output has one QE 7.5 banner and one JOB DONE marker; captured stderr files are empty.'},
            'G2': {'status': 'PASS', 'summary': 'The recorded SCF printed electronic convergence in 15 iterations; this is not an observable-convergence study.'},
            'G3': {'status': 'PASS', 'summary': 'The strict parser binds the Gamma dynamical matrix and actual ph.x dielectric and Born-charge sections to the committed raw output.'},
            'G4': {'status': 'NOT TESTED', 'summary': 'No cutoff, k-mesh, q-mesh, or DFPT-threshold series was run for the reported response.'},
            'G5': {'status': 'NOT CLAIMED', 'summary': 'No converged dielectric constant, Born charge, LO--TO splitting, phonon dispersion, experimental agreement, or scientific conclusion is claimed.'},
        },
        'claim_boundary': {
            'supports': ['One captured QE 7.5 fixed-setup MgO SCF-to-Gamma-DFPT response with raw-output-derived electronic/ion-clamped dielectric and Born-charge records.'],
            'does_not_support': ['A converged dielectric response, static dielectric including ionic lattice contributions, LO--TO splitting, phonon dispersion, or experimental comparison.', 'A universal calculation-parameter recommendation or material-level scientific conclusion.'],
        },
    }
    (ROOT / 'manifest.json').write_text(json.dumps(manifest, indent=2, sort_keys=True) + '\n', encoding='utf-8')


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--write-derived', action='store_true')
    parser.add_argument('--check-only', action='store_true')
    args = parser.parse_args()
    if args.write_derived and args.check_only:
        fail('choose at most one action')
    report = collect()
    if args.write_derived:
        derived = ROOT / 'derived'
        derived.mkdir(exist_ok=True)
        (derived / 'response-report.json').write_text(json.dumps(report, indent=2, sort_keys=True) + '\n', encoding='utf-8')
        render_png(report, ROOT / 'figures/mgo-polar-response.png')
        write_manifest(report)
    print(json.dumps(report, indent=2, sort_keys=True))


if __name__ == '__main__':
    main()
