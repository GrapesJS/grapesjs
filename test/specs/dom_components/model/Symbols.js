import Editor from 'editor';

describe('Symbols', () => {
  let editor;
  let wrapper;
  const createSymbol = comp => comp.clone({ symbol: 1 });
  const simpleComp = '<div data-a="b">Component</div>';

  beforeAll(() => {
    editor = new Editor();
    wrapper = editor.getWrapper();
  });

  afterAll(() => {
    wrapper = {};
    editor.destroy();
  });

  beforeEach(() => {
    console.log('Symbols before each');
  });

  afterEach(() => {
    console.log('Symbols after each');
    wrapper.components().reset();
  });

  test('Create symbol from a component', () => {
    const comp = wrapper.append(simpleComp)[0];
    const symbol = createSymbol(comp);
    const symbs = symbol.__getSymbols();
    expect(symbol.__isSymbol()).toBe(true);
    expect(comp.__getSymbol()).toBe(symbol);
    expect(symbs.length).toBe(1);
    expect(symbs[0]).toBe(comp);
    expect(comp.toHTML()).toBe(symbol.toHTML());
  });

  test('Create 1 symbol and clone the instance for another one', () => {
    const comp = wrapper.append(simpleComp)[0];
    const symbol = createSymbol(comp);
    const comp2 = createSymbol(comp);
    const symbs = symbol.__getSymbols();
    expect(symbs.length).toBe(2);
    expect(symbs[0]).toBe(comp);
    expect(symbs[1]).toBe(comp2);
    expect(comp2.__getSymbol()).toBe(symbol);
    expect(comp2.toHTML()).toBe(symbol.toHTML());
  });

  test('Create 1 symbol and clone it to have another instance', () => {
    const comp = wrapper.append(simpleComp)[0];
    const symbol = createSymbol(comp);
    const comp2 = createSymbol(symbol);
    const symbs = symbol.__getSymbols();
    expect(symbs.length).toBe(2);
    expect(symbs[0]).toBe(comp);
    expect(symbs[1]).toBe(comp2);
    expect(comp2.__getSymbol()).toBe(symbol);
    expect(comp2.toHTML()).toBe(symbol.toHTML());
  });
});
