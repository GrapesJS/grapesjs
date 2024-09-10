import PropertyNumberView from '../../../../src/style_manager/view/PropertyNumberView';
import PropertyNumber from '../../../../src/style_manager/model/PropertyNumber';
import Component from '../../../../src/dom_components/model/Component';
import Editor from '../../../../src/editor/model/Editor';

describe('PropertyNumberView', () => {
  let em: Editor;
  let dcomp: Editor['Components'];
  let compOpts: any;
  let component: Component;
  let fixtures: HTMLElement;
  let target: Component;
  let model: PropertyNumber;
  let view: PropertyNumberView;
  let propName = 'testprop';
  let intValue = '55';
  let unitValue = 'px';
  let units = ['px', '%', 'em'];
  let minValue = -15;
  let maxValue = 75;
  let unitsElSel = '.field-units select';

  beforeEach(() => {
    em = new Editor();
    dcomp = em.Components;
    compOpts = { em, componentTypes: dcomp.componentTypes };
    target = new Component({}, compOpts);
    component = new Component({}, compOpts);
    model = new PropertyNumber(
      {
        units,
        property: propName,
      },
      { em },
    );
    view = new PropertyNumberView({ model });
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
    expect(prop.querySelector(unitsElSel)).toBeTruthy();
  });

  test('Units rendered', () => {
    var select = view.el.querySelector(unitsElSel)!;
    expect(select.children.length).toEqual(units.length + 1); // (+ hidden option)
  });

  test('Units rendered correctly', () => {
    var children = view.el.querySelector(unitsElSel)!.children;
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
    expect(model.get('value')).toEqual(parseFloat(intValue));
    expect(model.get('unit')).toEqual(unitValue);
    expect(view.getInputEl().value).toEqual(intValue);
  });

  test('Update model on input change', () => {
    view.inputInst.inputEl.val(123).trigger('change');
    expect(view.model.get('value')).toEqual(123);
  });

  test('Update model on unit change', () => {
    view.inputInst.unitEl.value = units[1];
    view.inputInst.handleUnitChange({ stopPropagation() {} });
    expect(model.get('unit')).toEqual(units[1]);
  });

  test('Update input on value change', () => {
    view.model.set('value', intValue);
    expect(view.getInputEl().value).toEqual(intValue);
  });

  describe('Init property', () => {
    beforeEach(() => {
      component = new Component({}, compOpts);
      model = new PropertyNumber(
        {
          units,
          property: propName,
          defaults: intValue,
          min: minValue,
          max: maxValue,
          unit: units[1],
        },
        { em },
      );
      view = new PropertyNumberView({
        model,
      });
      fixtures.innerHTML = '';
      view.render();
      fixtures.appendChild(view.el);
    });

    test('Value as default', () => {
      expect(model.getValue()).toEqual(intValue);
      expect(model.getUnit()).toEqual(units[1]);
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
