import CanvasMove from '../../../../src/commands/view/CanvasMove';

describe('CanvasMove command', () => {
  test('stop should toggle move off and disable the dragger', () => {
    const command = new CanvasMove({});
    command.toggleMove = jest.fn();
    command.disableDragger = jest.fn();

    command.stop();

    expect(command.toggleMove).toHaveBeenCalledWith();
    expect(command.disableDragger).toHaveBeenCalledWith(expect.any(MouseEvent));
  });

  test('onKeyUp should stop the command on space key', () => {
    const command = new CanvasMove({});
    command.editor = { stopCommand: jest.fn() } as any;
    command.id = 'core:canvas-move';

    command.onKeyUp({ which: 32 } as KeyboardEvent);

    expect(command.editor.stopCommand).toHaveBeenCalledWith('core:canvas-move');
  });
});
