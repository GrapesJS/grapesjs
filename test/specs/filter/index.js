import FilterView from 'filter/view/FilterView';
import { before } from 'underscore';

describe('FilterView', () => {
  var filter;
  var fixtures;
  var ppfx = 'gjs-';
  beforeEach(() => {
    filter = new FilterView({
      ppfx: ppfx,
      em: '',
      clb: value => {}
    });
    document.body.innerHTML = '<div id="fixture"></div>';
    fixtures = document.body.firstChild;
    fixtures.appendChild(filter.render().el);
  });

  afterAll(() => {
    filter = null;
  });

  test('Style postfix is defined', () => {
    expect(filter.ppfx).toBeTruthy();
  });

  test('Callback is defined', () => {
    expect(filter.clb).toBeTruthy();
  });
  test('Rendered Correctly', () => {
    var view = filter.el;
    expect(fixtures.querySelector(`.${ppfx}input-holder`)).toBeTruthy();
    expect(fixtures.querySelector(`.${ppfx}clm-tags-btn`)).toBeTruthy();
  });

  test('Input is defined after initialization', () => {
    expect(filter.inputEl).toBeTruthy();
  });

  test('Clear input event removes value', () => {
    filter.clearInput(new MouseEvent('mousedown'));
    expect(filter.getInputElement().value).toBe('');
  });
});
