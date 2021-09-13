---
title: Modal
---

# Modal

The **Modal** module allows to easily display content in a dialog window.

::: warning
This guide is referring to GrapesJS v0.17.26 or higher
:::

[[toc]]



## Basic usage

You can easily display your content by calling a single API call.

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

By using other [available APIs](/api/modal_dialog.html) you have full control of the modal (eg. updating content/title, closing the modal, etc.).

Here are a few examples:

```js
const { Modal } = editor;

// close the modal
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
})
```

## Customization

The modal can be fully customized and you have different available options.
The fastest and the easiest one is to use your specific CSS for the modal element. With a few lines of CSS your modal can be completely adapted to your choices.

```css
.gjs-mdl-dialog {
    background-color: white;
    color: #333;
}
```

In case you have to customize a specific modal differently, you can rely on your custom class attributes.

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
Your custom CSS has to be loaded after the GrapesJS one.
:::

### Custom Modal

For a more advanced usage


## Events
