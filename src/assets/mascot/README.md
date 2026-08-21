# Thandi asset boundary

Thandi’s immutable sources live in `design/reference/bua/` and are catalogued by SHA-256 in `manifest.json`.

No runtime sprite is committed yet. Both supplied mascot boards are RGB images without alpha, and their checkerboard is baked into the pixel data. Rendering a cell crop would expose that checkerboard; removing it would alter pixels and violate the current immutable-asset rule.

The proposed pixel rectangles and stable sprite IDs are recorded in `design/reference/bua/mascot-crops.json`. When an approved transparent board becomes available, runtime files will be generated into this directory, verified for alpha, mapped by stable ID, and compared against the immutable source before any screen consumes them.
