import grapesjs from 'grapesjs';
import webMcpPlugin, { GetToolsContext, ToolNames, WebMcpTool } from '../../src';
import { createDefaultTools } from '../../src/tools';
import { createEditor, createModelContext, flush } from '../helpers';

const customTool: WebMcpTool = {
  name: 'say_hello',
  description: 'Say hello',
  inputSchema: { type: 'object', properties: { name: { type: 'string' } } },
  execute: ({ name }) => ({ message: `Hello ${name}` }),
};

describe('webMcpPlugin', () => {
  test('Registers all default tools with the default prefix', async () => {
    const { editor, mc } = await createEditor();
    const defaults = createDefaultTools({ editor });
    expect(mc.tools.size).toBe(defaults.length);
    defaults.forEach((tool) => expect(mc.tools.has(`grapesjs_${tool.name}`)).toBe(true));
    // Registered one by one, with an abort signal
    expect(mc.registerTool).toHaveBeenCalledTimes(defaults.length);
    expect((mc.registerTool.mock.calls[0] as any[])[1].signal).toBeInstanceOf(AbortSignal);
    editor.destroy();
  });

  test('ToolNames lists all the default tools', async () => {
    const { editor } = await createEditor();
    const names = createDefaultTools({ editor, instructions: 'Some rules' }).map((tool) => tool.name);
    expect(names.sort()).toEqual(Object.values(ToolNames).sort());
    editor.destroy();
  });

  test('Tool references in descriptions point to registered tools', async () => {
    const { editor, mc } = await createEditor({ toolPrefix: 'site_', instructions: 'Some rules' });
    const registered = [...mc.tools.keys()];
    const names: string[] = Object.values(ToolNames);

    mc.tools.forEach((tool) => {
      const text = `${tool.description} ${JSON.stringify(tool.inputSchema)}`;
      const words = text.match(/[a-z_]+/g) || [];
      words.filter((word) => word.startsWith('site_')).forEach((ref) => expect(registered).toContain(ref));
      // Every reference to another tool is prefixed (skip plain words like "undo")
      words.filter((word) => word.includes('_')).forEach((word) => expect(names).not.toContain(word));
    });
    editor.destroy();
  });

  test('Read-only tools are annotated', async () => {
    const { editor, mc } = await createEditor();
    expect(mc.tools.get('grapesjs_get_components')!.annotations).toMatchObject({ readOnlyHint: true });
    expect(mc.tools.get('grapesjs_load_project_data')!.annotations).toMatchObject({ consequentialHint: true });
    expect(mc.tools.get('grapesjs_add_components')!.annotations?.readOnlyHint).toBeFalsy();
    editor.destroy();
  });

  test('getTools can filter, wrap and add tools', async () => {
    const calls: string[] = [];
    const getTools = jest.fn(({ tools }: GetToolsContext) => [
      ...tools
        .filter((tool) => tool.name !== ToolNames.loadProjectData)
        .map((tool) =>
          tool.name === ToolNames.getEditorState
            ? {
                ...tool,
                execute: async (input: any, opts: any) => {
                  calls.push(tool.name);
                  return { wrapped: true, ...((await tool.execute(input, opts)) as object) };
                },
              }
            : tool,
        ),
      customTool,
    ]);
    const { editor, mc } = await createEditor({ getTools, toolPrefix: 'site_' });

    expect(getTools).toHaveBeenCalledTimes(1);
    expect(getTools.mock.calls[0][0].editor).toBe(editor);
    expect(mc.tools.has('site_load_project_data')).toBe(false);
    expect(mc.tools.has('grapesjs_get_editor_state')).toBe(false);
    expect(await mc.call('site_say_hello', { name: 'Agent' })).toEqual({ message: 'Hello Agent' });
    const state = await mc.call('site_get_editor_state');
    expect(state).toMatchObject({ wrapped: true, dirtyCount: 0 });
    expect(calls).toEqual([ToolNames.getEditorState]);
    editor.destroy();
  });

  test('Returning an empty catalog disables all tools', async () => {
    const { editor, mc } = await createEditor({ getTools: () => [] });
    expect(mc.registerTool).not.toHaveBeenCalled();
    editor.destroy();
  });

  test('Empty prefix keeps the original names', async () => {
    const { editor, mc } = await createEditor({ toolPrefix: '', getTools: () => [customTool] });
    expect([...mc.tools.keys()]).toEqual(['say_hello']);
    editor.destroy();
  });

  test('Invalid catalogs are not registered and errors are logged', async () => {
    const logs: any[] = [];
    const mc = createModelContext();
    const editor = grapesjs.init({
      headless: true,
      storageManager: false,
      // Errors are still triggered as events, but not printed in the console
      log: false,
      plugins: [
        (ed) => {
          ed.on('log:error', (msg: string) => logs.push(msg));
          return webMcpPlugin(ed, { modelContext: mc.modelContext, getTools: () => [customTool, customTool] });
        },
      ],
    });
    editor.getModel().set('readyCanvas', true);
    editor.getModel().trigger('load', editor);
    await flush();
    expect(mc.registerTool).not.toHaveBeenCalled();
    expect(logs.join()).toContain('Duplicate tool name "say_hello"');
    editor.destroy();
  });

  test('Tool errors are returned as data', async () => {
    const { editor, mc } = await createEditor({
      getTools: ({ tools }) => [
        ...tools,
        {
          name: 'fail',
          description: 'Always fails',
          execute: () => {
            throw new Error('Boom');
          },
        },
      ],
    });
    expect(await mc.call('grapesjs_fail')).toEqual({ error: { code: 'execution_error', message: 'Boom' } });
    expect(await mc.call('grapesjs_get_components', { ids: ['missing'] })).toMatchObject({
      error: { code: 'not_found' },
    });
    expect(await mc.call('grapesjs_remove_page', {})).toEqual({
      error: { code: 'invalid_input', message: 'input.id is required' },
    });
    expect(await mc.call('grapesjs_get_components', { ids: [1] })).toMatchObject({ error: { code: 'invalid_input' } });
    expect(await mc.call('grapesjs_list_pages', { extra: true })).toMatchObject({ error: { code: 'invalid_input' } });
    editor.destroy();
  });

  test('Aborted calls do not mutate the editor', async () => {
    const { editor, mc } = await createEditor();
    const controller = new AbortController();
    controller.abort();
    const res = await mc.call(
      'grapesjs_add_components',
      { components: '<div>Hi</div>' },
      { signal: controller.signal },
    );
    expect(res).toMatchObject({ error: { code: 'aborted' } });
    expect(editor.getComponents().length).toBe(0);
    editor.destroy();
  });

  test('Remains inactive without WebMCP', async () => {
    const editor = grapesjs.init({ headless: true, storageManager: false, plugins: [(ed) => webMcpPlugin(ed, {})] });
    editor.getModel().set('readyCanvas', true);
    expect(() => editor.getModel().trigger('load', editor)).not.toThrow();
    editor.destroy();
  });

  test('Uses document.modelContext by default', async () => {
    const mc = createModelContext();
    (document as any).modelContext = mc.modelContext;
    try {
      const editor = grapesjs.init({ headless: true, storageManager: false, plugins: [(ed) => webMcpPlugin(ed, {})] });
      editor.getModel().set('readyCanvas', true);
      editor.getModel().trigger('load', editor);
      await flush();
      expect(mc.tools.size).toBeGreaterThan(0);
      editor.destroy();
      expect(mc.tools.size).toBe(0);
    } finally {
      delete (document as any).modelContext;
    }
  });

  test('Multiple editors with different prefixes', async () => {
    const mc = createModelContext();
    const create = (prefix: string) => {
      const editor = grapesjs.init({
        headless: true,
        storageManager: false,
        plugins: [(ed) => webMcpPlugin(ed, { modelContext: mc.modelContext, toolPrefix: prefix })],
      });
      editor.getModel().set('readyCanvas', true);
      editor.getModel().trigger('load', editor);
      return editor;
    };
    const ed1 = create('ed1_');
    const ed2 = create('ed2_');
    await flush();
    ed1.addComponents('<div id="one">One</div>');
    expect((await mc.call('ed1_get_components', { ids: ['one'] })).items[0].id).toBe('one');
    expect(await mc.call('ed2_get_components', { ids: ['one'] })).toMatchObject({ error: { code: 'not_found' } });
    ed1.destroy();
    expect([...mc.tools.keys()].every((name) => name.startsWith('ed2_'))).toBe(true);
    ed2.destroy();
    expect(mc.tools.size).toBe(0);
  });

  test('Plugin removal unregisters only its tools', async () => {
    const mc = createModelContext();
    const editor = grapesjs.init({ headless: true, storageManager: false });
    const Plugins = (editor as any).Plugins;
    const plugin = Plugins.add({
      id: 'webmcp',
      plugin: (ed: any) => webMcpPlugin(ed, { modelContext: mc.modelContext }),
    });
    editor.getModel().set('readyCanvas', true);
    editor.getModel().trigger('load', editor);
    await flush();
    mc.tools.set('other_tool', { ...customTool, name: 'other_tool' } as any);
    expect(mc.tools.size).toBeGreaterThan(1);
    Plugins.remove(plugin);
    expect([...mc.tools.keys()]).toEqual(['other_tool']);
    editor.destroy();
  });

  test('Plugin removal before editor load unregisters the tools', async () => {
    const mc = createModelContext();
    const editor = grapesjs.init({ headless: true, storageManager: false });
    const plugin = editor.Plugins.add({
      id: 'webmcp',
      plugin: (ed: any) => webMcpPlugin(ed, { modelContext: mc.modelContext }),
    });
    // Removed while the registrations are still pending
    editor.Plugins.remove(plugin!);
    await flush();
    expect(mc.registerTool).toHaveBeenCalled();
    expect(mc.tools.size).toBe(0);
    editor.destroy();
  });
});
