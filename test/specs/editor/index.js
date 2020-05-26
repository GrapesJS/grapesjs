import Editor from 'editor';

const { keys } = Object;
const initComps = 1;

describe('Editor', () => {
  const editor = new Editor();

  beforeEach(() => {
    editor.init();
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
    expect(allKeys.length).toBe(initComps);
    expect(allKeys[0]).toBe('wrapper');
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
    expect(wrapper).toBe(frame.get('root'));
    expect(style).toBe(frame.get('styles'));
  });

  test('Components are correctly tracked on add', () => {
    const all = editor.Components.allById();
    const wrapper = editor.getWrapper();
    wrapper.append('<div>Component</div>');
    expect(keys(all).length).toBe(1 + initComps);
  });

  test('Components are correctly tracked on add and remove', () => {
    const all = editor.Components.allById();
    const wrapper = editor.getWrapper();
    const added = wrapper.append(`
        <div>Component 1</div>
        <div></div>
    `);
    expect(keys(all).length).toBe(2 + initComps);
    const secComp = added[1];
    secComp.append(`
        <div>Component 2</div>
        <div>Component 3</div>
    `);
    expect(keys(all).length).toBe(4 + initComps);
    wrapper.empty();
    expect(wrapper.components().length).toBe(0);
    expect(keys(all).length).toBe(initComps);
  });

  test('Components are correctly tracked with UndoManager', () => {
    editor.Components.postLoad(); // Init UndoManager
    const all = editor.Components.allById();
    const um = editor.UndoManager;
    const umStack = um.getStack();
    const wrapper = editor.getWrapper();
    expect(umStack.length).toBe(0);
    const comp = wrapper.append(`<div>Component 1</div>`)[0];
    expect(umStack.length).toBe(1);
    wrapper.empty();
    expect(umStack.length).toBe(2);
    expect(keys(all).length).toBe(initComps);
    um.undo(false);
    expect(keys(all).length).toBe(1 + initComps);
  });

  test('Components are correctly tracked with UndoManager and mutiple operations', () => {
    editor.Components.postLoad(); // Init UndoManager
    const all = editor.Components.allById();
    const um = editor.UndoManager;
    const umStack = um.getStack();
    const wrapper = editor.getWrapper();
    expect(umStack.length).toBe(0);
    wrapper.append(`<div>
        <div>Component 1</div>
        <div>Component 2</div>
    </div>`);
    expect(umStack.length).toBe(1); // UM counts first children
    expect(keys(all).length).toBe(3 + initComps);
    wrapper
      .components()
      .at(0)
      .components()
      .at(0)
      .remove(); // Remove 1 component
    // UM registers 2 identical remove undoTypes as Backbone triggers remove from the
    // collection and the model
    expect(umStack.length).toBe(3);
    expect(keys(all).length).toBe(2 + initComps);
    wrapper.empty();
    expect(umStack.length).toBe(4);
    expect(keys(all).length).toBe(initComps);
  });
});
