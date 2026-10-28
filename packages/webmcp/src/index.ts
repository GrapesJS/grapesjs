import type { Editor, Plugin } from 'grapesjs';
import { WebMcpManager } from './manager';
import { createDefaultTools } from './tools';
import { WEBMCP_MANAGER_COMMAND, WebMcpPluginOptions } from './types';

export { WebMcpManager } from './manager';
export type { WebMcpManagerOptions } from './manager';
export { getModelContext, registerTool, registerTools } from './registry';
export type { ToolRegistration, ToolsRegistration } from './registry';
export { createDefaultTools } from './tools';
export { ToolNames } from './tools/names';
export * from './types';
export { createTool, ToolError } from './utils';
export type { CreateToolProps } from './utils';

/**
 * Expose GrapesJS editor APIs as WebMCP tools for browser AI agents.
 * The plugin stays inactive when WebMCP is not available in the page, tools can still
 * be managed and executed via the `webMcpManager` command.
 * @example
 * grapesjs.init({
 *   plugins: [
 *     editor => webMcpPlugin(editor, {
 *       getTools: ({ tools }) => tools.filter(tool => tool.name !== ToolNames.loadProjectData),
 *     }),
 *   ],
 * });
 *
 * const webmcp = editor.runCommand('webMcpManager');
 */
export const webMcpPlugin: Plugin<WebMcpPluginOptions> = (editor: Editor, opts = {}) => {
  const { toolPrefix = 'grapesjs_', getTools, defaultLimit = 50, instructions, modelContext } = opts;
  const manager = new WebMcpManager(editor, { toolPrefix, modelContext });
  let disposed = false;

  editor.Commands.add(WEBMCP_MANAGER_COMMAND, () => manager);

  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    manager.destroy();
    editor.Commands.remove(WEBMCP_MANAGER_COMMAND);
    editor.off('destroy', cleanup);
  };

  editor.on('destroy', cleanup);

  // Tools resolve the editor state on execution, so they can be registered right away
  try {
    const defaultTools = createDefaultTools({ editor, defaultLimit, toolPrefix, instructions });
    const catalog = getTools ? getTools({ editor, tools: defaultTools }) : defaultTools;
    if (!Array.isArray(catalog)) throw new Error('`getTools` must return an array of tools');
    manager.addTools(catalog);
  } catch (error) {
    editor.log(`Unable to create WebMCP tools: ${(error as Error).message}`, { ns: 'webmcp', level: 'error' });
  }

  manager.connect();

  // Plugin cleanup handler (used by `editor.Plugins.remove`)
  return ({ cleanup: builtInCleanup }) => {
    cleanup();
    builtInCleanup();
  };
};

export default webMcpPlugin;
