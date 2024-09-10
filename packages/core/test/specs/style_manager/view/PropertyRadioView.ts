import PropertyRadioView from '../../../../src/style_manager/view/PropertyRadioView';
import Property from '../../../../src/style_manager/model/PropertySelect';
import Component from '../../../../src/dom_components/model/Component';
import Editor from '../../../../src/editor/model/Editor';

describe('PropertyRadioView', () => {
  let em: Editor;
  let dcomp: Editor['Components'];
  let compOpts: any;
  let component: Component;
  let fixtures: HTMLElement;
  let target: Component;
  let model: Property;
  let view: PropertyRadioView;
  const propName = 'testprop';
  const propValue = 'test1value';
  const defValue = 'test2value';
  const options = [
    { id: 'test1value', title: 'testtitle' },
    { id: 'test2', value: 'test2value' },
  ];

  // Have some issue with getCheckedEl() and jsdom
  // this view.getInputEl().querySelector('input:checked') return null
  // but view.getInputEl().querySelectorAll('input:checked')[0] works
  const getCheckedEl = (view: PropertyRadioView) =>
    view.getInputEl().querySelectorAll('input:checked')[0] as HTMLElement;

  beforeEach(() => {
    em = new Editor({});
    dcomp = em.Components;
    compOpts = { em, componentTypes: dcomp.componentTypes };
    target = new Component({}, compOpts);
    component = new Component({}, compOpts);
    model = new Property(
      {
        type: 'radio',
        list: options,
        property: propName,
      },
      { em },
    );
    view = new PropertyRadioView({ model });
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

  test('Radio rendered', () => {
    const prop = view.el;
    expect(prop.querySelector('input[type=radio]')).toBeTruthy();
  });

  test('Options rendered', () => {
    const input = view.el.querySelector('.field')!.firstChild as HTMLElement;
    expect(input.children.length).toEqual(options.length);
  });

  test('Options rendered correctly', () => {
    const input = view.el.querySelector('.field')!.firstChild as HTMLElement;
    const children = input.children;
    expect(children[0].querySelector('label')!.textContent).toEqual('test1value');
    expect(children[1].querySelector('label')!.textContent).toEqual('test2');
    expect(children[0].querySelector('input')!.value).toEqual(options[0].id);
    expect(children[1].querySelector('input')!.value).toEqual(options[1].id);
    expect(children[0].querySelector('label')!.getAttribute('title')).toEqual(options[0].title);
    expect(children[1].querySelector('label')!.getAttribute('title')).toEqual(null);
  });

  test('Input should exist', () => {
    expect(view.input).toBeTruthy();
  });

  test('Input value is empty', () => {
    expect(view.model.get('value')).toBeFalsy();
  });

  test('Update model on input change', () => {
    view.setValue(propValue);
    view.inputValueChanged({
      target: { value: propValue },
      stopPropagation() {},
    });
    expect(view.model.get('value')).toEqual(propValue);
  });

  test('Update input on value change', (done) => {
    view.model.set('value', propValue);
    setTimeout(() => {
      expect((getCheckedEl(view) as any).value).toEqual(propValue);
      done();
    }, 15);
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
      view = new PropertyRadioView({
        model,
      });
      fixtures.innerHTML = '';
      view.render();
      fixtures.appendChild(view.el);
    });

    test('Value as default', () => {
      expect(view.model.getValue()).toEqual(defValue);
    });

    test('Input value is as default', () => {
      expect(view.model.getDefaultValue()).toEqual(defValue);
    });
  });
});
