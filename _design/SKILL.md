---
name: maslowski-cloud-design
description: >
  maslowski.cloud personal brand design system for Greg Maslowski (CTO, software architect,
  EV enthusiast). Use whenever creating or styling a deliverable that should carry the
  maslowski.cloud look: Word documents (.docx), PDFs, slide decks (.pptx), reports, one-pagers,
  briefs, cover pages, or HTML. Provides brand colors (light and dark variants), typography,
  components, spacing, and writing rules derived from the maslowski.cloud website. Triggers
  include "maslowski.cloud doc / deck / pdf / one-pager", "my personal brand", "style this in my
  brand", or any personal (non-Tenix) material. Pair with the docx / pdf / pptx skills, which
  handle file mechanics; this skill provides the visual identity and voice. Do NOT use for Tenix
  or Saga Tenix company materials (use tenix-presentation for those) unless explicitly asked to
  blend the two.
---

# maslowski.cloud design system

This skill styles deliverables in Greg Maslowski's personal brand, the same identity used on the
maslowski.cloud website. It is a brand guide plus an asset spec. Use it together with the format
skill that builds the file (docx, pdf, pptx). This skill decides how it looks and reads; the
format skill decides how it is assembled.

Full token reference and per-format mapping: see `references/design-system.md`.

## Brand in one line

Clean, modern, light, rounded, and calm, built on a single teal accent. Confident but not loud.
Technical and specific, never buzzwordy. The person behind it is a CTO, a software architect, and
a genuine EV enthusiast.

## Non-negotiable rules

1. **No em dashes.** Never use the long dash (the em dash) in any copy. Rephrase with commas, colons,
   periods, or parentheses. Do not substitute an en dash either; restructure the sentence.
2. **Teal is the only accent.** Use the brand teal for emphasis, links, buttons, kickers, and
   highlights. Do not introduce lime, orange, purple, or red as accents. Card backgrounds may use
   very faint tints (see palette), but text accents stay teal. (Data charts: lead with teal, then
   neutral grays.)
3. **One container shape.** Everything grouped sits in a rounded box (consistent corner radius,
   1px hairline border, soft shadow). Do not mix rounded cards with flat left-border strips on the
   same surface. Differentiate blocks with subtle background tint, never with a different shape.
4. **Eyebrow labels are uppercase teal.** Small section/group labels are uppercase, letter-spaced,
   bold, in teal. One eyebrow style everywhere.
5. **Section pattern: heading above content.** A left-aligned section heading sits above its
   content. Containers hold content only, never the section heading. Keep one consistent gap
   between sections.
6. **Fonts are fixed.** Poppins for headings, Inter for body, Fira Code for code. Use the
   fallbacks below if those faces are unavailable; never mix in a third display face.
7. **One type scale.** Same role, same size. Do not invent in-between sizes.

## Voice

Direct, technical, specific. Show expertise through concrete detail (OCPP, depots, backpressure,
idempotency), not adjectives. Short sentences. First person for personal materials. It is fine to
be warm and a little playful in calls to action, but keep claims grounded and never overstated.

## Light or dark: when to use which

- **Light (default).** Documents, reports, PDFs, one-pagers, and most slides. Anything text-heavy
  or meant to be read or printed is always light. Light is the primary brand surface.
- **Dark.** Reserve for impact moments: deck cover and section-divider slides, a hero banner, a
  social card. Switch back to light for body-heavy content. Never set long-form reading copy on a
  dark background.

Both variants use the same teal accent, the same fonts, the same rounded-box language, and the
same type scale. Only the surface and text colors invert.

## Colors

### Light variant (default)

| Role | Hex |
|---|---|
| Page background | `#FFFFFF` (optional soft radial tints `#DEF6F6`, `#EEF7FF` near the top) |
| Primary text (ink) | `#0F1417` |
| Secondary text | `#5B6770` |
| Faint / meta | `#9AA6AD` |
| Hairline / border | `#E9EEF0` |
| Card surface | `#FFFFFF` |
| Dark chrome (nav/footer blocks) | `#0B0D0E` |
| Accent (teal) | `#0E9AA7` |
| Accent bright (hero keyword) | `#14B8C4` |
| Accent soft (chips, tints) | `#CDEEEE` |
| Card tint, teal | `#F0FBFB` |
| Card tint, violet | `#F5F3FF` |
| Card tint, blue | `#EFF6FF` |
| Callout / CTA tint | `#F2FBFB` to `#EEF7FF` gradient |

### Dark variant

| Role | Hex |
|---|---|
| Page background | `#0E1416` |
| Elevated surface / card | `#142021` |
| Recessed surface | `#0B1112` |
| Hairline / border | `#243133` |
| Primary text | `#E9EEF0` |
| Secondary text | `#9DB0B4` |
| Faint / meta | `#6F8488` |
| Accent (teal) | `#2BB6C2` (brightened for contrast on dark) |
| Accent bright (keyword) | `#5FD6DF` |
| Accent soft fill | `#16343A` |
| Card tint, teal | `#102A2C` |
| Card tint, violet | `#1C1A2E` |
| Card tint, blue | `#14243A` |

Contrast: on light, body text is `#0F1417` on white. On dark, body text is `#E9EEF0` on `#0E1416`.
Keep the teal accents at the brightened dark values so links and labels stay legible.

## Typography

| Role | Face | Weight | Web size | Document size |
|---|---|---|---|---|
| Display / hero | Poppins | 800 | 56–60px | 40–44pt |
| Page title (H1) | Poppins | 700–800 | 40px | 26–28pt |
| Section heading (H2) | Poppins | 800 | 28px | 20pt |
| Subhead (H3) | Poppins | 700 | 20px | 15pt |
| Card / column title | Poppins | 700 | 18px | 14pt |
| Lead paragraph | Inter | 400 | 21px | 13–14pt |
| Body | Inter | 400 | 17px | 11pt |
| Secondary body | Inter | 400 | 15px | 10pt |
| Meta / date | Inter | 500 | 13px | 9pt |
| Eyebrow / label | Inter | 700 | 12px, UPPERCASE, +1.6px tracking, teal | 8.5pt |
| Code | Fira Code | 400 | 0.88em | 9.5pt |

Fallbacks: Poppins then "Segoe UI", Helvetica, Arial. Inter then "Segoe UI", Helvetica, Arial.
Headline line-height ~1.12, body ~1.6.

**Two-tone headings:** highlight one keyword in the accent, the rest in ink (light) or white
(dark). Example pattern: "Software architecture meets `electric fleets`" with the last phrase
teal.

## Components

- **Rounded box.** Corner radius 18–20px on web (about 0.15in / 4mm rounded rectangle in slides
  and PDFs), 1px hairline border, soft shadow (roughly `0 10px 30px rgba(15,30,35,.06)` on light).
  The default container for any grouped content.
- **Pill.** Fully rounded (radius 999px) for the nav bar, buttons, and tag chips.
- **Primary button.** Solid teal fill, white text, weight 600, pill shape.
- **Ghost button.** Transparent, teal text, 1px hairline border, pill shape.
- **Tag chip.** Accent-soft background, teal text, pill, ~12px, lowercase.
- **Eyebrow.** Uppercase teal label placed above a heading or beside a row.
- **Card tints.** To group a set (for example three role cards), give each a faint tint from the
  palette while keeping identical shape, border, and shadow.

## Layout and spacing

- Content max width about 1100–1200px; reading column about 800px.
- Generous whitespace. Consistent section gap (about 44px on web; one blank line plus a heading in
  documents).
- Left-align body and section headings. Centering is reserved for a page masthead (name + tagline)
  or a deck cover, not for section headings.

## Applying to each format

### Slides (.pptx): use with the pptx skill
- Cover and section dividers: dark variant. Background `#0E1416`, small teal eyebrow, big two-tone
  Poppins title (keyword in `#2BB6C2`), white Inter subtitle. Optional faint teal radial glow.
- Content slides: light variant. White background, ink text, a teal eyebrow then a Poppins H2,
  rounded-rectangle cards for any grouping, teal for emphasis and chips.
- Shapes: rounded rectangles only, consistent corner radius, 1px `#E9EEF0` border, subtle shadow.
- CTAs: pill rounded rectangle, teal fill, white text.
- Charts: teal as the lead series, neutral grays for the rest. No rainbow palettes.

### Documents (.docx) and PDFs: use with the docx / pdf skills
- Always light. White page, ink body in Inter 11pt, ~1.5 line spacing.
- Headings in Poppins; precede major sections with a teal uppercase eyebrow label.
- Links and inline emphasis in teal `#0E9AA7`.
- Tables: 1px `#E9EEF0` grid, header row filled `#F4F7F8`, label cells in the eyebrow style.
- Callouts and quotes: rounded tinted box (`#F2FBFB`), consistent with the card shape.
- Code or monospace runs: Fira Code, with a light `#F4F7F8` background.
- Never use em dashes.

### HTML
- Mirror the website: pill top nav, two-tone hero, rounded cards, teal accent, the type scale
  above. See `references/design-system.md` for ready CSS variables for both variants.

## QA checklist (run before delivering)

- [ ] No em dashes anywhere in the copy.
- [ ] Teal is the only accent; no lime, orange, purple, or red as accents.
- [ ] Headings in Poppins, body in Inter, code in Fira Code (or the listed fallbacks).
- [ ] One container shape: rounded boxes with a consistent radius. No mixed left-border strips.
- [ ] Eyebrows are uppercase teal and consistent.
- [ ] Section headings sit above their content, left aligned, one consistent gap.
- [ ] Type scale respected (no in-between sizes; same role, same size).
- [ ] Light vs dark chosen correctly; any body-heavy content is light.
