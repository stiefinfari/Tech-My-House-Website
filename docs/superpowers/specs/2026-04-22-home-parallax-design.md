# Home Parallax Hybrid Design (2026-04-22)

## Context
- Target page: `/` (`Home.tsx`).
- Goal: add an immersive parallax effect **between home sections** that is clearly perceivable but still controlled.
- Selected direction: hybrid of
  - global ambient background parallax layers, and
  - “portal” inter-section transitions (taller dividers with layered motion).
- Constraints:
  - keep current section content and hierarchy intact;
  - no changes to player/data/routing logic;
  - respect `prefers-reduced-motion`;
  - keep performance stable on mobile.

## Scope
### In scope
- New decorative parallax backdrop in home section stack (ambient, non-dominant).
- New portal divider component rendered between key sections.
- Minimal CSS additions for portal visual language (tape edge + foil + texture).
- Integration wiring in `Home.tsx`.

### Out of scope
- Hero content redesign.
- Changes to `AudioPlayer`, `PlayerContext`, feed or API logic.
- Route/layout redesign outside home section stack.

## User Experience Intent
- Perceived depth while scrolling from one section to the next.
- Motion must feel cinematic but clearly readable (not “imperceptible”).
- Portals should read as strong transitions with acid presence, without looking like flat yellow stripes.
- Existing readability and CTA clarity must remain unchanged.

## Proposed Architecture
### 1) `HomeSectionParallaxBackdrop` (new component)
- Responsibility: render 2-3 ambient layers behind home content.
- Placement: inside `Home` around section stack, below section content (`z` lower, `pointer-events-none`, `aria-hidden`).
- Motion:
  - uses `framer-motion` `useScroll` + `useTransform`;
  - each layer has a small differential Y offset (example ranges: `10px`, `18px`, `28px`);
  - avoid high-contrast shapes because some sections have full backgrounds (the portal is the primary transition).
- Visual primitives: gradients/noise already compatible with project palette (`ink`, `acid`, white alpha).

### 2) `SectionPortalParallax` (new component)
- Responsibility: a tall transition “portal” inserted between section blocks, with layered parallax to create depth.
- Placement:
  - between `RadioShowSection` and `RecordsSection`;
  - between `RecordsSection` and `ArtistsSection`.
- Motion:
  - local scroll progress drives layered translate (3 layers) with alternating directions between portals;
  - portal height must be large enough to be perceived (example: `h-44 sm:h-56`).
- Visual language:
  - base: dark band with rough edges (`tape-edge`) and a subtle border;
  - foil: acid “foil” gradient (diagonal or radial) with controlled opacity (avoid pure flat yellow);
  - texture: noise layer + optional scanline-like micro pattern.

### 3) Home integration changes
- `Home.tsx` composes:
  - `HomeSectionParallaxBackdrop`,
  - existing sections,
  - two `SectionPortalParallax` insertions.
- Keep current marquee block intact.
- Maintain scroll anchor behavior already present in `Home.tsx`.

## Motion + Accessibility Rules
- If reduced motion is enabled:
  - disable transform animation for backdrop and dividers;
  - render static visual state with safe opacity.
- Avoid continuous costly effects:
  - prefer transform and opacity only;
  - avoid large blur animations and frequent layout-triggering styles.
- Preserve focus/keyboard interactions:
  - decorative layers must not intercept pointer/focus.

## Performance Guardrails
- Keep moving layers count low (max 3 backdrop layers + 2 portal instances).
- Use conservative transform ranges.
- Avoid high-frequency JS loops; rely on `framer-motion` mapping from scroll progress.
- Ensure no extra media requests or external dependencies.

## Implementation Plan (Atomic)
1. Add `src/components/home/HomeSectionParallaxBackdrop.tsx`.
2. Add `src/components/home/SectionPortalParallax.tsx`.
3. Add minimal CSS utility classes (if needed) in `src/index.css`.
4. Wire components in `src/pages/Home.tsx`.
5. Run diagnostics/build checks relevant to edited files.
6. Manual visual QA on desktop + mobile viewport.

## Acceptance Criteria
- On home scroll, depth is clearly perceivable between sections and reads as a designed transition.
- Portals look like acid “energy” transitions, not flat yellow stripes.
- No regression in section spacing, clickability, or anchor navigation.
- Reduced motion mode shows static, coherent visuals.
- TypeScript/lint diagnostics for touched files are clean.

## Risks And Mitigations
- Risk: over-stylized transitions reduce readability.
  - Mitigation: keep alpha low and motion ranges small; tune in one place via props/constants.
- Risk: motion discomfort on sensitive users.
  - Mitigation: strict reduced-motion fallback.
- Risk: mobile jank.
  - Mitigation: low layer count and transform-only animation.

## Open Decisions (Resolved)
- Hybrid direction accepted (`1 + 3`) with soft cinematic intensity.
- Rollback strategy accepted: components are isolated and removable without touching business logic.
