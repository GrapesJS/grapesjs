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

    it('No default commands at init', () => {
      expect(obj.get('select-comp')).toEqual(null);
    });

    it('Default commands after loadDefaultCommands', () => {
      obj.loadDefaultCommands();
      expect(obj.get('select-comp')).toNotEqual(null);
    });

  });

});

Models.run();
