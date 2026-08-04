#!/usr/bin/env bash
set -euo pipefail

export LIBGL_ALWAYS_SOFTWARE=1
log=/output/x11-smoke.txt
openbox_pid=''
xmessage_pid=''
cleanup() {
  [ -z "$xmessage_pid" ] || kill "$xmessage_pid" 2>/dev/null || true
  [ -z "$openbox_pid" ] || kill "$openbox_pid" 2>/dev/null || true
}
trap cleanup EXIT

{
  printf 'display=%s\n' "$DISPLAY"
  printf 'libgl_always_software=%s\n' "$LIBGL_ALWAYS_SOFTWARE"
  printf 'xdpyinfo=PASS\n'
  xdpyinfo | grep -E 'dimensions:|number of extensions:'
  printf 'glxinfo=PASS\n'
  glxinfo -B | grep -E 'OpenGL vendor string:|OpenGL renderer string:|OpenGL version string:'
  renderer=$(glxinfo -B | sed -n 's/^OpenGL renderer string: //p')
  printf 'renderer=%s\n' "$renderer"
  if printf '%s\n' "$renderer" | grep -qi 'llvmpipe'; then
    printf 'software_renderer=PASS llvmpipe\n'
  else
    printf 'software_renderer=FAIL expected llvmpipe\n'
    exit 1
  fi
  openbox > /output/openbox.stdout 2> /output/openbox.stderr &
  openbox_pid=$!
  xmessage -title 'Talos Xvfb Mesa smoke' -buttons 'Close:0' 'Xvfb, Mesa llvmpipe, Openbox, xdotool, and scrot smoke test.' > /output/xmessage.stdout 2> /output/xmessage.stderr &
  xmessage_pid=$!
  for attempt in 1 2 3 4 5; do
    window_id=$(xdotool search --name 'Talos Xvfb Mesa smoke' | head -n 1 || true)
    if [ -n "$window_id" ]; then break; fi
    sleep 0.2
  done
  if [ -z "${window_id:-}" ]; then
    printf 'window_detection=FAIL xmessage window not found\n'
    exit 1
  fi
  printf 'window_detection=PASS id=%s\n' "$window_id"
  scrot /output/xvfb-mesa-window.png
  identify /output/xvfb-mesa-window.png
  printf 'screenshot=PASS output/xvfb-mesa-window.png\n'
} > "$log" 2>&1
