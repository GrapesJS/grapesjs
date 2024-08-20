import PropertySelectView from '../../../../src/style_manager/view/PropertySelectView';
import Property from '../../../../src/style_manager/model/PropertyRadio';
import Editor from '../../../../src/editor/model/Editor';
import Component from '../../../../src/dom_components/model/Component';

describe('PropertySelectView', () => {
  let em: Editor;
  let dcomp: Editor['Components'];
  let compOpts: any;
  let component: Component;
  let fixtures: HTMLElement;
  let target: Component;
  let model: Property;
  let view: PropertySelectView;
  const propName = 'testprop';
  const propValue = 'test1value';
  const defValue = 'test2value';
  let options: any = [
    { id: 'test1value', style: 'test:style' },
    { id: 'test2', value: 'test2value' },
  ];

  beforeEach(() => {
    em = new Editor({});
    dcomp = em.Components;
    compOpts = { em, componentTypes: dcomp.componentTypes };
    target = new Component({}, compOpts);
    component = new Component({}, compOpts);
    model = new Property(
      {
        type: 'select',
        list: options,
        property: propName,
      },
      { em },
    );
    view = new PropertySelectView({ model });
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
  });

  test('Select rendered', () => {
    const prop = view.el;
    expect(prop.querySelector('select')).toBeTruthy();
  });

  test('Options rendered', () => {
    const select = view.el.querySelector('select')!;
    expect(select.children.length).toEqual(options.length);
  });

  test('Options rendered correctly', () => {
    const select = view.el.querySelector('select')!;
    const children = select.children;
    expect((children[0] as any).value).toEqual(options[0].id);
    expect((children[1] as any).value).toEqual(options[1].id);
    expect(children[0].textContent).toEqual(options[0].id);
    expect(children[1].textContent).toEqual(options[1].id);
    expect(children[0].getAttribute('style')).toEqual(options[0].style);
    expect(children[1].getAttribute('style')).toEqual(null);
  });

  test('Input should exist', () => {
    expect(view.input).toBeTruthy();
  });

  test('Input value is empty', () => {
    expect(view.model.get('value')).toBeFalsy();
  });

  test('Update model on input change', () => {
    view.getInputEl().value = propValue;
    view.inputValueChanged({
      target: { value: propValue },
      stopPropagation() {},
    });
    expect(view.model.get('value')).toEqual(propValue);
  });

  test('Update input on value change', (done) => {
    view.model.set('value', propValue);
    setTimeout(() => {
      expect(view.getInputEl().value).toEqual(propValue);
      done();
    }, 11);
  });

  describe('Init property', () => {
    beforeEach(() => {
      component = new Component({}, compOpts);
      model = new Property({
        type: 'select',
        list: options,
        defaults: defValue,
        property: propName,
      });
      view = new PropertySelectView({
        model,
      });
      fixtures.innerHTML = '';
      view.render();
      fixtures.appendChild(view.el);
    });

    test('Value as default', () => {
      expect(view.model.getValue()).toEqual(defValue);
    });

    test('Empty value as default', () => {
      options = [
        { value: '', name: 'test' },
        { value: 'test1value', name: 'test1' },
        { value: 'test2value', name: 'test2' },
        { value: '', name: 'TestDef' },
      ];
      component = new Component({}, compOpts);
      model = new Property({
        type: 'select',
        list: options,
        defaults: '',
        property: 'emptyDefault',
      });
      view = new PropertySelectView({
        model,
      });
      view.render();
      fixtures.innerHTML = '';
      fixtures.appendChild(view.el);
      expect(view.getInputEl().value).toEqual('');
    });

    test('Input value is as default', () => {
      expect(view.model.getDefaultValue()).toEqual(defValue);
    });
  });
});
