/**
 * @jest-environment node
 */

describe('GrapesJS Headless', () => {
  test('Can init and destroy an editor', () => {
    const editor = grapesjs.init({ headless: true });
    expect(editor).toBeTruthy();
    editor.destroy();
  });

  describe('Headless operations', () => {
    let editor;
    const cmpObj = {
      attributes: { class: 'cls', test: 'value' },
      components: { type: 'textnode', content: 'Test' }
    };
    const cmpStr = '<div class="cls" test="value">Test</div>';
    const styleObj = {
      selectors: [{ name: 'cls' }],
      style: { color: 'red' }
    };
    const styleStr = '.cls{color:red;}';

    beforeEach(() => {
      editor = grapesjs.init({ headless: true, protectedCss: '' });
    });

    afterEach(() => {
      editor.destroy();
    });

    test('Add components', () => {
      const res = editor.addComponents(cmpObj);
      expect(res.length).toBe(1);
      const comp = res[0];
      expect(comp.toHTML()).toBe(cmpStr);
      expect(editor.Selectors.getAll().length).toBe(1); // 1 selector is created
      expect(editor.Css.getAll().length).toBe(0); // No CSS
      expect(editor.getHtml()).toBe(cmpStr);
      expect(editor.getCss()).toBe(''); // same as default
    });

    test('Add styles', () => {
      const res = editor.addStyle(styleObj);
      expect(res.length).toBe(1);
      const rule = res[0];
      expect(rule.toCSS()).toBe(styleStr);
      expect(editor.Selectors.getAll().length).toBe(1); // 1 selector is created
    });

    test('Load data', () => {
      editor.loadData({
        components: [cmpObj],
        styles: [styleObj]
      });
      expect(editor.Selectors.getAll().length).toBe(1);
      expect(editor.getHtml()).toBe(cmpStr);
      expect(editor.getCss()).toBe(styleStr);
    });
  });
});
