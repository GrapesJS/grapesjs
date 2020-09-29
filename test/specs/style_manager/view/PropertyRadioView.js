import PropertyRadioView from 'style_manager/view/PropertyRadioView';
import Property from 'style_manager/model/Property';
import Component from 'dom_components/model/Component';
import Editor from 'editor/model/Editor';
import DomComponents from 'dom_components';

describe('PropertyRadioView', () => {
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
  var propValue = 'test1value';
  var defValue = 'test2value';
  var options = [
    { value: 'test1value', title: 'testtitle' },
    { name: 'test2', value: 'test2value' }
  ];

  // Have some issue with getCheckedEl() and jsdom
  // this view.getInputEl().querySelector('input:checked') return null
  // but view.getInputEl().querySelectorAll('input:checked')[0] works
  var getCheckedEl = view =>
    view.getInputEl().querySelectorAll('input:checked')[0];

  beforeEach(() => {
    em = new Editor({});
    dcomp = new DomComponents();
    compOpts = { em, componentTypes: dcomp.componentTypes };
    propTarget = { ...Backbone.Events };
    target = new Component({}, compOpts);
    component = new Component({}, compOpts);
    model = new Property({
      type: 'radio',
      list: options,
      property: propName
    });
    propTarget.model = component;
    view = new PropertyRadioView({
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
  });

  test('Rendered correctly', () => {
    var prop = view.el;
    expect(fixtures.querySelector('.property')).toBeTruthy();
    expect(prop.querySelector('.label')).toBeTruthy();
    expect(prop.querySelector('.field')).toBeTruthy();
  });

  test('Radio rendered', () => {
    var prop = view.el;
    expect(prop.querySelector('input[type=radio]')).toBeTruthy();
  });

  test('Options rendered', () => {
    var input = view.el.querySelector('.field').firstChild;
    expect(input.children.length).toEqual(options.length);
  });

  test('Options rendered correctly', () => {
    var children = view.el.querySelector('.field').firstChild.children;
    expect(children[0].querySelector('label').textContent).toEqual(
      'test1value'
    );
    expect(children[1].querySelector('label').textContent).toEqual('test2');
    expect(children[0].querySelector('input').value).toEqual(options[0].value);
    expect(children[1].querySelector('input').value).toEqual(options[1].value);
    expect(children[0].querySelector('label').getAttribute('title')).toEqual(
      options[0].title
    );
    expect(children[1].querySelector('label').getAttribute('title')).toEqual(
      null
    );
  });

  test('Input should exist', () => {
    expect(view.input).toBeTruthy();
  });

  test('Input value is empty', () => {
    expect(view.model.get('value')).toBeFalsy();
  });

  test('Update model on input change', () => {
    view.setValue(propValue);
    expect(getCheckedEl(view).value).toEqual(propValue);
  });

  test('Update input on value change', () => {
    view.model.set('value', propValue);
    expect(getCheckedEl(view).value).toEqual(propValue);
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
      view = new PropertyRadioView({
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
      expect(getCheckedEl(view).value).toEqual(propValue);
    });

    test('Update value after multiple swaps', () => {
      var style = {};
      style[propName] = propValue;
      component.set('style', style);
      view.propTarget.trigger('update');
      style[propName] = 'test2value';
      component.set('style', style);
      view.propTarget.trigger('update');
      expect(view.model.get('value')).toEqual('test2value');
      expect(getCheckedEl(view).value).toEqual('test2value');
    });
  });

  describe('Init property', () => {
    beforeEach(() => {
      component = new Component();
      model = new Property({
        type: 'select',
        list: options,
        defaults: defValue,
        property: propName
      });
      view = new PropertyRadioView({
        model
      });
      fixtures.innerHTML = '';
      view.render();
      fixtures.appendChild(view.el);
    });

    test('Value as default', () => {
      expect(view.model.get('value')).toEqual(defValue);
    });

    test('Input value is as default', () => {
      expect(view.model.getDefaultValue()).toEqual(defValue);
    });
  });
});
