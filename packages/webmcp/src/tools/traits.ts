import type { Trait } from 'grapesjs';
import type { WebMcpToolsContext } from '../types';
import { ToolNames } from './names';
import { createTool, getComponent, idSchema, ToolError, toPlain } from '../utils';

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

export default ({ editor }: WebMcpToolsContext) => [
  createTool<{ id: string }>({
    name: ToolNames.getComponentTraits,
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
    name: ToolNames.updateComponentTraits,
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
