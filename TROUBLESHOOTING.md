# Troubleshooting: case studies and resolution log

What went wrong while installing the library and making films with it, why, and what fixed it. Start with the quick check, then read the case for the details. Add a case whenever a problem costs more than a few minutes (template at the end).

Cases come from real sessions: **Enough Light** (Watercolor Brush, 1920×1080) and **A Little Further** (Impasto, 1080×1920, 30 fps, 2:17), both made on Windows 11 with Git Bash in October 2026.

## Quick check

| Symptom | Likely cause | Fix | Case |
|---|---|---|---|
| `setup.sh` clones into a path like `…/mystudio/D:/LEARNING SPACE/…` | `git rev-parse` returns `D:/…`, which the absolute-path test didn't accept | fixed in `setup.sh`; elsewhere accept `[A-Za-z]:*` as absolute | [W1](#w1) |
| `setup.sh deps` says `.venv is broken; making it again` and deletes a working venv | native Windows venvs use `.venv/Scripts/python.exe`, not `.venv/bin/python` | fixed (`venv_py`) in `setup.sh` and `tools/directory/library-setup.sh`; `fetch.sh` too | [W2](#w2) |
| `uv pip install`: `No virtual environment … for path .venv/bin/python` | same as above | same as above | [W2](#w2) |
| Playwright: `Request to …chrome-headless-shell-win64.zip timed out after 30000ms`, five retries, `Download failure` | Node's downloader stalls on this network (curl gets the same file in 30 s) | download the zip yourself into the Playwright cache (commands in the case) | [W3](#w3) |
| `! missing: ffmpeg` after you installed it | the shell (or the agent's shell) started before the install updated PATH | open a new terminal; check with `Get-Command ffmpeg` | [W4](#w4) |
| `tools/fetch.sh`: `UnicodeEncodeError: 'charmap' codec can't encode character '\u2193'` | Windows Python writes redirected output as cp1252 | fixed in `fetch.sh` (`PYTHONUTF8=1`); otherwise `export PYTHONUTF8=1` | [W5](#w5) |
| Rendering a style's `demo/` stops with `[pageerror] A network error occurred` | demo sources are partial on purpose (font binaries, samples missing) | don't render demos; smoke-test with a minimal page | [P1](#p1) |
| "The video has no sound" | the user opened `out/video.mp4` (picture only, before the mux) | deliver only `<name>.mp4`; delete intermediates after the build | [P2](#p2) |
| `mux.sh: warning: the film missed the target … peak 0.6 dB` | the mix's crest factor is too high for −14 LUFS under −1.2 dBTP | stereo-linked look-ahead limiter at active loudness + 10 dB before the mux | [A2](#a2) |
| A "silence" measures as loud as the rest | a noise bed built with `cumsum` (brown noise) grows without bound | high-pass and `norm()` every generator; measure the silence | [A1](#a1) |
| `readcheck`: a note `got 2.48s`, `need 2.63s` | the camera moves the label out of frame before it's read | start the note earlier, hold the camera longer, or shorten the text | [P5](#p5) |
| Portrait (9:16) impasto frames have an off-centre vignette | `impasto.js` hard-coded the 16:9 aspect | use `W/H` (`uAsp`) in the copied engine | [R1](#r1) |
| Limbs shoot out as long sticks | IK end points beyond the limb's reach | clamp the target to the reach before IK | [R2](#r2) |
| A character vanishes in the grey (desaturated) version | the figure and background have the same luminance | plan values for the grey version; add a rim light | [R3](#r3) |
| The canvas peeks in at a frame edge | the camera centre lets the view leave the plate | clamp with `keepIn` (half = W/2/zoom) | [R4](#r4) |
| Mid-transition frame looks like a glitch on a contact sheet | a paint-over transition was sampled | extract the exact frames from the video before "fixing" anything | [P4](#p4) |
| Delivery needs a bitrate (e.g. 8–16 Mbps) | `mux.sh` encodes at CRF 19, so the bitrate floats | add a two-pass ABR encode after the mux | [P3](#p3) |
| A `bash -c` heredoc with inline Python fails: `unexpected EOF while looking for matching '` | the agent's shell wrapper mangles nested quotes | write the script to a file and run it | [W6](#w6) |

## Resolution log

### Windows install

<a id="w1"></a>**W1 · `setup.sh` mangled a drive-letter path.** *Resolved, committed.*
- Symptom: `↓ downloading the style library into /d/…/mystudio/D:/LEARNING SPACE/…`, then `could not create leading directories`.
- Cause: inside a clone, `git rev-parse --show-toplevel` returned `D:/LEARNING SPACE/…` (mixed form), not `/d/…`. `case "$LIB" in /*)` didn't see it as absolute and prefixed `$(pwd)`.
- Fix: `case "$LIB" in /*|[A-Za-z]:*) ;;`. Workaround before the fix: `LEMO_OPUSCAR_HOME=/d/path/to/library`.

<a id="w2"></a>**W2 · `setup.sh deps` deleted a working venv.** *Resolved; `tools/fetch.sh` and `tools/directory/library-setup.sh` not yet committed.*
- Symptom: `! …/.venv is broken; making it again`. Then the user's active venv (the `(.venv)` prompt) was gone, and the next step failed with `No virtual environment … for path .venv/bin/python`.
- Cause: every script assumed the POSIX layout `.venv/bin/python`; uv and Python on Windows create `.venv/Scripts/python.exe`. The "broken venv" test failed and ran `rm -rf .venv`.
- Fix: a `venv_py()` helper that returns whichever layout exists, used for every Python call; `fetch.sh` checks both.
- Lesson: before running a setup script in someone's repo, look at what it will touch (`ls .venv`). A destructive branch (`rm -rf`) should never trigger on a layout it doesn't recognise.

<a id="w3"></a>**W3 · Playwright's headless browser would not download.** *Worked around; root cause open.*
- Symptom: `timed out after 30000ms` five times, then `Failed to install browsers`. `PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT=180000` failed the same way, and so did the user's own PowerShell. `curl -L` fetched the same 120 MB zip in about 30 s.
- Cause (likely): Node's download stalls on this network; curl and PowerShell don't.
- Fix: put the browser where Playwright expects it, with its two marker files (`browsers.json` gives the revision):
  ```powershell
  $dst = "$env:LOCALAPPDATA\ms-playwright\chromium_headless_shell-1243"
  New-Item -ItemType Directory -Force -Path $dst | Out-Null
  Invoke-WebRequest -Uri "https://cdn.playwright.dev/builds/cft/153.0.8010.12/win64/chrome-headless-shell-win64.zip" -OutFile "$dst\chs.zip" -TimeoutSec 600
  Expand-Archive -Path "$dst\chs.zip" -DestinationPath $dst -Force; Remove-Item "$dst\chs.zip"
  New-Item -ItemType File -Path "$dst\DEPENDENCIES_VALIDATED","$dst\INSTALLATION_COMPLETE" -Force | Out-Null
  ```
  Then `node node_modules/playwright-core/cli.js install chromium-headless-shell` finishes silently. The zip's top folder is `chrome-headless-shell-win64/`. Alternative: `PLAYWRIGHT_CHROME=<path to an exe>`.

<a id="w4"></a>**W4 · ffmpeg installed but not found.** *Resolved.*
- The agent's shell and already-open terminals keep the PATH they started with. Check in a new PowerShell: `Get-Command ffmpeg`. Note that `%LOCALAPPDATA%\ms-playwright\ffmpeg-*\ffmpeg-win64.exe` is Playwright's own trimmed build: don't rely on it for muxing.

<a id="w5"></a>**W5 · `fetch.sh` crashed printing its progress arrow.** *Resolved, not yet committed.*
- `UnicodeEncodeError: 'charmap' codec can't encode character '\u2193'`. Windows Python uses cp1252 for redirected stdout. `fetch.sh` now exports `PYTHONUTF8=1`. Set it for any library Python run on Windows (`build.sh` does).

<a id="w6"></a>**W6 · The agent's shell broke on heredocs with nested quotes.**
- `bash -c` reported `unexpected EOF while looking for matching '` for a heredoc of Python containing quotes. Write the script to a file (scratchpad) and run it.

Also seen, harmless: the faster-whisper / Hugging Face warning about symlinks on Windows (`HF_HUB_DISABLE_SYMLINKS_WARNING=1` silences it).

**Docs to update:** `TECHNIQUE.md` §1 says "on Windows use WSL". Native Windows with Git Bash works after W1–W5; say so and link here.

### Production

<a id="p1"></a>**P1 · Demo sources are not renderable.** By design (the skill says so): font binaries, samples and big assets are left out, and `document.fonts.load()` on a missing font rejects, which is a page error. Use a 20-line page with `window.render`, `window.DUR` and `window.READY` as a pipeline smoke test (`still.mjs`, then `video.mjs`, then `ffprobe`).

<a id="p2"></a>**P2 · The user opened the silent intermediate.** `out/video.mp4` has no audio track. Tell the user the delivery file by its full path, and delete `out/video.mp4` / `out/muxed.mp4` after a successful build (the films' `build.sh` recreates them).

<a id="p3"></a>**P3 · A bitrate spec.** `mux.sh` is CRF 19, so bitrate depends on content. For "8–16 Mbps" run a two-pass encode after the mux, copying the mastered audio:
```sh
ffmpeg -i muxed.mp4 -c:v libx264 -preset slow -b:v 12M -maxrate 16M -bufsize 24M -pix_fmt yuv420p -r 30 -pass 1 -an -f null -
ffmpeg -i muxed.mp4 -c:v libx264 -preset slow -b:v 12M -maxrate 16M -bufsize 24M -pix_fmt yuv420p -r 30 -pass 2 -c:a copy -movflags +faststart film.mp4
```
Result: 11.1 Mbps video, audio untouched. Vertical films: pass `--size 1080x1920` to *every* render tool, including `events.mjs` and `readcheck.mjs`.

<a id="p4"></a>**P4 · A false alarm from the contact sheet.** A tile showed a "blob" over the bed. It was a 0.6 s paint-over transition sampled mid-way. Check with `ffmpeg -ss <t> -i film.mp4 -frames:v 1` at a few nearby times before changing code. Stills rendered with `still.mjs` can differ from video frames only if state leaks between frames.

<a id="p5"></a>**P5 · readcheck failures from camera moves.** Field notes written during a dolly left the frame 0.1–0.8 s too early. Options, in order: start the note earlier (while the subject is still painting in), hold the camera longer on the subject, shorten the text. Counters that tick down: report them only while they hold (`hold ≥ 1.7 s`). Observed: readcheck judges the first continuous span of each `id`, so an identical text repeated later (the same ticket each day) passes on its first, long appearance.

<a id="p6"></a>**P6 · Ambiguous feedback about "big and small text overlapping".** Two places matched (the counter's number over its label, and the title over the subtitles). Asking with both options shown saved a wrong rebuild: the user meant the title.

<a id="p7"></a>**P7 · The demo comparison (DIRECTOR.md §11) must come from reading `DEMO.md`.** A comparison written from memory was wrong (it called the impasto demo "an establishing shot" story; it opens on a close-up of a cello). Read *Story & structure* and *Shots* before writing it, and name what is shared (the impasto demo and *A Little Further* share the score shape and "one coloured thing").

### Rendering and characters

<a id="r1"></a>**R1 · Impasto vignette in portrait.** `CFS` in `impasto.js` had `q.x *= 1.78`. In the film's copy: a `uAsp` uniform set to `W / H`. Worth fixing in the style's engine too, so the next vertical film doesn't need it.

<a id="r2"></a>**R2 · Stretched limbs.** `ik()` places the joint, but drawing the forearm to an unreachable target makes a stick. Clamp the end point to `(l1 + l2) * .995` first (`limb()` in `films/a-little-further/scenes/figures.js`). Place a pushing figure from the stone (`pusher()`), not the stone from the figure.

<a id="r3"></a>**R3 · Figures lost in the grey version.** Days 1–3 drew everything with `grey: 1`, and skin, stone and slope had near-equal luminance. Fixes: light the stone from the sun side so its dark side sits behind him; a thin rim stroke (`rimOn`) on the upper edge of torso and near arm (silver-blue in the cold days, gold on Day 4); the face kept in shadow. Check every key frame at thumbnail size in the grey version, not only the colour version.

<a id="r4"></a>**R4 · Canvas outside the plate.** Any camera centre needs `keepIn(cam, plateW, plateH)`; this was missed on the screen close-up.

<a id="r5"></a>**R5 · A 45° slope made "pushing" unreadable.** At 45° a pushing body lies almost flat on the slope. A curved path (about 32° at the foot, steepening to the summit) reads as effort and still makes the summit far away. Compute the local angle, normal and arc length from the path (`angAt`, `nrmAt`, `arc`) for feet, the stone's rest and the stone's rotation (distance ÷ radius).

<a id="r6"></a>**R6 · Watercolour washes looked like vector shapes.** Flat `washPoly` bands read as cut paper. Lay long horizontal `mk()` strokes with bristles over every wash. Light is a hole in the wash (`destination-out`) with a pooled rim (`source-atop` stroke), and keep the blur at 2–4 px: more reads as a digital glow.

<a id="r7"></a>**R7 · Match cuts.** A paint-over between two shots whose subjects don't line up smears one over the other. For a match on motion and frame position, a hard cut on the beat is cleaner; keep paint-overs for shots that share a composition.

### Sound

<a id="a1"></a>**A1 · Unbounded noise.** `np.cumsum(noise)` grows with length: a "room tone" in a silence came out at −21 dBFS. Always `hp(cumsum, 20)` and `norm()` a brown-noise generator. Then **measure**: print RMS per 0.25–0.5 s around every silence; a real near-silence measured −36 to −45 dBFS.

<a id="a2"></a>**A2 · True peak over the target.** Sharp transients (a stone's knock, a chisel's ring) gave +0.6 dBTP at −14.3 LUFS. Before the final normalise: set the mix to a known active loudness (−24 dBFS RMS), apply a stereo-linked look-ahead limiter with its ceiling 10 dB above that, then normalise to 0.89 peak. The mux then landed at −14.0 LUFS, −2.2 dBTP.

<a id="a3"></a>**A3 · Stem balance.** Set each stem to a target over the time it actually plays (frames above −80 dB), not its whole-film RMS: music −24, foley −25, ambience −36, voice −15, then duck music and beds about 8 dB under the voice.

<a id="a4"></a>**A4 · Voice choices.** Offline Kokoro, English female: `af_heart` (warm), `af_bella` (clear, chosen for *A Little Further*), `af_sarah` (calm, lower), `af_nicole` (whispered and very slow: 13.8 s for a line the others read in 8–9 s), `bf_emma`, `bf_isabella` (British). Online (edge-tts via `core/tts/tts_zh.py --voice`, works for English too): `en-US-AriaNeural`, `en-US-JennyNeural`, `en-GB-SoniaNeural`. Render one line in each into a numbered folder and let the user pick.

## Kit backlog (proposed, not done)

1. `TECHNIQUE.md` §1: native Windows works with Git Bash; link this file (W1–W5).
2. `setup.sh deps`: when the Playwright download fails, print the manual commands from W3 instead of five stack traces.
3. Demo `build.sh` scripts and `core/README.md` hard-code `.venv/bin/python`: use a `$PY` that falls back to `.venv/Scripts/python.exe`.
4. `styles/impasto/demo/engine/impasto.js`: aspect-aware vignette (R1).
5. `mux.sh`: an optional `--bitrate` (two-pass ABR) for deliveries with a bitrate spec (P3), and a built-in peak limiter, or a clear recipe (A2).
6. `video.mjs`: write `video.mp4` as `video.silent.mp4` (or delete it after `mux.sh`) so nobody opens it by mistake (P2).
7. `core/audio/sfx.py`: a bounded `brown(d)` and an `act_db()` helper (A1, A3).

## Template

```
<a id="xN"></a>**xN · One line naming the problem.** *Status (resolved / worked around / open), and whether it is committed.*
- Symptom: the exact message or what was seen.
- Cause: what was actually wrong.
- Fix: the change or the commands, with the file.
- Lesson: what to do differently next time (optional).
```
