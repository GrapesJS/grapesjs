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

You can create your commands already from initialization by passing them in the `commands.defaults` options:

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