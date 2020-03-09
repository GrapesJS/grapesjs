import Selectors from 'selector_manager/model/Selectors';
import ClassTagsView from 'selector_manager/view/ClassTagsView';

describe('E2E tests', () => {
  var fixtures;
  var components;
  var tagEl;
  var gjs;

  var instClassTagViewer = (gjs, fixtures) => {
    var tagEl;
    var clm = gjs.editor.get('SelectorManager');

    if (clm) {
      tagEl = new ClassTagsView({
        collection: new Selectors([]),
        config: { em: gjs.editor }
      }).render();
      fixtures.appendChild(tagEl.el);
    }

    return tagEl;
  };
  /*
    before(function () {
      this.$fixtures  = $("#fixtures");
      this.$fixture   = $('<div id="SelectorManager-fixture"></div>');
    });
*/
  beforeEach(() => {
    document.body.innerHTML =
      '<div id="fixtures"><div id="SelectorManager-fixture"></div></div>';
    fixtures = document.body.firstChild;
    gjs = grapesjs.init({
      stylePrefix: '',
      storageManager: { autoload: 0, type: 0 },
      assetManager: {
        storageType: 'none'
      },
      container: '#SelectorManager-fixture'
    });
  });

  describe('Interaction with Components', () => {
    beforeEach(() => {
      components = gjs.getComponents();
      tagEl = instClassTagViewer(gjs, fixtures);
    });

    test('Assign correctly new class to component', () => {
      var model = components.add({});
      expect(model.get('classes').length).toEqual(0);
      gjs.select(model);
      tagEl.addNewTag('test');
      expect(model.get('classes').length).toEqual(1);
      expect(
        model
          .get('classes')
          .at(0)
          .get('name')
      ).toEqual('test');
    });

    test('Classes from components are correctly imported inside main container', () => {
      var model = components.add([
        { classes: ['test11', 'test12', 'test13'] },
        { classes: ['test11', 'test22', 'test22'] }
      ]);
      expect(gjs.editor.get('SelectorManager').getAll().length).toEqual(4);
    });

    test('Class imported into component is the same model from main container', () => {
      var model = components.add({ classes: ['test1'] });
      var clModel = model.get('classes').at(0);
      var clModel2 = gjs.editor
        .get('SelectorManager')
        .getAll()
        .at(0);
      expect(clModel).toEqual(clModel2);
    });

    test('Can assign only one time the same class on selected component and the class viewer', () => {
      var model = components.add({});
      gjs.select(model);
      tagEl.addNewTag('test');
      tagEl.addNewTag('test');
      expect(model.getSelectors().length).toEqual(1);
      expect(
        model
          .getSelectors()
          .at(0)
          .get('name')
      ).toEqual('test');
      expect(tagEl.collection.length).toEqual(1);
      expect(tagEl.collection.at(0).get('name')).toEqual('test');
    });

    test('Removing from container removes also from selected component', () => {
      var model = components.add({});
      gjs.editor.setSelected(model);
      tagEl.addNewTag('test');
      tagEl
        .getClasses()
        .find('.tag #close')
        .trigger('click');
      setTimeout(() => expect(model.get('classes').length).toEqual(0));
    });

    test('Trigger correctly event on target with new class add', () => {
      var spy = sinon.spy();
      var model = components.add({});
      gjs.select(model);
      tagEl.addNewTag('test');
      gjs.editor.on('component:update:classes', spy);
      tagEl.addNewTag('test');
      expect(spy.called).toEqual(false);
      tagEl.addNewTag('test2');
      expect(spy.called).toEqual(true);
    });
  });
});
