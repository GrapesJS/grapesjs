import ExportTemplate from '../../../../src/commands/view/ExportTemplate';

describe('ExportTemplate command', () => {
  test('should open modal and update editors content', () => {
    const command = new ExportTemplate({});
    const once = jest.fn();
    const open = jest.fn(() => ({
      getModel: jest.fn(() => ({
        once,
      })),
    }));
    const htmlSetContent = jest.fn();
    const cssSetContent = jest.fn();
    const createViewer = jest
      .fn()
      .mockImplementationOnce(() => ({ setContent: htmlSetContent }))
      .mockImplementationOnce(() => ({ setContent: cssSetContent }));
    const render = jest.fn(function (this: any) {
      return { el: document.createElement('div') };
    });
    const EditorView = jest.fn(() => ({ render }));

    command.em = {
      CodeManager: {
        createViewer,
        getConfig: jest.fn(() => ({})),
        EditorView,
      },
    } as any;
    command.id = 'core:open-code';

    const sender = { set: jest.fn() };
    const editor = {
      getConfig: jest.fn(() => ({ stylePrefix: 'gjs-', textViewCode: 'Code' })),
      Modal: { open },
      CodeManager: {},
      getHtml: jest.fn(() => '<div>HTML</div>'),
      getCss: jest.fn(() => '.cls{}'),
      stopCommand: jest.fn(),
    } as any;

    command.run(editor, sender, {});

    expect(sender.set).toHaveBeenCalledWith('active', 0);
    expect(open).toHaveBeenCalled();
    expect(htmlSetContent).toHaveBeenCalledWith('<div>HTML</div>');
    expect(cssSetContent).toHaveBeenCalledWith('.cls{}');
    expect(once).toHaveBeenCalledWith('change:open', expect.any(Function));
  });

  test('stop should close the modal', () => {
    const command = new ExportTemplate({});
    const close = jest.fn();

    command.stop({ Modal: { close } } as any);

    expect(close).toHaveBeenCalledTimes(1);
  });
});
