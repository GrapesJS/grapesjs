---
title: Commands
---

# Commands

A basic command in GrapesJS is a simple function, but this guide will show you how powerful commands can be. The main goal of the Commands module is to centralize functions so they can be easily reused across the editor. Another advantage of using commands is the ability to track, extend, or even interrupt them under certain conditions.

::: warning
This guide applies to GrapesJS v0.14.61 or higher.
:::

[[toc]]

## Basic configuration

You can create commands during initialization by passing them in the `commands.defaults` option:

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

For all other available options, check the [configuration source file](https://github.com/GrapesJS/grapesjs/blob/master/src/commands/config/config.ts).

Commands are most commonly created dynamically after initialization. In that case, you'll need to use the [Commands API](/api/commands.html), for example, when creating a plugin.

```js
const commands = editor.Commands;
commands.add('my-command-id', (editor) => {
  alert('This is my command');
});

// or it would be the same...
commands.add('my-command-id', {
  run(editor) {
    alert('This is my command');
  },
});
```

As you can see, the definition is simple: just add an ID and a callback function. The [Editor](/api/editor.html) instance is passed as the first argument to the callback so you can access any other module or API method.

To call that command, run this:

```js
editor.runCommand('my-command-id');
```

::: tip
The method `editor.runCommand` is an alias of `editor.Commands.run`.
:::

You can also pass options if needed:

```js
editor.runCommand('my-command-id', { some: 'option' });
```

Then you can get the same object as the third argument to the callback.

```js
commands.add('my-command-id', (editor, sender, options = {}) => {
  alert(`This is my command ${options.some}`);
});
```

The second argument, `sender`, indicates who requested the command. In our case, it will always be the `editor`.

So far, we have a common entry point for functions. We'll see its other advantages later.

## Default commands

GrapesJS comes with a default set of commands. You can get all currently available commands via `editor.Commands.getAll()`. This returns an object containing all available commands, including those added later, such as through plugins. You can recognize default commands by their `core:*` namespace. We also recommend using namespaces for your own custom commands. Here's a closer look at the default commands:

- [`core:canvas-clear`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/commands/view/CanvasClear.ts) - Clear all the content from the canvas (HTML and CSS)
- [`core:component-delete`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/commands/view/ComponentDelete.ts) - Delete a component
- [`core:component-enter`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/commands/view/ComponentEnter.ts) - Select the first child component of the selected one
- [`core:component-exit`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/commands/view/ComponentExit.ts) - Select the parent component of the currently selected one
- [`core:component-next`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/commands/view/ComponentNext.ts) - Select the next sibling component
- [`core:component-prev`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/commands/view/ComponentPrev.ts) - Select the previous sibling component
- [`core:component-outline`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/commands/view/SwitchVisibility.ts) - Enable outline borders on components
- [`core:component-offset`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/commands/view/ShowOffset.ts) - Show component offsets (margins and padding)
- [`core:component-select`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/commands/view/SelectComponent.ts) - Enable the process of selecting components in the canvas
- [`core:copy`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/commands/view/CopyComponent.ts) - Copy the currently selected component
- [`core:paste`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/commands/view/PasteComponent.ts) - Paste the copied component
- [`core:preview`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/commands/view/Preview.ts) - Show a preview of the template in the canvas
- [`core:fullscreen`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/commands/view/Fullscreen.ts) - Make the editor full-screen
- [`core:open-code`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/commands/view/ExportTemplate.ts) - Open a default panel with the template code
- [`core:open-layers`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/commands/view/OpenLayers.ts) - Open a default panel with layers
- [`core:open-styles`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/commands/view/OpenStyleManager.ts) - Open a default panel with the style manager
- [`core:open-traits`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/commands/view/OpenTraitManager.ts) - Open a default panel with the trait manager
- [`core:open-blocks`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/commands/view/OpenBlocks.ts) - Open a default panel with the blocks
- [`core:open-assets`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/commands/view/OpenAssets.ts) - Open a default panel with the assets
- `core:undo` - Perform an undo operation
- `core:redo` - Perform a redo operation
  <!-- * `core:canvas-move` -->
  <!-- * `core:component-drag` -->
  <!-- * `core:component-style-clear` -->
  <!-- tlb-clone tlb-delete tlb-move -->

## Stateful commands

As we've already seen, a command can be a simple function that leaves no state behind after execution. In some cases, however, we'd like to track whether a command is active. GrapesJS supports this by default. To enable it, declare a command as an object with `run` and `stop` methods:

```js
commands.add('my-command-state', {
  run(editor) {
    alert('This command is now active');
  },
  stop(editor) {
    alert('This command is disabled');
  },
});
```

If we now run `editor.runCommand('my-command-state')`, the command will be registered as active. To check its state, use `commands.isActive('my-command-state')`. You can also get all active commands via `commands.getActive()`. In our case, the result would look like this:

```js
{
  ...
  'my-command-state': undefined
}
```

Each key in the result object identifies an active command, and its value is the last value returned by the command's `run` method. In our case, it is `undefined` because we didn't return anything. Your implementation can decide whether to return a value and what that value should be.

```js
// Let's return something
...
run(editor) {
    alert('This command is now active');
    return {
      activated: new Date(),
    }
},
...
// Now, instead of `undefined`, you'll see the object from the run method
```

To disable the command, use the `editor.stopCommand` method: in our case, `editor.stopCommand('my-command-state')`. As with `runCommand`, you can pass an options object as the second argument and use it in your `stop` method.

Once the command is active, calling `editor.runCommand('my-command-state')` again won't trigger `run`. This prevents the activation process from running multiple times, which might lead to an inconsistent state. For example, consider a counter that should increase on `run` and decrease on `stop`. If you need to run a command multiple times, it may not need to be stateful, so try defining it without a `stop` method. If you understand the implications for your application's state, you can force execution with `editor.runCommand('my-command-state', { force: true })`. The same logic applies to the `stopCommand` method.

<br/>

::: danger WARNING
&nbsp;
:::

If you deal with UI in your stateful commands, be careful to keep the state coherent with your logic. Let's take, for example, the use of a modal as an indicator of the command state.

```js
commands.add('my-command-modal', {
  run(editor) {
    editor.Modal.open({
      title: 'Modal example',
      content: 'My content',
    });
  },
  stop(editor) {
    editor.Modal.close();
  },
});
```

If you run the command, close the modal (e.g., by clicking the 'x' at the top), and then try to run it again, the modal won't open. This happens because the command is still active (you should see it in `commands.getActive()`). To fix this, disable the command when the modal closes.

```js
...
  run(editor) {
    editor.Modal.open({
      title: 'Modal example',
      content: 'My content',
    }).onceClose(() => this.stopCommand());
  },
...
```

In the example above, we use a few helper methods from the Modal module (`onceClose`) and the command itself (`stopCommand`) but the logic may differ depending on your requirements and UI.

## Extending

Another big advantage of commands is the possibility to easily extend or override them with another command.
Let's take a simple example:

```js
commands.add('my-command-1', (editor) => {
  alert('This is command 1');
});
```

If you need to overwrite this command with another one, just add it and keep the same id.

```js
commands.add('my-command-1', (editor) => {
  alert('This is command 1 overwritten');
});
```

Now let's see how to extend a command:

```js
commands.add('my-command-2', {
  someFunction1() {
    alert('This is function 1');
  },
  someFunction2() {
    alert('This is function 2');
  },
  run() {
    this.someFunction1();
    this.someFunction2();
  },
});
```

To extend it, use the `extend` method and pass the ID:

```js
commands.extend('my-command-2', {
  someFunction2() {
    alert('This is function 2 extended');
  },
});
```

## Events

The Commands module also offers a set of events that you can use to intercept the command flow, add functionality, or even interrupt execution.

### Intercept run and stop

Using our previously created `my-command-modal` command, let's see which events we can listen to:

```js
editor.on('command:run:my-command-modal', () => {
  console.log('After `my-command-modal` execution');
  // For example, you can add extra content to the modal
  const modalContent = editor.Modal.getContentEl();
  modalContent.insertAdjacentHTML('beforeEnd', '<div>Some content</div>');
});
editor.on('command:run:before:my-command-modal', () => {
  console.log('Before `my-command-modal` execution');
});
// for stateful commands
editor.on('command:stop:my-command-modal', () => {
  console.log('After `my-command-modal` is stopped');
});
editor.on('command:stop:before:my-command-modal:before', () => {
  console.log('Before `my-command-modal` is stopped');
});
```

If needed, you can also listen to all commands:

```js
editor.on('command:run', (commandId) => {
  console.log('Run', commandId);
});

editor.on('command:stop', (commandId) => {
  console.log('Stop', commandId);
});
```

### Interrupt command flow

Sometimes you might need to interrupt an existing command when a certain condition is met. In that case, use the `command:run:before:{COMMAND-ID}` event and set the abort option to `true`:

```js
const condition = 1;

editor.on('command:run:before:my-command-modal', (options) => {
  if (condition) {
    options.abort = true;
    console.log('Prevent `my-command-modal` from execution');
  }
});
```

## Conclusion

The Commands module is simple but powerful when used correctly. If you're creating a plugin for GrapesJS, using commands makes your logic easier to reuse and control.
