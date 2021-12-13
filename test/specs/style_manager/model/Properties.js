import Editor from 'editor/model/Editor';

describe('StyleManager properties logic', () => {
  let obj;
  let em;
  let domc;
  let dv;
  let cssc;
  let sm;
  let cmp;
  let rule1;
  let rule2;
  const sectorTest = 'sector-test';

  beforeEach(() => {
    em = new Editor({
      mediaCondition: 'max-width',
      avoidInlineStyle: true,
      styleManager: { custom: true },
    });
    domc = em.get('DomComponents');
    cssc = em.get('CssComposer');
    dv = em.get('DeviceManager');
    sm = em.get('SelectorManager');
    obj = em.get('StyleManager');
    em.get('PageManager').onLoad();
    cmp = domc.addComponent(`<div class="cls"></div>`);
  });

  afterEach(() => {
    obj = null;
    em.destroy();
  });

  describe('Composite type', () => {
    const propTest = 'padding';
    const propInTest = 'padding-top';
    let compTypeProp;
    let compTypePropInn;

    beforeEach(() => {
      rule1 = cssc.addRules(`.cls { color: red; }`)[0];
      obj.addSector(sectorTest, {
        properties: [
          {
            extend: propTest,
            detached: true,
          },
        ],
      });
      compTypeProp = obj.getProperty(sectorTest, propTest);
      compTypePropInn = compTypeProp.getProperty(propInTest);
      em.setSelected(cmp);
      obj.__upSel();
    });

    test('Property exists', () => {
      expect(compTypeProp).toBeTruthy();
      expect(compTypeProp.getProperties().length).toBe(4);
    });

    test('Has inner property', () => {
      expect(compTypePropInn).toBeTruthy();
    });

    test('Inner property has no value', () => {
      expect(compTypeProp.hasValue()).toBe(false);
      expect(compTypePropInn.hasValue()).toBe(false);
    });

    test('Rule selected', () => {
      expect(obj.getLastSelected()).toBe(rule1);
    });

    test('Updating inner property, it reflects on the rule', () => {
      compTypePropInn.upValue('55%');
      const style = rule1.getStyle();
      const otherProps = Object.keys(style).filter(p => p.indexOf('padding') >= 0 && p !== propInTest);
      expect(style[propInTest]).toBe('55%');
      expect(compTypeProp.hasValue()).toBe(true);
      expect(compTypePropInn.hasValue()).toBe(true);
      otherProps.forEach(prop => {
        expect(style[prop]).toBe('');
        if (prop !== propTest) {
          expect(compTypeProp.getProperty(prop).hasValue()).toBe(false);
        }
      });
    });
  });

  describe('Stack type (not detached)', () => {
    const propTest = 'stack-prop';
    const propATest = `${propTest}-a`;
    const propBTest = `${propTest}-b`;
    const propCTest = `${propTest}-c`;
    const propsTest = [propATest, propBTest, propCTest];
    const propStyleValue = 'valueA-1 valueB-1 valueC-1, valueA-2 valueB-2 valueC-2';
    const propStyleExtValue = 'valueC-1-ext, valueC-2-ext';
    let compTypeProp;
    let compTypePropInn;

    beforeEach(() => {
      rule1 = cssc.addRules(`
        .cls {
            ${propTest}: ${propStyleValue};
            ${propCTest}: ${propStyleExtValue};
        }
      `)[0];
      obj.addSector(sectorTest, {
        properties: [
          {
            type: 'stack',
            property: propTest,
            properties: propsTest.map(property => ({ property })),
          },
        ],
      });
      compTypeProp = obj.getProperty(sectorTest, propTest);
      compTypePropInn = compTypeProp.getProperty(propATest);
      em.setSelected(cmp);
      obj.__upSel();
    });

    test('Property exists', () => {
      expect(compTypeProp).toBeTruthy();
      expect(compTypePropInn).toBeTruthy();
      expect(compTypeProp.getProperties().length).toBe(3);
    });

    test('Has the right number of layers', () => {
      expect(compTypeProp.getLayers().length).toBe(2);
    });

    test('Has no selected layer', () => {
      expect(compTypeProp.getSelectedLayer()).toBe(null);
    });

    test('getLayersFromStyle returns correct values', () => {
      expect(
        compTypeProp.__getLayersFromStyle({
          [propTest]: 'valueA-1 valueB-1 valueC-1, valueA-2 valueB-2 valueC-2',
          [propCTest]: 'valueC-1-ext, valueC-2-ext, valueC-3-ext',
          [propBTest]: 'valueB-1-ext',
        })
      ).toEqual([
        {
          [propATest]: 'valueA-1',
          [propBTest]: 'valueB-1-ext',
          [propCTest]: 'valueC-1-ext',
        },
        {
          [propATest]: 'valueA-2',
          [propBTest]: 'valueB-2',
          [propCTest]: 'valueC-2-ext',
        },
        {
          [propCTest]: 'valueC-3-ext',
        },
      ]);
    });

    test('Layers has the right values', () => {
      expect(compTypeProp.getLayer(0).getValues()).toEqual({
        [propATest]: 'valueA-1',
        [propBTest]: 'valueB-1',
        [propCTest]: 'valueC-1-ext',
      });
      expect(compTypeProp.getLayer(1).getValues()).toEqual({
        [propATest]: 'valueA-2',
        [propBTest]: 'valueB-2',
        [propCTest]: 'valueC-2-ext',
      });
    });

    test('Updating inner property, it reflects on the rule', () => {
      expect(rule1.getStyle()).toEqual({
        [propTest]: propStyleValue,
        [propCTest]: propStyleExtValue,
      });
      compTypeProp.selectLayerAt(0);
      compTypeProp.getProperty(propBTest).upValue('valueB-1-mod');
      compTypeProp.selectLayerAt(1);
      compTypeProp.getProperty(propCTest).upValue('valueC-2-mod');
      expect(rule1.getStyle()).toEqual({
        __p: false,
        [propTest]: 'valueA-1 valueB-1-mod valueC-1-ext, valueA-2 valueB-2 valueC-2-mod',
        [propATest]: '',
        [propBTest]: '',
        [propCTest]: '',
      });
    });

    test('Removing layer, updates the rule', () => {
      compTypeProp.removeLayerAt(1);
      expect(rule1.getStyle()).toEqual({
        __p: false,
        [propTest]: 'valueA-1 valueB-1 valueC-1-ext',
        [propATest]: '',
        [propBTest]: '',
        [propCTest]: '',
      });
    });
  });
});
