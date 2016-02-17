define(['DomComponents/model/Component',
        'DomComponents/model/ComponentImage',
        'DomComponents/model/ComponentText',
        'DomComponents/model/Components'],
	function(Component, ComponentImage, ComponentText, Components) {

    return {
      run : function(){
          describe('Component', function() {

            beforeEach(function () {
              this.obj  = new Component();
            });

            afterEach(function () {
              delete this.obj;
            });

            it('Has no children', function() {
              this.obj.get('components').length.should.equal(0);
            });

            it('Clones correctly', function() {
              var sAttr = this.obj.attributes;
              var cloned = this.obj.clone();
              var eAttr = cloned.attributes;
              sAttr.components = {};
              eAttr.components = {};
              sAttr.should.deep.equal(eAttr);
            });

            it('Has expected name', function() {
              this.obj.cid = 'c999';
              this.obj.getName().should.equal('Box999');
            });

            it('Has expected name 2', function() {
              this.obj.cid = 'c999';
              this.obj.set('type','testType');
              this.obj.getName().should.equal('TestTypeBox999');
            });

        });

        describe('Image Component', function() {

            beforeEach(function () {
              this.obj  = new ComponentImage();
            });

            afterEach(function () {
              delete this.obj;
            });

            it('Has src property', function() {
              this.obj.has('src').should.equal(true);
            });

            it('Not droppable', function() {
              this.obj.get('droppable').should.equal(false);
            });

        });

        describe('Text Component', function() {

            beforeEach(function () {
              this.obj  = new ComponentText();
            });

            afterEach(function () {
              delete this.obj;
            });

            it('Has content property', function() {
              this.obj.has('content').should.equal(true);
            });

            it('Not droppable', function() {
              this.obj.get('droppable').should.equal(false);
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