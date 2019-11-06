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
  var propTarget;
  var options;
  var propName = 'testprop';
  var propValue = 'testvalue';
  var defValue = 'testDefault';

  beforeEach(() => {
    em = new Editor({});
    dcomp = new DomComponents();
    compOpts = { em, componentTypes: dcomp.componentTypes };
    propTarget = { ...Backbone.Events };
    target = new Component({}, compOpts);
    component = new Component({}, compOpts);
    model = new Property({ property: propName });
    propTarget.model = component;
    options = {
      model,
      propTarget
    };
    view = new PropertyView(options);
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
    expect(view.getInputValue()).toBeFalsy();
  });

  test('Model not change without update trigger', () => {
    view.getInputEl().value = propValue;
    expect(view.model.get('value')).toBeFalsy();
  });

  // Tests inputValueChanged()
  test('Update model on input change', () => {
    view.getInputEl().value = propValue;
    view.inputValueChanged();
    expect(view.model.get('value')).toEqual(propValue);
  });

  // Tests modelValueChanged() -> ...
  test('Update input on value change', () => {
    view.model.set('value', propValue);
    expect(view.getInputValue()).toEqual(propValue);
  });

  test('Update target on value change', () => {
    view.model.set('value', propValue);
    var compStyle = view.getTargetModel().get('style');
    var assertStyle = {};
    assertStyle[propName] = propValue;
    expect(compStyle).toEqual(assertStyle);
  });

  test('Update target on value change with functionName', () => {
    view.model.set('functionName', 'testfunc');
    view.model.set('value', propValue);
    var compStyle = view.getTargetModel().get('style');
    var assertStyle = {};
    assertStyle[propName] = 'testfunc(' + propValue + ')';
    expect(compStyle).toEqual(assertStyle);
  });

  test('Clean target from the property if its value is empty', () => {
    view.model.set('value', propValue);
    view.model.set('value', '');
    var compStyle = view.getTargetModel().get('style');
    expect(compStyle).toEqual({});
  });

  test('Check stylable element', () => {
    expect(view.isTargetStylable()).toEqual(true);
    component.set('stylable', false);
    expect(view.isTargetStylable()).toEqual(false);
    component.set('stylable', [propName]);
    expect(view.isTargetStylable()).toEqual(true);
    component.set('stylable', ['test1', propName]);
    expect(view.isTargetStylable()).toEqual(true);
    component.set('stylable', ['test1', 'test2']);
    expect(view.isTargetStylable()).toEqual(false);
  });

  test('Target style is empty without values', () => {
    expect(view.getTargetValue()).toBeFalsy();
  });

  test('Target style is correct', () => {
    var style = {};
    style[propName] = propValue;
    component.set('style', style);
    expect(view.getTargetValue()).toEqual(propValue);
  });

  test('Target style is empty with an other style', () => {
    var style = {};
    style[propName + '2'] = propValue;
    component.set('style', style);
    expect(view.getTargetValue()).toBeFalsy();
  });

  test('Fetch value from function', () => {
    view.selectedComponent = component;
    const val = `testfun(${propValue})`;
    component.set('style', { [propName]: val });
    view.model.set('functionName', 'testfun');
    expect(view.getTargetValue()).toEqual(val);
  });

  describe('With target setted', () => {
    beforeEach(() => {
      target.model = component;
      view = new PropertyView({
        model,
        propTarget: target
      });
      fixtures.innerHTML = '';
      view.render();
      fixtures.appendChild(view.el);
    });

    test('updateTargetStyle', () => {
      view.updateTargetStyle(propValue);
      var style = {};
      style[propName] = propValue;
      expect(component.get('style')).toEqual(style);
    });

    test('updateTargetStyle with custom property', () => {
      view.updateTargetStyle(propValue, propName + '2');
      var style = {};
      style[propName + '2'] = propValue;
      expect(component.get('style')).toEqual(style);
    });

    test('Update value and input on target swap', () => {
      var style = {};
      style[propName] = propValue;
      component.set('style', style);
      view.propTarget.trigger('update');
      expect(view.model.get('value')).toEqual(propValue);
      expect(view.getInputValue()).toEqual(propValue);
    });

    test('Update value after multiple swaps', () => {
      var style = {};
      style[propName] = propValue;
      component.set('style', style);
      view.propTarget.trigger('update');
      style[propName] = propValue + '2';
      component.set('style', style);
      view.propTarget.trigger('update');
      expect(view.model.get('value')).toEqual(propValue + '2');
      expect(view.getInputValue()).toEqual(propValue + '2');
    });
  });

  describe('Init property', () => {
    beforeEach(() => {
      component = new Component();
      model = new Property({
        property: propName,
        defaults: defValue
      });
      view = new PropertyView({
        model
      });
      fixtures.innerHTML = '';
      view.render();
      fixtures.appendChild(view.el);
    });

    test('Value as default', () => {
      expect(view.model.get('value')).toEqual(defValue);
    });

    test('Placeholder as default', () => {
      var input = view.getInputEl();
      expect(input.getAttribute('placeholder')).toEqual(defValue);
    });

    test('Input value is set up to default', () => {
      expect(view.getInputValue()).toEqual(defValue);
    });
  });
});
