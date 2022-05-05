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
    cmp = domc.addComponent('<div class="cls"></div>');
  });

  afterEach(() => {
    obj = null;
    em.destroy();
  });

  describe('Composite type', () => {
    const propTest = 'padding';
    const propATest = `${propTest}-top`;
    const propBTest = `${propTest}-right`;
    const propCTest = `${propTest}-bottom`;
    const propDTest = `${propTest}-left`;
    const propATestId = `${propATest}-sub`;
    const propBTestId = `${propBTest}-sub`;
    const propCTestId = `${propCTest}-sub`;
    const propDTestId = `${propDTest}-sub`;
    let compTypeProp;
    let compTypePropInn;

    beforeEach(() => {
      rule1 = cssc.addRules('.cls { color: red; }')[0];
      obj.addSector(sectorTest, {
        properties: [
          {
            extend: propTest,
            detached: true,
          },
        ],
      });
      compTypeProp = obj.getProperty(sectorTest, propTest);
      compTypePropInn = compTypeProp.getProperty(propATestId);
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

    test('Property has no value', () => {
      expect(compTypeProp.hasValue()).toBe(false);
      expect(compTypePropInn.hasValue()).toBe(false);
    });

    test('Rule selected', () => {
      expect(obj.getSelected()).toBe(rule1);
    });

    test('Properties correctly reflect on rule update', () => {
      compTypeProp.set('detached', false);
      rule1.setStyle({ padding: '1px 2px 3px 4px' });
      obj.__upSel();
      [
        [propATestId, '1px'],
        [propBTestId, '2px'],
        [propCTestId, '3px'],
        [propDTestId, '4px'],
      ].forEach(item => {
        expect(compTypeProp.getProperty(item[0]).getFullValue()).toBe(item[1]);
      });
    });

    test('Split value properly', () => {
      expect(compTypeProp.__getSplitValue('1px 2px 3px 4px', { byName: true })).toEqual({
        [propATest]: '1px',
        [propBTest]: '2px',
        [propCTest]: '3px',
        [propDTest]: '4px',
      });
      expect(compTypeProp.__getSplitValue('1px 2px 3px 4px')).toEqual({
        [propATestId]: '1px',
        [propBTestId]: '2px',
        [propCTestId]: '3px',
        [propDTestId]: '4px',
      });
      expect(compTypeProp.__getSplitValue('1px 2px')).toEqual({
        [propATestId]: '1px',
        [propBTestId]: '2px',
        [propCTestId]: '1px',
        [propDTestId]: '2px',
      });
      expect(compTypeProp.__getSplitValue('100%')).toEqual({
        [propATestId]: '100%',
        [propBTestId]: '100%',
        [propCTestId]: '100%',
        [propDTestId]: '100%',
      });
    });

    test('Updating the main property, the value is splitted properly', () => {
      compTypeProp.upValue('1px 2px 3px 4px');
      [
        [propATest, '1px'],
        [propBTest, '2px'],
        [propCTest, '3px'],
        [propDTest, '4px'],
      ].forEach(item => {
        expect(compTypeProp.getProperty(item[0]).getFullValue()).toBe(item[1]);
      });
      compTypeProp.upValue('11px');
      [
        [propATest, '11px'],
        [propBTest, '11px'],
        [propCTest, '11px'],
        [propDTest, '11px'],
      ].forEach(item => {
        expect(compTypeProp.getProperty(item[0]).getFullValue()).toBe(item[1]);
      });
      obj.__upSel();
      expect(rule1.getStyle()).toEqual({
        __p: false,
        color: 'red',
        [propATest]: '11px',
        [propBTest]: '11px',
        [propCTest]: '11px',
        [propDTest]: '11px',
      });
      compTypeProp.upValue('');
      [
        [propATest, ''],
        [propBTest, ''],
        [propCTest, ''],
        [propDTest, ''],
      ].forEach(item => {
        expect(compTypeProp.getProperty(item[0]).getFullValue()).toBe(item[1]);
      });
    });

    test('getPropsFromStyle returns correct values', () => {
      expect(
        compTypeProp.__getPropsFromStyle(
          {
            [propTest]: '1px 2px 3px 4px',
            [propCTest]: '33px',
            [propBTest]: '22%',
          },
          { byName: true }
        )
      ).toEqual({
        [propATest]: '1px',
        [propBTest]: '22%',
        [propCTest]: '33px',
        [propDTest]: '4px',
      });

      // Split correctly props in 4 numeric values
      expect(
        compTypeProp.__getPropsFromStyle(
          {
            [propTest]: '111px',
            [propCTest]: '33px',
            [propBTest]: '22%',
          },
          { byName: true }
        )
      ).toEqual({
        [propATest]: '111px',
        [propBTest]: '22%',
        [propCTest]: '33px',
        [propDTest]: '111px',
      });

      // Resolves correctly with values from inner properties
      expect(
        compTypeProp.__getPropsFromStyle(
          {
            color: 'red',
            [propCTest]: '33px',
          },
          { byName: true }
        )
      ).toEqual({
        [propATest]: '',
        [propBTest]: '',
        [propCTest]: '33px',
        [propDTest]: '',
      });

      // null if no properties are found
      expect(compTypeProp.__getPropsFromStyle({ color: 'red' })).toEqual(null);
    });

    test('Custom fromStyle', () => {
      compTypeProp.set('fromStyle', (style, { separator }) => {
        const values = style[propTest].split(separator);
        return {
          [propATest]: values[0],
          [propBTest]: values[1],
        };
      });
      expect(
        compTypeProp.__getPropsFromStyle({
          [propTest]: 'rgba(valueA 1) rgba(value B)',
        })
      ).toEqual({
        [propATest]: 'rgba(valueA 1)',
        [propBTest]: 'rgba(value B)',
      });
    });

    test('getStyleFromProps', () => {
      rule1.setStyle({ padding: '1px 2px 3px 4px' });
      obj.__upSel();
      expect(compTypeProp.getStyleFromProps()).toEqual({
        [propTest]: '',
        [propATest]: '1px',
        [propBTest]: '2px',
        [propCTest]: '3px',
        [propDTest]: '4px',
      });

      compTypeProp.set('detached', false);
      expect(compTypeProp.getStyleFromProps()).toEqual({
        [propTest]: '1px 2px 3px 4px',
        [propATest]: '',
        [propBTest]: '',
        [propCTest]: '',
        [propDTest]: '',
      });

      compTypeProp.set('detached', true);
      rule1.setStyle({ [propATest]: '10px', [propBTest]: '20px' });
      obj.__upSel();
      expect(compTypeProp.getStyleFromProps()).toEqual({
        [propTest]: '',
        [propATest]: '10px',
        [propBTest]: '20px',
        [propCTest]: '',
        [propDTest]: '',
      });
    });

    test('On clear removes all values', () => {
      rule1.setStyle({ padding: '1px 2px 3px 4px' });
      obj.__upSel();
      expect(compTypeProp.hasValue()).toBe(true);

      compTypeProp.clear();
      expect(compTypeProp.hasValue()).toBe(false);
      expect(rule1.getStyle()).toEqual({
        __p: false,
      });
    });

    test('Get the values from parent style', () => {
      rule1.setStyle({
        padding: '11px 22px',
        'padding-left': '44px',
      });
      const rule2 = cssc.addRules(`
        @media (max-width: 992px) {
          .cls { color: red; }
        }
      `)[0];
      dv.select('tablet');
      obj.__upSel();
      expect(obj.getSelected()).toBe(rule2);
      expect(obj.getSelectedParents()).toEqual([rule1]);

      expect(compTypeProp.hasValue()).toBe(true);
      expect(compTypeProp.hasValue({ noParent: true })).toBe(false);
      [
        [propATest, '11px'],
        [propBTest, '22px'],
        [propCTest, '11px'],
        [propDTest, '44px'],
      ].forEach(item => {
        const prop = compTypeProp.getProperty(item[0]);
        expect(prop.hasValue()).toBe(true);
        expect(prop.hasValue({ noParent: true })).toBe(false);
        expect(prop.getFullValue()).toBe(item[1]);
      });
    });

    test('Parent styles are ignored if on the lower device', () => {
      const rule2 = cssc.addRules(`
        @media (max-width: 992px) {
          .cls {
            padding: 11px 22px;
            padding-left: 44px;
           }
        }
      `)[0];
      dv.select('tablet');
      obj.__upSel();
      expect(obj.getSelected()).toBe(rule2);
      expect(compTypeProp.hasValue({ noParent: true })).toBe(true);
      [
        [propATest, '11px'],
        [propBTest, '22px'],
        [propCTest, '11px'],
        [propDTest, '44px'],
      ].forEach(item => {
        const prop = compTypeProp.getProperty(item[0]);
        expect(prop.getFullValue()).toBe(item[1]);
      });

      dv.select('desktop');
      obj.__upSel();
      expect(obj.getSelected()).toBe(rule1);
      expect(obj.getSelectedParents()).toEqual([]);
      [
        [propATest, ''],
        [propBTest, ''],
        [propCTest, ''],
        [propDTest, ''],
      ].forEach(item => {
        const prop = compTypeProp.getProperty(item[0]);
        expect(prop.hasValue()).toBe(false);
        expect(prop.getFullValue()).toBe(item[1]);
      });
    });

    test("Changing one inner rule (detached property) doesn't affect others", () => {
      rule1.setStyle({
        padding: '1px 2px',
        'padding-left': '4px',
      });
      const rule2 = cssc.addRules(`
        @media (max-width: 992px) {
          .cls { padding-left: 44px }
        }
      `)[0];
      dv.select('tablet');
      obj.__upSel();
      [
        [propATest, '1px'],
        [propBTest, '2px'],
        [propCTest, '1px'],
      ].forEach(item => {
        const prop = compTypeProp.getProperty(item[0]);
        expect(prop.hasValue({ noParent: true })).toBe(false);
        expect(prop.getFullValue()).toBe(item[1]);
      });

      const propD = compTypeProp.getProperty(propDTest);
      expect(propD.hasValue({ noParent: true })).toBe(true);
      expect(propD.getFullValue()).toBe('44px');

      // By editing the last one, the rule should not take other values
      propD.upValue('45px');
      compTypeProp.getProperty(propATest).upValue('11px');
      obj.__upSel();
      expect(rule2.getStyle()).toEqual({
        __p: false,
        [propATest]: '11px',
        [propDTest]: '45px',
      });
      // Other properties shouldn't change
      [
        [propBTest, '2px'],
        [propCTest, '1px'],
      ].forEach(item => {
        const prop = compTypeProp.getProperty(item[0]);
        expect(prop.hasValue({ noParent: true })).toBe(false);
        expect(prop.getFullValue()).toBe(item[1]);
      });
    });

    test('getStyleFromProps with custom toStyle', () => {
      rule1.setStyle({ padding: '1px 2px 3px 4px' });
      obj.__upSel();
      compTypeProp.set('toStyle', values => {
        return {
          [propTest]: `rgba(${values[propATestId]}, ${values[propBTestId]}, ${values[propDTestId]})`,
        };
      });
      compTypeProp.set('detached', false);
      expect(compTypeProp.getStyleFromProps()).toEqual({
        [propTest]: 'rgba(1px, 2px, 4px)',
        [propATest]: '',
        [propBTest]: '',
        [propCTest]: '',
        [propDTest]: '',
      });
    });

    test('Update on the rule reflects to the property correctly', () => {
      rule1.setStyle({ padding: '1px 2px 3px 4px' });
      obj.__upSel();
      compTypeProp.getProperty(propCTest).upValue('50%');
      [
        [propATest, '1px'],
        [propBTest, '2px'],
        [propCTest, '50%'],
        [propDTest, '4px'],
      ].forEach(item => {
        const prop = compTypeProp.getProperty(item[0]);
        expect(prop.getFullValue()).toBe(item[1]);
      });
    });

    test('Update on properties reflects to the rule correctly', () => {
      compTypeProp.set('detached', false);
      rule1.setStyle({ padding: '1px 2px 3px 4px' });
      obj.__upSel();
      compTypeProp.getProperty(propCTest).upValue('50%');
      obj.__upSel();
      expect(rule1.getStyle()).toEqual({
        __p: false,
        padding: '1px 2px 50% 4px',
      });
    });

    test('Updating inner property, it reflects on the rule', () => {
      compTypePropInn.upValue('55%');
      const style = rule1.getStyle();
      const otherProps = Object.keys(style).filter(p => p.indexOf('padding') >= 0 && p !== propATest);
      expect(style[propATest]).toBe('55%');
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

  describe('Stack type', () => {
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

    test('Property has no value', () => {
      expect(compTypeProp.hasValue()).toBe(true);
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

    test('getLayersFromStyle with empty values', () => {
      expect(compTypeProp.__getLayersFromStyle({ [propTest]: '' })).toBe(null);
      expect(compTypeProp.__getLayersFromStyle({ color: 'red' })).toBe(null);
    });

    test('Custom fromStyle', () => {
      compTypeProp.set('fromStyle', (style, { separatorLayers }) => {
        const layerValues = style[propTest].split(separatorLayers);
        return layerValues.map(value => ({ value }));
      });
      expect(
        compTypeProp.__getLayersFromStyle({
          [propTest]: 'rgba(valueA-1, valueB-1), rgba(valueA-2, valueB-2)',
        })
      ).toEqual([
        {
          value: 'rgba(valueA-1, valueB-1)',
        },
        {
          value: 'rgba(valueA-2, valueB-2)',
        },
      ]);
    });

    test('getStyleFromLayers', () => {
      expect(compTypeProp.getStyleFromLayers()).toEqual({
        [propTest]: 'valueA-1 valueB-1 valueC-1-ext, valueA-2 valueB-2 valueC-2-ext',
        [propATest]: '',
        [propBTest]: '',
        [propCTest]: '',
      });
    });

    test('getStyleFromLayers detached', () => {
      compTypeProp.set('detached', true);
      expect(compTypeProp.getStyleFromLayers()).toEqual({
        [propTest]: '',
        [propATest]: 'valueA-1, valueA-2',
        [propBTest]: 'valueB-1, valueB-2',
        [propCTest]: 'valueC-1-ext, valueC-2-ext',
      });
    });

    test('Custom toStyle', () => {
      compTypeProp.set('toStyle', values => {
        return {
          [propTest]: `rgba(${values[propATest]}, ${values[propBTest]}, ${values[propCTest]})`,
        };
      });
      expect(compTypeProp.getStyleFromLayers()).toEqual({
        [propTest]: 'rgba(valueA-1, valueB-1, valueC-1-ext), rgba(valueA-2, valueB-2, valueC-2-ext)',
        [propATest]: '',
        [propBTest]: '',
        [propCTest]: '',
      });
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

    test('Updating the rule reflects in layers', () => {
      rule1.setStyle({
        [propTest]: 'valueAa-1 valueBb-1 valueCc-1, valueAa-2 valueBb-2 valueCc-2',
        [propBTest]: 'valueB-1-ext, valueB-2-ext',
      });
      obj.__upSel();
      expect(compTypeProp.getLayers().length).toBe(2);
      expect(compTypeProp.getLayer(0).getValues()).toEqual({
        [propATest]: 'valueAa-1',
        [propBTest]: 'valueB-1-ext',
        [propCTest]: 'valueCc-1',
      });
      expect(compTypeProp.getLayer(1).getValues()).toEqual({
        [propATest]: 'valueAa-2',
        [propBTest]: 'valueB-2-ext',
        [propCTest]: 'valueCc-2',
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
      });
    });

    test('Updating inner property (detached), it reflects on the rule', () => {
      compTypeProp.set('detached', true);
      compTypeProp.selectLayerAt(0);
      compTypeProp.getProperty(propBTest).upValue('valueB-1-mod');
      compTypeProp.selectLayerAt(1);
      compTypeProp.getProperty(propCTest).upValue('valueC-2-mod');
      expect(rule1.getStyle()).toEqual({
        __p: false,
        [propATest]: 'valueA-1, valueA-2',
        [propBTest]: 'valueB-1-mod, valueB-2',
        [propCTest]: 'valueC-1-ext, valueC-2-mod',
      });
    });

    test('Removing layer, updates the rule', () => {
      compTypeProp.removeLayerAt(1);
      expect(rule1.getStyle()).toEqual({
        __p: false,
        [propTest]: 'valueA-1 valueB-1 valueC-1-ext',
      });
    });

    test('Removing all layers', () => {
      compTypeProp.removeLayerAt(1);
      compTypeProp.removeLayerAt(0);
      expect(compTypeProp.getLayers().length).toBe(0);
      expect(rule1.getStyle()).toEqual({
        __p: false,
      });
    });

    test('On clear removes all values', () => {
      compTypeProp.addLayer();
      compTypeProp.clear();
      expect(compTypeProp.hasValue()).toBe(false);
      expect(compTypeProp.getLayers().length).toBe(0);
      expect(rule1.getStyle()).toEqual({
        __p: false,
      });
    });

    test('On clear removes all values (detached)', () => {
      compTypeProp.set('detached', true);
      compTypeProp.clear();
      expect(compTypeProp.hasValue()).toBe(false);
      expect(compTypeProp.getLayers().length).toBe(0);
      expect(rule1.getStyle()).toEqual({
        __p: false,
      });
    });

    test('Get the values from parent style', () => {
      const rule2 = cssc.addRules(`
        @media (max-width: 992px) {
            .cls { color: red; }
        }
      `)[0];
      dv.select('tablet');
      obj.__upSel();
      expect(obj.getSelected()).toBe(rule2);
      expect(obj.getSelectedParents()).toEqual([rule1]);

      expect(compTypeProp.hasValue()).toBe(true);
      expect(compTypeProp.hasValue({ noParent: true })).toBe(false);
      expect(compTypeProp.getLayers().length).toBe(2);
    });

    test('Adding new layer, updates the rule', () => {
      compTypeProp.addLayer(
        {
          [propATest]: 'valueA-new',
          [propBTest]: 'valueB-new',
          [propCTest]: 'valueC-new',
        },
        { at: 0 }
      );
      expect(rule1.getStyle()).toEqual({
        __p: false,
        [propTest]: 'valueA-new valueB-new valueC-new, valueA-1 valueB-1 valueC-1-ext, valueA-2 valueB-2 valueC-2-ext',
      });
    });

    test('Adding new layer, updates the rule (detached)', () => {
      compTypeProp.set('detached', true);
      compTypeProp.addLayer(
        {
          [propATest]: 'valueA-new AA',
          [propBTest]: 'valueB-new BB',
          [propCTest]: 'valueC-new CC',
        },
        { at: 0 }
      );
      obj.__upSel();
      expect(rule1.getStyle()).toEqual({
        __p: false,
        [propATest]: 'valueA-new AA, valueA-1, valueA-2',
        [propBTest]: 'valueB-new BB, valueB-1, valueB-2',
        [propCTest]: 'valueC-new CC, valueC-1-ext, valueC-2-ext',
      });
      // Check also the layers
      const layers = compTypeProp.getLayers();
      expect(layers.length).toBe(3);
      const [layer1, layer2, layer3] = layers;
      expect(layer1.getValues()).toEqual({
        [propATest]: 'valueA-new AA',
        [propBTest]: 'valueB-new BB',
        [propCTest]: 'valueC-new CC',
      });
      expect(layer2.getValues()).toEqual({
        [propATest]: 'valueA-1',
        [propBTest]: 'valueB-1',
        [propCTest]: 'valueC-1-ext',
      });
      expect(layer3.getValues()).toEqual({
        [propATest]: 'valueA-2',
        [propBTest]: 'valueB-2',
        [propCTest]: 'valueC-2-ext',
      });
    });
  });
});
