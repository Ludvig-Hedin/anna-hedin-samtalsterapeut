# Brief: close the last gap to visual parity on Webflow imports — animations included

Paste this to an agent working in
`~/Programming/personal/LA_DESIGN/projekt/simple-site-builder`.

---

## What you are being asked to do

Make an imported Webflow site look like the site it came from — **including its
motion**. Webflow exports are a large share of what people bring to SnabbSajt,
and right now we reproduce their layout, type and colour well and their
animation not at all.

There is a real, measured reference case in this repo:
`~/Programming/personal/clients/anna-hedin-samtalsterapeut` — a Webflow export
(`index.html`, byte-identical to live annahedin.com) plus the SnabbSajt package
built from it (`snabbsajt-site/`). Use it as the test fixture throughout. Its
current state:

| | 1440 | 768 | 375 |
|---|---|---|---|
| whole-page height, source → import | 6402 → 6482 (**+1.2 %**) | 6068 → 6323 (+4.2 %) | 6404 → 6964 (+8.7 %) |

Font sizes match exactly at all three widths. **Animation parity: zero.**

Your job is the motion (part 1, the bulk of the work) and then eight named
layout deviations (part 2).

---

## Part 1 — motion

### 1.1 What a Webflow export actually contains

Two dialects. Support both; they co-exist on the same page.

**Dialect A — Webflow IX2.** The universal mechanism, present on any site whose
owner used the Interactions panel. In an export:

- elements carry `data-w-id="<guid>"`
- the data is a JS object literal inside `js/webflow.js` (search `ixData`), or
  inline as `Webflow.require("ix2").init({...})`
- shape: `events` keyed `e-1…e-N`, each with `eventTypeId`
  (`SCROLLING_IN_VIEW`, `SCROLL_INTO_VIEW`, `PAGE_START`, `MOUSE_OVER`, …), a
  `mediaQueries` array (`["main","medium"]` = which breakpoints it runs at), a
  `target.id` of the form `<pageId>|<data-w-id>`, and an `actionListId`
- `actionLists` keyed `a-1…a-N` hold the keyframes: `actionItems` with
  `actionTypeId` (`TRANSFORM_MOVE`, `TRANSFORM_SCALE`, `STYLE_OPACITY`,
  `STYLE_FILTER`, …) and a `config` carrying `xValue`/`yValue`, units,
  `duration`, `easing`, `delay`, and a `target.selector`

Worked example from the fixture — the pull-quote parallax:

```js
"a-7": { title: "Parallax side-scroll-desktop",
  continuousParameterGroups: [{ id:"a-7-p", type:"SCROLL_PROGRESS",
    continuousActionGroups: [
      { keyframe: 0, actionItems: [
        { actionTypeId:"TRANSFORM_MOVE", config:{ target:{selector:".parallax.line-1"}, xValue: 10, xUnit:"%" }},
        { actionTypeId:"TRANSFORM_MOVE", config:{ target:{selector:".parallax.line-2"}, xValue: -5, xUnit:"%" }}]},
      { keyframe: 100, actionItems: [ /* both back to 0 */ ]}]}]}
```

Two lines of a quote sliding horizontally in opposite directions, driven by
scroll progress. **That is `animation-timeline: view()` with a `translateX`
range. No JavaScript.**

**Dialect B — attribute-driven GSAP.** Extremely common in Relume and agency
"cloneable" templates, which is most of what a small business buys. The page
declares behaviour with bare HTML attributes and a script at the end of `<body>`
turns them into GSAP tweens. The fixture's, verbatim:

```js
// [animation-fade-blur] — on page load, staggered
gsap.from(fadeBlurElements, {
  y: 24, autoAlpha: 0, filter: "blur(10px)",
  duration: 1, ease: "power2.out", stagger: 0.2 });

// [animation-fade] — same, no blur or rise
gsap.from(fadeElements, { autoAlpha: 0, duration: 1, ease: "power2.out", stagger: 0.2 });

// [animation-scroll-blur] — per element, on entering the viewport
gsap.from(element, {
  autoAlpha: 0, filter: "blur(4px)", y: 24,
  duration: 0.8, delay: 0.15, ease: "power2.out",
  scrollTrigger: { trigger: element, start: "top bottom", toggleActions: "restart none none none" }});
```

Plus Lenis smooth scroll, desktop only:
`new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - 2**(-10*t)), smoothTouch: false })`
gated on `matchMedia("(min-width: 768px)")`.

Look for these attribute families: `animation-*`, `data-animate*`, `data-aos*`,
`[data-scroll]` (Locomotive), `.gsap-*`. Detect the dialect from the script
block, not from a hardcoded list of attribute names.

### 1.2 Why this is closable, and cheaply

Read that vocabulary again: **opacity, translateY/X, blur, duration, easing,
stagger, and a trigger point.** That is the whole thing. Every animation on the
reference site — and on the great majority of Webflow marketing pages — is
inside it.

We already render exactly this shape. See `app/globals.css`, the block starting
`Customer-site scroll motion`: `.site-reveal` uses
`animation-timeline: view()` with `animation-range: entry 0% entry 55%`,
composite-only, **zero client JS**, degrading to the finished page on a browser
that lacks scroll-driven animations. `.site-reveal-full.site-reveal-kids > *`
already staggers a band's children with per-child `animation-range` offsets.

So this is not "port GSAP". It is: widen an existing CSS mechanism, and teach
the importer to fill it in. Keep the no-third-party-JS property — it is the
whole reason `verbatimClone` is not the answer here.

### 1.3 The model to build

`theme.motion` is today a three-value enum (`none` / `subtle` / `full`) and
`sections.motion` overrides it per section. Both stay. Add an optional
**`theme.customMotion`**, in the same spirit as `customType` / `customLayout`
(`convex/model/theme.ts`), carrying what an import measured:

- `enterY` — length, the rise (fixture: `24px`)
- `enterBlur` — length (fixture: `10px` on load, `4px` on scroll)
- `duration` — ms (fixture: 1000 / 800)
- `easing` — a **closed set of named curves**, not a raw string. `power2.out`
  maps to `cubic-bezier(0.215, 0.61, 0.355, 1)`. Never accept arbitrary CSS
  here; it is an injection surface and there is no legitimate need.
- `stagger` — ms between siblings (fixture: `200`)
- `startAt` — where in the entry range motion begins, as a percentage

Rules, non-negotiable, same as every measured field already shipped:

- **every field optional; absent means today's rendering, byte-for-byte.** A
  theme with no `customMotion` must emit identical CSS to what it emits now.
- lengths go through `safeLength` (`lib/sections/theme.ts`) — simple lengths
  only, and **`cqw` not `vw`** (a `vw` value tracks the viewport, which breaks
  the editor's scaled preview; there is a comment there explaining it)
- numbers get explicit bounds. A measured `duration: 90000` must clamp, not
  ship. Same for `stagger`.
- a half-measured set degrades to the preset, it does not half-apply. Look at
  `heroBandMinHeight` in `lib/sections/theme.ts` for the pattern.

### 1.4 Parallax

Add a section-level opt-in — a `parallax` field on the section layout
(`sectionLayoutValidator` in `convex/model/sections.ts`, which already carries
`width` and `paddingY` and is already portable) or a small typed object under
`customMotion`. Implement as CSS:

```css
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .site-parallax { animation: site-parallax-x linear both; animation-timeline: view(); }
  }
}
```

with the translate range from the extracted `xValue`/`yValue`. Still no JS.
`prefers-reduced-motion` must disable it — a parallax is exactly the effect
that triggers vestibular symptoms, and this is not optional.

### 1.5 Smooth scroll — already done, do not redo

`app/globals.css` now sets `scroll-behavior: smooth` on `html:has([data-site-root])`
with `scroll-padding-top` for the sticky header, scoped so the admin app keeps
instant jumps, and gated on `prefers-reduced-motion`. Lenis-grade momentum
would need a JS runtime on customer sites; do not add one without an explicit
decision from the owner.

### 1.6 Importer

Where the work goes: `lib/import/designExtract.ts` (parses source CSS/HTML
today), `lib/import/sampleComputedStyles.ts` (the browser-side measurement
script), `lib/import/importActions.ts` (already greps for a Typekit id, so it
already reads the raw page). Note commit `57d1835ed`
*"feat(import): one measurement boundary for every import lane"* — a previous
pass built a single seam so a new measurement reaches all lanes at once. Add
there, not per-lane.

Extraction steps:

1. locate the animation source — inline `<script>` blocks, and `js/webflow.js`
   for `ixData`
2. **parse, never execute.** The IX2 payload is a JS object literal, not JSON
   (unquoted keys, `!0` for `true`, `0x…` numbers). Use a real parser
   (`acorn` → static object literal evaluation) or a strict tolerant reader.
   Do **not** `eval`, `new Function`, or run it in a `vm` — this is untrusted
   third-party code and running it is precisely what backlog 0939 is blocking
   for `verbatimClone`.
3. map the dialect onto `customMotion` (+ per-section `parallax`)
4. when a page's motion does not fit the model, fall back to the closest
   preset (`motion: "full"`) and **say so in the import report** rather than
   silently dropping it. There is already a refine panel that surfaces
   post-import notes; use it.

---

## Part 2 — the eight layout deviations left on the reference site

Measured 2026-08-02, ranked by how much they show. Full context in
`snabbsajt-site/README.md`.

1. **Navbar sits in the flow.** The source's floats over the hero (hero starts
   at y=0); ours is sticky and pushes the page down ~65px. Needs an opt-in
   "header overlays the first section" mode — a real design capability, not a
   one-off.
2. **Full-bleed image on mobile.** The source switches to square
   (`aspect-ratio: 1`) below 768px; we keep the photo's own aspect, so 250px
   against 375px. `customLayout.mediaBandMaxHeight` landed already — this needs
   a *responsive* band shape, not just a cap.
3. **`.02 process` is ~130px short** at 1440. Webflow's grid row-gap is larger
   than ours. Probably wants the measured grid gap carrying over.
4. **H3 24px vs 20px** on the small labels. The source has two small heading
   sizes (24 and 20); the theme has one `h3` role. Either a fourth heading role
   or accept.
5. **Hero headline colour** `#161616` vs `#112032` — the source sets a text
   colour on the hero section itself. Section-level colour override, or accept.
6. **Open Sans 300** is not in the curated Google list (400/600/700), so the
   hero sub-heading renders 400.
7. **Contact/pricing band heights** on mobile, +42/+93px — falls out of 3.
8. The typo "Cerifierad Coach enligt ICC" is verbatim from the source. Leave it.

---

## Constraints — read before writing code

- **The contract is generated.** After touching `convex/model/theme.ts`,
  `sections.ts`, `portable.ts` or `lib/sections/registry.ts`, run
  `bun scripts/export-site-kit-contract.ts --write`. `Sajtbuilder-SDK/` is a
  separate repo pinning the app contract by sha256 in
  `contract/app-source.json`; it is already behind on unrelated items. Do not
  regenerate the SDK's mirror as a side effect — its own test will fail.
- **Validate with the app, not the SDK.**
  `bun scripts/site-kit.ts validate <dir>` runs the same validators the import
  endpoint does. The SDK's shipped `dist` is older and will reject valid files.
- **Nothing works until deploy.** The deployed validator rejects unknown
  fields, so a bundle using a new field is refused outright by an older
  production. Say this in the changelog entry.
- **Shared checkout.** Other agents commit here concurrently. Stage by explicit
  path, never `git add .`. Do not reformat files you did not change. If a
  repo-wide typecheck shows errors in files you never touched, they are someone
  else's in-flight work — filter them out, don't fix them.
- **Never execute imported JavaScript.** See 1.6 step 2.

---

## Verification — the loop already exists, use it

A dev-only route renders a Site Kit package through the real renderer with no
database and no auth (commit `2977d56e1`):

```bash
cd ~/Programming/personal/LA_DESIGN/projekt/simple-site-builder
bunx next dev
open "http://localhost:3000/devpreview?bundle=/Users/ludvighedin/Programming/personal/clients/anna-hedin-samtalsterapeut/snabbsajt-site&still=1"
```

`?still=1` forces `motion: "none"` for layout screenshots. **Drop it to review
animation** — that is the whole point for this task.

Serve the source next to it (`python3 -m http.server 3112` in the client repo)
and diff them in Playwright at 1440 / 768 / 375. For layout, force-settle both
sides and compare band heights. For motion, capture a scroll at a fixed frame
cadence on both and compare frame-by-frame — a still screenshot cannot tell you
whether the animation matches.

Baseline to beat: **+1.2 % / +4.2 % / +8.7 %** whole-page height.

### Done means

- [ ] the fixture's load, scroll-reveal and parallax read as the same page in
      motion, verified from captured frames, not from reasoning about the CSS
- [ ] zero third-party JS added to a published customer site
- [ ] `prefers-reduced-motion` disables every added animation
- [ ] a theme with no `customMotion` renders byte-identically to today —
      assert it in a test
- [ ] the importer extracts both dialects from the fixture without executing
      any of it, and reports what it could not map
- [ ] whole-page height delta below +5 % at all three widths
- [ ] `bun scripts/site-kit.ts validate` clean; contract regenerated;
      typecheck clean; `components/site-sections`, `lib/sections`, `lib/site`,
      `lib/portability`, `lib/site-kit`, `convex/portability.test.ts` green
      (895 tests at the time of writing)
- [ ] a changelog entry under `changelog/entries/unreleased/`

## What already landed (do not redo)

Nine commits, 2026-08-02, all pushed to `main`:

`c719f5766` the site's own menu (`navLinks`/`navOrder`/`navLabel`) in the
portable format · `fd8695418` measured hero + media band heights
(`customLayout.heroMinVh` / `heroMaxHeight` / `mediaBandMaxHeight`) ·
`2c0c83ab4` `contact/links` variant · `15bb7f284` a quote with no rating shows
no stars · `2977d56e1` the `devpreview?bundle=` harness · `ebe0c51a5` measured
type as a `clamp()` ramp (`sizeMin` / `sizeFluid`) · `6fbb52ac2` header email
button + `brand-center` nav layout + nav width from `--site-w-default` ·
`20dce16be` pricing tier `description` + smooth in-page scrolling.

**Do not answer this brief by adding more one-off section variants.** Four were
added across these passes and they move the number a few percent each while
crowding the section picker. The remaining distance is motion and a handful of
measured design dimensions — build those.
