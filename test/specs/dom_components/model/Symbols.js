import Editor from 'editor';
import { keySymbol, keySymbols } from 'dom_components/model/Component';

describe('Symbols', () => {
  let editor;
  let wrapper;
  const createSymbol = comp => comp.clone({ symbol: 1 });
  const simpleComp = '<div data-a="b">Component</div>';
  const compMultipleNodes = `<div data-v="a">
    <div data-v="b">Component 1</div>
    <div data-v="c">Component 2</div>
  </div>`;

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

  test('Symbols and instances are correctly serialized', () => {
    const comp = wrapper.append(simpleComp)[0];
    const symbol = createSymbol(comp);
    const idComp = comp.getId();
    const idSymb = symbol.getId();
    const jsonComp = JSON.parse(JSON.stringify(comp));
    const jsonSymb = JSON.parse(JSON.stringify(symbol));
    expect(jsonComp[keySymbol]).toBe(idSymb);
    expect(jsonSymb[keySymbols]).toEqual([idComp]);
  });

  test("Removing one instance doesn't affect others", () => {
    const comp = wrapper.append(simpleComp)[0];
    const symbol = createSymbol(comp);
    const comp2 = createSymbol(comp);
    wrapper.append(comp2);
    expect(wrapper.components().length).toBe(2);
    comp.remove();
    expect(wrapper.components().length).toBe(1);
    expect(comp2.__getSymbol()).toBe(symbol);
  });

  test('New component added to an instance is correctly propogated to all others', () => {
    const comp = wrapper.append(compMultipleNodes)[0];
    const compLen = comp.components().length;
    const symbol = createSymbol(comp);
    // Create and add 2 instances
    const comp2 = createSymbol(comp);
    wrapper.append(comp2);
    const comp3 = createSymbol(comp2);
    wrapper.append(comp3);
    const allInst = [comp, comp2, comp3];
    const all = [...allInst, symbol];
    all.forEach(cmp => expect(cmp.components().length).toBe(compLen));
    expect(wrapper.components().length).toBe(3);
    // Append new component to one of the instances
    const added = comp3.append(simpleComp, { at: 0 })[0];
    // The append should be propagated
    all.forEach(cmp => expect(cmp.components().length).toBe(compLen + 1));
    // The new added component became part of the symbol instance
    const addedSymb = added.__getSymbol();
    const symbAdded = symbol.components().at(0);
    expect(addedSymb).toBe(symbAdded);
    allInst.forEach(cmp =>
      expect(
        cmp
          .components()
          .at(0)
          .__getSymbol()
      ).toBe(symbAdded)
    );
    // The new main Symbol should keep the track of all instances
    expect(symbAdded.__getSymbols().length).toBe(allInst.length);
  });
});
