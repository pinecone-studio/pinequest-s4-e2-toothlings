# Mouth-Open Reveal — opening sequence (web)

The landing opens as a **closed mouth**: two organic lip shapes meet at a seam
across the vertical centre, filling the viewport in the deep brand field. One
continuous scroll gesture parts the lips, reveals the **ToothLings** logo + name
in the widening gap, settles it, then docks it into the nav and hands off into
the page.

Built on what the project already ships — **Lenis + Framer Motion `m.*`**
(under `LazyMotion domAnimation`), the gold-on-deep-ink brand, and the existing
`#hero` / `PageNav` anchors. No new dependencies.

> Scope: **web only** (per the build decision). The palette stays on the
> shipping honey-gold system — the closed mouth is the deep field, the
> inner-lip glow is honey-gold `#F2B705`. Not a new orange/mint scale.

## Files

| File | Role |
|------|------|
| `introBrand.ts` | **Single source of truth** — colors, lip/seam SVG paths, concave-notch geometry, all choreography constants. Pure data, no platform imports (copy verbatim into mobile for a parity build). |
| `useIntroProgress.ts` | One `useScroll` over the pinned section → the single `progress` MotionValue (0→1) + `reduced`. |
| `Lip.tsx` | One organic lip, used twice (upper/lower). Translates off `progress`; honey-gold rim glow rides the inner edge. |
| `LogoReveal.tsx` | Logo image + **real `<h1>`** brand name. Scales 0.92→1, calm spring settle, docks during hand-off. |
| `NextScreenIntro.tsx` | Docked-state hero — value-prop heading + CTAs, rise in (y only). |
| `MouthOpenIntro.tsx` | Pins the section (`id="hero"`) and wires it all together. Owns the reduced-motion branch + `will-change` lifecycle. |

## The p → transform map

Everything derives from one `progress` value (`0` = closed, `1` = handed off).

| p | What happens |
|------|------|
| `0.00–0.10` | Closed mouth, full field. Tiny **anticipation compression** (`COMPRESS_VH` inward). |
| `0.10–0.55` | **Lips part** (expo-out). Logo fades in early (`0.12–0.34`) and scales `0.92→1`; gold glow ramps on the inner edge. |
| `0.55–0.78` | Lips **clear the viewport** (translate `±LIP_TRAVEL_VH`). Logo fully revealed and settles. |
| `0.78–1.00` | **Hand-off**: logo docks up + shrinks + fades; nav docks in; next-screen content rises (y only, `STAGGER` between items). Pin releases. |

## Motion values (in `introBrand.ts`)

- **Lip easing**: `EASE_EXPO = [0.16, 1, 0.3, 1]` (expo-out) — applied to every parting/exit `useTransform`.
- **Logo settle**: `SPRING = { stiffness: 120, damping: 18 }` (via `useSpring` on the logo scale) — calm, no visible overshoot.
- **Entrances**: y-axis only, never x (project convention). `STAGGER = 0.04` progress units ≈ ~70ms feel.

## Tuning

- **Pin length** → `PIN_VH` (default `180`). The section is `100 + PIN_VH` vh tall with a `sticky` 100vh layer, so the opening is held for `PIN_VH` of scroll.
- **Lip travel** (how far/fast they clear) → `LIP_TRAVEL_VH` (default `66`). The middle stop in `Lip.tsx`'s `travel` array (`-30`/`30`) sets how wide the gap is at `partEnd` before the lips exit.
- **Anticipation** → `COMPRESS_VH` (default `0.5`).
- **Lip silhouette** → `SEAM_PATH` / `UPPER_LIP_PATH` / `LOWER_LIP_PATH`. All three share the same control points; edit the seam and rebuild the two fills so they keep tiling exactly.
- **Stagger / hand-off start** → `STAGGER` and `HANDOFF` (in `NextScreenIntro.tsx`).
- **Nav dock timing** → `Header.tsx` sets `thresh = innerHeight * 1.85` (≈ pin end). Lower it to make the nav arrive earlier.

## Accessibility

- **Reduced motion** (`useReducedMotion`): no lips, no pin — `MouthOpenIntro` renders the **revealed state immediately** (logo + heading + CTAs), fully usable.
- The brand name is a real `<h1>`; the logo image is `aria-hidden` (decorative). The CTA region is `aria-hidden` + non-focusable until the hand-off so focus order stays correct during the reveal.
- Contrast: white / honey-gold on the deep field and dark-on-gold CTA both clear WCAG AA. Copy is Mongolian Cyrillic, rendered in the Cyrillic-safe system stack.

## Performance

- Animates **only `transform` + `opacity`** — no width/height/top/left, no layout thrash. The section reserves its height up front (CLS ≈ 0).
- `will-change: transform` is set on the lips/logo **only while actively animating** (`0.001 < p < 0.999`) and dropped to `auto` otherwise.
