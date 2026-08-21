# Bua Asset Gaps

## Blocking visual gaps

### Mascot and brand transparency — partially resolved

The three asset boards are 8-bit truecolor RGB PNGs with no alpha channel. Their checkerboard pattern is baked into the source pixels. The production prompt explicitly approves background removal from these boards, so the measured mascot rectangles are processed by `scripts/extract-approved-assets.mjs`.

Decision: crop rectangles remain fixed in `design/reference/bua/mascot-crops.json`. The extractor clears only border-connected near-neutral board pixels, never changes foreground RGB, writes lossless RGBA PNGs, and records hashes and transparent-pixel counts in the generated manifest. This resolves the visible board background without redrawing, regenerating, tracing, or substituting Thandi.

Remaining limitation: the baked board has antialiased transition pixels rather than original alpha coverage, so faint neutral edge pixels may remain. A future original transparent source can replace the derived alpha while preserving the exact pose. Page-specific props that are absent from the approved boards (for example a standalone clock) remain gaps and must not be invented into Thandi.

### Scene layers

The screen references contain cafeteria, campus, taxi-rank, cultural-card, and picture-match scenes only as flattened screen pixels. There are no standalone licensed scene images or layers. The implemented scenes use tightly bounded, pixel-preserving crops recorded in `src/assets/scenes/generated/manifest.json`; interactive selection chrome is rendered separately in code.

## Non-blocking production gaps

- No licensed product font files were supplied. The initial implementation uses one native rounded humanist fallback and records visual-diff tolerance for font rasterization.
- No isiZulu lesson audio files were supplied. The deterministic demo exposes playback state without pretending that sound played; licensed production recordings and the production audio adapter remain a content-delivery dependency.
- No speech-recognition/scoring provider credentials or on-device model were supplied. Deterministic bounded scoring remains the offline/demo implementation.
- Store product identifiers, localized pricing, trial eligibility, Terms URL, and Privacy URL are not supplied. Production checkout must obtain these from native storefront metadata and server verification; it must never hard-code the raster’s price as authority.
- Native app signing identifiers, Apple/Google store credentials, and notification credentials are not present and must live in EAS/provider secret stores rather than Git.

## Resolution rule

Every replacement asset must be traceable to the user or an approved licensed source, preserve Thandi’s exact cream-and-navy construction, and pass regional visual comparison. Unresolved gaps remain explicit; they are never silently filled with generated or approximate art.
