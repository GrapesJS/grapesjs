import type { Page } from 'grapesjs';
import * as z from 'zod/mini';
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
  createTool({
    name: ToolNames.addPage,
    title: 'Add page',
    description: 'Create a new page, optionally with initial HTML content.',
    input: z.strictObject({
      name: z.string().check(z.describe('Page name')),
      id: z.optional(z.string().check(z.describe('Custom page id'))),
      content: z.optional(z.string().check(z.describe('Initial HTML content of the page'))),
      select: z.optional(z.boolean().check(z.describe('Select the new page'))),
    }),
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
  createTool({
    name: ToolNames.renamePage,
    title: 'Rename page',
    description: 'Rename a page.',
    input: z.strictObject({
      id: z.string().check(z.describe('Page id')),
      name: z.string().check(z.describe('New page name')),
    }),
    execute: ({ id, name }) => {
      const page = getPage(editor, id);
      page.setName(name);
      return { page: serializePage(page, editor.Pages.getSelected()) };
    },
  }),
  createTool({
    name: ToolNames.selectPage,
    title: 'Select page',
    description: 'Select (open) a page in the canvas.',
    input: z.strictObject({ id: z.string().check(z.describe('Page id')) }),
    execute: ({ id }) => {
      editor.Pages.select(getPage(editor, id));
      return { page: serializePage(getPage(editor, id), editor.Pages.getSelected()) };
    },
  }),
  createTool({
    name: ToolNames.removePage,
    title: 'Remove page',
    description: 'Remove a page and all of its content. The last remaining page cannot be removed.',
    annotations: { consequentialHint: true },
    input: z.strictObject({ id: z.string().check(z.describe('Page id')) }),
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
