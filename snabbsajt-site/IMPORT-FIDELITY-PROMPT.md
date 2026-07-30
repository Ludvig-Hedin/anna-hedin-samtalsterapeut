# Prompt: make SnabbSajt's editable import reproduce a source site's design

Paste everything below into a new agent session in
`~/Programming/personal/LA_DESIGN/projekt/simple-site-builder`.

---

## The job

SnabbSajt's editable import (`Settings → Backup & move → Import`, and the
URL/HTML importer behind it) currently produces a site that reads as "SnabbSajt
wearing the source's content". We need it to reproduce the source's *design* —
target 99% visual match against the original, not a family resemblance.

This is a product-architecture change, not a bug fix. Read the whole brief
before writing code.

## Reference case

`~/Programming/personal/clients/anna-hedin-samtalsterapeut` holds a live
Webflow site (`index.html` + `css/annahedin.webflow.css` = annahedin.com) and a
hand-built import package for it (`snabbsajt-site/`, plus two packed bundles).
`snabbsajt-site/README.md` lists what already matches and what does not. Use it
as the acceptance test: import the package, screenshot the result against
annahedin.com, and iterate until the deltas are gone.

Measured values from the live page, for checking your work:

| | Original |
|---|---|
| h1 (hero) | Open Sans 700, 80px, tracking -2.4px, mixed case |
| hero subhead | Open Sans 300, 30px |
| h2 (sections) | din-condensed 300, 40px, **uppercase** |
| h4 / h6 | din-condensed 400, 24px / 20px, uppercase |
| pull-quote | Open Sans 600, 58px, tracking -1.16px, uppercase |
| body | calluna 400, 16px, `#8c8c92` |
| fg / bg / brand / muted | `#161616` / `#fefefe` / `#112032` / `#eeeeee` |
| section padding | 112px top and bottom |
| containers | 1152px wide / 672px narrow |
| radius | 0 |
| fonts | Adobe kit `wyt4frb` — `din-condensed` + `calluna` |

## What the ceiling actually is

The theme is **preset-only by design**. `convex/model/theme.ts` says so in its
header: users pick from enumerated options "so an off-palette or low-contrast
result is unreachable by construction". Three import-only escape hatches already
exist and break that rule deliberately — `customPalette`, `customFonts`,
`customBrandHex`. Colour is therefore already solved. Everything else is not:

1. **Type sizes are hardcoded.** `typeScaleVars()` in `lib/sections/theme.ts`
   emits fixed `clamp()` values for `--site-text-display/h1/h2/h3/lead/body/...`.
   The only lever is `typeScale`, a single global multiplier
   (`TYPE_SCALE_VALUE` = `{normal: 1, large: 1.125}`). A source site's actual
   px sizes, weights and tracking per heading level are unreachable.

2. **Section padding is three discrete values.** `Section.tsx` sets
   `--site-section-py: calc(4.5rem * var(--site-density) * var(--section-py-mult,1))`
   and `DENSITY_SCALE` is `{compact: 0.85, comfortable: 1, spacious: 1.18}`.
   The best available is 85px against the original's 112px.

3. **Container widths are three Tailwind classes.** `Section.tsx` picks between
   `max-w-3xl` / `max-w-5xl` / `max-w-6xl`. 1152px and 672px are unreachable.

4. **Only two fonts exist.** `customFonts` is `{heading, body}`. The reference
   site uses *three* roles: a display sans for the H1 and the pull-quote, a
   condensed sans for section headings, a serif for body. Very common on real
   sites.

5. **The importer never measures any of this.** `lib/import/sampleComputedStyles.ts`
   captures only `brandColor`, `headingFont`, `bodyFont` and a
   `heroBackgroundImage` boolean — because the theme has nowhere to put more.
   `lib/import/designExtract.ts` infers density and radius by *guessing from
   CSS text*, not by measuring the rendered page.

**Do not respond to this by adding more one-off section variants.** Four were
added on 2026-07-29/30 (commits `0de75af3`, `f2a7c4ee`: natural image aspect
ratio, `theme.headingCase`, `hero/overlay-light`, `rich-text/columns`, section
eyebrows) and the match still lands somewhere around 80%. The remaining gap is
structural, and every extra variant makes the section picker worse for the
owners who are not importing anything.

## The shape of the fix

Extend the import-only override layer from colour+fonts to the full measured
design, then teach the importer to measure it. Roughly:

- **`theme.customType`** — per-role type: size, weight, line-height, tracking,
  transform for display/h1/h2/h3/lead/body/eyebrow. Consumed in `typeScaleVars()`,
  overriding the built-in clamps when present.
- **`theme.customLayout`** — section padding and container widths as raw
  lengths, consumed in `Section.tsx` / `spacingVars()`.
- **A third font role** — `customFonts.display` (or a role map), wired through
  `rootChromeVars()`, `convex/model/fonts.ts` and `SiteFonts.tsx`. Note
  `safeFamily()` in `lib/sections/theme.ts` and `safeFontFamily()` in
  `SiteFonts.tsx` both allow only `[A-Za-z0-9 -]` — keep that.
- **Measure, don't infer** — extend `RawComputedSample` /
  `readComputedDesignInPage()` in `lib/import/sampleComputedStyles.ts` to read
  the computed values above off the rendered page, and thread them through
  `normalizeComputedSample()` → `applyComputedSample()` → `htmlToPortableSite()`.
  `lib/import/layoutObserve.ts` (`splitBlocks`/`observeBlock`) already exists for
  structure and is the right place for column counts.

Decide explicitly, and say which way you went and why:

- Do these overrides show up in the editor, or stay developer/import-only like
  `customPalette` does today? An owner who edits an imported site must not be
  able to make it unreadable, and must not be stuck with values they cannot
  reset. There is precedent both ways.
- What happens to the contrast/readability guarantees the preset system exists
  to provide? `customPalette` already "skips the authored-contrast gate".
  Measured type can produce 11px body text. Decide the floor.

**Every new field must be optional, and absent must mean exactly today's
behaviour.** Every published snapshot predates them. This is the rule the
existing `motion`, `typeScale`, `navLayout` and `headingCase` tokens all follow —
match it.

## Hard constraints, learned the hard way

- **The contract is generated, and the SDK pins it.** After changing
  `lib/sections/registry.ts`, `convex/model/sections.ts` or
  `convex/model/theme.ts`, run
  `bun scripts/export-site-kit-contract.ts --write`.
  `Sajtbuilder-SDK/` is a *separate git repo* whose
  `contract/app-source.json` pins the app's contract by commit + sha256, and
  `scripts/sync-contract.ts --sync-from-app <appRoot>` refuses unless the SDK's
  own `src/` mirrors regenerate the app contract byte-for-byte. Those mirrors are
  already behind on unrelated things (`external-product-grid`, and the
  `maxBundleEntries` / `maxTotalAssetBytes` caps), so a full sync means closing
  that drift first. Budget for it or leave the SDK alone — do not half-update it.
- **Validate packages with the app's own CLI**, not the SDK's:
  `bun scripts/site-kit.ts validate <dir>` / `pack <dir> -o out.zip`. It runs the
  same validators the import endpoint does. The SDK's `dist/` is built from older
  source and is useful only as a proxy for "what production accepts today".
- **Nothing you add works until SnabbSajt is deployed.** The deployed validator
  rejects unknown fields outright. Any package using a new token fails to import
  until then. Keep a fallback package that today's production accepts, and say
  clearly which is which.
- **The checkout is shared with other agents.** Stage by explicit path, never
  `git add .`; do not reformat files you did not change; stop and report if
  pending changes conflict. Commits have appeared in this tree mid-session.
- **Gates.** `bun run typecheck` is queued behind a per-checkout lock — if it
  says another typecheck holds it, use a scoped `tsconfig` over your own files
  instead of forcing it. `git push` runs `verify:deploy` (convex codegen + lint
  + typecheck); tests and `next build` run in CI, not locally. `convex/leadNotify.test.ts`
  and `convex/netFetch.transport.test.ts` were already failing on 2026-07-30 —
  not yours.

## Verification — this is the part that matters

Do not ship on "it validates". Validation means the server accepts the bundle,
not that the page looks right. Build a real comparison:

1. Run the app locally, import the reference package, publish the draft.
2. Screenshot both the imported site and annahedin.com at 375 / 768 / 1440px.
   The live site's GSAP entrance animations leave elements at `opacity: 0` until
   they fire — clear the inline styles on `[animation-fade-blur]`,
   `[animation-scroll-blur]` and `[animation-fade]` before capturing.
3. Report a per-section delta list with numbers (font, size, weight, colour,
   padding, width), not an overall impression.
4. Get that list to empty, or explain each survivor.

## Known survivors that this work will not fix

- Webflow's GSAP entrance animations and the parallax pull-quote.
- The original has no footer; SnabbSajt renders one.
- The original's sticky Webflow navbar vs SnabbSajt's own `SiteNav`.

If the requirement is truly pixel-identical rather than 99%, the editable
importer is the wrong mechanism and you should instead finish
`lib/import/verbatimClone.ts` + `lib/import/cloneServing.ts`, which serve the
source's own HTML and CSS. That is blocked on backlog task 0939 (security review
of serving third-party JS) and the result is not editable — a different product,
not a better import.
