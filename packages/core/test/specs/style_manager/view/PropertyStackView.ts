import PropertyStackView from '../../../../src/style_manager/view/PropertyStackView';
import PropertyStack from '../../../../src/style_manager/model/PropertyStack';
import Component from '../../../../src/dom_components/model/Component';
import Editor from '../../../../src/editor/model/Editor';
import DomComponents from '../../../../src/dom_components';

describe('PropertyStackView', () => {
  let em: Editor;
  let dcomp: Editor['Components'];
  let compOpts: any;
  let component: Component;
  let fixtures: HTMLElement;
  let target: Component;
  let model: PropertyStack;
  let view: PropertyStackView;
  const propName = 'testprop';
  const properties = [
    { property: 'subprop1' },
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
    em = new Editor({});
    dcomp = new DomComponents(em);
    compOpts = { em, componentTypes: dcomp.componentTypes };
    target = new Component({}, compOpts);
    component = new Component({}, compOpts);
    model = new PropertyStack({
      type: 'stack',
      property: propName,
      properties,
    });
    view = new PropertyStackView({
      model,
    });
    document.body.innerHTML = '<div id="fixtures"></div>';
    fixtures = document.body.firstChild as HTMLElement;
    view.render();
    fixtures.appendChild(view.el);
  });

  afterEach(() => {
    em.destroy();
  });

  test('Rendered correctly', () => {
    const prop = view.el;
    expect(fixtures.querySelector('.property')).toBeTruthy();
    expect(prop.querySelector('.label')).toBeTruthy();
    expect(prop.querySelector('.field')).toBeTruthy();
    expect(prop.querySelector('#add')).toBeTruthy();
  });

  test('Layers rendered', () => {
    expect(view.el.querySelector('.layers')).toBeTruthy();
  });

  test('Layers wrapper should exist', () => {
    expect(view.el.querySelector('[data-layers-wrapper]')).toBeTruthy();
  });

  test('Layers rendered correctly', () => {
    const children = view.el.querySelector('[data-layers-wrapper]')!.children;
    expect(children.length).toEqual(1);
  });

  test('Layers container is empty', () => {
    const layers = view.el.querySelector('.layers')!;
    expect(layers.innerHTML).toBeFalsy();
  });
});
