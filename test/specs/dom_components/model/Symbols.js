import Editor from 'editor';
import {
  keySymbol,
  keySymbols,
  keySymbolOvrd
} from 'dom_components/model/Component';

describe('Symbols', () => {
  let editor;
  let wrapper;
  const createSymbol = comp => {
    const symbol = comp.clone({ symbol: 1 });
    comp.parent().append(symbol, { at: comp.index() + 1 });
    return symbol;
  };
  const duplicate = comp => {
    const cloned = comp.clone({});
    comp.parent().append(cloned, { at: comp.index() + 1 });
    return cloned;
  };
  const simpleCompDef = {
    type: 'text',
    components: [{ type: 'textnode', content: 'Component' }]
  };
  const simpleComp = '<div data-a="b">Component</div>';
  const simpleComp2 = '<div data-b="c">Component 3</div>';
  const compMultipleNodes = `<div data-v="a">
    <div data-v="b">Component 1</div>
    <div data-v="c">Component 2</div>
  </div>`;

  let allInst, all, comp, symbol, compInitChild;
  let secComp, secSymbol;
  const getUm = cmp => cmp.em.get('UndoManager');
  const getInnerComp = (cmp, i = 0) => cmp.components().at(i);
  const getFirstInnSymbol = cmp => getInnerComp(cmp).__getSymbol();
  const getInnSymbol = (cmp, i = 0) => getInnerComp(cmp, i).__getSymbol();
  const basicSymbUpdate = (cFrom, cTo) => {
    const rand = (Math.random() + 1).toString(36).slice(-7);
    const newAttr = { class: `cls-${rand}`, [`myattr-${rand}`]: `val-${rand}` };
    cFrom.setAttributes(newAttr);
    cFrom.components(`New text content ${rand}`);
    const toAttr = cTo.getAttributes();
    delete toAttr.id;
    const htmlOpts = {
      attributes: (m, attr) => {
        delete attr.id;
        return attr;
      }
    };
    expect(toAttr).toEqual(newAttr);
    expect(cFrom.toHTML(htmlOpts)).toBe(cTo.toHTML(htmlOpts));
  };

  beforeAll(() => {
    editor = new Editor({ symbols: 1 });
    editor
      .getModel()
      .get('PageManager')
      .onLoad();
    wrapper = editor.getWrapper();
  });

  afterAll(() => {
    wrapper = {};
    editor.destroy();
  });

  beforeEach(() => {});

  afterEach(() => {
    wrapper.components().reset();
  });

  test("Simple clone doesn't create any symbol", () => {
    const comp = wrapper.append(simpleComp)[0];
    const cloned = comp.clone();
    [comp, cloned].forEach(item => {
      expect(item.__getSymbol()).toBeFalsy();
      expect(item.__getSymbols()).toBeFalsy();
    });
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
      attributes: { id: idComp }
    };
    const defSymb = {
      ...simpleCompDef,
      [keySymbols]: [idComp],
      attributes: { id: idSymb }
    };
    const [comp, symbol] = wrapper.append([defComp, defSymb]);
    expect(comp.__getSymbol()).toBe(symbol);
    expect(comp.get(keySymbol)).toBe(symbol);
    expect(symbol.__getSymbols()[0]).toBe(comp);
    expect(symbol.get(keySymbols)[0]).toBe(comp);
    basicSymbUpdate(comp, symbol);
    basicSymbUpdate(symbol, comp);
  });

  test("Removing one instance doesn't affect others", () => {
    const comp = wrapper.append(simpleComp)[0];
    const symbol = createSymbol(comp);
    const comp2 = createSymbol(comp);
    expect(wrapper.components().length).toBe(3);
    comp.remove();
    expect(wrapper.components().length).toBe(2);
    expect(comp2.__getSymbol()).toBe(symbol);
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
    all.forEach(cmp => expect(cmp.components().length).toBe(compLen));
    expect(wrapper.components().length).toBe(4);
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

  describe('Creating 3 symbols in the wrapper', () => {
    beforeEach(() => {
      comp = wrapper.append(compMultipleNodes)[0];
      compInitChild = comp.components().length;
      symbol = createSymbol(comp);
      const comp2 = createSymbol(comp);
      const comp3 = createSymbol(comp);
      allInst = [comp, comp2, comp3];
      all = [...allInst, symbol];
    });

    afterEach(() => {
      wrapper.components().reset();
    });

    test('The wrapper contains all the symbols', () => {
      expect(wrapper.components().length).toBe(all.length);
    });

    test('All the symbols contain the same amount of children', () => {
      all.forEach(cmp => expect(cmp.components().length).toBe(compInitChild));
    });

    test('Removing one instance, will remove the reference from the symbol', () => {
      expect(symbol.__getSymbols().length).toBe(allInst.length);
      allInst[2].remove();
      expect(symbol.__getSymbols().length).toBe(allInst.length - 1);
    });

    test('Removing one instance, works with UndoManager', done => {
      setTimeout(() => {
        // This will commit the undo
        const um = getUm(comp);
        allInst[0].remove();
        um.undo();
        expect(symbol.__getSymbols().length).toBe(allInst.length);
        done();
      });
    });

    test('Adding a new component to a symbol, it will be propogated to all instances', () => {
      const added = symbol.append(simpleComp, { at: 0 })[0];
      all.forEach(cmp =>
        expect(cmp.components().length).toBe(compInitChild + 1)
      );
      // Check symbol references
      expect(added.__getSymbols().length).toBe(allInst.length);
      allInst.forEach(cmp => expect(getFirstInnSymbol(cmp)).toBe(added));
    });

    test('Adding a new component to an instance of the symbol, it will be propogated to all symbols', () => {
      const added = comp.append(simpleComp, { at: 0 })[0];
      all.forEach(cmp =>
        expect(cmp.components().length).toBe(compInitChild + 1)
      );
      // Check symbol references
      const addSymb = added.__getSymbol();
      expect(symbol.components().at(0)).toBe(addSymb);
      allInst.forEach(cmp => expect(getFirstInnSymbol(cmp)).toBe(addSymb));
    });

    test('Adding a new component to an instance of the symbol, works correctly with Undo Manager', () => {
      const added = comp.append(simpleComp, { at: 0 })[0];
      const um = getUm(added);
      um.undo();
      all.forEach(cmp => expect(cmp.components().length).toBe(compInitChild));
      um.redo();
      um.undo();
      um.redo(); // check multiple undo/redo
      all.forEach(cmp =>
        expect(cmp.components().length).toBe(compInitChild + 1)
      );
      // Check symbol references
      const addSymbs = added.__getSymbol().__getSymbols();
      expect(addSymbs.length).toBe(allInst.length);
    });

    test('Moving a new added component in the instance, will propagate the action in all symbols', () => {
      const added = comp.append(simpleComp)[0];
      expect(added.index()).toBe(compInitChild);
      const newChildLen = compInitChild + 1;
      added.move(comp, { at: 0 });
      expect(added.index()).toBe(0); // extra checks
      expect(added.parent()).toBe(comp);
      const symbRef = added.__getSymbol();
      // All symbols still have the same amount of components
      all.forEach(cmp => expect(cmp.components().length).toBe(newChildLen));
      // All instances refer to the same symbol
      allInst.forEach(cmp => expect(getFirstInnSymbol(cmp)).toBe(symbRef));
      // The moved symbol contains all its instances
      expect(getInnerComp(symbol).__getSymbols().length).toBe(allInst.length);
    });

    test('Moving a new added component in the symbol, will propagate the action in all instances', () => {
      const added = symbol.append(simpleComp)[0];
      const newChildLen = compInitChild + 1;
      added.move(symbol, { at: 0 });
      // All symbols still have the same amount of components
      all.forEach(cmp => expect(cmp.components().length).toBe(newChildLen));
      // All instances refer to the same symbol
      allInst.forEach(cmp => expect(getFirstInnSymbol(cmp)).toBe(added));
      // The moved symbol contains all its instances
      expect(added.__getSymbols().length).toBe(allInst.length);
    });

    test('Adding a class, reflects changes to all symbols', () => {
      const initSel = symbol.getSelectorsString();
      all.forEach(cmp => expect(cmp.getSelectorsString()).toBe(initSel));
      // Adding a class to a symbol
      symbol.addClass('myclass');
      const newSel = symbol.getSelectorsString();
      expect(newSel).not.toBe(initSel);
      all.forEach(cmp => expect(cmp.getSelectorsString()).toBe(newSel));
      // Adding a class to an instance
      comp.addClass('myclass2');
      const newSel2 = comp.getSelectorsString();
      expect(newSel2).not.toBe(newSel);
      all.forEach(cmp => expect(cmp.getSelectorsString()).toBe(newSel2));
    });

    test('Updating some prop, reflects changes to all symbols', () => {
      const propKey = 'someprop';
      const propValue = 'somevalue';
      all.forEach(cmp => expect(cmp.get(propKey)).toBeFalsy());
      // Updating the symbol
      symbol.set(propKey, propValue);
      all.forEach(cmp => expect(cmp.get(propKey)).toBe(propValue));
      // Updating the instance
      const propValue2 = 'somevalue2';
      comp.set(propKey, propValue2);
      all.forEach(cmp => expect(cmp.get(propKey)).toBe(propValue2));
    });

    test('Updating some attribute, reflects changes to all symbols', () => {
      const attrKey = 'data-attr';
      const attrValue = 'somevalue';
      all.forEach(cmp => expect(cmp.getAttributes()[attrKey]).toBeFalsy());
      // Updating the symbol
      symbol.addAttributes({ [attrKey]: attrValue });
      all.forEach(cmp => expect(cmp.getAttributes()[attrKey]).toBe(attrValue));
      // Updating the instance with another attribute
      const attrKey2 = 'data-attr2';
      const attrValue2 = 'somevalue2';
      comp.addAttributes({ [attrKey2]: attrValue2 });
      all.forEach(cmp => {
        const attrs = cmp.getAttributes();
        expect(attrs[attrKey]).toBe(attrValue);
        expect(attrs[attrKey2]).toBe(attrValue2);
      });
      // All symbols still have the same HTML
      const symbHtml = symbol.toHTML();
      all.forEach(cmp => expect(cmp.toHTML()).toBe(symbHtml));
    });

    test('Cloning a component in an instance, reflects changes to all symbols', () => {
      const cloned = duplicate(comp.components().at(0));
      const clonedSymb = symbol.components().at(1);
      const newLen = comp.components().length;
      expect(newLen).toBe(compInitChild + 1);
      expect(cloned.__getSymbol()).toBe(clonedSymb);
      // All symbols have the same amount of components
      all.forEach(cmp => expect(cmp.components().length).toBe(newLen));
      // All instances refer to the same symbol
      allInst.forEach(cmp => expect(getInnSymbol(cmp, 1)).toBe(clonedSymb));
      // Symbol contains the reference of instances
      const innerSymb = allInst.map(i => getInnerComp(i, 1));
      expect(clonedSymb.__getSymbols()).toEqual(innerSymb);
    });

    test('Cloning a component in a symbol, reflects changes to all instances', () => {
      const clonedSymb = duplicate(getInnerComp(symbol));
      const cloned = getInnerComp(comp, 1);
      const newLen = symbol.components().length;
      // As above
      expect(newLen).toBe(compInitChild + 1);
      expect(cloned.__getSymbol()).toBe(clonedSymb);
      all.forEach(cmp => expect(cmp.components().length).toBe(newLen));
      allInst.forEach(cmp => expect(getInnSymbol(cmp, 1)).toBe(clonedSymb));
      const innerSymb = allInst.map(i => getInnerComp(i, 1));
      expect(clonedSymb.__getSymbols()).toEqual(innerSymb);
    });

    describe('Symbols override', () => {
      test('Symbol with override returns correctly instances to update', () => {
        expect(symbol.__getSymbToUp().length).toBe(allInst.length);
        // With override as `true`, it will return empty array with any 'changed'
        symbol.set(keySymbolOvrd, true);
        expect(symbol.__getSymbToUp({ changed: 'anything' }).length).toBe(0);
        // With override as an array with props, changed option will count
        symbol.set(keySymbolOvrd, ['components']);
        expect(symbol.__getSymbToUp({ changed: 'anything' }).length).toBe(
          allInst.length
        );
        symbol.set(keySymbolOvrd, ['components']);
        expect(symbol.__getSymbToUp({ changed: 'components' }).length).toBe(0);
        expect(
          symbol.__getSymbToUp({ changed: 'components:reset' }).length
        ).toBe(0);
        // Support also overrides with type of actions
        symbol.set(keySymbolOvrd, ['components:change']); // specific change
        expect(symbol.__getSymbToUp({ changed: 'components' }).length).toBe(
          allInst.length
        );
        expect(
          symbol.__getSymbToUp({ changed: 'components:change' }).length
        ).toBe(0);
      });

      test('Symbol is not propagating props data if override is set', () => {
        const propKey = 'someprop';
        const propValue = 'somevalue';
        symbol.set(keySymbolOvrd, true);
        // Single prop update
        symbol.set(propKey, propValue);
        allInst.forEach(cmp => expect(cmp.get(propKey)).toBeFalsy());
        // Multiple props
        symbol.set({ prop1: 'value1', prop2: 'value2' });
        allInst.forEach(cmp => {
          expect(cmp.get('prop1')).toBeFalsy();
          expect(cmp.get('prop2')).toBeFalsy();
        });
        // Override applied on specific properties
        symbol.set(keySymbolOvrd, ['prop1']);
        symbol.set({ prop1: 'value1-2', prop2: 'value2-2' });
        allInst.forEach(cmp => {
          expect(cmp.get('prop1')).toBeFalsy();
          expect(cmp.get('prop2')).toBe('value2-2');
        });
      });

      test('On symbol props update, those having override are ignored', () => {
        const propKey = 'someprop';
        const propValue = 'somevalue';
        comp.set(keySymbolOvrd, true);
        symbol.set(propKey, propValue);
        // All symbols are updated except the one with override
        all.forEach(cmp => {
          if (cmp === comp) {
            expect(cmp.get(propKey)).toBeFalsy();
          } else {
            expect(cmp.get(propKey)).toBe(propValue);
          }
        });
        comp.set(keySymbolOvrd, ['prop1']);
        symbol.set({ prop1: 'value1', prop2: 'value2' });
        // Only the overrided property is ignored
        all.forEach(cmp => {
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
        symbol.set(keySymbolOvrd, ['components']);
        const innCompsLen = symbol.components().length;
        all.forEach(cmp => expect(cmp.components().length).toBe(innCompsLen));
        symbol.components('Test text');
        // The symbol has changed, but istances should remain the same
        expect(symbol.components().length).toBe(1);
        allInst.forEach(cmp => expect(cmp.toHTML()).toBe(comp.toHTML()));
        allInst.forEach(cmp =>
          expect(cmp.components().length).toBe(innCompsLen)
        );
        // Check for add action
        symbol.append('<div>B</div><div>C</div>');
        expect(symbol.components().length).toBe(3);
        allInst.forEach(cmp =>
          expect(cmp.components().length).toBe(innCompsLen)
        );
      });

      test('Symbol is not removing components data if override is set', () => {
        symbol.set(keySymbolOvrd, ['components']);
        const innCompsLen = symbol.components().length;
        symbol
          .components()
          .at(0)
          .remove();
        expect(symbol.components().length).toBe(innCompsLen - 1);
        allInst.forEach(cmp =>
          expect(cmp.components().length).toBe(innCompsLen)
        );
      });

      test('Symbol is not propagating remove on instances with ovverride', () => {
        comp.set(keySymbolOvrd, ['components']);
        const innCompsLen = symbol.components().length;
        symbol
          .components()
          .at(0)
          .remove();
        all.forEach(cmp =>
          expect(cmp.components().length).toBe(
            cmp === comp ? innCompsLen : innCompsLen - 1
          )
        );
      });

      test('On symbol components update, those having override are ignored', () => {
        comp.set(keySymbolOvrd, ['components']);
        const innCompsLen = comp.components().length;
        // Check reset action
        symbol.components('Test text');
        all.forEach(cmp => {
          expect(cmp.components().length).toBe(cmp === comp ? innCompsLen : 1);
        });
        // Align comp with others
        comp.components('Test text');
        all.forEach(cmp => expect(cmp.components().length).toBe(1));

        // Check add action
        symbol.append('<div>A</div>');
        all.forEach(cmp => {
          expect(cmp.components().length).toBe(cmp === comp ? 1 : 2);
        });
        // Align comp with others
        comp.append('<div>A</div>');
        all.forEach(cmp => expect(cmp.components().length).toBe(2));

        // Check remove action
        symbol
          .components()
          .at(0)
          .remove();
        all.forEach(cmp => {
          expect(cmp.components().length).toBe(cmp === comp ? 2 : 1);
        });
      });
    });
  });

  describe('Nested symbols', () => {
    beforeEach(() => {
      comp = wrapper.append(compMultipleNodes)[0];
      compInitChild = comp.components().length;
      symbol = createSymbol(comp);
      const comp2 = createSymbol(comp);
      const comp3 = createSymbol(comp);
      allInst = [comp, comp2, comp3];
      all = [...allInst, symbol];
      // Second symbol
      secComp = wrapper.append(simpleComp2)[0];
      secSymbol = createSymbol(secComp);
    });

    afterEach(() => {
      wrapper.components().reset();
    });

    test('Second symbol created properly', () => {
      const symbs = secSymbol.__getSymbols();
      expect(secSymbol.__isSymbol()).toBe(true);
      expect(secComp.__getSymbol()).toBe(secSymbol);
      expect(symbs.length).toBe(1);
      expect(symbs[0]).toBe(secComp);
      expect(secComp.toHTML()).toBe(secSymbol.toHTML());
    });

    test('Adding the instance, of the second symbol, inside the first symbol, propagates correctly to all first instances', () => {
      const added = symbol.append(secComp)[0];
      expect(added.__isSymbolNested()).toBe(true);
      // The added component is still the second instance
      expect(added).toBe(secComp);
      // The added component still has the reference to the second symbol
      expect(added.__getSymbol()).toBe(secSymbol);
      // The main second symbol now has the reference to all its instances
      const secInstans = secSymbol.__getSymbols();
      expect(secInstans.length).toBe(all.length);
      // All instances still refer to the second symbol
      secInstans.forEach(secInst =>
        expect(secInst.__getSymbol()).toBe(secSymbol)
      );
    });

    test('Adding the instance, of the second symbol, inside one of the first instances, propagates correctly to all first symbols', () => {
      const added = comp.append(secComp)[0];
      // The added component is still the second instance
      expect(added).toBe(secComp);
      // The added component still has the reference to the second symbol
      expect(added.__getSymbol()).toBe(secSymbol);
      // The main second symbol now has the reference to all its instances
      const secInstans = secSymbol.__getSymbols();
      expect(secInstans.length).toBe(all.length);
      // All instances still refer to the second symbol
      secInstans.forEach(secInst =>
        expect(secInst.__getSymbol()).toBe(secSymbol)
      );
    });

    test('Adding the instance, of the second symbol, inside one of the first instances, and then removing it, will not affect second instances outside', () => {
      const secComp2 = createSymbol(secComp);
      const added = comp.append(secComp)[0];
      expect(secComp2.__isSymbolNested()).toBe(false);
      const secInstans = secSymbol.__getSymbols();
      expect(secInstans.length).toBe(all.length + 1); // + 1 is secComp2
      // Remove the second instance, added in one of the first instances
      added.remove();
      // All first symbols will remove their copy and only the secComp2 will remain
      expect(secSymbol.__getSymbols().length).toBe(1);
      // First symbols has the previous number of components inside
      all.forEach(s => expect(s.components().length).toBe(compInitChild));
    });

    test('Moving the second instance inside first instances, propagates correctly to all other first symbols', () => {
      const added = comp.append(secComp)[0];
      expect(added.parent()).toBe(comp); // extra checks
      expect(added.index()).toBe(compInitChild);
      const secInstansArr = secSymbol.__getSymbols().map(i => i.cid);
      expect(secInstansArr.length).toBe(all.length);
      added.move(comp, { at: 0 });
      // After the move, the symbol still have the same references
      const secInstansArr2 = secSymbol.__getSymbols().map(i => i.cid);
      expect(secInstansArr2).toEqual(secInstansArr);
      // All second instances refer to the same second symbol
      all.forEach(c => expect(getFirstInnSymbol(c)).toBe(secSymbol));
    });
  });
});
