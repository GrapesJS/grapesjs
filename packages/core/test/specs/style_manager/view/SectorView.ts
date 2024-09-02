import SectorView from '../../../../src/style_manager/view/SectorView';
import Sector from '../../../../src/style_manager/model/Sector';

describe('SectorView', () => {
  let fixtures: HTMLElement;
  let model: Sector;
  let view: SectorView;

  beforeEach(() => {
    model = new Sector({ name: 'sector' });
    view = new SectorView({ model, config: {} });
    document.body.innerHTML = '<div id="fixtures"></div>';
    fixtures = document.body.querySelector('#fixtures') as HTMLElement;
    fixtures.appendChild(view.render().el);
  });

  afterEach(() => {
    view.remove();
  });

  test('Rendered correctly', () => {
    const sector = view.el;
    expect(sector.querySelector('[data-sector-title]')).toBeTruthy();
    const props = sector.querySelector('.properties');
    expect(props).toBeTruthy();
    expect(sector.classList.contains('open')).toEqual(true);
  });

  test('No properties', () => {
    const props = view.el.querySelector('.properties')!;
    expect(props.innerHTML).toEqual('');
  });

  test('Update on open', () => {
    const sector = view.el;
    const props = sector.querySelector<HTMLElement>('.properties')!;
    model.set('open', false);
    expect(sector.classList.contains('open')).toEqual(false);
    expect(props.style.display).toEqual('none');
  });

  test('Toggle on click', () => {
    const sector = view.el;
    view.$el.find('[data-sector-title]').click();
    expect(sector.classList.contains('open')).toEqual(false);
  });

  describe('Init with options', () => {
    beforeEach(() => {
      model = new Sector({
        open: false,
        name: 'TestName',
        properties: [{ type: 'integer' }, { type: 'integer' }, { type: 'integer' }],
      });
      view = new SectorView({ model, config: {} });
      document.body.innerHTML = '<div id="fixtures"></div>';
      fixtures = document.body.querySelector('#fixtures') as HTMLElement;
      fixtures.appendChild(view.render().el);
    });

    test('Rendered correctly', () => {
      const sector = view.el;
      const props = sector.querySelector('.properties') as HTMLElement;
      expect(sector.querySelector('[data-sector-title]')!.innerHTML).toContain('TestName');
      expect(props).toBeTruthy();
      expect(sector.classList.contains('open')).toEqual(false);
      expect(props.style.display).toEqual('none');
    });

    test('Has properties', () => {
      const props = view.el.querySelector('.properties') as HTMLElement;
      expect(props.children.length).toEqual(3);
    });
  });
});
