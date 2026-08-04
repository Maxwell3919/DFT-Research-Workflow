#!/usr/bin/env python3
"""Construct an Al(111)-H candidate and strictly extract a supplied QE 7.5 SCF."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from ase.build import add_adsorbate, fcc111
from ase.io import write

ROOT = Path(__file__).resolve().parent
SRC, INP, OUT, DER, FIG = (ROOT / name for name in ('source', 'input', 'output', 'derived', 'figures'))


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def model():
    slab = fcc111('Al', size=(2, 2, 4), a=4.05, vacuum=12.0, orthogonal=True)
    slab.pbc = (True, True, False)
    candidate = slab.copy()
    add_adsorbate(candidate, 'H', height=1.65, position='fcc')
    candidate.center(vacuum=12.0, axis=2)
    candidate.info.pop('adsorbate_info', None)
    h_index = candidate.get_chemical_symbols().index('H')
    al_z = np.delete(candidate.positions[:, 2], h_index)
    empty = float(candidate.cell[2, 2] - (candidate.positions[:, 2].max() - candidate.positions[:, 2].min()))
    assert len(slab) == 16 and len(candidate) == 17
    assert candidate.get_chemical_symbols().count('H') == 1
    assert candidate.pbc.tolist() == [True, True, False]
    assert candidate.positions[h_index, 2] > al_z.max() and empty >= 23.9
    return slab, candidate, h_index, empty


def write_qe_input(atoms):
    lines = [
        '&CONTROL', "  calculation = 'scf'", "  prefix = 'al111_h_fcc'", "  outdir = './scratch'", "  pseudo_dir = './pseudo'", '  tstress = .true.', '  tprnfor = .true.', '/',
        '&SYSTEM', '  ibrav = 0', '  nat = 17', '  ntyp = 2', '  ecutwfc = 80.0', '  ecutrho = 640.0', "  occupations = 'smearing'", "  smearing = 'mv'", '  degauss = 0.02', '/',
        '&ELECTRONS', '  conv_thr = 1.0d-8', '/',
        'ATOMIC_SPECIES', 'Al  26.9815385  Al.pbe-n-kjpaw_psl.1.0.0.UPF', 'H   1.0080000   H.pbe-kjpaw_psl.1.0.0.UPF',
        'CELL_PARAMETERS angstrom',
    ]
    lines.extend('  {:.10f}  {:.10f}  {:.10f}'.format(*row) for row in atoms.cell.array)
    lines.append('ATOMIC_POSITIONS angstrom')
    lines.extend('{:<2}  {:.10f}  {:.10f}  {:.10f}'.format(symbol, *position) for symbol, position in zip(atoms.get_chemical_symbols(), atoms.positions))
    lines += ['K_POINTS automatic', '6 6 1 0 0 0']
    (INP / 'al111-h-fcc-scf.in').write_text('\n'.join(lines) + '\n', encoding='utf-8')


def prepare():
    for directory in (SRC, INP, OUT, DER, FIG):
        directory.mkdir(exist_ok=True)
    slab, candidate, h_index, empty = model()
    write(INP / 'al111-h-fcc.xyz', candidate)
    write(OUT / 'al111-h-fcc-initial.xyz', candidate)
    write_qe_input(candidate)
    report = {
        'builder': 'ASE ase.build.fcc111', 'ase_version': __import__('ase').__version__,
        'lattice_parameter_ang': 4.05, 'repeat': [2, 2, 4], 'atoms': {'Al': 16, 'H': 1},
        'periodicity': candidate.pbc.tolist(), 'site_label': 'fcc hollow candidate',
        'initial_H_height_ang': 1.65,
        'H_above_highest_Al_ang': round(float(candidate.positions[h_index, 2] - np.delete(candidate.positions[:, 2], h_index).max()), 8),
        'empty_cell_length_ang': round(empty, 8),
        'cell_ang': [[round(float(value), 8) for value in row] for row in candidate.cell.array],
        'boundary': 'Construction only: no relaxation, site comparison, adsorption energy, or convergence result.'
    }
    (SRC / 'ase-construction.json').write_text(json.dumps(report, indent=2, sort_keys=True) + '\n', encoding='utf-8')
    return report


def extract_qe():
    prepare()
    output, stderr, record_path = OUT / 'qe-run' / 'pw.stdout', OUT / 'qe-run' / 'pw.stderr', OUT / 'qe-run' / 'execution-record.json'
    if not output.is_file() or not stderr.is_file() or not record_path.is_file():
        raise SystemExit('QE extraction requires retained pw.stdout, pw.stderr, and execution-record.json')
    record = json.loads(record_path.read_text(encoding='utf-8'))
    text, err_text = output.read_text(encoding='utf-8', errors='replace'), stderr.read_text(encoding='utf-8', errors='replace')
    energies = re.findall(r'^\s*total energy\s+=\s+([-+0-9.EeDd]+)\s+Ry', text, flags=re.MULTILINE)
    terminal_failed = record.get('terminal_state') == 'failed'
    if not terminal_failed:
        raise SystemExit('This extraction route is intentionally limited to a terminal-failed record')
    _, candidate, h_index, empty = model()
    summary = {
        'parser': 'qe-terminal-failure-extract-v1', 'execution_record_origin': record.get('record_origin'),
        'terminal_state': 'failed', 'qe_version_banner_present': bool(re.search(r'Program\s+PWSCF\s+v\.7\.5', text)),
        'scf_converged': bool(re.search(r'convergence has been achieved', text)), 'job_done': bool(re.search(r'JOB DONE\.', text)),
        'slurm_cancellation': bool(re.search(r'CANCELLED|forcing job termination|task \d+: Killed', err_text, flags=re.I)),
        'last_reported_total_energy_ry': None if not energies else float(energies[-1].replace('D', 'E').replace('d', 'e')),
        'energy_records_ry': len(energies), 'stdout_sha256': sha256(output), 'stderr_sha256': sha256(stderr),
        'model': {'atoms': len(candidate), 'site_label': 'fcc hollow candidate', 'empty_cell_length_ang': round(empty, 8), 'H_index': h_index},
        'boundary': 'The SCF was scheduler-cancelled before a normal completion marker. Reported intermediate energy is not an accepted total energy or adsorption result.'
    }
    DER.mkdir(exist_ok=True); FIG.mkdir(exist_ok=True)
    (DER / 'qe-scf-summary.json').write_text(json.dumps(summary, indent=2, sort_keys=True) + '\n', encoding='utf-8')
    (DER / 'geometry-summary.csv').write_text('species,count\nAl,16\nH,1\n', encoding='utf-8')
    colors = ['#6b7280' if symbol == 'Al' else '#dc2626' for symbol in candidate.get_chemical_symbols()]
    fig, ax = plt.subplots(figsize=(5.2, 3.6)); ax.scatter(candidate.positions[:, 0], candidate.positions[:, 2], c=colors, s=65)
    ax.set(xlabel='x (A)', ylabel='z (A)', title='Constructed Al(111) 2x2 with one H fcc candidate')
    fig.tight_layout(); fig.savefig(FIG / 'al111-h-fcc-xz.png', dpi=160); plt.close(fig)
    sources = []
    for source_id, role, rel, url, boundary in [
        ('ase-construction', 'locally generated structural construction record', 'source/ase-construction.json', 'https://wiki.fysik.dtu.dk/ase/ase/build/surface.html', 'Generated locally with ASE; this is a tutorial model rather than a database structure identity.'),
        ('pseudopotential-provenance', 'public pseudopotential identity record', 'source/pseudopotential-provenance.json', 'https://pseudopotentials.quantum-espresso.org/', 'Only public file identity and SHA-256 are recorded; no pseudopotential body is redistributed.'),
        ('qeguard-pseudo-manifest', 'qeguard-compatible pseudopotential identity record', 'source/qeguard-pseudo-manifest.json', 'https://pseudopotentials.quantum-espresso.org/', 'Only public file identity and SHA-256 are recorded; no pseudopotential body is redistributed.'),
    ]:
        path = ROOT / rel; sources.append({'id': source_id, 'role': role, 'path': rel, 'sha256': sha256(path), 'url': url, 'accessed_at': '2026-08-05', 'licence_boundary': boundary})
    artifacts = []
    for role, rel in [
        ('qe-plan', 'qe_plan.json'), ('qe-input', 'input/al111-h-fcc-scf.in'), ('initial-structure', 'input/al111-h-fcc.xyz'), ('constructed-structure', 'output/al111-h-fcc-initial.xyz'),
        ('pseudopotential-identity-hashes', 'output/qe-run/pseudo.sha256'), ('public-copy-sanitization-record', 'output/qe-run/sanitization.json'), ('historical-recovery-record', 'output/qe-run/execution-record.json'), ('qe-stdout', 'output/qe-run/pw.stdout'),
        ('deterministically sanitized qe-stderr', 'output/qe-run/pw.stderr'), ('terminal-failure-summary', 'derived/qe-scf-summary.json'), ('geometry-table', 'derived/geometry-summary.csv'), ('constructed-geometry-figure', 'figures/al111-h-fcc-xz.png'),
    ]:
        path = ROOT / rel; artifacts.append({'role': role, 'path': rel, 'sha256': sha256(path), 'bytes': path.stat().st_size})
    stderr_artifact = next(item for item in artifacts if item['path'] == 'output/qe-run/pw.stderr')
    stderr_artifact.update({'raw_sha256': '0829323df44ce929bcf85966f6ed9159af33796124cef93d732b6ce2a5dc1adc', 'sanitization': 'Local machine host tokens matching *-MS-* are replaced with [host-withheld]; see output/qe-run/sanitization.json.'})
    manifest = {
        'schema_version': '1.0', 'case_id': 'al111-h-adsorption-qe', 'title': 'Al(111) 2x2 slab with one H fcc candidate: terminal-failed QE 7.5 SCF entry',
        'case_kind': 'calculation', 'evidence_class': 'real-execution', 'public_host_label': 'Talos QE 7.5 local runtime', 'started_at': '2026-08-05T02:41:54+08:00',
        'completed_at': '2026-08-05T02:51:53+08:00', 'exit_code': record.get('runtime', {}).get('wrapper_exit_code'),
        'software': [{'name': 'ASE', 'version': __import__('ase').__version__, 'interface': 'Python API'}, {'name': 'Quantum ESPRESSO', 'version': '7.5', 'interface': 'pw.x SCF output'}],
        'sources': sources, 'commands': [{'stage': 'construct', 'command': 'python3 parse.py --prepare', 'exit_code': 0}, {'stage': 'public-copy-sanitization', 'command': 'python3 ../../../scripts/sanitize-public-text.py --input "$RAW_STDERR" --output output/qe-run/pw.stderr --record output/qe-run/sanitization.json --kind local-hostname', 'exit_code': 0}, {'stage': 'historical-recovery', 'command': 'python3 recover_execution.py --evidence-dir output/qe-run --origin historical-recovery/generated-from-sanitized-public-copy --job-id 34 --host-label Talos --launcher "srun --ntasks=1 --cpus-per-task=1" --walltime-boundary 00:10:00', 'exit_code': 0}, {'stage': 'terminal-extract', 'command': 'bash extract.sh', 'exit_code': 0}],
        'validation': {'parser_args': ['--extract-qe']},
        'artifacts': artifacts,
        'gates': {'G0': {'status': 'PASS', 'summary': 'construction, public execution text, identity hashes, historical recovery record, and derived failure summary are hash-bound'}, 'G1': {'status': 'FAIL', 'summary': 'Slurm cancelled Job 34 at the 00:10:00 boundary before normal QE completion or SCF convergence'}, 'G2': {'status': 'NOT TESTED', 'summary': 'the terminated SCF cannot establish completed execution or any numerical result'}, 'G3': {'status': 'PASS', 'summary': 'terminal-failure evidence and a construction PNG are present without retaining UPF, scratch, restart, WFC, or save artifacts'}, 'G4': {'status': 'NOT TESTED', 'summary': 'no cutoff, k-mesh, slab-thickness, vacuum, site, reference-state, or adsorption-energy convergence study'}, 'G5': {'status': 'NOT CLAIMED', 'summary': 'no adsorption energy, preferred site, relaxed geometry, stability, or physical conclusion'}},
        'claim_boundary': {'supports': ['The recorded ASE construction and terminal-failure recovery of one scheduler-cancelled QE 7.5 SCF attempt for an initial fcc-hollow H candidate.'], 'does_not_support': ['A completed SCF, relaxed structure, adsorption energy, H reference state, site preference, coverage trend, convergence claim, or transferable adsorption conclusion.']},
    }
    (ROOT / 'manifest.json').write_text(json.dumps(manifest, indent=2, sort_keys=True) + '\n', encoding='utf-8')
    print(json.dumps({'status': 'TERMINAL_FAILED', 'stdout_sha256': summary['stdout_sha256'], 'stderr_sha256': summary['stderr_sha256']}, sort_keys=True))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--prepare', action='store_true')
    parser.add_argument('--extract-qe', action='store_true')
    args = parser.parse_args()
    if args.prepare == args.extract_qe:
        parser.error('choose exactly one of --prepare or --extract-qe')
    if args.prepare:
        print(json.dumps(prepare(), sort_keys=True))
    else:
        extract_qe()


if __name__ == '__main__':
    main()
