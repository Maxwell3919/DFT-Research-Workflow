# Xvfb, Mesa, and X11 window smoke test in Docker

This terminal-first case builds a disposable Ubuntu 24.04 container and tests
an isolated X11 chain with Xvfb.  It is intentionally a GUI-environment smoke
test, not a VESTA walkthrough and not a structure or DFT result.

From this directory, run:

```bash
CASE_RUN_ROOT=/absolute/empty/xvfb-run bash run.sh
cd /absolute/empty/xvfb-run
bash check.sh
python3 parse.py
```

`CASE_RUN_ROOT` must be an existing empty directory outside this case. The
entrypoint reconstructs the case there and rejects an omitted, non-empty,
in-case, or child-of-case root, leaving committed outputs, figures, manifests,
and public media untouched. Raw Docker-build stderr is retained in that external
root alongside the normalized record. `run.sh` builds the local `Dockerfile`, then runs `source/x11-smoke.sh` in the
image.  The container uses `LIBGL_ALWAYS_SOFTWARE=1`; the smoke script records
the `llvmpipe` renderer, starts Openbox and `xmessage`, finds the xmessage
window with `xdotool`, and captures it with `scrot`.  The browser/VESTA
application is deliberately outside this bounded test.

The committed terminal logs and screenshot are public-safe: the container sees
the case as `/case`, and host paths are not emitted.  The manifest binds the
captured artifacts and explains what the screenshot does not establish.
