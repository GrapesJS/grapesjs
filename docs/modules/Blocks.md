---
title: Block Manager
---

# Block Manager

<p align="center"><img src="http://grapesjs.com/img/sc-grapesjs-blocks-prp.jpg" alt="GrapesJS - Block Manager" height="400" align="center"/></p>

[[toc]]

The Block is a group of [Components] and can be easily reused inside templates.

The difference between components and blocks: The component is more atomic, so a single image,  a text box or a map is a component. The block is what the end user will drag inside the canvas, so it could contain a single image (single Component) or the entire section like, for example, the footer with a lot of components inside (texts, images, inputs, etc).

Check out the [Components] page to see the list of built-in components and how to create your own.

Let's see how to add a new block to the editor using the [Blocks API]

```js
var editor = grapesjs.init({...});
var blockManager = editor.BlockManager;

// 'my-first-block' is the ID of the block
blockManager.add('my-first-block', {
  label: 'Simple block',
  content: '<div class="my-block">This is a simple block</div>',
});
```

With this snippet a new block will be added to the collection. You can also update existent blocks

```js
blockManager.get('my-first-block').set({
  label: 'Updated simple block',
  attributes: {
    title: 'My title'
  }
})
```

As you see a simple HTML string is enough to create a block, the editor will do the rest.
If you want you could also pass an object representing the [Component].

```js
blockManager.add('my-map-block', {
  label: 'Simple map block',
  content: {
    type: 'map', // Built-in 'map' component
    style: {
      height: '350px'
    },
    removable: false, // Once inserted it can't be removed
  }
})
```

From v0.3.70 it's also possible to pass the HTML string with Component's properties as attributes.

```js
blockManager.add('the-row-block', {
  label: '2 Columns',
  content: '<div class="row" data-gjs-droppable=".row-cell" data-gjs-custom-name="Row">' +
      '<div class="row-cell" data-gjs-draggable=".row"></div>' +
      '<div class="row-cell" data-gjs-draggable=".row"></div>' +
    '</div>',
});
```

In the example above you're defining a row component which will accept only elements which match '.row-cell' selector and cells which could be dragged only inside '.row' elements. We're also defining the custom name which will be seen inside the Layers panel.
If you want to check the complete list of available Component's properties, check directly the Component model source:
[https://github.com/artf/grapesjs/blob/dev/src/dom_components/model/Component.js](https://github.com/artf/grapesjs/blob/dev/src/dom_components/model/Component.js)






## Custom render <Badge text="0.14.55+"/>

If you need to customize the aspect of each block you can pass a `render` callback function in the block definition. Let's see how it works.

As a first option, you can return a simple HTML string, which will be used as a new inner content of the block. As an argument of the callback you will get an object containing the following properties:

* `model` - Block's model (so you can use any passed property to it)
* `el` - Current rendered HTMLElement of the block
* `className` - The base class name used for blocks (useful if you follow BEM, so you can create classes like `${className}__elem`)

```js
blockManager.add('some-block-id', {
  label: `<div>
      <img src="https://picsum.photos/70/70"/>
      <div class="my-label-block">Label block</div>
    </div>`,
  content: '<div>...</div>',
  render: ({ model, className }) => `<div class="${className}__my-wrap">
      Before label
      ${model.get('label')}
      After label
    </div>`,
});
```

<img :src="$withBase('/block-custom-render.jpg')">


Another option would be to avoid returning from the callback (in that case nothing will be replaced) and edit only the current `el` block element

```js
blockManager.add('some-block-id', {
  // ...
  render: ({ el }) => {
    const btn = document.createElement('button');
    btn.innerHTML = 'Click me';
    btn.addEventListener('click', () => alert('Do something'))
    el.appendChild(btn);
  },
});
```
<img :src="$withBase('/block-custom-render2.jpg')">





[Component]: </api/component.html>
[Components]: <Components.html>
[Blocks API]: </api/block_manager.html>
