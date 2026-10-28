import type { Editor } from 'grapesjs';
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
        'Get the current editor state: selected components, active page and device, number of unsaved changes and undo/redo availability.' +
        guideHint(ctx),
      annotations: { readOnlyHint: true },
      execute: () => getState(editor),
    }),
    createTool<{ pageId?: string }>({
      name: ToolNames.getPageCode,
      title: 'Get page code',
      description: 'Export the HTML and CSS of a page (defaults to the selected page).',
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      inputSchema: {
        type: 'object',
        properties: { pageId: { type: 'string', description: 'Page id' } },
        additionalProperties: false,
      },
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
    createTool<{ projectData: Record<string, any> }>({
      name: ToolNames.loadProjectData,
      title: 'Load project data',
      description:
        'Replace the whole project with the provided project JSON. All the current content will be replaced.',
      annotations: { consequentialHint: true },
      inputSchema: {
        type: 'object',
        properties: {
          projectData: {
            type: 'object',
            description: `Project JSON, as returned by ${toolRef(ctx, ToolNames.getProjectData)}`,
          },
        },
        required: ['projectData'],
        additionalProperties: false,
      },
      execute: ({ projectData }) => {
        editor.loadProjectData(projectData);
        return { pages: editor.Pages.getAll().map((page) => serializePage(page, editor.Pages.getSelected())) };
      },
    }),
  ];
};
