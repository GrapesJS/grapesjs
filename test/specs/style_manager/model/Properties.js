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
    [rule1, rule2] = cssc.addRules(`
        .cls { color: red; }
        @media (max-width: 992px) {
            .cls { color: blue; }
        }
    `);
  });

  afterEach(() => {
    obj = null;
    em.destroy();
  });

  describe('Composite type', () => {
    const sectorTest = 'sector-test';
    const propTest = 'padding';
    const propInTest = 'padding-top';
    let compTypeProp;
    let compTypePropInn;

    beforeEach(() => {
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

    test('Rule selected', () => {
      expect(obj.getLastSelected()).toBe(rule1);
    });

    test('Updating inner property, it reflects on the rule', () => {
      compTypePropInn.upValue('55');
      expect(rule1.getStyle()).toBe(1);
    });
  });
});
