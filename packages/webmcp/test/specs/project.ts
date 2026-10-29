import type { Editor } from 'grapesjs';
import { createEditor, createModelContext } from '../helpers';

describe('Project tools', () => {
  let editor: Editor;
  let call: ReturnType<typeof createModelContext>['call'];

  beforeEach(async () => {
    const res = await createEditor(
      {},
      {
        components: '<div id="box" class="card">Box</div>',
        style: '.card{color:red;}',
        assetManager: { assets: ['https://example.com/a.png'] },
      },
    );
    editor = res.editor;
    call = (name, input, opts) => res.mc.call(`grapesjs_${name}`, input, opts);
  });

  afterEach(() => editor.destroy());

  test('get_editor_state', async () => {
    editor.select(editor.Components.getById('box'));
    editor.getWrapper()!.append('<p>New</p>');
    // Change tracking relies on the storage load, not available in headless tests
    editor.getModel().set('changesCount', 2);
    const res = await call('get_editor_state');
    expect(res.selectedComponents).toEqual([expect.objectContaining({ id: 'box', type: 'text' })]);
    expect(res.page.selected).toBe(true);
    expect(res.device.id).toBe('desktop');
    expect(res.dirtyCount).toBe(2);
    expect(res.hasUndo).toBe(true);
  });

  test('Pages lifecycle', async () => {
    expect((await call('list_pages')).pages).toHaveLength(1);
    const { page } = await call('add_page', { id: 'about', name: 'About', content: '<h1>About</h1>', select: true });
    expect(page).toEqual({ id: 'about', name: 'About', selected: true });
    expect(await call('add_page', { id: 'about', name: 'Dup' })).toMatchObject({ error: { code: 'invalid_input' } });
    expect((await call('get_page_code')).html).toContain('<h1');

    await call('rename_page', { id: 'about', name: 'About us' });
    expect(editor.Pages.get('about')!.getName()).toBe('About us');

    const first = editor.Pages.getAll()[0].getId();
    await call('select_page', { id: first });
    expect(editor.Pages.getSelected()!.getId()).toBe(first);
    expect((await call('get_page_code', { pageId: 'about' })).html).toContain('About');

    await call('select_page', { id: 'about' });
    expect(await call('remove_page', { id: 'about' })).toEqual({ removed: 'about' });
    expect(editor.Pages.getSelected()!.getId()).toBe(first);
    expect(await call('remove_page', { id: first })).toMatchObject({ error: { code: 'not_allowed' } });
  });

  test('remove_page reports aborted removals', async () => {
    editor.Pages.add({ id: 'p2' });
    editor.on('page:remove:before', (_page: any, _rm: any, opts: any) => (opts.abort = true));
    expect(await call('remove_page', { id: 'p2' })).toMatchObject({ error: { code: 'aborted' } });
    expect(editor.Pages.get('p2')).toBeTruthy();
  });

  test('Devices', async () => {
    editor.Devices.add({ id: 'phone', name: 'Phone', width: '320px', widthMedia: '480px' });
    const { devices } = await call('list_devices');
    // Canvas and media query widths are reported separately
    expect(devices.find((d: any) => d.id === 'phone')).toEqual({
      id: 'phone',
      name: 'Phone',
      width: '320px',
      widthMedia: '480px',
      selected: false,
    });
    expect(devices.find((d: any) => d.id === 'desktop').selected).toBe(true);
    const mobile = devices.find((d: any) => d.id !== 'desktop');
    expect((await call('select_device', { id: mobile.id })).device.id).toBe(mobile.id);
    expect(editor.Devices.getSelected()!.id).toBe(mobile.id);
    expect(await call('select_device', { id: 'nope' })).toMatchObject({ error: { code: 'not_found' } });
  });

  test('Assets', async () => {
    expect((await call('list_assets')).items).toEqual([{ src: 'https://example.com/a.png', type: 'image' }]);
    const res = await call('add_assets', { assets: [{ src: 'https://example.com/b.png', name: 'B' }] });
    expect(res.added).toEqual([{ src: 'https://example.com/b.png', type: 'image', name: 'B' }]);
    expect(await call('add_assets', { assets: [{ src: 'javascript:alert(1)' }] })).toMatchObject({
      error: { code: 'invalid_input' },
    });
    await call('remove_assets', { srcs: ['https://example.com/a.png'] });
    expect(editor.Assets.getAll().map((a: any) => a.getSrc())).toEqual(['https://example.com/b.png']);
    expect(await call('remove_assets', { srcs: ['nope'] })).toMatchObject({ error: { code: 'not_found' } });
  });

  test('Project round trip', async () => {
    const { projectData } = await call('get_project_data');
    expect(projectData.pages).toHaveLength(1);
    editor.getWrapper()!.components('<p>Changed</p>');
    await call('load_project_data', { projectData });
    const code = await call('get_page_code');
    expect(code.html).toContain('id="box"');
    expect(code.html).not.toContain('Changed');
    expect(code.css).toContain('.card{color:red;}');
  });

  test('Undo/redo with no history', async () => {
    editor.UndoManager.clear();
    const empty = { labels: [], components: [], cssRules: [], hasUndo: false, hasRedo: false };
    expect(await call('undo', { steps: 3 })).toEqual({ undone: 0, ...empty });
    expect(await call('redo')).toEqual({ redone: 0, ...empty });
  });

  test('Undo/redo report the affected components and CSS rules', async () => {
    editor.UndoManager.clear();
    // Changes done in the same operation are a single step
    editor.getWrapper()!.append('<p id="new">New</p>');
    editor.Css.setRule('.card', { color: 'blue' });

    expect(await call('undo')).toEqual({
      undone: 1,
      labels: ['component:add'],
      components: ['new'],
      cssRules: ['.card'],
      hasUndo: false,
      hasRedo: true,
    });
    expect(editor.getHtml()).not.toContain('id="new"');

    expect(await call('redo')).toMatchObject({ redone: 1, components: ['new'], cssRules: ['.card'], hasRedo: false });
    expect(editor.getHtml()).toContain('id="new"');
  });
});
