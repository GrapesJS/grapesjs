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

            it('Clones correctly with traits', function() {
              obj.get('traits').at(0).set('value', 'testTitle');
              var cloned = obj.clone();
              cloned.set('stylable', 0);
              cloned.get('traits').at(0).set('value', 'testTitle2');
              obj.get('traits').at(0).get('value').should.equal('testTitle');
              obj.get('stylable').should.equal(true);
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

            it('Component toHTML', function() {
              obj.toHTML().should.equal('<div></div>');
            });

            it('Component toHTML with attributes', function() {
              obj = new Component({
                tagName: 'article',
                attributes: {
                  'data-test1': 'value1',
                  'data-test2': 'value2'
                }
              });
              obj.toHTML().should.equal('<article data-test1="value1" data-test2="value2"></article>');
            });

            it('Component toHTML with classes', function() {
              obj = new Component({
                tagName: 'article'
              });
              ['class1', 'class2'].forEach(function(item){
                obj.get('classes').add({name: item});
              });
              obj.toHTML().should.equal('<article class="class1 class2"></article>');
            });

            it('Component toHTML with children', function() {
              obj = new Component({tagName: 'article'});
              obj.get('components').add({tagName: 'span'});
              obj.toHTML().should.equal('<article><span></span></article>');
            });

            it('Component toHTML with more children', function() {
              obj = new Component({tagName: 'article'});
              obj.get('components').add([{tagName: 'span'}, {tagName: 'div'}]);
              obj.toHTML().should.equal('<article><span></span><div></div></article>');
            });

            it('Component toHTML with no closing tag', function() {
              obj = new Component({void: 1});
              obj.toHTML().should.equal('<div/>');
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

            it('ComponentImage toHTML', function() {
              obj = new ComponentImage();
              obj.toHTML().should.equal('<img/>');
            });

            it('Component toHTML with attributes', function() {
              obj = new ComponentImage({
                attributes: {'alt': 'AltTest'},
                src: 'testPath'
              });
              obj.toHTML().should.equal('<img alt="AltTest" src="testPath"/>');
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

            it('Component toHTML with attributes', function() {
              obj = new ComponentText({
                attributes: {'data-test': 'value'},
                content: 'test content'
              });
              obj.toHTML().should.equal('<div data-test="value">test content</div>');
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
