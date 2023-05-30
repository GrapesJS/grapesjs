---
title: Replace the built-in Rich Text Editor
---
# Replace the built-in Rich Text Editor

As you might have noticed the default Rich Text Editor (RTE) is really tiny and so doesn't seem like a complete solution as a text editor. Instead of showing how to add new commands inside the default one we'll show how to completely replace it with another one.

In the following guide we'll integrate the CKEditor and to accomplish this task we just need to provide few functions to the GrapesJS API method `setCustomRte` as an interface.

::: warning
This guide is referring to GrapesJS v0.21.2 or higher
:::

[[toc]]


## Interface

### Enable

The first step is to indicate how to enable the third-party library and so for we gonna start with the `enable()` function. This method should take care of the first initialization of our custom RTE but also for the next time is called on the same element, this is why there is the `rte` argument.

```js
// IMPORTANT: place the code in a new plugin
const customRTE = (editor) => {
  const focus = (el, rte) => {
    // implemented later
  }

  editor.setCustomRte({
    /**
     * Enabling the custom RTE
     * @param  {HTMLElement} el This is the HTML node which was selected to be edited
     * @param  {Object} rte It's the instance you'd return from the first call of enable().
     *                      At the first call it'd be undefined. This is useful when you need
     *                      to check if the RTE is already enabled on the component
     * @return {Object} The return should be the RTE initialized instance
     */
    enable(el, rte) {
      // If already exists just focus
      if (rte) {
        focus(el, rte);
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

      focus(el, rte);
      return rte;
    },
  });
}

const editor = grapesjs.init({
  ...
  plugins: [customRTE],
});
```



### Disable

Once we know how to enable the RTE let's implement the method which disable it, so let's create the `disable()` function.

```js
editor.setCustomRte({
  // ...
  /**
   * The signature of the function is the same of the `enable`
   */
  disable(el, rte) {
    el.contentEditable = false;
    rte?.focusManager?.blur(true);
  },
});
```



### Content

Each third-party library could handle the state of the content differently and what is actually rendered as a DOM in the preview might not rapresent the final HTML output. So, by default, GrapesJS takes the `innerHTML` as the final output directly from the DOM element but is highly recommended to specify the method responsable to return the final state as HTML string (each third-party library might handle it differently).

```js
editor.setCustomRte({
  // ...
  getContent(el, rte) {
    const htmlString = rte.getData();
    return htmlString;
  },
});
```



### Focus

The `focus()` method is just a helper used inside `enable()` and not required by the interface

```js
const focus = (el, rte) => {
  // Do nothing if already focused
  if (rte?.focusManager?.hasFocus) {
    return;
  }
  el.contentEditable = true;
  rte?.focus();
}

editor.setCustomRte({
  // ...
  enable(el, rte) {
    // ...
    focus(el, rte);
    // ...
  },
});
```



## Toolbar position

Sometimes the default top-left position of the toolbar is not always what you need. For example, when you scroll the canvas and the toolbar reaches the top,  you'd like to move it down. For this purpose, you can add a listener which applies your logic in this way:

```js
editor.on('rteToolbarPosUpdate', (pos) => {
  // eg. update `pos.top` and `pos.left` based on additional data passed inside `pos`
});
```



## The built-in vs third-party

One thing you have to keep in mind when using a custom RTE is that all the content and its behavior are handled by the library itself, the GrapesJS's component will just store the content as it is.
For example, when you create a link using the built-in RTE then you'll be able to select it and edit its `href` via Component Settings. With a custom RTE, it will be its own task to show the proper modal for the link editing.
Obviously, each third-party library has its own APIs and can present some limitations and drawbacks, so, a minimal knowledge of the library is a plus.


### Enable content parser

As an experimental feature, now it's possible to tell the editor to parse the returned HTML content from the custom RTE and store the result as components and not as a simple HTML string. This allows GrapesJS to handle the custom RTE more closely to the native implementation and enable features like [textable components](https://github.com/GrapesJS/grapesjs/issues/2771#issuecomment-1040486056).

```js
editor.setCustomRte({
  // ...
  // Enable content parser
  parseContent: true,
});
```



## Plugins

For the CKEditor, you can find a complete plugin here [grapesjs-plugin-ckeditor](https://github.com/GrapesJS/ckeditor).
