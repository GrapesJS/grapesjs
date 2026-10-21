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
      `<div data-gjs-highlightable="true" id="${el.id}" data-gjs-type="default"></div>`,
    );
  });

  test.each([1, 2])('Emits one component update with %s rendered views', (viewCount) => {
    const extraView = viewCount === 2 ? new ComponentView({ ...compViewOpst, model }) : undefined;
    extraView && fixtures.appendChild(extraView.render().el);
    const editorUpdate = jest.fn();
    const modelUpdate = jest.fn();
    const editorPropertyUpdate = jest.fn();
    const modelPropertyUpdate = jest.fn();
    const updated = jest.spyOn(model, 'updated');
    const changes = { content: 'Updated content', customProperty: 'value' };
    const options = { avoidStore: true };
    em.on('component:update', editorUpdate);
    em.on('component:update:content', editorPropertyUpdate);
    model.on('component:update', modelUpdate);
    model.on('component:update:content', modelPropertyUpdate);

    try {
      model.set(changes, options);

      expect(editorUpdate).toHaveBeenNthCalledWith(1, model);
      expect(modelUpdate).toHaveBeenNthCalledWith(1, { component: model, changed: changes, options });
      expect(editorPropertyUpdate).toHaveBeenNthCalledWith(1, model);
      expect(modelPropertyUpdate).toHaveBeenNthCalledWith(1);
      expect(updated).toHaveBeenNthCalledWith(1, 'content', changes.content, '');
      expect(updated).toHaveBeenNthCalledWith(2, 'customProperty', changes.customProperty, undefined);
      expect(view.el.innerHTML).toBe(changes.content);
      extraView && expect(extraView.el.innerHTML).toBe(changes.content);
    } finally {
      extraView?.remove();
    }
  });

  test('Clean form helper state', () => {
    em.setSelected(model);
    em.setState('test');
    em.setState('');
    expect(fixtures.innerHTML).toEqual(
      `<div data-gjs-highlightable="true" id="${el.id}" data-gjs-type="default" class="selected"></div>`,
    );
  });

  test('Add helper class on status update', () => {
    model.set('status', 'selected');
    expect(fixtures.innerHTML).toEqual(
      `<div data-gjs-highlightable="true" id="${el.id}" data-gjs-type="default" class="selected"></div>`,
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
    model = new Component({ tagName: 'span' }, compOpts);
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
      compOpts,
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
      `<span data-gjs-highlightable="true" id="${firstId}" data-gjs-type="default"></span><div data-gjs-highlightable="true" id="${secondId}" data-gjs-type="default" title="test"></div>`,
    );
  });

  test('removeClass removes classes from attributes', () => {
    model.addClass('class1');
    model.removeClass('class1');
    const result = model.getAttributes();
    expect(result.class).toEqual(undefined);
  });

  test('updateStatus removes previous classes and adds new ones', () => {
    model.addClass('selected');

    model.set('locked', true);
    view.updateStatus();
    expect(view.el.getAttribute('class')).toEqual('no-pointer');

    model.set('locked', false);
    view.updateStatus();
    expect(view.el.getAttribute('class')).toEqual('pointer-init');

    model.set('locked');
    view.updateStatus();
    expect(view.el.getAttribute('class')).toEqual('');
  });
});
