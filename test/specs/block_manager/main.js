var modulePath = './../../../test/specs/block_manager';

define([ 'BlockManager',
        modulePath + '/view/BlocksView',
         ],
  function(BlockManager, BlocksView) {

    describe('BlockManager', function() {

      describe('Main', function() {

        var obj;
        var idTest;
        var optsTest;

        beforeEach(function () {
          idTest = 'h1-block';
          optsTest = {
            label: 'Heading',
            content: '<h1>Test</h1>'
          };
          obj = new BlockManager().init();
        });

        afterEach(function () {
          delete obj;
        });

        it('Object exists', function() {
          obj.should.be.exist;
        });

        it('No blocks inside', function() {
          var coll = obj.getAll();
          coll.length.should.equal(0);
        });

        it('Add new block', function() {
          var model = obj.add(idTest, optsTest);
          obj.getAll().length.should.equal(1);
        });

        it('Added block has correct data', function() {
          var model = obj.add(idTest, optsTest);
          model.get('label').should.equal(optsTest.label);
          model.get('content').should.equal(optsTest.content);
        });

        it('Add block with attributes', function() {
          optsTest.attributes = {'class':'test'};
          var model = obj.add(idTest, optsTest);
          model.get('attributes').class.should.equal('test');
        });

        it('The id of the block is unique', function() {
          var model = obj.add(idTest, optsTest);
          var model2 = obj.add(idTest, {other: 'test'});
          model.should.deep.equal(model2);
        });

        it('Get block by id', function() {
          var model = obj.add(idTest, optsTest);
          var model2 = obj.get(idTest);
          model.should.deep.equal(model2);
        });

        it('Render blocks', function() {
          obj.render().should.be.ok;
        });

      });

      BlocksView.run();

    });
});