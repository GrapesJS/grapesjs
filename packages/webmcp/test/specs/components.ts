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

  test('get_components tree', async () => {
    // Only the root by default
    const root = await call('get_components');
    expect(root).toMatchObject({ total: 1, truncated: true });
    expect(root.items[0]).toMatchObject({ type: 'wrapper', childCount: 2 });
    expect(root.items[0].children).toBeUndefined();

    const res = await call('get_components', { depth: 4 });
    expect(res.truncated).toBe(false);
    const [wrapper] = res.items;
    expect(wrapper.children.map((c: any) => c.id)).toEqual(['sec', 'box']);
    expect(wrapper.children[0].children[0]).toMatchObject({ id: 'title', tagName: 'h1', type: 'text' });

    const shallow = await call('get_components', { depth: 1 });
    expect(shallow.truncated).toBe(true);
    expect(shallow.items[0].children[0].children).toBeUndefined();
    expect(shallow.items[0].children[0].childCount).toBe(2);

    const limited = await call('get_components', { depth: 4, maxNodes: 1 });
    expect(limited.items[0].children.map((c: any) => c.id)).toEqual(['sec']);
    expect(limited.truncated).toBe(true);

    const sub = await call('get_components', { rootId: 'box', depth: 1 });
    expect(sub.items[0]).toMatchObject({ id: 'box', children: [{ id: 'inner' }] });
  });

  test('get_components by ids with details', async () => {
    const res = await call('get_components', { ids: ['sec', 'box'], details: true, includeHtml: true });
    expect(res.items[0]).toMatchObject({
      id: 'sec',
      tagName: 'section',
      attributes: { id: 'sec', class: 'hero' },
      childCount: 2,
      parentId: editor.getWrapper()!.getId(),
      index: 0,
      pageId: editor.Pages.getSelected()!.getId(),
      flags: { removable: true },
      html: expect.stringContaining('<section'),
    });
    expect(res.items[1]).toMatchObject({ id: 'box', index: 1 });
    expect(res.items[0].children).toBeUndefined();
  });

  test('get_components with where', async () => {
    const ids = async (where: Record<string, any>, opts = {}) =>
      (await call('get_components', { where, ...opts })).items.map((c: any) => c.id);

    expect(await ids({ tagName: 'H1' })).toEqual(['title']);
    expect(await ids({ classes: ['hero'] })).toEqual(['sec']);
    expect(await ids({ attributes: { id: 'para' } })).toEqual(['para']);
    expect(await ids({ attributes: { class: true } })).toEqual(['sec']);
    // The text content includes the children
    expect(await ids({ text: 'some TEXT' })).toEqual([editor.getWrapper()!.getId(), 'sec', 'para']);
    expect(await ids({ text: 'some text', tagName: 'p' })).toEqual(['para']);
    expect(await ids({ type: 'text', text: 'inner' })).toEqual(['inner']);
    expect(await ids({ tagName: 'span' }, { rootId: 'sec' })).toEqual([]);
    expect(await ids({ tagName: 'nope' })).toEqual([]);

    const res = await call('get_components', { where: { tagName: 'section' }, depth: 1 });
    expect(res).toMatchObject({ total: 1, hasMore: false });
    expect(res.items[0].children.map((c: any) => c.id)).toEqual(['title', 'para']);
  });

  test('get_components with pages and invalid targets', async () => {
    editor.Pages.add({ id: 'about', component: '<h2 id="about-title">About</h2>' });
    expect((await call('get_components', { pageId: 'about', where: { tagName: 'h2' } })).items).toEqual([
      expect.objectContaining({ id: 'about-title' }),
    ]);
    expect((await call('get_components', { where: { tagName: 'h2' } })).items).toEqual([]);
    expect(await call('get_components', { pageId: 'nope' })).toMatchObject({ error: { code: 'not_found' } });
    expect(await call('get_components', { ids: ['sec'], where: { tagName: 'h1' } })).toMatchObject({
      error: { code: 'invalid_input' },
    });
    expect(await call('get_components', { rootId: 'sec', pageId: 'about' })).toMatchObject({
      error: { code: 'invalid_input' },
    });
  });

  test('select_components', async () => {
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

  test('update_components', async () => {
    const res = await call('update_components', {
      updates: [
        { id: 'title', attributes: { title: 'Main', 'data-x': 1 }, content: 'New <b>title</b>', name: 'Heading' },
        { id: 'para', attributes: { title: 'Para' } },
      ],
    });
    expect(res.updated).toEqual([
      expect.objectContaining({
        id: 'title',
        name: 'Heading',
        attributes: expect.objectContaining({ title: 'Main', 'data-x': 1 }),
      }),
      expect.objectContaining({ id: 'para', attributes: expect.objectContaining({ title: 'Para' }) }),
    ]);
    expect(editor.Components.getById('title')!.toHTML()).toContain('New <b>title</b>');

    await call('update_components', { updates: [{ id: 'title', removeAttributes: ['title'] }] });
    expect(editor.Components.getById('title')!.getAttributes().title).toBeUndefined();
    expect(await call('update_components', { updates: [] })).toMatchObject({ error: { code: 'invalid_input' } });
  });

  test('update_components updates nothing if a component is missing', async () => {
    const res = await call('update_components', {
      updates: [
        { id: 'title', attributes: { title: 'Main' } },
        { id: 'nope', attributes: { title: 'Nope' } },
      ],
    });
    expect(res).toMatchObject({ error: { code: 'not_found' } });
    expect(editor.Components.getById('title')!.getAttributes().title).toBeUndefined();
  });

  test('update_components handles class, style and id attributes', async () => {
    const update = async (data: Record<string, any>) =>
      (await call('update_components', { updates: [{ id: 'box', ...data }] })).updated[0];
    let res = await update({ attributes: { class: 'card card--big', style: 'color: red; padding: 10px' } });
    // With avoidInlineStyle (default) styles are stored in the #id CSS rule, not in attributes
    expect(res.attributes).toEqual({ id: 'box', class: 'card card--big' });
    const box = editor.Components.getById('box')!;
    expect(box.getClasses()).toEqual(['card', 'card--big']);
    expect(editor.getCss()).toContain('#box{color:red;padding:10px;}');

    // Other attributes don't affect classes and styles
    res = await update({ attributes: { title: 'Box' } });
    expect(res.attributes).toEqual({ id: 'box', class: 'card card--big', title: 'Box' });
    expect(editor.getCss()).toContain('#box{color:red;padding:10px;}');

    res = await update({ removeAttributes: ['class', 'style'] });
    expect(res.attributes).toEqual({ id: 'box', title: 'Box' });
    expect(box.getClasses()).toEqual([]);
    expect(editor.getCss()).not.toContain('#box');

    res = await update({ attributes: { id: 'new-box' } });
    expect(res.id).toBe('new-box');
    expect(editor.getHtml()).toContain('id="new-box"');
  });

  test('update_components replaces content without structure checks', async () => {
    editor.getWrapper()!.append({ type: 'locked-box', attributes: { id: 'locked' } });
    await call('update_components', { updates: [{ id: 'locked', content: '<span>Inside</span>' }] });
    expect(editor.Components.getById('locked')!.toHTML()).toContain('<span>Inside</span>');
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
    expect(await call('get_components', { ids: ['para'] })).toMatchObject({ error: { code: 'not_found' } });
    // Stale id removed manually
    editor.Components.getById('title')!.remove();
    expect(await call('update_components', { updates: [{ id: 'title', attributes: { a: '1' } }] })).toMatchObject({
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
    expect((await call('get_components', { ids: ['box'] })).items[0].id).toBe('box');
    await call('redo');
    expect(await call('get_components', { ids: ['box'] })).toMatchObject({ error: { code: 'not_found' } });
  });
});
