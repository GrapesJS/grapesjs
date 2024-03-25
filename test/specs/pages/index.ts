import { ComponentDefinition } from '../../../src/dom_components/model/types';
import Editor from '../../../src/editor';
import EditorModel from '../../../src/editor/model/Editor';
import { PageProperties } from '../../../src/pages/model/Page';

describe('Pages', () => {
  let editor: Editor;
  let em: EditorModel;
  let domc: Editor['Components'];
  let initCmpLen = 0;
  let pm: Editor['Pages'];

  beforeAll(() => {
    editor = new Editor({ pageManager: {} });
    em = editor.getModel();
    domc = em.Components;
    pm = em.Pages;
    pm.onLoad();
    initCmpLen = Object.keys(domc.allById()).length;
  });

  afterAll(() => {
    editor.destroy();
  });

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
    const page = pm.add({ name }, { select: true })!;
    expect(page.id).toBeTruthy();
    expect(page.get('name')).toBe(name);
    expect(pm.getSelected()).toBe(page);
    expect(pm.getAll().length).toBe(2);
    const pageComp = page.getMainComponent();
    expect(pageComp.is('wrapper')).toBe(true);
    expect(pageComp.components().length).toBe(0);
  });

  describe('Init with pages', () => {
    let idPage1 = 'page-1';
    let idComp1 = 'comp1';
    let idComp2 = 'comp2';
    let comp1: ComponentDefinition;
    let comp2: ComponentDefinition;
    let initPages: PageProperties[];
    let allbyId: ReturnType<Editor['Components']['allById']>;

    const createCompDef = (id: string): ComponentDefinition => ({
      attributes: {
        id,
        class: id,
        customattr: id,
      },
      components: `Component ${id}`,
    });

    beforeAll(() => {
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
      domc = em.Components;
      pm = em.Pages;
      pm.onLoad();
      allbyId = domc.allById();
      initCmpLen = Object.keys(allbyId).length;
    });

    afterAll(() => {
      editor.destroy();
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
      expect(em.Css.getAll().length).toBe(initPages.length);
    });

    test('Change initial selected page', () => {
      const selected = 'page-3';
      editor = new Editor({
        pageManager: {
          pages: initPages,
          selected,
        },
      });
      pm = editor.getModel().Pages;
      pm.onLoad();
      pm.getSelected();
      expect(pm.getSelected()?.id).toBe(selected);
    });
  });
});

describe('Managing pages', () => {
  let editor: Editor;
  let em: EditorModel;
  let domc: Editor['Components'];
  let initCmpLen = 0;
  let pm: Editor['Pages'];

  beforeEach(() => {
    editor = new Editor({ pageManager: {} });
    em = editor.getModel();
    domc = em.Components;
    pm = em.Pages;
    editor.getModel().loadOnStart();
    initCmpLen = Object.keys(domc.allById()).length;
  });

  afterEach(() => {
    editor.destroy();
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
    const page = pm.add({})!;
    pm.remove(`${page.id}`);
    expect(pm.getAll().length).toBe(1);
    expect(eventRm).toBeCalledTimes(1);
  });

  test('Abort remove page', () => {
    em.on(pm.events.removeBefore, (p, c, opts) => {
      opts.abort = 1;
    });
    const page = pm.add({})!;
    pm.remove(`${page.id}`);
    expect(pm.getAll().length).toBe(2);
  });

  test('Abort remove page and complete', () => {
    em.on(pm.events.removeBefore, (p, complete, opts) => {
      opts.abort = 1;
      complete();
    });
    const page = pm.add({})!;
    pm.remove(`${page.id}`);
    expect(pm.getAll().length).toBe(1);
  });

  test('Change page', () => {
    const event = jest.fn();
    em.on(pm.events.update, event);
    const page = pm.add({})!;
    const up = { name: 'Test' };
    const opts = { myopts: 1 };
    page.set(up, opts);
    expect(event).toBeCalledTimes(1);
    expect(event).toBeCalledWith(page, up, opts);
  });

  test('Prevent duplicate ids in components and styles', () => {
    const id = 'myid';
    const idSel = `#${id}`;
    pm.add({
      component: `<div id="${id}">My Page</div>`,
      styles: `${idSel} { color: red }`,
    })!;
    pm.add({
      component: `<div id="${id}">My Page</div>`,
      styles: `${idSel} { color: blue }`,
    })!;

    expect(pm.getAll().length).toBe(3);

    // Check component/rule from the first page
    const cmp1 = domc.allById()[id];
    const rule1 = em.Css.getRule(idSel)!;
    expect(cmp1.getId()).toBe(id);
    expect(rule1.getSelectorsString()).toBe(idSel);
    expect(rule1.getStyle()).toEqual({ color: 'red' });

    // Check component/rule from the second page
    const id2 = 'myid-2';
    const idSel2 = `#${id2}`;
    const cmp2 = domc.allById()[id2];
    const rule2 = em.Css.getRule(idSel2)!;
    expect(cmp2.getId()).toBe(id2);
    expect(rule2.getSelectorsString()).toBe(idSel2);
    expect(rule2.getStyle()).toEqual({ color: 'blue' });
  });
});
