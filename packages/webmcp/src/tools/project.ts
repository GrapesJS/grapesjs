import type { Asset, Device, Page } from 'grapesjs';
import type { WebMcpToolsContext } from '../types';
import { createTool, getPageOf, guideHint, limitSchema, offsetSchema, paginate, toPlain, ToolError } from '../utils';

const serializePage = (page: Page, selected?: Page) => ({
  id: page.getId(),
  name: page.getName() || '',
  selected: page === selected,
});

const serializeDevice = (device: Device) => ({
  id: device.id as string,
  name: device.getName(),
  width: device.getWidthMedia?.() || device.get('width') || '',
});

const serializeAsset = (asset: Asset) => {
  const { src, type, name, width, height } = asset.attributes as Record<string, any>;
  return toPlain({ src, type, ...(name ? { name } : {}), ...(width ? { width } : {}), ...(height ? { height } : {}) });
};

const getPage = (editor: WebMcpToolsContext['editor'], id: string) => {
  const page = editor.Pages.get(id);
  if (!page) throw new ToolError(`Page "${id}" not found`, 'not_found');
  return page;
};

export default (ctx: WebMcpToolsContext) => {
  const { editor, defaultLimit } = ctx;
  const getState = () => {
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

  return [
    // Editor
    createTool({
      name: 'get_editor_state',
      title: 'Get editor state',
      description:
        'Get the current editor state: selected components, active page and device, number of unsaved changes and undo/redo availability.' +
        guideHint(ctx),
      annotations: { readOnlyHint: true },
      execute: getState,
    }),

    // Pages
    createTool({
      name: 'list_pages',
      title: 'List pages',
      description: 'List all the pages of the project.',
      annotations: { readOnlyHint: true },
      execute: () => {
        const selected = editor.Pages.getSelected();
        return { pages: editor.Pages.getAll().map((page) => serializePage(page, selected)) };
      },
    }),

    createTool<{ name: string; id?: string; content?: string; select?: boolean }>({
      name: 'add_page',
      title: 'Add page',
      description: 'Create a new page, optionally with initial HTML content.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Page name' },
          id: { type: 'string', description: 'Custom page id' },
          content: { type: 'string', description: 'Initial HTML content of the page' },
          select: { type: 'boolean', description: 'Select the new page' },
        },
        required: ['name'],
        additionalProperties: false,
      },
      execute: ({ name, id, content, select }) => {
        if (id && editor.Pages.get(id)) throw new ToolError(`Page "${id}" already exists`, 'invalid_input');
        const page = editor.Pages.add(
          { name, ...(id ? { id } : {}), ...(content ? { component: content } : {}) },
          {
            select,
          },
        );
        if (!page) throw new ToolError('The page creation was aborted', 'aborted');
        return { page: serializePage(page, editor.Pages.getSelected()) };
      },
    }),

    createTool<{ id: string; name: string }>({
      name: 'rename_page',
      title: 'Rename page',
      description: 'Rename a page.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Page id' },
          name: { type: 'string', description: 'New page name' },
        },
        required: ['id', 'name'],
        additionalProperties: false,
      },
      execute: ({ id, name }) => {
        const page = getPage(editor, id);
        page.setName(name);
        return { page: serializePage(page, editor.Pages.getSelected()) };
      },
    }),

    createTool<{ id: string }>({
      name: 'select_page',
      title: 'Select page',
      description: 'Select (open) a page in the canvas.',
      inputSchema: {
        type: 'object',
        properties: { id: { type: 'string', description: 'Page id' } },
        required: ['id'],
        additionalProperties: false,
      },
      execute: ({ id }) => {
        editor.Pages.select(getPage(editor, id));
        return { page: serializePage(getPage(editor, id), editor.Pages.getSelected()) };
      },
    }),

    createTool<{ id: string }>({
      name: 'remove_page',
      title: 'Remove page',
      description: 'Remove a page and all of its content. The last remaining page cannot be removed.',
      annotations: { consequentialHint: true },
      inputSchema: {
        type: 'object',
        properties: { id: { type: 'string', description: 'Page id' } },
        required: ['id'],
        additionalProperties: false,
      },
      execute: ({ id }) => {
        const page = getPage(editor, id);
        const pages = editor.Pages.getAll();
        if (pages.length <= 1) throw new ToolError('The last page cannot be removed', 'not_allowed');

        if (editor.Pages.getSelected() === page) {
          editor.Pages.select(pages.find((pg) => pg !== page)!);
        }

        const removed = editor.Pages.remove(page);
        if (!removed) throw new ToolError('The page removal was aborted', 'aborted');
        return { removed: id };
      },
    }),

    // Devices
    createTool({
      name: 'list_devices',
      title: 'List devices',
      description: 'List the configured devices (canvas sizes used for responsive styling).',
      annotations: { readOnlyHint: true },
      execute: () => {
        const selected = editor.Devices.getSelected();
        return {
          devices: editor.Devices.getAll().map((device) => ({
            ...serializeDevice(device),
            selected: device === selected,
          })),
        };
      },
    }),

    createTool<{ id: string }>({
      name: 'select_device',
      title: 'Select device',
      description:
        'Select a device to preview the canvas at its size. Styles set on components while a device is selected apply to its media query.',
      inputSchema: {
        type: 'object',
        properties: { id: { type: 'string', description: 'Device id' } },
        required: ['id'],
        additionalProperties: false,
      },
      execute: ({ id }) => {
        const device = editor.Devices.get(id);
        if (!device) throw new ToolError(`Device "${id}" not found`, 'not_found');
        editor.Devices.select(device);
        return { device: serializeDevice(device) };
      },
    }),

    // Assets
    createTool<{ type?: string; limit?: number; offset?: number }>({
      name: 'list_assets',
      title: 'List assets',
      description: 'List the assets (eg. images) of the project.',
      annotations: { readOnlyHint: true },
      inputSchema: {
        type: 'object',
        properties: {
          type: { type: 'string', description: 'Filter by asset type, eg. "image"' },
          limit: limitSchema,
          offset: offsetSchema,
        },
        additionalProperties: false,
      },
      execute: (input) => {
        const assets = editor.Assets.getAll().filter(
          (asset: Asset) => input.type === undefined || asset.get('type') === input.type,
        );
        return paginate(assets, input, defaultLimit, serializeAsset);
      },
    }),

    createTool<{ assets: Array<{ src: string; type?: string; name?: string; width?: number; height?: number }> }>({
      name: 'add_assets',
      title: 'Add assets',
      description: 'Add assets by URL (no file upload).',
      inputSchema: {
        type: 'object',
        properties: {
          assets: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              properties: {
                src: { type: 'string', description: 'Asset URL' },
                type: { type: 'string', description: 'Asset type (default "image")' },
                name: { type: 'string' },
                width: { type: 'number' },
                height: { type: 'number' },
              },
              required: ['src'],
              additionalProperties: false,
            },
          },
        },
        required: ['assets'],
        additionalProperties: false,
      },
      execute: ({ assets }) => {
        assets.forEach(({ src }) => {
          if (!/^(https?:|data:image\/|\/|\.)/i.test(src)) {
            throw new ToolError(`Invalid asset URL "${src}"`, 'invalid_input');
          }
        });
        const added = editor.Assets.add(assets as any) as unknown as Asset | Asset[];
        return { added: (Array.isArray(added) ? added : [added]).map(serializeAsset) };
      },
    }),

    createTool<{ srcs: string[] }>({
      name: 'remove_assets',
      title: 'Remove assets',
      description: 'Remove assets by their URL.',
      annotations: { consequentialHint: true },
      inputSchema: {
        type: 'object',
        properties: {
          srcs: { type: 'array', items: { type: 'string' }, minItems: 1, description: 'Asset URLs' },
        },
        required: ['srcs'],
        additionalProperties: false,
      },
      execute: ({ srcs }) => {
        const assets = srcs.map((src) => {
          const asset = editor.Assets.get(src);
          if (!asset) throw new ToolError(`Asset "${src}" not found`, 'not_found');
          return asset;
        });
        assets.forEach((asset) => editor.Assets.remove(asset));
        return { removed: srcs };
      },
    }),

    // Project and history
    createTool<{ pageId?: string }>({
      name: 'get_page_code',
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
      name: 'get_project_data',
      title: 'Get project data',
      description:
        'Get the full project JSON (pages, styles, assets, etc.), the same format accepted by load_project_data.',
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: () => ({ projectData: toPlain(editor.getProjectData()) }),
    }),

    createTool<{ projectData: Record<string, any> }>({
      name: 'load_project_data',
      title: 'Load project data',
      description:
        'Replace the whole project with the provided project JSON. All the current content will be replaced.',
      annotations: { consequentialHint: true },
      inputSchema: {
        type: 'object',
        properties: {
          projectData: { type: 'object', description: 'Project JSON, as returned by get_project_data' },
        },
        required: ['projectData'],
        additionalProperties: false,
      },
      execute: ({ projectData }) => {
        editor.loadProjectData(projectData);
        return { pages: editor.Pages.getAll().map((page) => serializePage(page, editor.Pages.getSelected())) };
      },
    }),

    createTool<{ steps?: number }>({
      name: 'undo',
      title: 'Undo',
      description: 'Undo the last change(s).',
      inputSchema: {
        type: 'object',
        properties: {
          steps: { type: 'integer', minimum: 1, maximum: 100, description: 'Number of steps (default 1)' },
        },
        additionalProperties: false,
      },
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

    createTool<{ steps?: number }>({
      name: 'redo',
      title: 'Redo',
      description: 'Redo the last undone change(s).',
      inputSchema: {
        type: 'object',
        properties: {
          steps: { type: 'integer', minimum: 1, maximum: 100, description: 'Number of steps (default 1)' },
        },
        additionalProperties: false,
      },
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
