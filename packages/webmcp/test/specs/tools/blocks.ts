import type { Editor } from 'grapesjs';
import { ToolNames } from '../../../src';
import { createEditor, createModelContext } from '../../helpers';

describe('Block tools', () => {
  let editor: Editor;
  let call: ReturnType<typeof createModelContext>['call'];

  beforeEach(async () => {
    const res = await createEditor({}, { components: '<div id="box"></div>' });
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
    editor.Blocks.add('hero', { label: 'Hero', category: 'Sections', content: '<section class="hero">Hero</section>' });
    editor.Blocks.add('cta', { label: 'CTA', category: 'Basic', content: { type: 'cta', attributes: { id: 'cta' } } });
  });

  afterEach(() => editor.destroy());

  test('list_blocks and get_block', async () => {
    const res = await call(ToolNames.listBlocks);
    expect(res.items).toEqual(
      expect.arrayContaining([
        { id: 'hero', label: 'Hero', category: 'Sections' },
        { id: 'cta', label: 'CTA', category: 'Basic' },
      ]),
    );
    expect((await call(ToolNames.listBlocks, { category: 'Basic' })).items.map((b: any) => b.id)).toEqual(['cta']);
    expect(await call(ToolNames.getBlock, { id: 'cta' })).toMatchObject({ content: { type: 'cta' } });
    expect(await call(ToolNames.getBlock, { id: 'nope' })).toMatchObject({ error: { code: 'not_found' } });
  });

  test('insert_block', async () => {
    const res = await call(ToolNames.insertBlock, { id: 'hero', parentId: 'box' });
    expect(res.added[0]).toMatchObject({ tagName: 'section', attributes: { class: 'hero' } });
    expect(editor.Components.getById('box')!.components().length).toBe(1);

    const res2 = await call(ToolNames.insertBlock, { id: 'cta', at: 0 });
    expect(res2.added[0]).toMatchObject({ id: 'cta', type: 'cta' });
    expect(editor.getWrapper()!.components().at(0).getId()).toBe('cta');
  });
});
