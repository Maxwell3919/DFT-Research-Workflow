#!/usr/bin/env bash
set -euo pipefail

case_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
rg '^(display=|libgl_always_software=|xdpyinfo=|glxinfo=|renderer=|software_renderer=|window_detection=|screenshot=)' "$case_dir/output/x11-smoke.txt" > "$case_dir/output/x11-excerpt.txt"
