---
title: Replace the built-in Rich Text Editor
---
# Replace the built-in Rich Text Editor

As you might have noticed the default Rich Text Editor (RTE) is really tiny and so doesn't seem like a complete solution as a text editor. Instead of showing how to add new commands inside the default one we'll show how to completely replace it with another one.

In the following guide we'll integrate the CKEditor and to accomplish this task we just need to provide few functions to the GrapesJS API method `setCustomRte` as an interface.

[[toc]]


## Interface

### Enable

The first step is to indicate how to enable the third-party library and so for we gonna start with the `enable()` function. This method should take care of the first initialization of our custom RTE but also for the next time is called on the same element, this is why there is the `rte` argument.

```js
var editor = grapesjs.init({...});
editor.setCustomRte({
  /**
   * Enabling the custom RTE
   * @param  {HTMLElement} el This is the HTML node which was selected to be edited
   * @param  {Object} rte It's the instance you'd return from the first call of enable().
   *                      At the first call it'd be undefined. This is useful when you need
   *                      to check if the RTE is already enabled on the component
   * @return {Object} The return should be the RTE initialized instance
   */
  enable: function(el, rte) {
    // If already exists just focus
    if (rte) {
      this.focus(el, rte); // implemented later
      return rte;
    }

    // CKEditor initialization
    rte = CKEDITOR.inline(el, {
      // Your configurations...
      toolbar: [...],
      // IMPORTANT
      // Generally, inline editors are attached exactly at the same position of
      // the selected element but in this case it'd work until you start to scroll
      // the canvas. For this reason you have to move the RTE's toolbar inside the
      // one from GrapesJS. For this purpose we used a plugin which simplify
      // this process and move all next CKEditor's toolbars inside our indicated
      // element
      sharedSpaces: {
        top: editor.RichTextEditor.getToolbarEl(),
      }
    });

    this.focus(el, rte); // implemented later
    return rte;
  },
});
```



### Disable

Once we know how to enable the RTE let's implement the method which disable it, so let's create the `disable()` function.

```js
editor.setCustomRte({
  // ...
  /**
   * The signature of the function is the same of the enable
   */
  disable: function(el, rte) {
    el.contentEditable = false;
    if (rte && rte.focusManager) {
      rte.focusManager.blur(true);
    }
  },
});
```



### Focus

The `focus()` method is just a helper used inside `enable()` and not required by the interface

```js
editor.setCustomRte({
  // ...
  focus: function (el, rte) {
    // Do nothing if already focused
    if (rte && rte.focusManager.hasFocus) {
      return;
    }
    el.contentEditable = true;
    rte && rte.focus();
  },
});
```



## Toolbar position

Sometimes the default top-left position of the toolbar is not always what you need. For example, when you scroll the canvas and the toolbar reaches the top,  you'd like to move it down. For this purpose, you can add a listener which applies your logic in this way:

```js
editor.on('rteToolbarPosUpdate', (pos) => {
  if (pos.top <= pos.canvasTop) {
    pos.top = pos.elementTop + pos.elementHeight;
  }
});
```



## The built-in vs third-party

The only one thing you have to keep in mind when using a custom RTE is that all the content and its behavior are handled by the library itself, the GrapesJS's component will just store the content as it is.
For example, when you create a link using the built-in RTE then you'll be able to select it and edit its `href` via Component Settings. With a custom RTE, it will be its own task to show the proper modal for the link editing.
Obviously, each third-party library has its own APIs and can present some limitations and drawbacks, so, a minimal knowledge of the library is a plus.


## Plugins

For the CKEditor, you can find a complete plugin here [grapesjs-plugin-ckeditor](https://github.com/artf/grapesjs-plugin-ckeditor).
