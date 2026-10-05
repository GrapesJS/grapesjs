import Editor from '../../../src/editor';

describe('StyleManager pending updates on destroy', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('does not refresh properties after destroying the editor', () => {
    const editor = new Editor({});
    const em = editor.getModel();
    em.Pages.onLoad();
    const component = editor.addComponents({ type: 'text', content: 'Text', style: { padding: '5px' } })[0];
    em.Styles.select(component);
    jest.runOnlyPendingTimers();
    const update = jest.spyOn(em.Styles, '__upProps');
    component.setStyle({ padding: '10px' });
    editor.destroy();
    expect(() => jest.runOnlyPendingTimers()).not.toThrow();
    expect(update).not.toHaveBeenCalled();
  });

  test('does not send pending custom events after destroying the module', () => {
    const editor = new Editor({});
    const em = editor.getModel();
    const styles = em.Styles;
    const custom = jest.fn();
    em.on(styles.events.custom, custom);
    em.trigger(styles.events.target, undefined);
    styles.destroy();
    jest.runOnlyPendingTimers();
    expect(custom).not.toHaveBeenCalled();
    editor.destroy();
  });

  test('still refreshes properties and sends custom events while alive', () => {
    const editor = new Editor({});
    const em = editor.getModel();
    const update = jest.spyOn(em.Styles, '__upProps');
    const custom = jest.fn();
    em.on(em.Styles.events.custom, custom);
    em.trigger('styleable:change');
    jest.runOnlyPendingTimers();
    expect(update).toHaveBeenCalledTimes(1);
    expect(custom).toHaveBeenCalled();
    editor.destroy();
  });
});
