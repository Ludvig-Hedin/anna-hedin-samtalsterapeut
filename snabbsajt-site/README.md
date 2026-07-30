# Anna Hedin – SnabbSajt-paket

Importerbart SnabbSajt-paket byggt från den befintliga Webflow-sidan
(`../index.html`, = live annahedin.com) med
[Site Kit](https://snabbsajt.com/docs/en/developer/site-kit).

## Två bundles – välj efter om appen är deployad

| Fil | Kräver | Typsnitt | Ungefärlig träff |
|---|---|---|---|
| `../annahedin-snabbsajt-2026-07-30-compatible.zip` | Inget – funkar mot produktionen som den står nu | Oswald + Source Serif 4 (Google) | ~90 % |
| `../annahedin-snabbsajt-2026-07-30-full.zip` | En deploy av SnabbSajt (se nedan) **och** att Adobe-kitet släpper in domänen | `din-condensed` + `calluna` (Adobe `wyt4frb`) | ~97 % |

`full` använder fyra saker som finns i appens kod men **inte i den deployade
validatorn** – importen avvisas tills SnabbSajt är deployad:

- `theme.headingCase: "uppercase"`
- `hero` / `overlay-light`
- `rich-text` / `columns`
- `eyebrow` på `rich-text`, `pricing` och `contact`

Testa själv vilken som går igenom idag:

```bash
SDK=~/Programming/personal/LA_DESIGN/projekt/simple-site-builder/Sajtbuilder-SDK
node $SDK/dist/cli.js validate ./snabbsajt-site   # = den deployade validatorn
```

## Adobe-kitet

Kit `wyt4frb` är låst till `annahedin.com`. Lägg till snabbsajt-domänen på
fonts.adobe.com, annars faller `din-condensed` och `calluna` tillbaka på
SnabbSajts egna typsnitt. `compatible`-bundlen använder Google-motsvarigheter
just för att slippa det beroendet.

## Innehåll

- `site.json` – hela sajten som typade SnabbSajt-sektioner (`PortableSiteV1`).
  Detta är `full`-varianten.
- `assets/` – bilder, byte-identiska med `../images/`

## Importera

1. Logga in på snabbsajt.com.
2. **Settings → Backup & move → Import**.
3. Ladda upp vald zip.
4. Importen skapar ett **opublicerat utkast** (publicerar aldrig automatiskt).
5. Granska på mobil/desktop, justera, publicera.

## Bygga om

Validera och packa med appens egen CLI – den kör exakt de validatorer servern kör:

```bash
APP=~/Programming/personal/LA_DESIGN/projekt/simple-site-builder
cd $APP && bun scripts/site-kit.ts validate <paket-mapp>
cd $APP && bun scripts/site-kit.ts pack <paket-mapp> -o <ut.zip>
```

`compatible`-varianten byggs från samma mapp med dessa ändringar:

- `theme.headingCase` bort, rubriktexterna versalskrivna i innehållet i stället
- `eyebrow` bort på alla sektioner
- `hero` tillbaka till `overlay` med `tone: "dark"`
- `rich-text` / `columns` tillbaka till `prose`
- `customFonts` + `fonts[]` till Oswald / Source Serif 4:

```json
"customFonts": { "heading": "Oswald", "body": "Source Serif 4" },
"fonts": [
  { "tmpId": "heading", "source": "google", "family": "Oswald",
    "googleUrl": "https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600&display=swap" },
  { "tmpId": "body", "source": "google", "family": "Source Serif 4",
    "googleUrl": "https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300..700;1,8..60,300..700&display=swap" }
]
```

## Sidstruktur (samma ordning som originalet)

| Original | SnabbSajt-sektion | Eyebrow |
|---|---|---|
| header, H1 över helbildsfoto | `hero` / `overlay-light` | – |
| `.01 samtalsterapi` | `rich-text` / `prose` | `.01` |
| helbredds-bild | `image` / `full` | – |
| `.02 process` (2-kolumnsrutnät) | `rich-text` / `columns` | `.02` |
| citat | `statement` / `centered` | – |
| `.03 Priser` | `pricing` / `two-col` (`#pricing`) | `.03` |
| `.04 Om mig` | `rich-text` / `narrow` (`#about`) | `.04` |
| porträtt | `image` / `inset` | – |
| `.05 kontakta mig` | `contact` / `info-cards` (`#kontakt`) | `.05` |
| (finns inte i originalet) | `footer` / `contact` | – |

## Tema – uppmätt på live-sajten

| Token | Värde | Källa |
|---|---|---|
| Sidbakgrund | `#fefefe` | `--_primitives---colors--white` |
| Text | `#161616` | `--_primitives---colors--neutral-darkest` |
| Dämpad text | `#8c8c92` | uppmätt `color` på `.paragraph-wrapper p` |
| Brand / knappar | `#112032` | `--_primitives---colors--blue` |
| Tonad yta | `#eeeeee` | `--_primitives---colors--neutral-lightest` |
| Linjer | `#161616` | `.divider` |
| Radie | `sharp` (0) | `--_ui-styles---radius--*: 0px` |
| Rubriker | `din-condensed`, VERSALER | `--_typography---font-styles--heading` + `text-transform` |
| Brödtext | `calluna` | `--_typography---font-styles--body` |
| Sektionsluft | 112 px | `.padding-section-large` → `density: spacious` |

## Ändringar i SnabbSajt-appen för det här

Alla fyra är generella produktförbättringar, inte hack för den här sajten:

| Ändring | Varför |
|---|---|
| `image`-sektionen följer bildens egna proportioner | Tvingade 16:9 och beskar porträttet (3:4) till en remsa |
| `theme.headingCase` | Originalets rubriker är versala via CSS. Utan token måste versalerna bakas in i texten, och då måste Anna skriva versalt för alltid |
| `hero` / `overlay-light` | `overlay` lägger vit text på en mörk toning. Originalet har mörkblå text direkt på ett ljust foto |
| `rich-text` / `columns` | `.02 process` är ett 2-kolumnsrutnät. `services`/`highlights` ger två spalter men klipper texten (`line-clamp-4`) respektive tappar styckeindelningen |
| `eyebrow` på `rich-text`/`pricing`/`contact` | Originalets `.01`–`.05` ovanför varje rubrik |

Hero-rubriken är undantagen från `headingCase`: `Anna Hedin` är inte versalt i
originalet heller.

## Kvarvarande avvikelser

- **Originalet har två rubrikfonter.** H1 i hero och citatet är Open Sans,
  allt annat `din-condensed`. SnabbSajt har ett rubrikfont; paketet väljer
  `din-condensed` (alla sektionsrubriker, knappar och priser).
- **Länkarna i `process` är inte klickbara** (seforeningen.se,
  somaticexperiencing.com, hellinger.com). Adressen står som text. Rich
  text-länkar finns i appen sedan 2026-07-29 men paketet håller sig till den
  äldre blockvokabulären; lägg till länkarna i editorn efter importen.
- Webflow-animationer (GSAP/ScrollTrigger, parallax på citatet) ingår inte.
- Stavfelet "Cerifierad Coach enligt ICC" är kvar ordagrant från originalet.

## Varför inte 100 %

SnabbSajts import gör sajten **redigerbar** genom att rita om innehållet med
SnabbSajts egna sektioner – den kopierar inte Webflows DOM. Pixelidentiskt är
per design omöjligt den vägen. Produktrepot har ett "exact copy"-läge
(`lib/import/verbatimClone.ts`) som packar källans egen HTML/CSS, men det
serveras inte ännu (backlog 0939, blockerat av säkerhetsgranskning) och
resultatet är inte redigerbart.
