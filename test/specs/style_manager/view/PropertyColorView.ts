import PropertyColorView from '../../../../src/style_manager/view/PropertyColorView';
import Property from '../../../../src/style_manager/model/Property';
import Component from '../../../../src/dom_components/model/Component';
import Editor from '../../../../src/editor/model/Editor';

describe('PropertyColorView', () => {
  let em: Editor;
  let dcomp: Editor['Components'];
  let compOpts: any;
  let component: Component;
  var fixtures: HTMLElement;
  let target: Component;
  let model: Property;
  let view: PropertyColorView;
  let propName = 'testprop';
  let propValue = '#fff';

  beforeAll(() => {
    ($.fn as any).spectrum = function () {
      return this;
    };
  });

  beforeEach(() => {
    em = new Editor();
    dcomp = em.Components;
    compOpts = { em, componentTypes: dcomp.componentTypes };
    target = new Component({}, compOpts);
    component = new Component({}, compOpts);
    model = new Property(
      {
        type: 'color',
        property: propName,
      },
      { em },
    );
    view = new PropertyColorView({ model });
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

  test('Inputs rendered', () => {
    var prop = view.el;
    expect(prop.querySelector('input[type=text]')).toBeTruthy();
  });

  test('Inputs should exist', () => {
    expect(view.inputInst).toBeTruthy();
  });

  test('Input value is empty', () => {
    expect(view.model.get('value')).toBeFalsy();
    expect(view.getInputEl().value).toBeFalsy();
  });

  test('Update model on setValue', () => {
    view.setValue(propValue);
    expect(view.getInputEl().value).toEqual(propValue);
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
    }, 15);
  });

  describe('Init property', () => {
    beforeEach(() => {
      em = new Editor();
      component = new Component({}, { em, config: em.Components.config });
      model = new Property({
        type: 'color',
        property: propName,
        defaults: propValue,
      });
      view = new PropertyColorView({
        model,
      });
      fixtures.innerHTML = '';
      view.render();
      fixtures.appendChild(view.el);
    });

    test('Value as default', () => {
      expect(view.model.getValue()).toEqual(propValue);
    });

    test('Input value is the default', () => {
      expect(view.getInputEl().value).toEqual(propValue);
    });
  });
});
