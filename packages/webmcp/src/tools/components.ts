import type { Component } from 'grapesjs';
import type { WebMcpToolsContext } from '../types';
import { ToolNames } from './names';
import {
  checkIndex,
  componentContentSchema,
  createTool,
  ensureCanMove,
  getComponent,
  getDescendants,
  getParentComponent,
  guideHint,
  idSchema,
  limitSchema,
  mergeStyle,
  offsetSchema,
  paginate,
  queryComponents,
  serializeComponent,
  serializeComponentSummary,
  Style,
  StyleInput,
  styleSchema,
  ToolError,
  toolRef,
  toPlain,
} from '../utils';

const atSchema = {
  type: 'integer',
  minimum: 0,
  description: 'Index position inside the parent. Appends at the end if omitted',
};

interface TreeNode extends ReturnType<typeof serializeComponentSummary> {
  children?: TreeNode[];
}

export default (ctx: WebMcpToolsContext) => {
  const { editor, defaultLimit } = ctx;

  return [
    createTool<{ id?: string; depth?: number; maxNodes?: number }>({
      name: ToolNames.getComponentTree,
      title: 'Get component tree',
      description:
        'Get the component tree of the selected page (or of a specific component). Nodes beyond `depth` or `maxNodes` are not expanded: their `childCount` is still reported and `truncated` is true, call the tool again with the node id to expand them.' +
        guideHint(ctx),
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      inputSchema: {
        type: 'object',
        properties: {
          id: idSchema('Root component id. Defaults to the wrapper of the selected page'),
          depth: { type: 'integer', minimum: 0, maximum: 50, description: 'Max depth to expand (default 4)' },
          maxNodes: { type: 'integer', minimum: 1, maximum: 2000, description: 'Max number of nodes (default 200)' },
        },
        additionalProperties: false,
      },
      execute: ({ id, depth = 4, maxNodes = 200 }) => {
        const root = getParentComponent(editor, id);
        let count = 0;
        let truncated = false;

        const walk = (cmp: Component, level: number): TreeNode => {
          count++;
          const node: TreeNode = serializeComponentSummary(cmp);
          const children = cmp.components();

          if (children.length) {
            if (level >= depth || count >= maxNodes) {
              truncated = true;
            } else {
              node.children = [];
              for (const child of children.models) {
                if (count >= maxNodes) {
                  truncated = true;
                  break;
                }
                node.children.push(walk(child, level + 1));
              }
            }
          }

          return node;
        };

        const tree = walk(root, 0);
        return { tree, nodeCount: count, truncated };
      },
    }),
    createTool<{ id: string; includeHtml?: boolean }>({
      name: ToolNames.getComponent,
      title: 'Get component',
      description:
        'Get details of a component: type, tag, attributes, classes, inline style, parent, position, direct children and editing flags.',
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      inputSchema: {
        type: 'object',
        properties: {
          id: idSchema(),
          includeHtml: { type: 'boolean', description: 'Include the HTML output of the component' },
        },
        required: ['id'],
        additionalProperties: false,
      },
      execute: ({ id, includeHtml }) => serializeComponent(editor, getComponent(editor, id), { html: includeHtml }),
    }),
    createTool<{
      rootId?: string;
      selector?: string;
      type?: string;
      tagName?: string;
      className?: string;
      text?: string;
      attributes?: Record<string, string>;
      limit?: number;
      offset?: number;
    }>({
      name: ToolNames.findComponents,
      title: 'Find components',
      description:
        'Search components in the selected page (or inside a root component). All provided filters must match. `selector` is a CSS selector applied to the component tree.',
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      inputSchema: {
        type: 'object',
        properties: {
          rootId: idSchema('Search only inside this component'),
          selector: { type: 'string', description: 'CSS selector, eg. "section .title"' },
          type: { type: 'string', description: 'Component type, eg. "image"' },
          tagName: { type: 'string', description: 'HTML tag name, eg. "h1"' },
          className: { type: 'string', description: 'Class name the component must have' },
          text: { type: 'string', description: 'Case insensitive text contained in the component (tags excluded)' },
          attributes: {
            type: 'object',
            description: 'Attributes the component must have, eg. { "href": "/about" }',
            additionalProperties: { type: 'string' },
          },
          limit: limitSchema,
          offset: offsetSchema,
        },
        additionalProperties: false,
      },
      execute: (input) => {
        const root = getParentComponent(editor, input.rootId);
        const { selector, type, tagName, className, attributes } = input;
        const text = input.text?.toLowerCase();
        const candidates = selector ? queryComponents(editor, root, selector) : getDescendants(root);

        const matches = candidates.filter((cmp) => {
          // Skip plain text nodes unless explicitly requested
          if (type ? cmp.get('type') !== type : cmp.get('type') === 'textnode') return false;
          if (tagName && cmp.get('tagName')?.toLowerCase() !== tagName.toLowerCase()) return false;
          if (className && !cmp.getClasses().includes(className)) return false;
          if (attributes) {
            const attrs = cmp.getAttributes();
            if (Object.keys(attributes).some((key) => `${attrs[key] ?? ''}` !== `${attributes[key]}`)) return false;
          }
          if (
            text &&
            !cmp
              .getInnerHTML()
              .replace(/<[^>]*>/g, '')
              .toLowerCase()
              .includes(text)
          )
            return false;
          return true;
        });

        return paginate(matches, input, defaultLimit, serializeComponentSummary);
      },
    }),
    createTool({
      name: ToolNames.listComponentTypes,
      title: 'List component types',
      description: 'List the component types registered in the editor (usable as `type` in component definitions).',
      annotations: { readOnlyHint: true },
      execute: () => ({
        types: editor.Components.getTypes().map((type) => type.id),
      }),
    }),
    createTool<{ ids: string[] }>({
      name: ToolNames.selectComponents,
      title: 'Select components',
      description: 'Select components in the canvas. Pass an empty array to clear the selection.',
      inputSchema: {
        type: 'object',
        properties: {
          ids: { type: 'array', items: { type: 'string' }, description: 'Component ids to select' },
        },
        required: ['ids'],
        additionalProperties: false,
      },
      execute: ({ ids }) => {
        const cmps = ids.map((id) => getComponent(editor, id));
        editor.select(cmps);
        return { selected: editor.getSelectedAll().map((cmp) => cmp.getId()) };
      },
    }),
    createTool<{ parentId?: string; at?: number; components: any; select?: boolean }>({
      name: ToolNames.addComponents,
      title: 'Add components',
      description:
        'Add new components inside a parent component (defaults to the wrapper of the selected page). Returns the ids of the added components.',
      inputSchema: {
        type: 'object',
        properties: {
          parentId: idSchema('Parent component id. Defaults to the wrapper of the selected page'),
          at: atSchema,
          components: componentContentSchema,
          select: { type: 'boolean', description: 'Select the added components' },
        },
        required: ['components'],
        additionalProperties: false,
      },
      execute: ({ parentId, at, components, select }) => {
        const parent = getParentComponent(editor, parentId);
        checkIndex(parent, at);
        const items = Array.isArray(components) ? components : [components];
        if (!items.length) throw new ToolError('Nothing to add', 'invalid_input');
        items.forEach((item) => ensureCanMove(editor, parent, item, at));

        const added = parent.components().add(components, at !== undefined ? { at } : {}) as unknown as
          | Component
          | Component[];
        const addedList = Array.isArray(added) ? added : [added];
        select && editor.select(addedList);

        return { added: addedList.map(serializeComponentSummary) };
      },
    }),
    createTool<{
      id: string;
      attributes?: Record<string, any>;
      removeAttributes?: string[];
      content?: any;
      name?: string;
    }>({
      name: ToolNames.updateComponent,
      title: 'Update component',
      description:
        'Update a component: set or remove attributes, replace its inner content (children) or set its custom name shown in the layer manager. ' +
        `For styles and classes use ${toolRef(ctx, ToolNames.setComponentStyle)} and ${toolRef(ctx, ToolNames.updateComponentClasses)}.`,
      inputSchema: {
        type: 'object',
        properties: {
          id: idSchema(),
          attributes: {
            type: 'object',
            description: 'Attributes to add/update, eg. { "href": "/about", "title": "About" }',
            additionalProperties: { type: ['string', 'number', 'boolean'] },
          },
          removeAttributes: { type: 'array', items: { type: 'string' }, description: 'Attribute names to remove' },
          content: {
            ...componentContentSchema,
            description:
              'Replace all the children with this content (HTML string, component definition or array of them). For text components use HTML, eg. "Hello <b>world</b>"',
          },
          name: { type: 'string', description: 'Custom name of the component' },
        },
        required: ['id'],
        additionalProperties: false,
      },
      execute: ({ id, attributes, removeAttributes, content, name }) => {
        const cmp = getComponent(editor, id);

        if (attributes && ('class' in attributes || 'style' in attributes || 'id' in attributes)) {
          throw new ToolError(
            `Use ${toolRef(ctx, ToolNames.updateComponentClasses)}/${toolRef(ctx, ToolNames.setComponentStyle)} to change classes and styles, the id attribute is not editable`,
            'invalid_input',
          );
        }

        // Text components are not droppable but their inner content can be replaced
        if (content !== undefined && !cmp.isInstanceOf('text')) {
          const items = Array.isArray(content) ? content : [content];
          items.forEach((item) => ensureCanMove(editor, cmp, item));
        }

        attributes && cmp.addAttributes(attributes);
        removeAttributes?.length && cmp.removeAttributes(removeAttributes);
        name !== undefined && cmp.setName(name);
        content !== undefined && cmp.components(content);

        return serializeComponent(editor, cmp);
      },
    }),
    createTool<{ id: string; parentId?: string; at?: number }>({
      name: ToolNames.cloneComponent,
      title: 'Clone component',
      description:
        'Duplicate a component. By default the clone is placed right after the original, otherwise inside `parentId` at `at` index.',
      inputSchema: {
        type: 'object',
        properties: {
          id: idSchema(),
          parentId: idSchema('Parent component id for the clone'),
          at: atSchema,
        },
        required: ['id'],
        additionalProperties: false,
      },
      execute: ({ id, parentId, at }) => {
        const cmp = getComponent(editor, id);
        if (!cmp.get('copyable')) throw new ToolError(`Component "${id}" is not copyable`, 'not_allowed');
        const parent = parentId ? getComponent(editor, parentId) : cmp.parent();
        if (!parent) throw new ToolError('The root component cannot be cloned without a parentId', 'invalid_input');
        const index = parentId ? at : cmp.index() + 1;
        checkIndex(parent, index);

        const clone = cmp.clone();
        ensureCanMove(editor, parent, clone, index);
        parent.components().add(clone, index !== undefined ? { at: index } : {});

        return { clone: serializeComponentSummary(clone) };
      },
    }),
    createTool<{ id: string; parentId: string; at?: number }>({
      name: ToolNames.moveComponent,
      title: 'Move component',
      description: 'Move a component inside another parent (or to another position in the same parent).',
      inputSchema: {
        type: 'object',
        properties: {
          id: idSchema(),
          parentId: idSchema('New parent component id'),
          at: atSchema,
        },
        required: ['id', 'parentId'],
        additionalProperties: false,
      },
      execute: ({ id, parentId, at }) => {
        const cmp = getComponent(editor, id);
        const parent = getComponent(editor, parentId);
        if (!cmp.parent()) throw new ToolError('The root component cannot be moved', 'not_allowed');
        checkIndex(parent, at);
        ensureCanMove(editor, parent, cmp, at);
        cmp.move(parent, at !== undefined ? { at } : {});

        return { moved: serializeComponentSummary(cmp), parentId: parent.getId(), index: cmp.index() };
      },
    }),
    createTool<{ ids: string[] }>({
      name: ToolNames.removeComponents,
      title: 'Remove components',
      description: `Remove components from the page. Can be reverted with ${toolRef(ctx, ToolNames.undo)}.`,
      annotations: { consequentialHint: true },
      inputSchema: {
        type: 'object',
        properties: {
          ids: { type: 'array', items: { type: 'string' }, minItems: 1, description: 'Component ids to remove' },
        },
        required: ['ids'],
        additionalProperties: false,
      },
      execute: ({ ids }) => {
        const cmps = ids.map((id) => getComponent(editor, id));

        cmps.forEach((cmp) => {
          if (!cmp.parent()) throw new ToolError('The root component cannot be removed', 'not_allowed');
          if (!cmp.get('removable')) throw new ToolError(`Component "${cmp.getId()}" is not removable`, 'not_allowed');
        });

        cmps.forEach((cmp) => cmp.remove());
        return { removed: ids };
      },
    }),
    createTool<{ id: string; style: StyleInput; replace?: boolean }>({
      name: ToolNames.setComponentStyle,
      title: 'Set component style',
      description:
        'Update the style of a single component (merged with the current one by default). ' +
        `For states (eg. hover) or media queries use ${toolRef(ctx, ToolNames.setCssRule)} with the "#<componentId>" selector, for shared styles prefer classes.`,
      inputSchema: {
        type: 'object',
        properties: {
          id: idSchema(),
          style: styleSchema,
          replace: { type: 'boolean', description: 'Replace the whole style instead of merging it' },
        },
        required: ['id', 'style'],
        additionalProperties: false,
      },
      execute: ({ id, style, replace }) => {
        const cmp = getComponent(editor, id);
        const current = (toPlain(cmp.getStyle()) || {}) as Style;
        const next = mergeStyle(replace ? {} : current, style);
        cmp.setStyle(next);
        return { id, style: toPlain(cmp.getStyle()) || {} };
      },
    }),
    createTool<{ id: string; add?: string[]; remove?: string[]; set?: string[] }>({
      name: ToolNames.updateComponentClasses,
      title: 'Update component classes',
      description: 'Add, remove or replace the CSS classes of a component.',
      inputSchema: {
        type: 'object',
        properties: {
          id: idSchema(),
          set: { type: 'array', items: { type: 'string' }, description: 'Replace all classes with these ones' },
          add: { type: 'array', items: { type: 'string' }, description: 'Classes to add' },
          remove: { type: 'array', items: { type: 'string' }, description: 'Classes to remove' },
        },
        required: ['id'],
        additionalProperties: false,
      },
      execute: ({ id, set, add, remove }) => {
        const cmp = getComponent(editor, id);
        const invalid = [...(set || []), ...(add || [])].find((cls) => !cls || /[\s.#]/.test(cls));
        if (invalid !== undefined) {
          throw new ToolError(`Invalid class name "${invalid}", pass names without dots or spaces`, 'invalid_input');
        }

        set && cmp.setClass(set);
        add?.length && cmp.addClass(add);
        remove?.length && cmp.removeClass(remove);

        return { id, classes: cmp.getClasses() };
      },
    }),
  ];
};
