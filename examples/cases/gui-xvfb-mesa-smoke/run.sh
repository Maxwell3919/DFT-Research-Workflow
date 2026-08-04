#!/usr/bin/env bash
if [[ "${CASE_RUN_ROOT_ACTIVE:-}" == "1" ]]; then
  case_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
  active_root=$(CDPATH= cd -- "${CASE_RUN_ROOT:?FAIL internal run root is missing.}" && pwd -P) || exit 2
  [[ "$case_dir" == "$active_root" && -f "$active_root/.case-run-root" ]] || { printf 'FAIL internal run root marker is invalid.\n' >&2; exit 2; }
else
  case_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
  repo_root=$(CDPATH= cd -- "$case_dir/../../.." && pwd -P)
  : "${CASE_RUN_ROOT:?FAIL set CASE_RUN_ROOT to an existing empty external directory; committed case artifacts are never rerun in place.}"
  run_root=$(CDPATH= cd -- "$CASE_RUN_ROOT" && pwd -P) || { printf 'FAIL CASE_RUN_ROOT must be an existing directory.\n' >&2; exit 2; }
  if [[ "$run_root" == "$repo_root" || "$run_root" == "$repo_root/"* ]] || [[ -n "$(find "$run_root" -mindepth 1 -maxdepth 1 -print -quit)" ]]; then
    printf 'FAIL CASE_RUN_ROOT must be an empty directory outside the repository.\n' >&2; exit 2
  fi
  cp -a "$case_dir/." "$run_root/"
  : > "$run_root/.case-run-root"
  exec env CASE_RUN_ROOT_ACTIVE=1 CASE_RUN_ROOT="$run_root" bash "$run_root/run.sh" "$@"
fi
set -euo pipefail

case_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$case_dir"
mkdir -p output derived figures
image_tag='dft-rw-gui-xvfb-mesa-smoke:20260805'
printf 'image_tag=%s\n' "$image_tag" > output/run-metadata.txt
printf 'docker_version=%s\n' "$(docker --version)" >> output/run-metadata.txt

set +e
docker build --no-cache --tag "$image_tag" . > output/docker-build.stdout 2> output/docker-build.stderr.raw
build_exit=$?
set -e
printf 'exit=%s\n' "$build_exit" >> output/docker-build.stdout
raw_build_stderr_sha256=$(sha256sum output/docker-build.stderr.raw | awk '{print $1}')
sed 's/[[:space:]]*$//' output/docker-build.stderr.raw > output/docker-build.stderr
public_build_stderr_sha256=$(sha256sum output/docker-build.stderr | awk '{print $1}')
{
  printf 'rule=strip trailing whitespace from Docker build stderr lines\n'
  printf 'raw_docker_build_stderr_sha256=%s\n' "$raw_build_stderr_sha256"
  printf 'public_docker_build_stderr_sha256=%s\n' "$public_build_stderr_sha256"
} > output/sanitization.txt
if [ "$build_exit" -ne 0 ]; then
  printf 'run_status=BLOCKED docker build failed; inspect output/docker-build.*\n' >> output/run-metadata.txt
  python3 parse.py --write-derived
  sha256sum Dockerfile source/x11-smoke.sh output/docker-build.stdout output/docker-build.stderr output/run-metadata.txt output/sanitization.txt derived/capture.json > output/SHA256SUMS
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
sha256sum Dockerfile source/x11-smoke.sh output/docker-build.stdout output/docker-build.stderr output/docker-run.stdout output/docker-run.stderr output/run-metadata.txt output/sanitization.txt output/x11-smoke.txt output/xvfb-mesa-window.png figures/xvfb-mesa-window.png derived/capture.json > output/SHA256SUMS
