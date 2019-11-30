import PropertyIntegerView from 'style_manager/view/PropertyIntegerView';
import PropertyInteger from 'style_manager/model/PropertyInteger';
import Component from 'dom_components/model/Component';
import Editor from 'editor/model/Editor';
import DomComponents from 'dom_components';

describe('PropertyIntegerView', () => {
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
  var intValue = '55';
  var unitValue = 'px';
  var propValue = intValue + unitValue;
  var defValue = 'test2value';
  var units = ['px', '%', 'em'];
  var minValue = -15;
  var maxValue = 75;
  var unitsElSel = '.field-units select';

  beforeEach(() => {
    em = new Editor({});
    dcomp = new DomComponents();
    compOpts = { em, componentTypes: dcomp.componentTypes };
    propTarget = { ...Backbone.Events };
    target = new Component({}, compOpts);
    component = new Component({}, compOpts);
    model = new PropertyInteger({
      units,
      property: propName
    });
    propTarget.model = component;
    view = new PropertyIntegerView({
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
    expect(prop.querySelector(unitsElSel)).toBeTruthy();
  });

  test('Units rendered', () => {
    var select = view.el.querySelector(unitsElSel);
    expect(select.children.length).toEqual(units.length);
  });

  test('Units rendered correctly', () => {
    var children = view.el.querySelector(unitsElSel).children;
    expect(children[0].textContent).toEqual(units[0]);
    expect(children[1].textContent).toEqual(units[1]);
    expect(children[2].textContent).toEqual(units[2]);
  });

  test('Inputs should exist', () => {
    expect(view.input).toBeTruthy();
    expect(view.unit).toBeTruthy();
  });

  test('Input value is empty', () => {
    expect(view.model.get('value')).toBeFalsy();
  });

  test('Update model on setValue', () => {
    view.setValue(intValue + unitValue);
    expect(view.model.get('value')).toEqual(parseFloat(intValue));
    expect(view.model.get('unit')).toEqual(unitValue);
    expect(view.getInputValue()).toEqual(intValue);
    expect(view.unit.value).toEqual(unitValue);
  });

  test('Update model on input change', () => {
    view.$input.val(123).trigger('change');
    expect(view.model.get('value')).toEqual(123);
  });

  test('Update model on unit change', () => {
    view.$unit.val(units[1]).trigger('change');
    expect(view.model.get('unit')).toEqual(units[1]);
  });

  test('Update input on value change', () => {
    view.model.set('value', intValue);
    expect(view.getInputValue()).toEqual(intValue);
  });

  test('Update target on value change', () => {
    const val = `${intValue}%`;
    view.model.setValue(val);
    expect(view.getTargetValue()).toEqual(val);
  });

  describe('With target setted', () => {
    beforeEach(() => {
      target.model = component;
      view = new PropertyIntegerView({
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
      expect(view.model.get('value')).toEqual(parseFloat(intValue));
      expect(view.getInputValue()).toEqual(intValue);
    });

    test('Update value after multiple swaps', () => {
      var style = {};
      style[propName] = propValue;
      component.set('style', style);
      view.propTarget.trigger('update');
      style[propName] = '20em';
      component.set('style', style);
      view.propTarget.trigger('update');
      expect(view.model.get('value')).toEqual(20);
      expect(view.model.get('unit')).toEqual('em');
      expect(view.getInputValue()).toEqual('20');
      expect(view.$unit.val()).toEqual('em');
    });
  });

  describe('Init property', () => {
    beforeEach(() => {
      component = new Component();
      model = new PropertyInteger({
        units,
        property: propName,
        defaults: intValue,
        min: minValue,
        max: maxValue,
        unit: units[1]
      });
      view = new PropertyIntegerView({
        model
      });
      fixtures.innerHTML = '';
      view.render();
      fixtures.appendChild(view.el);
    });

    test('Value as default', () => {
      expect(view.model.get('value')).toEqual(parseInt(intValue));
      expect(view.model.get('unit')).toEqual(units[1]);
    });

    test('Input value is as default', () => {
      expect(view.getInputValue()).toEqual(intValue);
      expect(view.$unit.val()).toEqual(units[1]);
    });

    test('Input follows min', () => {
      view.$input.val(minValue - 50).trigger('change');
      expect(view.model.get('value')).toEqual(minValue);
      expect(view.getInputValue()).toEqual(minValue + '');
    });

    test('Input follows max', () => {
      view.$input.val(maxValue + 50).trigger('change');
      expect(view.model.get('value')).toEqual(maxValue);
      expect(view.getInputValue()).toEqual(maxValue + '');
    });
  });
});
