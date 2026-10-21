#!/usr/bin/env python3
"""Fail closed when an editable 睿丛咨询日签 PPTX breaks its type contract."""

from __future__ import annotations

import argparse
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
}

TEXT_CONTRACT = {
    "month": {"font": "Bell MT", "size": "7255", "bold": "1", "horizontal_scale": 0.71},
    "separator": {"font": "仿宋", "size": "5077", "bold": "0"},
    "day": {"font": "仿宋", "size": "5077", "bold": "0", "horizontal_scale": 0.91669},
    "metadata": {"font": "微软雅黑 Light", "size": "1910", "bold": "0", "leading": "3439", "horizontal_scale": 1.06509},
    "quote": {"font": "微软雅黑 Light", "size": "3600", "bold": "0", "tracking": "72"},
    "source": {"font": "微软雅黑 Light", "size": "1910", "bold": "0"},
    "author": {"font": "微软雅黑 Light", "size": "1910", "bold": "0"},
    "identity": {"font": "微软雅黑 Light", "size": "1910", "bold": "0"},
    "lifetime": {"font": "微软雅黑 Light", "size": "1910", "bold": "0"},
    "footer": {"font": "微软雅黑 Light", "size": "1400", "bold": "0", "leading": "1800", "tracking": "280"},
}


def shape_name(shape: ET.Element) -> str | None:
    item = shape.find("p:nvSpPr/p:cNvPr", NS)
    return item.get("name") if item is not None else None


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def grouped_scales(root: ET.Element) -> dict[str, float]:
    """Return the cumulative horizontal group scale applied to each text shape."""
    result: dict[str, float] = {}

    def walk(node: ET.Element, scale: float) -> None:
        for child in node:
            if child.tag == f"{{{NS['p']}}}grpSp":
                transform = child.find("p:grpSpPr/a:xfrm", NS)
                extent = transform.find("a:ext", NS) if transform is not None else None
                child_extent = transform.find("a:chExt", NS) if transform is not None else None
                if extent is None or child_extent is None:
                    walk(child, scale)
                    continue
                scale_x = float(extent.get("cx")) / float(child_extent.get("cx"))
                walk(child, scale * scale_x)
            elif child.tag == f"{{{NS['p']}}}sp":
                name = shape_name(child)
                if name:
                    result[name] = scale
                walk(child, scale)
            else:
                walk(child, scale)

    walk(root, 1.0)
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pptx", type=Path)
    args = parser.parse_args()

    try:
        with zipfile.ZipFile(args.pptx) as package:
            xml = package.read("ppt/slides/slide1.xml")
    except (OSError, zipfile.BadZipFile, KeyError) as error:
        print(f"FAIL: cannot inspect {args.pptx}: {error}", file=sys.stderr)
        return 2

    root = ET.fromstring(xml)
    shapes = {shape_name(shape): shape for shape in root.findall(".//p:sp", NS) if shape_name(shape)}
    scales = grouped_scales(root)
    errors: list[str] = []

    for name, contract in TEXT_CONTRACT.items():
        shape = shapes.get(name)
        if shape is None:
            fail(errors, f"{name}: required editable text object is missing")
            continue

        runs = shape.findall(".//a:rPr", NS)
        if not runs:
            fail(errors, f"{name}: has no explicit editable text runs")
            continue

        for index, run in enumerate(runs, start=1):
            latin = run.find("a:latin", NS)
            actual_font = latin.get("typeface") if latin is not None else None
            if actual_font != contract["font"]:
                fail(errors, f"{name} run {index}: font {actual_font!r}, expected {contract['font']!r}")
            for key, expected in (("sz", contract["size"]), ("b", contract["bold"])):
                if run.get(key) != expected:
                    fail(errors, f"{name} run {index}: {key}={run.get(key)!r}, expected {expected!r}")
            if "tracking" in contract and run.get("spc") != contract["tracking"]:
                fail(errors, f"{name} run {index}: tracking={run.get('spc')!r}, expected {contract['tracking']!r}")

        if "leading" in contract:
            leading = shape.find(".//a:lnSpc/a:spcPts", NS)
            actual_leading = leading.get("val") if leading is not None else None
            if actual_leading != contract["leading"]:
                fail(errors, f"{name}: leading={actual_leading!r}, expected {contract['leading']!r}")

        if "horizontal_scale" in contract:
            actual_scale = scales.get(name, 1.0)
            expected_scale = contract["horizontal_scale"]
            if abs(actual_scale - expected_scale) > 0.00001:
                fail(errors, f"{name}: horizontal scale={actual_scale:.5f}, expected {expected_scale:.5f}")

    if errors:
        print("FAIL: 睿丛咨询日签字体/间距合同未通过", file=sys.stderr)
        print("\n".join(f"- {error}" for error in errors), file=sys.stderr)
        return 1

    print("PASS: 字体、字号、字重、横向缩放、元数据行距、正文与页脚字距、页脚行距均符合固定合同")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
