# Brand configuration

This is the production baseline. Replace bracketed values only after a brand owner approves them; do not guess missing rules.

```yaml
brand_name: "馨公咨询"
audience: "职场精英、终身学习者、寻求深度的青年群体"
language: "zh-CN"
voice: "理性、温暖、克制、有启发性"
forbidden: []
signature: "[待品牌负责人确认]"
output:
  basename: "{date}-riqian"
  png_color_space: "sRGB IEC61966-2.1"
  png_transparent: false
  target: "微信公众号"
assets:
  allowed_licenses: ["public-domain", "CC0", "employee-owned", "written-license", "self-generated"]
  restricted_licenses: ["unknown", "editorial-only", "no-derivatives", "non-commercial"]
```

Rules:

- A licence claim needs its source URL or an internal approval reference in the manifest.
- Do not use fonts unless the company has a valid licence for the required use. Preflight may identify absent fonts but cannot grant rights.
- The source PSD is CMYK. PNG exports must be converted to the configured sRGB profile for WeChat; do not overwrite the layered CMYK master merely to create a web export.
- Brand owner should add official logo files and approved font details to `assets/` before production.
