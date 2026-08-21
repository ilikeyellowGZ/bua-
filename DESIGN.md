# Bua Design System

## 1. Atmosphere & Identity

Bua feels like a warm, trustworthy illustrated conversation workbook made for everyday African language learning. The signature is Thandi—the supplied cream-and-navy hedgehog—living on softly lit paper surfaces, with teal progress, sun-yellow action, clay accents, and deep navy text. The twenty supplied screen PNGs and three supplied asset boards are the visual contract; code must translate them, never reinterpret or regenerate them.

## 2. Color

### Palette

| Role                 | Token                     | Value     | Usage                               |
| -------------------- | ------------------------- | --------- | ----------------------------------- |
| Surface / paper      | `color.paper`             | `#FAF7EF` | Primary light canvas                |
| Surface / raised     | `color.surface`           | `#FFFFFF` | Cards, sheets, answer rows          |
| Text / ink           | `color.ink`               | `#14263D` | Headlines, body, dark CTA           |
| Text / muted         | `color.textMuted`         | `#5F6C78` | Supporting copy and metadata        |
| Action / sun         | `color.sun`               | `#F4B942` | Primary learning actions            |
| Action / sun pressed | `color.sunPressed`        | `#DEA230` | Pressed sun action                  |
| Brand / aloe         | `color.aloe`              | `#2B9C91` | Selection, progress, focus, success |
| Brand / aloe pressed | `color.aloePressed`       | `#218178` | Pressed teal action                 |
| Accent / clay        | `color.clay`              | `#EF765F` | Speech mark, highlights, confetti   |
| Status / danger      | `color.danger`            | `#C94D45` | Errors and destructive actions      |
| Border               | `color.border`            | `#DDD9CF` | Light outlines and separators       |
| Disabled / surface   | `color.disabledSurface`   | `#ECE9E2` | Disabled controls                   |
| Disabled / text      | `color.disabledText`      | `#9A9A95` | Disabled labels                     |
| Lesson / dark        | `color.darkLesson`        | `#10243B` | Immersive lesson canvas             |
| Lesson / raised      | `color.darkLessonSurface` | `#18334F` | Dark lesson panels                  |
| Selection / surface  | `color.selectionSurface`  | `#EFF8F6` | Selected choice fill                |
| Feedback / surface   | `color.feedbackSurface`   | `#F7FBFA` | Feedback panel fill                 |

### Rules

- The supplied references decide color placement and contrast; no alternate palette may replace them.
- Sun is reserved for the principal next/check/start action. Aloe communicates progress, selection, audio, focus, and success.
- Ink anchors hierarchy and becomes a filled CTA where the references show a dark button.
- New colors require an explicit semantic role in this table before implementation.

## 3. Typography

### Scale

| Level      | Size | Weight | Line height | Usage                                           |
| ---------- | ---- | ------ | ----------- | ----------------------------------------------- |
| Display    | 56   | 800    | 64          | Bua wordmark and exceptional completion metrics |
| H1         | 40   | 800    | 48          | Primary screen question or title                |
| H2         | 32   | 700    | 40          | Section and activity headings                   |
| H3         | 24   | 700    | 32          | Card and panel headings                         |
| Body large | 20   | 600    | 28          | Prominent answers and lead copy                 |
| Body       | 17   | 500    | 24          | Default UI copy                                 |
| Body small | 15   | 500    | 22          | Secondary copy and translations                 |
| Caption    | 13   | 600    | 18          | Progress and metadata                           |

### Font stack

- Product UI: one rounded humanist sans. No font files were supplied, so the initial native system rounded fallback is an accepted asset gap until a licensed font is approved.
- Decorative or unrelated display fonts are prohibited.
- Text must reflow under platform font scaling; body copy never renders below 15 points.

## 4. Spacing & Layout

- Base unit: 8 points, with 4-point micro-adjustments only where a supplied reference demonstrates them.
- Tokens: `space.0 = 0`, `space.0_5 = 4`, `space.1 = 8`, `space.1_5 = 12`, `space.2 = 16`, `space.3 = 24`, `space.4 = 32`, `space.5 = 40`, `space.6 = 48`, `space.8 = 64`.
- Reference canvases are portrait mobile screens approximately 852–887 points wide by 1774–1846 points high. Implement with flex layout and `useWindowDimensions`; never hard-code a screenshot as the interface.
- Standard horizontal gutter is 24 points on compact phones and grows only enough to preserve the reference composition on larger devices.
- Root screens scroll and honor safe-area insets. Bottom actions remain reachable on small screens and with large text.

## 5. Components

### App Canvas

- **Structure:** root `ScrollView` with automatic content inset adjustment and a paper or dark-lesson surface.
- **Variants:** paper, dark lesson.
- **Spacing:** standard screen gutter and vertical rhythm tokens.
- **States:** loading, ready, configuration error, offline.
- **Accessibility:** readable order, selectable diagnostic text, no color-only state.
- **Motion:** finite opacity/translate entrance; zero-duration final state under reduced motion.

### Status Panel

- **Structure:** short title, concise supporting copy, optional non-sensitive diagnostic.
- **Variants:** ready, configuration required, offline-ready.
- **Spacing:** `space.2` inner gap, `space.3` padding.
- **States:** static; never prints environment values.
- **Accessibility:** heading semantics and live-region announcement only when state changes.
- **Motion:** opacity only; no loop.

Shared product controls, lesson scaffolds, choice rows, feedback, progress, and mascot primitives will be added before their first implementation in checkpoint 2.

### Theme Provider

- **Structure:** a single typed context around the product tree.
- **States:** the production Bua theme is always available; missing provider usage fails fast in development.
- **Accessibility:** semantic tokens preserve the same meaning across every screen.

### Bua Button

- **Variants:** sun primary, ink primary, aloe secondary, and outline.
- **States:** enabled, pressed, disabled, and loading. Pressed controls move down 2 points and scale to `0.985`; loading announces busy and retains its label.
- **Accessibility:** button role, explicit accessible name, 52-point height, and at least 44 points in both axes.

### Icon Button

- **Structure:** centered icon content inside a circular or rounded target.
- **States:** enabled, pressed, and disabled.
- **Accessibility:** an explicit label is mandatory and the target is at least 44 by 44 points.

### Choice Card

- **Structure:** primary label, optional description, and explicit selected text/check state.
- **States:** resting, pressed, selected, disabled.
- **Accessibility:** radio semantics with checked state; selection never relies on aloe color alone.

### Progress Header

- **Structure:** close control, segmented progress track, and text/value progress semantics.
- **States:** clamped from zero to total and complete.
- **Accessibility:** labelled close action and a progressbar value with text such as “3 of 8”.

### Feedback Panel

- **Variants:** success, coaching, and error.
- **Structure:** explicit title and supporting message.
- **Accessibility:** announced as one alert; tone is communicated in words and not color alone.

### Mascot

- **Structure:** a typed pose selects only pixel-preserved sprites extracted from the supplied Thandi boards.
- **States:** meaningful art has an image label; decorative art is hidden from assistive technology.
- **Motion:** finite whole-image opacity/transform only. Sprites are never redrawn, traced, or regenerated.

## 6. Motion & Interaction

| Token       | Duration | Usage                                        |
| ----------- | -------- | -------------------------------------------- |
| Instant     | 0 ms     | Deterministic and reduced-motion final state |
| Fast        | 140 ms   | Press feedback                               |
| Standard    | 220 ms   | Choice selection and screen transition       |
| Emphasis    | 320 ms   | Important finite coaching feedback           |
| Celebration | 520 ms   | Rare, finite completion delight              |
| Stagger     | 45 ms    | Small finite sequence offset                 |
| Press scale | 0.985    | Frequent tactile response                    |

- Animate only opacity and transforms. Motion communicates navigation, progress, selection, feedback, or audio state.
- Every transition is interruptible and every loop owns cleanup. Decorative continuous loops are prohibited.
- Screen entry is a 220 ms fade with 8 points of upward travel. Choice checks scale from 0.9 to 1 within the standard duration.
- Reduced motion keeps the identical final information and state while removing travel, parallax, pulse, and celebration sequences. Deterministic test mode uses the same final-state contract.

## 7. Depth & Surface

Strategy: mixed, as measured from the references. Paper screens use gentle tonal shifts, one-point warm borders, and restrained diffuse elevation on raised cards; dark lessons use tonal separation rather than bright borders. Rounded corners are continuous, typically 20–32 points for cards and fully rounded for pills. Depth must never obscure type, flatten Thandi, or create nested-card clutter absent from the references.

- Raised card shadow token: `depth.card = 0 8px 24px rgba(20, 38, 61, 0.08)`.
