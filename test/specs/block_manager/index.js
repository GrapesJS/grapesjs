var BlockManager = require('block_manager');
var BlocksView = require('./view/BlocksView');

describe('BlockManager', () => {

  describe('Main', () => {

    var obj;
    var idTest;
    var optsTest;

    beforeEach(() => {
      idTest = 'h1-block';
      optsTest = {
        label: 'Heading',
        content: '<h1>Test</h1>'
      };
      obj = new BlockManager().init();
      obj.render();
    });

    afterEach(() => {
      obj = null;
    });

    it('Object exists', () => {
      expect(obj).toExist();
    });

    it('No blocks inside', () => {
      expect(obj.getAll().length).toEqual(0);
    });

    it('No categories inside', () => {
      expect(obj.getCategories().length).toEqual(0);
    });

    it('Add new block', () => {
      var model = obj.add(idTest, optsTest);
      expect(obj.getAll().length).toEqual(1);
    });

    it('Added block has correct data', () => {
      var model = obj.add(idTest, optsTest);
      expect(model.get('label')).toEqual(optsTest.label);
      expect(model.get('content')).toEqual(optsTest.content);
    });

    it('Add block with attributes', () => {
      optsTest.attributes = {'class':'test'};
      var model = obj.add(idTest, optsTest);
      expect(model.get('attributes').class).toEqual('test');
    });

    it('The id of the block is unique', () => {
      var model = obj.add(idTest, optsTest);
      var model2 = obj.add(idTest, {other: 'test'});
      expect(model).toEqual(model2);
    });

    it('Get block by id', () => {
      var model = obj.add(idTest, optsTest);
      var model2 = obj.get(idTest);
      expect(model).toEqual(model2);
    });

    it('Render blocks', () => {
      expect(obj.render()).toExist();
    });

  });

  BlocksView.run();

});
