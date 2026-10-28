import type { Block, Trait } from 'grapesjs';
import type { WebMcpToolsContext } from '../types';
import {
  checkIndex,
  createTool,
  ensureCanMove,
  getComponent,
  getParentComponent,
  idSchema,
  limitSchema,
  offsetSchema,
  paginate,
  serializeComponentSummary,
  toPlain,
  ToolError,
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

const serializeTrait = (trait: Trait) => {
  const options = trait.getOptions();
  return {
    name: trait.getName(),
    id: trait.getId(),
    type: trait.getType(),
    label: trait.getLabel(),
    value: toPlain(trait.getValue()),
    ...(trait.getCategoryLabel?.() ? { category: trait.getCategoryLabel() } : {}),
    ...(options.length
      ? { options: options.map((opt) => ({ id: trait.getOptionId(opt), label: trait.getOptionLabel(opt) })) }
      : {}),
    ...(trait.get('changeProp') ? { changeProp: true } : {}),
  };
};

export default ({ editor, defaultLimit }: WebMcpToolsContext) => [
  // Blocks
  createTool<{ category?: string; limit?: number; offset?: number }>({
    name: 'list_blocks',
    title: 'List blocks',
    description: 'List the blocks available in the editor (predefined content that can be inserted with insert_block).',
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
    name: 'get_block',
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
    name: 'insert_block',
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

  // Traits
  createTool<{ id: string }>({
    name: 'get_component_traits',
    title: 'Get component traits',
    description:
      'Get the traits (settings) of a component: name, type, label, current value and options (for select-like traits).',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: { id: idSchema() },
      required: ['id'],
      additionalProperties: false,
    },
    execute: ({ id }) => ({ id, traits: getComponent(editor, id).getTraits().map(serializeTrait) }),
  }),

  createTool<{ id: string; values: Record<string, any> }>({
    name: 'update_component_traits',
    title: 'Update component traits',
    description: 'Update trait values of a component, eg. { "href": "/about", "target": "_blank" }.',
    inputSchema: {
      type: 'object',
      properties: {
        id: idSchema(),
        values: { type: 'object', description: 'Trait names with their new values' },
      },
      required: ['id', 'values'],
      additionalProperties: false,
    },
    execute: ({ id, values }) => {
      const cmp = getComponent(editor, id);
      const entries = Object.keys(values).map((name) => {
        const trait = cmp.getTrait(name);
        if (!trait) throw new ToolError(`Trait "${name}" not found in component "${id}"`, 'not_found');
        const options = trait.getOptions();
        const value = values[name];
        if (options.length && !options.some((opt) => trait.getOptionId(opt) === `${value}`)) {
          throw new ToolError(
            `Invalid value for trait "${name}", allowed: ${options.map((opt) => trait.getOptionId(opt)).join(', ')}`,
            'invalid_input',
          );
        }
        return { trait, value };
      });

      entries.forEach(({ trait, value }) => trait.setValue(value));
      return { id, traits: cmp.getTraits().map(serializeTrait) };
    },
  }),
];
