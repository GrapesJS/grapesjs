import type { Editor } from 'grapesjs';
import * as z from 'zod/mini';
import type { WebMcpToolsContext } from '../types';
import { serializeDevice } from './devices';
import { getPage, serializePage } from './pages';
import { ToolNames } from './names';
import { createTool, getPageOf, guideHint, ToolError, toolRef, toPlain } from '../utils';

const getState = (editor: Editor) => {
  const page = editor.Pages.getSelected();
  const device = editor.Devices.getSelected();
  const um = editor.UndoManager;

  return {
    selectedComponents: editor.getSelectedAll().map((cmp) => ({
      id: cmp.getId(),
      type: cmp.get('type') || 'default',
      name: cmp.getName(),
      pageId: getPageOf(editor, cmp)?.getId(),
    })),
    page: page ? serializePage(page, page) : null,
    device: device ? serializeDevice(device) : null,
    ready: !!editor.getModel().get('ready'),
    dirtyCount: editor.getDirtyCount(),
    hasUndo: um.hasUndo(),
    hasRedo: um.hasRedo(),
  };
};

/**
 * Get what the next undo/redo step affects, a step groups all the changes done in one operation.
 */
const getHistoryStep = (editor: Editor, type: 'undo' | 'redo') => {
  const um = editor.UndoManager;
  const stack = um.getStack() as any;
  const current = stack.at(um.getPointer() + (type === 'undo' ? 0 : 1));
  const labels = new Set<string>();
  const components = new Set<string>();
  const cssRules = new Set<string>();
  if (!current) return { labels, components, cssRules };

  const group = current.get('magicFusionIndex');
  stack.forEach((item: any) => {
    if (item.get('magicFusionIndex') !== group) return;
    const { type, object, before, after, options } = item.attributes;
    // Additions and removals are tracked on the collection
    const target = type === 'add' ? after : type === 'remove' ? before : object;
    // Selection changes are tracked on wrappers of the component
    const model = target?.get?.('component') || target;
    options?.action && labels.add(options.action);

    if (model?.selectorsToString) {
      cssRules.add(model.selectorsToString());
    } else if (model?.getId && model.components) {
      components.add(model.getId());
    }
  });

  return { labels, components, cssRules };
};

const runHistory = (editor: Editor, type: 'undo' | 'redo', steps: number) => {
  const um = editor.UndoManager;
  const labels = new Set<string>();
  const components = new Set<string>();
  const cssRules = new Set<string>();
  let done = 0;

  while (done < steps && (type === 'undo' ? um.hasUndo() : um.hasRedo())) {
    const pointer = um.getPointer();
    const step = getHistoryStep(editor, type);
    um[type]();
    // Skipped by the editor, eg. while editing text
    if (um.getPointer() === pointer) break;
    step.labels.forEach((label) => labels.add(label));
    step.components.forEach((id) => components.add(id));
    step.cssRules.forEach((selector) => cssRules.add(selector));
    done++;
  }

  return {
    [type === 'undo' ? 'undone' : 'redone']: done,
    labels: [...labels],
    components: [...components],
    cssRules: [...cssRules],
    hasUndo: um.hasUndo(),
    hasRedo: um.hasRedo(),
  };
};

export default (ctx: WebMcpToolsContext) => {
  const { editor } = ctx;

  return [
    createTool({
      name: ToolNames.getEditorState,
      title: 'Get editor state',
      description:
        'Get the current editor state: readiness (whether the editor is loaded), selected components, active page and device, undo/redo availability and dirtyCount, the number of changes not yet stored by the Storage Manager (it stays 0 when autosave stores every change).' +
        guideHint(ctx),
      annotations: { readOnlyHint: true },
      execute: () => getState(editor),
    }),
    createTool({
      name: ToolNames.getPageCode,
      title: 'Get page code',
      description: 'Export the HTML and CSS of a page (defaults to the selected page).',
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      input: z.strictObject({ pageId: z.optional(z.string().check(z.describe('Page id'))) }),
      execute: ({ pageId }) => {
        const page = pageId ? getPage(editor, pageId) : editor.Pages.getSelected();
        if (!page) throw new ToolError('No page is selected', 'not_found');
        const component = page.getMainComponent();
        return {
          pageId: page.getId(),
          html: editor.getHtml({ component }),
          css: editor.getCss({ component }) || '',
        };
      },
    }),
    createTool({
      name: ToolNames.getProjectData,
      title: 'Get project data',
      description: `Get the full project JSON (pages, styles, assets, etc.), the same format accepted by ${toolRef(ctx, ToolNames.loadProjectData)}.`,
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: () => ({ projectData: toPlain(editor.getProjectData()) }),
    }),
    createTool({
      name: ToolNames.loadProjectData,
      title: 'Load project data',
      description:
        'Replace the whole project with the provided project JSON. All the current content will be replaced.',
      annotations: { consequentialHint: true },
      input: z.strictObject({
        projectData: z
          .record(z.string(), z.unknown())
          .check(z.describe(`Project JSON, as returned by ${toolRef(ctx, ToolNames.getProjectData)}`)),
      }),
      execute: ({ projectData }) => {
        editor.loadProjectData(projectData);
        return { pages: editor.Pages.getAll().map((page) => serializePage(page, editor.Pages.getSelected())) };
      },
    }),
    createTool({
      name: ToolNames.undo,
      title: 'Undo',
      description:
        'Undo the last change(s). Returns the action labels and the ids of components and selectors of CSS rules affected.',
      input: z.strictObject({
        steps: z.optional(z.int().check(z.minimum(1), z.maximum(100), z.describe('Number of steps (default 1)'))),
      }),
      execute: ({ steps = 1 }) => runHistory(editor, 'undo', steps),
    }),
    createTool({
      name: ToolNames.redo,
      title: 'Redo',
      description:
        'Redo the last undone change(s). Returns the action labels and the ids of components and selectors of CSS rules affected.',
      input: z.strictObject({
        steps: z.optional(z.int().check(z.minimum(1), z.maximum(100), z.describe('Number of steps (default 1)'))),
      }),
      execute: ({ steps = 1 }) => runHistory(editor, 'redo', steps),
    }),
  ];
};
