import Editor from '../../../src/editor/model/Editor';

describe('Parser module', () => {
  let em: Editor;

  beforeEach(() => {
    em = new Editor({});
  });

  afterEach(() => {
    em.destroy();
  });

  test('adds, gets, removes code parsers and selects them by default', () => {
    const parse = jest.fn(() => []);
    const parser = em.Parser.addParserCode('test-parser', parse);

    expect(parser).toEqual({
      id: 'test-parser',
      parse,
    });
    expect(em.Parser.getParserCode('test-parser')).toBe(parser);
    expect(em.Parser.parserCode).toBe('test-parser');
    expect(em.Parser.removeParserCode('test-parser')).toBe(parser);
    expect(em.Parser.getParserCode('test-parser')).toBeUndefined();
    expect(em.Parser.parserCode).toBe('');
  });

  test('loads code parsers from init config and selects the last one by default', () => {
    const first = jest.fn(() => []);
    const second = jest.fn(() => []);
    const editor = new Editor({
      parser: {
        parsersCode: {
          first,
          second,
        },
      },
    });

    expect(editor.Parser.getParserCode('first')?.parse).toBe(first);
    expect(editor.Parser.getParserCode('second')?.parse).toBe(second);
    expect(editor.Parser.parserCode).toBe('second');

    editor.destroy();
  });

  test('allows init config to skip selecting a default parser', () => {
    const editor = new Editor({
      parser: {
        parserCode: '',
        parsersCode: {
          first: () => [],
          second: () => [],
        },
      },
    });

    expect(editor.Parser.parserCode).toBe('');

    editor.destroy();
  });

  test('supports global parserCode, per-call overrides, and legacy fallback', () => {
    em.Parser.addParserCode('section-parser', () => [{ nodeType: 1, tagName: 'section' }]);
    em.Parser.addParserCode('article-parser', () => [{ nodeType: 1, tagName: 'article' }], { skipSelect: true });

    expect(em.Parser.parseHtml('<div></div>').html).toEqual({ tagName: 'section' });
    expect(em.Parser.parseHtml('<div></div>', { parserCode: 'article-parser' }).html).toEqual({ tagName: 'article' });
    expect(em.Parser.parseHtml('<div></div>', { parserCode: '' }).html).toEqual({ tagName: 'div' });
    expect(() => em.Parser.parseHtml('<div></div>', { parserCode: 'missing-parser' })).toThrow(
      'Parser code "missing-parser" not found',
    );
  });
});
