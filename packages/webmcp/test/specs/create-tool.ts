import * as z from 'zod/mini';
import { createTool } from '../../src';
import { createEditor } from '../helpers';

describe('createTool', () => {
  const tool = createTool({
    name: 'greet',
    description: 'Greet someone',
    input: z.strictObject({
      name: z.string().check(z.describe('Who to greet')),
      times: z.optional(z.int().check(z.minimum(1), z.maximum(3))),
      tone: z.optional(z.enum(['formal', 'casual'])),
      tags: z.optional(z.array(z.string()).check(z.minLength(1))),
    }),
    execute: ({ name, times = 1, tone = 'casual' }) => ({
      message: `${tone === 'formal' ? 'Good day' : 'Hi'} ${name}`.repeat(times),
    }),
  });

  test('Generates a plain JSON Schema', () => {
    expect(tool.inputSchema).toEqual({
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Who to greet' },
        times: { type: 'integer', minimum: 1, maximum: 3 },
        tone: { type: 'string', enum: ['formal', 'casual'] },
        tags: { type: 'array', items: { type: 'string' }, minItems: 1 },
      },
      required: ['name'],
      additionalProperties: false,
    });
  });

  test('Without input, accepts only an empty object', async () => {
    const noInput = createTool({ name: 'ping', description: 'Ping', execute: () => 'pong' });
    expect(noInput.inputSchema).toEqual({ type: 'object', properties: {}, additionalProperties: false });
    expect(await noInput.execute(undefined as any)).toBe('pong');
    await expect(noInput.execute({ a: 1 } as any)).rejects.toThrow('input.a is not a supported property');
  });

  test('Validates the input with readable messages', async () => {
    expect(await tool.execute({ name: 'Ann', tone: 'formal' })).toEqual({ message: 'Good day Ann' });
    const cases: [any, string][] = [
      [{}, 'input.name is required'],
      [{ name: 1 }, 'input.name must be of type string'],
      [{ name: 'a', times: 4 }, 'input.times must be <= 3'],
      [{ name: 'a', times: 0 }, 'input.times must be >= 1'],
      [{ name: 'a', times: 1.5 }, 'input.times must be of type integer'],
      [{ name: 'a', tone: 'rude' }, 'input.tone must be one of: "formal", "casual"'],
      [{ name: 'a', tags: [] }, 'input.tags must contain at least 1 item(s)'],
      [{ name: 'a', tags: [1] }, 'input.tags[0] must be of type string'],
      [{ name: 'a', other: true }, 'input.other is not a supported property'],
    ];
    for (const [input, message] of cases) {
      await expect(tool.execute(input)).rejects.toMatchObject({ code: 'invalid_input', message });
    }
  });

  test('Custom zod and plain tools can be registered together', async () => {
    const { editor, mc } = await createEditor({
      getTools: () => [
        tool,
        { name: 'plain', description: 'Plain', inputSchema: { type: 'object' }, execute: (i) => i },
      ],
    });
    expect(await mc.call('grapesjs_greet', { name: 'Bob' })).toEqual({ message: 'Hi Bob' });
    expect(await mc.call('grapesjs_greet', {})).toEqual({
      error: { code: 'invalid_input', message: 'input.name is required' },
    });
    expect(await mc.call('grapesjs_plain', { any: 1 })).toEqual({ any: 1 });
    editor.destroy();
  });
});
