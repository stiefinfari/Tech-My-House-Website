# Home Parallax Hybrid Design (2026-04-22)

## Context
- Target page: `/` (`Home.tsx`).
- Goal: add an immersive but subtle parallax effect **between home sections**.
- Selected direction: hybrid of
  - global soft background parallax layers, and
  - animated inter-section dividers.
- Constraints:
  - keep current section content and hierarchy intact;
  - no changes to player/data/routing logic;
  - respect `prefers-reduced-motion`;
  - keep performance stable on mobile.

## Scope
### In scope
- New decorative parallax backdrop in home section stack.
- New divider component rendered between key sections.
- Minimal CSS additions for divider visual language (band + texture + glow).
- Integration wiring in `Home.tsx`.

### Out of scope
- Hero content redesign.
- Changes to `AudioPlayer`, `PlayerContext`, feed or API logic.
- Route/layout redesign outside home section stack.

## User Experience Intent
- Perceived depth while scrolling from one section to the next.
- Motion must feel cinematic-soft, never aggressive.
- Dividers should read as visual transitions, not as blocking content.
- Existing readability and CTA clarity must remain unchanged.

## Proposed Architecture
### 1) `HomeSectionParallaxBackdrop` (new component)
- Responsibility: render 2-3 ambient layers behind home content.
- Placement: inside `Home` around section stack, below section content (`z` lower, `pointer-events-none`, `aria-hidden`).
- Motion:
  - uses `framer-motion` `useScroll` + `useTransform`;
  - each layer has a small differential Y offset (example ranges: `12px`, `22px`, `34px`);
  - optional slight opacity drift if needed, but conservative.
- Visual primitives: gradients/noise already compatible with project palette (`ink`, `acid`, white alpha).

### 2) `SectionDividerParallax` (new component)
- Responsibility: visual separator inserted between section blocks.
- Placement:
  - between `RadioShowSection` and `RecordsSection`;
  - between `RecordsSection` and `ArtistsSection`.
- Motion:
  - local scroll progress drives subtle translate/opacity;
  - alternate directions between divider instances for rhythm.
- Visual language:
  - slim tape/band strip + textured glow layer;
  - low contrast by default, slightly brighter near center.

### 3) Home integration changes
- `Home.tsx` composes:
  - `HomeSectionParallaxBackdrop`,
  - existing sections,
  - two `SectionDividerParallax` insertions.
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
- Keep moving layers count low (max 3 backdrop layers + 2 divider instances).
- Use conservative transform ranges.
- Avoid high-frequency JS loops; rely on `framer-motion` mapping from scroll progress.
- Ensure no extra media requests or external dependencies.

## Implementation Plan (Atomic)
1. Add `src/components/home/HomeSectionParallaxBackdrop.tsx`.
2. Add `src/components/home/SectionDividerParallax.tsx`.
3. Add minimal CSS utility classes (if needed) in `src/index.css`.
4. Wire components in `src/pages/Home.tsx`.
5. Run diagnostics/build checks relevant to edited files.
6. Manual visual QA on desktop + mobile viewport.

## Acceptance Criteria
- On home scroll, depth is perceivable between sections without distraction.
- Dividers are visible as transitions but do not overpower section content.
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
