---
title: Plugins
---

# Plugins

Creating plugins in GrapesJS is pretty straightforward and here you'll get how to achieve it.

::: warning
This guide is referring to GrapesJS v0.21.2 or higher
:::

::: tip
Looking for plugins that are tested, verified, and built to scale? [Browse them all in the Grapes Studio SDK!](https://app.grapesjs.com/docs-sdk/plugins/overview?utm_source=grapesjs-docs&utm_medium=tip)
:::

[[toc]]

## Basic plugin

Plugins are simple functions that are run when the editor is initialized.

```js
function myPlugin(editor) {
  // Use the API: https://grapesjs.com/docs/api/
  editor.Blocks.add('my-first-block', {
    label: 'Simple block',
    content: '<div class="my-block">This is a simple block</div>',
  });
}

const editor = grapesjs.init({
  container: '#gjs',
  plugins: [myPlugin],
});
```

This means plugins can be moved to separate folders to keep thing cleaner or imported from NPM.

```js
import myPlugin from './plugins/myPlugin';
import npmPackage from '@npm/package';

const editor = grapesjs.init({
  container: '#gjs',
  plugins: [myPlugin, npmPackage],
});
```

## Plugins with options

It's also possible to pass custom parameters to plugins in to make them more flexible.

```js
const myPluginWithOptions = (editor, options) => {
  console.log(options);
  // { customField: 'customValue' }
};

const editor = grapesjs.init({
  container: '#gjs',
  plugins: [myPluginWithOptions],
  pluginsOpts: {
    [myPluginWithOptions]: {
      customField: 'customValue',
    },
  },
});
```

## Usage with TS

If you're using TypeScript, for a better type safety, we recommend using the `usePlugin` helper.

```ts
import grapesjs, { usePlugin } from 'grapesjs';
import type { Plugin } from 'grapesjs';

interface MyPluginOptions {
  opt1: string;
  opt2?: number;
}

const myPlugin: Plugin<MyPluginOptions> = (editor, options) => {
  // ...
};

grapesjs.init({
  // ...
  plugins: [
    // no need for `pluginsOpts`
    usePlugin(myPlugin, { opt1: 'A', opt2: 1 }),
  ],
});
```

## Dynamic plugin management

::: warning
Available from GrapesJS v0.23.1
:::

Plugins can also be added and removed dynamically at runtime via `editor.Plugins`.

This is useful when:

- you want to enable/disable editor features on demand
- you need to inspect which plugins are currently active
- you want automatic cleanup of editor-level registrations added by a plugin

```ts
const editor = grapesjs.init({
  // ...
  plugins: [
    // Load plugin on init...
    { id: 'my-plugin-1', plugin: usePlugin(myPlugin, { opt1: 'A' }) }
  ],
});

// ... or add it dynamically
const plugin = editor.Plugins.add({
  id: 'my-plugin-2',
  plugin: usePlugin(myPlugin, { opt1: 'A' }),
});

const hasPlugin = !!editor.Plugins.get('my-plugin-2');
editor.Plugins.getAll();
editor.Plugins.remove('my-plugin-2');
```

GrapesJS stores active plugins inside `editor.Plugins` module, so the plugin can be identified and removed later.

For this reason, the object descriptor form requires an explicit `id`.

```ts
editor.Plugins.add({
  id: 'my-plugin',
  plugin: usePlugin(myPlugin, { opt1: 'A' }),
});
```

When possible, GrapesJS also tracks editor-level entities added during plugin execution and removes them automatically when the plugin is removed. This currently applies to runtime/editor configuration features such as blocks, component types, keymaps, etc.

The automatic cleanup is intentionally limited to editor-level registrations. It does not remove project data such as pages, components already added to the canvas, or any other persisted content.

If a plugin needs additional teardown logic, it can return a cleanup function.

```ts
const myPlugin: Plugin = (editor) => {
  const interval = setInterval(() => {
    // ...
  }, 1000);

  return ({ cleanup }) => {
    cleanup();
    clearInterval(interval);
  };
};
```

## Boilerplate

For fast plugin development, we highly recommend using [grapesjs-cli](https://github.com/GrapesJS/cli) which helps to avoid the hassle of setting up all the dependencies and configurations for development and building (no need to touch Webpack or Babel configurations). For more information check the repository.
