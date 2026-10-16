import fs from 'fs';
import path from 'path';

/**
 * The editor renders most of its chrome by assigning HTML strings, so a
 * `style="..."` literal in a template ends up parsed as an inline style
 * attribute, which a strict `style-src-attr` CSP blocks. The same goes for
 * `setAttribute('style', ...)`.
 *
 * CSSOM writes (`el.style.prop = value`, `setStyleText`) are not covered by CSP
 * and are the supported way to apply runtime values.
 */
const SRC_DIR = path.join(__dirname, '../../../src');

// Files allowed to keep an inline style, with the reason why
const ALLOWED: Record<string, string> = {
  'dom_components/model/ComponentImage.ts':
    'SVG placeholder serialized to a base64 data URL and used as `img` src, so it is a separate document governed by `img-src`',
  'dom_components/view/ComponentView.ts':
    'writes the style attribute of a user component, which is the content the editor exists to author (and is off by default via `avoidInlineStyle`)',
};

const PATTERNS = [
  { name: 'style attribute in markup', re: /(^|[^-\w])style\s*=\s*["'`]/ },
  { name: "setAttribute('style')", re: /setAttribute\(\s*['"`]style['"`]/ },
];

const stripComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).reduce<string[]>((res, entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return res.concat(walk(full));
    return entry.name.endsWith('.ts') ? res.concat(full) : res;
  }, []);

describe('No inline style attributes in editor markup', () => {
  test('src is free of `style=` and `setAttribute("style")`, except the documented cases', () => {
    const found: string[] = [];

    walk(SRC_DIR).forEach((file) => {
      const relative = path.relative(SRC_DIR, file).split(path.sep).join('/');
      if (ALLOWED[relative]) return;

      stripComments(fs.readFileSync(file, 'utf8'))
        .split('\n')
        .forEach((line, i) => {
          PATTERNS.forEach(({ name, re }) => {
            re.test(line) && found.push(`${relative}:${i + 1} (${name}) ${line.trim()}`);
          });
        });
    });

    expect(found).toEqual([]);
  });

  test('the allowlist only names files that exist', () => {
    Object.keys(ALLOWED).forEach((relative) => {
      expect(fs.existsSync(path.join(SRC_DIR, relative))).toBe(true);
    });
  });
});
