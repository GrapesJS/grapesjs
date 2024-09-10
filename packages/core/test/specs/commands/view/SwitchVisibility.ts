import SwitchVisibility from '../../../../src/commands/view/SwitchVisibility';

describe('SwitchVisibility command', () => {
  let fakeEditor: any;
  let fakeFrames: any;
  let fakeIsActive: any;

  beforeEach(() => {
    fakeFrames = [];
    fakeIsActive = false;

    fakeEditor = {
      Canvas: {
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
      SwitchVisibility.toggleVis(fakeEditor);
      expect(fakeEditor.Canvas.getFrames).not.toHaveBeenCalled();
    });
  });
});
