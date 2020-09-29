---
title: Plugins
---

# Plugins

Creating plugins in GrapesJS is pretty straightforward and here you'll get how to achieve it.

[[toc]]

## Basic plugin

The most simple plugins are just functions that are run when the editor is being built.

```js
  function myPlugin(editor){
      editor.BlockManager.add('my-first-block', {
        label: 'Simple block',
        content: '<div class="my-block">This is a simple block</div>',
      });
  }

  var editor = grapesjs.init({
      container : '#gjs',
      plugins: [myPlugin]
  });
```

This means that plugins can be moved to separate folders to keep thing cleaner or imported from NPM.

```js
  import myPlugin from './plugins/myPlugin'
  import npmPackage from '@npm/package'

  var editor = grapesjs.init({
      container : '#gjs',
      plugins: [myPlugin, npmPackage]
  });
```



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





## Plugins with options

It's also possible to pass custom parameters to plugins in to make them more flexible.

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

```js
  import myPlugin from '../plugin'

  var editor = grapesjs.init({
      container : '#gjs',
      plugins: [myPlugin],
      pluginsOpts: {
        [myPlugin]: {
          customField: 'customValue'
        }
      }
  });
```


## Named Plugins vs Non-Named Plugins

When you use a named plugin, then that name must be unique across all other plugins.

```js
grapesjs.plugins.add('my-plugin-name', fn);
```

In this example, the plugin name is `my-plugin-name` and can't be used by other plugins. To avoid namespace restrictions use basic plugins that are purely functional.

## Boilerplate

For fast plugin development, we highly recommend using [grapesjs-cli](https://github.com/artf/grapesjs-cli) which helps to avoid the hassle of setting up all the dependencies and configurations for development and building (no need to touch Webpack o Babel configurations). For more information check the repository


## Popular Plugins

 - https://github.com/artf/grapesjs-preset-webpage
 - https://github.com/artf/grapesjs-preset-newsletter