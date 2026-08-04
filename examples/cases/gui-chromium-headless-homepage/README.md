# Chromium headless browser capture on Talos

This is a small, terminal-first browser-rendering case.  It captures a local,
versioned HTML walkthrough with the Chromium binary that was available on
Talos.  It is deliberately not presented as an X11/VESTA walkthrough: at
capture time Talos had no `Xvfb`, `glxinfo`, lightweight window manager,
`xdotool`, `scrot`, or VESTA executable, and non-interactive `sudo` was not
available to install them.

Run from this directory:

```bash
bash run.sh
bash check.sh
python3 parse.py
```

`run.sh` records the DISPLAY/X11 capability probes in `environment.txt` before asking Chromium's
documented headless mode to render `source/walkthrough.html`.  The resulting
PNG is copied to `public/media/gui/chromium-headless-homepage/` so it can be
inspected as a public asset.  It demonstrates only that the named browser
rendered the named local document at the recorded viewport.  It does not prove
an X11 window was created, that a GUI structure viewer worked, or anything
about a DFT structure or calculation.

The output files are generated artifacts.  Their SHA-256 values and the
capture command are bound in `manifest.json`; rerunning can change the PNG if
the browser version changes.
