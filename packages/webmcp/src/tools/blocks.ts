import type { Block } from 'grapesjs';
import type { WebMcpToolsContext } from '../types';
import { ToolNames } from './names';
import {
  checkIndex,
  createTool,
  ensureCanMove,
  getParentComponent,
  idSchema,
  limitSchema,
  offsetSchema,
  paginate,
  serializeComponentSummary,
  ToolError,
  toolRef,
  toPlain,
} from '../utils';

const serializeBlock = (block: Block) => ({
  id: block.getId(),
  label: block.getLabel(),
  category: block.getCategoryLabel() || '',
});

const getBlock = (editor: WebMcpToolsContext['editor'], id: string) => {
  const block = editor.Blocks.get(id);
  if (!block) throw new ToolError(`Block "${id}" not found`, 'not_found');
  return block;
};

const getBlockContent = (block: Block) => {
  const content = block.getContent();
  return typeof content === 'string' ? content : toPlain(content);
};

export default (ctx: WebMcpToolsContext) => {
  const { editor, defaultLimit } = ctx;

  return [
    createTool<{ category?: string; limit?: number; offset?: number }>({
      name: ToolNames.listBlocks,
      title: 'List blocks',
      description: `List the blocks available in the editor (predefined content that can be inserted with ${toolRef(ctx, ToolNames.insertBlock)}).`,
      annotations: { readOnlyHint: true },
      inputSchema: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Filter by category label' },
          limit: limitSchema,
          offset: offsetSchema,
        },
        additionalProperties: false,
      },
      execute: (input) => {
        const blocks = editor.Blocks.getAll().filter(
          (block: Block) => input.category === undefined || block.getCategoryLabel() === input.category,
        );
        return paginate(blocks, input, defaultLimit, serializeBlock);
      },
    }),
    createTool<{ id: string }>({
      name: ToolNames.getBlock,
      title: 'Get block',
      description: 'Get a block with its content (HTML string or component definitions).',
      annotations: { readOnlyHint: true },
      inputSchema: {
        type: 'object',
        properties: { id: { type: 'string', description: 'Block id' } },
        required: ['id'],
        additionalProperties: false,
      },
      execute: ({ id }) => {
        const block = getBlock(editor, id);
        return { ...serializeBlock(block), content: getBlockContent(block) ?? null };
      },
    }),
    createTool<{ id: string; parentId?: string; at?: number; select?: boolean }>({
      name: ToolNames.insertBlock,
      title: 'Insert block',
      description:
        'Insert the content of a block inside a parent component (defaults to the wrapper of the selected page).',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Block id' },
          parentId: idSchema('Parent component id. Defaults to the wrapper of the selected page'),
          at: { type: 'integer', minimum: 0, description: 'Index position inside the parent' },
          select: { type: 'boolean', description: 'Select the inserted components' },
        },
        required: ['id'],
        additionalProperties: false,
      },
      execute: ({ id, parentId, at, select }) => {
        const block = getBlock(editor, id);
        const content = block.getContent();
        if (!content) throw new ToolError(`Block "${id}" has no insertable content`, 'not_allowed');
        const parent = getParentComponent(editor, parentId);
        checkIndex(parent, at);
        const items = Array.isArray(content) ? content : [content];
        items.forEach((item) => ensureCanMove(editor, parent, item, at));

        const added = parent.components().add(content as any, at !== undefined ? { at } : {}) as any;
        const addedList = Array.isArray(added) ? added : [added];
        select && editor.select(addedList);

        return { added: addedList.map(serializeComponentSummary) };
      },
    }),
  ];
};
