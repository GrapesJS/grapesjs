import type { Editor } from 'grapesjs';
import { createEditor, createModelContext } from '../helpers';

describe('Component tools', () => {
  let editor: Editor;
  let call: ReturnType<typeof createModelContext>['call'];

  beforeEach(async () => {
    const res = await createEditor(
      {},
      {
        components: `
          <section id="sec" class="hero">
            <h1 id="title">Hello</h1>
            <p id="para">Some <b>text</b></p>
          </section>
          <div id="box"><span id="inner">Inner</span></div>
        `,
      },
    );
    editor = res.editor;
    call = (name, input, opts) => res.mc.call(`grapesjs_${name}`, input, opts);
    editor.Components.addType('locked-box', {
      model: { defaults: { droppable: false, removable: false, copyable: false } },
    });
  });

  afterEach(() => editor.destroy());

  test('get_component_tree', async () => {
    const res = await call('get_component_tree');
    expect(res.truncated).toBe(false);
    expect(res.tree.type).toBe('wrapper');
    expect(res.tree.children.map((c: any) => c.id)).toEqual(['sec', 'box']);
    expect(res.tree.children[0].children[0]).toMatchObject({ id: 'title', tagName: 'h1', type: 'text' });

    const shallow = await call('get_component_tree', { depth: 1 });
    expect(shallow.truncated).toBe(true);
    expect(shallow.tree.children[0].children).toBeUndefined();
    expect(shallow.tree.children[0].childCount).toBe(2);

    const limited = await call('get_component_tree', { maxNodes: 2 });
    expect(limited.nodeCount).toBe(2);
    expect(limited.truncated).toBe(true);

    const sub = await call('get_component_tree', { id: 'box' });
    expect(sub.tree.id).toBe('box');
  });

  test('get_component', async () => {
    const res = await call('get_component', { id: 'sec', includeHtml: true });
    expect(res).toMatchObject({
      id: 'sec',
      tagName: 'section',
      classes: ['hero'],
      parentId: editor.getWrapper()!.getId(),
      index: 0,
      pageId: editor.Pages.getSelected()!.getId(),
    });
    expect(res.children.map((c: any) => c.id)).toEqual(['title', 'para']);
    expect(res.html).toContain('<h1 id="title">Hello</h1>');
  });

  test('find_components', async () => {
    expect((await call('find_components', { selector: '.hero h1' })).items.map((c: any) => c.id)).toEqual(['title']);
    expect((await call('find_components', { tagName: 'SPAN' })).items[0].id).toBe('inner');
    expect((await call('find_components', { text: 'inner', type: 'text' })).items.map((c: any) => c.id)).toEqual([
      'inner',
    ]);
    expect((await call('find_components', { className: 'hero' })).total).toBe(1);
    expect((await call('find_components', { attributes: { id: 'para' } })).items[0].id).toBe('para');
    expect((await call('find_components', { rootId: 'box' })).items.map((c: any) => c.id)).toEqual(['inner']);
    const page = await call('find_components', { limit: 2, offset: 1 });
    expect(page).toMatchObject({ offset: 1, hasMore: true });
    expect(page.items).toHaveLength(2);
    expect(await call('find_components', { selector: '!!' })).toMatchObject({ error: { code: 'invalid_input' } });
  });

  test('find_components works on non selected pages', async () => {
    const page = editor.Pages.add({ id: 'other', component: '<div id="far">Far</div>' })!;
    const wrapperId = page.getMainComponent().getId();
    const res = await call('find_components', { rootId: wrapperId, selector: '#far' });
    expect(res.items.map((c: any) => c.id)).toEqual(['far']);
  });

  test('find_components reflects manual edits', async () => {
    editor.getWrapper()!.append('<article id="manual">New</article>');
    expect((await call('find_components', { selector: 'article' })).items[0].id).toBe('manual');
  });

  test('list_component_types and select_components', async () => {
    const { types } = await call('list_component_types');
    expect(types).toEqual(expect.arrayContaining(['text', 'image', 'locked-box']));
    expect(await call('select_components', { ids: ['title', 'box'] })).toEqual({ selected: ['title', 'box'] });
    expect(editor.getSelectedAll().map((c) => c.getId())).toEqual(['title', 'box']);
    expect(await call('select_components', { ids: [] })).toEqual({ selected: [] });
  });

  test('add_components', async () => {
    const res = await call('add_components', {
      parentId: 'box',
      at: 0,
      components: ['<a id="link" href="/x">Link</a>', { type: 'text', content: 'Def', attributes: { id: 'def' } }],
      select: true,
    });
    expect(res.added.map((c: any) => c.id)).toEqual(['link', 'def']);
    expect(
      editor.Components.getById('box')!
        .components()
        .map((c) => c.getId()),
    ).toEqual(['link', 'def', 'inner']);
    expect(editor.getSelectedAll()).toHaveLength(2);

    // Defaults to the page wrapper
    const res2 = await call('add_components', { components: '<footer>F</footer>' });
    expect(editor.getWrapper()!.components().last().getId()).toBe(res2.added[0].id);

    expect(await call('add_components', { parentId: 'box', at: 10, components: '<i></i>' })).toMatchObject({
      error: { code: 'invalid_input' },
    });
  });

  test('add_components respects droppable constraints', async () => {
    editor.getWrapper()!.append({ type: 'locked-box', attributes: { id: 'locked' } });
    const res = await call('add_components', { parentId: 'locked', components: '<div>X</div>' });
    expect(res).toMatchObject({ error: { code: 'invalid_destination' } });
    expect(editor.Components.getById('locked')!.components().length).toBe(0);
  });

  test('update_component', async () => {
    const res = await call('update_component', {
      id: 'title',
      attributes: { title: 'Main', 'data-x': 1 },
      content: 'New <b>title</b>',
      name: 'Heading',
    });
    expect(res.attributes).toMatchObject({ title: 'Main', 'data-x': 1 });
    expect(res.name).toBe('Heading');
    expect(editor.Components.getById('title')!.toHTML()).toContain('New <b>title</b>');

    await call('update_component', { id: 'title', removeAttributes: ['title'] });
    expect(editor.Components.getById('title')!.getAttributes().title).toBeUndefined();

    expect(await call('update_component', { id: 'title', attributes: { class: 'x' } })).toMatchObject({
      error: { code: 'invalid_input' },
    });
  });

  test('clone_component', async () => {
    const res = await call('clone_component', { id: 'title' });
    const sec = editor.Components.getById('sec')!;
    expect(sec.components().at(1).getId()).toBe(res.clone.id);
    expect(res.clone.id).not.toBe('title');

    const res2 = await call('clone_component', { id: 'title', parentId: 'box', at: 0 });
    expect(editor.Components.getById('box')!.components().at(0).getId()).toBe(res2.clone.id);

    editor.getWrapper()!.append({ type: 'locked-box', attributes: { id: 'locked' } });
    expect(await call('clone_component', { id: 'locked' })).toMatchObject({ error: { code: 'not_allowed' } });
  });

  test('move_component', async () => {
    const res = await call('move_component', { id: 'title', parentId: 'box', at: 1 });
    expect(res).toMatchObject({ parentId: 'box', index: 1 });
    expect(
      editor.Components.getById('box')!
        .components()
        .map((c) => c.getId()),
    ).toEqual(['inner', 'title']);
  });

  test('move_component rejects invalid destinations', async () => {
    expect(await call('move_component', { id: 'sec', parentId: 'title' })).toMatchObject({
      error: { code: 'invalid_destination', message: expect.stringContaining('descendants') },
    });
    expect(await call('move_component', { id: 'sec', parentId: 'sec' })).toMatchObject({
      error: { code: 'invalid_destination' },
    });
    expect(await call('move_component', { id: editor.getWrapper()!.getId(), parentId: 'box' })).toMatchObject({
      error: {},
    });
    expect(editor.Components.getById('sec')!.parent()).toBe(editor.getWrapper());
  });

  test('remove_components and stale ids', async () => {
    expect(await call('remove_components', { ids: ['para', 'box'] })).toEqual({ removed: ['para', 'box'] });
    expect(editor.getHtml()).not.toContain('para');
    expect(await call('get_component', { id: 'para' })).toMatchObject({ error: { code: 'not_found' } });
    // Stale id removed manually
    editor.Components.getById('title')!.remove();
    expect(await call('update_component', { id: 'title', attributes: { a: '1' } })).toMatchObject({
      error: { code: 'not_found' },
    });

    editor.getWrapper()!.append({ type: 'locked-box', attributes: { id: 'locked' } });
    expect(await call('remove_components', { ids: ['locked'] })).toMatchObject({ error: { code: 'not_allowed' } });
    expect(await call('remove_components', { ids: [] })).toMatchObject({ error: { code: 'invalid_input' } });
  });

  test('Changes are undoable', async () => {
    await call('remove_components', { ids: ['box'] });
    expect(editor.Components.getById('box')).toBeFalsy();
    expect(await call('undo')).toMatchObject({ undone: 1, hasRedo: true });
    expect((await call('get_component', { id: 'box' })).id).toBe('box');
    await call('redo');
    expect(await call('get_component', { id: 'box' })).toMatchObject({ error: { code: 'not_found' } });
  });
});
