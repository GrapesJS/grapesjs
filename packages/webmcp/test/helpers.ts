import grapesjs, { Editor, EditorConfig } from 'grapesjs';
import webMcpPlugin, { WebMcpPluginOptions } from '../src';
import type { ModelContextLike } from '../src/types';

export interface RegisteredTool {
  name: string;
  description: string;
  inputSchema?: Record<string, any>;
  annotations?: Record<string, any>;
  execute: (input?: any, options?: any) => Promise<any>;
}

/**
 * In-memory ModelContext following the current WebMCP draft (unregister via abort signal).
 */
export const createModelContext = () => {
  const tools = new Map<string, RegisteredTool>();
  const registerTool = jest.fn((tool: RegisteredTool, opts: { signal?: AbortSignal } = {}) => {
    if (tools.has(tool.name)) throw new Error(`Tool "${tool.name}" already registered`);
    if (opts.signal?.aborted) return Promise.reject(opts.signal.reason);
    tools.set(tool.name, tool);
    opts.signal?.addEventListener('abort', () => tools.get(tool.name) === tool && tools.delete(tool.name));
    return Promise.resolve();
  });

  const call = (name: string, input: any = {}, options?: any) => {
    const tool = tools.get(name);
    if (!tool) throw new Error(`Tool "${name}" not registered`);
    return tool.execute(input, options);
  };

  return { tools, registerTool, call, modelContext: { registerTool } as ModelContextLike };
};

export const flush = (ms = 0) => new Promise((res) => setTimeout(res, ms));

export const waitReady = (editor: Editor) => new Promise<void>((res) => editor.onReady(() => res()));

export const createEditor = async (
  pluginOpts: WebMcpPluginOptions = {},
  config: EditorConfig = {},
): Promise<{ editor: Editor; mc: ReturnType<typeof createModelContext> }> => {
  const mc = createModelContext();
  const editor = grapesjs.init({
    headless: true,
    storageManager: false,
    undoManager: { trackSelection: false },
    protectedCss: '',
    ...config,
    plugins: [(ed) => webMcpPlugin(ed, { modelContext: mc.modelContext, ...pluginOpts })],
  });
  // There is no canvas/view in headless mode, emulate the editor load
  const em = editor.getModel();
  em.set('readyCanvas', true);
  em.trigger('load', editor);
  await waitReady(editor);
  await flush();
  return { editor, mc };
};
