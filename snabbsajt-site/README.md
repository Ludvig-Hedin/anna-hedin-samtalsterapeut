# Anna Hedin – SnabbSajt-paket

Importerbart SnabbSajt-paket byggt från den befintliga Webflow-sidan
(`../index.html`, = live annahedin.com) med
[Site Kit](https://snabbsajt.com/docs/en/developer/site-kit).

**En bundle:** `../annahedin-snabbsajt-2026-08-02.zip`. Alla tidigare zip-filer
är borttagna.

## Uppmätt resultat (2026-08-02)

Paketet är renderat med SnabbSajts riktiga renderare och jämfört band för band
mot originalet i Chromium (Playwright, tre bredder, animationer avstängda på
båda sidor). Siffrorna är sidhöjd i px – original → import.

| Band | 1440 | 768 | 375 |
|---|---|---|---|
| hero | 704 → 704 (0) | 512 → 512 (0) | 450 → 420 (−30) |
| `.01 samtalsterapi` | 523 → 510 (−13) | 491 → 510 (+19) | 512 → 638 (+126) |
| helbredds-bild | 816 → 768 (−48) | 435 → 512 (+77) | 375 → 250 (−125) |
| `.02 process` | 1185 → 1056 (−129) | 1437 → 1312 (−125) | 2034 → 2180 (+146) |
| citat | 400 → 397 (−3) | 394 → 452 (+58) | 277 → 672 (**+395**) |
| `.03 Priser` | 544 → 535 (−9) | 529 → 535 (+6) | 636 → 741 (+105) |
| `.04 Om mig` + porträtt | 1734 → 1872 (+138) | 1702 → 1872 (+170) | 1588 → 1821 (+233) |
| `.05 kontakta mig` | 495 → 486 (−9) | 495 → 486 (−9) | 460 → 511 (+51) |
| **Hela sidan** | **6402 → 6584 (+2,8 %)** | **6068 → 6447 (+6,2 %)** | **6404 → 7484 (+16,9 %)** |

Typografin matchar exakt på desktop – varje rubrik verifierad på storlek,
vikt, familj och versalisering:

| Element | Original | Import |
|---|---|---|
| H1 "Anna Hedin" | Open Sans 700, 80 px | ✅ identisk |
| H2 sektionsrubriker | din-condensed 300, 40 px, VERSALER | ✅ identisk |
| H3 i `.02` | din-condensed 400, 24 px, VERSALER | ✅ identisk |
| Citatet | Open Sans 600, 58 px, VERSALER | ✅ identisk |
| Brödtext | calluna 400, 16/26 px, `#8c8c92` | ✅ identisk |
| Textbredd | 672 px (`container-medium`) | ✅ identisk |

**Det är inte 100 %.** Kvarvarande avvikelser står längst ned, med orsak.

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

Menyn ligger i `site.navLinks` (Priser → `#pricing`, Om mig → `#about`,
Kontakt → mailto) och sidan står `showInNav: false`, precis som originalet:
inget "Hem" i menyn.

## Kvarvarande avvikelser

Rangordnade efter hur mycket de syns.

1. **Citatet på mobil (+395 px).** Originalet skalar ner `.parallax-heading`
   vid brytpunkter; SnabbSajts uppmätta typografi lagrar **en** storlek per
   roll, så 58 px gäller även på en telefon. Detta är hela mobilavvikelsen
   (+16,9 %) nästan på egen hand. Åtgärd: `customType.<roll>.sizeMin` så en
   mätning kan bära ett spann i stället för ett tal.
2. **Navbaren.** Originalet har länkar till vänster, ordbilden centrerad och en
   fylld **Kontakt**-knapp till höger. `SiteNav` kan bara logotyp / länkar /
   telefonknapp; ingen `navLayout` ger den formen, och det finns ingen
   mailto-knapp i headern. Paketet använder `navLayout: "right"`.
3. **Priskorten.** Originalet skriver namn → beskrivning → pris. SnabbSajt
   skriver namn → pris → punktlista med bockar. Priserna står nu rätt
   (`575:-`, `1150:- /tim`), men ordningen och bockarna skiljer.
4. **`.04 Om mig` + porträtt (+138 px).** Originalet har text och bild i
   *samma* sektion; här är de två sektioner. Porträttets sektionsluft är
   nollställd, men fogen är kvar.
5. **H3 24 px i stället för 20 px** på prisrubriker och "mötesrum" – originalet
   har två små rubrikstorlekar (24 och 20), temat har en.
6. **Open Sans 300 finns inte** i den kurerade Google-listan (400/600/700).
   Hero-underrubriken begär vikt 300 och renderas som 400.
7. **Webflow-animationerna** (GSAP/ScrollTrigger, parallax på citatet) ingår
   inte; `motion: "subtle"` är närmaste motsvarighet.
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
