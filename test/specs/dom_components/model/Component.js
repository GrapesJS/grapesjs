define(['DomComponents',
        'DomComponents/model/Component',
        'DomComponents/model/ComponentImage',
        'DomComponents/model/ComponentText',
        'DomComponents/model/ComponentLink',
        'DomComponents/model/ComponentMap',
        'DomComponents/model/ComponentVideo',
        'DomComponents/model/Components'],
	function(DomComponents, Component, ComponentImage, ComponentText,
    ComponentLink, ComponentMap, ComponentVideo, Components) {

    return {
      run : function(){
          var obj;
          var dcomp;
          var compOpts;

          describe('Component', function() {

            beforeEach(function () {
              obj = new Component();
              dcomp = new DomComponents();
              compOpts = {
                defaultTypes: dcomp.componentTypes,
              };
            });

            afterEach(function () {
              delete obj;
            });

            it('Has no children', function() {
              obj.get('components').length.should.equal(0);
            });

            it.skip('Clones correctly', function() {
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
              obj.getName().should.equal('Box');
            });

            it('Has expected name 2', function() {
              obj.cid = 'c999';
              obj.set('type','testType');
              obj.getName().should.equal('TestType');
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
              obj = new Component({tagName: 'article'}, compOpts);
              obj.get('components').add({tagName: 'span'});
              obj.toHTML().should.equal('<article><span></span></article>');
            });

            it('Component toHTML with more children', function() {
              obj = new Component({tagName: 'article'}, compOpts);
              obj.get('components').add([{tagName: 'span'}, {tagName: 'div'}]);
              obj.toHTML().should.equal('<article><span></span><div></div></article>');
            });

            it('Component toHTML with no closing tag', function() {
              obj = new Component({void: 1});
              obj.toHTML().should.equal('<div/>');
            });

            it('Component parse empty div', function() {
              var el = document.createElement('div');
              obj = Component.isComponent(el);
              obj.should.deep.equal({tagName: 'div'});
            });

            it('Component parse span', function() {
              var el = document.createElement('span');
              obj = Component.isComponent(el);
              obj.should.deep.equal({tagName: 'span'});
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

            it('Refuse not img element', function() {
              var el = document.createElement('div');
              obj = ComponentImage.isComponent(el);
              obj.should.equal('');
            });

            it('Component parse img element', function() {
              var el = document.createElement('img');
              obj = ComponentImage.isComponent(el);
              obj.should.deep.equal({type: 'image'});
            });

            it('Component parse img element with src', function() {
              var el = document.createElement('img');
              el.src = 'http://localhost/';
              obj = ComponentImage.isComponent(el);
              obj.should.deep.equal({type: 'image'});
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

        describe('Link Component', function() {

          it('Component parse a element', function() {
            var el = document.createElement('a');
            obj = ComponentLink.isComponent(el);
            obj.should.deep.equal({type: 'link'});
          });

        });

        describe('Map Component', function() {

          it('Component parse map iframe', function() {
            var src = 'https://maps.google.com/maps?&q=London,UK&z=11&t=q&output=embed';
            var el = $('<iframe src="' + src + '"></iframe>');
            obj = ComponentMap.isComponent(el.get(0));
            obj.should.deep.equal({type: 'map', src: src});
          });

          it('Component parse not map iframe', function() {
            var el = $('<iframe src="https://www.youtube.com/watch?v=jNQXAC9IVRw"></iframe>');
            obj = ComponentMap.isComponent(el.get(0));
            obj.should.equal('');
          });

        });

        describe('Video Component', function() {

          it('Component parse video', function() {
            var src = 'http://localhost/';
            var el = $('<video src="' + src + '"></video>');
            obj = ComponentVideo.isComponent(el.get(0));
            obj.should.deep.equal({type: 'video'}); //src: src
          });

          it('Component parse youtube video iframe', function() {
            var src = 'http://www.youtube.com/embed/jNQXAC9IVRw?';
            var el = $('<iframe src="' + src + '"></video>');
            obj = ComponentVideo.isComponent(el.get(0));
            obj.should.deep.equal({type: 'video', provider: 'yt', src: src});
          });

          it('Component parse vimeo video iframe', function() {
            var src = 'http://player.vimeo.com/video/2?';
            var el = $('<iframe src="' + src + '"></video>');
            obj = ComponentVideo.isComponent(el.get(0));
            obj.should.deep.equal({type: 'video', provider: 'vi', src: src});
          });

        });

        describe('Components', function() {

            beforeEach(function () {
              dcomp = new DomComponents();
              compOpts = {
                defaultTypes: dcomp.componentTypes,
              }
            });

            it('Creates component correctly', function() {
              var c = new Components({}, compOpts);
              var m = c.add({});
              m.should.be.an.instanceOf(Component);
            });

            it('Creates image component correctly', function() {
              var c = new Components({}, compOpts);
              var m = c.add({ type: 'image' });
              m.should.be.an.instanceOf(ComponentImage);
            });

            it('Creates text component correctly', function() {
              var c = new Components({}, compOpts);
              var m = c.add({ type: 'text' });
              m.should.be.an.instanceOf(ComponentText);
            });

        });
      }
    };

});
