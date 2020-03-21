import Panel from 'panels/model/Panel';
import Preview from 'commands/view/Preview';
import Button from 'panels/model/Button';

describe('Preview command', () => {
  let fakeButton, fakePanels, fakeEditor;

  beforeEach(() => {
    fakeButton = new Button();
    fakePanels = [new Panel(), new Panel(), new Panel()];

    fakeEditor = {
      getEl: jest.fn(),
      refresh: jest.fn(),
      stopCommand: jest.fn(),

      getModel: jest.fn().mockReturnValue({
        runDefault: jest.fn(),
        stopDefault: jest.fn()
      }),

      Config: {},

      Canvas: {
        getElement: jest.fn().mockReturnValue({
          style: {},
          setAttribute: jest.fn()
        })
      },

      Panels: {
        getButton: jest.fn(() => fakeButton),
        getPanels: jest.fn(() => fakePanels)
      }
    };

    Preview.panels = undefined;
    spyOn(Preview, 'tglPointers');
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
  });

  describe('.stop', () => {
    it('should show all panels', () => {
      fakePanels.forEach(panel => panel.set('visible', false));
      Preview.stop(fakeEditor);
      fakePanels.forEach(panel => expect(panel.get('visible')).toEqual(true));
    });

    it('should not break when the sw-visibility button is not present', () => {
      fakeButton = null;
      expect(() => Preview.stop(fakeEditor)).not.toThrow();
    });
  });
});
