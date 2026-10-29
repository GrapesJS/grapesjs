import type { CssRule } from 'grapesjs';
import * as z from 'zod/mini';
import type { WebMcpToolsContext } from '../types';
import { ToolNames } from './names';
import {
  createTool,
  limitSchema,
  mergeStyle,
  offsetSchema,
  paginate,
  Style,
  styleSchema,
  ToolError,
  toolRef,
  toPlain,
} from '../utils';

const atRuleProps = {
  atRuleType: z.optional(
    z.string().check(z.describe('At-rule type, eg. "media". Defaults to "media" when atRuleParams is set')),
  ),
  atRuleParams: z.optional(z.string().check(z.describe('At-rule params, eg. "(max-width: 768px)"'))),
};

const getRuleOpts = (input: { atRuleType?: string; atRuleParams?: string }) => {
  const atRuleParams = input.atRuleParams || '';
  const atRuleType = input.atRuleType || (atRuleParams ? 'media' : '');
  return { atRuleType, atRuleParams };
};

const serializeRuleRef = (rule: CssRule) => ({
  selector: rule.selectorsToString(),
  state: rule.get('state') || '',
  atRuleType: rule.get('atRuleType') || (rule.get('mediaText') ? 'media' : ''),
  atRuleParams: rule.get('mediaText') || '',
});

const serializeRule = (rule: CssRule) => ({
  ...serializeRuleRef(rule),
  style: toPlain(rule.getStyle()) || {},
});

// Keep empty rules, otherwise they would be serialized as an empty string
const serializeRuleCss = (rule: CssRule) => rule.toCSS({ allowEmpty: true });

export default ({ editor, defaultLimit, toolPrefix }: WebMcpToolsContext) => [
  createTool({
    name: ToolNames.getCssRules,
    title: 'Get CSS rules',
    description:
      'List CSS rules of the project. Filter by exact selector (including state, eg. ".btn:hover") and/or at-rule (eg. media params "(max-width: 768px)"). Rules are returned as CSS strings, unless `format` is "style".',
    annotations: { readOnlyHint: true },
    input: z.strictObject({
      selector: z.optional(z.string().check(z.describe('Exact selector, eg. ".btn:hover" or "#my-id"'))),
      ...atRuleProps,
      format: z.optional(
        z
          .enum(['css', 'style'])
          .check(
            z.describe(
              'Format of the returned rules: "css" (default) for CSS strings, "style" for objects with the rule identifiers and the style',
            ),
          ),
      ),
      limit: limitSchema,
      offset: offsetSchema,
    }),
    execute: (input) => {
      const { selector } = input;
      const hasAtRuleFilter = input.atRuleType !== undefined || input.atRuleParams !== undefined;
      const { atRuleType, atRuleParams } = getRuleOpts(input);
      const rules = editor.Css.getRules().filter((rule: CssRule) => {
        const data = serializeRuleRef(rule);
        if (selector !== undefined && data.selector !== selector.trim()) return false;
        if (hasAtRuleFilter && (data.atRuleType !== atRuleType || data.atRuleParams !== atRuleParams)) return false;
        return true;
      });

      return input.format === 'style'
        ? paginate(rules, input, defaultLimit, serializeRule)
        : paginate(rules, input, defaultLimit, serializeRuleCss);
    },
  }),
  createTool({
    name: ToolNames.setCssRules,
    title: 'Set CSS rules',
    description:
      'Create or update CSS rules, passed as objects (`rules`) and/or as a raw CSS string (`css`). Selectors can include a state (eg. ".btn:hover") and rules can be wrapped in an at-rule (eg. a media query). Styles are merged into existing rules unless `replace` is true. ' +
      `Returns only the identifiers of the affected rules, use ${toolRef({ toolPrefix }, ToolNames.getCssRules)} to read their styles.`,
    input: z.strictObject({
      rules: z.optional(
        z
          .array(
            z.strictObject({
              selector: z.string().check(z.describe('CSS selector, eg. ".btn", ".btn:hover", "#my-id"')),
              style: styleSchema,
              ...atRuleProps,
            }),
          )
          .check(z.describe('Rules to create or update')),
      ),
      css: z.optional(
        z
          .string()
          .check(
            z.describe(
              'Raw CSS with the rules to create or update, eg. ".btn { color: red } @media (max-width: 768px) { .btn { padding: 0 } }"',
            ),
          ),
      ),
      replace: z.optional(
        z.boolean().check(z.describe('Replace the whole style of existing rules instead of merging it')),
      ),
    }),
    execute: ({ rules = [], css, replace }) => {
      if (!rules.length && !css?.trim()) throw new ToolError('Provide `rules` and/or `css`', 'invalid_input');
      const emptyIndex = rules.findIndex((rule) => !rule.selector.trim());
      if (emptyIndex >= 0) throw new ToolError(`input.rules[${emptyIndex}].selector is empty`, 'invalid_input');

      const result = rules.map(({ selector, style, ...rest }) => {
        const opts = getRuleOpts(rest);
        const current = editor.Css.getRule(selector, opts);
        const currentStyle = (current && !replace ? toPlain(current.getStyle()) : {}) as Style;
        return editor.Css.setRule(selector, mergeStyle(currentStyle, style), opts);
      });

      if (css?.trim()) {
        result.push(...editor.Css.addCollection(css, { extend: !replace }));
      }

      const affected = [...new Set(result)];
      return { count: affected.length, rules: affected.map(serializeRuleRef) };
    },
  }),
  createTool({
    name: ToolNames.removeCssRules,
    title: 'Remove CSS rules',
    description: 'Remove CSS rules matching the exact selector and at-rule.',
    annotations: { consequentialHint: true },
    input: z.strictObject({
      rules: z
        .array(
          z.strictObject({
            selector: z.string().check(z.describe('CSS selector, eg. ".btn:hover"')),
            ...atRuleProps,
          }),
        )
        .check(z.minLength(1), z.describe('Rules to remove')),
    }),
    execute: ({ rules }) => {
      const found = rules.map(({ selector, ...rest }) => editor.Css.getRule(selector, getRuleOpts(rest)));
      const missing = rules.filter((_, index) => !found[index]).map((rule) => `"${rule.selector}"`);
      if (missing.length) throw new ToolError(`CSS rules not found: ${missing.join(', ')}`, 'not_found');

      const removed = found.map((rule) => serializeRuleCss(rule!));
      found.forEach((rule) => editor.Css.remove(rule!));
      return { removed };
    },
  }),
];
