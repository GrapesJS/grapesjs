import type { Component, Trait } from 'grapesjs';
import * as z from 'zod/mini';
import type { WebMcpToolsContext } from '../types';
import { ToolNames } from './names';
import { getPage } from './pages';
import {
  checkIndex,
  componentContentSchema,
  createTool,
  ensureCanMove,
  getComponent,
  getParentComponent,
  guideHint,
  idSchema,
  limitSchema,
  offsetSchema,
  paginate,
  serializeComponentDetails,
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

interface ComponentsWhere {
  type?: string;
  tagName?: string;
  name?: string;
  classes?: string[];
  attributes?: Record<string, string | true>;
  text?: string;
}

const includesText = (value: string, search: string) => value.toLowerCase().includes(search.toLowerCase());

/**
 * Get the text content of components, including their children. Cached, as it's used on nested components.
 */
const createTextGetter = () => {
  const cache = new Map<Component, string>();
  const getText = (cmp: Component): string => {
    let text = cache.get(cmp);
    if (text === undefined) {
      const content = cmp.get('content');
      const ownText = typeof content === 'string' ? content.replace(/<[^>]*>/g, '') : '';
      text = ownText + cmp.components().map(getText).join('');
      cache.set(cmp, text);
    }
    return text;
  };
  return getText;
};

const matchesWhere = (cmp: Component, where: ComponentsWhere, getText: (cmp: Component) => string) => {
  const { type, tagName, name, classes, attributes, text } = where;
  if (type !== undefined && (cmp.get('type') || 'default') !== type) return false;
  if (tagName !== undefined && `${cmp.get('tagName')}`.toLowerCase() !== tagName.toLowerCase()) return false;
  if (name !== undefined && !includesText(cmp.getName(), name)) return false;
  if (classes?.length) {
    const cmpClasses = cmp.getClasses();
    if (!classes.every((cls) => cmpClasses.includes(cls))) return false;
  }
  if (attributes) {
    const cmpAttributes = cmp.getAttributes();
    const matchAttr = (attr: string) => {
      const value = cmpAttributes[attr];
      return attributes[attr] === true ? value !== undefined : value !== undefined && `${value}` === attributes[attr];
    };
    if (!Object.keys(attributes).every(matchAttr)) return false;
  }
  if (text !== undefined && !includesText(getText(cmp), text)) return false;
  return true;
};

export default (ctx: WebMcpToolsContext) => {
  const { editor, defaultLimit } = ctx;

  return [
    createTool({
      name: ToolNames.getComponents,
      title: 'Get components',
      description:
        'Get components of the selected page (or of `pageId`). Returns `items` with: the root component (wrapper of the page, or `rootId`) by default, the components with `ids`, or the components in the root subtree matching all the conditions in `where`. ' +
        'Children are expanded up to `depth` (default 0, eg. use 4 to get the page structure). Nodes not expanded because of `depth` or `maxNodes` still report their `childCount` and `truncated` is true, call the tool again with their id to expand them. ' +
        'Use `details` for the parent, position, page and editing flags of the returned items.' +
        guideHint(ctx),
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      input: z.strictObject({
        ids: z.optional(
          z
            .array(z.string())
            .check(z.minLength(1), z.describe('Component ids to get, can not be combined with other targets')),
        ),
        rootId: z.optional(idSchema('Root component id, defaults to the wrapper of the page')),
        pageId: z.optional(z.string().check(z.describe('Page id, defaults to the selected page'))),
        where: z.optional(
          z
            .strictObject({
              type: z.optional(z.string().check(z.describe('Component type, eg. "text", "image", "link"'))),
              tagName: z.optional(z.string().check(z.describe('Tag name, eg. "h1"'))),
              name: z.optional(z.string().check(z.describe('Contained in the name (case-insensitive)'))),
              classes: z.optional(z.array(z.string()).check(z.describe('Classes the component must all have'))),
              attributes: z.optional(
                z
                  .record(z.string(), z.union([z.string(), z.literal(true)]))
                  .check(z.describe('Attributes with their exact value, or true to only check their presence')),
              ),
              text: z.optional(
                z.string().check(z.describe('Contained in the text content, including children (case-insensitive)')),
              ),
            })
            .check(z.describe('Search the root subtree for components matching all the conditions')),
        ),
        depth: z.optional(
          z.int().check(z.minimum(0), z.maximum(50), z.describe('Depth of children to expand (default 0)')),
        ),
        maxNodes: z.optional(
          z.int().check(z.minimum(1), z.maximum(2000), z.describe('Max number of expanded children (default 200)')),
        ),
        details: z.optional(z.boolean().check(z.describe('Include details of the returned items'))),
        includeHtml: z.optional(z.boolean().check(z.describe('Include the HTML of the returned items'))),
        limit: limitSchema,
        offset: offsetSchema,
      }),
      execute: (input) => {
        const { ids, rootId, pageId, where, depth = 0, maxNodes = 200, details, includeHtml } = input;
        if (ids && (rootId || pageId || where)) {
          throw new ToolError('`ids` can not be combined with `rootId`, `pageId` or `where`', 'invalid_input');
        }
        if (rootId && pageId) throw new ToolError('Use either `rootId` or `pageId`', 'invalid_input');

        const root = pageId ? getPage(editor, pageId).getMainComponent() : getParentComponent(editor, rootId);
        let items = ids ? ids.map((id) => getComponent(editor, id)) : [root];

        if (where) {
          const getText = createTextGetter();
          const matches: Component[] = [];
          const walk = (cmp: Component) => {
            matchesWhere(cmp, where, getText) && matches.push(cmp);
            cmp.components().forEach(walk);
          };
          walk(root);
          items = matches;
        }

        let count = 0;
        let truncated = false;

        const serializeNode = (cmp: Component, level: number): TreeNode => {
          const node: TreeNode = serializeComponentSummary(cmp);
          const children = cmp.components();

          if (children.length && level < depth) {
            node.children = [];
            for (const child of children.models) {
              if (count >= maxNodes) break;
              count++;
              node.children.push(serializeNode(child, level + 1));
            }
          }
          if (children.length && node.children?.length !== children.length) truncated = true;

          return node;
        };

        const result = paginate(items, input, defaultLimit, (cmp) => ({
          ...serializeNode(cmp, 0),
          ...(details ? serializeComponentDetails(editor, cmp) : {}),
          ...(includeHtml ? { html: cmp.toHTML() } : {}),
        }));

        return { ...result, truncated };
      },
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
