import CanvasEvents from '../../../src/canvas/types';
import { ComponentDefinition } from '../../../src/dom_components/model/types';
import Editor from '../../../src/editor';
import EditorModel from '../../../src/editor/model/Editor';
import { PageProperties } from '../../../src/pages/model/Page';
import { DEFAULT_CMPS, setupTestEditor, waitEditorEvent } from '../../common';

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
    expect(initCmpLen).toBe(DEFAULT_CMPS);
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
      pages.map((page) => {
        // All pages should have an ID
        expect(page.get('id')).toBeTruthy();
        // The main component is always a wrapper
        expect(page.getMainFrame().getComponent().is('wrapper')).toBe(true);
      });
      // Components container should contain the same amount of wrappers as pages
      const wrappers = Object.keys(allbyId)
        .map((id) => allbyId[id])
        .filter((i) => i.is('wrapper'));
      expect(wrappers.length).toBe(initPages.length);
      // Components container should contain the right amount of components
      // Number of wrappers (eg. 3) where each one containes 1 component and 1 textnode (5 * 3)
      expect(initCmpLen).toBe((2 + DEFAULT_CMPS) * 3);
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
    expect(eventAdd).toHaveBeenCalledTimes(1);
  });

  test('Abort add page', () => {
    em.on(pm.events.addBefore, (p, c, opts) => {
      opts.abort = true;
    });
    pm.add({});
    expect(pm.getAll().length).toBe(1);
  });

  test('Abort add page and complete', () => {
    em.on(pm.events.addBefore, (p, complete, opts) => {
      opts.abort = true;
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
    expect(eventRm).toHaveBeenCalledTimes(1);
  });

  test('Abort remove page', () => {
    em.on(pm.events.removeBefore, (p, c, opts) => {
      (opts as any).abort = true;
    });
    const page = pm.add({})!;
    pm.remove(`${page.id}`);
    expect(pm.getAll().length).toBe(2);
  });

  test('Abort remove page and complete', () => {
    em.on(pm.events.removeBefore, (p, complete, opts) => {
      (opts as any).abort = true;
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
    expect(event).toHaveBeenCalledTimes(1);
    expect(event).toHaveBeenCalledWith(page, up, opts);
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

  test('Skip pages from project storage while keeping runtime models', () => {
    const storedPage = pm.add({
      id: 'stored-page',
      component: '<div>Stored page</div>',
    })!;
    const skippedPage = pm.add({
      id: 'skipped-page',
      skipFromStorage: true,
      frames: [
        {
          id: 'skipped-page-frame',
          component: '<div>Skipped page frame</div>',
        },
      ],
    })!;
    const storedPage2 = pm.add({
      id: 'stored-page-2',
      component: '<div>Stored page 2</div>',
    })!;

    expect(pm.getAll().map((page) => page.getId())).toEqual([
      pm.getMain().getId(),
      storedPage.getId(),
      skippedPage.getId(),
      storedPage2.getId(),
    ]);
    expect(skippedPage.getFrames().length).toBe(1);

    const storedPages = editor.getProjectData().pages;
    expect(storedPages.map((page: any) => page.id)).toEqual([
      pm.getMain().getId(),
      storedPage.getId(),
      storedPage2.getId(),
    ]);
    expect(storedPages.find((page: any) => page.id === skippedPage.getId())).toBeUndefined();
    expect(storedPages.every((page: any) => !('skipFromStorage' in page))).toBe(true);
  });

  test('Skip frames from project storage while keeping runtime models', () => {
    const page = pm.add({
      id: 'frames-page',
      frames: [
        {
          id: 'frame-1',
          component: '<div>Frame 1</div>',
        },
        {
          id: 'frame-2',
          component: '<div>Frame 2</div>',
          skipFromStorage: true,
        },
        {
          id: 'frame-3',
          component: '<div>Frame 3</div>',
        },
      ],
    })!;

    expect(page.getFrames().map((frame) => frame.id)).toEqual(['frame-1', 'frame-2', 'frame-3']);

    const storedPage = editor.getProjectData().pages.find((item: any) => item.id === page.getId());
    expect(storedPage.frames.map((frame: any) => frame.id)).toEqual(['frame-1', 'frame-3']);
    expect(storedPage.frames.every((frame: any) => !('skipFromStorage' in frame))).toBe(true);
    expect(storedPage.frames[0].component).toBeTruthy();
    expect(storedPage.frames[1].component).toBeTruthy();
  });

  test('Load project data with skipped pages and frames but omit them on the next store', () => {
    editor.loadProjectData({
      assets: [],
      pages: [
        {
          id: 'page-stored',
          frames: [
            {
              id: 'frame-stored',
              component: '<div>Stored frame</div>',
            },
            {
              id: 'frame-skipped',
              component: '<div>Skipped frame</div>',
              skipFromStorage: true,
            },
          ],
        },
        {
          id: 'page-skipped',
          skipFromStorage: true,
          frames: [
            {
              id: 'frame-on-skipped-page',
              component: '<div>Skipped page frame</div>',
            },
          ],
        },
      ],
      styles: [],
    } as any);

    expect(pm.getAll().map((page) => page.getId())).toEqual(['page-stored', 'page-skipped']);
    expect(
      pm
        .get('page-stored')
        ?.getFrames()
        .map((frame) => frame.id),
    ).toEqual(['frame-stored', 'frame-skipped']);
    expect(
      pm
        .get('page-skipped')
        ?.getFrames()
        .map((frame) => frame.id),
    ).toEqual(['frame-on-skipped-page']);

    const storedPages = editor.getProjectData().pages;
    expect(storedPages.map((page: any) => page.id)).toEqual(['page-stored']);
    expect(storedPages[0].frames.map((frame: any) => frame.id)).toEqual(['frame-stored']);
  });

  test('Do not leak skipFromStorage in direct page/frame serialization', () => {
    const page = pm.add({
      id: 'serialized-page',
      skipFromStorage: false,
      frames: [
        {
          id: 'serialized-frame',
          component: '<div>Serialized frame</div>',
          skipFromStorage: false,
        },
      ],
    })!;

    expect(page.toJSON()).not.toHaveProperty('skipFromStorage');
    expect(page.getMainFrame().toJSON()).not.toHaveProperty('skipFromStorage');
  });
});

describe('Pages in canvas', () => {
  let editor: Editor;
  let canvas: Editor['Canvas'];
  let em: EditorModel;
  let fxt: HTMLElement;
  let pm: Editor['Pages'];
  const clsPageEl = 'cmp';
  const selPageEl = `.${clsPageEl}`;

  const getPageContent = () => canvas.getBody().querySelector(selPageEl)?.innerHTML;

  beforeEach(async () => {
    const testEditor = setupTestEditor({
      withCanvas: true,
      config: {
        pageManager: {
          pages: [
            {
              id: 'page-1',
              component: `<div class="${clsPageEl}">Page 1</div>`,
            },
          ],
        },
      },
    });
    editor = testEditor.editor;
    canvas = editor.Canvas;
    em = testEditor.em;
    fxt = testEditor.fixtures;
    pm = editor.Pages;
    await waitEditorEvent(em, 'change:readyCanvas');
  });

  afterEach(() => {
    editor.destroy();
  });

  test('Pages are rendering properly with undo/redo', async () => {
    const mainPage = pm.getMain();
    expect(mainPage).toBe(pm.getSelected());

    const page = pm.add(
      {
        id: 'page-2',
        component: `<div class="${clsPageEl}">Page 2</div>`,
      },
      { select: true },
    )!;

    // Check the second page is selected and rendered properly
    expect(page).toBe(pm.getSelected());
    await waitEditorEvent(em, CanvasEvents.frameLoadBody);
    expect(getPageContent()).toEqual('Page 2');

    // Undo and check the main page is rendered properly
    em.UndoManager.undo();
    expect(mainPage).toBe(pm.getSelected());
    await waitEditorEvent(em, CanvasEvents.frameLoadBody);
    expect(getPageContent()).toBe('Page 1');

    // Redo and check the second page is rendered properly again
    em.UndoManager.redo();
    expect(page).toBe(pm.getSelected());
    await waitEditorEvent(em, CanvasEvents.frameLoadBody);
    expect(getPageContent()).toEqual('Page 2');
  });

  test('Page with refComponent renders the same model and keeps original ownership', async () => {
    const mainPage = pm.getMain();
    const mainWrapper = mainPage.getMainComponent();
    const target = mainWrapper.append({
      attributes: { id: 'isolated-component' },
      content: 'Original content',
    })[0];

    const tempPage = pm.add(
      {
        id: 'temp-page',
        frames: [{ refComponent: target }],
        skipFromStorage: true,
      },
      { select: true },
    )!;

    await waitEditorEvent(em, CanvasEvents.frameLoadBody);
    expect(canvas.getBody().querySelector('#isolated-component')?.textContent).toBe('Original content');
    expect(target.parent()).toBe(mainWrapper);

    target.set('content', 'Updated content');
    expect(canvas.getBody().querySelector('#isolated-component')?.textContent).toBe('Updated content');

    pm.select(mainPage);
    await waitEditorEvent(em, CanvasEvents.frameLoadBody);
    expect(canvas.getBody().querySelector('#isolated-component')?.textContent).toBe('Updated content');

    pm.remove(tempPage);
    expect(mainWrapper.components().models).toContain(target);
    expect(target.parent()).toBe(mainWrapper);
  });

  test('Moving a component tree across page frames updates its frame reference', () => {
    const mainFrame = pm.getMain().getMainFrame();
    const mainWrapper = mainFrame.getComponent();
    const page = pm.add({
      id: 'frame-target-page',
      component: [],
    })!;
    const targetFrame = page.getMainFrame();
    const targetWrapper = targetFrame.getComponent();
    const target = mainWrapper.append({
      tagName: 'section',
      components: [{ tagName: 'span', content: 'Inner child' }],
    })[0];
    const child = target.components().at(0);

    expect(target.frame).toBe(mainFrame);
    expect(child?.frame).toBe(mainFrame);

    targetWrapper.append(target);

    expect(target.frame).toBe(targetFrame);
    expect(child?.frame).toBe(targetFrame);
    expect(target.parent()).toBe(targetWrapper);
  });

  test('Page supports a custom wrapper type for frames', async () => {
    editor.Components.addType('wrapper-component', {
      extend: 'wrapper',
      model: {
        defaults: { customWrapperFlag: true },
        getCustomWrapperFlag() {
          return this.get('customWrapperFlag');
        },
      },
      view: {
        onRender() {
          this.el.setAttribute('data-custom-wrapper', 'true');
        },
      },
    });

    const mainWrapper = pm.getMain().getMainComponent();
    const target = mainWrapper.append({
      attributes: { id: 'custom-wrapper-target' },
      content: 'Custom wrapper target',
    })[0];

    const tempPage = pm.add(
      {
        id: 'temp-page-custom-wrapper',
        skipFromStorage: true,
        frames: [
          {
            component: { type: 'wrapper-component' },
            refComponent: target,
          },
        ],
      },
      { select: true },
    )!;

    await waitEditorEvent(em, CanvasEvents.frameLoadBody);

    const tempWrapper = tempPage.getMainComponent() as any;
    expect(tempWrapper.is('wrapper-component')).toBe(true);
    expect(tempWrapper.getCustomWrapperFlag()).toBe(true);
    expect(canvas.getBody().querySelector('[data-custom-wrapper="true"]')).toBeTruthy();
    expect(canvas.getBody().querySelector('#custom-wrapper-target')?.textContent).toBe('Custom wrapper target');
  });
});
