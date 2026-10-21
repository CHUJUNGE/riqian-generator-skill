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
    "separator": {"font": "仿宋", "size": "2278", "bold": "0"},
    "day": {"font": "仿宋", "size": "5077", "bold": "0"},
    "metadata": {"font": "微软雅黑 Light", "size": "1910", "bold": "0", "leading": "3439"},
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


def source_position(shape: ET.Element) -> tuple[float, float] | None:
    transform = shape.find("p:spPr/a:xfrm", NS)
    offset = transform.find("a:off", NS) if transform is not None else None
    if offset is None:
        return None
    # The locked template's 2403px source canvas is 7,315,200 EMU wide.
    factor = 7315200 / 2403
    return float(offset.get("x")) / factor, float(offset.get("y")) / factor


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
            relationships = package.read("ppt/slides/_rels/slide1.xml.rels")
    except (OSError, zipfile.BadZipFile, KeyError) as error:
        print(f"FAIL: cannot inspect {args.pptx}: {error}", file=sys.stderr)
        return 2

    root = ET.fromstring(xml)
    shapes = {shape_name(shape): shape for shape in root.findall(".//p:sp", NS) if shape_name(shape)}
    scales = grouped_scales(root)
    errors: list[str] = []

    # The v23 master uses a rendered month asset (not a host-font text run).
    if b"../media/month.png" not in relationships:
        fail(errors, "month: bundled fixed month artwork is missing")

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

    separator = shapes.get("separator")
    day = shapes.get("day")
    if separator is not None and day is not None:
        separator_position = source_position(separator)
        day_position = source_position(day)
        if separator_position is None or day_position is None:
            fail(errors, "header: separator or day has no position transform")
        else:
            sx, sy = separator_position
            dx, dy = day_position
            if abs(sy - 226) > 0.01 or abs(dy - 119) > 0.01 or abs((dx - sx) - 82) > 0.01:
                fail(errors, f"header: expected separator y=226, day y=119, x offset=82; got ({sx:.3f}, {sy:.3f}) and ({dx:.3f}, {dy:.3f})")

    if errors:
        print("FAIL: 睿丛咨询日签字体/间距合同未通过", file=sys.stderr)
        print("\n".join(f"- {error}" for error in errors), file=sys.stderr)
        return 1

    print("PASS: 月份资产、字体、字号、字重、元数据行距、正文与页脚字距、页脚行距及页眉位置均符合固定合同")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
