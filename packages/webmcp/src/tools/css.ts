import type { CssRule } from 'grapesjs';
import type { WebMcpToolsContext } from '../types';
import { ToolNames } from './names';
import {
  createTool,
  limitSchema,
  mergeStyle,
  offsetSchema,
  paginate,
  Style,
  StyleInput,
  styleSchema,
  ToolError,
  toPlain,
} from '../utils';

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

const serializeRule = (rule: CssRule) => {
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

export default ({ editor, defaultLimit }: WebMcpToolsContext) => [
  createTool<{ selector?: string; atRuleType?: string; atRuleParams?: string; limit?: number; offset?: number }>({
    name: ToolNames.getCssRules,
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
    name: ToolNames.setCssRule,
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
    name: ToolNames.removeCssRule,
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
