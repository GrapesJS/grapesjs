import type { CssRule } from 'grapesjs';
import type { WebMcpToolsContext } from '../types';
import {
  createTool,
  getComponent,
  idSchema,
  limitSchema,
  offsetSchema,
  paginate,
  serializeRule,
  styleSchema,
  toPlain,
  ToolError,
} from '../utils';

type Style = Record<string, string>;
type StyleInput = Record<string, string | number | null>;

const atRuleProps = {
  atRuleType: {
    type: 'string',
    description: 'At-rule type, eg. "media". Defaults to "media" when atRuleParams is set',
  },
  atRuleParams: { type: 'string', description: 'At-rule params, eg. "(max-width: 768px)"' },
};

const getRuleOpts = (input: { atRuleType?: string; atRuleParams?: string }) => {
  const atRuleParams = input.atRuleParams || '';
  const atRuleType = input.atRuleType || (atRuleParams ? 'media' : '');
  return { atRuleType, atRuleParams };
};

const mergeStyle = (current: Style, update: StyleInput) => {
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

export default ({ editor, defaultLimit }: WebMcpToolsContext) => [
  createTool<{ id: string; style: StyleInput; replace?: boolean }>({
    name: 'set_component_style',
    title: 'Set component style',
    description:
      'Update the style of a single component (merged with the current one by default). For states (eg. hover) or media queries use set_css_rule with the "#<componentId>" selector, for shared styles prefer classes.',
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
    name: 'update_component_classes',
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

  createTool<{ selector?: string; atRuleType?: string; atRuleParams?: string; limit?: number; offset?: number }>({
    name: 'get_css_rules',
    title: 'Get CSS rules',
    description:
      'List CSS rules of the project. Filter by exact selector (including state, eg. ".btn:hover") and/or at-rule (eg. media params "(max-width: 768px)").',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'Exact selector, eg. ".btn:hover" or "#my-id"' },
        ...atRuleProps,
        limit: limitSchema,
        offset: offsetSchema,
      },
      additionalProperties: false,
    },
    execute: (input) => {
      const { selector } = input;
      const hasAtRuleFilter = input.atRuleType !== undefined || input.atRuleParams !== undefined;
      const { atRuleType, atRuleParams } = getRuleOpts(input);
      const rules = editor.Css.getRules().filter((rule: CssRule) => {
        const data = serializeRule(rule);
        if (selector !== undefined && data.selector !== selector.trim()) return false;
        if (hasAtRuleFilter && (data.atRuleType !== atRuleType || data.atRuleParams !== atRuleParams)) return false;
        return true;
      });

      return paginate(rules, input, defaultLimit, serializeRule);
    },
  }),

  createTool<{ selector: string; style: StyleInput; atRuleType?: string; atRuleParams?: string; replace?: boolean }>({
    name: 'set_css_rule',
    title: 'Set CSS rule',
    description:
      'Create or update a CSS rule. The selector can include a state (eg. ".btn:hover") and the rule can be wrapped in an at-rule (eg. atRuleParams "(max-width: 768px)" for a media query). Styles are merged by default.',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector, eg. ".btn", ".btn:hover", "#my-id"' },
        style: styleSchema,
        ...atRuleProps,
        replace: { type: 'boolean', description: 'Replace the whole rule style instead of merging it' },
      },
      required: ['selector', 'style'],
      additionalProperties: false,
    },
    execute: ({ selector, style, replace, ...rest }) => {
      if (!selector.trim()) throw new ToolError('The selector is empty', 'invalid_input');
      const opts = getRuleOpts(rest);
      const current = editor.Css.getRule(selector, opts);
      const currentStyle = (current && !replace ? toPlain(current.getStyle()) : {}) as Style;
      const rule = editor.Css.setRule(selector, mergeStyle(currentStyle, style), opts);

      return { rule: serializeRule(rule) };
    },
  }),

  createTool<{ selector: string; atRuleType?: string; atRuleParams?: string }>({
    name: 'remove_css_rule',
    title: 'Remove CSS rule',
    description: 'Remove a CSS rule matching the exact selector and at-rule.',
    annotations: { consequentialHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector, eg. ".btn:hover"' },
        ...atRuleProps,
      },
      required: ['selector'],
      additionalProperties: false,
    },
    execute: ({ selector, ...rest }) => {
      const rule = editor.Css.getRule(selector, getRuleOpts(rest));
      if (!rule) throw new ToolError(`CSS rule "${selector}" not found`, 'not_found');
      const removed = serializeRule(rule);
      editor.Css.remove(rule);
      return { removed };
    },
  }),
];
