#!/usr/bin/env python3
"""Verify every public navigation chapter references at least one valid figure."""
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


class ChapterImgs(HTMLParser):
    """Collect <img> attrs per chapter section using real tag parsing."""

    def __init__(self):
        super().__init__()
        self.sections = {}
        self.current = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'section' and a.get('class') == 'chapter':
            self.current = a.get('id', '')[3:]
            self.sections[self.current] = []
        elif tag == 'img' and self.current is not None:
            self.sections[self.current].append(a)

    def handle_endtag(self, tag):
        if tag == 'section':
            self.current = None


def nav_ids():
    site = json.loads((ROOT / 'content/site-data.json').read_text())
    ids = [c['id'] for c in site['chapters'] if c['id'] != 'home']
    for manifest in ('research-chapters.json', 'capstone-chapters.json'):
        ids += [c['id'] for c in json.loads((ROOT / 'content' / manifest).read_text())]
    return ids


def check_svg(path: Path):
    try:
        root = ET.parse(path).getroot()
    except ET.ParseError as e:
        return f'invalid SVG: {e}'
    labels = (root.get('aria-labelledby') or '').split()
    ids = {el.get('id') for el in root.iter()}
    if 'title' not in labels or 'desc' not in labels or 'title' not in ids or 'desc' not in ids:
        return 'SVG lacks linked title/desc'
    return None


def main():
    parser = ChapterImgs()
    parser.feed((ROOT / 'index.html').read_text())
    errors = []
    for cid in nav_ids():
        imgs = parser.sections.get(cid)
        if imgs is None:
            errors.append(cid + ': no section in index.html')
            continue
        figs = [a for a in imgs if (a.get('src') or '').startswith('assets/figures/')]
        if not figs:
            errors.append(cid + ': no figure')
            continue
        for a in figs:
            src = a.get('src', '')
            alt = (a.get('alt') or '').strip()
            if len(alt) < 10:
                errors.append(f'{cid}: weak/missing alt on {src}')
            for attr, want in (('loading', 'lazy'), ('decoding', 'async')):
                if a.get(attr) != want:
                    errors.append(f'{cid}: img {src} missing {attr}="{want}"')
            for attr in ('width', 'height'):
                if not (a.get(attr) or '').isdigit():
                    errors.append(f'{cid}: img {src} missing numeric {attr}')
            path = ROOT / src
            if not path.exists():
                errors.append(f'{cid}: missing file {src}')
            else:
                problem = check_svg(path)
                if problem:
                    errors.append(f'{cid}: {problem} ({src})')
    figdir = ROOT / 'assets/figures'
    if figdir.exists():
        index = (ROOT / 'index.html').read_text()
        for f in sorted(figdir.iterdir()):
            if f.suffix == '.svg' and f'assets/figures/{f.name}' not in index:
                errors.append('orphan figure: ' + f.name)
    if errors:
        raise SystemExit('\n'.join(errors))
    print(f'Figure coverage OK: {len(nav_ids())} navigation chapters all reference a valid SVG.')


if __name__ == '__main__':
    main()
