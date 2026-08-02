# Motion values, measured from annahedin.com — ready to apply

The zip **cannot** carry these yet: `PortableSiteV1` rejects unknown fields, so
a package using `customMotion` is refused by the importer until the fields
exist. Everything below is already extracted from the source page, so once the
animation work in `ANIMATION-PARITY-PROMPT.md` lands this is a fill-in, not a
second investigation.

## Where the values come from

`../index.html` — inline `<script>` at the end of `<body>` (GSAP + ScrollTrigger)
and the head (Lenis); `../js/webflow.js` — the `ixData` object literal (IX2).

## Page-load reveal — `[animation-fade-blur]`

Every eyebrow, heading, paragraph, image and the navbar carries this attribute.

| | value |
|---|---|
| rise | `24px` |
| blur | `10px` |
| opacity | 0 → 1 (`autoAlpha`) |
| duration | `1000ms` |
| easing | `power2.out` = `cubic-bezier(0.215, 0.61, 0.355, 1)` |
| stagger | `200ms` between siblings |

`[animation-fade]` is the same without the rise or the blur.

## Scroll reveal — `[animation-scroll-blur]`

On the quote attribution only.

| | value |
|---|---|
| rise | `24px` |
| blur | `4px` |
| duration | `800ms` |
| delay | `150ms` |
| easing | `power2.out` |
| trigger | element top hits viewport bottom (`start: "top bottom"`) |
| repeat | re-runs each time it enters (`toggleActions: restart none none none`) |

## Parallax — IX2 action list `a-7`, "Parallax side-scroll-desktop"

Driven by `SCROLL_PROGRESS`, `mediaQueries: ["main","medium"]` (so **desktop and
tablet only**, off below 768px), `smoothing: 90`.

| target | scroll 0% | scroll 100% |
|---|---|---|
| `.parallax.line-1` (quote line 1) | `translateX(10%)` | `translateX(0)` |
| `.parallax.line-2` (quote line 2) | `translateX(-5%)` | `translateX(0)` |

Two lines of the pull-quote sliding toward each other as the band crosses the
viewport. Section 4 of `site.json` (`testimonials` / `single`).

## Smooth scroll — Lenis

`duration: 1.2`, `easing: t => Math.min(1, 1.001 - 2**(-10*t))`,
`smoothTouch: false`, gated on `matchMedia("(min-width: 768px)")`.

Already approximated by `scroll-behavior: smooth` on `html:has([data-site-root])`
(commit `20dce16be`). Matching Lenis momentum exactly would need a JS runtime on
customer sites — an owner decision, not a code gap.

## Draft block to paste into `site.json` once the fields exist

Field names follow the proposal in `ANIMATION-PARITY-PROMPT.md` §1.3. Adjust to
whatever the implementation actually names them.

```json
"customMotion": {
  "enterY": "24px",
  "enterBlur": "10px",
  "duration": 1000,
  "easing": "power2-out",
  "stagger": 200,
  "startAt": 0
}
```

and on the `testimonials` section's `layout`:

```json
"parallax": { "axis": "x", "from": "10%", "to": "0%", "minWidth": 768 }
```

(line-2's `-5%` needs either a second target or a per-child inversion — see
the brief.)

## Rebuild the zip

One command. Run it after the code lands and the block above is in `site.json`:

```bash
APP=~/Programming/personal/LA_DESIGN/projekt/simple-site-builder
CLIENT=~/Programming/personal/clients/anna-hedin-samtalsterapeut
cd $APP && bun scripts/site-kit.ts validate $CLIENT/snabbsajt-site \
  && rm -f $CLIENT/*.zip \
  && bun scripts/site-kit.ts pack $CLIENT/snabbsajt-site -o $CLIENT/annahedin-snabbsajt.zip
```

`validate` runs the same validators the import endpoint does — if it passes,
the import will accept the file. It fails loudly on a field production does not
know yet, which is the check that matters here.
