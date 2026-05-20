import CommandFullscreen from '../../../../src/commands/view/Fullscreen';
import Editor from '../../../../src/editor';

describe('Fullscreen command', () => {
  let editor: Editor;
  let container: HTMLElement & { requestFullscreen: jest.Mock };
  let isFullscreen: boolean;
  let exitFullscreen: jest.Mock;

  beforeEach(() => {
    isFullscreen = false;
    container = document.createElement('div') as HTMLElement & { requestFullscreen: jest.Mock };
    container.requestFullscreen = jest.fn(() => {
      isFullscreen = true;
    });
    exitFullscreen = jest.fn(() => {
      isFullscreen = false;
    });

    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => (isFullscreen ? container : null),
    });

    Object.defineProperty(document, 'exitFullscreen', {
      configurable: true,
      value: exitFullscreen,
    });

    editor = new Editor({ el: container } as any);
  });

  afterEach(() => {
    editor.destroy();
  });

  test('runs from canonical and legacy ids', () => {
    const addSpy = jest.spyOn(document, 'addEventListener');
    const removeSpy = jest.spyOn(document, 'removeEventListener');

    expect(editor.Commands.get('core:fullscreen')).toBeInstanceOf(CommandFullscreen);
    expect(editor.Commands.get('fullscreen')).toBeInstanceOf(CommandFullscreen);

    editor.runCommand('core:fullscreen');
    expect(container.requestFullscreen).toHaveBeenCalledTimes(1);
    expect(addSpy).toHaveBeenCalledWith('fullscreenchange', expect.any(Function));

    editor.stopCommand('core:fullscreen');
    expect(exitFullscreen).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledWith('fullscreenchange', expect.any(Function));

    editor.runCommand('fullscreen', { target: container });
    expect(container.requestFullscreen).toHaveBeenCalledTimes(2);

    editor.stopCommand('fullscreen');
    expect(exitFullscreen).toHaveBeenCalledTimes(2);
  });
});
