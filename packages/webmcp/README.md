# GrapesJS WebMCP

Expose the GrapesJS editor API as [WebMCP](https://webmachinelearning.github.io/webmcp/) tools, so AI agents running in the browser can inspect and edit any GrapesJS editor: read the component tree, insert blocks, update styles and traits, manage pages, undo changes and more.

> **Experimental**: WebMCP is an evolving draft and browser support is limited. The plugin stays inactive when WebMCP isn't available in the page.

## Install

```sh
npm i @grapesjs/webmcp
```

## Usage

```js
import grapesjs from 'grapesjs';
import webMcpPlugin from '@grapesjs/webmcp';

grapesjs.init({
  container: '#gjs',
  plugins: [webMcpPlugin],
});
```

With options:

```js
import webMcpPlugin, { ToolNames } from '@grapesjs/webmcp';

grapesjs.init({
  container: '#gjs',
  plugins: [
    (editor) =>
      webMcpPlugin(editor, {
        toolPrefix: 'grapesjs_',
        getTools: ({ editor, tools }) => [
          ...tools.filter((tool) => tool.name !== ToolNames.loadProjectData),
          // Custom WebMCP tool definitions
        ],
      }),
  ],
});
```

From a CDN (`window.grapesjsWebMcp`):

```html
<script src="https://unpkg.com/grapesjs"></script>
<script src="https://unpkg.com/@grapesjs/webmcp"></script>
<script>
  grapesjs.init({
    container: '#gjs',
    plugins: [(editor) => grapesjsWebMcp.default(editor, {})],
  });
</script>
```

## Options

| Option         | Description                                                                                                                        | Default                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `toolPrefix`   | Prefix applied to every tool name, including custom tools. Use distinct prefixes when multiple editors live on the same page.      | `'grapesjs_'`                                                    |
| `getTools`     | `({ editor, tools }) => WebMcpTool[]`. Receives the default tools and returns the complete catalog to register. `[]` disables all. | All the default tools                                            |
| `defaultLimit` | Max number of items returned by list/search tools when the agent doesn't pass a `limit`.                                           | `50`                                                             |
| `instructions` | Project-specific instructions for the agent. When provided, they are exposed through the `get_editor_guide` tool.                  |                                                                  |
| `modelContext` | Custom `ModelContext` implementation.                                                                                              | `document.modelContext` (or the legacy `navigator.modelContext`) |

## Default tools

Names are listed without the prefix (eg. `get_component_tree` is registered as `grapesjs_get_component_tree`).

| Module (file)                    | Tools                                                                                                                                                                                                                                                    |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Guide (`guide.ts`)               | `get_editor_guide` (only with `instructions`)                                                                                                                                                                                                            |
| Editor (`editor.ts`)             | `get_editor_state` (selection, active page/device, unsaved changes count, undo/redo availability), `get_page_code`, `get_project_data`, `load_project_data`                                                                                              |
| Components (`components.ts`)     | `get_component_tree`, `get_component`, `find_components`, `list_component_types`, `select_components`, `add_components`, `update_component`, `clone_component`, `move_component`, `remove_components`, `set_component_style`, `update_component_classes` |
| CSS rules (`css.ts`)             | `get_css_rules`, `set_css_rule`, `remove_css_rule` (with state and media/at-rule support)                                                                                                                                                                |
| Blocks (`blocks.ts`)             | `list_blocks`, `get_block`, `insert_block`                                                                                                                                                                                                               |
| Traits (`traits.ts`)             | `get_component_traits`, `update_component_traits`                                                                                                                                                                                                        |
| Pages (`pages.ts`)               | `list_pages`, `add_page`, `rename_page`, `select_page`, `remove_page`                                                                                                                                                                                    |
| Devices (`devices.ts`)           | `list_devices`, `select_device`                                                                                                                                                                                                                          |
| Assets (`assets.ts`)             | `list_assets`, `add_assets` (by URL), `remove_assets`                                                                                                                                                                                                    |
| Undo manager (`undo_manager.ts`) | `undo`, `redo`                                                                                                                                                                                                                                           |

How the tools behave:

- They use the public GrapesJS APIs, so changes go through the usual events, undo history and storage (eg. your autosave keeps working).
- Components are addressed by the ids returned by the inspection tools. Ids are resolved on each call: stale ids (eg. removed components) return a clear error.
- Inputs are validated (with [zod](https://zod.dev)) before any change. Structural operations respect component constraints (`draggable`, `droppable`, `removable`, `copyable`) and moving a component inside itself or its descendants is rejected.
- Results are plain JSON. Lists are paginated (`limit`/`offset`, with `total` and `hasMore`) and the tree is bounded (`depth`/`maxNodes`, with `truncated`).
- Read-only tools are marked with `readOnlyHint`, destructive ones (removals, project replacement) with `consequentialHint`.
- Errors are returned as data, so the agent can read the reason and recover: `{ "error": { "code": "not_found", "message": "..." } }`.
- Not included by default: arbitrary method calls, JavaScript evaluation, storage operations, publishing and file uploads. Add custom tools if you need them.

## Agent instructions

WebMCP has no page-level instructions: the agent only sees the registered tools and their descriptions. To give the agent project-specific rules, pass `instructions`:

```js
webMcpPlugin(editor, {
  instructions: 'Use only the classes of the design system. Never remove the header and footer.',
});
```

They are returned by a read-only `get_editor_guide` tool, and `get_editor_state` and `get_component_tree` (usually the first tools an agent calls) point to it in their descriptions. Without `instructions`, the tool isn't registered.

## Customize tools

Default tool names (without the prefix) are available in the exported `ToolNames` enum, eg. `ToolNames.loadProjectData` is `'load_project_data'`. Prefer it over plain strings, so renamed or removed tools are caught by TypeScript.

`getTools` runs once, when the editor is ready. Default tools are already bound to the editor and resolve the current editor state on every call.

### Filter

```js
webMcpPlugin(editor, {
  // Read-only access
  getTools: ({ tools }) => tools.filter((tool) => tool.annotations?.readOnlyHint),
});
```

### Wrap

```js
webMcpPlugin(editor, {
  getTools: ({ tools }) =>
    tools.map((tool) =>
      tool.name === ToolNames.removeComponents
        ? {
            ...tool,
            description: `${tool.description} Ask the user for confirmation first.`,
            execute: async (input, options) => {
              console.log('Agent removing', input.ids);
              return tool.execute(input, options);
            },
          }
        : tool,
    ),
});
```

Default tools validate their input strictly (unknown properties are rejected). If you extend the `inputSchema` of a default tool with your own properties, remove them before calling the original `execute`:

```js
execute: async ({ notify, ...input }, options) => {
  const result = await tool.execute(input, options);
  notify && showToast('Component updated');
  return result;
},
```

### Add custom tools

```js
webMcpPlugin(editor, {
  getTools: ({ editor, tools }) => [
    ...tools,
    {
      name: 'save_project',
      description: 'Save the project to the server.',
      inputSchema: { type: 'object', properties: {} },
      execute: async () => {
        await editor.store();
        return { saved: true };
      },
    },
  ],
});
```

A tool has `name`, `description`, `inputSchema` (JSON Schema), optional `title`/`annotations` and `execute(input, { signal })`. Thrown errors are returned to the agent as `{ error }`. Custom tools defined this way are not validated by the plugin, check the input in `execute`.

#### With zod

Optionally, use `createTool` with a [`zod/mini`](https://zod.dev/packages/mini) schema (the same approach used by the default tools): the `inputSchema` is generated from it, and the input is validated and typed before `execute` runs.

```js
import * as z from 'zod/mini';
import webMcpPlugin, { createTool } from '@grapesjs/webmcp';

webMcpPlugin(editor, {
  getTools: ({ editor, tools }) => [
    ...tools,
    createTool({
      name: 'save_project',
      description: 'Save the project to the server.',
      input: z.strictObject({
        reason: z.optional(z.string().check(z.describe('Why the project is saved'))),
      }),
      execute: async ({ reason }) => {
        await editor.store({ reason });
        return { saved: true };
      },
    }),
  ],
});
```

Invalid inputs are returned to the agent as `{ error: { code: 'invalid_input', message: 'input.reason must be of type string' } }`.

### Disable all tools

```js
webMcpPlugin(editor, { getTools: () => [] });
```

### Multiple editors

```js
grapesjs.init({ container: '#header-editor', plugins: [(ed) => webMcpPlugin(ed, { toolPrefix: 'header_' })] });
grapesjs.init({ container: '#body-editor', plugins: [(ed) => webMcpPlugin(ed, { toolPrefix: 'body_' })] });
```

### Reuse the tools

`createDefaultTools`, `createTool`, `registerTools` and `getModelContext` are exported in case you need to build your own integration.

## Lifecycle

- Tools are registered one by one when the editor is ready, without replacing other tools of the page.
- They are unregistered on `editor.destroy()` and when the plugin is removed (`editor.Plugins.remove`). Only the tools of that plugin instance are removed.
- If a registration fails, the already registered tools of that instance are rolled back and the error is reported through the editor logger.

## Browser setup

- WebMCP requires a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) (HTTPS or `localhost`) and a browser/agent supporting it.
- Register the editor in the **top-level page**. Agents like the [ChatGPT browser](https://learn.chatgpt.com/docs/webmcp) only discover tools registered by the top-level document: if your editor lives inside an iframe, its tools won't be visible.
- The plugin supports the current draft (`document.modelContext.registerTool(tool, { signal })`) and the earlier `navigator.modelContext` API with `unregisterTool`.

## Development

```sh
pnpm install
pnpm build:core   # the demo uses the local GrapesJS build
cd packages/webmcp
pnpm start        # demo at http://localhost:8080
pnpm test
pnpm build
```

The demo (`index.html`) shows filtering and a custom tool. When the browser doesn't support WebMCP, it emulates `document.modelContext` so you can try the tools from a side panel (the plugin itself has no polyfill).

## License

BSD-3-Clause
