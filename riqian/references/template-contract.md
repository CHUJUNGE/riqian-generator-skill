# Template contract: riqian-template-10.15.psd

The supplied source is **2403 × 4918 px, CMYK**. The browser renderer supports the current source's verified text-layer names and the normalized names below. Normalizing remains recommended but is not a launch blocker.

| Required layer name | Kind | Rule |
| --- | --- | --- |
| `riqian.date.month` | text | Three-letter English month (e.g. `Oct`) |
| `riqian.date.day` | text | Zero-padded day (e.g. `15`) |
| `riqian.date.separator` | text | `/` unless brand owner changes it |
| `riqian.quote` | text | Approved display quote; max 54 Chinese characters including punctuation |
| `riqian.attribution` | text | Person/event name; max 28 Chinese characters |
| `riqian.source` | text | Short work/source label; max 38 Chinese characters |
| `riqian.artwork` | smart object or normal art layer | Optional approved visual; retain independent editability |

Optional groups may be named `riqian.logo` and `riqian.decoration`. Their visibility and appearance are preserved.

## Legacy mapping for the bundled PSD

| Payload field | Existing text-layer name |
| --- | --- |
| month | `Apr` |
| day | `01` |
| separator | `/` |
| quote | `大勇若怯，大智如愚` |
| attribution + source | `星期五 宜逗乐（愚人节） 苹果公司创立` |

The existing brand layer, `关注睿丛咨询 从生活中炼金`, is preserved. The runner replaces only the mapped fields and retains each as a native text layer in the returned PSD.

## Fixed typography

Apply the mandatory font families and point sizes in [typography.md](typography.md). The weekday heading and source/attribution may share one native text layer because both use 微软雅黑 Light at 19.1 pt. Keep the quote and `助力行业先锋` footer independently editable.

## Recommended one-time normalization in Photoshop

1. Duplicate the original PSD before any editing and preserve it under `assets/`.
2. Rename the current date layers to the three `riqian.date.*` names. Add the quote, attribution, and source as native text layers in their intended positions.
3. Convert the replaceable image area to the named smart object, or retain it as a separately named editable art layer. Do not rasterize text.
4. Ensure the document opens without missing critical fonts; record approved substitutions in the brand configuration.
5. Save the normalized file as the production template, then run both preflight and a Photoshop smoke render.

The browser renderer fails safely when a mapped layer is absent, ambiguous, non-text when text is required, or when quote limits are exceeded.
