import SwitchVisibility from '../../../../src/commands/view/SwitchVisibility';

describe('SwitchVisibility command', () => {
  let fakeEditor: any;
  let fakeFrames: any;
  let fakeIsActive: any;
  let command: SwitchVisibility;

  beforeEach(() => {
    fakeFrames = [];
    fakeIsActive = false;
    command = new SwitchVisibility({ em: { Commands: { isActive: jest.fn(() => false) } }, pStylePrefix: 'gjs-' });

    fakeEditor = {
      Canvas: {
        getModel: jest.fn(() => ({ on: jest.fn(), off: jest.fn() })),
        getFrames: jest.fn(() => fakeFrames),
      },

      Commands: {
        isActive: jest.fn(() => fakeIsActive),
      },
    };
  });

  describe('.toggleVis', () => {
    it('should do nothing if the preview command is active', () => {
      expect(fakeEditor.Canvas.getFrames).not.toHaveBeenCalled();
      fakeIsActive = true;
      command.toggleVis(fakeEditor);
      expect(fakeEditor.Canvas.getFrames).not.toHaveBeenCalled();
    });

    it('should remove the dashed class on stop', () => {
      const remove = jest.fn();
      fakeFrames = [
        {
          view: {
            loaded: true,
            getBody: jest.fn(() => ({ classList: { add: jest.fn(), remove } })),
          },
          on: jest.fn(),
        },
      ];

      command.stop(fakeEditor);

      expect(remove).toHaveBeenCalledWith('gjs-dashed');
    });
  });
});
