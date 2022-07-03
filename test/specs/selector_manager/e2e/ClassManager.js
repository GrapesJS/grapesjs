import Selector from 'selector_manager/model/Selector';

describe('E2E tests', () => {
  let fixtures;
  let components;
  let tagEl;
  let gjs;
  let module;

  describe('Interaction with Components', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="fixtures"><div id="SelectorManager-fixture"></div></div>';
      fixtures = document.body.firstChild;
      gjs = grapesjs.init({
        stylePrefix: '',
        storageManager: { autoload: 0, type: 0 },
        assetManager: { storageType: 'none' },
        container: '#SelectorManager-fixture',
      });
      components = gjs.getComponents();
      module = gjs.Selectors;
      fixtures.appendChild(module.render());
      tagEl = module.selectorTags;
    });

    afterEach(() => {
      gjs.destroy();
    });

    test('Assign correctly new class to component', () => {
      var model = components.add({});
      expect(model.get('classes').length).toEqual(0);
      gjs.select(model);
      tagEl.addNewTag('test');
      expect(model.get('classes').length).toEqual(1);
      expect(model.get('classes').at(0).get('name')).toEqual('test');
    });

    test('Classes from components are correctly imported inside main container', () => {
      var model = components.add([
        { classes: ['test11', 'test12', 'test13'] },
        { classes: ['test11', 'test22', 'test22'] },
      ]);
      expect(gjs.editor.get('SelectorManager').getAll().length).toEqual(4);
    });

    test('Class imported into component is the same model from main container', () => {
      var model = components.add({ classes: ['test1'] });
      var clModel = model.get('classes').at(0);
      var clModel2 = gjs.editor.get('SelectorManager').getAll().at(0);
      expect(clModel).toEqual(clModel2);
    });

    test('Can assign only one time the same class on selected component and the class viewer', () => {
      var model = components.add({});
      gjs.select(model);
      tagEl.addNewTag('test');
      tagEl.addNewTag('test');
      const sels = model.getSelectors();
      // Component has 1 selector
      expect(sels.length).toEqual(1);
      expect(sels.at(0).get('name')).toEqual('test');
      // One only selector added
      expect(module.getAll().length).toEqual(1);
      expect(module.getAll().at(0).get('name')).toEqual('test');
    });

    test('Removing from container removes also from selected component', () => {
      var model = components.add({});
      gjs.editor.setSelected(model);
      tagEl.addNewTag('test');
      tagEl.getClasses().find('.tag #close').trigger('click');
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

    test('Selectors are properly transformed to JSON', () => {
      const model = components.add({
        classes: [
          'test1',
          '.test1a',
          '#test2',
          { name: 'test3', label: 'test3' },
          { name: 'test4', label: 'test4a' },
          { name: 'test5' },
          { name: 'test6', type: Selector.TYPE_CLASS },
          { name: 'test7', type: Selector.TYPE_ID },
          { name: 'test8', type: Selector.TYPE_CLASS, protected: 1 },
          { name: 'test9', type: Selector.TYPE_ID, protected: 1 },
          { label: 'test10' },
          { label: 'test11', type: Selector.TYPE_ID },
          { label: 'test12', protected: 1 },
        ],
      });

      const modelTr = JSON.parse(JSON.stringify(model));
      expect(modelTr.classes).toEqual([
        'test1',
        'test1a',
        '#test2',
        'test3',
        { name: 'test4', label: 'test4a' },
        'test5',
        'test6',
        '#test7',
        { name: 'test8', protected: 1 },
        { name: 'test9', type: Selector.TYPE_ID, protected: 1 },
        'test10',
        '#test11',
        { name: 'test12', protected: 1 },
      ]);
    });
  });
});
