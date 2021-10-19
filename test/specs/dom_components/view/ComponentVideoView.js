import ComponentVideoView from 'dom_components/view/ComponentVideoView';
import Component from 'dom_components/model/Component';

describe('ComponentVideoView', () => {
  var fixtures;
  var model;
  var view;

  beforeEach(() => {
    model = new Component();
    view = new ComponentVideoView({
      model
    });
    document.body.innerHTML = '<div id="fixtures"></div>';
    fixtures = document.body.querySelector('#fixtures');
    fixtures.appendChild(view.render().el);
  });

  afterEach(() => {
    view.remove();
  });

  test('No duplicated iframe/video when re-rendering', () => {
    view.render();
    expect(fixtures.innerHTML).toEqual(
      '<div data-gjs-type="default" data-highlightable="1"><video src="undefined" class="no-pointer" style="height: 100%; width: 100%;" poster="undefined"></video></div>'
    );
  });
});
