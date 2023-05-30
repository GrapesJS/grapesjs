---
title: Plugins
---

# Plugins

Creating plugins in GrapesJS is pretty straightforward and here you'll get how to achieve it.

::: warning
This guide is referring to GrapesJS v0.21.2 or higher
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
  plugins: [myPlugin]
});
```

This means plugins can be moved to separate folders to keep thing cleaner or imported from NPM.

```js
import myPlugin from './plugins/myPlugin'
import npmPackage from '@npm/package'

const editor = grapesjs.init({
    container : '#gjs',
    plugins: [myPlugin, npmPackage]
});
```



<!--
## Named plugin

If you're distributing your plugin globally, you may want to make a named plugin. To keep thing cleaner, so you'll probably get a similar structure:

```
/your/path/to/grapesjs.min.js
/your/path/to/grapesjs-plugin.js
```

**Important:** The order that you load files matters. GrapesJS has to be loaded before the plugin. This sets up the `grapejs` global variable.

So, in your `grapesjs-plugin.js` file:

```js
export default grapesjs.plugins.add('my-plugin-name', (editor, options) => {
  /*
  * Here you should rely on GrapesJS APIs, so check 'API Reference' for more info
  * For example, you could do something like this to add some new command:
  *
  * editor.Commands.add(...);
  */
})
```

The name `my-plugin-name` is an ID of your plugin and you'll use it to tell your editor to grab it.

Here is a complete generic example:

```html
<script src="http://code.jquery.com/jquery-2.2.0.min.js"></script>
<link rel="stylesheet" href="path/to/grapes.min.css">
<script src="path/to/grapes.min.js"></script>
<script src="path/to/grapesjs-plugin.js"></script>

<div id="gjs"></div>

<script type="text/javascript">
  var editor = grapesjs.init({
      container : '#gjs',
      plugins: ['my-plugin-name']
  });
</script>
```
-->




## Plugins with options

It's also possible to pass custom parameters to plugins in to make them more flexible.

<!--
```js
  var editor = grapesjs.init({
      container : '#gjs',
      plugins: ['my-plugin-name'],
      pluginsOpts: {
        'my-plugin-name': {
          customField: 'customValue'
        }
      }
  });
```

Inside you plugin you'll get those options via `options` argument

```js
export default grapesjs.plugins.add('my-plugin-name', (editor, options) => {
  console.log(options);
  //{ customField: 'customValue' }
})
```

This also works with plugins that aren't named.

-->
```js
const myPluginWithOptions = (editor, options) => {
  console.log(options);
  // { customField: 'customValue' }
}

const editor = grapesjs.init({
  container : '#gjs',
  plugins: [myPluginWithOptions],
  pluginsOpts: {
    [myPluginWithOptions]: {
      customField: 'customValue'
    }
  }
});
```

<!--
## Named Plugins vs Non-Named Plugins

When you use a named plugin, then that name must be unique across all other plugins.

```js
grapesjs.plugins.add('my-plugin-name', fn);
```

In this example, the plugin name is `my-plugin-name` and can't be used by other plugins. To avoid namespace restrictions use basic plugins that are purely functional.

-->

## Usage with TS

If you're using TypeScript, for a better type safety, we recommend using the `usePlugin` helper.

```ts
import grapesjs, { usePlugin } from 'grapesjs';
import type { Plugin } from 'grapesjs';

interface MyPluginOptions {
  opt1: string,
  opt2?: number,
}

const myPlugin: Plugin<MyPluginOptions> = (editor, options) => {
    // ...
}

grapesjs.init({
  // ...
  plugins: [
    // no need for `pluginsOpts`
    usePlugin(myPlugin, { opt1: 'A', opt2: 1 })
  ]
});
```


## Boilerplate

For fast plugin development, we highly recommend using [grapesjs-cli](https://github.com/GrapesJS/cli) which helps to avoid the hassle of setting up all the dependencies and configurations for development and building (no need to touch Webpack o Babel configurations). For more information check the repository.
