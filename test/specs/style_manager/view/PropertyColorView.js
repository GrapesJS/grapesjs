import PropertyColorView from 'style_manager/view/PropertyColorView';
import Property from 'style_manager/model/Property';
import Component from 'dom_components/model/Component';
import Editor from 'editor/model/Editor';
import DomComponents from 'dom_components';

describe('PropertyColorView', () => {
  let em;
  let dcomp;
  let compOpts;
  var component;
  var fixtures;
  var target;
  var model;
  var view;
  var propTarget;
  var propName = 'testprop';
  var propValue = '#fff';
  var defValue = 'test2value';

  beforeAll(() => {
    $.fn.spectrum = function() {
      return this;
    };
  });

  beforeEach(() => {
    em = new Editor({});
    dcomp = new DomComponents();
    compOpts = { em, componentTypes: dcomp.componentTypes };
    propTarget = { ...Backbone.Events };
    target = new Component({}, compOpts);
    component = new Component({}, compOpts);
    model = new Property({
      type: 'color',
      property: propName
    });
    propTarget.model = component;
    view = new PropertyColorView({
      model,
      propTarget
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
    expect(view.$input).toBeTruthy();
    expect(view.$color).toBeTruthy();
  });

  test('Input value is empty', () => {
    expect(view.model.get('value')).toBeFalsy();
    expect(view.getInputValue()).toBeFalsy();
  });

  test('Update model on setValue', () => {
    view.setValue(propValue);
    expect(view.getInputValue()).toEqual(propValue);
  });

  test('Update model on input change', () => {
    view.getInputEl().value = propValue;
    view.inputValueChanged();
    expect(view.model.get('value')).toEqual(propValue);
  });

  test('Update input on value change', () => {
    view.model.set('value', propValue);
    expect(view.getInputValue()).toEqual(propValue);
  });

  test('Update target on value change', () => {
    view.selectedComponent = component;
    view.model.set('value', propValue);
    var compStyle = view.selectedComponent.get('style');
    var assertStyle = {};
    assertStyle[propName] = propValue;
    expect(compStyle).toEqual(assertStyle);
  });

  describe('With target setted', () => {
    beforeEach(() => {
      target.model = component;
      view = new PropertyColorView({
        model,
        propTarget: target
      });
      fixtures.innerHTML = '';
      view.render();
      fixtures.appendChild(view.el);
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
      style[propName] = '#123123';
      component.set('style', style);
      view.propTarget.trigger('update');
      expect(view.model.get('value')).toEqual('#123123');
      expect(view.getInputValue()).toEqual('#123123');
    });
  });

  describe('Init property', () => {
    beforeEach(() => {
      component = new Component();
      model = new Property({
        type: 'color',
        property: propName,
        defaults: propValue
      });
      view = new PropertyColorView({
        model
      });
      fixtures.innerHTML = '';
      view.render();
      fixtures.appendChild(view.el);
    });

    test('Value as default', () => {
      expect(view.model.get('value')).toEqual(propValue);
    });

    test('Input value is the default', () => {
      expect(view.getInputValue()).toEqual(propValue);
    });
  });
});
