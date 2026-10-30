import { ToolNames } from '../../../src';
import { createEditor } from '../../helpers';

describe('Editor guide', () => {
  test('No guide tool without instructions', async () => {
    const { editor, mc } = await createEditor({ instructions: '' });
    expect(mc.tools.has(`grapesjs_${ToolNames.getEditorGuide}`)).toBe(false);
    expect(mc.tools.get(`grapesjs_${ToolNames.getEditorState}`)!.description).not.toContain(ToolNames.getEditorGuide);
    expect(mc.tools.get(`grapesjs_${ToolNames.getComponents}`)!.description).not.toContain(ToolNames.getEditorGuide);
    editor.destroy();
  });

  test('Instructions are exposed through the guide tool', async () => {
    const instructions = 'Never remove the header.';
    const { editor, mc } = await createEditor({ instructions, toolPrefix: 'site_' });
    expect(mc.tools.get(`site_${ToolNames.getEditorGuide}`)!.annotations).toMatchObject({ readOnlyHint: true });
    expect(await mc.call(`site_${ToolNames.getEditorGuide}`)).toEqual({ instructions });
    expect(mc.tools.get(`site_${ToolNames.getEditorState}`)!.description).toContain(
      `call site_${ToolNames.getEditorGuide} first`,
    );
    expect(mc.tools.get(`site_${ToolNames.getComponents}`)!.description).toContain(
      `call site_${ToolNames.getEditorGuide} first`,
    );
    editor.destroy();
  });
});
