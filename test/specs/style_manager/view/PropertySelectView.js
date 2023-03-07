import PropertySelectView from 'style_manager/view/PropertySelectView';
import Property from 'style_manager/model/PropertyRadio';
import Editor from 'editor/model/Editor';
import DomComponents from 'dom_components';
import Component from 'dom_components/model/Component';

describe('PropertySelectView', () => {
  let em;
  let dcomp;
  let compOpts;
  var component;
  var fixtures;
  var target;
  var model;
  var view;
  var options;
  var propName = 'testprop';
  var propValue = 'test1value';
  var defValue = 'test2value';
  var options = [
    { value: 'test1value', style: 'test:style' },
    { name: 'test2', value: 'test2value' },
  ];

  beforeEach(() => {
    em = new Editor({});
    dcomp = new DomComponents(em);
    compOpts = { em, componentTypes: dcomp.componentTypes };
    target = new Component({}, compOpts);
    component = new Component({}, compOpts);
    model = new Property(
      {
        type: 'select',
        list: options,
        property: propName,
      },
      { em }
    );
    view = new PropertySelectView({ model });
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

  test('Select rendered', () => {
    var prop = view.el;
    expect(prop.querySelector('select')).toBeTruthy();
  });

  test('Options rendered', () => {
    var select = view.el.querySelector('select');
    expect(select.children.length).toEqual(options.length);
  });

  test('Options rendered correctly', () => {
    var select = view.el.querySelector('select');
    var children = select.children;
    expect(children[0].value).toEqual(options[0].value);
    expect(children[1].value).toEqual(options[1].value);
    expect(children[0].textContent).toEqual(options[0].value);
    expect(children[1].textContent).toEqual(options[1].name);
    expect(children[0].getAttribute('style')).toEqual(options[0].style);
    expect(children[1].getAttribute('style')).toEqual(null);
  });

  test('Input should exist', () => {
    expect(view.input).toBeTruthy();
  });

  test('Input value is empty', () => {
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
    }, 11);
  });

  describe('Init property', () => {
    beforeEach(() => {
      component = new Component();
      model = new Property({
        type: 'select',
        list: options,
        defaults: defValue,
        property: propName,
      });
      view = new PropertySelectView({
        model,
      });
      fixtures.innerHTML = '';
      view.render();
      fixtures.appendChild(view.el);
    });

    test('Value as default', () => {
      expect(view.model.getValue()).toEqual(defValue);
    });

    test('Empty value as default', () => {
      options = [
        { value: '', name: 'test' },
        { value: 'test1value', name: 'test1' },
        { value: 'test2value', name: 'test2' },
        { value: '', name: 'TestDef' },
      ];
      component = new Component();
      model = new Property({
        type: 'select',
        list: options,
        defaults: '',
        property: 'emptyDefault',
      });
      view = new PropertySelectView({
        model,
      });
      view.render();
      fixtures.innerHTML = '';
      fixtures.appendChild(view.el);
      expect(view.getInputEl().value).toEqual('');
    });

    test('Input value is as default', () => {
      expect(view.model.getDefaultValue()).toEqual(defValue);
    });
  });
});
