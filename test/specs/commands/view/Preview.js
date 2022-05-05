import Panel from 'panels/model/Panel';
import Preview from 'commands/view/Preview';

describe('Preview command', () => {
  let fakePanels, fakeEditor, fakeIsActive;

  beforeEach(() => {
    fakePanels = [new Panel(), new Panel(), new Panel()];
    fakeIsActive = false;

    fakeEditor = {
      getEl: jest.fn(),
      refresh: jest.fn(),
      runCommand: jest.fn(),
      stopCommand: jest.fn(),

      getModel: jest.fn().mockReturnValue({
        runDefault: jest.fn(),
        stopDefault: jest.fn(),
      }),

      Config: {},

      Canvas: {
        getElement: jest.fn().mockReturnValue({
          style: {},
          setAttribute: jest.fn(),
        }),
      },

      select: jest.fn(),

      getSelectedAll: jest.fn().mockReturnValue([]),

      Commands: {
        isActive: jest.fn(() => fakeIsActive),
      },

      Panels: {
        getPanels: jest.fn(() => fakePanels),
      },
    };

    Preview.panels = undefined;
    Preview.shouldRunSwVisibility = undefined;
  });

  describe('.getPanels', () => {
    test('it should return panels set with the editor panels if not already set', () => {
      Preview.getPanels(fakeEditor);
      expect(Preview.panels).toBe(fakePanels);
      Preview.getPanels(fakeEditor);
      expect(fakeEditor.Panels.getPanels).toHaveBeenCalledTimes(1);
    });
  });

  describe('.run', () => {
    beforeEach(() => {
      Preview.helper = { style: {} };
    });

    it('should hide all panels', () => {
      fakePanels.forEach(panel => expect(panel.get('visible')).toEqual(true));
      Preview.run(fakeEditor);
      fakePanels.forEach(panel => expect(panel.get('visible')).toEqual(false));
    });

    it("should stop the 'sw-visibility' command if active", () => {
      Preview.run(fakeEditor);
      expect(fakeEditor.stopCommand).not.toHaveBeenCalled();
      fakeIsActive = true;
      Preview.run(fakeEditor);
      expect(fakeEditor.stopCommand).toHaveBeenCalledWith('sw-visibility');
    });

    it('should not reset the `shouldRunSwVisibility` state once active if run multiple times', () => {
      expect(Preview.shouldRunSwVisibility).toBeUndefined();
      fakeIsActive = true;
      Preview.run(fakeEditor);
      expect(Preview.shouldRunSwVisibility).toEqual(true);
      fakeIsActive = false;
      Preview.run(fakeEditor);
      expect(Preview.shouldRunSwVisibility).toEqual(true);
    });
  });

  describe('.stop', () => {
    it('should show all panels', () => {
      fakePanels.forEach(panel => panel.set('visible', false));
      Preview.stop(fakeEditor);
      fakePanels.forEach(panel => expect(panel.get('visible')).toEqual(true));
    });

    it("should run the 'sw-visibility' command if it was active before run", () => {
      Preview.stop(fakeEditor);
      expect(fakeEditor.runCommand).not.toHaveBeenCalled();
      Preview.shouldRunSwVisibility = true;
      Preview.stop(fakeEditor);
      expect(fakeEditor.runCommand).toHaveBeenCalledWith('sw-visibility');
      expect(Preview.shouldRunSwVisibility).toEqual(false);
    });
  });
});
