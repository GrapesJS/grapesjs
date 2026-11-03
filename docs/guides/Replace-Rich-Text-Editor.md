---
title: Replace the built-in Rich Text Editor
---

# Replace the built-in Rich Text Editor

As you might have noticed, the default Rich Text Editor (RTE) is small and may not provide all the text editing features you need. Instead of showing how to add commands to the default RTE, we'll show how to replace it with another editor.

In this guide, we'll integrate CKEditor. To do this, we just need to provide a few functions to the GrapesJS API method `setCustomRte` as an interface.

::: warning
This guide applies to GrapesJS v0.21.2 or higher.
:::

[[toc]]

## Interface

### Enable

The first step is to specify how to enable the third-party library, so we'll start with the `enable()` function. This method should handle both the initial setup of our custom RTE and subsequent calls on the same element. The `rte` argument lets us reuse the existing instance.

```js
// IMPORTANT: place the code in a new plugin
const customRTE = (editor) => {
  const focus = (el, rte) => {
    // implemented later
  }

  editor.setCustomRte({
    /**
     * Enabling the custom RTE
     * @param  {HTMLElement} el The HTML node selected for editing
     * @param  {Object} rte The instance returned from the first call to enable().
     *                      On the first call, it is undefined. This is useful when you need
     *                      to check if the RTE is already enabled on the component
     * @return {Object} The initialized RTE instance
     */
    enable(el, rte) {
      // If the instance already exists, just focus it
      if (rte) {
        focus(el, rte);
        return rte;
      }

      // CKEditor initialization
      rte = CKEDITOR.inline(el, {
        // Your configurations...
        toolbar: [...],
        // IMPORTANT
        // Generally, inline editors are attached at the same position as
        // the selected element, but this only works until you start scrolling
        // the canvas. For this reason, move the RTE's toolbar inside the
        // GrapesJS toolbar. We use a plugin that simplifies this process
        // and places all subsequent CKEditor toolbars inside the specified
        // element.
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

Now that we know how to enable the RTE, let's implement the `disable()` function.

```js
editor.setCustomRte({
  // ...
  /**
   * The function has the same signature as `enable`
   */
  disable(el, rte) {
    el.contentEditable = false;
    rte?.focusManager?.blur(true);
  },
});
```

### Content

Each third-party library can handle the content's state differently, and the DOM rendered in the preview might not represent the final HTML output. By default, GrapesJS takes `innerHTML` directly from the DOM element as the final output. However, we strongly recommend specifying a method that returns the final state as an HTML string, using the library's API.

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

The `focus()` method is a helper used inside `enable()` and is not required by the interface.

```js
const focus = (el, rte) => {
  // Do nothing if already focused
  if (rte?.focusManager?.hasFocus) {
    return;
  }
  el.contentEditable = true;
  rte?.focus();
};

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

The default top-left position of the toolbar may not always suit your needs. For example, when you scroll the canvas and the toolbar reaches the top, you might want to move it down. To do this, you can add a listener that applies your logic:

```js
editor.on('rteToolbarPosUpdate', (pos) => {
  // e.g., update `pos.top` and `pos.left` based on additional data passed in `pos`
});
```

## The built-in vs third-party

When using a custom RTE, keep in mind that all the content and its behavior are handled by the library itself. The GrapesJS component simply stores the content as it is.
For example, when you create a link using the built-in RTE, you can select it and edit its `href` via Component Settings. With a custom RTE, the library is responsible for showing the appropriate modal for editing links.
Each third-party library has its own APIs and may have limitations and drawbacks, so some familiarity with the library is helpful.

### Enable content parser

As an experimental feature, you can tell the editor to parse the HTML content returned by the custom RTE and store the result as components rather than a simple HTML string. This allows GrapesJS to handle the custom RTE more like the native implementation and enables features like [textable components](https://github.com/GrapesJS/grapesjs/issues/2771#issuecomment-1040486056).

```js
editor.setCustomRte({
  // ...
  // Enable content parser
  parseContent: true,
});
```

## Plugins

For CKEditor, you can find a complete plugin here: [grapesjs-plugin-ckeditor](https://github.com/GrapesJS/ckeditor).
