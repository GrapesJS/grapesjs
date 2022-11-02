import CodeManager from 'code_manager';
import Editor from 'editor/model/Editor';

describe('Code Manager', () => {
  describe('Main', () => {
    let obj;

    beforeEach(() => {
      const em = new Editor({});
      obj = new CodeManager(em);
    });

    afterEach(() => {
      obj = null;
    });

    test('Object exists', () => {
      expect(CodeManager).toBeTruthy();
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
