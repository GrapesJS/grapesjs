import PropertyNumberView from 'style_manager/view/PropertyNumberView';
import PropertyNumber from 'style_manager/model/PropertyNumber';
import Component from 'dom_components/model/Component';
import Editor from 'editor/model/Editor';
import DomComponents from 'dom_components';

describe('PropertyNumberView', () => {
  let em;
  let dcomp;
  let compOpts;
  var component;
  var fixtures;
  var target;
  var model;
  var view;
  var propName = 'testprop';
  var intValue = '55';
  var unitValue = 'px';
  var propValue = intValue + unitValue;
  var units = ['px', '%', 'em'];
  var minValue = -15;
  var maxValue = 75;
  var unitsElSel = '.field-units select';

  beforeEach(() => {
    em = new Editor({});
    dcomp = new DomComponents(em);
    compOpts = { em, componentTypes: dcomp.componentTypes };
    target = new Component({}, compOpts);
    component = new Component({}, compOpts);
    model = new PropertyNumber(
      {
        units,
        property: propName,
      },
      { em }
    );
    view = new PropertyNumberView({ model });
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
    expect(select.children.length).toEqual(units.length + 1); // (+ hidden option)
  });

  test('Units rendered correctly', () => {
    var children = view.el.querySelector(unitsElSel).children;
    expect(children[1].textContent).toEqual(units[0]);
    expect(children[2].textContent).toEqual(units[1]);
    expect(children[3].textContent).toEqual(units[2]);
  });

  test('Inputs should exist', () => {
    expect(view.input).toBeTruthy();
  });

  test('Input value is empty', () => {
    expect(view.model.get('value')).toBeFalsy();
  });

  test('Update model on setValue', () => {
    view.inputInst.setValue(intValue + unitValue);
    expect(view.model.get('value')).toEqual(parseFloat(intValue));
    expect(view.model.get('unit')).toEqual(unitValue);
    expect(view.getInputEl().value).toEqual(intValue);
  });

  test('Update model on input change', () => {
    view.inputInst.inputEl.val(123).trigger('change');
    expect(view.model.get('value')).toEqual(123);
  });

  test('Update model on unit change', () => {
    view.inputInst.unitEl.value = units[1];
    view.inputInst.handleUnitChange({ stopPropagation() {} });
    expect(view.model.get('unit')).toEqual(units[1]);
  });

  test('Update input on value change', () => {
    view.model.set('value', intValue);
    expect(view.getInputEl().value).toEqual(intValue);
  });

  describe('Init property', () => {
    beforeEach(() => {
      component = new Component();
      model = new PropertyNumber(
        {
          units,
          property: propName,
          defaults: intValue,
          min: minValue,
          max: maxValue,
          unit: units[1],
        },
        { em }
      );
      view = new PropertyNumberView({
        model,
      });
      fixtures.innerHTML = '';
      view.render();
      fixtures.appendChild(view.el);
    });

    test('Value as default', () => {
      expect(view.model.getValue()).toEqual(intValue);
      expect(view.model.getUnit()).toEqual(units[1]);
    });

    test('Input value is as default', () => {
      expect(view.getInputEl().value).toEqual('');
      expect(view.getInputEl().placeholder).toEqual(intValue);
      expect(view.inputInst.unitEl.value).toEqual(units[1]);
    });

    test('Input follows min', () => {
      view.inputInst.inputEl.val(minValue - 50).trigger('change');
      expect(view.model.get('value')).toEqual(minValue);
      expect(view.getInputEl().value).toEqual(minValue + '');
    });

    test('Input follows max', () => {
      view.inputInst.inputEl.val(maxValue + 50).trigger('change');
      expect(view.model.get('value')).toEqual(maxValue);
      expect(view.getInputEl().value).toEqual(maxValue + '');
    });
  });
});
