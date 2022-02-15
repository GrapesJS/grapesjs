import CodeManager from 'code_manager';

describe('Code Manager', () => {
  describe('Main', () => {
    let obj;

    beforeEach(() => {
      obj = new CodeManager();
    });

    afterEach(() => {
      obj = null;
    });

    test('Object exists', () => {
      expect(CodeManager).toBeTruthy();
    });

    test('No code generators inside', () => {
      expect(obj.getGenerators()).toEqual({});
    });

    test('No code viewers inside', () => {
      expect(obj.getViewers()).toEqual({});
    });

    test('Add and get code generator', () => {
      obj.addGenerator('test', 'gen');
      expect(obj.getGenerator('test')).toEqual('gen');
    });

    test('Add and get code viewer', () => {
      obj.addViewer('test', 'view');
      expect(obj.getViewer('test')).toEqual('view');
    });
  });
});
