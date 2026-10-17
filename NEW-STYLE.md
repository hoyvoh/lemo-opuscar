# Making a new animation style

**For the repository owner.** A step-by-step path from an idea or a set of concept images to a style other agents can use, with what must be true before you move on. It expands "Add a style" in [`MAINTAINING.md`](MAINTAINING.md); the rules there still apply. Expect to loop: most styles go round stages 3–5 several times.

A style is not a palette or one good film. It is **a medium with rules** that make *any* topic look like it, plus an engine that draws in that medium. The test at the end is whether an agent who has never seen your demo can make a different film with it.

## 0. Is it a new style?

Write down 3–5 traits that make a frame read as this style in one glance (material, mark, edges, light, motion). Then compare them with the two closest styles in [`styles/README.md`](styles/README.md).

**Go on only if** at least two of the traits are absent from both neighbours. "Watercolour, but blue" is a palette; "watercolour that bleeds along wet paper fibres and dries with hard edges in real time" may be a style.

Also decide:
- **Film style or scene style?** A scene style (a set-up guide, a spec walkthrough) reads its words from `content.json` and lists use cases; a film style tells stories.
- **Category** (one of the gallery's, `category_en` / `category_cn` in `style.json`).
- **Slug** (lowercase, digits, hyphens, unique). Work in **`styles/_<slug>/`** while experimenting: folders starting with `_` are drafts that the release checks skip. Rename at stage 8.

## 1. Concept intake: from images to a look bible

Put the concept images somewhere git ignores (for example `films/<slug>-refs/`).

**Rights.** Your own concept art: use it freely. Someone else's work: it teaches grammar only. Don't trace it, sample its pixels or copy its characters, layouts, typefaces or melodies, and don't name it in films. That rule ends up in the `> References (grammar only)` line of `STYLE.md`.

For each image, answer in a short `LOOK.md` (local, not committed):

| Question | Becomes |
|---|---|
| What is the physical medium? What makes one mark (a stroke, a cut, a pixel, a fold)? How big is a mark relative to the frame? | `STYLE.md` §2 |
| How are edges made: hard, lost, outlined, torn? | §1, §2 |
| What is the value structure (squint: how many values)? | §3 |
| Which colours, how many, what is the neutral ground, what gets the strongest chroma? | §3 |
| Where does light come from; is it painted or simulated? | §2 |
| What would type look like in this world? | §4 |
| How would it move: on ones/twos, boiling or static, eased or snappy? | §5 |
| What does this material sound like? | §7 |

**Done when** you can describe the look in two sentences without naming the images, and you have 3–5 defining traits and a list of "not this" neighbours.

## 2. Draft `STYLE.md`

Copy `styles/_template/` (`style.json`, `STYLE.md`, `DEMO.md`) into `styles/_<slug>/`. Fill `STYLE.md` sections 1–11, keeping the numbering (other guides refer to it).

Criteria (the template comments say the same):
- 6–11 KB. **Rules, not history**: what stays true for every film.
- **No** story, arc, shot table with times, prescribed opening or ending, BPM, key, demo palette, demo props or end card. Those go to `DEMO.md`.
- A number you'll measure in the demo becomes a rule here ("the subject fills ≥ ⅓ of the frame height").
- §6 camera grammar is a vocabulary table, not a route; no row names *the* opening or ending move.
- §8 native moves: each one has a build hint and **fits content like…** with three examples unrelated to your planned demo.
- §9 pitfalls belong to the medium, each with its fix.
- §11 gives three structures, three openings and three endings, all far from the demo.
- No sign-off ("LemoLab", "Opus 5.5") in `STYLE.md`: `release.py --strict` rejects it.

The first draft will be wrong in places. Stages 3–5 correct it; keep it in step.

## 3. Look test: the engine draws three style frames

Pick the engine route:
- **Reuse** an engine from a close style (read its `STYLE.md` §10 and `DEMO.md` "Engine reference"): the impasto knife-stroke renderer (WebGL2), the watercolour stroke engine (Canvas 2D), and others. Copy it into `demo/`, never edit another style.
- **Extend** one (a new stroke type, a new post pass).
- **Write a new one** when the medium's mark doesn't exist yet. Budget the most time here.

Every engine follows the page contract ([`TECHNIQUE.md`](TECHNIQUE.md) §2): `window.render(t)` deterministic, `window.DUR`, `window.READY`, optional `window.EV` and `window.TEXTS`. No `Math.random()` without a fixed seed, no state carried between frames.

Render **three style frames** from a subject that is *not* your planned demo (one wide, one close, one with type), with the real code (`node core/render/still.mjs`).

**Done when:**
- [ ] Placed next to the concept images, the frames read as the same medium. Show them to someone without telling them which is which.
- [ ] They read at **480 px wide** (squint test) and hold up at a **100 % crop** (the material is visible).
- [ ] A **grey version** still separates subject and background (TROUBLESHOOTING.md R3).
- [ ] **Determinism:** the same `t` rendered twice, and in `video.mjs` with several workers, gives the same frame (compare a `still.mjs` still with `ffmpeg -ss` from the video).
- [ ] **Sizes:** the page lays out from `innerWidth` × `innerHeight` and works at `1920x1080`, `1080x1920` and `1080x1350` (the presets in DIRECTOR.md §1; nothing hard-codes 16:9, TROUBLESHOOTING.md R1).
- [ ] **Speed:** about 0.5 s per 1080p frame per worker at most (`video.mjs` prints the rate); otherwise cache static layers as sprites or batches.

## 4. Motion test: a 10-second clip

One subject entering, one camera move, one native move from §8, one transition. Render it (`video.mjs --fps 24`), then review:

- [ ] Contact sheet plus a 0.2 s strip of the key action ([`TECHNIQUE.md`](TECHNIQUE.md) §8).
- [ ] Static marks don't boil; moving ones are rebuilt from fixed seeds.
- [ ] The stepping (ones/twos) matches §5, and the camera stays smooth.
- [ ] The camera never shows outside the painted or modelled area (TROUBLESHOOTING.md R4).
- [ ] Characters, if any: limbs never stretch (R2), poses blend, the silhouette reads at thumbnail size.

Update `STYLE.md` §5, §6 and §9 with what you learned.

## 5. Sound test: a 20-second sketch

Instruments from §7, three foley materials of the medium, one silence, timed from `window.EV` (`node core/render/events.mjs`).

- [ ] `sh core/render/mux.sh … ` reports about −14 LUFS and **no warning** (TROUBLESHOOTING.md A2).
- [ ] The silence measures below about −35 dBFS (A1).
- [ ] Every visible action in the clip has a sound.

## 6. Human gate: approve the style frame

Pick the best frame as `demo/stills/styleframe.jpg` (it becomes the gallery card). **Approve it yourself before production** (MAINTAINING.md "Gates"). If it doesn't feel finished, go back to stage 3: a weak frame only gets weaker over a 60-second film.

## 7. The demo film

Make it like any film ([`DIRECTOR.md`](DIRECTOR.md)): treatment with three structures, benchmark, shot list, cue map, sound design table, then production. Library-demo rules on top (MAINTAINING.md):
- `<slug>.mp4` is the **1080p landscape** film for the gallery. A vertical cut for TikTok is a separate film of yours, not part of the style folder.
- **Bilingual subtitles, one line per language** (Chinese and English), never wrapped; split long lines into two cues.
- Comparisons hold still at least 2.5 s before the verdict.
- Assets: CC0, CC BY or OFL only, each in `demo/CREDITS`. Real events and products: every fact in `demo/FACTS.md`.
- The "LemoLab × Claude Opus 5.5" sign-off lives only on the demo's end card and in `DEMO.md`.

Machine gates: `asr_check.py` passes on every line; `mux.sh` about −14 LUFS with no warning; `readcheck.mjs` passes; no black frames.

## 8. Write `DEMO.md`, finish `demo/`, register

- `DEMO.md` opens with "One example among many. Don't reuse its story, arc, shots, props or timings." It then holds what `STYLE.md` must not: story, shots with times, score structure, palette and props, end card, build notes, and the **Engine reference** (an API table and a minimal example that draws something not in the demo).
- `demo/`: source, a one-command `build.sh`, `CREDITS`, `stills/styleframe.jpg`. Treatments, logs, fonts, audio and large textures stay local (gitignored); `CREDITS` names every asset so it can be found again.
- Rename `styles/_<slug>/` to `styles/<slug>/`. Fill `style.json` (`num` = next free number, `frame_sec` = the README grid frame, `uses` = three uses, `line` / `line_cn`).
- Then, from MAINTAINING.md "Register": `python3 styleboard/build.py`, `python3 styleboard/build.py --frames <slug>`, `sh styleboard/frames.sh <slug>`, `sh tools/web_cuts.sh`.

## 9. The blind test: does it work for someone else?

The real acceptance test. Start a fresh agent session with only the library, and ask for a 30-second film in your style **on an unrelated topic** (for TikTok, with the `tiktok` preset). Don't help it.

- [ ] It finds the style by name, and its treatment doesn't copy the demo's story.
- [ ] The frames read as the style, at 9:16 as well as 16:9.
- [ ] It didn't need anything that isn't written in `STYLE.md` §10 or `DEMO.md` "Engine reference".

Every time it stumbles, the fix goes into `STYLE.md` (rules, pitfalls) or the engine docs. Repeat until a run goes through cleanly. Log the problems in [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) if they are general.

## 10. Release gate and publish

```sh
python3 tools/release.py check --strict <slug>
```
It checks the folder format (`style.json` fields, `STYLE.md`, `DEMO.md`, no sign-off in `STYLE.md`), that `poster.jpg`, `demo/stills/styleframe.jpg` and `demo/CREDITS` are committable, the catalog entry, a readable `<slug>.mp4`, the web cut, an `.srt` when there's a voice, and that every still the docs link exists. Then follow MAINTAINING.md "Publish".

## Scorecard

Keep it at the top of a local `styles/<slug>/PRODUCTION_LOG.md` (gitignored) and tick as you go:

| Stage | Pass when | ✓ |
|---|---|---|
| 0 New style | ≥ 2 traits absent from both nearest styles | |
| 1 Look bible | two-sentence description; traits; "not this" list; rights clear | |
| 2 `STYLE.md` draft | 11 sections, 6–11 KB, rules only, no demo content | |
| 3 Look test | 3 frames match the concept; 480 px and 100 % crop; grey check; deterministic; 3 sizes; speed | |
| 4 Motion test | no boiling; stepping per §5; camera inside the world; rigs hold | |
| 5 Sound test | −14 LUFS, no mux warning; silence < −35 dBFS; every action sounds | |
| 6 Style frame | approved by you | |
| 7 Demo film | all machine gates; bilingual subtitles; licences | |
| 8 Docs and register | `DEMO.md` complete with Engine reference; `style.json`; gallery built | |
| 9 Blind test | a fresh agent makes an unrelated 9:16 film without help | |
| 10 Release | `release.py check --strict <slug>` clean | |

Log each loop as you go: what you tried, what you saw (a still or a sheet), what you changed in `STYLE.md` or the engine. That log is what lets you, or an agent, pick the work up again later.
