#!/usr/bin/env python3
"""Report contract readiness from the PSD's embedded XMP metadata.

This intentionally does not mutate a template. Photoshop remains the authority for
smart-object and font validation.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

REQUIRED_TEXT = {
    "month": ["riqian.date.month", "Apr"],
    "day": ["riqian.date.day", "01"],
    "separator": ["riqian.date.separator", "/"],
    "quote": ["riqian.quote", "大勇若怯，大智如愚"],
    "attribution_source": ["riqian.attribution", "星期五 宜逗乐（愚人节） 苹果公司创立"],
}


def xmp_values(raw: bytes, tag: str) -> list[str]:
    pattern = rb"<photoshop:" + tag.encode() + rb">(.*?)</photoshop:" + tag.encode() + rb">"
    return [re.sub(r"<[^>]+>", "", value.decode("utf-8", "replace")).strip()
            for value in re.findall(pattern, raw, flags=re.DOTALL)]


def main() -> int:
    parser = argparse.ArgumentParser(description="Check a riqian PSD against its layer-name contract.")
    parser.add_argument("template", type=Path)
    args = parser.parse_args()
    if not args.template.is_file():
        parser.error("template does not exist: %s" % args.template)
    raw = args.template.read_bytes()
    names = xmp_values(raw, "LayerName")
    resolved = {field: next((alias for alias in aliases if alias in names), None)
                for field, aliases in REQUIRED_TEXT.items()}
    report = {
        "template": str(args.template.resolve()),
        "bytes": len(raw),
        "xmp_text_layer_names": names,
        "resolved_render_layers": resolved,
        "missing_render_fields": [field for field, name in resolved.items() if name is None],
        "normalized_contract_ready": all(name in names for name in [
            "riqian.date.month", "riqian.date.day", "riqian.date.separator",
            "riqian.quote", "riqian.attribution", "riqian.source", "riqian.artwork"
        ]),
        "limitations": [
            "XMP may omit layers; inspect in Photoshop before a production render.",
            "This check cannot verify smart-object type, clipping masks, fonts, or visual overflow."
        ]
    }
    report["ready_for_browser_render"] = not report["missing_render_fields"]
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["ready_for_browser_render"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
