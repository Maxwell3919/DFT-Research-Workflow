#!/usr/bin/env bash
set -euo pipefail

case_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$case_dir"
mkdir -p output derived figures
image_tag='dft-rw-gui-xvfb-mesa-smoke:20260805'
printf 'image_tag=%s\n' "$image_tag" > output/run-metadata.txt
printf 'docker_version=%s\n' "$(docker --version)" >> output/run-metadata.txt

set +e
docker build --no-cache --tag "$image_tag" . > output/docker-build.stdout 2> output/docker-build.stderr
build_exit=$?
set -e
printf 'exit=%s\n' "$build_exit" >> output/docker-build.stdout
if [ "$build_exit" -ne 0 ]; then
  printf 'run_status=BLOCKED docker build failed; inspect output/docker-build.*\n' >> output/run-metadata.txt
  python3 parse.py --write-derived
  sha256sum Dockerfile source/x11-smoke.sh output/docker-build.stdout output/docker-build.stderr output/run-metadata.txt derived/capture.json > output/SHA256SUMS
  exit "$build_exit"
fi

set +e
docker run --rm \
  --volume "$case_dir:/case:ro" \
  --volume "$case_dir/output:/output" \
  "$image_tag" \
  xvfb-run -a -s '-screen 0 1280x720x24 +extension GLX' bash /case/source/x11-smoke.sh \
  > output/docker-run.stdout 2> output/docker-run.stderr
run_exit=$?
set -e
printf 'exit=%s\n' "$run_exit" >> output/docker-run.stdout
if [ "$run_exit" -ne 0 ]; then
  printf 'run_status=FAILED docker X11 smoke failed; inspect output/docker-run.*\n' >> output/run-metadata.txt
  exit "$run_exit"
fi

printf 'run_status=PASS\n' >> output/run-metadata.txt
cp output/xvfb-mesa-window.png figures/xvfb-mesa-window.png
python3 parse.py --write-derived
sha256sum Dockerfile source/x11-smoke.sh output/docker-build.stdout output/docker-build.stderr output/docker-run.stdout output/docker-run.stderr output/run-metadata.txt output/x11-smoke.txt output/xvfb-mesa-window.png figures/xvfb-mesa-window.png derived/capture.json > output/SHA256SUMS
