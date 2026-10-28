import type { Component, CssRule, Editor } from 'grapesjs';
import type {
  JsonSchema,
  WebMcpTool,
  WebMcpToolAnnotations,
  WebMcpToolExecuteOptions,
  WebMcpToolsContext,
} from './types';

export class ToolError extends Error {
  code: string;

  constructor(message: string, code = 'invalid_request') {
    super(message);
    this.name = 'ToolError';
    this.code = code;
  }
}

const typeOf = (value: unknown) => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'number' && Number.isInteger(value)) return 'integer';
  return typeof value;
};

const matchesType = (value: unknown, type: string | string[]): boolean => {
  const types = Array.isArray(type) ? type : [type];
  const actual = typeOf(value);
  return types.some((t) => t === actual || (t === 'number' && actual === 'integer'));
};

/**
 * Minimal JSON Schema validation for the subset used by the default tools
 * (type, required, properties, additionalProperties, items, enum, minimum, maximum, minItems, oneOf).
 */
export const validateSchema = (value: unknown, schema: JsonSchema = {}, path = 'input'): string | undefined => {
  if (schema.oneOf) {
    const valid = (schema.oneOf as JsonSchema[]).some((sub) => !validateSchema(value, sub, path));
    return valid ? undefined : `${path} doesn't match any of the allowed shapes`;
  }

  if (schema.type && !matchesType(value, schema.type)) {
    const expected = Array.isArray(schema.type) ? schema.type.join(' | ') : schema.type;
    return `${path} must be of type ${expected}, received ${typeOf(value)}`;
  }

  if (schema.enum && !schema.enum.includes(value)) {
    return `${path} must be one of: ${schema.enum.map((v: unknown) => JSON.stringify(v)).join(', ')}`;
  }

  if (typeof value === 'number') {
    if (typeof schema.minimum === 'number' && value < schema.minimum) return `${path} must be >= ${schema.minimum}`;
    if (typeof schema.maximum === 'number' && value > schema.maximum) return `${path} must be <= ${schema.maximum}`;
  }

  if (Array.isArray(value)) {
    if (typeof schema.minItems === 'number' && value.length < schema.minItems) {
      return `${path} must contain at least ${schema.minItems} item(s)`;
    }
    if (schema.items) {
      for (let i = 0; i < value.length; i++) {
        const err = validateSchema(value[i], schema.items, `${path}[${i}]`);
        if (err) return err;
      }
    }
  }

  if (typeOf(value) === 'object') {
    const obj = value as Record<string, unknown>;
    const props: Record<string, JsonSchema> = schema.properties || {};

    for (const key of schema.required || []) {
      if (obj[key] === undefined) return `${path}.${key} is required`;
    }

    for (const key of Object.keys(obj)) {
      if (obj[key] === undefined) continue;
      if (props[key]) {
        const err = validateSchema(obj[key], props[key], `${path}.${key}`);
        if (err) return err;
      } else if (schema.additionalProperties === false) {
        return `${path}.${key} is not a supported property`;
      } else if (typeOf(schema.additionalProperties) === 'object') {
        const err = validateSchema(obj[key], schema.additionalProperties, `${path}.${key}`);
        if (err) return err;
      }
    }
  }
};

export const throwIfAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) throw new ToolError('The operation was aborted', 'aborted');
};

interface CreateToolProps<I> {
  name: string;
  title?: string;
  description: string;
  inputSchema?: JsonSchema;
  annotations?: WebMcpToolAnnotations;
  execute: (input: I, options: WebMcpToolExecuteOptions) => unknown;
}

/**
 * Create a default tool with input validation and abort check before running the handler.
 */
export const createTool = <I = Record<string, any>>(props: CreateToolProps<I>): WebMcpTool<I> => {
  const inputSchema = props.inputSchema || { type: 'object', properties: {}, additionalProperties: false };

  return {
    ...props,
    inputSchema,
    execute: async (input, options = {}) => {
      const data = (input ?? {}) as I;
      const error = validateSchema(data, inputSchema);
      if (error) throw new ToolError(error, 'invalid_input');
      throwIfAborted(options.signal);
      return props.execute(data, options);
    },
  };
};

/**
 * Description suffix pointing the agent to the guide tool (when available).
 */
export const guideHint = ({ toolPrefix, instructions }: WebMcpToolsContext) =>
  instructions ? ` If you haven't yet, call ${toolPrefix}get_editor_guide first.` : '';

// Common schema pieces

export const limitSchema = { type: 'integer', minimum: 1, maximum: 1000, description: 'Max number of items to return' };
export const offsetSchema = { type: 'integer', minimum: 0, description: 'Number of items to skip (pagination)' };
export const idSchema = (description = 'Component id, as returned by the inspection tools') => ({
  type: 'string',
  description,
});
export const styleSchema = {
  type: 'object',
  description:
    'CSS properties, eg. { "color": "red", "padding-top": "10px" }. Use an empty string to remove a property',
  additionalProperties: { type: ['string', 'number'] },
};
export const componentContentSchema = {
  description:
    'Components to add: an HTML string, a component definition object (eg. { "type": "text", "content": "Hello" }) or an array of them',
  oneOf: [{ type: 'string' }, { type: 'object' }, { type: 'array', items: { type: ['string', 'object'] } }],
};

export const paginate = <T, R>(
  items: T[],
  input: { limit?: number; offset?: number },
  defaultLimit: number,
  map: (item: T) => R,
) => {
  const offset = input.offset || 0;
  const limit = input.limit || defaultLimit;
  const page = items.slice(offset, offset + limit);

  return {
    items: page.map(map),
    total: items.length,
    offset,
    hasMore: offset + page.length < items.length,
  };
};

export const truncate = (value: string, max = 200) => (value.length > max ? `${value.slice(0, max)}…` : value);

/**
 * Return a JSON safe copy of the value, or undefined if it can't be serialized.
 */
export const toPlain = <T>(value: T): T | undefined => {
  if (value === undefined) return undefined;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return undefined;
  }
};

// Components

const getRootOf = (cmp: Component) => {
  let current: Component | undefined = cmp;
  while (current?.parent()) current = current.parent();
  return current;
};

/**
 * Check if the component is part of one of the project pages (eg. not removed or temporary).
 */
export const isAttached = (editor: Editor, cmp: Component) => {
  const root = getRootOf(cmp);
  return !!root && editor.Pages.getAllWrappers().includes(root as any);
};

export const getComponent = (editor: Editor, id: string): Component => {
  const cmps = editor.Components as any;
  const cmp: Component | undefined = cmps.getById ? cmps.getById(id) : cmps.allById()[id];

  if (!cmp || !isAttached(editor, cmp)) {
    throw new ToolError(
      `Component "${id}" not found. It may have been removed, use the inspection tools to get fresh ids`,
      'not_found',
    );
  }

  return cmp;
};

/**
 * Resolve the target parent: the provided component or the wrapper of the selected page.
 */
export const getParentComponent = (editor: Editor, id?: string): Component => {
  if (id) return getComponent(editor, id);
  const wrapper = editor.getWrapper();
  if (!wrapper) throw new ToolError('No page is selected', 'not_found');
  return wrapper;
};

export const getPageOf = (editor: Editor, cmp: Component) => {
  const root = getRootOf(cmp);
  return editor.Pages.getAll().find((page) => page.getMainComponent() === root);
};

export const getTextContent = (cmp: Component) => {
  const content = cmp.get('content');
  if (cmp.get('type') === 'textnode' || (typeof content === 'string' && content)) {
    return typeof content === 'string' ? content : undefined;
  }
};

export const serializeComponentSummary = (cmp: Component) => {
  const text = getTextContent(cmp);
  return {
    id: cmp.getId(),
    type: cmp.get('type') || 'default',
    name: cmp.getName(),
    tagName: cmp.get('tagName'),
    classes: cmp.getClasses(),
    childCount: cmp.components().length,
    ...(text ? { text: truncate(text, 100) } : {}),
  };
};

export const serializeComponent = (editor: Editor, cmp: Component, opts: { html?: boolean } = {}) => {
  const parent = cmp.parent();
  const text = getTextContent(cmp);
  const page = getPageOf(editor, cmp);

  return {
    id: cmp.getId(),
    type: cmp.get('type') || 'default',
    name: cmp.getName(),
    tagName: cmp.get('tagName'),
    pageId: page?.getId(),
    parentId: parent?.getId() || null,
    index: parent ? cmp.index() : 0,
    attributes: toPlain(cmp.getAttributes({ noClass: true, noStyle: true })) || {},
    classes: cmp.getClasses(),
    style: toPlain(cmp.getStyle()) || {},
    children: cmp.components().map((child) => serializeComponentSummary(child)),
    ...(text !== undefined ? { text } : {}),
    flags: {
      selectable: !!cmp.get('selectable'),
      removable: !!cmp.get('removable'),
      draggable: !!cmp.get('draggable'),
      droppable: !!cmp.get('droppable'),
      copyable: !!cmp.get('copyable'),
      editable: !!cmp.get('editable'),
    },
    ...(opts.html ? { html: cmp.toHTML() } : {}),
  };
};

/**
 * Get all the descendants of a component (depth-first order).
 */
export const getDescendants = (root: Component) => {
  const result: Component[] = [];
  const walk = (cmp: Component) =>
    cmp.components().forEach((child) => {
      result.push(child);
      walk(child);
    });
  walk(root);
  return result;
};

const QUERY_ATTR = 'data-webmcp-id';

/**
 * Query descendants by CSS selector. Unlike `component.find`, it doesn't require
 * the component to be rendered (eg. components of non selected pages).
 */
export const queryComponents = (editor: Editor, root: Component, selector: string) => {
  const descendants = getDescendants(root);
  const byId = new Map(descendants.map((cmp) => [cmp.getId(), cmp]));
  const html = root.toHTML({ attributes: (cmp, attrs) => ({ ...attrs, [QUERY_ATTR]: cmp.getId() }) });
  const doc = new DOMParser().parseFromString(html, 'text/html');
  let elements: Element[];

  try {
    elements = Array.from(doc.body.querySelectorAll(selector));
  } catch {
    throw new ToolError(`Invalid selector "${selector}"`, 'invalid_input');
  }

  return elements.map((el) => byId.get(el.getAttribute(QUERY_ATTR) || '')).filter((cmp): cmp is Component => !!cmp);
};

export const ensureCanMove = (editor: Editor, target: Component, source: any, at?: number) => {
  if (source && typeof source === 'object' && (source as Component).getId && source === target) {
    throw new ToolError('A component cannot be moved inside itself', 'invalid_destination');
  }

  if ((source as Component)?.getId && (source as Component).contains?.(target)) {
    throw new ToolError('A component cannot be moved inside one of its descendants', 'invalid_destination');
  }

  const { result, reason } = editor.Components.canMove(target, source, at);

  if (!result) {
    const why =
      reason === 1
        ? 'the source does not accept the target as its parent'
        : reason === 2
          ? 'the target does not accept the source as a child'
          : 'the source is not valid';
    throw new ToolError(`Cannot place the content inside "${target.getId()}": ${why}`, 'invalid_destination');
  }
};

export const checkIndex = (parent: Component, at?: number) => {
  if (at === undefined) return;
  const max = parent.components().length;
  if (at > max) throw new ToolError(`Index ${at} is out of range, the target has ${max} children`, 'invalid_input');
};

// CSS rules

export const serializeRule = (rule: CssRule) => {
  const atRuleType = rule.get('atRuleType') || (rule.get('mediaText') ? 'media' : '');

  return {
    selector: rule.selectorsToString(),
    state: rule.get('state') || '',
    atRuleType,
    atRuleParams: rule.get('mediaText') || '',
    style: toPlain(rule.getStyle()) || {},
    css: rule.toCSS(),
  };
};
