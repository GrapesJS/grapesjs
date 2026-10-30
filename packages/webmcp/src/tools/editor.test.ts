import type { Editor } from 'grapesjs';
import { ToolNames } from './constants';
import { createEditor, createModelContext } from '../../test/helpers';

describe('Editor tools', () => {
  let editor: Editor;
  let call: ReturnType<typeof createModelContext>['call'];

  beforeEach(async () => {
    const res = await createEditor(
      {},
      { components: '<div id="box" class="card">Box</div>', style: '.card{color:red;}' },
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
    const res = await call(ToolNames.getEditorState);
    expect(res.selectedComponents).toEqual([expect.objectContaining({ id: 'box', type: 'text' })]);
    expect(res.page.selected).toBe(true);
    expect(res.device.id).toBe('desktop');
    expect(res.dirtyCount).toBe(2);
    expect(res.hasUndo).toBe(true);
  });

  test('Project round trip', async () => {
    const { projectData } = await call(ToolNames.getProjectData);
    expect(projectData.pages).toHaveLength(1);
    editor.getWrapper()!.components('<p>Changed</p>');
    await call(ToolNames.loadProjectData, { projectData });
    const res = await call(ToolNames.getPageCode, { includeStyles: true });
    expect(res.code).toContain('id="box"');
    expect(res.code).not.toContain('Changed');
    expect(res.styles).toContain('.card{color:red;}');
    // Styles only on request
    expect(await call(ToolNames.getPageCode)).toEqual({ pageId: res.pageId, code: res.code });
  });

  test('Undo/redo with no history', async () => {
    editor.UndoManager.clear();
    const empty = { components: [], cssRules: [], hasUndo: false, hasRedo: false };
    expect(await call(ToolNames.undo, { steps: 3 })).toEqual({ undone: 0, ...empty });
    expect(await call(ToolNames.redo)).toEqual({ redone: 0, ...empty });
  });

  test('Undo/redo report the affected components and CSS rules', async () => {
    editor.UndoManager.clear();
    // Changes done in the same operation are a single step
    editor.getWrapper()!.append('<p id="new">New</p>');
    editor.Css.setRule('.card', { color: 'blue' });

    // For added/removed components, the parent is reported (the component whose children changed)
    const wrapperId = editor.getWrapper()!.getId();
    expect(await call(ToolNames.undo)).toEqual({
      undone: 1,
      components: [wrapperId],
      cssRules: ['.card'],
      hasUndo: false,
      hasRedo: true,
    });
    expect(editor.getHtml()).not.toContain('id="new"');

    expect(await call(ToolNames.redo)).toMatchObject({
      redone: 1,
      components: [wrapperId],
      cssRules: ['.card'],
      hasRedo: false,
    });
    expect(editor.getHtml()).toContain('id="new"');
  });

  test('Undo of a content replacement reports the edited component', async () => {
    editor.UndoManager.clear();
    await call(ToolNames.updateComponents, { updates: [{ id: 'box', content: 'New <b>content</b>' }] });
    expect(await call(ToolNames.undo)).toMatchObject({ undone: 1, components: ['box'] });
    expect(editor.getHtml()).toContain('>Box</div>');
  });
});
