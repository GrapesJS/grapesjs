import DevicesView from 'device_manager/view/DevicesView';
import Devices from 'device_manager/model/Devices';
import { Model } from 'backbone';

describe('DevicesView', () => {
  var model;
  var view;
  var editorModel;
  var em;

  beforeEach(() => {
    model = new Devices([]);
    view = new DevicesView({
      collection: model,
      config: { em: new Model() },
    });
    document.body.innerHTML = '<div id="fixtures"></div>';
    document.body.querySelector('#fixtures').appendChild(view.render().el);
  });

  afterEach(() => {
    view.collection.reset();
  });

  test('The content is not empty', () => {
    expect(view.el.innerHTML).toBeTruthy();
  });

  test('No options without devices', () => {
    expect(view.getOptions()).toEqual('');
  });

  test('Render new button', () => {
    view.collection.add({});
    expect(view.$el.html()).toBeTruthy();
  });

  describe('With configs', () => {
    beforeEach(() => {
      editorModel = new Model();
      model = new Devices([{ name: 'test1' }, { name: 'test2' }]);
      view = new DevicesView({
        collection: model,
        config: { em: editorModel },
      });
      document.body.innerHTML = '<div id="fixtures"></div>';
      document.body.querySelector('#fixtures').appendChild(view.render().el);
    });

    test('Update device on select change', () => {
      view.$el.find('select').val('test2');
      view.updateDevice();
      expect(view.config.em.get('device')).toEqual('test2');
    });

    test('Render options', () => {
      expect(view.getOptions()).toEqual('<option value="test1">test1</option><option value="test2">test2</option>');
    });
  });
});
