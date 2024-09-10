/**
 * @jest-environment node
 */
import grapesjs, { Editor } from '../../../src';

describe('GrapesJS Headless', () => {
  test('Can init and destroy an editor', () => {
    const editor = grapesjs.init({ headless: true });
    expect(editor).toBeTruthy();
    editor.destroy();
  });

  describe('Headless operations', () => {
    let editor: Editor;
    const cmpObj = {
      attributes: { test: 'value', class: 'cls' },
      components: { type: 'textnode', content: 'Test' },
    };
    const cmpStr = '<div test="value" class="cls">Test</div>';
    const fullHtml = `<body>${cmpStr}</body>`;
    const styleObj = {
      selectors: [{ name: 'cls' }],
      style: { color: 'red' },
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
      expect(editor.getHtml()).toBe(fullHtml);
      expect(editor.getCss()).toBe(''); // same as default
    });

    test('Add components with children', () => {
      const res = editor.addComponents([
        {
          tagName: 'h1',
          type: 'text',
          components: [
            {
              type: 'textnode',
              removable: false,
              draggable: false,
              highlightable: 0,
              copyable: false,
              selectable: true,
              content: 'Hello!',
              _innertext: false,
            },
          ],
        },
      ]);
      expect(res.length).toBe(1);
      const resHtml = '<h1>Hello!</h1>';
      const comp = res[0];
      expect(comp.toHTML()).toBe(resHtml);
      expect(editor.Selectors.getAll().length).toBe(0);
      expect(editor.Css.getAll().length).toBe(0);
      expect(editor.getHtml()).toBe(`<body>${resHtml}</body>`);
      expect(editor.getCss()).toBe('');
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
        styles: [styleObj],
      });
      expect(editor.Selectors.getAll().length).toBe(1);
      expect(editor.getHtml()).toBe(fullHtml);
      expect(editor.getCss()).toBe(styleStr);
    });

    test('loadProjectData with different components', () => {
      editor.loadProjectData({
        pages: [
          {
            frames: [
              {
                component: {
                  type: 'wrapper',
                  attributes: { id: 'wrapper-id' },
                  components: [
                    {
                      type: 'text',
                      attributes: { id: 'text-id' },
                      components: [{ type: 'textnode', content: 'Hello world!' }],
                    },
                    {
                      type: 'image',
                      attributes: { id: 'image-id' },
                    },
                    {
                      type: 'video',
                      attributes: { id: 'video-id' },
                    },
                    {
                      type: 'map',
                      attributes: { id: 'map-id' },
                    },
                  ],
                },
              },
            ],
            id: 'page-id',
          },
        ],
      });

      expect(editor.getHtml()).toBeDefined();
      expect(editor.getCss()).toBeDefined();
    });
  });
});
