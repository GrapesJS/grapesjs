import Editor from '../../../src/editor';
import { DEFAULT_CMPS } from '../../common';

const { keys } = Object;

describe('Editor', () => {
  let editor: Editor;

  beforeEach((done) => {
    editor = new Editor();
    editor.getModel().loadOnStart();
    editor.on('change:readyLoad', () => done());
  });

  afterEach(() => {
    editor.destroy();
  });

  test('Object exists', () => {
    expect(editor).toBeTruthy();
  });

  test('Has no components', () => {
    const all = editor.Components.allById();
    const allKeys = keys(all);
    // By default 1 wrapper components is created
    expect(allKeys.length).toBe(DEFAULT_CMPS);
    expect(all[allKeys[0]].get('type')).toBe('wrapper');
  });

  test('Has no CSS rules', () => {
    const all = editor.Css.getAll();
    expect(all.length).toBe(0);
  });

  test('Has one default frame', () => {
    const all = editor.Canvas.getFrames();
    expect(all.length).toBe(1);
  });

  test('The default frame has the same main component and css', () => {
    const wrapper = editor.getWrapper();
    const style = editor.getStyle();
    const frame = editor.Canvas.getFrame();
    expect(wrapper).toBe(frame.getComponent());
    expect(style).toBe(frame.get('styles'));
  });

  test('Components are correctly tracked on add', () => {
    const all = editor.Components.allById();
    const wrapper = editor.getWrapper()!;
    wrapper.append('<div>Component</div>'); // Div component + textnode
    expect(keys(all).length).toBe(2 + DEFAULT_CMPS);
  });

  test('Components are correctly tracked on add and remove', () => {
    const all = editor.Components.allById();
    const wrapper = editor.getWrapper()!;
    const added = wrapper.append(`
        <div>Component 1</div>
        <div></div>
    `);
    expect(keys(all).length).toBe(3 + DEFAULT_CMPS);
    const secComp = added[1];
    secComp.append(`
        <div>Component 2</div>
        <div>Component 3</div>
    `);
    expect(keys(all).length).toBe(7 + DEFAULT_CMPS);
    wrapper.empty();
    expect(wrapper.components().length).toBe(0);
    expect(keys(all).length).toBe(DEFAULT_CMPS);
  });

  test('Components are correctly tracked with UndoManager', () => {
    const all = editor.Components.allById();
    const um = editor.UndoManager;
    const umStack = um.getStack();
    const wrapper = editor.getWrapper()!;
    expect(umStack.length).toBe(0);
    wrapper.append('<div>Component 1</div>')[0];
    expect(umStack.length).toBe(1);
    wrapper.empty();
    expect(umStack.length).toBe(2);
    expect(keys(all).length).toBe(DEFAULT_CMPS);
    um.undo(false);
    expect(keys(all).length).toBe(2 + DEFAULT_CMPS);
  });

  test('Components are correctly tracked with UndoManager and mutiple operations', () => {
    const all = editor.Components.allById();
    const um = editor.UndoManager;
    const umStack = um.getStack();
    const wrapper = editor.getWrapper()!;
    expect(umStack.length).toBe(0);
    wrapper.append(`<div>
        <div>Component 1</div>
        <div>Component 2</div>
    </div>`);
    expect(umStack.length).toBe(1); // UM counts first children
    expect(keys(all).length).toBe(5 + DEFAULT_CMPS);
    wrapper.components().at(0).components().at(0).remove(); // Remove 1 component

    expect(umStack.length).toBe(2);
    expect(keys(all).length).toBe(3 + DEFAULT_CMPS);
    wrapper.empty();
    expect(umStack.length).toBe(3);
    expect(keys(all).length).toBe(DEFAULT_CMPS);
  });
});
