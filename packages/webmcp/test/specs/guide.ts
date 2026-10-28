import { createEditor } from '../helpers';

describe('Editor guide', () => {
  test('No guide tool without instructions', async () => {
    const { editor, mc } = await createEditor({ instructions: '' });
    expect(mc.tools.has('grapesjs_get_editor_guide')).toBe(false);
    expect(mc.tools.get('grapesjs_get_editor_state')!.description).not.toContain('get_editor_guide');
    expect(mc.tools.get('grapesjs_get_component_tree')!.description).not.toContain('get_editor_guide');
    editor.destroy();
  });

  test('Instructions are exposed through the guide tool', async () => {
    const instructions = 'Never remove the header.';
    const { editor, mc } = await createEditor({ instructions, toolPrefix: 'site_' });
    expect(mc.tools.get('site_get_editor_guide')!.annotations).toMatchObject({ readOnlyHint: true });
    expect(await mc.call('site_get_editor_guide')).toEqual({ instructions });
    expect(mc.tools.get('site_get_editor_state')!.description).toContain('call site_get_editor_guide first');
    expect(mc.tools.get('site_get_component_tree')!.description).toContain('call site_get_editor_guide first');
    editor.destroy();
  });
});
