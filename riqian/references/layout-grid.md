# 睿丛咨询日签：固定版式网格

This is a non-negotiable production specification supplied by 睿丛咨询. It uses the PSD canvas coordinate system: **2403 px × 4918 px**. Do not round, move, add, or remove these guide lines.

## Fixed guides

| Direction | Coordinate (px) | Production role |
| --- | ---: | --- |
| Horizontal | 367.781 | Header lower guide |
| Horizontal | 469.344 | Metadata upper guide |
| Horizontal | 1657.656 | Quote upper guide |
| Horizontal | 4386.313 | Footer / QR upper guide |
| Vertical | 117.438 | Left content guide |
| Vertical | 2299.5 | Right content guide |

## Use in production

- Treat the six values as exact PSD-pixel coordinates on the 2403 × 4918 canvas. Do not approximate them from a screenshot.
- All editable content must stay within the left/right guides. The header, metadata, quote, attribution, and footer/QR areas must respect their corresponding horizontal guide boundaries.
- When generating PowerPoint, preserve the PSD visual reference and map its page to the same aspect ratio. Convert coordinates proportionally only for the target page size: `target_x = 117.438 × target_width / 2403`, and equivalently for every other guide coordinate.
- The required guide values are **367.781**, **469.344**, **1657.656**, **4386.313**, **117.438**, and **2299.5** exactly. Store and test against these source values before proportional conversion; do not round the source contract.
- Never resolve an overflow by moving a guide, shrinking fixed typography, altering the quotation, or letting content cross into an adjacent zone. Reject the candidate instead.
- Add these guides to the working layout only for inspection; they are not part of the final exported artwork.
