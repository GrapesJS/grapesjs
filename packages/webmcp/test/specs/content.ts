import type { Editor } from 'grapesjs';
import { createEditor, createModelContext } from '../helpers';

describe('Block and trait tools', () => {
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
    editor.Blocks.add('hero', { label: 'Hero', category: 'Sections', content: '<section class="hero">Hero</section>' });
    editor.Blocks.add('cta', { label: 'CTA', category: 'Basic', content: { type: 'cta', attributes: { id: 'cta' } } });
  });

  afterEach(() => editor.destroy());

  test('list_blocks and get_block', async () => {
    const res = await call('list_blocks');
    expect(res.items).toEqual(
      expect.arrayContaining([
        { id: 'hero', label: 'Hero', category: 'Sections' },
        { id: 'cta', label: 'CTA', category: 'Basic' },
      ]),
    );
    expect((await call('list_blocks', { category: 'Basic' })).items.map((b: any) => b.id)).toEqual(['cta']);
    expect(await call('get_block', { id: 'cta' })).toMatchObject({ content: { type: 'cta' } });
    expect(await call('get_block', { id: 'nope' })).toMatchObject({ error: { code: 'not_found' } });
  });

  test('insert_block', async () => {
    const res = await call('insert_block', { id: 'hero', parentId: 'box' });
    expect(res.added[0]).toMatchObject({ tagName: 'section', classes: ['hero'] });
    expect(editor.Components.getById('box')!.components().length).toBe(1);

    const res2 = await call('insert_block', { id: 'cta', at: 0 });
    expect(res2.added[0]).toMatchObject({ id: 'cta', type: 'cta' });
    expect(editor.getWrapper()!.components().at(0).getId()).toBe('cta');
  });

  test('get_component_traits and update_component_traits', async () => {
    await call('insert_block', { id: 'cta' });
    const res = await call('get_component_traits', { id: 'cta' });
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

    const updated = await call('update_component_traits', { id: 'cta', values: { variant: 'secondary', title: 'Go' } });
    expect(updated.traits.map((t: any) => t.value)).toEqual(['secondary', 'Go']);
    const cmp = editor.Components.getById('cta')!;
    expect(cmp.get('variant')).toBe('secondary');
    expect(cmp.getAttributes().title).toBe('Go');

    expect(await call('update_component_traits', { id: 'cta', values: { variant: 'nope' } })).toMatchObject({
      error: { code: 'invalid_input' },
    });
    expect(await call('update_component_traits', { id: 'cta', values: { missing: 1 } })).toMatchObject({
      error: { code: 'not_found' },
    });
    expect(cmp.get('variant')).toBe('secondary');
  });

  test('Link traits', async () => {
    await call('update_component_traits', { id: 'link', values: { href: '/b' } });
    expect(editor.Components.getById('link')!.getAttributes().href).toBe('/b');
  });
});
