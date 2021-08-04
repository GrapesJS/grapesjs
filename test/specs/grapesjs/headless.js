/**
 * @jest-environment node
 */
let editor;

describe('GrapesJS Headless', () => {
  test('Can init and destroy an editor', () => {
    const editor = grapesjs.init({ headless: true });
    expect(editor).toBeTruthy();
    editor.destroy();
  });

  describe('Headless operations', () => {
    beforeEach(() => {
      editor = grapesjs.init({ headless: true });
    });

    afterEach(() => {
      editor.destroy();
    });

    test('Add components', () => {
      const res = editor.addComponents({
        attributes: { class: 'cls', test: 'value' },
        components: { type: 'textnode', content: 'Test' }
      });
      expect(res.length).toBe(1);
      const comp = res[0];
      const resultHTML = '<div class="cls" test="value">Test</div>';
      expect(comp.toHTML()).toBe(resultHTML);
      expect(editor.Selectors.getAll().length).toBe(1); // 1 selector is created
      expect(editor.Css.getAll().length).toBe(0); // No CSS
      expect(editor.getHtml()).toBe(resultHTML);
      expect(editor.getCss()).toBe(editor.getConfig().protectedCss); // same as default
    });

    test('Add styles', () => {
      const res = editor.addStyle({
        selectors: [{ name: 'gjs-row' }],
        style: { color: 'red' }
      });
      expect(res.length).toBe(1);
      const rule = res[0];
      const result = '.gjs-row{color:red;}';
      expect(rule.toCSS()).toBe(result);
      expect(editor.Selectors.getAll().length).toBe(1); // 1 selector is created
    });
  });
});
