import { setStyleText } from '../../../src/utils/dom';

describe('setStyleText', () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement('div');
  });

  test('applies a single declaration', () => {
    setStyleText(el, 'color: red');
    expect(el.style.color).toBe('red');
  });

  test('applies multiple declarations', () => {
    setStyleText(el, 'color: red; padding-left: 10px');
    expect(el.style.color).toBe('red');
    expect(el.style.paddingLeft).toBe('10px');
  });

  test('replaces any style previously set', () => {
    setStyleText(el, 'color: red; width: 10px');
    setStyleText(el, 'color: blue');
    expect(el.style.color).toBe('blue');
    expect(el.style.width).toBe('');
  });

  test('keeps `;` nested in functions', () => {
    const url = 'data:image/gif;base64,R0lGODlh';
    setStyleText(el, `background-image: url(${url}); color: red`);
    // jsdom re-serializes the url with quotes, what matters is that the
    // `;` inside it did not split the declaration
    expect(el.style.backgroundImage).toContain(url);
    expect(el.style.color).toBe('red');
  });

  test('keeps `;` nested in strings', () => {
    setStyleText(el, `content: "a;b"; color: red`);
    expect(el.style.color).toBe('red');
  });

  test('supports !important', () => {
    setStyleText(el, 'color: red !important');
    expect(el.style.getPropertyPriority('color')).toBe('important');
    expect(el.style.color).toBe('red');
  });

  test('supports custom properties', () => {
    setStyleText(el, '--my-var: 10px');
    expect(el.style.getPropertyValue('--my-var')).toBe('10px');
  });

  test('tolerates empty, partial and trailing declarations', () => {
    setStyleText(el, ';; color: red ;; padding ;');
    expect(el.style.color).toBe('red');
  });

  test('clears the style with an empty input', () => {
    setStyleText(el, 'color: red');
    setStyleText(el);
    expect(el.getAttribute('style')).toBe(null);
  });
});
