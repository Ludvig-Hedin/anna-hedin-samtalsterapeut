# Anna Hedin – SnabbSajt-paket

Importerbart SnabbSajt-paket byggt från den befintliga Webflow-sidan
(`../index.html`, = live annahedin.com) med
[Site Kit](https://snabbsajt.com/docs/en/developer/site-kit).

**En bundle:** `../annahedin-snabbsajt-2026-08-02.zip`. Alla tidigare zip-filer
är borttagna.

## Kort svar: nej, det blir inte 100 %

Layout, typografi, färg, bilder, meny och sektioner ligger mycket nära (se
tabellen). **Animationerna gör det inte.** Originalet kör Webflows IX2/GSAP:
fade + blur per element, ett parallax-citat som rör sig i annan takt än sidan,
och egna scroll-triggers. SnabbSajt har en CSS-baserad reveal per sektion
(`motion: "full"`) och numera mjuk ankarscroll. Det är likt i känsla, inte
identiskt – och parallaxen finns inte alls.

Det beror inte på lathet: importen ritar om innehållet med SnabbSajts egna
sektioner så att sajten går att **redigera**. Vill du ha pixel- och
animationsidentiskt finns bara en väg – `lib/import/verbatimClone.ts` i
produktrepot, som packar källans egen HTML/CSS/JS. Den är inte serverad ännu
(backlog 0939, blockerad av säkerhetsgranskning av tredjeparts-JS) och
resultatet går inte att redigera efteråt.

## Uppmätt resultat (2026-08-02)

Paketet renderas med SnabbSajts riktiga renderare och jämförs band för band mot
originalet i Chromium (Playwright, tre bredder, reveal avstängd på båda sidor).
Sidhöjd i px – original → import.

| Band | 1440 | 768 | 375 |
|---|---|---|---|
| hero | 704 → **704** (0) | 512 → **512** (0) | 450 → 405 (−45) |
| `.01 samtalsterapi` | 523 → 510 (−13) | 491 → 509 (+18) | 512 → 628 (+116) |
| helbredds-bild | 816 → 768 (−48) | 435 → 512 (+77) | 375 → 250 (−125) |
| `.02 process` | 1185 → 1056 (−129) | 1437 → 1297 (−140) | 2034 → 2106 (+72) |
| citat | 400 → **397** (−3) | 394 → 423 (+29) | 277 → 372 (+95) |
| `.03 Priser` | 544 → 522 (−22) | 529 → 544 (+15) | 636 → 729 (+93) |
| `.04 Om mig` + porträtt | 1734 → 1782 (+48) | 1702 → 1782 (+80) | 1588 → 1722 (+134) |
| `.05 kontakta mig` | 495 → 486 (−9) | 495 → 485 (−10) | 460 → 502 (+42) |
| **Hela sidan** | **6402 → 6482 (+1,2 %)** | **6068 → 6323 (+4,2 %)** | **6404 → 6964 (+8,7 %)** |

Typografin är **exakt** på alla tre bredder – storlek, vikt, familj och
versalisering mätt på renderad DOM:

| Roll | 1440 | 768 | 375 |
|---|---|---|---|
| H1 "Anna Hedin" | 80 → 80 | 60 → 60 | 40 → 40 |
| Sektionsrubrik H2 | 40 → 40 | 40 → 40 | 32 → 32 |
| Citat | 58 → 58 | 48 → 48 | 30 → 30 |
| Brödtext | 16 → 16 | 16 → 16 | 16 → 16 |
| Textbredd | 672 → 672 | 672 → 672 | 338 → 327 |

Navbaren har nu originalets form: länkar till vänster, **VÄLKOMMEN** i mitten,
en fylld **Kontakt**-knapp till höger.

## Tema – uppmätt på annahedin.com

| Roll | Värde | Källa på originalet |
|---|---|---|
| `display` (hero-rubrik) | Open Sans 700, 80/64 px, `-2.4px` | `h1.heading-style-h1` |
| `h1` / `h2` (sektionsrubriker) | din-condensed 300, 40/48 px, VERSALER | `h2.heading-style-h2` |
| `h3` | din-condensed 400, 24/31.2 px, VERSALER | `h3.heading-style-h4` |
| `lead` (hero-underrubrik) | Open Sans 300, 30/48 px | `p.hero-subheading` |
| `body` | calluna 400, 16/25.6 px, `#8c8c92` | `.paragraph-wrapper p` |
| `sm` (knappar) | din-condensed 300, 14/22.4 px | `a.button` |
| `eyebrow` (`.01`–`.05`) | calluna 400, 16/25.6 px, gemener | `.text-style-tagline` |
| `quote` (citatet) | Open Sans 600, 58/55.1 px, `-1.16px`, VERSALER | `h2.parallax-heading` |
| Sektionsluft | 112 px topp + botten | `.padding-section-large` |
| Container | 1200 px / 720 px (= 1152 / 672 innehåll) | `.container-large` / `-medium` |
| Hero-band | `45vh` … fotots proportion … `44rem` | `.hero-background-image-wrapper` |
| Bildband | fotots proportion, max `48rem` | `.section_image` |
| Bakgrund / text / brand / dämpad | `#fefefe` / `#161616` / `#112032` / `#eeeeee` | Webflow-primitives |
| Radie | `sharp` (0) | `--_ui-styles---radius--*` |

Tre typsnittsroller, precis som originalet:

| Roll | Familj | Källa |
|---|---|---|
| `display` | Open Sans | Google (kurerad) |
| `heading` | din-condensed | Adobe-kit `wyt4frb` |
| `body` | calluna | Adobe-kit `wyt4frb` |

## Två saker krävs innan det ser rätt ut

1. **SnabbSajt måste vara deployad** med app-ändringarna från 2026-08-02
   (menyn i paketformatet, hero-/bildband, `contact/links`). Den deployade
   validatorn avvisar okända fält, så en äldre produktion nekar importen rakt av.
2. **Adobe-kitet `wyt4frb` är domänlåst.** Lägg till både snabbsajt-subdomänen
   och ev. eget domännamn på <https://fonts.adobe.com/my_account/web_projects>,
   annars faller `din-condensed` och `calluna` tillbaka på SnabbSajts egna
   typsnitt och rubrikerna ser fel ut.

## Innehåll

- `site.json` – hela sajten som typade SnabbSajt-sektioner (`PortableSiteV1`)
- `assets/` – bilder, byte-identiska med `../images/`. `logo.svg` är
  originalets egen **VÄLKOMMEN**-ordbild (den tidigare filen var Relumes
  mall-logotyp – det var den du såg i navbaren).

## Importera

1. Logga in på snabbsajt.com.
2. **Settings → Backup & move → Import**.
3. Ladda upp `annahedin-snabbsajt-2026-08-02.zip`.
4. Importen skapar ett **opublicerat utkast** (publicerar aldrig automatiskt).
5. Granska på mobil/desktop, justera, publicera.

## Bygga om / förhandsgranska

```bash
APP=~/Programming/personal/LA_DESIGN/projekt/simple-site-builder
cd $APP && bun scripts/site-kit.ts validate <paket-mapp>
cd $APP && bun scripts/site-kit.ts pack <paket-mapp> -o <ut.zip>

# Rendera paketet med den riktiga renderaren, utan databas eller inloggning:
cd $APP && bunx next dev
open "http://localhost:3000/devpreview?bundle=<absolut-sökväg-till-paket-mapp>&still=1"
```

## Sidstruktur (samma ordning som originalet)

| Original | SnabbSajt-sektion | Eyebrow |
|---|---|---|
| header, H1 över helbildsfoto | `hero` / `overlay-light` | – |
| `.01 samtalsterapi` | `rich-text` / `narrow` | `.01` |
| helbredds-bild | `image` / `full` | – |
| `.02 process` (2-kolumnsrutnät) | `rich-text` / `columns` | `.02` |
| citat + "- Jon Kabat-Zinn" | `testimonials` / `single` (bred) | – |
| `.03 Priser` | `pricing` / `two-col` (`#pricing`) | `.03` |
| `.04 Om mig` | `rich-text` / `narrow` (`#about`) | `.04` |
| porträtt | `image` / `inset` (utan sektionsluft) | – |
| `.05 kontakta mig` | `contact` / `links` (`#kontakt`) | `.05` |

Menyn ligger i `site.navLinks` (Priser → `#pricing`, Om mig → `#about`) och
sidan står `showInNav: false`, precis som originalet: inget "Hem" i menyn.
Kontakt-knappen i headern kommer från `site.contact.email`.

## Kvarvarande avvikelser

1. **Animationerna.** Se det korta svaret överst. Ingen parallax, ingen
   per-element blur; SnabbSajt har en reveal per sektion.
2. **Navbaren ligger i flödet.** Originalets navbar svävar över hero-bilden på
   desktop (hero börjar på y=0); SnabbSajts är sticky och puttar ner sidan
   ~65 px.
3. **Helbredds-bilden på mobil.** Originalet byter till kvadrat (`aspect-ratio: 1`)
   under 768 px; vi kör fotots egen proportion, alltså lägre (250 mot 375 px).
4. **`.02 process` är ~130 px kortare** på desktop – Webflows radavstånd i
   rutnätet är större än vårt.
5. **H3 24 px i stället för 20 px** på "mötesrum" – originalet har två små
   rubrikstorlekar (24 och 20), temat har en.
6. **Hero-rubrikens färg** är `#161616` mot originalets `#112032`; originalet
   sätter en egen textfärg just på hero-sektionen.
7. **Open Sans 300 finns inte** i den kurerade Google-listan (400/600/700), så
   hero-underrubriken renderas som 400.
8. Stavfelet "Cerifierad Coach enligt ICC" är kvar ordagrant från originalet.

## Varför inte 100 %

SnabbSajts import gör sajten **redigerbar** genom att rita om innehållet med
SnabbSajts egna sektioner – den kopierar inte Webflows DOM. Punkterna ovan är
alla av den sorten: platser där källans design har en frihetsgrad som
SnabbSajts modell ännu inte har. Fyra sådana stängdes 2026-08-02 (menyn,
hero-bandets höjd, bildbandets höjd, en centrerad länklayout för kontakt); de
som står kvar är listade med föreslagen åtgärd.

Produktrepot har också ett "exact copy"-läge (`lib/import/verbatimClone.ts`)
som packar källans egen HTML/CSS. Det ger pixelidentiskt men serveras inte ännu
(backlog 0939, blockerat av säkerhetsgranskning) och resultatet går inte att
redigera.
