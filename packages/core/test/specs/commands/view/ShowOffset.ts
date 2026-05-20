import ShowOffset from '../../../../src/commands/view/ShowOffset';

describe('ShowOffset command', () => {
  test('getOffsetMethod should build the method name from state', () => {
    const command = new ShowOffset({});

    expect(command.getOffsetMethod('Fixed')).toBe('getFixedOffsetViewerEl');
  });

  test('run should stop the command when offsets are disabled', () => {
    const command = new ShowOffset({ em: { getZoomDecimal: jest.fn(() => 1) } });
    command.id = 'core:component-offset';
    const editor = {
      getConfig: jest.fn(() => ({ showOffsets: false, showOffsetsSelected: true })),
      stopCommand: jest.fn(),
    };

    command.run(editor as any, null, { el: document.createElement('div') });

    expect(editor.stopCommand).toHaveBeenCalledWith('core:component-offset', { el: expect.any(HTMLElement) });
  });

  test('stop should hide the offset viewer', () => {
    const command = new ShowOffset({});
    const viewer = document.createElement('div');
    command.canvas = {
      getFixedOffsetViewerEl: jest.fn(() => viewer),
    } as any;

    command.stop({} as any, null, { state: 'Fixed' });

    expect(viewer.style.opacity).toBe('0');
  });
});
