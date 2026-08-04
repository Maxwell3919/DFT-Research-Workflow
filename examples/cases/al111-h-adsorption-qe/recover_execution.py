#!/usr/bin/env python3
"""Create a small, deterministic terminal record from retained public QE text."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path


def identity(path: Path) -> dict[str, object]:
    payload = path.read_bytes()
    return {'path': path.name, 'sha256': hashlib.sha256(payload).hexdigest(), 'bytes': len(payload)}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--evidence-dir', type=Path, required=True)
    parser.add_argument('--origin', required=True)
    parser.add_argument('--job-id', default='unknown')
    parser.add_argument('--host-label', default='Talos')
    parser.add_argument('--launcher', default='unknown')
    parser.add_argument('--walltime-boundary', default='unknown')
    parser.add_argument('--wrapper-exit-code', type=int)
    args = parser.parse_args()
    root = args.evidence_dir
    required = [root / name for name in ('al111-h-fcc-scf.in', 'pseudo.sha256', 'pw.stdout', 'pw.stderr')]
    missing = [str(path.name) for path in required if not path.is_file()]
    if missing:
        raise SystemExit('cannot recover execution record; missing ' + ', '.join(missing))
    stdout, stderr = (root / 'pw.stdout').read_text(encoding='utf-8', errors='replace'), (root / 'pw.stderr').read_text(encoding='utf-8', errors='replace')
    cancellation = re.search(r'STEP\s+(\d+\.\d+).*?CANCELLED AT\s+([^*\n]+)', stderr)
    terminal_failed = bool(cancellation or re.search(r'forcing job termination|task \d+: Killed', stderr, flags=re.I))
    record = {
        'schema_version': '1.0',
        'record_origin': args.origin,
        'terminal_state': 'failed' if terminal_failed else 'unknown',
        'runtime': {
            'scheduler_job_id': args.job_id,
            'host_label': args.host_label,
            'launcher': args.launcher,
            'walltime_boundary': args.walltime_boundary,
            'wrapper_exit_code': args.wrapper_exit_code,
        },
        'markers': {
            'qe_75_banner': bool(re.search(r'Program\s+PWSCF\s+v\.7\.5', stdout)),
            'scf_converged': bool(re.search(r'convergence has been achieved', stdout)),
            'job_done': bool(re.search(r'JOB DONE\.', stdout)),
            'slurm_cancellation': terminal_failed,
            'slurm_cancellation_marker': None if not cancellation else cancellation.group(0),
        },
        'stages': [
            {'name': 'input-stage', 'exit_code': 0, 'artifacts': [identity(root / 'al111-h-fcc-scf.in')]},
            {'name': 'pseudopotential-identity-and-hash-check', 'exit_code': 0, 'artifacts': [identity(root / 'pseudo.sha256')]},
            {'name': 'pw-scf', 'exit_code': args.wrapper_exit_code, 'artifacts': [identity(root / 'pw.stdout'), identity(root / 'pw.stderr')]},
        ],
        'boundary': 'This record is generated deterministically from retained public text. It records a terminal failure when that text contains the Slurm cancellation markers; it does not establish electronic convergence, numerical convergence, or an adsorption result.',
    }
    (root / 'execution-record.json').write_text(json.dumps(record, indent=2, sort_keys=True) + '\n', encoding='utf-8')
    print(json.dumps({'terminal_state': record['terminal_state'], 'record_origin': record['record_origin']}, sort_keys=True))


if __name__ == '__main__':
    main()
