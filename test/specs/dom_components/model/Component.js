import Backbone from 'backbone';
import DomComponents from 'dom_components';
import Component from 'dom_components/model/Component';
import ComponentImage from 'dom_components/model/ComponentImage';
import ComponentText from 'dom_components/model/ComponentText';
import ComponentTextNode from 'dom_components/model/ComponentTextNode';
import ComponentLink from 'dom_components/model/ComponentLink';
import ComponentMap from 'dom_components/model/ComponentMap';
import ComponentVideo from 'dom_components/model/ComponentVideo';
import Components from 'dom_components/model/Components';
import Selector from 'selector_manager/model/Selector';
import Editor from 'editor/model/Editor';
const $ = Backbone.$;

let obj;
let dcomp;
let compOpts;
let em;

describe('Component', () => {
  beforeEach(() => {
    em = new Editor();
    dcomp = em.get('DomComponents');
    em.get('PageManager').onLoad();
    // dcomp = new DomComponents();
    compOpts = {
      em,
      componentTypes: dcomp.componentTypes,
      domc: dcomp
    };
    obj = new Component({}, compOpts);
    dcomp.init({ em });
  });

  afterEach(() => {
    obj = null;
  });

  test('Has no children', () => {
    expect(obj.get('components').length).toEqual(0);
  });

  test('Clones correctly', () => {
    var sAttr = obj.attributes;
    var cloned = obj.clone();
    var eAttr = cloned.attributes;
    eAttr.components = {};
    sAttr.components = {};
    eAttr.traits = {};
    sAttr.traits = {};
    expect(sAttr.length).toEqual(eAttr.length);
  });

  test('Clones correctly with traits', () => {
    obj
      .get('traits')
      .at(0)
      .set('value', 'testTitle');
    var cloned = obj.clone();
    cloned.set('stylable', 0);
    cloned
      .get('traits')
      .at(0)
      .set('value', 'testTitle2');
    expect(
      obj
        .get('traits')
        .at(0)
        .get('value')
    ).toEqual('testTitle');
    expect(obj.get('stylable')).toEqual(true);
  });

  test('Sets attributes correctly from traits', () => {
    obj.set('traits', [
      {
        label: 'Title',
        name: 'title',
        value: 'The title'
      },
      {
        label: 'Context',
        value: 'primary'
      }
    ]);
    expect(obj.get('attributes')).toEqual({ title: 'The title' });
  });

  test('Has expected name', () => {
    expect(obj.getName()).toEqual('Box');
  });

  test('Has expected name 2', () => {
    obj.cid = 'c999';
    obj.set('type', 'testType');
    expect(obj.getName()).toEqual('TestType');
  });

  test('Component toHTML', () => {
    expect(obj.toHTML()).toEqual('<div></div>');
  });

  test('Component toHTML with attributes', () => {
    obj = new Component({
      tagName: 'article',
      attributes: {
        'data-test1': 'value1',
        'data-test2': 'value2'
      }
    });
    expect(obj.toHTML()).toEqual(
      '<article data-test1="value1" data-test2="value2"></article>'
    );
  });

  test('Component toHTML with value-less attribute', () => {
    obj = new Component({
      tagName: 'div',
      attributes: {
        'data-is-a-test': ''
      }
    });
    expect(obj.toHTML()).toEqual('<div data-is-a-test=""></div>');
  });

  test('Component toHTML with classes', () => {
    obj = new Component({
      tagName: 'article'
    });
    ['class1', 'class2'].forEach(item => {
      obj.get('classes').add({ name: item });
    });
    expect(obj.toHTML()).toEqual('<article class="class1 class2"></article>');
  });

  test('Component toHTML with children', () => {
    obj = new Component({ tagName: 'article' }, compOpts);
    obj.get('components').add({ tagName: 'span' });
    expect(obj.toHTML()).toEqual('<article><span></span></article>');
  });

  test('Component toHTML with more children', () => {
    obj = new Component({ tagName: 'article' }, compOpts);
    obj.get('components').add([{ tagName: 'span' }, { tagName: 'div' }]);
    expect(obj.toHTML()).toEqual('<article><span></span><div></div></article>');
  });

  test('Component toHTML with no closing tag', () => {
    obj = new Component({ void: 1 });
    expect(obj.toHTML()).toEqual('<div/>');
  });

  test('Component toHTML with quotes in attribute', () => {
    obj = new Component();
    let attrs = obj.get('attributes');
    attrs['data-test'] = '"value"';
    obj.set('attributes', attrs);
    expect(obj.toHTML()).toEqual('<div data-test="&quot;value&quot;"></div>');
  });

  test('Manage correctly boolean attributes', () => {
    obj = new Component();
    obj.set('attributes', {
      'data-test': 'value',
      checked: false,
      required: true,
      avoid: true
    });
    expect(obj.toHTML()).toEqual(
      '<div data-test="value" required avoid></div>'
    );
  });

  test('Component parse empty div', () => {
    var el = document.createElement('div');
    obj = Component.isComponent(el);
    expect(obj).toEqual({ tagName: 'div' });
  });

  test('Component parse span', () => {
    var el = document.createElement('span');
    obj = Component.isComponent(el);
    expect(obj).toEqual({ tagName: 'span' });
  });

  test('setClass single class string', () => {
    obj.setClass('class1');
    const result = obj.get('classes').models;
    expect(result.length).toEqual(1);
    expect(result[0] instanceof Selector).toEqual(true);
    expect(result[0].get('name')).toEqual('class1');
  });

  test('setClass multiple class string', () => {
    obj.setClass('class1 class2');
    const result = obj.get('classes').models;
    expect(result.length).toEqual(2);
  });

  test('setClass single class array', () => {
    obj.setClass(['class1']);
    const result = obj.get('classes').models;
    expect(result.length).toEqual(1);
  });

  test('setClass multiple class array', () => {
    obj.setClass(['class1', 'class2']);
    const result = obj.get('classes').models;
    expect(result.length).toEqual(2);
  });

  test('addClass multiple array', () => {
    obj.addClass(['class1', 'class2']);
    const result = obj.get('classes').models;
    expect(result.length).toEqual(2);
  });

  test('addClass avoid same name classes', () => {
    obj.addClass(['class1', 'class2']);
    obj.addClass(['class1', 'class3']);
    const result = obj.get('classes').models;
    expect(result.length).toEqual(3);
  });

  test('removeClass by string', () => {
    obj.addClass(['class1', 'class2']);
    obj.removeClass('class2');
    const result = obj.get('classes').models;
    expect(result.length).toEqual(1);
  });

  test('removeClass by string with multiple classes', () => {
    obj.addClass(['class1', 'class2']);
    obj.removeClass('class2 class1');
    const result = obj.get('classes').models;
    expect(result.length).toEqual(0);
  });

  test('removeClass by array', () => {
    obj.addClass(['class1', 'class2']);
    obj.removeClass(['class1', 'class2']);
    const result = obj.get('classes').models;
    expect(result.length).toEqual(0);
  });

  test('removeClass do nothing with undefined classes', () => {
    obj.addClass(['class1', 'class2']);
    obj.removeClass(['class3']);
    const result = obj.get('classes').models;
    expect(result.length).toEqual(2);
  });

  test('removeClass actually removes classes from attributes', () => {
    obj.addClass('class1');
    obj.removeClass('class1');
    const result = obj.getAttributes();
    expect(result.class).toEqual(undefined);
  });

  test('setAttributes', () => {
    obj.setAttributes({
      id: 'test',
      'data-test': 'value',
      class: 'class1 class2',
      style: 'color: white; background: #fff'
    });
    expect(obj.getAttributes()).toEqual({
      id: 'test',
      class: 'class1 class2',
      'data-test': 'value'
    });
    expect(obj.get('classes').length).toEqual(2);
    expect(obj.getStyle()).toEqual({
      color: 'white',
      background: '#fff'
    });
  });

  test('setAttributes overwrites correctly', () => {
    obj.setAttributes({ id: 'test', 'data-test': 'value', a: 'b', b: 'c' });
    obj.setAttributes({ id: 'test2', 'data-test': 'value2' });
    expect(obj.getAttributes()).toEqual({ id: 'test2', 'data-test': 'value2' });
  });

  test('append() returns always an array', () => {
    let result = obj.append('<span>text1</span>');
    expect(result.length).toEqual(1);
    result = obj.append('<span>text1</span><div>text2</div>');
    expect(result.length).toEqual(2);
  });

  test('append() new components as string', () => {
    obj.append('<span>text1</span><div>text2</div>');
    const comps = obj.components();
    expect(comps.length).toEqual(2);
    expect(comps.models[0].get('tagName')).toEqual('span');
    expect(comps.models[1].get('tagName')).toEqual('div');
  });

  test('append() new components as Objects', () => {
    obj.append([{}, {}]);
    const comps = obj.components();
    expect(comps.length).toEqual(2);
    obj.append({});
    expect(comps.length).toEqual(3);
  });

  test('components() set new collection', () => {
    obj.append([{}, {}]);
    obj.components('<span>test</div>');
    const result = obj.components();
    expect(result.length).toEqual(1);
    expect(result.models[0].get('tagName')).toEqual('span');
  });

  test('Propagate properties to children', () => {
    obj.append({ propagate: 'removable' });
    const result = obj.components();
    const newObj = result.models[0];
    expect(newObj.get('removable')).toEqual(true);
    newObj.set('removable', false);
    newObj.append({ draggable: false });
    const child = newObj.components().models[0];
    expect(child.get('removable')).toEqual(false);
    expect(child.get('propagate')).toEqual(['removable']);
  });

  // This will try to avoid, eventually, issues with circular structures
  test('Can stringify object after edits', () => {
    const added = dcomp.addComponent(`
      <div>
        <div>Comp 1</div>
        <div>Comp 2</div>
        <div>Comp 3</div>
      </div>
    `);
    const comp1 = added.components().at(0);
    comp1.remove();
    added.append(comp1);
    expect(JSON.stringify(added)).toBeTruthy();
  });

  test('Guarantee the uniqueness of components ids', () => {
    const idName = 'test';
    const added = dcomp.addComponent(`
      <div>Comp 1</div>
      <div id="${idName}" style="color: red">Comp 2</div>
      <div>Comp 3</div>
      <style>
        #test {
          color: red;
        }
      </style>
    `);
    const comp1 = added[0];
    const comp2 = added[1];
    const comp1Id = comp1.getId();
    const comp2Sel = comp2._getStyleSelector();
    expect(comp2Sel.get('name')).toEqual(idName);
    const idNameNew = `${idName}2`;
    comp2.setId(idNameNew);
    // Check if the style selector has changed its name
    expect(comp2Sel.get('name')).toEqual(idNameNew);
    comp1.setId(idNameNew);
    // The id shouldn't change
    expect(comp1.getId()).toEqual(comp1Id);
  });

  test('Ability to stop/change propagation chain', () => {
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
      expect(model.get('stop')).toEqual('1');
      expect(model.get('removable')).toEqual(true);
      expect(model.get('draggable')).toEqual(true);
      expect(model.get('propagate')).toEqual(['stop']);
      model.components().each(model => inhereted(model));
    };
    const inhereted = model => {
      if (model.get('stop')) {
        notInhereted(model);
      } else {
        expect(model.get('removable')).toEqual(false);
        expect(model.get('draggable')).toEqual(false);
        expect(model.get('propagate')).toEqual(['removable', 'draggable']);
        model.components().each(model => inhereted(model));
      }
    };
    newObj.components().each(model => inhereted(model));
  });
});

describe('Image Component', () => {
  beforeEach(() => {
    obj = new ComponentImage();
  });

  afterEach(() => {
    obj = null;
  });

  test('Has src property', () => {
    expect(obj.has('src')).toEqual(true);
  });

  test('Not droppable', () => {
    expect(obj.get('droppable')).toEqual(0);
  });

  test('ComponentImage toHTML', () => {
    obj = new ComponentImage({ src: '' });
    expect(obj.toHTML()).toEqual('<img/>');
  });

  test('Component toHTML with attributes', () => {
    obj = new ComponentImage({
      attributes: { alt: 'AltTest' },
      src: 'testPath'
    });
    expect(obj.toHTML()).toEqual('<img alt="AltTest" src="testPath"/>');
  });

  test('Refuse not img element', () => {
    var el = document.createElement('div');
    obj = ComponentImage.isComponent(el);
    expect(obj).toEqual('');
  });

  test('Component parse img element', () => {
    var el = document.createElement('img');
    obj = ComponentImage.isComponent(el);
    expect(obj).toEqual({ type: 'image' });
  });

  test('Component parse img element with src', () => {
    var el = document.createElement('img');
    el.src = 'http://localhost/';
    obj = ComponentImage.isComponent(el);
    expect(obj).toEqual({ type: 'image' });
  });
});

describe('Text Component', () => {
  beforeEach(() => {
    obj = new ComponentText();
  });

  afterEach(() => {
    obj = null;
  });

  test('Has content property', () => {
    expect(obj.has('content')).toEqual(true);
  });

  test('Not droppable', () => {
    expect(obj.get('droppable')).toEqual(false);
  });

  test('Component toHTML with attributes', () => {
    obj = new ComponentText({
      attributes: { 'data-test': 'value' },
      content: 'test content'
    });
    expect(obj.toHTML()).toEqual('<div data-test="value">test content</div>');
  });
});

describe('Text Node Component', () => {
  beforeEach(() => {
    obj = new ComponentTextNode();
  });

  afterEach(() => {
    obj = null;
  });

  test('Has content property', () => {
    expect(obj.has('content')).toEqual(true);
  });

  test('Not droppable', () => {
    expect(obj.get('droppable')).toEqual(false);
  });

  test('Not editable', () => {
    expect(obj.get('editable')).toEqual(true);
  });

  test('Component toHTML with attributes', () => {
    obj = new ComponentTextNode({
      attributes: { 'data-test': 'value' },
      content: `test content &<>"'`
    });
    expect(obj.toHTML()).toEqual('test content &amp;&lt;&gt;&quot;&#039;');
  });
});

describe('Link Component', () => {
  const aEl = document.createElement('a');

  test('Component parse link element', () => {
    obj = ComponentLink.isComponent(aEl);
    expect(obj).toEqual({ type: 'link' });
  });

  test('Component parse link element with text content', () => {
    aEl.innerHTML = 'some text here ';
    obj = ComponentLink.isComponent(aEl);
    expect(obj).toEqual({ type: 'link' });
  });

  test('Component parse link element with not only text content', () => {
    aEl.innerHTML = '<div>Some</div> text <div>here </div>';
    obj = ComponentLink.isComponent(aEl);
    expect(obj).toEqual({ type: 'link' });
  });

  test('Component parse link element with only not text content', () => {
    aEl.innerHTML = `<div>Some</div>
    <div>text</div>
    <div>here </div>`;
    obj = ComponentLink.isComponent(aEl);
    expect(obj).toEqual({ type: 'link', editable: 0 });
  });

  test('Link element with only an image inside is not editable', () => {
    aEl.innerHTML = '<img src="##"/>';
    obj = ComponentLink.isComponent(aEl);
    expect(obj).toEqual({ type: 'link', editable: 0 });
  });
});

describe('Map Component', () => {
  test('Component parse map iframe', () => {
    var src = 'https://maps.google.com/maps?&q=London,UK&z=11&t=q&output=embed';
    var el = $('<iframe src="' + src + '"></iframe>');
    obj = ComponentMap.isComponent(el.get(0));
    expect(obj).toEqual({ type: 'map', src });
  });

  test('Component parse not map iframe', () => {
    var el = $(
      '<iframe src="https://www.youtube.com/watch?v=jNQXAC9IVRw"></iframe>'
    );
    obj = ComponentMap.isComponent(el.get(0));
    expect(obj).toEqual('');
  });
});

describe('Video Component', () => {
  test('Component parse video', () => {
    var src = 'http://localhost/';
    var el = $('<video src="' + src + '"></video>');
    obj = ComponentVideo.isComponent(el.get(0));
    expect(obj).toEqual({ type: 'video', src });
  });

  test('Component parse youtube video iframe', () => {
    var src = 'http://www.youtube.com/embed/jNQXAC9IVRw?';
    var el = $('<iframe src="' + src + '"></video>');
    obj = ComponentVideo.isComponent(el.get(0));
    expect(obj).toEqual({ type: 'video', provider: 'yt', src });
  });

  test('Component parse vimeo video iframe', () => {
    var src = 'http://player.vimeo.com/video/2?';
    var el = $('<iframe src="' + src + '"></video>');
    obj = ComponentVideo.isComponent(el.get(0));
    expect(obj).toEqual({ type: 'video', provider: 'vi', src });
  });
});

describe('Components', () => {
  beforeEach(() => {
    em = new Editor({});
    dcomp = em.get('DomComponents');
    em.get('PageManager').onLoad();
    compOpts = {
      em,
      componentTypes: dcomp.componentTypes
    };
  });

  test('Creates component correctly', () => {
    var c = new Components({}, compOpts);
    var m = c.add({});
    expect(m instanceof Component).toEqual(true);
  });

  test('Creates image component correctly', () => {
    var c = new Components({}, compOpts);
    var m = c.add({ type: 'image' });
    expect(m instanceof ComponentImage).toEqual(true);
  });

  test('Creates text component correctly', () => {
    var c = new Components({}, compOpts);
    var m = c.add({ type: 'text' });
    expect(m instanceof ComponentText).toEqual(true);
  });

  test('Avoid conflicting components with the same ID', () => {
    const em = new Editor({});
    dcomp = em.get('DomComponents');
    em.get('PageManager').onLoad();
    dcomp.init({ em });
    const id = 'myid';
    const idB = 'myid2';
    const block = `
      <div id="${id}">
        <div id="${idB}"></div>
      </div>
      <style>
        #${id} {
          color: red;
        }
        #${id}:hover {
          color: blue;
        }
        #${idB} {
          color: yellow;
        }
      </style>
    `;
    const added = dcomp.addComponent(block);
    const addComps = added.components();
    // Let's check if everthing is working as expected
    expect(Object.keys(dcomp.componentsById).length).toBe(3); // + 1 wrapper
    expect(added.getId()).toBe(id);
    expect(addComps.at(0).getId()).toBe(idB);
    const cc = em.get('CssComposer');
    const rules = cc.getAll();
    expect(rules.length).toBe(3);
    expect(rules.at(0).selectorsToString()).toBe(`#${id}`);
    expect(rules.at(1).selectorsToString()).toBe(`#${id}:hover`);
    expect(rules.at(2).selectorsToString()).toBe(`#${idB}`);
    // Now let's add the same block
    const added2 = dcomp.addComponent(block);
    const addComps2 = added2.components();
    const id2 = added2.getId();
    const newId = `${id}-2`;
    const newIdB = `${idB}-2`;
    expect(id2).toBe(newId);
    expect(addComps2.at(0).getId()).toBe(newIdB);
    expect(rules.length).toBe(6);
    expect(rules.at(3).selectorsToString()).toBe(`#${newId}`);
    expect(rules.at(4).selectorsToString()).toBe(`#${newId}:hover`);
    expect(rules.at(5).selectorsToString()).toBe(`#${newIdB}`);
  });
});
