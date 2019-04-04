---
title: Commands
---

# Commands

A basic command in GrapesJS it's a simple function, but you will see in this guide how powerfull they can be. The main goal of the Command module is to centralize functions and be easily reused across the editor. Another big advantage of using commands is the ability to track them, extend or even interrupt beside some conditions.

::: warning
This guide is referring to GrapesJS v0.14.59 or higher
:::

[[toc]]


## Basic configuration

You can create your commands already from the initialization by passing them in the `commands.defaults` options:

```js
const editor = grapesjs.init({
  ...
  commands: {
    defaults: [
      {
        // id and run are mandatory in this case
        id: 'my-command-id',
        run() {
          alert('This is my command');
        },
      }, {
        id: '...',
        // ...
      }
    ],
  }
});
```

For all other available options check directly the [configuration source file](https://github.com/artf/grapesjs/blob/dev/src/commands/config/config.js).

Most commonly commands are created dynamicly post initialization, in that case you'll need to use the [Commands API](api/commands.html) (eg. this is what you need if you create a plugin)

```js
const commands = editor.Commands;
commands.add('my-command-id', editor => {
  alert('This is my command');
});

// or it would be the same...
commands.add('my-command-id', {
  run(editor) {
    alert('This is my command');
  },
});
```

As you see the definiton is quite easy, you just add an ID and the callback function. The [Editor](api/editor.html) instance is passed as the first argument to the callback so you can access any other module or API method.

Now if you want to call that command you should just run this

```js
editor.runCommand('my-command-id');
```

You could also pass options if you need

```js
editor.runCommand('my-command-id', { some: 'option' });
```

Then you can get the same object as a third argument of the callback.

```js
commands.add('my-command-id', (editor, sender, options = {}) => {
  alert(`This is my command ${options.some}`);
});
```

The second argument, `sender`, just indicates who requested the command, in our case will be always the `editor`


Until now there is nothing exiting except a common entry point for functions, but we'll see later its real advantages.




## Default commands

GrapesJS comes along with some default set of commands and you can get a list of all currently availlable commands via `editor.Commands.getAll()`. This will give you an object of all available commands, so, for example, also those added via plugins. You can recognize default commands by their namespace `core:*`, we also recommend to use namepsaces in your own custom commands, but let's get a look more in detail here:

* [`core:canvas-clear`](https://github.com/artf/grapesjs/blob/dev/src/commands/view/CanvasClear.js) - Clear all the content from the canvas (HTML and CSS)
<!-- * `core:canvas-move` -->
<!-- * `core:component-drag` -->
<!-- * `core:component-style-clear` -->
* [`core:component-delete`](https://github.com/artf/grapesjs/blob/dev/src/commands/view/ComponentDelete.js) - Delete a component
* [`core:component-enter`](https://github.com/artf/grapesjs/blob/dev/src/commands/view/ComponentEnter.js) - Select the first children component of the selected one
* [`core:component-exit`](https://github.com/artf/grapesjs/blob/dev/src/commands/view/ComponentExit.js) - Select the parent component of the current selected one
* [`core:component-next`](https://github.com/artf/grapesjs/blob/dev/src/commands/view/ComponentNext.js) - Select the next sibling component
* [`core:component-prev`](https://github.com/artf/grapesjs/blob/dev/src/commands/view/ComponentPrev.js) - Select the previous sibling component
* [`core:copy`](https://github.com/artf/grapesjs/blob/dev/src/commands/view/CopyComponent.js) - Copy the current selected component
* [`core:paste`](https://github.com/artf/grapesjs/blob/dev/src/commands/view/PasteComponent.js) - Paste copied component
* `core:undo` - Call undo function
* `core:redo` - Call redo function



## Statefull commands