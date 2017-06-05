var CodeManager = require('code_manager');
var Models = require('./model/CodeModels');

describe('Code Manager', () => {

  describe('Main', () => {

    let obj;

    beforeEach(() => {
      obj = new CodeManager();
    });

    afterEach(() => {
      obj = null;
    });

    it('Object exists', () => {
      expect(CodeManager).toExist();
    });

    it('No code generators inside', () => {
      expect(obj.getGenerators()).toEqual({});
    });

    it('No code viewers inside', () => {
      expect(obj.getViewers()).toEqual({});
    });

    it('Add and get code generator', () => {
      obj.addGenerator('test', 'gen');
      expect(obj.getGenerator('test')).toEqual('gen');
    });

    it('Add and get code viewer', () => {
      obj.addViewer('test', 'view');
      expect(obj.getViewer('test')).toEqual('view');
    });

  });

  Models.run();
});
