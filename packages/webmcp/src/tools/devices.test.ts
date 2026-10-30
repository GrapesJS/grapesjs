import type { Editor } from 'grapesjs';
import { ToolNames } from './constants';
import { createEditor, createModelContext } from '../../test/helpers';

describe('Device tools', () => {
  let editor: Editor;
  let call: ReturnType<typeof createModelContext>['call'];

  beforeEach(async () => {
    const res = await createEditor();
    editor = res.editor;
    call = (name, input, opts) => res.mc.call(`grapesjs_${name}`, input, opts);
  });

  afterEach(() => editor.destroy());

  test('Devices', async () => {
    editor.Devices.add({ id: 'phone', name: 'Phone', width: '320px', widthMedia: '480px' });
    const { devices } = await call(ToolNames.listDevices);
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
    expect((await call(ToolNames.selectDevice, { id: mobile.id })).device.id).toBe(mobile.id);
    expect(editor.Devices.getSelected()!.id).toBe(mobile.id);
    expect(await call(ToolNames.selectDevice, { id: 'nope' })).toMatchObject({ error: { code: 'not_found' } });
  });
});
