import type { Page } from 'grapesjs';
import type { WebMcpToolsContext } from '../types';
import { ToolNames } from './names';
import { createTool, ToolError } from '../utils';

export const serializePage = (page: Page, selected?: Page) => ({
  id: page.getId(),
  name: page.getName() || '',
  selected: page === selected,
});

export const getPage = (editor: WebMcpToolsContext['editor'], id: string) => {
  const page = editor.Pages.get(id);
  if (!page) throw new ToolError(`Page "${id}" not found`, 'not_found');
  return page;
};

export default ({ editor }: WebMcpToolsContext) => [
  createTool({
    name: ToolNames.listPages,
    title: 'List pages',
    description: 'List all the pages of the project.',
    annotations: { readOnlyHint: true },
    execute: () => {
      const selected = editor.Pages.getSelected();
      return { pages: editor.Pages.getAll().map((page) => serializePage(page, selected)) };
    },
  }),
  createTool<{ name: string; id?: string; content?: string; select?: boolean }>({
    name: ToolNames.addPage,
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
    name: ToolNames.renamePage,
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
    name: ToolNames.selectPage,
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
    name: ToolNames.removePage,
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
];
