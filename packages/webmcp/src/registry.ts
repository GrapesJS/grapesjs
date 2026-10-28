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

export interface ToolRegistration {
  /** Resolves once the tool is registered. */
  ready: Promise<void>;
  /** Unregister the tool. Safe to call multiple times, also while the registration is pending. */
  unregister: () => void;
}

export interface ToolsRegistration {
  /** Resolves once all tools are registered, rejects (after rolling back) on failure. */
  ready: Promise<void>;
  /** Unregister all the tools of this registration. Safe to call multiple times. */
  unregister: () => void;
}

/**
 * Register a single tool and return its registration, used to remove only this tool.
 */
export const registerTool = (modelContext: ModelContextLike, tool: WebMcpTool): ToolRegistration => {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
  let disposed = false;
  let handle: unknown;
  let ready: Promise<void>;

  const unregisterLegacy = () => {
    try {
      // Legacy: registerTool returned a handle with `unregister`, or the context exposes `unregisterTool`
      if (handle && typeof (handle as any).unregister === 'function') {
        (handle as any).unregister();
      } else if (typeof modelContext.unregisterTool === 'function') {
        const res = modelContext.unregisterTool(tool.name);
        isThenable(res) && Promise.resolve(res).catch(() => {});
      }
    } catch {
      // The tool might be already gone (eg. unregistered by the abort signal)
    }
  };

  try {
    const result = modelContext.registerTool(tool, { signal: controller?.signal });
    ready = Promise.resolve(result).then((res) => {
      handle = res;
      // Unregistered while the registration was pending
      disposed && unregisterLegacy();
    });
  } catch (error) {
    return { ready: Promise.reject(error), unregister: () => {} };
  }

  let settled = false;
  ready.then(
    () => (settled = true),
    () => (settled = true),
  );

  return {
    ready,
    unregister: () => {
      if (disposed) return;
      disposed = true;
      // Current draft: aborting the signal unregisters the tool
      controller?.abort();
      settled && unregisterLegacy();
    },
  };
};

/**
 * Register tools one by one (never replacing the whole page catalog) and return
 * a cleanup that removes only the tools registered here.
 */
export const registerTools = (modelContext: ModelContextLike, tools: WebMcpTool[]): ToolsRegistration => {
  const registrations: ToolRegistration[] = [];
  let disposed = false;

  const unregister = () => {
    if (disposed) return;
    disposed = true;
    registrations
      .splice(0)
      .reverse()
      .forEach((reg) => reg.unregister());
  };

  const ready = (async () => {
    try {
      for (const tool of tools) {
        if (disposed) return;
        const registration = registerTool(modelContext, tool);
        registrations.push(registration);
        await registration.ready;
      }
    } catch (error) {
      unregister();
      throw error;
    }
  })();

  return { ready, unregister };
};
