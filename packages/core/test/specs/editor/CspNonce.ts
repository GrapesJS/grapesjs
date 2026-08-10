import Editor from '../../../src/editor';
import EditorModel from '../../../src/editor/model/Editor';
import BrowserParserCss from '../../../src/parser/model/BrowserParserCss';
import { setupTestEditor } from '../../common';

const NONCE = 'test-nonce-123';

const getStyleEls = (em: EditorModel) => {
  const docs = [document, em.Canvas.getDocument()].filter(Boolean) as Document[];
  return docs.reduce<HTMLStyleElement[]>((res, doc) => res.concat(Array.from(doc.querySelectorAll('style'))), []);
};

describe('CSP nonce', () => {
  let editor: Editor;
  let em: EditorModel;

  const setup = (cspNonce?: string) => {
    ({ editor, em } = setupTestEditor({ withCanvas: true, config: { cspNonce } }));
    editor.setComponents('<div class="cmp">Hello</div>');
    editor.setStyle('.cmp { color: red; } @media (max-width: 480px) { .cmp { color: blue } }');
    em.Css.addRules('@keyframes anim { from { opacity: 0 } to { opacity: 1 } }');
  };

  afterEach(() => {
    em?.destroy();
  });

  describe('with cspNonce set', () => {
    beforeEach(() => setup(NONCE));

    test('every style element created by the editor carries the nonce', () => {
      const els = getStyleEls(em);
      expect(els.length).toBeGreaterThan(0);
      els.forEach((el) => expect(el.getAttribute('nonce')).toBe(NONCE));
    });

    test('canvas style element carries the nonce', () => {
      const el = document.querySelector('[data-canvas-style]');
      expect(el).toBeTruthy();
      expect(el!.getAttribute('nonce')).toBe(NONCE);
    });

    test('frame base styles carry the nonce', () => {
      const doc = em.Canvas.getDocument()!;
      const el = doc.body.querySelector('style');
      expect(el).toBeTruthy();
      expect(el!.getAttribute('nonce')).toBe(NONCE);
    });

    test('each CSS rule style element carries the nonce', () => {
      const doc = em.Canvas.getDocument()!;
      const els = Array.from(doc.querySelectorAll('style')).filter((el) => el.innerHTML.includes('.cmp'));
      expect(els.length).toBeGreaterThan(0);
      els.forEach((el) => expect(el.getAttribute('nonce')).toBe(NONCE));
    });

    test('the CSS parser sets the nonce on its temporary style element', () => {
      const nonces: (string | null)[] = [];
      const appendChild = jest.spyOn(document.head, 'appendChild').mockImplementation(<T extends Node>(node: T) => {
        nonces.push((node as unknown as HTMLElement).getAttribute?.('nonce') ?? null);
        return node;
      });
      const removeChild = jest.spyOn(document.head, 'removeChild').mockImplementation(<T extends Node>(n: T) => n);

      em.Parser.parseCss('.parsed { color: green }');

      appendChild.mockRestore();
      removeChild.mockRestore();
      expect(nonces).toEqual([NONCE]);
    });
  });

  describe('without cspNonce', () => {
    beforeEach(() => setup());

    test('no style element gets a nonce attribute', () => {
      const els = getStyleEls(em);
      expect(els.length).toBeGreaterThan(0);
      els.forEach((el) => expect(el.hasAttribute('nonce')).toBe(false));
    });

    test('canvas style element is still created', () => {
      expect(document.querySelector('[data-canvas-style]')).toBeTruthy();
    });
  });

  describe('BrowserParserCss', () => {
    test('parses CSS and applies the nonce to the temporary style element', () => {
      const create = jest.spyOn(document, 'createElement');
      const res = BrowserParserCss('.a { color: red }', NONCE);
      const el = create.mock.results.find((r) => (r.value as HTMLElement).tagName === 'STYLE')!
        .value as HTMLStyleElement;
      create.mockRestore();

      expect(el.getAttribute('nonce')).toBe(NONCE);
      expect(res).toEqual([expect.objectContaining({ selectors: ['a'] })]);
    });

    test('omits the nonce attribute when none is given', () => {
      const create = jest.spyOn(document, 'createElement');
      BrowserParserCss('.a { color: red }');
      const el = create.mock.results.find((r) => (r.value as HTMLElement).tagName === 'STYLE')!
        .value as HTMLStyleElement;
      create.mockRestore();

      expect(el.hasAttribute('nonce')).toBe(false);
    });
  });
});
