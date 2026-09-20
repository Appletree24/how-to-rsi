import { readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, extname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';

const root = dirname(fileURLToPath(import.meta.url));

// Vite handles CSS, scripts and images. Preserve the separate teaching downloads
// linked from the HTML/Markdown without publishing the entire private repository.
function linkedResources(): Plugin {
  return {
    name: 'linked-teaching-resources',
    apply: 'build',
    generateBundle() {
      const entry = resolve(root, 'index.html');
      const visited = new Set<string>([entry]);
      const allowed: Record<string, true> = {
        '.md': true, '.py': true, '.json': true, '.html': true, '.svg': true,
        '.png': true, '.jpg': true, '.webp': true, '.txt': true, '.pdf': true,
      };
      const collect = (source: string, markdown: boolean): void => {
        const text = readFileSync(source, 'utf8');
        const pattern = markdown ? /\]\(([^\s)]+)\)/g : /<a\b[^>]*\bhref="([^"]+)"/g;
        for (const match of text.matchAll(pattern)) {
          const href = match[1];
          if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(href)) continue;
          const pathname = decodeURIComponent(href.split(/[?#]/)[0]);
          if (!pathname) continue;
          const target = realpathSync(resolve(href.startsWith('/') ? root : dirname(source), pathname.replace(/^\//, '')));
          const name = relative(root, target);
          if (name.startsWith('..' + sep) || name === '..' || name.split(sep).some(part => part.startsWith('.'))) {
            throw new Error(`Refusing to publish a private or external path: ${href} in ${source}`);
          }
          if (visited.has(target)) continue;
          visited.add(target);
          if (!statSync(target).isFile() || !allowed[extname(target)]) {
            throw new Error(`Unsupported teaching resource: ${href} in ${source}`);
          }
          this.emitFile({ type: 'asset', fileName: name.split(sep).join('/'), source: readFileSync(target) });
          // Linked chapter HTML is downloadable source, not a standalone page.
          // Its URLs are authored relative to index.html by the content generator.
          if (extname(target) === '.md') collect(target, true);
        }
      };
      collect(entry, false);
    },
  };
}

export default defineConfig({
  base: './',
  publicDir: false,
  plugins: [linkedResources()],
  build: { outDir: 'dist', emptyOutDir: true, sourcemap: false },
});
