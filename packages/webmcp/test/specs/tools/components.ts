import type { Editor } from 'grapesjs';
import { ToolNames } from '../../../src';
import { createEditor, createModelContext } from '../../helpers';

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
    const root = await call(ToolNames.getComponents);
    expect(root).toMatchObject({ total: 1, truncated: true });
    expect(root.items[0]).toMatchObject({ type: 'wrapper', childCount: 2 });
    expect(root.items[0].children).toBeUndefined();

    const res = await call(ToolNames.getComponents, { depth: 4 });
    expect(res.truncated).toBe(false);
    const [wrapper] = res.items;
    expect(wrapper.children.map((c: any) => c.id)).toEqual(['sec', 'box']);
    expect(wrapper.children[0].children[0]).toMatchObject({ id: 'title', tagName: 'h1', type: 'text' });

    const shallow = await call(ToolNames.getComponents, { depth: 1 });
    expect(shallow.truncated).toBe(true);
    expect(shallow.items[0].children[0].children).toBeUndefined();
    expect(shallow.items[0].children[0].childCount).toBe(2);

    const limited = await call(ToolNames.getComponents, { depth: 4, maxNodes: 1 });
    expect(limited.items[0].children.map((c: any) => c.id)).toEqual(['sec']);
    expect(limited.truncated).toBe(true);

    const sub = await call(ToolNames.getComponents, { rootId: 'box', depth: 1 });
    expect(sub.items[0]).toMatchObject({ id: 'box', children: [{ id: 'inner' }] });
  });

  test('get_components by ids with details', async () => {
    const res = await call(ToolNames.getComponents, { ids: ['sec', 'box'], details: true, includeHtml: true });
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
      (await call(ToolNames.getComponents, { where, ...opts })).items.map((c: any) => c.id);

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

    const res = await call(ToolNames.getComponents, { where: { tagName: 'section' }, depth: 1 });
    expect(res).toMatchObject({ total: 1, hasMore: false });
    expect(res.items[0].children.map((c: any) => c.id)).toEqual(['title', 'para']);
  });

  test('get_components with pages and invalid targets', async () => {
    editor.Pages.add({ id: 'about', component: '<h2 id="about-title">About</h2>' });
    expect((await call(ToolNames.getComponents, { pageId: 'about', where: { tagName: 'h2' } })).items).toEqual([
      expect.objectContaining({ id: 'about-title' }),
    ]);
    expect((await call(ToolNames.getComponents, { where: { tagName: 'h2' } })).items).toEqual([]);
    expect(await call(ToolNames.getComponents, { pageId: 'nope' })).toMatchObject({ error: { code: 'not_found' } });
    expect(await call(ToolNames.getComponents, { ids: ['sec'], where: { tagName: 'h1' } })).toMatchObject({
      error: { code: 'invalid_input' },
    });
    expect(await call(ToolNames.getComponents, { rootId: 'sec', pageId: 'about' })).toMatchObject({
      error: { code: 'invalid_input' },
    });
  });

  test('select_components', async () => {
    expect(await call(ToolNames.selectComponents, { ids: ['title', 'box'] })).toEqual({ selected: ['title', 'box'] });
    expect(editor.getSelectedAll().map((c) => c.getId())).toEqual(['title', 'box']);
    expect(await call(ToolNames.selectComponents, { ids: [] })).toEqual({ selected: [] });
  });

  test('add_components', async () => {
    const res = await call(ToolNames.addComponents, {
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
    const res2 = await call(ToolNames.addComponents, { components: '<footer>F</footer>' });
    expect(editor.getWrapper()!.components().last().getId()).toBe(res2.added[0].id);

    expect(await call(ToolNames.addComponents, { parentId: 'box', at: 10, components: '<i></i>' })).toMatchObject({
      error: { code: 'invalid_input' },
    });
  });

  test('add_components respects droppable constraints', async () => {
    editor.getWrapper()!.append({ type: 'locked-box', attributes: { id: 'locked' } });
    const res = await call(ToolNames.addComponents, { parentId: 'locked', components: '<div>X</div>' });
    expect(res).toMatchObject({ error: { code: 'invalid_destination' } });
    expect(editor.Components.getById('locked')!.components().length).toBe(0);
  });

  test('update_components', async () => {
    const res = await call(ToolNames.updateComponents, {
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

    await call(ToolNames.updateComponents, { updates: [{ id: 'title', removeAttributes: ['title'] }] });
    expect(editor.Components.getById('title')!.getAttributes().title).toBeUndefined();
    expect(await call(ToolNames.updateComponents, { updates: [] })).toMatchObject({ error: { code: 'invalid_input' } });
  });

  test('update_components updates nothing if a component is missing', async () => {
    const res = await call(ToolNames.updateComponents, {
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
      (await call(ToolNames.updateComponents, { updates: [{ id: 'box', ...data }] })).updated[0];
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
    await call(ToolNames.updateComponents, { updates: [{ id: 'locked', content: '<span>Inside</span>' }] });
    expect(editor.Components.getById('locked')!.toHTML()).toContain('<span>Inside</span>');
  });

  test('move_component', async () => {
    const res = await call(ToolNames.moveComponent, { id: 'title', parentId: 'box', at: 1 });
    expect(res).toMatchObject({ parentId: 'box', index: 1 });
    expect(
      editor.Components.getById('box')!
        .components()
        .map((c) => c.getId()),
    ).toEqual(['inner', 'title']);
  });

  test('move_component rejects invalid destinations', async () => {
    expect(await call(ToolNames.moveComponent, { id: 'sec', parentId: 'title' })).toMatchObject({
      error: { code: 'invalid_destination', message: expect.stringContaining('descendants') },
    });
    expect(await call(ToolNames.moveComponent, { id: 'sec', parentId: 'sec' })).toMatchObject({
      error: { code: 'invalid_destination' },
    });
    expect(await call(ToolNames.moveComponent, { id: editor.getWrapper()!.getId(), parentId: 'box' })).toMatchObject({
      error: {},
    });
    expect(editor.Components.getById('sec')!.parent()).toBe(editor.getWrapper());
  });

  test('remove_components and stale ids', async () => {
    expect(await call(ToolNames.removeComponents, { ids: ['para', 'box'] })).toEqual({ removed: ['para', 'box'] });
    expect(editor.getHtml()).not.toContain('para');
    expect(await call(ToolNames.getComponents, { ids: ['para'] })).toMatchObject({ error: { code: 'not_found' } });
    // Stale id removed manually
    editor.Components.getById('title')!.remove();
    expect(
      await call(ToolNames.updateComponents, { updates: [{ id: 'title', attributes: { a: '1' } }] }),
    ).toMatchObject({
      error: { code: 'not_found' },
    });

    editor.getWrapper()!.append({ type: 'locked-box', attributes: { id: 'locked' } });
    expect(await call(ToolNames.removeComponents, { ids: ['locked'] })).toMatchObject({
      error: { code: 'not_allowed' },
    });
    expect(await call(ToolNames.removeComponents, { ids: [] })).toMatchObject({ error: { code: 'invalid_input' } });
  });

  test('Changes are undoable', async () => {
    await call(ToolNames.removeComponents, { ids: ['box'] });
    expect(editor.Components.getById('box')).toBeFalsy();
    expect(await call(ToolNames.undo)).toMatchObject({ undone: 1, hasRedo: true });
    expect((await call(ToolNames.getComponents, { ids: ['box'] })).items[0].id).toBe('box');
    await call(ToolNames.redo);
    expect(await call(ToolNames.getComponents, { ids: ['box'] })).toMatchObject({ error: { code: 'not_found' } });
  });
});

describe('Component trait tools', () => {
  let editor: Editor;
  let call: ReturnType<typeof createModelContext>['call'];

  beforeEach(async () => {
    const res = await createEditor({}, { components: '<div id="box"></div><a id="link" href="/a">Link</a>' });
    editor = res.editor;
    call = (name, input, opts) => res.mc.call(`grapesjs_${name}`, input, opts);
    editor.Components.addType('cta', {
      model: {
        defaults: {
          tagName: 'button',
          variant: 'primary',
          traits: [
            { type: 'select', name: 'variant', changeProp: true, options: [{ id: 'primary' }, { id: 'secondary' }] },
            { type: 'text', name: 'title' },
          ],
        },
      },
    });
  });

  afterEach(() => editor.destroy());

  test('get_component_traits and update_component_traits', async () => {
    editor.getWrapper()!.append({ type: 'cta', attributes: { id: 'cta' } });
    const res = await call(ToolNames.getComponentTraits, { id: 'cta' });
    expect(res.traits).toEqual([
      expect.objectContaining({
        name: 'variant',
        type: 'select',
        value: 'primary',
        changeProp: true,
        options: [
          { id: 'primary', label: 'primary' },
          { id: 'secondary', label: 'secondary' },
        ],
      }),
      expect.objectContaining({ name: 'title', type: 'text' }),
    ]);

    const updated = await call(ToolNames.updateComponentTraits, {
      id: 'cta',
      values: { variant: 'secondary', title: 'Go' },
    });
    expect(updated.traits.map((t: any) => t.value)).toEqual(['secondary', 'Go']);
    const cmp = editor.Components.getById('cta')!;
    expect(cmp.get('variant')).toBe('secondary');
    expect(cmp.getAttributes().title).toBe('Go');

    expect(await call(ToolNames.updateComponentTraits, { id: 'cta', values: { variant: 'nope' } })).toMatchObject({
      error: { code: 'invalid_input' },
    });
    expect(await call(ToolNames.updateComponentTraits, { id: 'cta', values: { missing: 1 } })).toMatchObject({
      error: { code: 'not_found' },
    });
    expect(cmp.get('variant')).toBe('secondary');
  });

  test('Link traits', async () => {
    await call(ToolNames.updateComponentTraits, { id: 'link', values: { href: '/b' } });
    expect(editor.Components.getById('link')!.getAttributes().href).toBe('/b');
  });
});
