import Editor from 'editor';

describe('Pages', () => {
  let editor;
  let em;
  let domc;
  let initCmpLen;
  let pm;

  beforeAll(() => {
    editor = new Editor({ pageManager: true });
    em = editor.getModel();
    domc = em.get('DomComponents');
    pm = em.get('PageManager');
    pm.onLoad();
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
    const frame = pm.getMain().getFrames().at(0);
    const frameCmp = frame.getComponent();
    expect(frameCmp.is('wrapper')).toBe(true);
  });

  test('The default wrapper has no content', () => {
    const frame = pm.getMain().getFrames().at(0);
    const frameCmp = frame.getComponent();
    expect(frameCmp.components().length).toBe(0);
    expect(frame.getStyles().length).toBe(0);
    expect(initCmpLen).toBe(1);
  });

  test('Adding new page with selection', () => {
    const name = 'Test page';
    const page = pm.add({ name }, { select: 1 });
    expect(page.id).toBeTruthy();
    expect(page.get('name')).toBe(name);
    expect(pm.getSelected()).toBe(page);
    expect(pm.getAll().length).toBe(2);
    const pageComp = page.getMainComponent();
    expect(pageComp.is('wrapper')).toBe(true);
    expect(pageComp.components().length).toBe(0);
  });

  describe('Init with pages', () => {
    let idPage1, idComp1, idComp2, comp1, comp2, initPages, allbyId;
    const createCompDef = id => ({
      attributes: {
        id,
        class: id,
        customattr: id,
      },
      components: `Component ${id}`,
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
          component: [comp1],
          styles: `#${idComp1} { color: red }`,
        },
        {
          id: 'page-2',
          frames: [
            {
              component: [comp2],
              styles: `#${idComp2} { color: blue }`,
            },
          ],
        },
        {
          id: 'page-3',
          frames: [
            {
              component: '<div id="comp3">Component 3</div>',
              styles: '#comp3 { color: green }',
            },
          ],
        },
      ];
      editor = new Editor({
        pageManager: {
          pages: initPages,
        },
      });
      em = editor.getModel();
      domc = em.get('DomComponents');
      pm = em.get('PageManager');
      pm.onLoad();
      allbyId = domc.allById();
      initCmpLen = Object.keys(allbyId).length;
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
        // All pages should have an ID
        expect(page.get('id')).toBeTruthy();
        // The main component is always a wrapper
        expect(page.getMainFrame().getComponent().is('wrapper')).toBe(true);
      });
      // Components container should contain the same amount of wrappers as pages
      const wrappers = Object.keys(allbyId)
        .map(id => allbyId[id])
        .filter(i => i.is('wrapper'));
      expect(wrappers.length).toBe(initPages.length);
      // Components container should contain the right amount of components
      // Number of wrappers (eg. 3) where each one containes 1 component and 1 textnode (3 * 3)
      expect(initCmpLen).toBe(initPages.length * 3);
      // Each page contains 1 rule per component
      expect(em.get('CssComposer').getAll().length).toBe(initPages.length);
    });
  });
});

describe('Managing pages', () => {
  let editor;
  let em;
  let domc;
  let initCmpLen;
  let pm;

  beforeEach(() => {
    editor = new Editor({ pageManager: true });
    em = editor.getModel();
    domc = em.get('DomComponents');
    pm = em.get('PageManager');
    editor.getModel().loadOnStart();
    initCmpLen = Object.keys(domc.allById()).length;
  });

  afterEach(() => {
    editor.destroy();
    pm = 0;
    em = 0;
    domc = 0;
  });

  test('Add page', () => {
    const eventAdd = jest.fn();
    em.on(pm.events.add, eventAdd);
    pm.add({});
    expect(pm.getAll().length).toBe(2);
    expect(eventAdd).toBeCalledTimes(1);
  });

  test('Abort add page', () => {
    em.on(pm.events.addBefore, (p, c, opts) => {
      opts.abort = 1;
    });
    pm.add({});
    expect(pm.getAll().length).toBe(1);
  });

  test('Abort add page and complete', () => {
    em.on(pm.events.addBefore, (p, complete, opts) => {
      opts.abort = 1;
      complete();
    });
    pm.add({});
    expect(pm.getAll().length).toBe(2);
  });

  test('Remove page', () => {
    const eventRm = jest.fn();
    em.on(pm.events.remove, eventRm);
    const page = pm.add({});
    pm.remove(page.id);
    expect(pm.getAll().length).toBe(1);
    expect(eventRm).toBeCalledTimes(1);
  });

  test('Abort remove page', () => {
    em.on(pm.events.removeBefore, (p, c, opts) => {
      opts.abort = 1;
    });
    const page = pm.add({});
    pm.remove(page.id);
    expect(pm.getAll().length).toBe(2);
  });

  test('Abort remove page and complete', () => {
    em.on(pm.events.removeBefore, (p, complete, opts) => {
      opts.abort = 1;
      complete();
    });
    const page = pm.add({});
    pm.remove(page.id);
    expect(pm.getAll().length).toBe(1);
  });

  test('Change page', () => {
    const event = jest.fn();
    em.on(pm.events.update, event);
    const page = pm.add({});
    const up = { name: 'Test' };
    const opts = { myopts: 1 };
    page.set(up, opts);
    expect(event).toBeCalledTimes(1);
    expect(event).toBeCalledWith(page, up, opts);
  });
});
