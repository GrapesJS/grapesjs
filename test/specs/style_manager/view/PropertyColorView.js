import PropertyColorView from 'style_manager/view/PropertyColorView';
import Property from 'style_manager/model/Property';
import Component from 'dom_components/model/Component';
import Editor from 'editor/model/Editor';
import DomComponents from 'dom_components';

describe('PropertyColorView', () => {
  let em;
  let dcomp;
  let compOpts;
  let component;
  let fixtures;
  let target;
  let model;
  let view;
  let propName = 'testprop';
  let propValue = '#fff';

  beforeAll(() => {
    $.fn.spectrum = function () {
      return this;
    };
  });

  beforeEach(() => {
    em = new Editor({});
    dcomp = new DomComponents(em);
    compOpts = { em, componentTypes: dcomp.componentTypes };
    target = new Component({}, compOpts);
    component = new Component({}, compOpts);
    model = new Property(
      {
        type: 'color',
        property: propName,
      },
      { em }
    );
    view = new PropertyColorView({ model });
    document.body.innerHTML = '<div id="fixtures"></div>';
    fixtures = document.body.firstChild;
    view.render();
    fixtures.appendChild(view.el);
  });

  afterEach(() => {
    //view.remove(); // strange errors ???
  });

  afterAll(() => {
    component = null;
    view = null;
    model = null;
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

  test('Update input on value change', done => {
    view.model.set('value', propValue);
    setTimeout(() => {
      expect(view.getInputEl().value).toEqual(propValue);
      done();
    }, 15);
  });

  describe('Init property', () => {
    beforeEach(() => {
      component = new Component();
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
