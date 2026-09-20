#!/usr/bin/env python3
"""Offline checks for generated content, route integrity, citations and local links."""
from collections import Counter
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.links, self.cites, self.counts = [], [], [], {}
        self.count_key = None
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            self.ids.append(a['id'])
        if tag in ('a', 'link', 'script', 'img'):
            value = a.get('href') or a.get('src')
            if value:
                self.links.append(value)
        if tag == 'cite':
            self.cites.append(a.get('data-source'))
        if 'data-count' in a:
            self.count_key = a['data-count']
    def handle_endtag(self, tag):
        if tag == 'span':
            self.count_key = None
    def handle_data(self, text):
        if self.count_key:
            self.counts[self.count_key] = text.strip()


def main():
    subprocess.run([sys.executable, str(ROOT / 'scripts/build_research.py'), '--check'], check=True)
    site = json.loads((ROOT / 'content/site-data.json').read_text())
    chapters = list(site['chapters'])
    after = next(i for i, chapter in enumerate(chapters) if chapter['id'] == 'carriers') + 1
    additions = json.loads((ROOT / 'content/research-chapters.json').read_text())
    additions += json.loads((ROOT / 'content/capstone-chapters.json').read_text())
    chapters[after:after] = additions
    data = {
        'chapters': chapters,
        'groups': len(site['packageGroups']),
        'packages': sum(len(group['pkgs']) for group in site['packageGroups']),
        'quiz': len(site['quiz']),
    }
    text = (ROOT / 'index.html').read_text()
    page = Page(); page.feed(text)
    ids = set(page.ids)
    routes = [c['id'] for c in data['chapters']] + ['lc']
    errors = []
    for id, count in Counter(page.ids).items():
        if count > 1:
            errors.append('Duplicate HTML ID: ' + id)
    if len(routes) != len(set(routes)):
        errors.append('Duplicate route ID')
    for route in routes:
        if 'ch-' + route not in ids:
            errors.append('Missing route section: ' + route)
    def check_link(link, path):
        parts = urlsplit(link)
        if parts.scheme or parts.netloc:
            return
        if link.startswith('#/'):
            if link[2:] not in routes:
                errors.append('Unknown route: ' + link)
        elif not parts.path and parts.fragment:
            if parts.fragment not in ids:
                errors.append('Unknown HTML fragment: ' + link)
        elif parts.path:
            target = (path.parent / unquote(parts.path)).resolve()
            if not target.exists():
                errors.append(str(path.relative_to(ROOT)) + ': missing local link ' + link)
    for link in page.links:
        check_link(link, ROOT / 'index.html')
    # Respect .gitignore: dependency docs, build output and research scratchpads
    # are not maintained site content. Include new, not-yet-staged Markdown too.
    markdown = subprocess.check_output(
        ['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', '*.md'],
        cwd=ROOT, text=True,
    )
    for name in filter(None, markdown.split('\0')):
        md = ROOT / name
        for link in re.findall(r'\]\(([^\s)]+)\)', md.read_text()):
            check_link(link, md)
    sources = json.loads((ROOT / 'content/sources.json').read_text())
    source_ids = {s['id'] for s in sources}
    for citation in page.cites:
        if citation not in source_ids:
            errors.append('Unknown source: ' + str(citation))
    for s in sources:
        if not all(s.get(k) for k in ('title', 'url', 'version', 'checked_at', 'scope')):
            errors.append('Incomplete source: ' + s['id'])
    for key in ('groups', 'packages', 'quiz'):
        if page.counts.get(key) != str(data[key]):
            errors.append('Stale static count fallback: ' + key)
    # Guard specific corrected assertions; not a generic semantic fact checker.
    combined = text + (ROOT / 'content/site-data.json').read_text() + (ROOT / 'README.md').read_text()
    for claim in ('唯一把运行时自改', '分数 × 已有子代数', '最难作弊(要长期养出好后代)', '同时破掉相邻两层才算'):
        if claim in combined:
            errors.append('Corrected assertion reintroduced: ' + claim)
    if errors:
        raise SystemExit('\n'.join(errors))
    print(f"Content checks passed: {len(data['chapters'])} navigation entries, {len(sources)} sources, {len(page.links)} HTML links.")


if __name__ == '__main__':
    main()
