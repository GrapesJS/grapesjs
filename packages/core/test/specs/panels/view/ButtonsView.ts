import ButtonsView from '../../../../src/panels/view/ButtonsView';
import Buttons from '../../../../src/panels/model/Buttons';
import EditorModel from '../../../../src/editor/model/Editor';

describe('ButtonsView', () => {
  let fixtures: HTMLElement;
  let em: EditorModel;
  let model: Buttons;
  let view: ButtonsView;

  beforeEach(() => {
    em = new EditorModel({});
    model = new Buttons(em.Panels, []);
    view = new ButtonsView(model);
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

  test('Add new button', () => {
    const spy = jest.spyOn(view, 'addToCollection' as any);
    view.collection.add([{}]);
    expect(spy).toBeCalledTimes(1);
  });

  test('Render new button', () => {
    view.collection.add([{}]);
    expect(view.$el.html()).toBeTruthy();
  });
});
