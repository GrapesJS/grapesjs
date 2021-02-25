import Editor from 'editor';

describe('Pages', () => {
  let editor;
  let em;
  let domc;
  let initCmpLen;
  let pm;

  beforeAll(() => {
    editor = new Editor();
    em = editor.getModel();
    domc = em.get('DomComponents');
    pm = em.get('PageManager');
    initCmpLen = Object.keys(domc.allById()).length;
  });

  afterAll(() => {
    editor.destroy();
    pm = 0;
    em = 0;
    domc = 0;
  });

  beforeEach(() => {});
  afterEach(() => {});

  test('Pages module exists', () => {
    expect(pm).toBeTruthy();
  });

  test('Has by default one page created', () => {
    expect(pm.getAll().length).toBe(1);
  });

  test('The default page is selected', () => {
    expect(pm.getMain()).toBe(pm.getSelected());
  });

  test('The default page has one frame', () => {
    expect(pm.getMain().getFrames().length).toBe(1);
  });

  test('The default frame has the wrapper component', () => {
    const frame = pm
      .getMain()
      .getFrames()
      .at(0);
    const frameCmp = frame.getComponents();
    expect(frameCmp.is('wrapper')).toBe(true);
  });

  test('The default wrapper has no content', () => {
    const frame = pm
      .getMain()
      .getFrames()
      .at(0);
    const frameCmp = frame.getComponents();
    expect(frameCmp.components().length).toBe(0);
    expect(frame.getStyles().length).toBe(0);
    expect(initCmpLen).toBe(1);
  });

  describe.only('Init with pages', () => {
    let idPage1, idComp1, idComp2, comp1, comp2, initPages;
    const createCompDef = id => ({
      attributes: {
        id,
        class: id,
        customattr: id
      },
      components: `Component ${id}`
    });
    beforeAll(() => {
      idPage1 = 'page-1';
      idComp1 = 'comp1';
      idComp2 = 'comp2';
      comp1 = createCompDef(idComp1);
      comp2 = createCompDef(idComp2);
      initPages = [
        {
          id: idPage1,
          frames: [
            {
              components: [comp1],
              styles: `#${idComp1} { color: red }`
            }
          ]
        },
        {
          id: 'page-2',
          frames: [
            {
              components: [comp2],
              styles: `#${idComp2} { color: blue }`
            }
          ]
        }
      ];
      editor = new Editor({
        pages: {
          pages: initPages
        }
      });
      em = editor.getModel();
      domc = em.get('DomComponents');
      pm = em.get('PageManager');
      initCmpLen = Object.keys(domc.allById()).length;
    });

    afterAll(() => {
      editor.destroy();
      pm = 0;
      em = 0;
      domc = 0;
    });

    test('Pages are created correctly', () => {
      const pages = pm.getAll();
      expect(pages.length).toBe(initPages.length);
      pages.map(page => {
        expect(page.get('id')).toBeTruthy();
        // expect(page.getMainFrame().getComponents().get('type')).toBe('wrapper');
      });
    });
    // test('Pages are created', () => {
    //     expect(pm.getAll().length).toBe(initPages.length);
    // });
  });
});
