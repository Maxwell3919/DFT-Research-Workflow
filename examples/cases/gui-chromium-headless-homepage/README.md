# Chromium headless browser capture on Talos

This is a small, terminal-first browser-rendering case.  It captures a local,
versioned HTML walkthrough with the Chromium binary that was available on
Talos.  It is deliberately not presented as an X11/VESTA walkthrough: at
capture time Talos had no `Xvfb`, `glxinfo`, lightweight window manager,
`xdotool`, `scrot`, or VESTA executable, and non-interactive `sudo` was not
available to install them.

Run from this directory:

```bash
CASE_RUN_ROOT=/absolute/empty/chromium-run bash run.sh
cd /absolute/empty/chromium-run
bash check.sh
python3 parse.py
```

`CASE_RUN_ROOT` must be an existing empty directory outside this case. The
entrypoint reconstructs the case there and rejects an omitted, non-empty,
in-case, or child-of-case root. `run.sh` records the DISPLAY/X11 capability probes in `environment.txt` before asking Chromium's
documented headless mode to render `source/walkthrough.html`.  The resulting
PNG, raw stderr, sanitized stderr, and derived record remain in the external
run root; it never writes repository `public/media`. It demonstrates only that
the named browser rendered the named local document at the recorded viewport. It does not prove
an X11 window was created, that a GUI structure viewer worked, or anything
about a DFT structure or calculation.

The output files are generated artifacts.  Their SHA-256 values and the
capture command are bound in `manifest.json`; rerunning can change the PNG if
the browser version changes.
