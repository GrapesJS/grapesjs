import CanvasEvents from '../src/canvas/types';
import { ObjectAny } from '../src/common';
import { NumberOperation } from '../src/data_sources/model/conditional_variables/operators/NumberOperator';
import { DataComponentTypes } from '../src/data_sources/types';
import Editor from '../src/editor';
import { EditorConfig } from '../src/editor/config/config';
import EditorModel from '../src/editor/model/Editor';

// DocEl + Head + Wrapper
export const DEFAULT_CMPS = 3;

export function setupTestEditor(opts?: { withCanvas?: boolean; config?: Partial<EditorConfig> }) {
  document.body.innerHTML = '';
  const fixtures = document.createElement('div');
  fixtures.id = 'fixtures';
  const canvasWrapEl = document.createElement('div');
  canvasWrapEl.id = 'canvas-wrp';
  const editorEl = document.createElement('div');
  editorEl.id = 'editor';
  document.body.appendChild(fixtures);
  document.body.appendChild(canvasWrapEl);
  document.body.appendChild(editorEl);

  const editor = new Editor({
    mediaCondition: 'max-width',
    el: document.body.querySelector('#editor') as HTMLElement,
    avoidInlineStyle: true,
    ...opts?.config,
  });
  const em = editor.getModel();
  const dsm = em.DataSources;
  const um = em.UndoManager;
  const { Pages, Components, Canvas } = em;
  Pages.onLoad();
  const cmpRoot = Components.getWrapper()!;
  const View = Components.getType('wrapper')!.view;
  const wrapperEl = new View({
    model: cmpRoot,
    config: { ...cmpRoot.config, em },
  });
  wrapperEl.render();

  /**
   * When trying to render the canvas, seems like jest gets stuck in a loop of iframe.onload (FrameView.ts)
   * and all subsequent tests containing setTimeout are not executed.
   */
  if (opts?.withCanvas) {
    Canvas.postLoad();
    canvasWrapEl.appendChild(Canvas.render());
    editor.on(CanvasEvents.frameLoad, ({ el }) => {
      // this seems to fix the issue of the loop
      el.onload = null;
    });
    // Enable undo manager
    editor.UndoManager.postLoad();
    editor.CssComposer.postLoad();
    editor.DataSources.postLoad();
    editor.Components.postLoad();
    editor.Pages.postLoad();

    em.set({ readyLoad: true, readyCanvas: true, ready: true });
    em.loadTriggered = true;
  }

  return { editor, em, dsm, um, cmpRoot, fixtures };
}

export function fixJsDom(editor: Editor) {
  fixJsDomIframe(editor);
}

export const fixJsDomIframe = (em: EditorModel | Editor) => {
  em.on(CanvasEvents.frameLoad, ({ el, view }) => {
    // this seems to fix the issue of the loop
    el.onload = null;
  });
};

export function waitEditorEvent(em: Editor | EditorModel, event: string) {
  return new Promise((resolve) => em.once(event, resolve));
}

export function flattenHTML(html: string) {
  return html.replace(/>\s+|\s+</g, (m) => m.trim());
}

// Filter out the unique ids and selectors replaced with 'data-variable-id'
// Makes the snapshot more stable
export function filterObjectForSnapshot(obj: any, parentKey: string = ''): any {
  const result: any = {};

  for (const key in obj) {
    if (key === 'id') {
      result[key] = 'data-variable-id';
      continue;
    }

    if (key === 'selectors') {
      result[key] = obj[key].map(() => 'data-variable-id');
      continue;
    }

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (Array.isArray(obj[key])) {
        result[key] = obj[key].map((item: any) =>
          typeof item === 'object' ? filterObjectForSnapshot(item, key) : item,
        );
      } else {
        result[key] = filterObjectForSnapshot(obj[key], key);
      }
    } else {
      result[key] = obj[key];
    }
  }

  return result;
}

const baseComponent = {
  type: 'text',
  tagName: 'h1',
};

const createContent = (content: string) => ({
  ...baseComponent,
  content,
});

/**
 * Creates a component definition for a conditional component (ifTrue or ifFalse).
 * @param type - The component type (e.g., DataConditionIfTrueType).
 * @param content - The text content.
 * @returns The component definition.
 */
const createConditionalComponentDef = (type: string, content: string) => ({
  type,
  components: [createContent(content)],
});

const DataConditionIfTrueType = DataComponentTypes.conditionTrue;
const DataConditionIfFalseType = DataComponentTypes.conditionFalse;
export const ifTrueText = 'true text';
export const newIfTrueText = 'new true text';
export const ifFalseText = 'false text';
export const newIfFalseText = 'new false text';
export const ifTrueComponentDef = createConditionalComponentDef(DataConditionIfTrueType, ifTrueText);
export const newIfTrueComponentDef = createConditionalComponentDef(DataConditionIfTrueType, newIfTrueText);
export const ifFalseComponentDef = createConditionalComponentDef(DataConditionIfFalseType, ifFalseText);
export const newIfFalseComponentDef = createConditionalComponentDef(DataConditionIfFalseType, newIfFalseText);

export function isObjectContained(received: ObjectAny, expected: ObjectAny): boolean {
  return Object.keys(expected).every((key) => {
    if (typeof expected[key] === 'object' && expected[key] !== null) {
      return isObjectContained(received[key], expected[key]);
    }

    return received?.[key] === expected?.[key];
  });
}

export const TRUE_CONDITION = {
  left: 1,
  operator: NumberOperation.greaterThan,
  right: 0,
};

export const FALSE_CONDITION = {
  left: 0,
  operator: NumberOperation.lessThan,
  right: -1,
};
