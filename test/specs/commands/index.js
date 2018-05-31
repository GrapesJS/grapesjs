var Commands = require('commands');
var Models = require('./model/CommandModels');
var CommandAbstract = require('./view/CommandAbstract');

describe('Commands', () => {
  describe('Main', () => {
    let obj;

    beforeEach(() => {
      obj = new Commands().init();
    });

    afterEach(() => {
      obj = null;
    });

    test('No commands inside', () => {
      expect(obj.get('test')).toBeUndefined();
    });

    test('Push new command', () => {
      var comm = { test: 'test' };
      obj.add('test', comm);
      expect(obj.get('test').test).toEqual('test');
    });

    test('Load default commands at init', () => {
      expect(obj.get('select-comp')).not.toBeUndefined();
      expect(obj.get('create-comp')).not.toBeUndefined();
      expect(obj.get('delete-comp')).not.toBeUndefined();
      expect(obj.get('image-comp')).not.toBeUndefined();
      expect(obj.get('move-comp')).not.toBeUndefined();
      expect(obj.get('text-comp')).not.toBeUndefined();
      expect(obj.get('insert-custom')).not.toBeUndefined();
      expect(obj.get('export-template')).not.toBeUndefined();
      expect(obj.get('sw-visibility')).not.toBeUndefined();
      expect(obj.get('open-layers')).not.toBeUndefined();
      expect(obj.get('open-sm')).not.toBeUndefined();
      expect(obj.get('open-tm')).not.toBeUndefined();
      expect(obj.get('open-blocks')).not.toBeUndefined();
      expect(obj.get('open-assets')).not.toBeUndefined();
      expect(obj.get('show-offset')).not.toBeUndefined();
      expect(obj.get('select-parent')).not.toBeUndefined();
      expect(obj.get('tlb-delete')).not.toBeUndefined();
      expect(obj.get('tlb-clone')).not.toBeUndefined();
      expect(obj.get('tlb-move')).not.toBeUndefined();
      expect(obj.get('fullscreen')).not.toBeUndefined();
      expect(obj.get('preview')).not.toBeUndefined();
      expect(obj.get('resize')).not.toBeUndefined();
      expect(obj.get('drag')).not.toBeUndefined();
    });

    test('Default commands after loadDefaultCommands', () => {
      obj.loadDefaultCommands();
      expect(obj.get('select-comp')).not.toBeUndefined();
    });

    test('Commands module should not have toLoad property', () => {
      expect(obj.toLoad).toBeUndefined();
    });
  });
});

Models.run();
CommandAbstract.run();
