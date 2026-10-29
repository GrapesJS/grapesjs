import type { Component, Editor } from 'grapesjs';
import * as z from 'zod/mini';
import { ToolNames } from './tools/names';
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

const formatPath = (path: PropertyKey[]) =>
  path.reduce<string>((acc, key) => (typeof key === 'number' ? `${acc}[${key}]` : `${acc}.${String(key)}`), 'input');

/**
 * Readable message from a validation issue (zod/mini doesn't include localized messages).
 */
const formatIssue = (issue: z.core.$ZodIssue, input: unknown): string => {
  const path = formatPath(issue.path);

  switch (issue.code) {
    case 'invalid_type': {
      // Issues don't include the received value by default
      const value = issue.path.reduce<any>((acc, key) => acc?.[key as any], input);
      const expected = issue.expected === 'int' ? 'integer' : issue.expected;
      return value === undefined ? `${path} is required` : `${path} must be of type ${expected}`;
    }
    case 'unrecognized_keys':
      return issue.keys.map((key) => `${formatPath([...issue.path, key])} is not a supported property`).join(', ');
    case 'too_small':
      return issue.origin === 'array'
        ? `${path} must contain at least ${issue.minimum} item(s)`
        : `${path} must be >= ${issue.minimum}`;
    case 'too_big':
      return issue.origin === 'array'
        ? `${path} must contain at most ${issue.maximum} item(s)`
        : `${path} must be <= ${issue.maximum}`;
    case 'invalid_value':
      return `${path} must be one of: ${issue.values.map((v) => JSON.stringify(v)).join(', ')}`;
    case 'invalid_union':
      return `${path} doesn't match any of the allowed shapes`;
    default:
      return `${path} is not valid`;
  }
};

/**
 * Validate the input against the schema, throws a ToolError with the first issue.
 */
const parseInput = <S extends z.ZodMiniType>(schema: S, input: unknown): z.output<S> => {
  const result = z.safeParse(schema, input);
  if (!result.success) throw new ToolError(formatIssue(result.error.issues[0], input), 'invalid_input');
  return result.data;
};

/**
 * Remove noise added by the JSON Schema conversion (safe integer bounds, string property names).
 */
const cleanJsonSchema = (value: any): any => {
  if (Array.isArray(value)) return value.map(cleanJsonSchema);
  if (!value || typeof value !== 'object') return value;
  const result: JsonSchema = {};

  Object.keys(value).forEach((key) => {
    const item = value[key];
    if (key === 'maximum' && item === Number.MAX_SAFE_INTEGER) return;
    if (key === 'minimum' && item === Number.MIN_SAFE_INTEGER) return;
    if (key === 'propertyNames' && item?.type === 'string' && Object.keys(item).length === 1) return;
    result[key] = cleanJsonSchema(item);
  });

  return result;
};

/**
 * Convert a zod schema to the JSON Schema exposed to the agent.
 */
const toInputSchema = (schema: z.ZodMiniType): JsonSchema => {
  const { $schema, ...jsonSchema } = z.toJSONSchema(schema, { io: 'input' }) as JsonSchema;
  return cleanJsonSchema(jsonSchema);
};

const throwIfAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) throw new ToolError('The operation was aborted', 'aborted');
};

const emptyInput = z.strictObject({});

export interface CreateToolProps<S extends z.ZodMiniType> {
  name: string;
  title?: string;
  description: string;
  /** Zod (`zod/mini`) schema of the input, used for the `inputSchema` and validation. */
  input?: S;
  annotations?: WebMcpToolAnnotations;
  execute: (input: z.output<S>, options: WebMcpToolExecuteOptions) => unknown;
}

/**
 * Create a tool from a zod schema: the `inputSchema` is generated from it, the input
 * is validated (and typed) before running the handler.
 * @example
 * import * as z from 'zod/mini';
 *
 * createTool({
 *   name: 'save_project',
 *   description: 'Save the project',
 *   input: z.strictObject({ reason: z.optional(z.string()) }),
 *   execute: ({ reason }) => ({ saved: true }),
 * });
 */
export const createTool = <S extends z.ZodMiniType = typeof emptyInput>(
  props: CreateToolProps<S>,
): WebMcpTool<z.output<S>> => {
  const { input, execute, ...rest } = props;
  const schema = (input || emptyInput) as S;

  return {
    ...rest,
    inputSchema: toInputSchema(schema),
    execute: async (data, options = {}) => {
      const parsed = parseInput(schema, data ?? {});
      throwIfAborted(options.signal);
      return execute(parsed, options);
    },
  };
};

/**
 * Reference another tool (eg. in descriptions or error messages) with its registered name.
 */
export const toolRef = ({ toolPrefix }: Pick<WebMcpToolsContext, 'toolPrefix'>, name: ToolNames) =>
  `${toolPrefix}${name}`;

/**
 * Description suffix pointing the agent to the guide tool (when available).
 */
export const guideHint = (ctx: WebMcpToolsContext) =>
  ctx.instructions ? ` If you haven't yet, call ${toolRef(ctx, ToolNames.getEditorGuide)} first.` : '';

export type Style = Record<string, string>;
export type StyleInput = Record<string, string | number | null>;

/**
 * Merge style updates, empty values remove the property.
 */
export const mergeStyle = (current: Style, update: StyleInput) => {
  const result: Style = { ...current };
  Object.keys(update).forEach((prop) => {
    const value = update[prop];
    if (value === '' || value === null) {
      delete result[prop];
    } else {
      result[prop] = `${value}`;
    }
  });
  return result;
};

// Common schema pieces

export const limitSchema = z.optional(
  z.int().check(z.minimum(1), z.maximum(1000), z.describe('Max number of items to return')),
);
export const offsetSchema = z.optional(z.int().check(z.minimum(0), z.describe('Number of items to skip (pagination)')));
export const idSchema = (description = 'Component id, as returned by the inspection tools') =>
  z.string().check(z.describe(description));
export const styleSchema = z
  .record(z.string(), z.union([z.string(), z.number()]))
  .check(
    z.describe(
      'CSS properties, eg. { "color": "red", "padding-top": "10px" }. Use an empty string to remove a property',
    ),
  );
const componentDefSchema = z.looseObject({});
export const componentContentSchema = z
  .union([z.string(), componentDefSchema, z.array(z.union([z.string(), componentDefSchema]))])
  .check(
    z.describe(
      'Components to add: an HTML string, a component definition object (eg. { "type": "text", "content": "Hello" }) or an array of them',
    ),
  );

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

const truncate = (value: string, max = 200) => (value.length > max ? `${value.slice(0, max)}…` : value);

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
const isAttached = (editor: Editor, cmp: Component) => {
  const root = getRootOf(cmp);
  return !!root && editor.Pages.getAllWrappers().includes(root as any);
};

export const getComponent = (editor: Editor, id: string): Component => {
  const cmp = editor.Components.getById(id);

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

const getTextContent = (cmp: Component) => {
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
    attributes: toPlain(cmp.getAttributes()) || {},
    childCount: cmp.components().length,
    ...(text ? { text: truncate(text, 100) } : {}),
  };
};

/**
 * Details to extend the component summary with.
 */
export const serializeComponentDetails = (editor: Editor, cmp: Component) => {
  const parent = cmp.parent();
  const text = getTextContent(cmp);
  const page = getPageOf(editor, cmp);

  return {
    pageId: page?.getId(),
    parentId: parent?.getId() || null,
    index: parent ? cmp.index() : 0,
    ...(text !== undefined ? { text } : {}),
    flags: {
      selectable: !!cmp.get('selectable'),
      removable: !!cmp.get('removable'),
      draggable: !!cmp.get('draggable'),
      droppable: !!cmp.get('droppable'),
      copyable: !!cmp.get('copyable'),
      editable: !!cmp.get('editable'),
    },
  };
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
