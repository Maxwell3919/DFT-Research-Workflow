#!/usr/bin/env bash
set -euo pipefail

case_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
grep -E '^(display=|chrome_version=|xdpyinfo=|glxinfo=|xvfb=|window_detection=)' "$case_dir/environment.txt" > "$case_dir/output/environment-excerpt.txt"
printf '%s\n' 'Chrome stdout:' >> "$case_dir/output/environment-excerpt.txt"
sed -n '1,12p' "$case_dir/output/chromium.stdout" >> "$case_dir/output/environment-excerpt.txt"
