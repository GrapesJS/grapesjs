import type { Editor } from 'grapesjs';
import { ToolNames } from './constants';
import { createEditor, createModelContext } from '../../test/helpers';

describe('Page tools', () => {
  let editor: Editor;
  let call: ReturnType<typeof createModelContext>['call'];

  beforeEach(async () => {
    const res = await createEditor();
    editor = res.editor;
    call = (name, input, opts) => res.mc.call(`grapesjs_${name}`, input, opts);
  });

  afterEach(() => editor.destroy());

  test('Pages lifecycle', async () => {
    expect((await call(ToolNames.listPages)).pages).toHaveLength(1);
    const { page } = await call(ToolNames.addPage, {
      id: 'about',
      name: 'About',
      content: '<h1>About</h1>',
      select: true,
    });
    expect(page).toEqual({ id: 'about', name: 'About', selected: true });
    expect(await call(ToolNames.addPage, { id: 'about', name: 'Dup' })).toMatchObject({
      error: { code: 'invalid_input' },
    });
    expect((await call(ToolNames.getPageCode)).code).toContain('<h1');

    await call(ToolNames.renamePage, { id: 'about', name: 'About us' });
    expect(editor.Pages.get('about')!.getName()).toBe('About us');

    const first = editor.Pages.getAll()[0].getId();
    await call(ToolNames.selectPage, { id: first });
    expect(editor.Pages.getSelected()!.getId()).toBe(first);
    expect((await call(ToolNames.getPageCode, { pageId: 'about' })).code).toContain('About');

    await call(ToolNames.selectPage, { id: 'about' });
    expect(await call(ToolNames.removePage, { id: 'about' })).toEqual({ removed: 'about' });
    expect(editor.Pages.getSelected()!.getId()).toBe(first);
    expect(await call(ToolNames.removePage, { id: first })).toMatchObject({ error: { code: 'not_allowed' } });
  });

  test('remove_page reports aborted removals', async () => {
    editor.Pages.add({ id: 'p2' });
    editor.on('page:remove:before', (_page: any, _rm: any, opts: any) => (opts.abort = true));
    expect(await call(ToolNames.removePage, { id: 'p2' })).toMatchObject({ error: { code: 'aborted' } });
    expect(editor.Pages.get('p2')).toBeTruthy();
  });
});
