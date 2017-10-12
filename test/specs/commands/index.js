var Commands = require('commands');
var Models = require('./model/CommandModels');

describe('Commands', () => {

  describe('Main', () => {

    let obj;

    beforeEach(() => {
      obj = new Commands().init();
    });

    afterEach(() => {
      obj = null;
    });

    it('No commands inside', () => {
      expect(obj.get('test')).toEqual(null);
    });

    it('Push new command', () => {
      var comm = { test: 'test'};
      obj.add('test', comm);
      expect(obj.get('test').test).toEqual('test');
    });

    it('Load default commands at init', () => {
      expect(obj.get('select-comp')).toNotEqual(null);
      expect(obj.get('create-comp')).toNotEqual(null);
      expect(obj.get('delete-comp')).toNotEqual(null);
      expect(obj.get('image-comp')).toNotEqual(null);
      expect(obj.get('move-comp')).toNotEqual(null);
      expect(obj.get('text-comp')).toNotEqual(null);
      expect(obj.get('insert-custom')).toNotEqual(null);
      expect(obj.get('export-template')).toNotEqual(null);
      expect(obj.get('sw-visibility')).toNotEqual(null);
      expect(obj.get('open-layers')).toNotEqual(null);
      expect(obj.get('open-sm')).toNotEqual(null);
      expect(obj.get('open-tm')).toNotEqual(null);
      expect(obj.get('open-blocks')).toNotEqual(null);
      expect(obj.get('open-assets')).toNotEqual(null);
      expect(obj.get('show-offset')).toNotEqual(null);
      expect(obj.get('select-parent')).toNotEqual(null);
      expect(obj.get('tlb-delete')).toNotEqual(null);
      expect(obj.get('tlb-clone')).toNotEqual(null);
      expect(obj.get('tlb-move')).toNotEqual(null);
      expect(obj.get('fullscreen')).toNotEqual(null);
      expect(obj.get('preview')).toNotEqual(null);
      expect(obj.get('resize')).toNotEqual(null);
      expect(obj.get('drag')).toNotEqual(null);
    });

    it('Default commands after loadDefaultCommands', () => {
      obj.loadDefaultCommands();
      expect(obj.get('select-comp')).toNotEqual(null);
    });

    it('Commands module should not have toLoad property', () => {
      expect(obj.toLoad).toEqual(null);
    });

  });

});

Models.run();
