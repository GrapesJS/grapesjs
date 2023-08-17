import Components from '../../../../src/dom_components/model/Components';
import ComponentsView from '../../../../src/dom_components/view/ComponentsView';
import Editor from '../../../../src/editor/model/Editor';

describe('ComponentsView', () => {
  let model: Components;
  let view: ComponentsView;
  let dcomp: Editor['Components'];
  let compOpts: any;
  let em: Editor;

  beforeEach(() => {
    em = new Editor();
    dcomp = em.Components;
    compOpts = {
      em,
      componentTypes: dcomp.componentTypes,
    };
    model = new Components([], compOpts);
    view = new ComponentsView({
      // @ts-ignore
      collection: model,
      componentTypes: dcomp.componentTypes,
      config: { em },
    });
    document.body.innerHTML = '<div id="fixtures"></div>';
    document.body.querySelector('#fixtures')!.appendChild(view.render().el);
  });

  afterEach(() => {
    view.collection.reset();
  });

  test('Collection is empty', () => {
    expect(view.$el.html()).toBeFalsy();
  });

  test('Add new component', () => {
    const addSpy = jest.spyOn(view, 'addToCollection');
    view.collection.add({});
    expect(addSpy).toBeCalledTimes(1);
  });

  test('Render new component', () => {
    view.collection.add({});
    expect(view.$el.html()).toBeTruthy();
  });
});
