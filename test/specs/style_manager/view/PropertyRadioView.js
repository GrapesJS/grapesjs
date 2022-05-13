import PropertyRadioView from 'style_manager/view/PropertyRadioView';
import Property from 'style_manager/model/PropertySelect';
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
  var propName = 'testprop';
  var propValue = 'test1value';
  var defValue = 'test2value';
  var options = [
    { value: 'test1value', title: 'testtitle' },
    { name: 'test2', value: 'test2value' },
  ];

  // Have some issue with getCheckedEl() and jsdom
  // this view.getInputEl().querySelector('input:checked') return null
  // but view.getInputEl().querySelectorAll('input:checked')[0] works
  var getCheckedEl = view => view.getInputEl().querySelectorAll('input:checked')[0];

  beforeEach(() => {
    em = new Editor({});
    dcomp = new DomComponents(em);
    compOpts = { em, componentTypes: dcomp.componentTypes };
    target = new Component({}, compOpts);
    component = new Component({}, compOpts);
    model = new Property(
      {
        type: 'radio',
        list: options,
        property: propName,
      },
      { em }
    );
    view = new PropertyRadioView({ model });
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
    expect(children[0].querySelector('label').textContent).toEqual('test1value');
    expect(children[1].querySelector('label').textContent).toEqual('test2');
    expect(children[0].querySelector('input').value).toEqual(options[0].value);
    expect(children[1].querySelector('input').value).toEqual(options[1].value);
    expect(children[0].querySelector('label').getAttribute('title')).toEqual(options[0].title);
    expect(children[1].querySelector('label').getAttribute('title')).toEqual(null);
  });

  test('Input should exist', () => {
    expect(view.input).toBeTruthy();
  });

  test('Input value is empty', () => {
    expect(view.model.get('value')).toBeFalsy();
  });

  test('Update model on input change', () => {
    view.setValue(propValue);
    view.inputValueChanged({
      target: { value: propValue },
      stopPropagation() {},
    });
    expect(view.model.get('value')).toEqual(propValue);
  });

  test('Update input on value change', done => {
    view.model.set('value', propValue);
    setTimeout(() => {
      expect(getCheckedEl(view).value).toEqual(propValue);
      done();
    }, 15);
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
      view = new PropertyRadioView({
        model,
      });
      fixtures.innerHTML = '';
      view.render();
      fixtures.appendChild(view.el);
    });

    test('Value as default', () => {
      expect(view.model.getValue()).toEqual(defValue);
    });

    test('Input value is as default', () => {
      expect(view.model.getDefaultValue()).toEqual(defValue);
    });
  });
});
