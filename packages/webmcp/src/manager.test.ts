import grapesjs, { type Editor } from 'grapesjs';
import * as z from 'zod/mini';
import webMcpPlugin, { createTool, ToolNames, WebMcpEvents, WebMcpTool, WebMcpToolExecuteEventData } from '.';
import { WebMcpManager } from './manager';
import { createEditor, createModelContext, flush } from '../test/helpers';

const helloTool: WebMcpTool<{ name?: string }> = {
  name: 'say_hello',
  description: 'Say hello',
  execute: ({ name = 'you' }) => ({ message: `Hello ${name}` }),
};

describe('WebMcpManager', () => {
  let editor: Editor;
  let mc: ReturnType<typeof createModelContext>;
  let webmcp: WebMcpManager;

  beforeEach(async () => {
    ({ editor, mc } = await createEditor({ getTools: () => [] }));
    webmcp = editor.runCommand('webMcpManager');
  });

  afterEach(() => editor.destroy());

  test('Available via command', () => {
    expect(webmcp).toBeInstanceOf(WebMcpManager);
    expect(editor.runCommand('webMcpManager')).toBe(webmcp);
  });

  test('Typed command and events', () => {
    // Compile-time checks (run by `ts:check`)
    const tools: WebMcpTool[] = editor.runCommand('webMcpManager').getTools();
    editor.on(WebMcpEvents.toolExecute, ({ name, result }) => [name.toUpperCase(), result]);
    editor.on('webmcp:tool:add', ({ tool }) => tool.name);
    // @ts-expect-error unknown method
    expect(() => editor.runCommand('webMcpManager').unknownMethod()).toThrow();
    // @ts-expect-error unknown event property
    editor.on(WebMcpEvents.toolRemove, ({ name }) => name);
    expect(tools).toEqual([]);
  });

  test('addTool registers the tool with the prefix', async () => {
    const onAdd = jest.fn();
    editor.on(WebMcpEvents.toolAdd, onAdd);
    expect(webmcp.addTool(helloTool)).toBe(helloTool);
    await flush();
    expect(mc.tools.has('grapesjs_say_hello')).toBe(true);
    expect(onAdd).toHaveBeenCalledWith({ tool: helloTool });
    expect(webmcp.getTools()).toEqual([helloTool]);
    expect(webmcp.getTool('say_hello')).toBe(helloTool);
    expect(webmcp.hasTool('say_hello')).toBe(true);
    expect(await mc.call('grapesjs_say_hello', { name: 'Agent' })).toEqual({ message: 'Hello Agent' });
  });

  test('addTool validates tools and names', () => {
    webmcp.addTool(helloTool);
    expect(() => webmcp.addTool(helloTool)).toThrow('Duplicate tool name "say_hello"');
    expect(() => webmcp.addTool({ ...helloTool, name: '' })).toThrow('missing a name');
    expect(() => webmcp.addTool({ ...helloTool, name: 'x', description: '' })).toThrow('missing a description');
    expect(() => webmcp.addTool({ ...helloTool, name: 'x', execute: undefined as any })).toThrow('missing the execute');
  });

  test('addTools adds nothing if one tool is invalid', () => {
    expect(() =>
      webmcp.addTools([
        { ...helloTool, name: 'a' },
        { ...helloTool, name: 'a' },
      ]),
    ).toThrow('Duplicate');
    expect(webmcp.getTools()).toEqual([]);
    expect(mc.registerTool).not.toHaveBeenCalled();
  });

  test('removeTool unregisters only that tool', async () => {
    const onRemove = jest.fn();
    editor.on(WebMcpEvents.toolRemove, onRemove);
    webmcp.addTools([helloTool, { ...helloTool, name: 'other' }]);
    await flush();
    expect(webmcp.removeTool('say_hello')).toBe(true);
    expect(webmcp.removeTool('say_hello')).toBe(false);
    expect([...mc.tools.keys()]).toEqual(['grapesjs_other']);
    expect(onRemove).toHaveBeenCalledWith({ tool: helloTool });
    // The name can be reused
    webmcp.addTool(helloTool);
    await flush();
    expect(mc.tools.has('grapesjs_say_hello')).toBe(true);
  });

  test('executeTool returns what the agent receives', async () => {
    webmcp.addTools([
      helloTool,
      createTool({
        name: 'strict',
        description: 'Strict',
        input: z.strictObject({ id: z.string() }),
        execute: ({ id }) => ({ id }),
      }),
      { name: 'fail', description: 'Fail', execute: () => Promise.reject(new Error('Boom')) },
      { name: 'empty', description: 'Empty', execute: () => {} },
    ]);
    expect(await webmcp.executeTool('say_hello')).toEqual({ message: 'Hello you' });
    expect(await webmcp.executeTool('strict', { id: 'a' })).toEqual({ id: 'a' });
    expect(await webmcp.executeTool('strict')).toEqual({
      error: { code: 'invalid_input', message: 'input.id is required' },
    });
    expect(await webmcp.executeTool('fail')).toEqual({ error: { code: 'execution_error', message: 'Boom' } });
    expect(await webmcp.executeTool('empty')).toEqual({ ok: true });
    expect(() => webmcp.executeTool('nope')).toThrow('Tool "nope" not found');
  });

  test('Default tools are executable', async () => {
    editor.destroy();
    ({ editor, mc } = await createEditor({}, { components: '<div id="box"></div>' }));
    webmcp = editor.runCommand('webMcpManager');
    expect(webmcp.hasTool(ToolNames.getComponents)).toBe(true);
    expect(await webmcp.executeTool(ToolNames.getComponents, { ids: ['box'] })).toMatchObject({
      items: [{ id: 'box' }],
    });
  });

  test('Execute events, for executeTool and agent calls', async () => {
    const before = jest.fn();
    const after = jest.fn();
    editor.on(WebMcpEvents.toolExecuteBefore, before);
    editor.on(WebMcpEvents.toolExecute, after);
    webmcp.addTools([
      helloTool,
      { name: 'fail', description: 'Fail', execute: () => Promise.reject(new Error('Boom')) },
    ]);
    await flush();

    await webmcp.executeTool('say_hello', { name: 'A' });
    await mc.call('grapesjs_say_hello', { name: 'B' });
    await webmcp.executeTool('fail');

    expect(before.mock.calls.map(([data]) => data)).toEqual([
      { name: 'say_hello', input: { name: 'A' } },
      { name: 'say_hello', input: { name: 'B' } },
      { name: 'fail', input: {} },
    ]);
    const events: WebMcpToolExecuteEventData[] = after.mock.calls.map(([data]) => data);
    expect(events[0]).toEqual({ name: 'say_hello', input: { name: 'A' }, result: { message: 'Hello A' } });
    expect(events[1].result).toEqual({ message: 'Hello B' });
    expect(events[2].result).toEqual({ error: { code: 'execution_error', message: 'Boom' } });
    expect((events[2].error as Error).message).toBe('Boom');
  });

  test('Failed registration of a tool is logged and keeps the others', async () => {
    // Errors are still triggered as events, but not printed in the console
    editor.destroy();
    ({ editor, mc } = await createEditor({ getTools: () => [] }, { log: false }));
    webmcp = editor.runCommand('webMcpManager');
    const logs: string[] = [];
    editor.on('log:error', (msg: string) => logs.push(msg));
    mc.tools.set('grapesjs_taken', helloTool as any);
    webmcp.addTools([helloTool, { ...helloTool, name: 'taken' }]);
    await flush();
    expect(logs.join()).toContain('Unable to register the WebMCP tool "grapesjs_taken"');
    expect(mc.tools.has('grapesjs_say_hello')).toBe(true);
    // Still executable locally
    expect(await webmcp.executeTool('taken')).toEqual({ message: 'Hello you' });
  });
});

describe('WebMcpManager lifecycle', () => {
  test('Tools are registered right away, before the editor is ready', async () => {
    const mc = createModelContext();
    const editor = grapesjs.init({
      headless: true,
      storageManager: false,
      plugins: [
        (ed) => webMcpPlugin(ed, { modelContext: mc.modelContext, getTools: () => [] }),
        // Another plugin adding tools during the initialization
        (ed) => void ed.runCommand('webMcpManager').addTool(helloTool),
      ],
    });
    await flush();
    expect(editor.getModel().get('ready')).toBeFalsy();
    expect(mc.tools.has('grapesjs_say_hello')).toBe(true);
    expect(await mc.call('grapesjs_say_hello')).toEqual({ message: 'Hello you' });
    editor.destroy();
    expect(mc.tools.size).toBe(0);
  });

  test('Works without WebMCP', async () => {
    const editor = grapesjs.init({ headless: true, storageManager: false, plugins: [(ed) => webMcpPlugin(ed, {})] });
    editor.getModel().set('readyCanvas', true);
    editor.getModel().trigger('load', editor);
    const webmcp = editor.runCommand('webMcpManager');
    webmcp.addTool(helloTool);
    expect(await webmcp.executeTool('say_hello')).toEqual({ message: 'Hello you' });
    expect(webmcp.getTools().length).toBeGreaterThan(1);
    editor.destroy();
  });

  test('Plugin removal removes the command and the tools', async () => {
    const mc = createModelContext();
    const editor = grapesjs.init({ headless: true, storageManager: false });
    const plugin = editor.Plugins.add({
      id: 'webmcp',
      plugin: (ed) => webMcpPlugin(ed, { modelContext: mc.modelContext }),
    });
    editor.getModel().set('readyCanvas', true);
    editor.getModel().trigger('load', editor);
    await flush();
    const webmcp = editor.runCommand('webMcpManager');
    expect(webmcp.getTools().length).toBeGreaterThan(0);
    editor.Plugins.remove(plugin!);
    expect(mc.tools.size).toBe(0);
    expect(webmcp.getTools()).toEqual([]);
    expect(editor.Commands.has('webMcpManager')).toBe(false);
    editor.destroy();
  });
});
