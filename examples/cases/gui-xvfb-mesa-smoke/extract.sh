#!/usr/bin/env bash
set -euo pipefail

case_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
if grep -q '^run_status=BLOCKED docker build failed' "$case_dir/output/run-metadata.txt"; then
  {
    grep '^run_status=' "$case_dir/output/run-metadata.txt"
    grep -E 'failed to resolve source metadata|DeadlineExceeded|i/o timeout' "$case_dir/output/docker-build.stderr"
  } > "$case_dir/output/x11-excerpt.txt"
else
  grep -E '^(display=|libgl_always_software=|xdpyinfo=|glxinfo=|renderer=|software_renderer=|window_detection=|screenshot=)' "$case_dir/output/x11-smoke.txt" > "$case_dir/output/x11-excerpt.txt"
fi
