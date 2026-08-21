# Bua Asset Gaps

## Blocking visual gaps

### Mascot and brand transparency

The three asset boards are 8-bit truecolor RGB PNGs with no alpha channel. Their checkerboard pattern is baked into the source pixels. A rectangular crop can remain pixel-identical, but it would visibly render the checkerboard and cannot be placed faithfully on paper, navy, or illustrated scene surfaces.

Decision: do not redraw, regenerate, trace, automatically remove the background, or ship checkerboard-backed crops. Crop rectangles are measured and retained in `design/reference/bua/mascot-crops.json`; product sprites remain blocked pending approved transparent source files or explicit approval for a reviewed masking process.

### Scene layers

The screen references contain cafeteria, campus, taxi-rank, cultural-card, and picture-match scenes only as flattened screen pixels. There are no standalone licensed scene images or layers. Full-screen references cannot be used as interactive backgrounds. A scene must therefore be supplied separately or explicitly approved for a tightly bounded pixel-preserving crop where the crop does not include UI chrome.

## Non-blocking production gaps

- No licensed product font files were supplied. The initial implementation uses one native rounded humanist fallback and records visual-diff tolerance for font rasterization.
- No isiZulu lesson audio files were supplied. Deterministic local audio fixtures and the `expo-audio` adapter will be implemented behind the same interface; production recordings remain a content-delivery dependency.
- No speech-recognition/scoring provider credentials or on-device model were supplied. Deterministic bounded scoring remains the offline/demo implementation.
- Store product identifiers, localized pricing, trial eligibility, Terms URL, and Privacy URL are not supplied. Production checkout must obtain these from native storefront metadata and server verification; it must never hard-code the raster’s price as authority.
- Native app signing identifiers, Apple/Google store credentials, and notification credentials are not present and must live in EAS/provider secret stores rather than Git.

## Resolution rule

Every replacement asset must be traceable to the user or an approved licensed source, preserve Thandi’s exact cream-and-navy construction, and pass regional visual comparison. Unresolved gaps remain explicit; they are never silently filled with generated or approximate art.
