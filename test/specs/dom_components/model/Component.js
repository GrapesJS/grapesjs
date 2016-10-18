define(['DomComponents/model/Component',
        'DomComponents/model/ComponentImage',
        'DomComponents/model/ComponentText',
        'DomComponents/model/Components'],
	function(Component, ComponentImage, ComponentText, Components) {

    return {
      run : function(){
          var obj;

          describe('Component', function() {

            beforeEach(function () {
              obj = new Component();
            });

            afterEach(function () {
              delete obj;
            });

            it('Has no children', function() {
              obj.get('components').length.should.equal(0);
            });

            it('Clones correctly', function() {
              var sAttr = obj.attributes;
              var cloned = obj.clone();
              var eAttr = cloned.attributes;
              eAttr.components = {};
              sAttr.components = {};
              eAttr.traits = {};
              sAttr.traits = {};
              sAttr.should.deep.equal(eAttr);
            });

            it('Has expected name', function() {
              obj.cid = 'c999';
              obj.getName().should.equal('Box 999');
            });

            it('Has expected name 2', function() {
              obj.cid = 'c999';
              obj.set('type','testType');
              obj.getName().should.equal('TestType 999');
            });

        });

        describe('Image Component', function() {

            beforeEach(function () {
              obj = new ComponentImage();
            });

            afterEach(function () {
              delete obj;
            });

            it('Has src property', function() {
              obj.has('src').should.equal(true);
            });

            it('Not droppable', function() {
              obj.get('droppable').should.equal(false);
            });

        });

        describe('Text Component', function() {

            beforeEach(function () {
              obj  = new ComponentText();
            });

            afterEach(function () {
              delete obj;
            });

            it('Has content property', function() {
              obj.has('content').should.equal(true);
            });

            it('Not droppable', function() {
              obj.get('droppable').should.equal(false);
            });

        });

        describe('Components', function() {

            it('Creates component correctly', function() {
              var c = new Components();
              var m = c.add({});
              m.should.be.an.instanceOf(Component);
            });

            it('Creates image component correctly', function() {
              var c = new Components();
              var m = c.add({ type: 'image' });
              m.should.be.an.instanceOf(ComponentImage);
            });

            it('Creates text component correctly', function() {
              var c = new Components();
              var m = c.add({ type: 'text' });
              m.should.be.an.instanceOf(ComponentText);
            });

        });
      }
    };

});
