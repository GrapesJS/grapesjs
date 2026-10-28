import type { Editor, Plugin } from 'grapesjs';
import { getModelContext, registerTools, ToolsRegistration } from './registry';
import { createDefaultTools } from './tools';
import type { WebMcpPluginOptions, WebMcpTool, WebMcpToolExecuteOptions } from './types';
import { ToolError } from './utils';

export * from './types';
export { createDefaultTools } from './tools';
export { ToolNames } from './tools/names';
export { getModelContext, registerTools } from './registry';
export { createTool, ToolError } from './utils';
export type { CreateToolProps } from './utils';

const LOG_NS = 'webmcp';

const toErrorResult = (error: unknown) => {
  const err = error as ToolError;
  return {
    error: {
      code: err?.code || 'execution_error',
      message: err?.message || String(error),
    },
  };
};

/**
 * Validate the catalog and prepare tools for registration (prefix + error handling).
 */
export const prepareTools = (tools: WebMcpTool[], prefix = ''): WebMcpTool[] => {
  const names = new Set<string>();

  return tools.map((tool, index) => {
    if (!tool || typeof tool !== 'object') throw new Error(`Invalid tool at index ${index}`);
    const { name, description, execute } = tool;
    if (!name || typeof name !== 'string') throw new Error(`Tool at index ${index} is missing a name`);
    if (!description) throw new Error(`Tool "${name}" is missing a description`);
    if (typeof execute !== 'function') throw new Error(`Tool "${name}" is missing the execute function`);

    const fullName = `${prefix}${name}`;
    if (names.has(fullName)) throw new Error(`Duplicate tool name "${fullName}"`);
    names.add(fullName);

    return {
      ...tool,
      name: fullName,
      inputSchema: tool.inputSchema || { type: 'object', properties: {} },
      // Return errors as data, so the agent can read the reason and recover
      execute: async (input: any, options?: WebMcpToolExecuteOptions) => {
        try {
          const result = await execute(input ?? {}, options);
          return result === undefined ? { ok: true } : result;
        } catch (error) {
          return toErrorResult(error);
        }
      },
    };
  });
};

/**
 * Expose GrapesJS editor APIs as WebMCP tools for browser AI agents.
 * The plugin stays inactive when WebMCP is not available in the page.
 * @example
 * grapesjs.init({
 *   plugins: [
 *     editor => webMcpPlugin(editor, {
 *       getTools: ({ tools }) => tools.filter(tool => tool.name !== ToolNames.loadProjectData),
 *     }),
 *   ],
 * });
 */
export const webMcpPlugin: Plugin<WebMcpPluginOptions> = (editor: Editor, opts = {}) => {
  const { toolPrefix = 'grapesjs_', getTools, defaultLimit = 50, instructions } = opts;
  let registration: ToolsRegistration | undefined;
  let disposed = false;

  const log = (msg: string, level = 'warning') => editor.log(msg, { ns: LOG_NS, level });

  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    registration?.unregister();
    registration = undefined;
    editor.off('destroy', cleanup);
  };

  editor.on('destroy', cleanup);

  editor.onReady(() => {
    if (disposed) return;
    const modelContext = opts.modelContext || getModelContext();
    if (!modelContext) return;

    let tools: WebMcpTool[];

    try {
      const defaultTools = createDefaultTools({ editor, defaultLimit, toolPrefix, instructions });
      const catalog = getTools ? getTools({ editor, tools: defaultTools }) : defaultTools;
      if (!Array.isArray(catalog)) throw new Error('`getTools` must return an array of tools');
      tools = prepareTools(catalog, toolPrefix);
    } catch (error) {
      log(`Unable to create WebMCP tools: ${(error as Error).message}`, 'error');
      return;
    }

    if (!tools.length) return;

    const current = registerTools(modelContext, tools);
    registration = current;
    current.ready.catch((error) => {
      if (registration === current) registration = undefined;
      !disposed && log(`Unable to register WebMCP tools: ${error?.message || error}`, 'error');
    });
  });

  // Plugin cleanup handler (used by `editor.Plugins.remove`)
  return ({ cleanup: builtInCleanup }) => {
    cleanup();
    builtInCleanup();
  };
};

export default webMcpPlugin;
