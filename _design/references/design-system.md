# maslowski.cloud design system, full reference

Exhaustive token set, CSS variables for both variants, and format mappings. The SKILL.md holds
the rules and the summary; this file holds the exact values and copy-ready snippets.

## CSS variables

### Light variant

```css
:root {
  --bg:          #FFFFFF;
  --ink:         #0F1417;
  --muted:       #5B6770;
  --faint:       #9AA6AD;
  --line:        #E9EEF0;
  --card:        #FFFFFF;
  --chrome:      #0B0D0E;   /* nav / footer dark blocks */
  --accent:      #0E9AA7;   /* teal: links, buttons, kickers */
  --accent-2:    #14B8C4;   /* hero keyword */
  --accent-soft: #CDEEEE;   /* chips, soft fills */
  --tint-teal:   #F0FBFB;
  --tint-violet: #F5F3FF;
  --tint-blue:   #EFF6FF;
  --callout:     #F2FBFB;
  --radius:      18px;
  --shadow:      0 10px 30px rgba(15,30,35,.06);
}
```

### Dark variant

```css
:root[data-theme="dark"] {
  --bg:          #0E1416;
  --surface:     #142021;
  --surface-2:   #0B1112;
  --line:        #243133;
  --ink:         #E9EEF0;
  --muted:       #9DB0B4;
  --faint:       #6F8488;
  --accent:      #2BB6C2;
  --accent-2:    #5FD6DF;
  --accent-soft: #16343A;
  --tint-teal:   #102A2C;
  --tint-violet: #1C1A2E;
  --tint-blue:   #14243A;
  --radius:      18px;
  --shadow:      0 14px 40px rgba(0,0,0,.45);
}
```

## Fonts

```
Headings: Poppins (600, 700, 800)  -> fallback "Segoe UI", Helvetica, Arial, sans-serif
Body:     Inter (400, 500, 600, 700) -> fallback "Segoe UI", Helvetica, Arial, sans-serif
Code:     Fira Code -> fallback ui-monospace, SFMono-Regular, Menlo, monospace
```

Google Fonts import:
`https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap`

## Type scale (web px and document pt)

| Role | px (web) | pt (docs/slides) | weight | notes |
|---|---|---|---|---|
| Display / hero | 60 | 40–44 | 800 | two-tone, keyword in accent |
| H1 page title | 40 | 26–28 | 700–800 | |
| H2 section | 28 | 20 | 800 | left, above content |
| H3 subhead | 20 | 15 | 700 | |
| Card / column title | 18 | 14 | 700 | reserve 2 lines if titles wrap, so body aligns |
| Lead | 21 | 13–14 | 400 | |
| Body | 17 | 11 | 400 | line-height 1.6 / 1.5 |
| Secondary | 15 | 10 | 400 | |
| Meta | 13 | 9 | 500 | |
| Eyebrow | 12 | 8.5 | 700 | UPPERCASE, +1.6px tracking, accent color |
| Code | 0.88em | 9.5 | 400 | |

## Component recipes

- **Rounded box:** `background: var(--card); border: 1px solid var(--line); border-radius: var(--radius); box-shadow: var(--shadow); padding: 20px 22px;`
- **Pill nav / button / chip:** `border-radius: 999px;`
- **Primary button:** `background: var(--accent); color: #fff; font-weight: 600; padding: 11px 22px; border-radius: 999px;`
- **Ghost button:** `background: transparent; color: var(--accent); border: 1px solid var(--line); border-radius: 999px;`
- **Tag chip:** `background: var(--accent-soft); color: var(--accent); border-radius: 999px; padding: 2px 11px; font-size: 12px;`
- **Eyebrow:** `text-transform: uppercase; letter-spacing: 1.6px; font-weight: 700; font-size: 12px; color: var(--accent);`
- **Two-tone heading:** wrap the keyword in a span set to `color: var(--accent)` (light) or `--accent-2` (dark).
- **Tinted role cards:** same box recipe, swap `background` for `--tint-teal`, `--tint-violet`, `--tint-blue`.

## PPTX mapping (pptxgenjs or python-pptx)

```
COLORS = {
  bg_light: "FFFFFF", ink: "0F1417", muted: "5B6770", line: "E9EEF0",
  accent: "0E9AA7", accent_bright: "14B8C4",
  bg_dark: "0E1416", surface_dark: "142021", text_dark: "E9EEF0", accent_dark: "2BB6C2",
}
FONTS = { head: "Poppins", body: "Inter", code: "Fira Code" }  # fall back to Segoe UI
```

- Cover / section divider: dark. `bg_dark` fill, teal eyebrow (8.5pt), title 40pt Poppins with the
  keyword in `accent_dark`, subtitle 14pt Inter in `text_dark`.
- Content: light. `bg_light`, eyebrow then 20pt Poppins H2, rounded-rectangle cards (corner radius
  ~0.12in), 1pt `line` border, body 11pt Inter.
- Tables: header fill `F4F7F8`, 1pt `line` grid, label cells in eyebrow style.
- Logos / marks: keep the teal accent; do not recolor.

## DOCX / PDF mapping

- Page: white, ~1in margins. Body Inter 11pt, line spacing 1.5.
- Heading 1: Poppins ~20pt, ink. Heading 2: Poppins ~15pt, ink. Precede sections with a teal
  uppercase eyebrow run (8.5pt).
- Hyperlink and emphasis color: `#0E9AA7`.
- Table style: 1px `#E9EEF0` borders, header row fill `#F4F7F8`.
- Callout / quote: light teal `#F2FBFB` shaded rounded box (or shaded paragraph if rounded corners
  are unavailable), consistent across the document.
- Code: Fira Code, `#F4F7F8` background.
- Absolutely no em dashes.

## Voice and copy patterns

- First person on personal materials. Direct, technical, specific.
- Eyebrow + heading + supporting line is the standard block opener.
- Calls to action can be warm: "Let's talk", "Work with me". Keep claims grounded
  ("a small number of engagements", "scoped to what I can do well").
- Punctuation instead of em dashes: comma for a light pause, colon to introduce a list or
  expansion, parentheses for an aside, a period to split a long thought.

## Provenance

Derived from the maslowski.cloud website (daisyUI-style rebuild): pill top nav, two-tone hero,
rounded article cards with category chips, single teal accent matching the brand color, Poppins
and Inter typography, and a consistent rounded-box, eyebrow-led layout system.
