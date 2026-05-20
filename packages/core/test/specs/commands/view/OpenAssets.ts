import OpenAssets from '../../../../src/commands/view/OpenAssets';

describe('OpenAssets command', () => {
  test('open should open the modal', () => {
    const onceClose = jest.fn();
    const command = new OpenAssets({});
    const editor = {
      Modal: {
        open: jest.fn(() => ({ onceClose })),
      },
      stopCommand: jest.fn(),
    } as any;
    command.editor = editor;
    command.am = { __customData: jest.fn() };
    command.config = { custom: false };
    command.title = 'Assets';

    command.open('content');

    expect(editor.Modal.open).toHaveBeenCalledWith({ title: 'Assets', content: 'content' });
    expect(onceClose).toHaveBeenCalledTimes(1);
  });

  test('stop should close the modal', () => {
    const command = new OpenAssets({});
    const editor = {
      Modal: {
        close: jest.fn(),
      },
    } as any;
    command.editor = editor;
    command.am = { __customData: jest.fn() };
    command.config = { custom: false };

    command.stop(editor);

    expect(editor.Modal.close).toHaveBeenCalledTimes(1);
  });
});
