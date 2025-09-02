import UndoManager from '../../../src/undo_manager';
import Editor from '../../../src/editor';
import { setupTestEditor } from '../../common';

describe('Undo Manager', () => {
  let editor: Editor;
  let um: UndoManager;
  let wrapper: any;

  beforeEach(() => {
    ({ editor, um } = setupTestEditor({
      withCanvas: true,
    }));
    wrapper = editor.getWrapper();
    um.clear();
  });

  afterEach(() => {
    editor.destroy();
  });

  test('Initial state is correct', () => {
    expect(um.hasUndo()).toBe(false);
    expect(um.hasRedo()).toBe(false);
    expect(um.getStack()).toHaveLength(0);
  });

  describe('Component changes', () => {
    test('Add component', () => {
      expect(wrapper.components()).toHaveLength(0);
      wrapper.append('<div></div>');
      expect(wrapper.components()).toHaveLength(1);
      expect(um.hasUndo()).toBe(true);

      um.undo();
      expect(wrapper.components()).toHaveLength(0);
      expect(um.hasRedo()).toBe(true);

      um.redo();
      expect(wrapper.components()).toHaveLength(1);
    });

    test('Remove component', () => {
      const comp = wrapper.append('<div></div>')[0];
      expect(wrapper.components()).toHaveLength(1);
      um.clear();

      comp.remove();
      expect(wrapper.components()).toHaveLength(0);
      expect(um.hasUndo()).toBe(true);

      um.undo();
      expect(wrapper.components()).toHaveLength(1);
      expect(um.hasRedo()).toBe(true);

      um.redo();
      expect(wrapper.components()).toHaveLength(0);
    });

    test('Modify component properties', () => {
      const comp = wrapper.append({ tagName: 'div', content: 'test' })[0];
      um.clear();

      comp.set('content', 'test2');
      expect(comp.get('content')).toBe('test2');
      expect(um.hasUndo()).toBe(true);

      um.undo();
      expect(comp.get('content')).toBe('test');

      um.redo();
      expect(comp.get('content')).toBe('test2');
    });

    test('Modify component style (StyleManager)', () => {
      const comp = wrapper.append('<div></div>')[0];

      um.clear();
      comp.addStyle({ color: 'red' });
      expect(comp.getStyle().color).toBe('red');
      expect(um.hasUndo()).toBe(true);

      um.undo();
      expect(comp.getStyle().color).toBeUndefined();

      um.redo();
      expect(comp.getStyle().color).toBe('red');
    });

    test('Move component', () => {
      wrapper.append('<div>1</div><div>2</div>');
      const comp1 = wrapper.components().at(0);
      const comp2 = wrapper.components().at(1);

      um.clear();

      wrapper.append(comp1, { at: 2 });
      expect(wrapper.components().at(0)).toBe(comp2);
      expect(wrapper.components().at(1)).toBe(comp1);
      expect(um.hasUndo()).toBe(true);

      um.undo();
      expect(wrapper.components().at(0)).toBe(comp1);
      expect(wrapper.components().at(1)).toBe(comp2);

      um.redo();
      expect(wrapper.components().at(0)).toBe(comp2);
      expect(wrapper.components().at(1)).toBe(comp1);
    });

    test('Grouped component additions are treated as one undo action', () => {
      wrapper.append('<div>1</div><div>2</div>');

      expect(wrapper.components()).toHaveLength(2);
      expect(um.getStackGroup()).toHaveLength(1);

      um.undo();
      expect(wrapper.components()).toHaveLength(0);
    });
  });

  describe('CSS Rule changes', () => {
    test('Add CSS Rule', () => {
      editor.Css.addRules('.test { color: red; }');

      expect(editor.Css.getRules('.test')).toHaveLength(1);

      expect(um.hasUndo()).toBe(true);

      um.undo();
      expect(editor.Css.getRules('.test')).toHaveLength(0);

      um.redo();
      expect(editor.Css.getRules('.test')).toHaveLength(1);
      expect(editor.Css.getRule('.test')?.getStyle().color).toBe('red');
    });

    test('Modify CSS Rule', () => {
      const rule = editor.Css.addRules('.test { color: red; }')[0];

      um.clear();

      rule.setStyle({ color: 'blue' });
      expect(rule.getStyle().color).toBe('blue');
      expect(um.hasUndo()).toBe(true);

      um.undo();
      expect(rule.getStyle().color).toBe('red');

      um.redo();
      expect(rule.getStyle().color).toBe('blue');
    });

    test('Remove CSS Rule', () => {
      const rule = editor.Css.addRules('.test { color: red; }')[0];

      um.clear();

      editor.Css.remove(rule);
      expect(editor.Css.getRules('.test')).toHaveLength(0);
      expect(um.hasUndo()).toBe(true);

      um.undo();
      expect(editor.Css.getRules('.test')).toHaveLength(1);

      um.redo();
      expect(editor.Css.getRules('.test')).toHaveLength(0);
    });
  });

  // TODO: add undo_manager to asset manager
  describe.skip('Asset Manager changes', () => {
    test('Add asset', () => {
      const am = editor.Assets;
      expect(am.getAll()).toHaveLength(0);

      um.clear();

      am.add('path/to/img.jpg');
      expect(am.getAll()).toHaveLength(1);
      expect(um.hasUndo()).toBe(true);

      um.undo();
      expect(am.getAll()).toHaveLength(0);

      um.redo();
      expect(am.getAll()).toHaveLength(1);
      expect(am.get('path/to/img.jpg')).toBeTruthy();
    });

    test('Remove asset', () => {
      const am = editor.Assets;
      const asset = am.add('path/to/img.jpg');
      expect(am.getAll()).toHaveLength(1);

      um.clear();

      am.remove(asset);
      expect(am.getAll()).toHaveLength(0);
      expect(um.hasUndo()).toBe(true);

      um.undo();
      expect(am.getAll()).toHaveLength(1);

      um.redo();
      expect(am.getAll()).toHaveLength(0);
    });
  });

  // TODO: add undo_manager to editor
  describe.skip('Editor states changes', () => {
    test('Device change', () => {
      editor.Devices.add({ id: 'tablet', name: 'Tablet', width: 'auto' });

      um.clear();

      editor.setDevice('Tablet');
      expect(editor.getDevice()).toBe('Tablet');
      expect(um.hasUndo()).toBe(true);

      um.undo();
      // Default device is an empty string
      expect(editor.getDevice()).toBe('');

      um.redo();
      expect(editor.getDevice()).toBe('Tablet');
    });

    test('Panel visibility change', () => {
      const panel = editor.Panels.getPanel('options')!;
      panel.set('visible', true);

      um.clear();

      panel.set('visible', false);
      expect(panel.get('visible')).toBe(false);
      expect(um.hasUndo()).toBe(true);

      um.undo();
      expect(panel.get('visible')).toBe(true);

      um.redo();
      expect(panel.get('visible')).toBe(false);
    });
  });

  describe('Selection tracking', () => {
    test('Change selection', (done) => {
      const comp1 = wrapper.append('<div>1</div>')[0];
      const comp2 = wrapper.append('<div>2</div>')[0];

      um.clear();
      editor.select(comp1);
      expect(editor.getSelected()).toBe(comp1);

      setTimeout(() => {
        editor.select(comp2);
        expect(editor.getSelected()).toBe(comp2);
        expect(um.hasUndo()).toBe(true);
        um.undo();
        expect(editor.getSelected()).toBe(comp1);
        um.redo();
        expect(editor.getSelected()).toBe(comp2);
        done();
      });
    });
  });

  describe('Operations with `noUndo`', () => {
    test('Skipping undo for component modification', () => {
      const comp = wrapper.append('<div></div>')[0];

      um.clear();

      comp.set('content', 'no undo content', { noUndo: true });
      expect(um.hasUndo()).toBe(false);

      wrapper.append('<div>undo this</div>');
      expect(um.hasUndo()).toBe(true);

      um.undo();
      expect(wrapper.components()).toHaveLength(1);
      expect(wrapper.components().at(0).get('content')).toBe('no undo content');
    });
  });
});
