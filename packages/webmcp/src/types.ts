import type { Editor } from 'grapesjs';
import type { WebMcpManager } from './manager';

/**
 * JSON Schema object describing the tool input.
 */
export type JsonSchema = Record<string, any>;

/**
 * Hints that help the agent (and the browser) to decide how to treat a tool call.
 * Mirrors the `ToolAnnotations` dictionary of the WebMCP draft.
 */
export interface WebMcpToolAnnotations {
  /** The tool doesn't change any editor state. */
  readOnlyHint?: boolean;
  /** The tool performs a change that is hard to revert (eg. removes content or replaces the project). */
  consequentialHint?: boolean;
  /** The result might contain content not controlled by the site (eg. user-authored HTML). */
  untrustedContentHint?: boolean;
  [key: string]: unknown;
}

export interface WebMcpToolExecuteOptions {
  /** Aborted when the agent cancels the call. */
  signal?: AbortSignal;
  [key: string]: unknown;
}

export type WebMcpToolExecute<I = any, R = unknown> = (input: I, options?: WebMcpToolExecuteOptions) => R | Promise<R>;

/**
 * WebMCP tool definition.
 */
export interface WebMcpTool<I = any, R = unknown> {
  /** Tool name, without the `toolPrefix` (applied during registration). */
  name: string;
  title?: string;
  description: string;
  inputSchema?: JsonSchema;
  annotations?: WebMcpToolAnnotations;
  execute: WebMcpToolExecute<I, R>;
}

export interface GetToolsContext {
  editor: Editor;
  /** Default tools, already bound to the editor. */
  tools: WebMcpTool[];
}

export interface ModelContextRegisterOptions {
  signal?: AbortSignal;
  [key: string]: unknown;
}

/**
 * Minimal shape of the WebMCP `ModelContext` used by the plugin.
 * Covers the current draft (`document.modelContext`, unregister via abort signal)
 * and the legacy one (`navigator.modelContext`, `unregisterTool`).
 */
export interface ModelContextLike {
  registerTool(tool: Record<string, any>, options?: ModelContextRegisterOptions): unknown;
  unregisterTool?(name: string): unknown;
}

export interface WebMcpPluginOptions {
  /**
   * Prefix applied to every tool name (including custom tools), useful to distinguish
   * multiple editors on the same page.
   * @default 'grapesjs_'
   */
  toolPrefix?: string;

  /**
   * Customize the tool catalog. Receives the default tools and returns the complete
   * list of tools to register. Return an empty array to disable all tools.
   * @example
   * getTools: ({ tools }) => tools.filter(tool => tool.name !== ToolNames.loadProjectData)
   */
  getTools?: (ctx: GetToolsContext) => WebMcpTool[];

  /**
   * Max number of items returned by list/tree tools when the agent doesn't specify a limit.
   * @default 50
   */
  defaultLimit?: number;

  /**
   * Project-specific instructions for the agent (eg. design rules or content to preserve).
   * WebMCP has no page-level instructions, so when provided, they are exposed through
   * the read-only `get_editor_guide` tool (`ToolNames.getEditorGuide`).
   * @example
   * instructions: 'Use only the classes of the design system, never remove the header.'
   */
  instructions?: string;

  /**
   * Custom `ModelContext` implementation. By default, the plugin uses
   * `document.modelContext` or the legacy `navigator.modelContext`.
   */
  modelContext?: ModelContextLike;
}

export interface WebMcpToolsContext {
  editor: Editor;
  defaultLimit: number;
  /** Prefix used to reference other tools in descriptions and in the guide. */
  toolPrefix: string;
  /** Project instructions, the guide tool is added only when provided. */
  instructions?: string;
}

/**{START_EVENTS}*/
export enum WebMcpEvents {
  /**
   * @event `webmcp:tool:add` Tool added to the manager.
   * @example
   * editor.on('webmcp:tool:add', ({ tool }) => { ... });
   */
  toolAdd = 'webmcp:tool:add',

  /**
   * @event `webmcp:tool:remove` Tool removed from the manager.
   * @example
   * editor.on('webmcp:tool:remove', ({ tool }) => { ... });
   */
  toolRemove = 'webmcp:tool:remove',

  /**
   * @event `webmcp:tool:execute:before` Tool execution started (by an agent or via `executeTool`).
   * @example
   * editor.on('webmcp:tool:execute:before', ({ name, input }) => { ... });
   */
  toolExecuteBefore = 'webmcp:tool:execute:before',

  /**
   * @event `webmcp:tool:execute` Tool execution ended. `result` is what the agent receives,
   * `error` is set when the execution failed.
   * @example
   * editor.on('webmcp:tool:execute', ({ name, input, result, error }) => { ... });
   */
  toolExecute = 'webmcp:tool:execute',
}
/**{END_EVENTS}*/

export interface WebMcpToolEventData {
  tool: WebMcpTool;
}

export interface WebMcpToolExecuteBeforeEventData {
  /** Tool name (without the prefix). */
  name: string;
  input: any;
}

export interface WebMcpToolExecuteEventData extends WebMcpToolExecuteBeforeEventData {
  result: unknown;
  error?: unknown;
}

export interface WebMcpEventCallback {
  [WebMcpEvents.toolAdd]: [WebMcpToolEventData];
  [WebMcpEvents.toolRemove]: [WebMcpToolEventData];
  [WebMcpEvents.toolExecuteBefore]: [WebMcpToolExecuteBeforeEventData];
  [WebMcpEvents.toolExecute]: [WebMcpToolExecuteEventData];
}

/**
 * Command returning the `WebMcpManager` of the editor.
 * @example
 * const webmcp = editor.runCommand('webMcpManager');
 */
export const WEBMCP_MANAGER_COMMAND = 'webMcpManager';

declare module 'grapesjs' {
  interface CommandRegistryRun {
    [WEBMCP_MANAGER_COMMAND]: () => WebMcpManager;
  }

  interface EditorEventCallbacks extends WebMcpEventCallback {}
}
