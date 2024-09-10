import PanelsView from '../../../../src/panels/view/PanelsView';
import Panels from '../../../../src/panels/model/Panels';
import Editor from '../../../../src/editor';

describe('PanelsView', () => {
  let fixtures: HTMLElement;
  let editor: Editor;
  let model: Panels;
  let view: PanelsView;

  beforeEach(() => {
    editor = new Editor({});
    model = new Panels(editor.Panels, []);
    view = new PanelsView(model);
    document.body.innerHTML = '<div id="fixtures"></div>';
    fixtures = document.body.querySelector('#fixtures')!;
    fixtures.appendChild(view.render().el);
  });

  afterEach(() => {
    view.collection.reset();
  });

  test('Collection is empty', () => {
    expect(view.$el.html()).toEqual('');
  });

  test('Add new panel', () => {
    const spy = jest.spyOn(view, 'addToCollection' as any);
    view.collection.add([{}]);
    expect(spy).toBeCalledTimes(1);
  });

  test('Render new panel', () => {
    view.collection.add([{}]);
    expect(view.$el.html()).toBeTruthy();
  });
});
