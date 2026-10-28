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

export default (ctx: WebMcpToolsContext) => {
  const { editor } = ctx;

  return [
    createTool({
      name: ToolNames.getEditorState,
      title: 'Get editor state',
      description:
        'Get the current editor state: readiness (whether the editor is loaded), selected components, active page and device, number of unsaved changes and undo/redo availability.' +
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
      description: 'Undo the last change(s).',
      input: z.strictObject({
        steps: z.optional(z.int().check(z.minimum(1), z.maximum(100), z.describe('Number of steps (default 1)'))),
      }),
      execute: ({ steps = 1 }) => {
        const um = editor.UndoManager;
        let done = 0;
        while (done < steps && um.hasUndo()) {
          um.undo();
          done++;
        }
        return { undone: done, hasUndo: um.hasUndo(), hasRedo: um.hasRedo() };
      },
    }),
    createTool({
      name: ToolNames.redo,
      title: 'Redo',
      description: 'Redo the last undone change(s).',
      input: z.strictObject({
        steps: z.optional(z.int().check(z.minimum(1), z.maximum(100), z.describe('Number of steps (default 1)'))),
      }),
      execute: ({ steps = 1 }) => {
        const um = editor.UndoManager;
        let done = 0;
        while (done < steps && um.hasRedo()) {
          um.redo();
          done++;
        }
        return { redone: done, hasUndo: um.hasUndo(), hasRedo: um.hasRedo() };
      },
    }),
  ];
};
