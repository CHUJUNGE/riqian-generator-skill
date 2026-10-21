# Brand configuration

This is the production baseline. Replace bracketed values only after a brand owner approves them; do not guess missing rules.

```yaml
brand_name: "睿丛咨询"
audience: "职场精英、终身学习者、寻求深度的青年群体"
language: "zh-CN"
voice: "理性、温暖、克制、有启发性"
forbidden: []
signature: "助力行业先锋"
output:
  basename: "{date}-riqian"
  format: "pptx"
  target: "微信公众号"
assets:
  brand_assets:
    logo: "assets/brand/logo.png"
    background: "assets/brand/background.png"
    qr_code: "assets/brand/qr-code.png"
    provenance: "brand-supplied"
  allowed_licenses: ["public-domain", "CC0", "employee-owned", "written-license", "self-generated"]
  restricted_licenses: ["unknown", "editorial-only", "no-derivatives", "non-commercial"]
```

Rules:

- A licence claim needs its source URL or an internal approval reference in the manifest.
- Do not use fonts unless the company has a valid licence for the required use. Preflight may identify absent fonts but cannot grant rights.
- Use `assets/riqian-production-template-v23.pptx` as the production master and `assets/riqian-template-10.15.psd` only as its archival visual reference. Save each approved daily sign as a new PowerPoint file; do not overwrite either reference asset.
- Brand owner should add official logo files and approved font details to `assets/` before production.
- The checked-in logo, background and QR code are supplied by 睿丛咨询 for this skill. Do not replace, recolor, crop, or reuse them outside an approved 睿丛咨询 daily-sign layout.
- Read `references/typography.md` before editing or rendering a daily sign. Its typefaces and point sizes are fixed production rules.
