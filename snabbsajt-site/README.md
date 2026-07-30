# Anna Hedin – SnabbSajt-paket

Importerbart SnabbSajt-paket byggt från den befintliga Webflow-sidan
(`../index.html`, = live annahedin.com) med
[Site Kit](https://snabbsajt.com/docs/en/developer/site-kit).

Byggt om 2026-07-29 efter att den första importen bara låg på ~50 % likhet.
Orsakerna och vad som ändrades står under "Vad som var fel" nedan.

## Innehåll

- `site.json` – hela sajten som typade SnabbSajt-sektioner (`PortableSiteV1`)
- `assets/` – bilder, byte-identiska med `../images/`
- Färdig bundle: `../annahedin-snabbsajt.zip`

## Importera till SnabbSajt

1. Logga in på snabbsajt.com.
2. **Settings → Backup & move → Import**.
3. Ladda upp `annahedin-snabbsajt.zip`.
4. Importen skapar ett **opublicerat utkast** (publicerar aldrig automatiskt).
5. Granska på mobil/desktop, justera vid behov, publicera.

## Bygga om paketet

```bash
SDK=~/Programming/personal/LA_DESIGN/projekt/simple-site-builder/Sajtbuilder-SDK
node $SDK/dist/cli.js validate ./snabbsajt-site
node $SDK/dist/cli.js pack ./snabbsajt-site -o annahedin-snabbsajt.zip
```

`dist/` i SDK:n är byggd från äldre källkod än sitt eget kontrakt. Det används
avsiktligt som lägstanivå här: paketet håller sig till den *äldre* vokabulären
(block bara `h`/`p`/`ul` med rena strängar, inga heading-nivåer, inga
inline-länkar), så det importeras oavsett vilken validator som ligger ute i
produktion.

## Vad som var fel i den första versionen

| Problem | Nu |
|---|---|
| **Rubrikfontet var Open Sans.** Originalets rubriker är `din-condensed` (versal, smal). Open Sans är bred humanist – helt annat intryck. | `customFonts.heading = "din-condensed"`, deklarerad som Adobe-font från kit `wyt4frb` |
| Brödtexten `calluna` deklarerad men rubrikfontet saknade kit → bara halva typografin laddade | Båda fonterna hämtas från samma kit `wyt4frb` |
| **All text var omskriven/förkortad**, inte kopierad | Varje stycke är nu ordagrant från `../index.html` |
| **Påhittad sektion** "Så går det till" (3 steg) som inte finns i originalet | Borttagen |
| Originalets `.02 process` (4 block: Vi möts / SE / Samtalsterapi / Familjekonstellationer) hade kortats ned till 3 `services`-kort | Ett `rich-text`-avsnitt med rubriken `process` och alla fyra block i sin helhet |
| **Påhittad hero-eyebrow + två CTA-knappar** | Borttagna. Originalet har bara H1 + underrubrik |
| **Citatet saknade upphovsperson** | `attribution: "- Jon Kabat-Zinn"` |
| **Påhittat kontaktformulär.** Originalet har inget formulär, bara länkar | `contact` / `info-cards` med e-post, telefon, Facebook och MötesRum-adressen |
| Priserna hade fått påhittade punktlistor | Originalets två prosabeskrivningar, 575 kr och 1150 kr/tim |
| "Utbildning & erfarenhet" var en påhittad egen rubrik | Ligger under `Om mig`, som i originalet |
| Porträttet låg i `about` / `text-image` → beskuret 4:3 vid sidan av texten | Text först, bild under (`image` / `inset`), som originalet stackar dem |
| `mutedFg` satt till `#666666` | Uppmätt på live-sajten: `#8c8c92` |
| Kortkanter syntes runt prisblocken | `cardBorder` = `#fefefe`, dvs osynlig – originalet har inga kort |

## Sidstruktur (samma ordning som originalet)

| # | Original | SnabbSajt-sektion |
|---|---|---|
| 1 | header, H1 över helbildsfoto | `hero` / `overlay` |
| 2 | `.01 samtalsterapi` | `rich-text` / `prose` |
| 3 | helbredds-bild | `image` / `full` |
| 4 | `.02 process` | `rich-text` / `prose` |
| 5 | citat | `statement` / `centered` |
| 6 | `.03 Priser` | `pricing` / `two-col` (`#pricing`) |
| 7 | `.04 Om mig` | `rich-text` / `narrow` (`#about`) |
| 8 | porträtt | `image` / `inset` |
| 9 | `.05 kontakta mig` | `contact` / `info-cards` (`#kontakt`) |
| – | (finns inte i originalet) | `footer` / `contact` |

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
| Rubriker | `din-condensed` (Adobe `wyt4frb`) | `--_typography---font-styles--heading` |
| Brödtext | `calluna` (Adobe `wyt4frb`) | `--_typography---font-styles--body` |
| Sektionsluft | 112 px | `.padding-section-large` → `density: spacious` |

## Kända avvikelser

- **Adobe-kitet måste släppa in snabbsajt-domänen.** Kit `wyt4frb` är låst till
  `annahedin.com`. Tills domänen läggs till på fonts.adobe.com faller både
  `din-condensed` och `calluna` tillbaka på SnabbSajts egna typsnitt. Detta är
  det enskilt största kvarvarande gapet mot originalet. Alternativ utan Adobe:
  byt till Google-motsvarigheter i editorn (t.ex. Oswald för rubrik,
  Source Serif 4 för brödtext).
- **Originalet har två rubrikfonter**, SnabbSajt har ett. H1 i hero och citatet
  är Open Sans på originalet, allt annat `din-condensed`. Paketet väljer
  `din-condensed` eftersom det används av alla sektionsrubriker, knappar och
  priser.
- **Versalerna följer inte med.** Originalets `h2`–`h6` har
  `text-transform: uppercase` via CSS. SnabbSajt har ingen sådan tema-token, så
  rubrikerna renderas med källans skiftläge.
- **Hero får en mörk toning.** SnabbSajts `overlay`-hero lägger vit text på en
  scrim; originalet har mörkblå text direkt på det ljusa fotot.
- **`.02 process` blir en spalt, inte två.** Originalet är ett 2-kolumnsrutnät.
  `services`/`highlights` skulle ge två spalter men klipper beskrivningen
  (`line-clamp-4`) respektive tappar styckeindelningen – texten väger tyngre.
- **Länkarna i `.02` är inte klickbara** (seforeningen.se,
  somaticexperiencing.com, hellinger.com). Adressen står som text. Rich
  text-länkar landade i appen 2026-07-29 men är inte garanterat utrullade –
  lägg till länkarna i editorn när de är det.
- **Sektionsnumreringen (`.01`–`.05`) följer inte med.** SnabbSajt har ingen
  eyebrow på textsektioner.
- Webflow-animationer (GSAP/ScrollTrigger, parallax på citatet) ingår inte.
- Stavfelet "Cerifierad Coach enligt ICC" är kvar ordagrant från originalet.
  Rätta i editorn om Anna vill.

## Varför inte 100 %

SnabbSajts import gör sajten **redigerbar** genom att rita om innehållet med
SnabbSajts egna sektioner – den kopierar inte Webflows DOM. Pixelidentiskt är
per design omöjligt den vägen. Produktrepot har ett "exact copy"-läge
(`lib/import/verbatimClone.ts`) som packar källans egen HTML/CSS, men det
serveras inte ännu (backlog 0939, blockerat av säkerhetsgranskning) och
resultatet är inte redigerbart.
