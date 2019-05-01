---
title: Commands
---

# Commands

A basic command in GrapesJS it's a simple function, but you will see in this guide how powerful they can be. The main goal of the Command module is to centralize functions and be easily reused across the editor. Another big advantage of using commands is the ability to track them, extend or even interrupt beside some conditions.

::: warning
This guide is referring to GrapesJS v0.14.61 or higher
:::

[[toc]]


## Basic configuration

You can create your commands already from the initialization step by passing them in the `commands.defaults` options:

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

Most commonly commands are created dynamically post-initialization, in that case, you'll need to use the [Commands API](/api/commands.html) (eg. this is what you need if you create a plugin)

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

As you see the definition is quite easy, you just add an ID and the callback function. The [Editor](/api/editor.html) instance is passed as the first argument to the callback so you can access any other module or API method.

Now if you want to call that command you should just run this

```js
editor.runCommand('my-command-id');
```

::: tip
The method `editor.runCommand` is an alias of `editor.Commands.run`
:::

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


Until now there is nothing exciting except a common entry point for functions, but we'll see later its real advantages.




## Default commands

GrapesJS comes along with some default set of commands and you can get a list of all currently available commands via `editor.Commands.getAll()`. This will give you an object of all available commands, so, also those added later, like via plugins. You can recognize default commands by their namespace `core:*`, we also recommend to use namespaces in your own custom commands, but let's get a look more in detail here:

* [`core:canvas-clear`](https://github.com/artf/grapesjs/blob/dev/src/commands/view/CanvasClear.js) - Clear all the content from the canvas (HTML and CSS)
* [`core:component-delete`](https://github.com/artf/grapesjs/blob/dev/src/commands/view/ComponentDelete.js) - Delete a component
* [`core:component-enter`](https://github.com/artf/grapesjs/blob/dev/src/commands/view/ComponentEnter.js) - Select the first children component of the selected one
* [`core:component-exit`](https://github.com/artf/grapesjs/blob/dev/src/commands/view/ComponentExit.js) - Select the parent component of the current selected one
* [`core:component-next`](https://github.com/artf/grapesjs/blob/dev/src/commands/view/ComponentNext.js) - Select the next sibling component
* [`core:component-prev`](https://github.com/artf/grapesjs/blob/dev/src/commands/view/ComponentPrev.js) - Select the previous sibling component
* [`core:component-outline`](https://github.com/artf/grapesjs/blob/dev/src/commands/view/SwitchVisibility.js) - Enable outline border on components
* [`core:component-offset`](https://github.com/artf/grapesjs/blob/dev/src/commands/view/ShowOffset.js) - Enable components offset (margins, paddings)
* [`core:component-select`](https://github.com/artf/grapesjs/blob/dev/src/commands/view/SelectComponent.js) - Enable the process of selecting components in the canvas
* [`core:copy`](https://github.com/artf/grapesjs/blob/dev/src/commands/view/CopyComponent.js) - Copy the current selected component
* [`core:paste`](https://github.com/artf/grapesjs/blob/dev/src/commands/view/PasteComponent.js) - Paste copied component
* [`core:preview`](https://github.com/artf/grapesjs/blob/dev/src/commands/view/Preview.js) - Show the preview of the template in canvas
* [`core:fullscreen`](https://github.com/artf/grapesjs/blob/dev/src/commands/view/Fullscreen.js) - Set the editor fullscreen
* [`core:open-code`](https://github.com/artf/grapesjs/blob/dev/src/commands/view/ExportTemplate.js) - Open a default panel with the template code
* [`core:open-layers`](https://github.com/artf/grapesjs/blob/dev/src/commands/view/OpenLayers.js) - Open a default panel with layers
* [`core:open-styles`](https://github.com/artf/grapesjs/blob/dev/src/commands/view/OpenStyleManager.js) - Open a default panel with the style manager
* [`core:open-traits`](https://github.com/artf/grapesjs/blob/dev/src/commands/view/OpenTraitManager.js) - Open a default panel with the trait manager
* [`core:open-blocks`](https://github.com/artf/grapesjs/blob/dev/src/commands/view/OpenBlocks.js) - Open a default panel with the blocks
* [`core:open-assets`](https://github.com/artf/grapesjs/blob/dev/src/commands/view/OpenAssets.js) - Open a default panel with the assets
* `core:undo` - Call undo operation
* `core:redo` - Call redo operation
<!-- * `core:canvas-move` -->
<!-- * `core:component-drag` -->
<!-- * `core:component-style-clear` -->
<!-- tlb-clone tlb-delete tlb-move -->





## Stateful commands

As we've already seen the command is just a function and once executed nothing is left behind, but in some cases, we'd like to keep a track of executed commands. GrapesJS can handle by default this case and to enable it you just need to declare a command as an object with the `run` and `stop` methods

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

So if we now run `editor.runCommand('my-command-state')` the command will be registered as active. To check the state of the command you can use `commands.isActive('my-command-state')` or you can even get the list of all active commands via `commands.getActive()`, in our case the result would be something like this

```js
{
  ...
  'my-command-state': undefined
}
```

The key of the result object tells you the active command, the value is the last return of the `run` command, in our case is `undefined` because we didn't return anything, but it's up to your implementation decide what to return and if you actually need it.

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
// Now instead of the `undefined` you'll see the object from the run method
```

To disable the command use `editor.stopCommand` method, so in our case it'll be `editor.stopCommand('my-command-state')`. As for the `runCommand` you can pass an options object as a second argument and use them in your `stop` method.

Once the command is active, if you try to run `editor.runCommand('my-command-state')` again you'll notice that that the `run` is not triggering. This behavior is useful to prevent executing multiple times the activation process which might lead to an inconsistent state (think about, for instance, having a counter, which should be increased on `run` and decreased on `stop`). If you need to run a command multiple times probably you're dealing with a not stateful command, so try to use it without the `stop` method, but in case you're aware of your application state you can actually force the execution with `editor.runCommand('my-command-state', { force: true })`. The same logic applies to the `stopCommand` method.

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

If you run it, close the modal (eg. by clicking the 'x' on top) and then try to run it again you'll see that the modal is not opening anymore. This happens because the command is still active (you should see it in `commands.getActive()`) and to fix it you have to disable it once the modal is closed.

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

In the example above, we make use of few helper methods from the Modal module (`onceClose`) and the command itself (`stopCommand`) but obviously, the logic might be different due to your requirements and specific UI.





## Extending

Another big advantage of commands is the possibility to easily extend or override them with another command.
Let's take a simple example

```js
commands.add('my-command-1', editor => {
  alert('This is command 1');
});
```

If you need to overwrite this command with another one, just add it and keep the same id.

```js
commands.add('my-command-1', editor => {
  alert('This is command 1 overwritten');
});
```

Let's see now instead how can we extend one

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

to extend it just use `extend` method by passing the id

```js
commands.extend('my-command-2', {
  someFunction2() {
    alert('This is function 2 extended');
  },
});
```





## Events

The Commands module offers also a set of events that you can use to intercept the command flow for adding more functionality or even interrupting it.


### Intercept run and stop

By using our previosly created `my-command-modal` command let's see which events we can listen to

```js
editor.on('run:my-command-modal', () => {
  console.log('After `my-command-modal` execution');
  // For example, you can add extra content to the modal
  const modalContent = editor.Modal.getContentEl();
  modalContent.insertAdjacentHTML('beforeEnd', '<div>Some content</div>');
});
editor.on('run:my-command-modal:before', () => {
  console.log('Before `my-command-modal` execution');
});
// for stateful commands
editor.on('stop:my-command-modal', () => {
  console.log('After `my-command-modal` is stopped');
});
editor.on('stop:my-command-modal:before', () => {
  console.log('Before `my-command-modal` is stopped');
});
```

If you need, you can also listen to all commands

```js
editor.on('run', commandId => {
  console.log('Run', commandId);
});

editor.on('stop', commandId => {
  console.log('Stop', commandId);
});
```


### Interrupt command flow

Sometimes you might need to interrupt the execution of an existant command due to some condition. In that case, you have to use `run:{COMMAND-ID}:before` event and set to `true` the abort option

```js
const condition = 1;

editor.on('run:my-command-modal:before', options => {
  if (condition) {
    options.abort = true;
    console.log('Prevent `my-command-modal` from execution');
  }
});
```



## Conclusion

The Commands module is quite simple but, at the same time, really powerful if used correctly. So, if you're creating a plugin for GrapesJS, use commands as much as possible, this will allow higher reusability and control over your logic.