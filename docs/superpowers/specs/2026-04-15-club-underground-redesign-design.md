# Tech My House - Complete Underground Redesign Spec

## 1) Objective
Rebuild the website UI layer with a modern underground club-culture look and feel (black + neon yellow), preserving current content and navigation goals while improving:
- responsive behavior across desktop, tablet, and mobile;
- visual hierarchy and readability;
- performance (target perceived load under 3 seconds on common devices);
- content safety (no image/text overflow outside intended containers).

## 2) Approved Direction
- Approach: full rebuild of the visual layer (not incremental refactor).
- Homepage structure: full-screen Hero, Artists section, Podcast section, Footer.
- Hero content: title "Tech My House", subtitle "Where music unites".
- Hero media: use local video source from `Tech My House_files/hero video.mp4` (to be copied to a web-safe public asset path during implementation).
- Artists section style: minimalist, only photo + name + role.
- Primary heading typeface: Syne ExtraBold.
- Secondary accent typeface: MADE Soulmaze (accents only, not primary section headings).
- Forbidden effects: no glitch/distortion text effects.
- Allowed text effects: glow depth via layered text-shadows and subtle luminosity animation.

## 3) IA and Page Composition
### Home
- Hero: full viewport visual entry, centered title/subtitle over video.
- Artists: simplified grid with direct navigation to artist detail pages.
- Podcast: reduced visual noise, stronger content-first hierarchy.
- Footer: concise links/info, high contrast and accessibility-compliant interactions.

### Artist Detail
- Keep route behavior and data model compatibility.
- Maintain clear hierarchy with artist image and profile metadata.
- Keep release list readable and responsive.

### Podcast Page
- Keep existing content and functional behavior.
- Restyle to match new visual system.

## 4) Visual System
### Palette
- Background base: near-black range (primary dark surfaces).
- Accent: neon yellow for highlights, glow cues, active states.
- Support tones: restrained grays/whites for readable typography and separators.

### Typography
- Primary headings: Syne ExtraBold.
- Body and utility text: monospaced/sans family already present in project stack for readability.
- Accent typography: MADE Soulmaze via custom font-face for selected labels/claims/CTA only.

### Spacing and Rhythm
- Establish consistent spacing scale across sections.
- Use max-width containers with adaptive horizontal padding per breakpoint.
- Preserve strong negative space for minimalist look.

### Effects
- Glow system based on layered text-shadows.
- Smooth transitions (opacity/transform/filter) with short durations.
- No heavy visual distortion animations.

## 5) Font Delivery Strategy
### Source and conversion
- Source font file: `MADE Soulmaze Brush PERSONAL USE.otf`.
- Generate web formats: `woff2` and `woff`.
- Store outputs in a dedicated project font assets directory.

### Loading
- Define `@font-face` with:
  - font-family alias (project-safe name);
  - `src` order with `woff2` then `woff`;
  - `font-display: swap` for perceived performance.
- Configure fallback stack to visually similar system cursive/handwritten alternatives.
- Restrict usage through utility/class conventions so the font does not replace primary heading styles.

## 6) Responsive and Overflow Invariants
### Breakpoints
- Desktop: >= 1024px.
- Tablet: 768px to 1023px.
- Mobile: < 768px.

### Invariants (must always hold)
- No horizontal page overflow.
- All media must stay within container bounds (`max-width: 100%`, proper object-fit).
- Headings/subtitles must reflow safely via fluid type scaling (`clamp`-based).
- Card/media proportions must remain stable through aspect-ratio constraints.
- Interactive elements must remain reachable and readable at all breakpoints.

### Hero-specific
- Use viewport-safe height strategy suitable for mobile browser UI chrome.
- Keep title/subtitle legible over video with contrast-preserving overlay.

## 7) Artists Section Redesign (Minimal)
- Remove decorative/secondary elements that dilute hierarchy.
- Grid behavior:
  - desktop: multi-column balanced cards;
  - tablet: reduced columns and spacing;
  - mobile: single-column clean stack.
- Card content strictly limited to:
  - artist photo;
  - artist name;
  - artist role.
- Hover/focus/tap feedback must be subtle and performant (no layout shifts).

## 8) Motion and Interaction Rules
- Prefer transform/opacity-driven animations (GPU-friendly).
- Keep animation timings restrained and coherent.
- Use micro-interactions for affordance, not decoration.
- Respect reduced-motion preferences with degraded/disabled non-essential effects.

## 9) Performance Plan
- Hero video optimization:
  - efficient encoding and sensible bitrate;
  - preload policy limited to critical above-the-fold media.
- Lazy load non-critical images/content.
- Route-level code splitting for non-home routes/components where beneficial.
- Minimize blocking work on initial render.
- Avoid expensive paint/layout effects and keep animation surfaces simple.

## 10) Accessibility Rules
- Maintain high color contrast for text/UI states on dark backgrounds.
- Preserve clear focus-visible treatment for keyboard users.
- Ensure text glow never compromises readability.
- Ensure semantic structure and alt texts remain intact.

## 11) Constraints and Non-Goals
### Constraints
- Keep existing content model and route intentions.
- Preserve core functionality (navigation, artist pages, podcast usage).
- No glitch/distortion effect reintroduction.

### Non-goals
- No redesign of backend/data architecture.
- No unnecessary feature expansion beyond approved visual/UX scope.

## 12) Validation and Acceptance
### Functional
- All key routes render and navigate correctly.
- Artist cards link correctly and remain readable.

### Responsive
- Manual checks on desktop/tablet/mobile widths.
- Verify no content escapes containers in major sections.

### Performance
- Validate fast initial paint and acceptable interaction responsiveness.
- Confirm lazy-loading and split chunks are active where defined.

### Visual QA
- Confirm hero wording and media are correct:
  - "Tech My House"
  - "Where music unites"
  - correct hero video source path after web-safe relocation.
- Confirm no glitch styles remain.
- Confirm glow style is present but readable.
