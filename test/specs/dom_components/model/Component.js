const DomComponents = require('dom_components');
const Component = require('dom_components/model/Component');
const ComponentImage = require('dom_components/model/ComponentImage');
const ComponentText = require('dom_components/model/ComponentText');
const ComponentLink = require('dom_components/model/ComponentLink');
const ComponentMap = require('dom_components/model/ComponentMap');
const ComponentVideo = require('dom_components/model/ComponentVideo');
const Components = require('dom_components/model/Components');

module.exports = {
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
          obj = null;
        });

        it('Has no children', function() {
          expect(obj.get('components').length).toEqual(0);
        });

        it('Clones correctly', function() {
          var sAttr = obj.attributes;
          var cloned = obj.clone();
          var eAttr = cloned.attributes;
          eAttr.components = {};
          sAttr.components = {};
          eAttr.traits = {};
          sAttr.traits = {};
          expect(sAttr.length).toEqual(eAttr.length);
        });

        it('Clones correctly with traits', function() {
          obj.get('traits').at(0).set('value', 'testTitle');
          var cloned = obj.clone();
          cloned.set('stylable', 0);
          cloned.get('traits').at(0).set('value', 'testTitle2');
          expect(obj.get('traits').at(0).get('value')).toEqual('testTitle');
          expect(obj.get('stylable')).toEqual(true);
        });

        it('Has expected name', function() {
          expect(obj.getName()).toEqual('Box');
        });

        it('Has expected name 2', function() {
          obj.cid = 'c999';
          obj.set('type','testType');
          expect(obj.getName()).toEqual('TestType');
        });

        it('Component toHTML', function() {
          expect(obj.toHTML()).toEqual('<div></div>');
        });

        it('Component toHTML with attributes', function() {
          obj = new Component({
            tagName: 'article',
            attributes: {
              'data-test1': 'value1',
              'data-test2': 'value2'
            }
          });
          expect(obj.toHTML()).toEqual('<article data-test1="value1" data-test2="value2"></article>');
        });

        it('Component toHTML with classes', function() {
          obj = new Component({
            tagName: 'article'
          });
          ['class1', 'class2'].forEach(function(item){
            obj.get('classes').add({name: item});
          });
          expect(obj.toHTML()).toEqual('<article class="class1 class2"></article>');
        });

        it('Component toHTML with children', function() {
          obj = new Component({tagName: 'article'}, compOpts);
          obj.get('components').add({tagName: 'span'});
          expect(obj.toHTML()).toEqual('<article><span></span></article>');
        });

        it('Component toHTML with more children', function() {
          obj = new Component({tagName: 'article'}, compOpts);
          obj.get('components').add([{tagName: 'span'}, {tagName: 'div'}]);
          expect(obj.toHTML()).toEqual('<article><span></span><div></div></article>');
        });

        it('Component toHTML with no closing tag', function() {
          obj = new Component({void: 1});
          expect(obj.toHTML()).toEqual('<div/>');
        });

        it('Component parse empty div', function() {
          var el = document.createElement('div');
          obj = Component.isComponent(el);
          expect(obj).toEqual({tagName: 'div'});
        });

        it('Component parse span', function() {
          var el = document.createElement('span');
          obj = Component.isComponent(el);
          expect(obj).toEqual({tagName: 'span'});
        });

    });

    describe('Image Component', function() {

        beforeEach(function () {
          obj = new ComponentImage();
        });

        afterEach(function () {
          obj = null;
        });

        it('Has src property', function() {
          expect(obj.has('src')).toEqual(true);
        });

        it('Not droppable', function() {
          expect(obj.get('droppable')).toEqual(false);
        });

        it('ComponentImage toHTML', function() {
          obj = new ComponentImage();
          expect(obj.toHTML()).toEqual('<img/>');
        });

        it('Component toHTML with attributes', function() {
          obj = new ComponentImage({
            attributes: {'alt': 'AltTest'},
            src: 'testPath'
          });
          expect(obj.toHTML()).toEqual('<img alt="AltTest" src="testPath"/>');
        });

        it('Refuse not img element', function() {
          var el = document.createElement('div');
          obj = ComponentImage.isComponent(el);
          expect(obj).toEqual('');
        });

        it('Component parse img element', function() {
          var el = document.createElement('img');
          obj = ComponentImage.isComponent(el);
          expect(obj).toEqual({type: 'image'});
        });

        it('Component parse img element with src', function() {
          var el = document.createElement('img');
          el.src = 'http://localhost/';
          obj = ComponentImage.isComponent(el);
          expect(obj).toEqual({type: 'image'});
        });

    });

    describe('Text Component', function() {

        beforeEach(function () {
          obj  = new ComponentText();
        });

        afterEach(function () {
          obj = null;
        });

        it('Has content property', function() {
          expect(obj.has('content')).toEqual(true);
        });

        it('Not droppable', function() {
          expect(obj.get('droppable')).toEqual(false);
        });

        it('Component toHTML with attributes', function() {
          obj = new ComponentText({
            attributes: {'data-test': 'value'},
            content: 'test content'
          });
          expect(obj.toHTML()).toEqual('<div data-test="value">test content</div>');
        });

    });

    describe('Link Component', function() {

      it('Component parse a element', function() {
        var el = document.createElement('a');
        obj = ComponentLink.isComponent(el);
        expect(obj).toEqual({type: 'link'});
      });

    });

    describe('Map Component', function() {

      it('Component parse map iframe', function() {
        var src = 'https://maps.google.com/maps?&q=London,UK&z=11&t=q&output=embed';
        var el = $('<iframe src="' + src + '"></iframe>');
        obj = ComponentMap.isComponent(el.get(0));
        expect(obj).toEqual({type: 'map', src: src});
      });

      it('Component parse not map iframe', function() {
        var el = $('<iframe src="https://www.youtube.com/watch?v=jNQXAC9IVRw"></iframe>');
        obj = ComponentMap.isComponent(el.get(0));
        expect(obj).toEqual('');
      });

    });

    describe('Video Component', function() {

      it('Component parse video', function() {
        var src = 'http://localhost/';
        var el = $('<video src="' + src + '"></video>');
        obj = ComponentVideo.isComponent(el.get(0));
        expect(obj).toEqual({type: 'video', src: src});
      });

      it('Component parse youtube video iframe', function() {
        var src = 'http://www.youtube.com/embed/jNQXAC9IVRw?';
        var el = $('<iframe src="' + src + '"></video>');
        obj = ComponentVideo.isComponent(el.get(0));
        expect(obj).toEqual({type: 'video', provider: 'yt', src: src});
      });

      it('Component parse vimeo video iframe', function() {
        var src = 'http://player.vimeo.com/video/2?';
        var el = $('<iframe src="' + src + '"></video>');
        obj = ComponentVideo.isComponent(el.get(0));
        expect(obj).toEqual({type: 'video', provider: 'vi', src: src});
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
          expect(m instanceof Component).toEqual(true);
        });

        it('Creates image component correctly', function() {
          var c = new Components({}, compOpts);
          var m = c.add({ type: 'image' });
          expect(m instanceof ComponentImage).toEqual(true);
        });

        it('Creates text component correctly', function() {
          var c = new Components({}, compOpts);
          var m = c.add({ type: 'text' });
          expect(m instanceof ComponentText).toEqual(true);
        });

    });
  }
};
