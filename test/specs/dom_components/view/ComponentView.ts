import Component from '../../../../src/dom_components/model/Component';
import ComponentView from '../../../../src/dom_components/view/ComponentView';
import Editor from '../../../../src/editor/model/Editor';

describe('ComponentView', () => {
  let fixtures: Element;
  let model: Component;
  let view: ComponentView;
  let dcomp: Editor['Components'];
  let compOpts: any;
  let em: Editor;
  let el: HTMLElement;
  let compViewOpst: any;

  beforeEach(() => {
    em = new Editor({});
    dcomp = em.Components;
    compOpts = {
      em,
      componentTypes: dcomp.componentTypes,
    };
    model = new Component({}, compOpts);
    compViewOpst = {
      config: {},
    };
    view = new ComponentView({
      ...compViewOpst,
      model,
    });
    em.Styles.render(); // Enable to listen em.setState
    document.body.innerHTML = '<div id="fixtures"></div>';
    fixtures = document.body.querySelector('#fixtures')!;
    el = view.render().el;
    fixtures.appendChild(el);
  });

  afterEach(() => {
    view.remove();
  });

  test('Component empty', () => {
    expect(fixtures.innerHTML).toEqual(
      `<div data-gjs-highlightable="true" id="${el.id}" data-gjs-type="default"></div>`
    );
  });

  test('Clean form helper state', () => {
    em.setSelected(model);
    em.setState('test');
    em.setState('');
    expect(fixtures.innerHTML).toEqual(
      `<div data-gjs-highlightable="true" id="${el.id}" data-gjs-type="default" class="selected"></div>`
    );
  });

  test('Add helper class on status update', () => {
    model.set('status', 'selected');
    expect(fixtures.innerHTML).toEqual(
      `<div data-gjs-highlightable="true" id="${el.id}" data-gjs-type="default" class="selected"></div>`
    );
  });

  test('Get string of classes', () => {
    model.set('attributes', { class: ['test', 'test2'] });
    expect(view.getClasses()).toEqual('test test2');
  });

  test('Update attributes', () => {
    model.set('attributes', {
      title: 'value',
      'data-test': 'value2',
    });
    expect(view.el.getAttribute('title')).toEqual('value');
    expect(view.el.getAttribute('data-test')).toEqual('value2');
  });

  test('Update style', () => {
    model.set('style', {
      color: 'red',
      float: 'left',
    });
    expect(view.el.getAttribute('style')).toEqual('color:red;float:left;');
  });

  test('Clean style', () => {
    model.set('style', { color: 'red' });
    model.set('style', {});
    expect(view.el.getAttribute('style')).toEqual(null);
  });

  test('Add class', () => {
    model.classes.add({ name: 'test' });
    expect(view.el.getAttribute('class')).toEqual('test');
  });

  test('Add classes', () => {
    model.classes.add([{ name: 'test' }, { name: 'test2' }]);
    expect(view.el.getAttribute('class')).toEqual('test test2');
  });

  test('Update on remove of some class', () => {
    var cls1 = model.classes.add({ name: 'test' });
    var cls12 = model.classes.add({ name: 'test2' });
    model.classes.remove(cls1);
    expect(view.el.getAttribute('class')).toEqual('test2');
  });

  test('Init with different tag', () => {
    model = new Component({ tagName: 'span' });
    view = new ComponentView({ ...compViewOpst, model });
    fixtures.innerHTML = '';
    fixtures.appendChild(view.render().el);
    expect(view.render().el.tagName).toEqual('SPAN');
  });

  test('Init with nested components', () => {
    model = new Component(
      {
        // @ts-ignore
        components: [{ tagName: 'span' }, { attributes: { title: 'test' } }],
      },
      compOpts
    );
    view = new ComponentView({
      ...compViewOpst,
      model,
      // @ts-ignore
      componentTypes: dcomp.componentTypes,
    });
    fixtures.innerHTML = '';
    el = view.render().el;
    fixtures.appendChild(el);
    const firstId = el.children[0].id;
    const secondId = el.children[1].id;
    expect(view.$el.html()).toEqual(
      `<span data-gjs-highlightable="true" id="${firstId}" data-gjs-type="default"></span><div data-gjs-highlightable="true" id="${secondId}" data-gjs-type="default" title="test"></div>`
    );
  });

  test('removeClass removes classes from attributes', () => {
    model.addClass('class1');
    model.removeClass('class1');
    const result = model.getAttributes();
    expect(result.class).toEqual(undefined);
  });
});
