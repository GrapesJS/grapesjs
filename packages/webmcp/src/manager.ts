import type { Editor } from 'grapesjs';
import { getModelContext, registerTool, ToolRegistration } from './registry';
import { ModelContextLike, WebMcpEvents, WebMcpTool, WebMcpToolExecuteOptions } from './types';
import { ToolError } from './utils';

const LOG_NS = 'webmcp';

export interface WebMcpManagerOptions {
  /** Prefix applied to the tool names exposed via WebMCP. */
  toolPrefix?: string;
  /** Custom `ModelContext`, by default `document.modelContext` (or the legacy `navigator.modelContext`). */
  modelContext?: ModelContextLike;
}

interface ToolEntry {
  tool: WebMcpTool;
  /** Tool exposed via WebMCP: prefixed name, events and errors returned as data. */
  exposed: WebMcpTool;
  registration?: ToolRegistration;
}

const toErrorResult = (error: unknown) => {
  const err = error as ToolError;
  return {
    error: {
      code: err?.code || 'execution_error',
      message: err?.message || String(error),
    },
  };
};

const validateTool = (tool: WebMcpTool) => {
  if (!tool || typeof tool !== 'object') throw new Error('Invalid tool');
  const { name, description, execute } = tool;
  if (!name || typeof name !== 'string') throw new Error('Tool is missing a name');
  if (!description) throw new Error(`Tool "${name}" is missing a description`);
  if (typeof execute !== 'function') throw new Error(`Tool "${name}" is missing the execute function`);
};

/**
 * Manage the tools of an editor: add, remove and execute them. Tools are registered
 * in WebMCP (when available) once the manager is connected.
 * Tool names are always without the prefix, which is only applied to the names exposed via WebMCP.
 * @example
 * const webmcp = editor.runCommand('webMcpManager');
 * webmcp.addTool({ name: 'say_hello', description: 'Say hello', execute: () => 'Hello' });
 * await webmcp.executeTool('say_hello');
 * webmcp.removeTool('say_hello');
 */
export class WebMcpManager {
  editor: Editor;
  toolPrefix: string;
  private entries = new Map<string, ToolEntry>();
  private modelContext?: ModelContextLike;
  private connected = false;
  private customModelContext?: ModelContextLike;

  constructor(editor: Editor, opts: WebMcpManagerOptions = {}) {
    this.editor = editor;
    this.toolPrefix = opts.toolPrefix ?? 'grapesjs_';
    this.customModelContext = opts.modelContext;
  }

  /**
   * Get all the tools.
   */
  getTools(): WebMcpTool[] {
    return [...this.entries.values()].map((entry) => entry.tool);
  }

  /**
   * Get a tool by name.
   */
  getTool(name: string): WebMcpTool | undefined {
    return this.entries.get(name)?.tool;
  }

  /**
   * Check if the tool exists.
   */
  hasTool(name: string) {
    return this.entries.has(name);
  }

  /**
   * Add a tool, registered right away in WebMCP if the manager is connected.
   * Throws if the tool is invalid or its name is already used.
   */
  addTool(tool: WebMcpTool) {
    this.addTools([tool]);
    return tool;
  }

  /**
   * Add multiple tools. Throws, without adding any tool, if one of them is invalid or its name is already used.
   */
  addTools(tools: WebMcpTool[]) {
    const names = new Set<string>();

    tools.forEach((tool) => {
      validateTool(tool);
      if (this.entries.has(tool.name) || names.has(tool.name)) {
        throw new Error(`Duplicate tool name "${tool.name}"`);
      }
      names.add(tool.name);
    });

    tools.forEach((tool) => {
      const entry: ToolEntry = { tool, exposed: this.createExposedTool(tool) };
      this.entries.set(tool.name, entry);
      this.register(entry);
      this.editor.trigger(WebMcpEvents.toolAdd, { tool });
    });

    return tools;
  }

  /**
   * Remove a tool, also from WebMCP. Returns `false` if the tool doesn't exist.
   */
  removeTool(name: string) {
    const entry = this.entries.get(name);
    if (!entry) return false;

    entry.registration?.unregister();
    this.entries.delete(name);
    this.editor.trigger(WebMcpEvents.toolRemove, { tool: entry.tool });
    return true;
  }

  /**
   * Execute a tool, as an agent would do. The input is validated (for tools created with `createTool`)
   * and errors are returned as data (`{ error: { code, message } }`).
   * Throws if the tool doesn't exist.
   */
  executeTool(name: string, input: Record<string, any> = {}, options?: WebMcpToolExecuteOptions) {
    const entry = this.entries.get(name);
    if (!entry) throw new Error(`Tool "${name}" not found`);
    return entry.exposed.execute(input, options);
  }

  /**
   * Register the current and future tools in WebMCP. Without WebMCP, tools are only available via `executeTool`.
   */
  connect() {
    if (this.connected) return;
    this.connected = true;
    this.modelContext = this.customModelContext || getModelContext();
    this.entries.forEach((entry) => this.register(entry));
  }

  /**
   * Remove all the tools, also from WebMCP.
   */
  destroy() {
    [...this.entries.keys()].forEach((name) => this.removeTool(name));
    this.connected = false;
    this.modelContext = undefined;
  }

  private register(entry: ToolEntry) {
    const { modelContext } = this;
    if (!this.connected || !modelContext || entry.registration) return;

    const registration = registerTool(modelContext, entry.exposed);
    entry.registration = registration;
    registration.ready.catch((error) => {
      if (entry.registration !== registration) return;
      entry.registration = undefined;
      this.editor.log(`Unable to register the WebMCP tool "${entry.exposed.name}": ${error?.message || error}`, {
        ns: LOG_NS,
        level: 'error',
      });
    });
  }

  private createExposedTool(tool: WebMcpTool): WebMcpTool {
    const { editor } = this;
    const { name, execute } = tool;

    return {
      ...tool,
      name: `${this.toolPrefix}${name}`,
      inputSchema: tool.inputSchema || { type: 'object', properties: {} },
      execute: async (data?: any, options?: WebMcpToolExecuteOptions) => {
        const input = data ?? {};
        editor.trigger(WebMcpEvents.toolExecuteBefore, { name, input });
        let result: unknown;

        try {
          result = await execute(input, options);
          if (result === undefined) result = { ok: true };
        } catch (error) {
          // Return errors as data, so the agent can read the reason and recover
          result = toErrorResult(error);
          editor.trigger(WebMcpEvents.toolExecute, { name, input, result, error });
          return result;
        }

        editor.trigger(WebMcpEvents.toolExecute, { name, input, result });
        return result;
      },
    };
  }
}
