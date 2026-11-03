---
title: Modal
---

# Modal

The **Modal** module allows you to easily display content in a dialog window.

::: warning
This guide applies to GrapesJS v0.17.26 or higher.
:::

[[toc]]

## Basic usage

You can easily display your content with a single API call.

```js
// Init editor
const editor = grapesjs.init({ ... });
// Open modal
const openModal = () => {
    editor.Modal.open({
        title: 'My title', // string | HTMLElement
        content: 'My content', // string | HTMLElement
    });
};
// Create a simple custom button that will open the modal
document.body.insertAdjacentHTML('afterbegin',`
    <button onclick="openModal()">Open Modal</button>
`);
```

## Using API

The other [available APIs](/api/modal_dialog.html) give you full control of the modal (e.g., updating its content/title or closing it).

Here are a few examples:

```js
const { Modal } = editor;

// Close the modal
Modal.close();

// Check if the modal is open
Modal.isOpen();

// Update title
Modal.setTitle('New title');

// Update content
Modal.setContent('New content');

// Execute one-time callback on modal close
Modal.onceClose(() => {
  console.log('My last modal is closed');
});
```

## Customization

The modal can be fully customized in several ways.
The fastest and easiest option is to use custom CSS for the modal element. With a few lines of CSS, you can adapt the modal to your needs.

```css
.gjs-mdl-dialog {
  background-color: white;
  color: #333;
}
```

If you need to customize a specific modal differently, you can use custom class attributes.

```js
editor.Modal.open({
  title: 'My title',
  content: 'My content',
  attributes: {
    class: 'my-small-modal',
  },
});
```

```css
.my-small-modal .gjs-mdl-dialog {
  max-width: 300px;
}
```

::: warning
Your custom CSS must be loaded after the GrapesJS CSS.
:::

### Custom Modal

For more advanced usage, you can completely replace the default modal with one of your own. Tell the editor to use a custom modal, then subscribe to the `modal` event, which provides information about any requested changes.

```js
const editor = grapesjs.init({
  // ...
  modal: { custom: true },
});

editor.on('modal', (props) => {
  // The `props` will contain all the information you need in order to update your custom modal.
  // props.open (boolean) - Indicates if the modal should be open
  // props.title (Node) - Modal title
  // props.content (Node) - Modal content
  // props.attributes (Object) - Modal custom attributes (e.g., class)
  // props.close (Function) - A callback to use when you want to close the modal programmatically
  // Here you would put the logic to control your modal.
});
```

Here's an example of using the Bootstrap modal.

<demo-viewer value="x70amv3f" height="500" darkcode/>

## Events

For a complete list of available events, check [here](/api/modal_dialog.html#available-events).
