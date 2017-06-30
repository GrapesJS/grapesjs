const Panels = require('panels');
const e2e = require('./e2e/PanelsE2e');
const Models = require('./model/PanelModels');
const PanelView = require('./view/PanelView');
const PanelsView = require('./view/PanelsView');
const ButtonView = require('./view/ButtonView');
const ButtonsView = require('./view/ButtonsView');

describe('Panels', () => {

  describe('Main', () => {

    var obj;

    beforeEach(() => {
      obj = new Panels().init();
    });

    afterEach(() => {
      obj = null;
    });

    it('Object exists', () => {
      expect(obj).toExist();
    });

    it("No panels inside", () => {
      expect(obj.getPanels().length).toEqual(3);
    });

    it("Adds new panel correctly via object", () => {
      var panel = obj.addPanel({id: 'test'});
      expect(panel.get('id')).toEqual('test');
    });

    it("New panel has no buttons", () => {
      var panel = obj.addPanel({id: 'test'});
      expect(panel.get('buttons').length).toEqual(0);
    });

    it("Adds new panel correctly via Panel instance", () => {
      var oPanel = new obj.Panel({id: 'test'});
      var panel = obj.addPanel(oPanel);
      expect(panel).toEqual(oPanel);
      expect(panel.get('id')).toEqual('test');
    });

    it("getPanel returns null in case there is no requested panel", () => {
      expect(obj.getPanel('test')).toEqual(null);
    });

    it("getPanel returns correctly the panel", () => {
      var panel = obj.addPanel({id: 'test'});
      expect(obj.getPanel('test')).toEqual(panel);
    });

    it("Can't add button to non existent panel", () => {
      expect(obj.addButton('test', {id:'btn'})).toEqual(null);
    });

    it("Add button correctly", () => {
      var panel = obj.addPanel({id: 'test'});
      var btn = obj.addButton('test', {id:'btn'});
      expect(panel.get('buttons').length).toEqual(1);
      expect(panel.get('buttons').at(0).get('id')).toEqual('btn');
    });

    it("getButton returns null in case there is no requested panel", () => {
      expect(obj.addButton('test', 'btn')).toEqual(null);
    });

    it("getButton returns null in case there is no requested button", () => {
      var panel = obj.addPanel({id: 'test'});
      expect(obj.getButton('test', 'btn')).toEqual(null);
    });

    it("getButton returns correctly the button", () => {
      var panel = obj.addPanel({id: 'test'});
      var btn = obj.addButton('test', {id:'btn'});
      expect(obj.getButton('test', 'btn')).toEqual(btn);
    });

    it("Renders correctly", () => {
      expect(obj.render()).toExist();
    });

    it("Active correctly activable buttons", () => {
      var spy = sinon.spy();
      var panel = obj.addPanel({id: 'test'});
      var btn = obj.addButton('test', {id:'btn', active: true});
      btn.on('updateActive', spy);
      obj.active();
      expect(spy.called).toEqual(true);
    });

  });

  Models.run();
  PanelView.run();
  PanelsView.run();
  ButtonView.run();
  ButtonsView.run();
  e2e.run();
});
