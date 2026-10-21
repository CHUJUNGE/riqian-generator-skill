# 睿丛咨询日签：固定字体与间距规范

This is a non-negotiable production specification supplied by 睿丛咨询. Do not substitute fonts, alter point sizes, tracking, leading, guides, or use automatic font-size reduction to make copy fit. Edit the approved wording or reject the candidate instead.

## Locked type contract

| Element | Typeface / weight | Size (pt) | Leading | Tracking | Horizontal scale | Non-negotiable rule |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| English month | **Bell MT**, **Bold** | **72.55** | Automatic | 0 | **71%** | Three-letter English month only. In PowerPoint, write the font family as `Bell MT` and apply Bold; never use `Bell MT Bold` as the family name. |
| Numeric day | 仿宋, Regular | **50.77** | Automatic | 0 | **91.669%** | Digits only. |
| `/` separator | 仿宋, Regular | **50.77** | Automatic | 0 | 100% | Fixed separator; do not merge it into the month layer. |
| Metadata block: weekday, 宜语, historical-on-this-day event | 微软雅黑 Light | **19.1** | **34.39 pt** | **0** | **106.509%** | One three-line metadata block, in this order. |
| Quote | 微软雅黑 Light | **36** | Automatic | **Adobe tracking 20** | 100% | Manual semantic line breaks only. |
| Source, author, identity, lifetime/background | 微软雅黑 Light | **19.1** | Automatic | 0 | 100% | Each item remains editable. |
| Footer: `助力行业先锋\n实现品牌进化` | 微软雅黑 Light | **14** | **18 pt** | **Adobe tracking 200** | 100% | Fixed two-line copy; do not rewrite, resize, or reflow. |

### PowerPoint encoding requirements

PowerPoint is the production deliverable, so the values above must be written into each editable run, not merely inherited from a theme.

- Required run sizes in OOXML are: month `sz="7255"`; date and `/` `sz="5077"`; metadata/source/author/identity/lifetime `sz="1910"`; quote `sz="3600"`; footer `sz="1400"`.
- Month runs must record `typeface="Bell MT"` and `b="1"`. This is the correct editable equivalent of the supplied **Bell MT Bold.ttf** asset.
- Preserve the PSD horizontal scales exactly: month **71%**, numeric day **91.669%**, and metadata block **106.509%**. DrawingML does not support a run-level horizontal scale; place the editable text shape inside a group whose horizontal extent applies that exact factor. Never approximate this by changing the specified point size.
- The quote's Adobe tracking 20 maps to `spc="72"` (0.72 pt at 36 pt). Footer tracking 200 maps to `spc="280"` (2.8 pt at 14 pt).
- The metadata block leading must be 34.39 pt. The footer leading must be an explicit `a:spcPts val="1800"`; do not leave it as a percentage or an automatic setting.
- Use automatic leading for the month, numeric date, quote, source, author, identity, and lifetime. Do not invent a numeric leading value for those fields.

## Asset and font handling

- Approved layout assets are `assets/brand/logo.png`, `assets/brand/background.png`, and `assets/brand/qr-code.png`; preserve their proportions and transparency.
- `assets/riqian-template-10.15.psd` is the visual reference for all object positions, spacing, and hierarchy. `references/layout-grid.md` defines the six fixed guides in the 2403 × 4918 px PSD coordinate system. Generate editable PowerPoint text and image objects directly from this reference; preserve the page aspect ratio, object positions, artwork, guide boundaries, and fixed footer.
- The company-supplied font bundle is in `assets/fonts/`: `Bell MT Bold.ttf`, `仿宋.ttf`, and `微软雅黑 Light.ttc`. Retain these assets when distributing the skill.
- Before exporting PowerPoint, check that Bell MT Bold, 仿宋, and 微软雅黑 Light are installed. With employee authorization, run `scripts/install_fonts_macos.sh` on macOS or `scripts/install_fonts_windows.ps1` on Windows. Each installs only missing bundled files for the current user and never replaces an existing file. Restart PowerPoint after installation; otherwise, stop. Font substitutions are not acceptable.
- Weekday heading, 宜语、历史信息、出处、作者、身份和背景均使用微软雅黑 Light 19.1 pt. The quote uses the fixed 36 pt setting. The footer is the fixed two-line copy `助力行业先锋\n实现品牌进化` in 微软雅黑 Light at 14 pt, with 18 pt leading and Adobe tracking 200.
- Do not reduce type size or rely on the user's operating-system font registry. If the verified original wording cannot fit the fixed text box, reject the candidate and choose another verified quotation; never edit it for fit.

## Display-copy line rules

- The 宜 field is set as `宜{宜语}` with no colon and no space after 宜.
- Historical information is always a verified historical-on-this-day event that meaningfully relates to the chosen quote and 宜语. Do not place a no-event placeholder in the layout.
- Quote line breaks are intentional, manual line breaks. Preserve the approved original wording and punctuation exactly: do not delete, rewrite, splice, or otherwise alter either for layout. Break at a self-contained semantic unit rather than letting a sentence run continuously into the next line or leaving a grammatical fragment alone. A line containing only one or two Chinese characters is prohibited; move only the line break. If no compliant arrangement exists, replace the entire candidate with another verified quotation.
- Every displayed quote line must end without punctuation. Meet this rule by choosing a verified quotation whose original form permits it; never remove source punctuation to make a line fit.

## Mandatory preflight and release check

Before delivery, inspect the editable PPTX package and record a pass only if every value in the locked type contract is present exactly. The review must check the family name, bold flag, point size, quote tracking, footer tracking, metadata leading, footer leading, and all six guide coordinates in [layout-grid.md](layout-grid.md). A visual preview is supplementary only; it cannot replace this check. If any value is absent, substituted, inherited, rounded, or different, do not deliver the file.
