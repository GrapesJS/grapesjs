import SectorsView from '../../../../src/style_manager/view/SectorsView';
import Sectors from '../../../../src/style_manager/model/Sectors';

describe('SectorsView', () => {
  let fixtures: HTMLElement;
  let model: Sectors;
  let view: SectorsView;

  beforeEach(() => {
    model = new Sectors([]);
    view = new SectorsView({
      collection: model,
    });
    document.body.innerHTML = '<div id="fixtures"></div>';
    fixtures = document.body.firstChild as HTMLElement;
    fixtures.appendChild(view.render().el);
  });

  afterEach(() => {
    view.collection.reset();
  });

  test('Collection is empty', () => {
    expect(view.el.innerHTML).toEqual('');
  });

  test('Add new sectors', () => {
    view.collection.add([{}, {}]);
    expect(view.el.children.length).toEqual(2);
  });
});
