# Figure output boundary

`figures/xvfb-mesa-window.png` is created only after the container reaches
Xvfb, Mesa llvmpipe, GUI launch, window detection, and screenshot capture.
The recorded Docker Hub timeout occurred before container creation, so no
screenshot is present and none is claimed.
