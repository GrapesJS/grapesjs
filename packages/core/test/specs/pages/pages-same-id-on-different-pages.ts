import Editor from '../../../src/editor';
import EditorModel from '../../../src/editor/model/Editor';
import ComponentWrapper from '../../../src/dom_components/model/ComponentWrapper';
import { setupTestEditor } from '../../common';

describe('Pages with same component ids across pages', () => {
  let editor: Editor;
  let em: EditorModel;
  let pm: Editor['Pages'];
  let domc: Editor['Components'];
  const rootDefaultProps = {
    type: 'wrapper',
    head: { type: 'head' },
    docEl: { tagName: 'html' },
    stylable: [
      'background',
      'background-color',
      'background-image',
      'background-repeat',
      'background-attachment',
      'background-position',
      'background-size',
    ],
  };

  const getTitle = (wrapper: ComponentWrapper) => wrapper.components().at(0);

  const getRootComponent = ({ idBody = 'body', idTitle = 'main-title', contentTitle = 'A' } = {}) => ({
    type: 'wrapper',
    attributes: { id: idBody },
    components: [
      {
        tagName: 'h1',
        type: 'text',
        attributes: { id: idTitle },
        components: [{ type: 'textnode', content: contentTitle }],
      },
    ],
  });

  beforeEach(() => {
    ({ editor } = setupTestEditor());
    em = editor.getModel();
    pm = em.Pages;
    domc = em.Components;
  });

  afterEach(() => {
    editor.destroy();
  });

  test('Default behavior with pages having components with same ids are incremented', () => {
    editor.Pages.add({
      id: 'page1',
      frames: [{ component: getRootComponent() }],
    });
    editor.Pages.add({
      id: 'page2',
      frames: [{ component: getRootComponent({ contentTitle: 'B' }) }],
    });

    const root1 = pm.get('page1')!.getMainComponent();
    const root2 = pm.get('page2')!.getMainComponent();

    expect(editor.getHtml({ component: root1 })).toBe('<body id="body"><h1 id="main-title">A</h1></body>');
    expect(editor.getHtml({ component: root2 })).toBe('<body id="body-2"><h1 id="main-title-2">B</h1></body>');

    expect(JSON.parse(JSON.stringify(root1))).toEqual({
      ...rootDefaultProps,
      attributes: { id: 'body' },
      components: [
        {
          tagName: 'h1',
          type: 'text',
          attributes: { id: 'main-title' },
          components: [{ type: 'textnode', content: 'A' }],
        },
      ],
    });

    expect(JSON.parse(JSON.stringify(root2))).toEqual({
      ...rootDefaultProps,
      attributes: { id: 'body-2' },
      components: [
        {
          tagName: 'h1',
          type: 'text',
          attributes: { id: 'main-title-2' },
          components: [{ type: 'textnode', content: 'B' }],
        },
      ],
    });
  });

  test('Handles pages with components having the same id across pages', () => {
    editor.Components.config.keepAttributeIdsCrossPages = true;
    editor.Pages.add({
      id: 'page1',
      frames: [{ component: getRootComponent() }],
    });
    editor.Pages.add({
      id: 'page2',
      frames: [{ component: getRootComponent({ contentTitle: 'B' }) }],
    });
    const page1 = pm.get('page1')!;
    const page2 = pm.get('page2')!;
    const root1 = page1.getMainComponent();
    const root2 = page2.getMainComponent();

    expect(root1.getId()).toBe('body');
    expect(root2.getId()).toBe('body');

    const title1 = getTitle(root1);
    const title2 = getTitle(root2);

    // IDs should be preserved per page but stored uniquely in the shared map
    expect(title1.getId()).toBe('main-title');
    expect(title2.getId()).toBe('main-title');

    const all = domc.allById();

    expect(all['body']).toBe(root1);
    expect(all['body-2']).toBe(root2);
    expect(all['main-title']).toBe(title1);
    expect(all['main-title-2']).toBe(title2);

    expect(editor.getHtml({ component: root1 })).toBe('<body id="body"><h1 id="main-title">A</h1></body>');
    expect(editor.getHtml({ component: root2 })).toBe('<body id="body"><h1 id="main-title">B</h1></body>');

    expect(JSON.parse(JSON.stringify(root1))).toEqual({
      ...rootDefaultProps,
      attributes: { id: 'body' },
      components: [
        {
          tagName: 'h1',
          type: 'text',
          attributes: { id: 'main-title' },
          components: [{ type: 'textnode', content: 'A' }],
        },
      ],
    });

    expect(JSON.parse(JSON.stringify(root2))).toEqual({
      ...rootDefaultProps,
      id: 'body-2',
      attributes: { id: 'body' },
      components: [
        {
          id: 'main-title-2',
          tagName: 'h1',
          type: 'text',
          attributes: { id: 'main-title' },
          components: [{ type: 'textnode', content: 'B' }],
        },
      ],
    });
  });
});
