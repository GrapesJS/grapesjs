import Editor from '../../../../src/editor';
import Component, { keySymbol, keySymbols } from '../../../../src/dom_components/model/Component';
import { isSymbolNested } from '../../../../src/dom_components/model/SymbolUtils';

describe('Symbols', () => {
  let editor: Editor;
  let wrapper: NonNullable<ReturnType<Editor['getWrapper']>>;
  let cmps: Editor['Components'];
  let um: Editor['UndoManager'];

  const getSymbols = () => cmps.getSymbols();

  const createSymbol = (component: Component) => cmps.addSymbol(component)!;

  const detachSymbol = (component: Component) => cmps.detachSymbol(component);

  const getSymbolInfo = ((comp, opts) => {
    const result = cmps.getSymbolInfo(comp, opts);
    // @ts-ignore skip for now from check
    delete result.isRoot;
    return result;
  }) as Editor['Components']['getSymbolInfo'];

  const setSymbolOverride = (comp: Component, value: Parameters<Component['setSymbolOverride']>[0]) => {
    comp.setSymbolOverride(value);
  };

  const duplicate = (comp: Component): Component => {
    const cloned = comp.clone({});
    comp.parent()?.append(cloned, { at: comp.index() + 1 });
    return cloned;
  };

  const simpleCompDef = {
    type: 'text',
    components: [{ type: 'textnode', content: 'Component' }],
  };
  const simpleComp = '<div data-a="b">Component</div>';
  const simpleComp2 = '<div data-b="c">Component 3</div>';
  const compMultipleNodes = `<div data-v="a">
    <div data-v="b">Component 1</div>
    <div data-v="c">Component 2</div>
  </div>`;

  let allInst: Component[];
  let all: Component[];
  let comp: Component;
  let symbol: Component;
  let secComp: Component;
  let secSymbol: Component;
  let compInitChild = 0;

  const toHTML = (cmp: Component) =>
    cmp.toHTML({
      attributes: (m, attr) => {
        delete attr.id;
        return attr;
      },
    });
  const getInnerComp = (cmp: Component, i = 0) => cmp.components().at(i);
  const getFirstInnSymbol = (cmp: Component) => getSymbolInfo(getInnerComp(cmp)).main;
  const getInnSymbol = (cmp: Component, i = 0) => getSymbolInfo(getInnerComp(cmp, i)).main;
  const basicSymbUpdate = (cFrom: Component, cTo: Component) => {
    const rand = (Math.random() + 1).toString(36).slice(-7);
    const newAttr = { class: `cls-${rand}`, [`myattr-${rand}`]: `val-${rand}` };
    cFrom.setAttributes(newAttr);
    cFrom.components(`New text content ${rand}`);
    const toAttr = cTo.getAttributes();
    delete toAttr.id;
    expect(toAttr).toEqual(newAttr);
    expect(toHTML(cFrom)).toBe(toHTML(cTo));
  };

  beforeEach(() => {
    editor = new Editor();
    editor.Components.postLoad();
    editor.Pages.onLoad();
    wrapper = editor.getWrapper()!;
    cmps = editor.Components;
    um = editor.UndoManager;
    editor.UndoManager.clear();
  });

  afterEach(() => {
    editor.destroy();
  });

  test("Simple clone doesn't create any symbol", () => {
    const comp = wrapper.append(simpleComp)[0];
    const cloned = comp.clone();
    [comp, cloned].forEach((item) => {
      expect(getSymbolInfo(item).isSymbol).toBeFalsy();
    });
  });

  test('Create symbol from a component', () => {
    expect(getSymbols()).toEqual([]);
    const comp = wrapper.append(simpleComp)[0];

    expect(getSymbolInfo(comp)).toEqual({
      isSymbol: false,
      isMain: false,
      isInstance: false,
      main: undefined,
      instances: [],
      relatives: [],
    });

    const symbol = createSymbol(comp);

    expect(getSymbolInfo(symbol)).toEqual({
      isSymbol: true,
      isMain: true,
      isInstance: false,
      main: symbol,
      instances: [comp],
      relatives: [comp],
    });
    expect(getSymbolInfo(comp)).toEqual({
      isSymbol: true,
      isMain: false,
      isInstance: true,
      main: symbol,
      instances: [comp],
      relatives: [symbol],
    });

    expect(toHTML(comp)).toBe(toHTML(symbol));
    expect(getSymbols()).toEqual([symbol]);
    // Symbols should have an id
    expect(symbol.getAttributes().id).toEqual(symbol.getId());
    expect(comp.getAttributes().id).toEqual(comp.getId());
  });

  test('Create 1 symbol and clone the instance for another one', () => {
    const comp = wrapper.append(simpleComp)[0];
    const symbol = createSymbol(comp);
    const comp2 = createSymbol(comp);

    const commonInfo = {
      isSymbol: true,
      main: symbol,
      instances: [comp, comp2],
    };

    expect(getSymbolInfo(symbol)).toEqual({
      ...commonInfo,
      isMain: true,
      isInstance: false,
      relatives: commonInfo.instances,
    });
    expect(getSymbolInfo(comp)).toEqual({
      ...commonInfo,
      isMain: false,
      isInstance: true,
      relatives: [symbol, comp2],
    });
    expect(getSymbolInfo(comp2)).toEqual({
      ...commonInfo,
      isMain: false,
      isInstance: true,
      relatives: [symbol, comp],
    });

    expect(toHTML(comp2)).toBe(toHTML(symbol));
    expect(getSymbols()).toEqual([symbol]);
  });

  test('Create 1 symbol and clone it to have another instance', () => {
    const comp = wrapper.append(simpleComp)[0];
    const symbol = createSymbol(comp);
    const comp2 = createSymbol(symbol);

    const commonInfo = {
      isSymbol: true,
      main: symbol,
      instances: [comp, comp2],
    };

    expect(getSymbolInfo(symbol)).toEqual({
      ...commonInfo,
      isMain: true,
      isInstance: false,
      relatives: commonInfo.instances,
    });
    expect(getSymbolInfo(comp)).toEqual({
      ...commonInfo,
      isMain: false,
      isInstance: true,
      relatives: [symbol, comp2],
    });
    expect(getSymbolInfo(comp2)).toEqual({
      ...commonInfo,
      isMain: false,
      isInstance: true,
      relatives: [symbol, comp],
    });

    expect(toHTML(comp2)).toBe(toHTML(symbol));
  });

  test('When symbol is removed, all instances are detached', () => {
    const comp = wrapper.append(compMultipleNodes)[0];
    const symbol = createSymbol(comp);

    [comp, ...comp.components().models].forEach((i) => {
      expect(getSymbolInfo(i).isInstance).toBe(true);
    });

    symbol.remove();

    [comp, ...comp.components().models].forEach((i) => {
      expect(getSymbolInfo(i)).toEqual({
        isSymbol: false,
        isMain: false,
        isInstance: false,
        instances: [],
        relatives: [],
      });
    });
  });

  test('Detach symbol instance', () => {
    const comp = wrapper.append(compMultipleNodes)[0];
    const symbol = createSymbol(comp);
    const comp2 = createSymbol(comp);

    detachSymbol(comp);

    [comp, ...comp.components().models].forEach((i) => {
      expect(getSymbolInfo(i)).toEqual({
        isSymbol: false,
        isMain: false,
        isInstance: false,
        instances: [],
        relatives: [],
      });
    });

    expect(getSymbolInfo(comp2)).toEqual({
      isSymbol: true,
      isMain: false,
      isInstance: true,
      main: symbol,
      instances: [comp2],
      relatives: [symbol],
    });
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

  test('Serialized symbol references are always recovered', () => {
    const comp = wrapper.append(simpleComp)[0];
    const symbol = createSymbol(comp);
    const idComp = comp.getId();
    const idSymb = symbol.getId();
    // Serialize symbols
    comp.set(keySymbol, idSymb);
    symbol.set(keySymbols, [idComp]);
    // Check updates from instance
    basicSymbUpdate(comp, symbol);
    // Check updates from symbol
    basicSymbUpdate(symbol, comp);
  });

  test('Symbols recovers correctly from serialization', () => {
    const idComp = 'c1';
    const idSymb = 's1';
    const defComp = {
      ...simpleCompDef,
      [keySymbol]: idSymb,
      attributes: { id: idComp },
    };
    const defSymb = {
      ...simpleCompDef,
      [keySymbols]: [idComp],
      attributes: { id: idSymb },
    };
    const [comp, symbol] = wrapper.append([defComp, defSymb]);

    const commonInfo = {
      isSymbol: true,
      main: symbol,
      instances: [comp],
    };

    expect(getSymbolInfo(symbol)).toEqual({
      ...commonInfo,
      isMain: true,
      isInstance: false,
      relatives: commonInfo.instances,
    });
    expect(getSymbolInfo(comp)).toEqual({
      ...commonInfo,
      isMain: false,
      isInstance: true,
      relatives: [symbol],
    });

    expect(comp.get(keySymbol)).toBe(symbol);
    expect(symbol.get(keySymbols)[0]).toBe(comp);
    basicSymbUpdate(comp, symbol);
    basicSymbUpdate(symbol, comp);
  });

  test('Symbols are properly stored in project data', () => {
    expect(editor.getProjectData().symbols).toEqual([]);
    const comp = wrapper.append(simpleComp)[0];
    const symbol = createSymbol(comp);
    const symbolsJSON = [JSON.parse(JSON.stringify(symbol))];
    expect(editor.getProjectData().symbols).toEqual(symbolsJSON);
    // Check post remove
    symbol.remove();
    expect(editor.getProjectData().symbols).toEqual([]);
  });

  test('Symbols are properly loaded from project data', () => {
    const idComp = 'c1';
    const idSymb = 's1';
    const projectData = {
      symbols: [
        {
          ...simpleCompDef,
          [keySymbols]: [idComp],
          attributes: { id: idSymb },
        },
      ],
      pages: [
        {
          id: 'page-1',
          frames: [
            {
              component: {
                type: 'wrapper',
                components: [
                  {
                    ...simpleCompDef,
                    [keySymbol]: idSymb,
                    attributes: { id: idComp },
                  },
                ],
              },
              id: 'wrap-1',
            },
          ],
        },
      ],
    };
    editor.loadProjectData(projectData);
    const symbols = getSymbols();
    const symbol = symbols[0];
    const comp = cmps.getWrapper()!.components().at(0);

    const commonInfo = {
      isSymbol: true,
      main: symbol,
      instances: [comp],
    };

    expect(getSymbolInfo(symbol)).toEqual({
      ...commonInfo,
      isMain: true,
      isInstance: false,
      relatives: commonInfo.instances,
    });
    expect(getSymbolInfo(comp)).toEqual({
      ...commonInfo,
      isMain: false,
      isInstance: true,
      relatives: [symbol],
    });

    const symbolsJSON = JSON.parse(JSON.stringify(symbols));
    expect(editor.getProjectData().symbols).toEqual(symbolsJSON);
  });

  test("Removing one instance doesn't affect others", () => {
    const comp = wrapper.append(simpleComp)[0];
    const symbol = createSymbol(comp);
    const comp2 = createSymbol(comp);
    wrapper.append(comp2);

    expect(wrapper.components().length).toBe(2);
    comp.remove();
    expect(wrapper.components().models).toEqual([comp2]);

    const commonInfo = {
      isSymbol: true,
      main: symbol,
      instances: [comp2],
    };

    expect(getSymbolInfo(symbol)).toEqual({
      ...commonInfo,
      isMain: true,
      isInstance: false,
      relatives: [comp2],
    });
    expect(getSymbolInfo(comp2)).toEqual({
      ...commonInfo,
      isMain: false,
      isInstance: true,
      relatives: [symbol],
    });
  });

  test('Removing a component containing an instance, will remove the reference in the main', () => {
    const container = wrapper.append('<custom-el></custom-el>')[0];
    const comp = container.append(simpleComp)[0];
    const symbol = createSymbol(comp);

    const commonInfo = {
      isSymbol: true,
      main: symbol,
      instances: [comp],
    };

    expect(getSymbolInfo(symbol)).toEqual({
      ...commonInfo,
      isMain: true,
      isInstance: false,
      relatives: [comp],
    });
    expect(comp.parent()).toEqual(container);

    container.remove();

    expect(getSymbolInfo(symbol)).toEqual({
      ...commonInfo,
      isMain: true,
      isInstance: false,
      relatives: [],
      instances: [],
    });

    // the main doesn't lose its children
    expect(symbol.getInnerHTML()).toBe('Component');
  });

  test('Symbols are working properly when using resetFromString (text component)', () => {
    const comp = wrapper.append('<div data-a="b">Component <b id="bld">bold</b></div>')[0];
    const innerNode = comp.components().at(0);
    const innerCmp = comp.components().at(1);
    expect(innerNode.toHTML()).toBe('Component ');
    expect(innerCmp.getInnerHTML()).toBe('bold');

    const symbol = createSymbol(comp);
    const comp2 = createSymbol(comp);
    const symbolInner = symbol.components().at(1);
    const innerCmp2 = comp2.components().at(1);

    expect(getSymbolInfo(innerCmp)).toEqual({
      isSymbol: true,
      main: symbolInner,
      instances: [innerCmp, innerCmp2],
      isMain: false,
      isInstance: true,
      relatives: [symbolInner, innerCmp2],
    });

    comp.components().resetFromString('Component2 <b id="bld">bold2</b>');
    expect(comp.components().at(1)).toBe(innerCmp);
    expect(comp2.components().at(1)).toBe(innerCmp2);
    expect(innerCmp.getInnerHTML()).toBe('bold2');

    expect(getSymbolInfo(innerCmp)).toEqual({
      isSymbol: true,
      main: symbolInner,
      instances: [innerCmp, innerCmp2],
      isMain: false,
      isInstance: true,
      relatives: [symbolInner, innerCmp2],
    });

    expect(getSymbolInfo(innerCmp2)).toEqual({
      isSymbol: true,
      main: symbolInner,
      instances: [innerCmp, innerCmp2],
      isMain: false,
      isInstance: true,
      relatives: [symbolInner, innerCmp],
    });

    expect(comp.components().at(0).getInnerHTML()).toBe('Component2 ');
    expect(symbol.components().at(0).getInnerHTML()).toBe('Component2 ');
    expect(comp2.components().at(0).getInnerHTML()).toBe('Component2 ');
    expect(innerCmp.getInnerHTML()).toBe('bold2');
    expect(innerCmp2.getInnerHTML()).toBe('bold2');
    expect(symbolInner.getInnerHTML()).toBe('bold2');
  });

  test('New component added to an instance is correctly propogated to all others', () => {
    const comp = wrapper.append(compMultipleNodes)[0];
    const compLen = comp.components().length;
    const symbol = createSymbol(comp);
    // Create and add 2 instances
    const comp2 = createSymbol(comp);
    const comp3 = createSymbol(comp2);
    const allInst = [comp, comp2, comp3];
    const all = [...allInst, symbol];
    all.forEach((cmp) => expect(cmp.components().length).toBe(compLen));
    wrapper.append([comp2, comp3]);
    expect(wrapper.components().length).toBe(3);
    // Append new component to one of the instances
    const comp3Added = comp3.append(simpleComp, { at: 0 })[0];
    // The append should be propagated
    all.forEach((cmp) => expect(cmp.components().length).toBe(compLen + 1));
    // The new added component became part of the symbol instance
    const symbAdded = symbol.components().at(0);
    const compAdded = comp.components().at(0);
    const comp2Added = comp2.components().at(0);
    const commonInfo = {
      isSymbol: true,
      main: symbAdded,
      instances: [comp3Added, compAdded, comp2Added], // comp3 was edited first
    };
    expect(getSymbolInfo(symbAdded)).toEqual({
      ...commonInfo,
      isMain: true,
      isInstance: false,
      relatives: commonInfo.instances,
    });
    expect(getSymbolInfo(compAdded)).toEqual({
      ...commonInfo,
      isMain: false,
      isInstance: true,
      relatives: [symbAdded, comp3Added, comp2Added],
    });
    expect(getSymbolInfo(comp2Added)).toEqual({
      ...commonInfo,
      isMain: false,
      isInstance: true,
      relatives: [symbAdded, comp3Added, compAdded],
    });
    expect(getSymbolInfo(comp3Added)).toEqual({
      ...commonInfo,
      isMain: false,
      isInstance: true,
      relatives: [symbAdded, compAdded, comp2Added],
    });
  });

  describe('Creating multiple symbols', () => {
    beforeEach(() => {
      comp = wrapper.append(compMultipleNodes)[0];
      compInitChild = comp.components().length;
      symbol = createSymbol(comp);
      const comp2 = createSymbol(comp);
      const comp3 = createSymbol(comp);
      allInst = [comp, comp2, comp3];
      all = [...allInst, symbol];
      wrapper.append([comp2, comp3]);
      editor.UndoManager.clear();
    });

    afterEach(() => {
      wrapper.components().reset();
    });

    test('The wrapper contains all the symbols', () => {
      expect(wrapper.components().length).toBe(allInst.length);
    });

    test('All the symbols contain the same amount of children', () => {
      all.forEach((cmp) => expect(cmp.components().length).toBe(compInitChild));
    });

    test('Removing one instance, will remove the reference from the symbol', () => {
      expect(getSymbolInfo(symbol).instances.length).toBe(allInst.length);
      allInst[2].remove();
      expect(getSymbolInfo(symbol).instances.length).toBe(allInst.length - 1);
    });

    test('Removing one instance, works with UndoManager', (done) => {
      setTimeout(() => {
        // This will commit the undo
        allInst[0].remove();
        um.undo();
        expect(wrapper.components().length).toBe(allInst.length);
        expect(getSymbolInfo(symbol).instances.length).toBe(allInst.length);
        done();
      });
    });

    test('Adding a new component to a symbol, it will be propogated to all instances', () => {
      const added = symbol.append(simpleComp, { at: 0 })[0];
      all.forEach((cmp) => expect(cmp.components().length).toBe(compInitChild + 1));
      // Check symbol references
      const addedInstances = allInst.map((cmp) => cmp.components().at(0));
      expect(getSymbolInfo(added)).toEqual({
        isSymbol: true,
        isMain: true,
        isInstance: false,
        main: added,
        instances: addedInstances,
        relatives: addedInstances,
      });
      allInst.forEach((cmp) => expect(getFirstInnSymbol(cmp)).toBe(added));
    });

    test('Adding a new component to an instance of the symbol, it will be propogated to all symbols', () => {
      const added = comp.append(simpleComp, { at: 0 })[0];
      all.forEach((cmp) => expect(cmp.components().length).toBe(compInitChild + 1));
      // Check symbol references
      const addSymb = symbol.components().at(0);
      const addedInstances = allInst.map((cmp) => cmp.components().at(0));
      expect(getSymbolInfo(added)).toEqual({
        isSymbol: true,
        isMain: false,
        isInstance: true,
        main: addSymb,
        instances: addedInstances,
        relatives: [addSymb, ...addedInstances.filter((s) => s !== added)],
      });
      allInst.forEach((cmp) => expect(getFirstInnSymbol(cmp)).toBe(addSymb));
    });

    test('Adding a new component to an instance of the symbol, works correctly with Undo Manager', () => {
      const added = comp.append(simpleComp, { at: 0 })[0];
      um.undo();
      all.forEach((cmp) => expect(cmp.components().length).toBe(compInitChild));
      um.redo();
      um.undo();
      um.redo(); // check multiple undo/redo
      all.forEach((cmp) => expect(cmp.components().length).toBe(compInitChild + 1));
      // Check symbol references
      const addSymb = symbol.components().at(0);
      const addedInstances = allInst.map((cmp) => cmp.components().at(0));
      expect(getSymbolInfo(added)).toEqual({
        isSymbol: true,
        isMain: false,
        isInstance: true,
        main: addSymb,
        instances: addedInstances,
        relatives: [addSymb, ...addedInstances.filter((s) => s !== added)],
      });
    });

    test('Moving a new added component in the instance, will propagate the action in all symbols', () => {
      const added = comp.append(simpleComp)[0];
      expect(added.index()).toBe(compInitChild);
      const newChildLen = compInitChild + 1;
      added.move(comp, { at: 0 });
      expect(added.index()).toBe(0); // extra checks
      expect(added.parent()).toBe(comp);

      const addSymb = symbol.components().at(0);
      const addedInstances = allInst.map((cmp) => cmp.components().at(0));
      const commonInfo = {
        isSymbol: true,
        main: addSymb,
        instances: addedInstances,
      };
      expect(getSymbolInfo(added)).toEqual({
        ...commonInfo,
        isMain: false,
        isInstance: true,
        relatives: [addSymb, ...addedInstances.filter((s) => s !== added)],
      });
      expect(getSymbolInfo(addSymb)).toEqual({
        ...commonInfo,
        isMain: true,
        isInstance: false,
        relatives: addedInstances,
      });

      // All symbols still have the same amount of components
      all.forEach((cmp) => expect(cmp.components().length).toBe(newChildLen));
      // All instances refer to the same symbol
      allInst.forEach((cmp) => expect(getFirstInnSymbol(cmp)).toBe(addSymb));
    });

    test('Moving a new added component in the symbol, will propagate the action in all instances', () => {
      const addSymb = symbol.append(simpleComp)[0];
      const newChildLen = compInitChild + 1;
      addSymb.move(symbol, { at: 0 });
      // All symbols still have the same amount of components
      all.forEach((cmp) => expect(cmp.components().length).toBe(newChildLen));
      // All instances refer to the same symbol
      allInst.forEach((cmp) => expect(getFirstInnSymbol(cmp)).toBe(addSymb));
      // The moved symbol contains all its instances
      const addedInstances = allInst.map((cmp) => cmp.components().at(0));
      expect(getSymbolInfo(addSymb)).toEqual({
        isSymbol: true,
        isMain: true,
        isInstance: false,
        main: addSymb,
        instances: addedInstances,
        relatives: addedInstances,
      });
    });

    test('Adding a class, reflects changes to all symbols', () => {
      const initSel = symbol.getSelectorsString();
      all.forEach((cmp) => expect(cmp.getSelectorsString()).toBe(initSel));
      // Adding a class to a symbol
      symbol.addClass('myclass');
      const newSel = symbol.getSelectorsString();
      expect(newSel).not.toBe(initSel);
      all.forEach((cmp) => expect(cmp.getSelectorsString()).toBe(newSel));
      // Adding a class to an instance
      comp.addClass('myclass2');
      const newSel2 = comp.getSelectorsString();
      expect(newSel2).not.toBe(newSel);
      all.forEach((cmp) => expect(cmp.getSelectorsString()).toBe(newSel2));
    });

    test('Updating some prop, reflects changes to all symbols', () => {
      const propKey = 'someprop';
      const propValue = 'somevalue';
      all.forEach((cmp) => expect(cmp.get(propKey)).toBeFalsy());
      // Updating the symbol
      symbol.set(propKey, propValue);
      all.forEach((cmp) => expect(cmp.get(propKey)).toBe(propValue));
      // Updating the instance
      const propValue2 = 'somevalue2';
      comp.set(propKey, propValue2);
      all.forEach((cmp) => expect(cmp.get(propKey)).toBe(propValue2));
    });

    test('Updating some attribute, reflects changes to all symbols', () => {
      const attrKey = 'data-attr';
      const attrValue = 'somevalue';
      all.forEach((cmp) => expect(cmp.getAttributes()[attrKey]).toBeFalsy());
      // Updating the symbol
      symbol.addAttributes({ [attrKey]: attrValue });
      all.forEach((cmp) => expect(cmp.getAttributes()[attrKey]).toBe(attrValue));
      // Updating the instance with another attribute
      const attrKey2 = 'data-attr2';
      const attrValue2 = 'somevalue2';
      comp.addAttributes({ [attrKey2]: attrValue2 });
      all.forEach((cmp) => {
        const attrs = cmp.getAttributes();
        expect(attrs[attrKey]).toBe(attrValue);
        expect(attrs[attrKey2]).toBe(attrValue2);
      });
      // All symbols still have the same HTML
      const symbHtml = toHTML(symbol);
      all.forEach((cmp) => expect(toHTML(cmp)).toBe(symbHtml));
    });

    test('Cloning a component in an instance, reflects changes to all symbols', () => {
      const cloned = duplicate(comp.components().at(0));
      const clonedSymb = symbol.components().at(1);
      const newLen = comp.components().length;
      expect(newLen).toBe(compInitChild + 1);
      // All symbols have the same amount of components
      all.forEach((cmp) => expect(cmp.components().length).toBe(newLen));
      // All instances refer to the same symbol
      allInst.forEach((cmp) => expect(getInnSymbol(cmp, 1)).toBe(clonedSymb));

      const commonInfo = {
        isSymbol: true,
        main: clonedSymb,
        instances: allInst.map((cmp) => cmp.components().at(1)),
      };
      expect(getSymbolInfo(cloned)).toEqual({
        ...commonInfo,
        isMain: false,
        isInstance: true,
        relatives: [clonedSymb, ...commonInfo.instances.filter((i) => i !== cloned)],
      });
      expect(getSymbolInfo(clonedSymb)).toEqual({
        ...commonInfo,
        isMain: true,
        isInstance: false,
        relatives: commonInfo.instances,
      });
    });

    test('Cloning a component in a symbol, reflects changes to all instances', () => {
      const clonedSymb = duplicate(getInnerComp(symbol));
      const cloned = getInnerComp(comp, 1);
      const newLen = symbol.components().length;
      // As above
      expect(newLen).toBe(compInitChild + 1);
      all.forEach((cmp) => expect(cmp.components().length).toBe(newLen));
      allInst.forEach((cmp) => expect(getInnSymbol(cmp, 1)).toBe(clonedSymb));

      const commonInfo = {
        isSymbol: true,
        main: clonedSymb,
        instances: allInst.map((cmp) => cmp.components().at(1)),
      };
      expect(getSymbolInfo(cloned)).toEqual({
        ...commonInfo,
        isMain: false,
        isInstance: true,
        relatives: [clonedSymb, ...commonInfo.instances.filter((i) => i !== cloned)],
      });
      expect(getSymbolInfo(clonedSymb)).toEqual({
        ...commonInfo,
        isMain: true,
        isInstance: false,
        relatives: commonInfo.instances,
      });
    });

    describe('Symbols override', () => {
      test('Symbol with override returns correctly relatives to update', () => {
        expect(getSymbolInfo(symbol).relatives).toEqual(allInst);
        // With override as `true`, it will return empty array with any 'changed'
        setSymbolOverride(symbol, true);
        expect(getSymbolInfo(symbol, { withChanges: 'anything' }).relatives).toEqual([]);
        // With override as an array with props, changed option will count
        setSymbolOverride(symbol, ['components']);
        expect(getSymbolInfo(symbol, { withChanges: 'anything' }).relatives).toEqual(allInst);
        expect(getSymbolInfo(symbol, { withChanges: 'components' }).relatives).toEqual([]);
        expect(getSymbolInfo(symbol, { withChanges: 'components:reset' }).relatives).toEqual([]);
        // Support also overrides with type of actions
        // symbol.set(keySymbolOvrd, ['components:change']); // specific change
        setSymbolOverride(symbol, 'components:change');
        expect(getSymbolInfo(symbol, { withChanges: 'components' }).relatives).toEqual(allInst);
        expect(getSymbolInfo(symbol, { withChanges: 'components:change' }).relatives).toEqual([]);
        expect(getSymbolInfo(symbol, { withChanges: 'components:reset' }).relatives).toEqual(allInst);
      });

      test('Symbol is not propagating props changes if override is set', () => {
        const propKey = 'someprop';
        const propValue = 'somevalue';
        setSymbolOverride(symbol, true);
        // Single prop update
        symbol.set(propKey, propValue);
        allInst.forEach((cmp) => expect(cmp.get(propKey)).toBeFalsy());
        // Multiple props
        symbol.set({ prop1: 'value1', prop2: 'value2' });
        allInst.forEach((cmp) => {
          expect(cmp.get('prop1')).toBeFalsy();
          expect(cmp.get('prop2')).toBeFalsy();
        });
      });

      test('Symbol is propagating properly props changes not indicated in override', () => {
        // Override applied on specific properties
        setSymbolOverride(symbol, 'prop1');
        symbol.set({ prop1: 'value1-2', prop2: 'value2-2' });
        allInst.forEach((cmp) => {
          expect(cmp.get('prop1')).toBeFalsy();
          expect(cmp.get('prop2')).toBe('value2-2');
        });
      });

      test('On symbol update propagation, those having override are ignored', () => {
        const propKey = 'someprop';
        const propValue = 'somevalue';
        setSymbolOverride(comp, true);
        symbol.set(propKey, propValue);
        // All symbols are updated except the one with override
        all.forEach((cmp) => {
          if (cmp === comp) {
            expect(cmp.get(propKey)).toBeFalsy();
          } else {
            expect(cmp.get(propKey)).toBe(propValue);
          }
        });
        setSymbolOverride(comp, ['prop1']);
        symbol.set({ prop1: 'value1', prop2: 'value2' });
        // Only the overrided property is ignored
        all.forEach((cmp) => {
          if (cmp === comp) {
            expect(cmp.get('prop1')).toBeFalsy();
            expect(cmp.get('prop2')).toBe('value2');
          } else {
            expect(cmp.get('prop1')).toBe('value1');
            expect(cmp.get('prop2')).toBe('value2');
          }
        });
      });

      test('Symbol is not propagating components data if override is set', () => {
        setSymbolOverride(symbol, ['components']);
        const innCompsLen = symbol.components().length;
        all.forEach((cmp) => expect(cmp.components().length).toBe(innCompsLen));
        symbol.components('Test text');
        // The symbol has changed, but istances should remain the same
        expect(symbol.components().length).toBe(1);
        allInst.forEach((cmp) => expect(toHTML(cmp)).toBe(toHTML(comp)));
        allInst.forEach((cmp) => expect(cmp.components().length).toBe(innCompsLen));
        // Check for add action
        symbol.append('<div>B</div><div>C</div>');
        expect(symbol.components().length).toBe(3);
        allInst.forEach((cmp) => expect(cmp.components().length).toBe(innCompsLen));
      });

      test('Symbol is not removing components data if override is set', () => {
        setSymbolOverride(symbol, ['components']);
        const innCompsLen = symbol.components().length;
        symbol.components().at(0).remove();
        expect(symbol.components().length).toBe(innCompsLen - 1);
        allInst.forEach((cmp) => expect(cmp.components().length).toBe(innCompsLen));
      });

      test('Symbol is not propagating remove on instances with ovverride', () => {
        setSymbolOverride(comp, ['components']);
        const innCompsLen = symbol.components().length;
        symbol.components().at(0).remove();
        all.forEach((cmp) => expect(cmp.components().length).toBe(cmp === comp ? innCompsLen : innCompsLen - 1));
      });

      test('On symbol components update, those having override are ignored', () => {
        setSymbolOverride(comp, ['components']);
        const innCompsLen = comp.components().length;
        // Check reset action
        symbol.components('Test text');
        all.forEach((cmp) => {
          expect(cmp.components().length).toBe(cmp === comp ? innCompsLen : 1);
        });
        // Align comp with others
        comp.components('Test text');
        all.forEach((cmp) => expect(cmp.components().length).toBe(1));

        // Check add action
        symbol.append('<div>A</div>');
        all.forEach((cmp) => {
          expect(cmp.components().length).toBe(cmp === comp ? 1 : 2);
        });
        // Align comp with others
        comp.append('<div>A</div>');
        all.forEach((cmp) => expect(cmp.components().length).toBe(2));

        // Check remove action
        symbol.components().at(0).remove();
        all.forEach((cmp) => {
          expect(cmp.components().length).toBe(cmp === comp ? 2 : 1);
        });
      });
    });
  });

  describe('Nested symbols', () => {
    let comp2: Component;
    let comp3: Component;

    beforeEach(() => {
      comp = wrapper.append(compMultipleNodes)[0];
      compInitChild = comp.components().length;
      symbol = createSymbol(comp);
      comp2 = createSymbol(comp);
      comp3 = createSymbol(comp);
      allInst = [comp, comp2, comp3];
      all = [symbol, ...allInst];
      wrapper.append([comp2, comp3]);
      // Second symbol
      secComp = wrapper.append(simpleComp2)[0];
      secSymbol = createSymbol(secComp);
    });

    afterEach(() => {
      wrapper.components().reset();
    });

    test('Second symbol created properly', () => {
      expect(getSymbolInfo(secSymbol)).toEqual({
        isSymbol: true,
        isMain: true,
        isInstance: false,
        main: secSymbol,
        instances: [secComp],
        relatives: [secComp],
      });
      expect(toHTML(secComp)).toBe(toHTML(secSymbol));
    });

    test('Adding the instance, of the second symbol, inside the first symbol, propagates correctly to all first instances', () => {
      const added = symbol.append(secComp)[0];
      expect(added).toBe(secComp);

      const allAdded = all.map((s) => s.components().last());
      expect(getSymbolInfo(secComp)).toEqual({
        isSymbol: true,
        isMain: false,
        isInstance: true,
        main: secSymbol,
        instances: allAdded,
        relatives: [secSymbol, ...allAdded.filter((s) => s !== secComp)],
      });

      expect(isSymbolNested(added)).toBe(true);
      // All instances still refer to the second symbol
      allAdded.forEach((secInst) => expect(getSymbolInfo(secInst).main).toBe(secSymbol));
    });

    test('Adding the instance, of the second symbol, inside one of the first instances, propagates correctly to all first symbols', () => {
      const added = comp.append(secComp)[0];
      expect(added).toBe(secComp);

      const allAdded = [comp, symbol, comp2, comp3].map((s) => s.components().last());
      expect(getSymbolInfo(secComp)).toEqual({
        isSymbol: true,
        isMain: false,
        isInstance: true,
        main: secSymbol,
        instances: allAdded,
        relatives: [secSymbol, ...allAdded.filter((s) => s !== secComp)],
      });

      // All instances still refer to the second symbol
      allAdded.forEach((s) => expect(getSymbolInfo(s).main).toBe(secSymbol));
    });

    test('Adding the instance, of the second symbol, inside one of the first instances, and then removing it, will not affect second instances outside', () => {
      const secComp2 = createSymbol(secComp);
      const added = comp.append(secComp)[0];
      const allAdded = [comp, symbol, comp2, comp3].map((s) => s.components().last());
      allAdded.splice(1, 0, secComp2);
      expect(getSymbolInfo(secComp2)).toEqual({
        isSymbol: true,
        isMain: false,
        isInstance: true,
        main: secSymbol,
        instances: allAdded,
        relatives: [secSymbol, ...allAdded.filter((s) => s !== secComp2)],
      });
      expect(isSymbolNested(secComp2)).toBe(false);
      // Remove the second instance, added in one of the first instances
      added.remove();
      // Only the secComp2 will remain
      expect(getSymbolInfo(secSymbol)).toEqual({
        isSymbol: true,
        isMain: true,
        isInstance: false,
        main: secSymbol,
        instances: [secComp2],
        relatives: [secComp2],
      });
      // First symbols has the previous number of components inside
      all.forEach((s) => expect(s.components().length).toBe(compInitChild));
    });

    test('Moving the second instance inside first instances, propagates correctly to all other first symbols', () => {
      const added = comp.append(secComp)[0];
      expect(added.parent()).toBe(comp); // extra checks
      expect(added.index()).toBe(compInitChild);
      const secInstansArr = getSymbolInfo(secSymbol).instances.map((i) => i.cid);
      expect(secInstansArr.length).toBe(all.length);
      added.move(comp, { at: 0 });
      // After the move, the symbol still have the same references
      const secInstansArr2 = getSymbolInfo(secSymbol).instances.map((i) => i.cid);
      expect(secInstansArr2).toEqual(secInstansArr);
      // All second instances refer to the same second symbol
      all.forEach((c) => expect(getFirstInnSymbol(c)).toBe(secSymbol));

      const allAdded = [comp, symbol, comp2, comp3].map((s) => s.components().first());
      expect(getSymbolInfo(secSymbol)).toEqual({
        isSymbol: true,
        isMain: true,
        isInstance: false,
        main: secSymbol,
        instances: allAdded,
        relatives: allAdded,
      });
    });
  });
});
