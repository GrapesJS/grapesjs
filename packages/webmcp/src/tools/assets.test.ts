import type { Editor } from 'grapesjs';
import { ToolNames } from './constants';
import { createEditor, createModelContext } from '../../test/helpers';

describe('Asset tools', () => {
  let editor: Editor;
  let call: ReturnType<typeof createModelContext>['call'];

  beforeEach(async () => {
    const res = await createEditor({}, { assetManager: { assets: ['https://example.com/a.png'] } });
    editor = res.editor;
    call = (name, input, opts) => res.mc.call(`grapesjs_${name}`, input, opts);
  });

  afterEach(() => editor.destroy());

  test('Assets', async () => {
    expect((await call(ToolNames.listAssets)).items).toEqual([{ src: 'https://example.com/a.png', type: 'image' }]);
    const res = await call(ToolNames.addAssets, { assets: [{ src: 'https://example.com/b.png', name: 'B' }] });
    expect(res.added).toEqual([{ src: 'https://example.com/b.png', type: 'image', name: 'B' }]);
    expect(await call(ToolNames.addAssets, { assets: [{ src: 'javascript:alert(1)' }] })).toMatchObject({
      error: { code: 'invalid_input' },
    });
    await call(ToolNames.removeAssets, { srcs: ['https://example.com/a.png'] });
    expect(editor.Assets.getAll().map((a: any) => a.getSrc())).toEqual(['https://example.com/b.png']);
    expect(await call(ToolNames.removeAssets, { srcs: ['nope'] })).toMatchObject({ error: { code: 'not_found' } });
  });
});
