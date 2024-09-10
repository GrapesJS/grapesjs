import PropertyCompositeView from '../../../../src/style_manager/view/PropertyCompositeView';
import PropertyComposite from '../../../../src/style_manager/model/PropertyComposite';
import Component from '../../../../src/dom_components/model/Component';
import Editor from '../../../../src/editor/model/Editor';

describe('PropertyCompositeView', () => {
  let em: Editor;
  let dcomp: Editor['Components'];
  let compOpts: any;
  var component: Component;
  var fixtures: HTMLElement;
  var target: Component;
  var model: PropertyComposite;
  var view: PropertyCompositeView;
  var propName = 'testprop';
  var properties = [
    {
      property: 'subprop1',
    },
    {
      type: 'integer',
      property: 'subprop2',
      defaults: '0',
      units: ['%', 'px'],
    },
    {
      type: 'select',
      property: 'subprop3',
      defaults: 'val2',
      list: [{ value: 'val1' }, { value: 'val2' }, { value: 'val3' }],
    },
  ];

  beforeEach(() => {
    em = new Editor();
    dcomp = em.Components;
    compOpts = { em, componentTypes: dcomp.componentTypes };
    target = new Component({}, compOpts);
    component = new Component({}, compOpts);
    model = new PropertyComposite(
      {
        type: 'composite',
        property: propName,
        properties,
      },
      { em },
    );
    view = new PropertyCompositeView({ model });
    document.body.innerHTML = '<div id="fixtures"></div>';
    fixtures = document.body.firstChild as HTMLElement;
    view.render();
    fixtures.appendChild(view.el);
  });

  afterEach(() => {
    em.destroy();
  });

  test('Rendered correctly', () => {
    var prop = view.el;
    expect(fixtures.querySelector('.property')).toBeTruthy();
    expect(prop.querySelector('.label')).toBeTruthy();
    expect(prop.querySelector('.field')).toBeTruthy();
  });

  test('Properties rendered', () => {
    var prop = view.el;
    expect(prop.querySelector('.properties')).toBeTruthy();
  });

  test('Properties rendered correctly', () => {
    var children = view.el.querySelector('.properties')!.children;
    expect(children.length).toEqual(properties.length);
  });

  test('Props should exist', () => {
    expect(view.props).toBeTruthy();
  });

  test('Input value is empty', () => {
    expect(model.getFullValue()).toEqual('0 val2');
  });
});
