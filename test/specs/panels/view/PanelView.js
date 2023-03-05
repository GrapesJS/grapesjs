import PanelView from 'panels/view/PanelView';
import Panel from 'panels/model/Panel';
import Editor from 'editor';

describe('PanelView', () => {
  var fixtures;
  var em;
  var model;
  var view;

  beforeEach(() => {
    em = new Editor();
    model = new Panel(em.Panels);
    view = new PanelView(model);
    document.body.innerHTML = '<div id="fixtures"></div>';
    fixtures = document.body.querySelector('#fixtures');
    fixtures.appendChild(view.render().el);
  });

  afterEach(() => {
    view.remove();
  });

  test('Panel empty', () => {
    fixtures.firstChild.className = '';
    expect(fixtures.innerHTML).toEqual('<div class=""></div>');
  });

  test('Append content', () => {
    model.set('appendContent', 'test');
    model.set('appendContent', 'test2');
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
      model = new Panel({
        buttons: [{}],
      });
      view = new PanelView(model);
      document.body.innerHTML = '<div id="fixtures"></div>';
      fixtures = document.body.querySelector('#fixtures');
      fixtures.appendChild(view.render().el);
    });

    afterEach(() => {
      view.remove();
    });
  });
});
