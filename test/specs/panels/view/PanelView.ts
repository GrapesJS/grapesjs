import PanelView from '../../../../src/panels/view/PanelView';
import Panel from '../../../../src/panels/model/Panel';
import Editor from '../../../../src/editor';

describe('PanelView', () => {
  let fixtures: HTMLElement;
  let editor: Editor;
  let model: Panel;
  let view: PanelView;

  beforeEach(() => {
    editor = new Editor();
    model = new Panel(editor.Panels, {} as any);
    view = new PanelView(model);
    document.body.innerHTML = '<div id="fixtures"></div>';
    fixtures = document.body.querySelector('#fixtures')!;
    fixtures.appendChild(view.render().el);
  });

  afterEach(() => {
    view.remove();
  });

  test('Panel empty', () => {
    fixtures.firstElementChild!.className = '';
    expect(fixtures.innerHTML).toEqual('<div class=""></div>');
  });

  test('Append content', () => {
    model.set('appendContent', 'test' as any);
    model.set('appendContent', 'test2' as any);
    expect(view.$el.html()).toEqual('testtest2');
  });

  test('Update content', () => {
    model.set('content', 'test');
    model.set('content', 'test2');
    expect(view.$el.html()).toEqual('test2');
  });

  test('Hide panel', () => {
    expect(view.$el.hasClass('gjs-hidden')).toBeFalsy();
    model.set('visible', false);
    expect(view.$el.hasClass('gjs-hidden')).toBeTruthy();
  });

  test('Show panel', () => {
    model.set('visible', false);
    expect(view.$el.hasClass('gjs-hidden')).toBeTruthy();
    model.set('visible', true);
    expect(view.$el.hasClass('gjs-hidden')).toBeFalsy();
  });

  describe('Init with options', () => {
    beforeEach(() => {
      model = new Panel(
        {
          buttons: [{}],
        } as any,
        {} as any
      );
      view = new PanelView(model);
      document.body.innerHTML = '<div id="fixtures"></div>';
      fixtures = document.body.querySelector('#fixtures')!;
      fixtures.appendChild(view.render().el);
    });

    afterEach(() => {
      view.remove();
    });
  });
});
