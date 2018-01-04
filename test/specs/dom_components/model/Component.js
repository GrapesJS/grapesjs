const DomComponents = require('dom_components');
const Component = require('dom_components/model/Component');
const ComponentImage = require('dom_components/model/ComponentImage');
const ComponentText = require('dom_components/model/ComponentText');
const ComponentLink = require('dom_components/model/ComponentLink');
const ComponentMap = require('dom_components/model/ComponentMap');
const ComponentVideo = require('dom_components/model/ComponentVideo');
const Components = require('dom_components/model/Components');
const Selector = require('selector_manager/model/Selector');
const Editor = require('editor/model/Editor');
const $ = Backbone.$;

module.exports = {
  run() {
      let obj;
      let dcomp;
      let compOpts;
      let em;

      describe('Component', () => {

        beforeEach(() => {
          em = new Editor({});
          dcomp = new DomComponents();
          compOpts = {
            em,
            componentTypes: dcomp.componentTypes,
          };
          obj = new Component({}, compOpts);
        });

        afterEach(() => {
          obj = null;
        });

        it('Has no children', () => {
          expect(obj.get('components').length).toEqual(0);
        });

        it('Clones correctly', () => {
          var sAttr = obj.attributes;
          var cloned = obj.clone();
          var eAttr = cloned.attributes;
          eAttr.components = {};
          sAttr.components = {};
          eAttr.traits = {};
          sAttr.traits = {};
          expect(sAttr.length).toEqual(eAttr.length);
        });

        it('Clones correctly with traits', () => {
          obj.get('traits').at(0).set('value', 'testTitle');
          var cloned = obj.clone();
          cloned.set('stylable', 0);
          cloned.get('traits').at(0).set('value', 'testTitle2');
          expect(obj.get('traits').at(0).get('value')).toEqual('testTitle');
          expect(obj.get('stylable')).toEqual(true);
        });

        it('Has expected name', () => {
          expect(obj.getName()).toEqual('Box');
        });

        it('Has expected name 2', () => {
          obj.cid = 'c999';
          obj.set('type','testType');
          expect(obj.getName()).toEqual('TestType');
        });

        it('Component toHTML', () => {
          expect(obj.toHTML()).toEqual('<div></div>');
        });

        it('Component toHTML with attributes', () => {
          obj = new Component({
            tagName: 'article',
            attributes: {
              'data-test1': 'value1',
              'data-test2': 'value2'
            }
          });
          expect(obj.toHTML()).toEqual('<article data-test1="value1" data-test2="value2"></article>');
        });

        it('Component toHTML with value-less attribute', () => {
          obj = new Component({
            tagName: 'div',
            attributes: {
              'data-is-a-test': ''
            }
          });
          expect(obj.toHTML()).toEqual('<div data-is-a-test=""></div>');
        });

        it('Component toHTML with classes', () => {
          obj = new Component({
            tagName: 'article'
          });
          ['class1', 'class2'].forEach(item => {
            obj.get('classes').add({name: item});
          });
          expect(obj.toHTML()).toEqual('<article class="class1 class2"></article>');
        });

        it('Component toHTML with children', () => {
          obj = new Component({tagName: 'article'}, compOpts);
          obj.get('components').add({tagName: 'span'});
          expect(obj.toHTML()).toEqual('<article><span></span></article>');
        });

        it('Component toHTML with more children', () => {
          obj = new Component({tagName: 'article'}, compOpts);
          obj.get('components').add([{tagName: 'span'}, {tagName: 'div'}]);
          expect(obj.toHTML()).toEqual('<article><span></span><div></div></article>');
        });

        it('Component toHTML with no closing tag', () => {
          obj = new Component({void: 1});
          expect(obj.toHTML()).toEqual('<div/>');
        });

        it('Component parse empty div', () => {
          var el = document.createElement('div');
          obj = Component.isComponent(el);
          expect(obj).toEqual({tagName: 'div'});
        });

        it('Component parse span', () => {
          var el = document.createElement('span');
          obj = Component.isComponent(el);
          expect(obj).toEqual({tagName: 'span'});
        });

        it('setClass single class string', () => {
          obj.setClass('class1');
          const result = obj.get('classes').models;
          expect(result.length).toEqual(1);
          expect(result[0] instanceof Selector).toEqual(true);
          expect(result[0].get('name')).toEqual('class1');
        });

        it('setClass multiple class string', () => {
          obj.setClass('class1 class2');
          const result = obj.get('classes').models;
          expect(result.length).toEqual(2);
        });

        it('setClass single class array', () => {
          obj.setClass(['class1']);
          const result = obj.get('classes').models;
          expect(result.length).toEqual(1);
        });

        it('setClass multiple class array', () => {
          obj.setClass(['class1', 'class2']);
          const result = obj.get('classes').models;
          expect(result.length).toEqual(2);
        });

        it('addClass multiple array', () => {
          obj.addClass(['class1', 'class2']);
          const result = obj.get('classes').models;
          expect(result.length).toEqual(2);
        });

        it('addClass avoid same name classes', () => {
          obj.addClass(['class1', 'class2']);
          obj.addClass(['class1', 'class3']);
          const result = obj.get('classes').models;
          expect(result.length).toEqual(3);
        });

        it('removeClass by string', () => {
          obj.addClass(['class1', 'class2']);
          obj.removeClass('class2');
          const result = obj.get('classes').models;
          expect(result.length).toEqual(1);
        });

        it('removeClass by string with multiple classes', () => {
          obj.addClass(['class1', 'class2']);
          obj.removeClass('class2 class1');
          const result = obj.get('classes').models;
          expect(result.length).toEqual(0);
        });

        it('removeClass by array', () => {
          obj.addClass(['class1', 'class2']);
          obj.removeClass(['class1', 'class2']);
          const result = obj.get('classes').models;
          expect(result.length).toEqual(0);
        });

        it('removeClass do nothing with undefined classes', () => {
          obj.addClass(['class1', 'class2']);
          obj.removeClass(['class3']);
          const result = obj.get('classes').models;
          expect(result.length).toEqual(2);
        });

        it('removeClass actually removes classes from attributes', () => {
          obj.addClass('class1');
          obj.removeClass('class1');
          const result = obj.getAttributes();
          expect(result.class).toEqual(undefined);
        });

        it('setAttributes', () => {
          obj.setAttributes({
            id: 'test',
            'data-test': 'value',
            class: 'class1 class2',
            style: 'color: white; background: #fff'
          });
          expect(obj.getAttributes()).toEqual({
            id: 'test',
            class: 'class1 class2',
            'data-test': 'value',
          });
          expect(obj.get('classes').length).toEqual(2);
          expect(obj.getStyle()).toEqual({
            color: 'white',
            background: '#fff',
          });
        });

        it('setAttributes overwrites correctly', () => {
          obj.setAttributes({id: 'test', 'data-test': 'value'});
          obj.setAttributes({'data-test': 'value2'});
          expect(obj.getAttributes()).toEqual({'data-test': 'value2'});
        });

        it('append() returns always an array', () => {
          let result = obj.append('<span>text1</span>');
          expect(result.length).toEqual(1);
          result = obj.append('<span>text1</span><div>text2</div>');
          expect(result.length).toEqual(2);
        });

        it('append() new components as string', () => {
          obj.append('<span>text1</span><div>text2</div>');
          const comps = obj.components();
          expect(comps.length).toEqual(2);
          expect(comps.models[0].get('tagName')).toEqual('span');
          expect(comps.models[1].get('tagName')).toEqual('div');
        });

        it('append() new components as Objects', () => {
          obj.append([{}, {}]);
          const comps = obj.components();
          expect(comps.length).toEqual(2);
          obj.append({});
          expect(comps.length).toEqual(3);
        });

        it('components() set new collection', () => {
          obj.append([{}, {}]);
          obj.components('<span>test</div>');
          const result = obj.components();
          expect(result.length).toEqual(1);
          expect(result.models[0].get('tagName')).toEqual('span');
        });


        it('Propagate properties to children', () => {
          obj.append({propagate: 'removable'});
          const result = obj.components();
          const newObj = result.models[0];
          expect(newObj.get('removable')).toEqual(true);
          newObj.set('removable', false);
          newObj.append({draggable: false});
          const child = newObj.components().models[0];
          expect(child.get('removable')).toEqual(false);
          expect(child.get('propagate')).toEqual(['removable']);
        });

        it('Ability to stop/change propagation chain', () => {
          obj.append({
            removable: false,
            draggable: false,
            propagate: ['removable', 'draggable']
          });
          const result = obj.components();
          const newObj = result.models[0];
          newObj.components(`
          <div id="comp01">
            <div id="comp11">comp1</div>
            <div id="comp12" data-gjs-stop="1" data-gjs-removable="true" data-gjs-draggable="true" data-gjs-propagate='["stop"]'>
              <div id="comp21">comp21</div>
              <div id="comp22">comp22</div>
            </div>
            <div id="comp13">
              <div id="comp31">comp31</div>
              <div id="comp32">comp32</div>
            </div>
          </div>
          <div id="comp02">TEST</div>`);
          const notInhereted = model => {
            expect(model.get('stop')).toEqual(1);
            expect(model.get('removable')).toEqual(true);
            expect(model.get('draggable')).toEqual(true);
            expect(model.get('propagate')).toEqual(['stop']);
            model.components().each(model => inhereted(model))
          };
          const inhereted = model => {
            if (model.get('stop')) {
              notInhereted(model);
            } else {
              expect(model.get('removable')).toEqual(false);
              expect(model.get('draggable')).toEqual(false);
              expect(model.get('propagate')).toEqual(['removable', 'draggable']);
              model.components().each(model => inhereted(model))
            }
          }
          newObj.components().each(model => inhereted(model))
        });
    });

    describe('Image Component', () => {

        beforeEach(() => {
          obj = new ComponentImage();
        });

        afterEach(() => {
          obj = null;
        });

        it('Has src property', () => {
          expect(obj.has('src')).toEqual(true);
        });

        it('Not droppable', () => {
          expect(obj.get('droppable')).toEqual(false);
        });

        it('ComponentImage toHTML', () => {
          obj = new ComponentImage();
          expect(obj.toHTML()).toEqual('<img/>');
        });

        it('Component toHTML with attributes', () => {
          obj = new ComponentImage({
            attributes: {'alt': 'AltTest'},
            src: 'testPath'
          });
          expect(obj.toHTML()).toEqual('<img alt="AltTest" src="testPath"/>');
        });

        it('Refuse not img element', () => {
          var el = document.createElement('div');
          obj = ComponentImage.isComponent(el);
          expect(obj).toEqual('');
        });

        it('Component parse img element', () => {
          var el = document.createElement('img');
          obj = ComponentImage.isComponent(el);
          expect(obj).toEqual({type: 'image'});
        });

        it('Component parse img element with src', () => {
          var el = document.createElement('img');
          el.src = 'http://localhost/';
          obj = ComponentImage.isComponent(el);
          expect(obj).toEqual({type: 'image'});
        });

    });

    describe('Text Component', () => {

        beforeEach(() => {
          obj  = new ComponentText();
        });

        afterEach(() => {
          obj = null;
        });

        it('Has content property', () => {
          expect(obj.has('content')).toEqual(true);
        });

        it('Not droppable', () => {
          expect(obj.get('droppable')).toEqual(false);
        });

        it('Component toHTML with attributes', () => {
          obj = new ComponentText({
            attributes: {'data-test': 'value'},
            content: 'test content'
          });
          expect(obj.toHTML()).toEqual('<div data-test="value">test content</div>');
        });

    });

    describe('Link Component', () => {

      const aEl = document.createElement('a');

      it('Component parse link element', () => {
        obj = ComponentLink.isComponent(aEl);
        expect(obj).toEqual({type: 'link'});
      });

      it('Component parse link element with text content', () => {
        aEl.innerHTML = 'some text here ';
        obj = ComponentLink.isComponent(aEl);
        expect(obj).toEqual({type: 'link'});
      });

      it('Component parse link element with not only text content', () => {
        aEl.innerHTML = '<div>Some</div> text <div>here </div>';
        obj = ComponentLink.isComponent(aEl);
        expect(obj).toEqual({type: 'link'});
      });

      it('Component parse link element with only not text content', () => {
        aEl.innerHTML = `<div>Some</div>
        <div>text</div>
        <div>here </div>`;
        obj = ComponentLink.isComponent(aEl);
        expect(obj).toEqual({type: 'link', editable: 0});
      });

      it('Link element with only an image inside is not editable', () => {
        aEl.innerHTML = '<img src="##"/>';
        obj = ComponentLink.isComponent(aEl);
        expect(obj).toEqual({type: 'link', editable: 0});
      });

    });

    describe('Map Component', () => {

      it('Component parse map iframe', () => {
        var src = 'https://maps.google.com/maps?&q=London,UK&z=11&t=q&output=embed';
        var el = $('<iframe src="' + src + '"></iframe>');
        obj = ComponentMap.isComponent(el.get(0));
        expect(obj).toEqual({type: 'map', src});
      });

      it('Component parse not map iframe', () => {
        var el = $('<iframe src="https://www.youtube.com/watch?v=jNQXAC9IVRw"></iframe>');
        obj = ComponentMap.isComponent(el.get(0));
        expect(obj).toEqual('');
      });

    });

    describe('Video Component', () => {

      it('Component parse video', () => {
        var src = 'http://localhost/';
        var el = $('<video src="' + src + '"></video>');
        obj = ComponentVideo.isComponent(el.get(0));
        expect(obj).toEqual({type: 'video', src});
      });

      it('Component parse youtube video iframe', () => {
        var src = 'http://www.youtube.com/embed/jNQXAC9IVRw?';
        var el = $('<iframe src="' + src + '"></video>');
        obj = ComponentVideo.isComponent(el.get(0));
        expect(obj).toEqual({type: 'video', provider: 'yt', src});
      });

      it('Component parse vimeo video iframe', () => {
        var src = 'http://player.vimeo.com/video/2?';
        var el = $('<iframe src="' + src + '"></video>');
        obj = ComponentVideo.isComponent(el.get(0));
        expect(obj).toEqual({type: 'video', provider: 'vi', src});
      });

    });

    describe('Components', () => {

        beforeEach(() => {
          dcomp = new DomComponents();
          compOpts = {
            componentTypes: dcomp.componentTypes,
          }
        });

        it('Creates component correctly', () => {
          var c = new Components({}, compOpts);
          var m = c.add({});
          expect(m instanceof Component).toEqual(true);
        });

        it('Creates image component correctly', () => {
          var c = new Components({}, compOpts);
          var m = c.add({ type: 'image' });
          expect(m instanceof ComponentImage).toEqual(true);
        });

        it('Creates text component correctly', () => {
          var c = new Components({}, compOpts);
          var m = c.add({ type: 'text' });
          expect(m instanceof ComponentText).toEqual(true);
        });

    });
  }
};
