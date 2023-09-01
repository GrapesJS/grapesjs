import Panel from '../../../../src/panels/model/Panel';
import Preview from '../../../../src/commands/view/Preview';

describe('Preview command', () => {
  let fakePanels: Panel[];
  let fakeEditor: any;
  let fakeIsActive: any;
  const obj: any = {};

  beforeEach(() => {
    fakePanels = [new Panel(obj, obj), new Panel(obj, obj), new Panel(obj, obj)];
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
      Preview.run!(fakeEditor, obj, obj);
      fakePanels.forEach(panel => expect(panel.get('visible')).toEqual(false));
    });

    it("should stop the 'core:component-outline' command if active", () => {
      Preview.run!(fakeEditor, obj, obj);
      expect(fakeEditor.stopCommand).not.toHaveBeenCalled();
      fakeIsActive = true;
      Preview.run!(fakeEditor, obj, obj);
      expect(fakeEditor.stopCommand).toHaveBeenCalledWith('core:component-outline');
    });

    it('should not reset the `shouldRunSwVisibility` state once active if run multiple times', () => {
      expect(Preview.shouldRunSwVisibility).toBeUndefined();
      fakeIsActive = true;
      Preview.run!(fakeEditor, obj, obj);
      expect(Preview.shouldRunSwVisibility).toEqual(true);
      fakeIsActive = false;
      Preview.run!(fakeEditor, obj, obj);
      expect(Preview.shouldRunSwVisibility).toEqual(true);
    });
  });

  describe('.stop', () => {
    it('should show all panels', () => {
      fakePanels.forEach(panel => panel.set('visible', false));
      Preview.stop!(fakeEditor, obj, obj);
      fakePanels.forEach(panel => expect(panel.get('visible')).toEqual(true));
    });

    it("should run the 'core:component-outline' command if it was active before run", () => {
      Preview.stop!(fakeEditor, obj, obj);
      expect(fakeEditor.runCommand).not.toHaveBeenCalled();
      Preview.shouldRunSwVisibility = true;
      Preview.stop!(fakeEditor, obj, obj);
      expect(fakeEditor.runCommand).toHaveBeenCalledWith('core:component-outline');
      expect(Preview.shouldRunSwVisibility).toEqual(false);
    });
  });
});
