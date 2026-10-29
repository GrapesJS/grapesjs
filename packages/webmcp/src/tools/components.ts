import type { Component, Trait } from 'grapesjs';
import * as z from 'zod/mini';
import type { WebMcpToolsContext } from '../types';
import { ToolNames } from './names';
import {
  checkIndex,
  componentContentSchema,
  createTool,
  ensureCanMove,
  getComponent,
  getParentComponent,
  guideHint,
  idSchema,
  serializeComponent,
  serializeComponentSummary,
  ToolError,
  toolRef,
  toPlain,
} from '../utils';

const atSchema = z.optional(
  z.int().check(z.minimum(0), z.describe('Index position inside the parent. Appends at the end if omitted')),
);

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

interface TreeNode extends ReturnType<typeof serializeComponentSummary> {
  children?: TreeNode[];
}

export default (ctx: WebMcpToolsContext) => {
  const { editor } = ctx;

  return [
    createTool({
      name: ToolNames.getComponentTree,
      title: 'Get component tree',
      description:
        'Get the component tree of the selected page (or of a specific component). Nodes beyond `depth` or `maxNodes` are not expanded: their `childCount` is still reported and `truncated` is true, call the tool again with the node id to expand them.' +
        guideHint(ctx),
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      input: z.strictObject({
        id: z.optional(idSchema('Root component id. Defaults to the wrapper of the selected page')),
        depth: z.optional(z.int().check(z.minimum(0), z.maximum(50), z.describe('Max depth to expand (default 4)'))),
        maxNodes: z.optional(
          z.int().check(z.minimum(1), z.maximum(2000), z.describe('Max number of nodes (default 200)')),
        ),
      }),
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
    createTool({
      name: ToolNames.getComponent,
      title: 'Get component',
      description:
        'Get details of a component: type, tag, attributes (including class and style), parent, position, direct children and editing flags.',
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      input: z.strictObject({
        id: idSchema(),
        includeHtml: z.optional(z.boolean().check(z.describe('Include the HTML output of the component'))),
      }),
      execute: ({ id, includeHtml }) => serializeComponent(editor, getComponent(editor, id), { html: includeHtml }),
    }),
    createTool({
      name: ToolNames.selectComponents,
      title: 'Select components',
      description: 'Select components in the canvas. Pass an empty array to clear the selection.',
      input: z.strictObject({ ids: z.array(z.string()).check(z.describe('Component ids to select')) }),
      execute: ({ ids }) => {
        const cmps = ids.map((id) => getComponent(editor, id));
        editor.select(cmps);
        return { selected: editor.getSelectedAll().map((cmp) => cmp.getId()) };
      },
    }),
    createTool({
      name: ToolNames.addComponents,
      title: 'Add components',
      description:
        'Add new components inside a parent component (defaults to the wrapper of the selected page). Returns the ids of the added components.',
      input: z.strictObject({
        parentId: z.optional(idSchema('Parent component id. Defaults to the wrapper of the selected page')),
        at: atSchema,
        components: componentContentSchema,
        select: z.optional(z.boolean().check(z.describe('Select the added components'))),
      }),
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
    createTool({
      name: ToolNames.updateComponents,
      title: 'Update components',
      description:
        'Update one or more components: set or remove attributes (including id, class and style), replace their inner content (children) or set their custom name shown in the layer manager. Nothing is updated if any of the components is not found.',
      input: z.strictObject({
        updates: z
          .array(
            z.strictObject({
              id: idSchema(),
              attributes: z.optional(
                z
                  .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                  .check(
                    z.describe(
                      'Attributes to add/update, eg. { "href": "/about", "class": "btn btn-primary", "style": "color: red" }',
                    ),
                  ),
              ),
              removeAttributes: z.optional(z.array(z.string()).check(z.describe('Attribute names to remove'))),
              content: z.optional(
                componentContentSchema.check(
                  z.describe(
                    'Replace all the children with this content (HTML string, component definition or array of them). For text components use HTML, eg. "Hello <b>world</b>"',
                  ),
                ),
              ),
              name: z.optional(z.string().check(z.describe('Custom name of the component'))),
            }),
          )
          .check(z.minLength(1), z.describe('Updates to apply, in order')),
      }),
      execute: ({ updates }) => {
        const cmps = updates.map(({ id }) => getComponent(editor, id));

        updates.forEach(({ attributes, removeAttributes, content, name }, index) => {
          const cmp = cmps[index];
          attributes && cmp.addAttributes(attributes);

          if (removeAttributes?.length) {
            // Removing class/style attributes doesn't clear them in the component
            removeAttributes.includes('class') && cmp.setClass([]);
            removeAttributes.includes('style') && cmp.setStyle({});
            cmp.removeAttributes(removeAttributes);
          }
          name !== undefined && cmp.setName(name);
          content !== undefined && cmp.components(content);
        });

        return { updated: cmps.map(serializeComponentSummary) };
      },
    }),
    createTool({
      name: ToolNames.moveComponent,
      title: 'Move component',
      description: 'Move a component inside another parent (or to another position in the same parent).',
      input: z.strictObject({
        id: idSchema(),
        parentId: idSchema('New parent component id'),
        at: atSchema,
      }),
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
    createTool({
      name: ToolNames.removeComponents,
      title: 'Remove components',
      description: `Remove components from the page. Can be reverted with ${toolRef(ctx, ToolNames.undo)}.`,
      annotations: { consequentialHint: true },
      input: z.strictObject({ ids: z.array(z.string()).check(z.minLength(1), z.describe('Component ids to remove')) }),
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
    createTool({
      name: ToolNames.getComponentTraits,
      title: 'Get component traits',
      description:
        'Get the traits (settings) of a component: name, type, label, current value and options (for select-like traits).',
      annotations: { readOnlyHint: true },
      input: z.strictObject({ id: idSchema() }),
      execute: ({ id }) => ({ id, traits: getComponent(editor, id).getTraits().map(serializeTrait) }),
    }),
    createTool({
      name: ToolNames.updateComponentTraits,
      title: 'Update component traits',
      description: 'Update trait values of a component, eg. { "href": "/about", "target": "_blank" }.',
      input: z.strictObject({
        id: idSchema(),
        values: z.record(z.string(), z.unknown()).check(z.describe('Trait names with their new values')),
      }),
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
};
