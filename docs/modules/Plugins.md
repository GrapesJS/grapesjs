---
title: Plugins
---

# Plugins

Creating plugins in GrapesJS is pretty straightforward and here you'll get how to achieve it.

[[toc]]

## Basic plugin

Generally, you would make plugins in separated files to keep thing cleaner, so you'll probably get a similar structure:

```
/your/path/to/grapesjs.min.js
/your/path/to/grapesjs-plugin.js
```

The order is important as before loading your plugin, GrapesJS have to be loaded first.

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

It's also possible to pass custom parameters to plugins in the way to make them more flexible.

```html
<script type="text/javascript">
  var editor = grapesjs.init({
      container : '#gjs',
      plugins: ['my-plugin-name'],
      pluginsOpts: {
        'my-plugin-name': {
          customField: 'customValue'
        }
      }
  });
</script>
```

Inside you plugin you'll get those options via `options` argument

```js
export default grapesjs.plugins.add('my-plugin-name', (editor, options) => {
  console.log(options);
  //{ customField: 'customValue' }
})
```





## Boilerplate

If you want to start with a production-ready boilerplate, you might want to try  [grapesjs-plugin-boilerplate](https://github.com/artf/grapesjs-plugin-boilerplate) which you can clone and start developing a plugin immediately. For more informations check the repository
