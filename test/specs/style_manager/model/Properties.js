import Editor from 'editor/model/Editor';

describe('StyleManager properties logic', () => {
  let obj;
  let em;
  let domc;
  let dv;
  let cssc;
  let sm;

  beforeEach(() => {
    em = new Editor({
      mediaCondition: 'max-width',
      avoidInlineStyle: true,
    });
    domc = em.get('DomComponents');
    cssc = em.get('CssComposer');
    dv = em.get('DeviceManager');
    sm = em.get('SelectorManager');
    obj = em.get('StyleManager');
    em.get('PageManager').onLoad();
  });

  afterEach(() => {
    obj = null;
    em.destroy();
  });

  describe('Composite type', () => {
    const sectorTest = 'sector-test';
    const propTest = 'padding';
    let compTypeProp;

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
    });

    test('Property exists', () => {
      expect(compTypeProp).toBeTruthy();
    });
  });
});
