import PropertyView from 'style_manager/view/PropertyView';
import Property from 'style_manager/model/Property';
import Editor from 'editor/model/Editor';
import DomComponents from 'dom_components';
import Component from 'dom_components/model/Component';

describe('PropertyView', () => {
  let em;
  let dcomp;
  let compOpts;
  var component;
  var fixtures;
  var target;
  var model;
  var view;
  var propName = 'testprop';
  var propValue = 'testvalue';
  var defValue = 'testDefault';

  beforeEach(() => {
    em = new Editor({});
    dcomp = new DomComponents(em);
    compOpts = { em, componentTypes: dcomp.componentTypes };
    target = new Component({}, compOpts);
    component = new Component({}, compOpts);
    model = new Property({ property: propName }, { em });
    view = new PropertyView({
      model,
      config: { em },
    });
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
  });

  test('Rendered correctly', () => {
    var prop = view.el;
    expect(fixtures.querySelector('.property')).toBeTruthy();
    expect(prop.querySelector('.label')).toBeTruthy();
    expect(prop.querySelector('.field')).toBeTruthy();
  });

  test('Input should exist', () => {
    expect(view.getInputEl()).toBeTruthy();
  });

  test('Input value is empty', () => {
    expect(view.model.get('value')).toBeFalsy();
    expect(view.getInputEl().value).toBeFalsy();
  });

  test('Model not change without update trigger', () => {
    view.getInputEl().value = propValue;
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
        property: propName,
        default: defValue,
      });
      view = new PropertyView({
        model,
      });
      fixtures.innerHTML = '';
      view.render();
      fixtures.appendChild(view.el);
    });

    test('Value as default', () => {
      expect(view.model.getValue()).toEqual(defValue);
    });

    test('Placeholder as default', () => {
      var input = view.getInputEl();
      expect(input.getAttribute('placeholder')).toEqual(defValue);
    });

    test('Input value is set up to default', () => {
      expect(view.getInputEl().value).toEqual(defValue);
    });
  });
});
