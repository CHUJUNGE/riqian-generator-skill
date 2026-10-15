# 睿丛咨询日签：固定字体规范

This is a non-negotiable production specification supplied by 睿丛咨询. Do not substitute fonts, alter point sizes, or use automatic font-size reduction to make copy fit. Edit the approved wording or layout instead.

| Element | Typeface | Size (pt) | Rule |
| --- | --- | ---: | --- |
| English month | Bell MT Bold | 72.55 | Use the supplied Bell MT Bold font; display the three-letter English month. |
| Numeric date | 仿宋 | 50.77 | Use the supplied 仿宋 font for the date digits only. |
| Weekday heading | 微软雅黑 Light | 19.1 | Fixed. |
| Main quote | 微软雅黑 Light | 36 | Fixed. |
| Source / attribution | 微软雅黑 Light | 19.1 | Fixed. |
| Footer: `助力行业先锋` | 微软雅黑 Light | 14 | Fixed. |

## Asset and font handling

- Approved layout assets are `assets/brand/logo.png`, `assets/brand/background.png`, and `assets/brand/qr-code.png`; preserve their proportions and transparency.
- The supplied font binaries are local production dependencies: `Bell MT Bold.ttf`, `仿宋.ttf`, and `微软雅黑 Light.ttc`. They are intentionally **not** committed to this repository, because their redistribution rights have not been verified.
- Before a production render, install or activate those exact fonts on the rendering machine. If a font is unavailable, stop and report it; do not silently substitute it.
- The current PSD may keep the weekday heading and source/attribution in its existing combined context layer: both use 微软雅黑 Light at 19.1 pt. Keep them together unless a future layout needs independently positioned text.
