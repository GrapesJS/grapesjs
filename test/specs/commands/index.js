import Backbone from 'backbone';
var Commands = require('commands');
var Models = require('./model/CommandModels');
var CommandAbstract = require('./view/CommandAbstract');

describe('Commands', () => {
  describe('Main', () => {
    let obj,
      commSimple,
      commRunOnly,
      commFunc,
      commName = 'commandTest',
      commResultRun = 'Run executed',
      commResultStop = 'Stop executed';

    const mockEditor = {
      get(id) {
        switch (id) {
          case 'Canvas':
            return {
              getElement: () => ({}),
              getWrapperEl: () => ({}),
              getFrameEl: () => ({}),
              getToolsEl: () => ({}),
              getBody: () => ({})
            };
          case 'Editor':
            return { ...Backbone.Events };
          default:
        }
        return null;
      }
    };

    beforeEach(() => {
      commSimple = {
        run: () => commResultRun,
        stop: () => commResultStop
      };
      commRunOnly = {
        run: () => commResultRun
      };
      commFunc = () => commResultRun;
      obj = new Commands().init({ em: mockEditor });
    });

    afterEach(() => {
      obj = null;
    });

    test('No commands inside', () => {
      expect(obj.get('test')).toBeUndefined();
    });

    test('Push new command', () => {
      const comm = { test: 'test' };
      const len = Object.keys(obj.getAll()).length;
      obj.add('test', comm);
      expect(obj.has('test')).toBe(true);
      expect(Object.keys(obj.getAll()).length).toBe(len + 1);
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

    test('Run simple command and check if the state is tracked', () => {
      // Add the command
      obj.add(commName, commSimple);
      expect(obj.isActive(commName)).toBe(false);

      // Start the command
      let result = obj.run(commName);
      expect(result).toBe(commResultRun);
      expect(obj.isActive(commName)).toBe(true);
      expect(Object.keys(obj.getActive()).length).toBe(1);

      // Stop the command
      result = obj.stop(commName);
      expect(result).toBe(commResultStop);
      expect(obj.isActive(commName)).toBe(false);
      expect(Object.keys(obj.getActive()).length).toBe(0);
    });

    test('Run command only with run method, ensure is not tracked', () => {
      // Add the command
      obj.add(commName, commRunOnly);
      expect(obj.isActive(commName)).toBe(false);

      // Start the command
      let result = obj.run(commName);
      expect(result).toBe(commResultRun);
      expect(obj.isActive(commName)).toBe(false);
      expect(Object.keys(obj.getActive()).length).toBe(0);
    });

    test('Run function command, ensure is not tracked', () => {
      // Add the command
      obj.add(commName, commFunc);
      expect(obj.isActive(commName)).toBe(false);

      // Start the command
      let result = obj.run(commName);
      expect(result).toBe(commResultRun);
      expect(obj.isActive(commName)).toBe(false);
      expect(Object.keys(obj.getActive()).length).toBe(0);
    });
  });
});

Models.run();
CommandAbstract.run();
