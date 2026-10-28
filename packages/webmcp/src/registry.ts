import type { ModelContextLike, WebMcpTool } from './types';

/**
 * Find the WebMCP `ModelContext` of the current page.
 * The current draft exposes it on `document`, earlier implementations on `navigator`.
 */
export const getModelContext = (): ModelContextLike | undefined => {
  const doc = typeof document !== 'undefined' ? (document as any) : undefined;
  const nav = typeof navigator !== 'undefined' ? (navigator as any) : undefined;

  if (typeof doc?.modelContext?.registerTool === 'function') return doc.modelContext;
  if (typeof nav?.modelContext?.registerTool === 'function') return nav.modelContext;
};

const isThenable = (value: unknown): value is PromiseLike<unknown> =>
  !!value && typeof (value as any).then === 'function';

interface RegisteredEntry {
  name: string;
  controller?: AbortController;
  handle?: unknown;
}

export interface ToolsRegistration {
  /** Resolves once all tools are registered, rejects (after rolling back) on failure. */
  ready: Promise<void>;
  /** Unregister all the tools of this registration. Safe to call multiple times. */
  unregister: () => void;
}

/**
 * Register tools one by one (never replacing the whole page catalog) and return
 * a cleanup that removes only the tools registered here.
 */
export const registerTools = (modelContext: ModelContextLike, tools: WebMcpTool[]): ToolsRegistration => {
  const entries: RegisteredEntry[] = [];
  let disposed = false;

  const unregisterEntry = (entry: RegisteredEntry) => {
    // Current draft: aborting the signal unregisters the tool
    entry.controller?.abort();

    try {
      const { handle } = entry;
      // Legacy: registerTool returned a handle with `unregister`, or the context exposes `unregisterTool`
      if (handle && typeof (handle as any).unregister === 'function') {
        (handle as any).unregister();
      } else if (typeof modelContext.unregisterTool === 'function') {
        const res = modelContext.unregisterTool(entry.name);
        isThenable(res) && Promise.resolve(res).catch(() => {});
      }
    } catch {
      // The tool might be already gone (eg. unregistered by the abort signal)
    }
  };

  const unregister = () => {
    if (disposed) return;
    disposed = true;
    entries.splice(0).reverse().forEach(unregisterEntry);
  };

  const registerOne = async (tool: WebMcpTool) => {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
    const entry: RegisteredEntry = { name: tool.name, controller };
    const result = modelContext.registerTool(tool, { signal: controller?.signal });
    entries.push(entry);
    entry.handle = isThenable(result) ? await result : result;

    // Unregistered while the registration was pending
    if (disposed) unregisterEntry(entry);
  };

  const ready = (async () => {
    try {
      for (const tool of tools) {
        if (disposed) return;
        await registerOne(tool);
      }
    } catch (error) {
      unregister();
      throw error;
    }
  })();

  return { ready, unregister };
};
