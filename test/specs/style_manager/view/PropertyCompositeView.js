import PropertyCompositeView from 'style_manager/view/PropertyCompositeView';
import PropertyComposite from 'style_manager/model/PropertyComposite';
import Component from 'dom_components/model/Component';
import Editor from 'editor/model/Editor';
import DomComponents from 'dom_components';

describe('PropertyCompositeView', () => {
  let em;
  let dcomp;
  let compOpts;
  var component;
  var fixtures;
  var target;
  var model;
  var view;
  var propName = 'testprop';
  var propValue = 'test1value';
  var defValue = 'test2value';
  var properties = [
    {
      property: 'subprop1'
    },
    {
      type: 'integer',
      property: 'subprop2',
      defaults: 0,
      units: ['%', 'px']
    },
    {
      type: 'select',
      property: 'subprop3',
      defaults: 'val2',
      list: [{ value: 'val1' }, { value: 'val2' }, { value: 'val3' }]
    }
  ];

  beforeEach(() => {
    em = new Editor({});
    dcomp = new DomComponents();
    compOpts = { em, componentTypes: dcomp.componentTypes };
    target = new Component({}, compOpts);
    component = new Component({}, compOpts);
    target.model = component;
    model = new PropertyComposite({
      type: 'composite',
      property: propName,
      properties
    });
    view = new PropertyCompositeView({
      model
    });
    document.body.innerHTML = '<div id="fixtures"></div>';
    fixtures = document.body.firstChild;
    view.render();
    fixtures.appendChild(view.el);
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

  test('Properties rendered', () => {
    var prop = view.el;
    expect(prop.querySelector('.properties')).toBeTruthy();
  });

  test('Properties rendered correctly', () => {
    var children = view.el.querySelector('.properties').children;
    expect(children.length).toEqual(properties.length);
    expect(children[0].id).toEqual(properties[0].property);
    expect(children[1].id).toEqual(properties[1].property);
    expect(children[2].id).toEqual(properties[2].property);
  });

  test('Props should exist', () => {
    expect(view.$props).toBeTruthy();
  });

  test('Input value is empty', () => {
    expect(model.getFullValue()).toEqual('0 val2');
  });

  test('Update input on value change', () => {
    view.model.set('value', propValue);
    // Fetch always values from properties
    expect(view.getInputValue()).toEqual('0 val2');
  });

  describe('With target setted', () => {
    var prop2Val;
    var prop3Val;
    var prop2Unit;
    var finalResult;
    var $prop1;
    var $prop2;
    var $prop3;

    beforeEach(() => {
      model = new PropertyComposite({
        type: 'composite',
        property: propName,
        properties
      });
      view = new PropertyCompositeView({
        model,
        propTarget: target
      });
      fixtures.innerHTML = '';
      view.render();
      fixtures.appendChild(view.el);
      prop2Val = properties[1].defaults;
      prop2Unit = properties[1].units[0];
      prop3Val = properties[2].list[2].value;
      finalResult = propValue + ' ' + prop2Val + ' ' + prop3Val;
      $prop1 = view.$props.find('#' + properties[0].property + ' input');
      $prop2 = view.$props.find('#' + properties[1].property + ' input');
      $prop3 = view.$props.find('#' + properties[2].property + ' select');
    });

    test('Update model on input change', () => {
      $prop1.val(propValue).trigger('change');
      $prop3.val(prop3Val).trigger('change');
      expect(model.getFullValue()).toEqual(finalResult);
    });

    test('Update value on models change', () => {
      view.model
        .get('properties')
        .at(0)
        .set('value', propValue);
      view.model
        .get('properties')
        .at(2)
        .set('value', prop3Val);
      expect(view.model.get('value')).toEqual(finalResult);
    });

    test('Update target on value change', () => {
      $prop1.val(propValue).trigger('change');
      var compStyle = view.getTarget().get('style');
      var assertStyle = {};
      assertStyle[propName] = propValue + ' 0 val2';
      expect(compStyle).toEqual(assertStyle);
    });

    test('Update target on detached value change', () => {
      model = new PropertyComposite({
        type: 'composite',
        property: propName,
        properties,
        detached: true
      });
      view = new PropertyCompositeView({
        model,
        propTarget: target
      });
      fixtures.innerHTML = '';
      view.render();
      fixtures.appendChild(view.el);
      $prop1 = view.$props.find('#' + properties[0].property + ' input');
      $prop1.val(propValue).trigger('change');
      var compStyle = view.getTarget().get('style');
      var assertStyle = {};
      assertStyle[properties[0].property] = $prop1.val();
      expect(compStyle).toEqual(assertStyle);
    });

    test('Update value and input on target swap', () => {
      var style = {};
      style[propName] = finalResult;
      component.set('style', style);
      view.propTarget.trigger('update');
      expect($prop1.val()).toEqual(propValue);
      expect($prop3.val()).toEqual(prop3Val);
    });

    test('Update value after multiple swaps', () => {
      var style = {};
      style[propName] = finalResult;
      component.set('style', style);
      view.propTarget.trigger('update');
      style[propName] =
        propValue + '2 ' + prop2Val + '2' + prop2Unit + ' ' + 'val1';
      component.set('style', style);
      view.propTarget.trigger('update');
      expect($prop1.val()).toEqual(propValue + '2');
      expect($prop2.val()).toEqual('2');
      expect($prop3.val()).toEqual('val1');
    });

    test('The value is correctly extracted from the composite string', () => {
      var style = {};
      style[propName] = 'value1 value2 value3 value4';
      component.set('style', style);
      expect(view.valueOnIndex(2)).toEqual('value3');
      expect(view.valueOnIndex(0)).toEqual('value1');
      expect(view.valueOnIndex(4)).toEqual(undefined);
    });

    test('Build value from properties', () => {
      view.model
        .get('properties')
        .at(0)
        .set('value', propValue);
      view.model
        .get('properties')
        .at(2)
        .set('value', prop3Val);
      expect(model.getFullValue()).toEqual(finalResult);
    });
  });

  describe('Init property', () => {
    beforeEach(() => {
      model = new PropertyComposite({
        type: 'composite',
        property: propName,
        properties,
        defaults: defValue
      });
      view = new PropertyCompositeView({
        model
      });
      fixtures.innerHTML = '';
      view.render();
      fixtures.appendChild(view.el);
    });

    test('Value as default', () => {
      expect(view.model.get('value')).toEqual(defValue);
    });
  });
});
