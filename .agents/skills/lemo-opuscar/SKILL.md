---
name: lemo-opuscar
description: Direct and produce films, promos, explainers, and animations entirely in code using the Lemo-Opuscar style library. Use for a film about the user's topic, choosing a film style, or listing available styles. Not for editing or converting existing video files.
---

# Lemo-Opuscar for Codex

Resolve the library root as `../../..` relative to this skill's directory,
regardless of the shell's current directory. Run library commands from that root.

Read [AGENTS.md](../../../AGENTS.md) and follow its film workflow, including
its directing guide, technical guide, tool documentation, and style catalog.
The 51 styles are resources selected through
[styles/README.md](../../../styles/README.md).

For film requests, run `sh plugin/skills/lemo-opuscar/scripts/setup.sh deps`
from the library root and include missing prerequisites in the single brief
question round. Add voice or music dependencies only when needed.

On Windows, use a POSIX shell such as Git Bash for `.sh` scripts and quote paths
containing spaces. If `sh` is absent from PowerShell's PATH, run setup from the
library root using:

```powershell
& 'C:\Program Files\Git\bin\bash.exe' plugin/skills/lemo-opuscar/scripts/setup.sh deps
```

Read [windows-setup-fix.md](../../../windows-setup-fix.md)
if Playwright's browser download times out. Its manual download pins a browser
revision: check the installed Playwright package's `browsers.json` before using
those URLs and cache paths with a different version. Preserve the existing
drive-letter path fix in the setup script.

Create the user's project in `films/<name>/`. Preserve the selected `STYLE.md`
invariants and write `TREATMENT.md` before opening `DEMO.md` or demo source.
Use demos for techniques only. Follow the repository's storyboard approval
and delivery requirements.

For installation outside this repository, use `plugin/skills/lemo-opuscar/`,
including its `scripts/` directory. This local entrypoint depends on the
surrounding repository and should not be copied alone.
