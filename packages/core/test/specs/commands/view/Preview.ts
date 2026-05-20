import Panel from '../../../../src/panels/model/Panel';
import Preview from '../../../../src/commands/view/Preview';

describe('Preview command', () => {
  let command: Preview;
  let fakePanels: Panel[];
  let fakeEditor: any;
  let fakeIsActive: any;
  const obj: any = {};

  beforeEach(() => {
    command = new Preview({});
    command.ppfx = '';
    command.em = {
      Canvas: {
        getBody: jest.fn(() => ({
          querySelectorAll: jest.fn(() => []),
        })),
        getToolbarEl: jest.fn(() => ({
          style: {},
        })),
      },
      on: jest.fn(),
      off: jest.fn(),
    } as any;
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

    command.panels = undefined;
    command.shouldRunSwVisibility = undefined;
  });

  describe('.getPanels', () => {
    test('it should return panels set with the editor panels if not already set', () => {
      command.getPanels(fakeEditor);
      expect(command.panels).toBe(fakePanels);
      command.getPanels(fakeEditor);
      expect(fakeEditor.Panels.getPanels).toHaveBeenCalledTimes(1);
    });
  });

  describe('.run', () => {
    beforeEach(() => {
      command.helper = { style: {} } as any;
    });

    it('should hide all panels', () => {
      fakePanels.forEach((panel) => expect(panel.get('visible')).toEqual(true));
      command.run(fakeEditor, obj);
      fakePanels.forEach((panel) => expect(panel.get('visible')).toEqual(false));
    });

    it("should stop the 'core:component-outline' command if active", () => {
      command.run(fakeEditor, obj);
      expect(fakeEditor.stopCommand).not.toHaveBeenCalled();
      fakeIsActive = true;
      command.run(fakeEditor, obj);
      expect(fakeEditor.stopCommand).toHaveBeenCalledWith('core:component-outline');
    });

    it('should not reset the `shouldRunSwVisibility` state once active if run multiple times', () => {
      expect(command.shouldRunSwVisibility).toBeUndefined();
      fakeIsActive = true;
      command.run(fakeEditor, obj);
      expect(command.shouldRunSwVisibility).toEqual(true);
      fakeIsActive = false;
      command.run(fakeEditor, obj);
      expect(command.shouldRunSwVisibility).toEqual(true);
    });
  });

  describe('.stop', () => {
    it('should show all panels', () => {
      fakePanels.forEach((panel) => panel.set('visible', false));
      command.stop(fakeEditor);
      fakePanels.forEach((panel) => expect(panel.get('visible')).toEqual(true));
    });

    it("should run the 'core:component-outline' command if it was active before run", () => {
      command.stop(fakeEditor);
      expect(fakeEditor.runCommand).not.toHaveBeenCalled();
      command.shouldRunSwVisibility = true;
      command.stop(fakeEditor);
      expect(fakeEditor.runCommand).toHaveBeenCalledWith('core:component-outline');
      expect(command.shouldRunSwVisibility).toEqual(false);
    });
  });
});
