import Panels from '../../../src/panels';
import Panel from '../../../src/panels/model/Panel';
import Editor from '../../../src/editor/model/Editor';

describe('Panels', () => {
  describe('Main', () => {
    let em: Editor;
    let obj: Panels;

    beforeEach(() => {
      em = new Editor({});
      obj = new Panels(em);
    });

    test('Object exists', () => {
      expect(obj).toBeTruthy();
    });

    test('No panels inside', () => {
      expect(obj.getPanels().length).toEqual(3);
    });

    test('Adds new panel correctly via object', () => {
      const panel = obj.addPanel({ id: 'test' });
      expect(panel.get('id')).toEqual('test');
    });

    test('New panel has no buttons', () => {
      const panel = obj.addPanel({ id: 'test' });
      expect(panel.buttons.length).toEqual(0);
    });

    test('Adds new panel correctly via Panel instance', () => {
      const oPanel = new Panel(obj, { id: 'test' });
      const panel = obj.addPanel(oPanel);
      expect(panel).toEqual(oPanel);
      expect(panel.get('id')).toEqual('test');
    });

    test('getPanel returns null in case there is no requested panel', () => {
      expect(obj.getPanel('test')).toEqual(null);
    });

    test('getPanel returns correctly the panel', () => {
      const panel = obj.addPanel({ id: 'test' });
      expect(obj.getPanel('test')).toEqual(panel);
    });

    test("Can't add button to non existent panel", () => {
      expect(obj.addButton('test', { id: 'btn' })).toEqual(null);
    });

    test('Add button correctly', () => {
      const panel = obj.addPanel({ id: 'test' });
      const btn = obj.addButton('test', { id: 'btn' });
      expect(panel.buttons.length).toEqual(1);
      expect(panel.buttons.at(0).get('id')).toEqual('btn');
    });

    test('getButton returns null in case there is no requested panel', () => {
      expect(obj.addButton('test', 'btn')).toEqual(null);
    });

    test('getButton returns null in case there is no requested button', () => {
      obj.addPanel({ id: 'test' });
      expect(obj.getButton('test', 'btn')).toEqual(null);
    });

    test('getButton returns correctly the button', () => {
      obj.addPanel({ id: 'test' });
      const btn = obj.addButton('test', { id: 'btn' });
      expect(obj.getButton('test', 'btn')).toEqual(btn);
    });

    test('Renders correctly', () => {
      expect(obj.render()).toBeTruthy();
    });

    test('Active correctly activable buttons', () => {
      const fn = jest.fn();
      obj.addPanel({ id: 'test' });
      const btn = obj.addButton('test', { id: 'btn', active: true });
      btn?.on('updateActive', fn);
      obj.active();
      expect(fn).toBeCalledTimes(1);
    });

    test('Disable correctly buttons flagged as disabled', () => {
      const fn = jest.fn();
      obj.addPanel({ id: 'test' });
      const btn = obj.addButton('test', { id: 'btn', disable: true });
      btn?.on('change:disable', fn);
      obj.disableButtons();
      expect(fn).toBeCalledTimes(1);
    });

    test("Can't remove button to non existent panel", () => {
      expect(obj.removeButton('test', { id: 'btn' })).toEqual(null);
    });

    describe('Removes button', () => {
      test('Remove button correctly with object', () => {
        const panel = obj.addPanel({ id: 'test' });
        const btn = obj.addButton('test', { id: 'btn' });
        expect(panel.buttons.length).toEqual(1);
        expect(panel.buttons.at(0).get('id')).toEqual('btn');
        expect(obj.removeButton('test', { id: 'btn' })).toEqual(btn);
        expect(panel.buttons.length).toEqual(0);
      });

      test('Remove button correctly with sting', () => {
        const panel = obj.addPanel({ id: 'test' });
        const btn = obj.addButton('test', { id: 'btn' });
        expect(panel.buttons.length).toEqual(1);
        expect(panel.buttons.at(0).get('id')).toEqual('btn');
        expect(obj.removeButton('test', 'btn')).toEqual(btn);
        expect(panel.buttons.length).toEqual(0);
      });
    });

    describe('Removes Panel', () => {
      test('Removes panel correctly via object', () => {
        const panel = obj.addPanel({ id: 'test' });
        expect(panel.get('id')).toEqual('test');
        obj.removePanel('test');
        expect(panel.get('id')).toEqual('test');
      });

      test('Removes panel correctly via Panel instance', () => {
        const oPanel = new Panel(obj, { id: 'test' });
        const panel = obj.addPanel(oPanel);
        expect(panel).toEqual(oPanel);
        expect(panel.get('id')).toEqual('test');
        obj.removePanel(oPanel);
        expect(obj.getPanels.length).toEqual(0);
      });

      test('Removes panel correctly via id', () => {
        const oPanel = new Panel(obj, { id: 'test' });
        const panel = obj.addPanel(oPanel);
        expect(panel).toEqual(oPanel);
        expect(panel.get('id')).toEqual('test');
        obj.removePanel('test');
        expect(obj.getPanels.length).toEqual(0);
      });
    });
  });
});
