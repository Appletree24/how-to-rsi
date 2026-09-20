#!/usr/bin/env python3
"""Lint figure SVGs against the fig-contract palette and structure rules."""
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PALETTE = {
    '#faf9f6', '#2b5bd7', '#f1f4fb', '#8c9cbd', '#40587f',
    '#ffffff', '#fff', '#bfc3c9', '#22252a', '#5e625f', '#222', 'none',
    # neutral grays already used by committed eval figures (axes, grid, ticks)
    '#a9b2c2', '#555e6b', '#dddfe3', '#858b93', '#d9dce1',
}
NS = '{http://www.w3.org/2000/svg}'
BAD_TAGS = {'script', 'image', 'foreignObject', 'iframe', 'video', 'audio'}


def lint(path: Path):
    errors = []
    try:
        tree = ET.parse(path)
    except ET.ParseError as e:
        return [f'not parseable XML: {e}']
    root = tree.getroot()
    if root.get('role') != 'img':
        errors.append('missing role="img"')
    labels = (root.get('aria-labelledby') or '').split()
    ids = {el.get('id') for el in root.iter()}
    for want in ('title', 'desc'):
        if want not in labels or want not in ids:
            errors.append(f'missing linked <{want}>')
    for el in root.iter():
        tag = el.tag.replace(NS, '')
        if tag in BAD_TAGS:
            errors.append(f'forbidden element <{tag}>')
        for attr in ('fill', 'stroke'):
            for color in re.findall(rf'{attr}="(#[0-9a-fA-F]{{3,6}}|none)"', ''.join(f'{k}="{v}"' for k, v in el.attrib.items())):
                if color.lower() not in PALETTE:
                    errors.append(f'off-palette {attr}={color} in <{tag}>')
        style = el.get('style', '')
        for color in re.findall(r'(?:fill|stroke):\s*(#[0-9a-fA-F]{3,6})', style):
            if color.lower() not in PALETTE:
                errors.append(f'off-palette style {color} in <{tag}>')
        if 'href' in el.attrib or el.get(f'{{http://www.w3.org/1999/xlink}}href'):
            errors.append(f'external reference in <{tag}>')
    if root.get('width') != '840':
        errors.append(f"width is {root.get('width')}, expected 840")
    texts = sum(1 for el in root.iter() if el.tag == NS + 'text')
    if texts > 40:
        errors.append(f'{texts} text nodes; likely overcrowded')
    return errors


def main():
    figdir = ROOT / 'assets/figures'
    bad = 0
    for path in sorted(figdir.glob('*.svg')):
        problems = lint(path)
        status = 'OK' if not problems else 'FAIL'
        if problems:
            bad += 1
        print(f'{status} {path.name}' + ('' if not problems else ' :: ' + '; '.join(problems)))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
