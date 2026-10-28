# GrapesJS WebMCP

Expose the GrapesJS editor API as [WebMCP](https://webmachinelearning.github.io/webmcp/) tools, so AI agents running in the browser can inspect and edit any GrapesJS editor: read the component tree, insert blocks, update styles, manage pages and more.

> **Experimental**: WebMCP is an evolving draft and browser support is limited. When WebMCP isn't available in the page, nothing is registered, but tools can still be used via the `webMcpManager` command.

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
| `toolPrefix`   | Prefix applied to every tool name, including custom tools.                                                                         | `'grapesjs_'`                                                    |
| `getTools`     | `({ editor, tools }) => WebMcpTool[]`. Receives the default tools and returns the complete catalog to register. `[]` disables all. | All the default tools                                            |
| `defaultLimit` | Max number of items returned by list/search tools when the agent doesn't pass a `limit`.                                           | `50`                                                             |
| `instructions` | Project-specific instructions for the agent. When provided, they are exposed through the `get_editor_guide` tool.                  |                                                                  |
| `modelContext` | Custom `ModelContext` implementation.                                                                                              | `document.modelContext` (or the legacy `navigator.modelContext`) |

## Default tools

Names are listed without the prefix (eg. `get_component_tree` is registered as `grapesjs_get_component_tree`).

| Module     | Tools                                                                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Guide      | `get_editor_guide` (only with `instructions`)                                                                                                                                              |
| Editor     | `get_editor_state`, `get_page_code`, `get_project_data`, `load_project_data`, `undo`, `redo`                                                                                               |
| Components | `get_component_tree`, `get_component`, `select_components`, `add_components`, `update_component`, `move_component`, `remove_components`, `get_component_traits`, `update_component_traits` |
| CSS rules  | `get_css_rules`, `set_css_rules`, `remove_css_rules`                                                                                                                                       |
| Blocks     | `list_blocks`, `get_block`, `insert_block`                                                                                                                                                 |
| Pages      | `list_pages`, `add_page`, `rename_page`, `select_page`, `remove_page`                                                                                                                      |
| Devices    | `list_devices`, `select_device`                                                                                                                                                            |
| Assets     | `list_assets`, `add_assets`, `remove_assets`                                                                                                                                               |

How the tools behave:

- They use the public GrapesJS APIs, so changes go through the usual events, undo history and storage.
- Components are addressed by the ids returned by the inspection tools. Ids are resolved on each call: stale ids (eg. removed components) return a clear error.
- Inputs are validated before any change.
- Results are plain JSON. Lists are paginated (`limit`/`offset`, with `total` and `hasMore`).
- Read-only tools are marked with `readOnlyHint`, destructive ones (removals, project replacement) with `consequentialHint`.
- Errors are returned as data, so the agent can read the reason and recover: `{ "error": { "code": "not_found", "message": "..." } }`.

## Agent instructions

WebMCP has no page-level instructions: the agent only sees the registered tools and their descriptions. To give the agent project-specific rules, pass `instructions`:

```js
webMcpPlugin(editor, {
  instructions: 'Use only the classes of the design system. Never remove the header and footer.',
});
```

They are returned by a read-only `get_editor_guide` tool. Without `instructions`, the tool isn't registered.

## Customize tools

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

Default tools validate their input strictly. If you extend the `inputSchema` of a default tool with your own properties, remove them before calling the original `execute`:

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

A tool has `name`, `description`, `inputSchema` (JSON Schema), optional `title`/`annotations` and `execute(input, { signal })`. Thrown errors are returned to the agent as `{ error }`.

### Disable all tools

```js
webMcpPlugin(editor, { getTools: () => [] });
```

## Manage tools at runtime

The plugin registers the `webMcpManager` command. Use it to add, remove and execute tools after the initialization.

```js
const webmcp = editor.runCommand('webMcpManager');

webmcp.addTool({
  name: 'save_project',
  description: 'Save the project to the server.',
  execute: async () => {
    await editor.store();
    return { saved: true };
  },
});

webmcp.getTools(); // all tools (default and custom)
webmcp.getTool('save_project');
webmcp.removeTool('save_project');

// Execute a tool as an agent would do (eg. from your own in-app assistant)
const result = await webmcp.executeTool('get_component', { id: 'my-id' });
```

- Tool names are always without the `toolPrefix`, which is only applied to the names exposed via WebMCP.
- `addTool`/`addTools` throw if a tool is invalid or its name is already used (`addTools` adds nothing in that case).
- Tools are registered in WebMCP right away, also when added from another plugin during the editor initialization. Without WebMCP in the page, tools are still available via `executeTool`.
- `executeTool` returns exactly what the agent receives: input validated (for tools created with `createTool`) and errors returned as data (`{ error: { code, message } }`). It throws only if the tool doesn't exist.

## Events

| Event                        | Description                                                                              | Data                              |
| ---------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------- |
| `webmcp:tool:add`            | Tool added to the manager                                                                | `{ tool }`                        |
| `webmcp:tool:remove`         | Tool removed from the manager                                                            | `{ tool }`                        |
| `webmcp:tool:execute:before` | Tool execution started, by an agent or via `executeTool`                                 | `{ name, input }`                 |
| `webmcp:tool:execute`        | Tool execution ended. `result` is what the agent receives, `error` is set when it failed | `{ name, input, result, error? }` |

```js
import { WebMcpEvents } from '@grapesjs/webmcp';
// ...
editor.on(WebMcpEvents.toolExecuteBefore, ({ name }) => showAgentIndicator(name));
editor.on(WebMcpEvents.toolExecute, ({ name, error }) => {
  hideAgentIndicator();
  error && console.warn(`Agent tool ${name} failed`, error);
});
```

## Lifecycle

- Tools are registered one by one as soon as the plugin is loaded (without waiting for the editor to be ready), without replacing other tools of the page. Tools resolve the editor state when executed, and `get_editor_state` reports whether the editor is `ready`.
- They are unregistered on `editor.destroy()` and when the plugin is removed (`editor.Plugins.remove`), which also removes the `webMcpManager` command.

## Browser setup

- WebMCP requires a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) (HTTPS or `localhost`) and a browser/agent supporting it.
- Register the editor in the **top-level page**. Agents like the [ChatGPT browser](https://learn.chatgpt.com/docs/webmcp) only discover tools registered by the top-level document: if your editor lives inside an iframe, its tools won't be visible.

## Development

```sh
pnpm install
pnpm build:core   # the demo uses the local GrapesJS build
cd packages/webmcp
pnpm start        # demo at http://localhost:8080
pnpm test
pnpm build
```

## License

BSD-3-Clause
