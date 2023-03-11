---
title: Block Manager
---

# Block Manager

<p align="center"><img src="http://grapesjs.com/img/sc-grapesjs-blocks-prp.jpg" alt="GrapesJS - Block Manager" height="400" align="center"/></p>

A [Block] is a simple object which allows the end-user to reuse your [Components]. It can be connected to a single [Component] or to a complex composition of them. In this guide, you will see how to setup and take full advantage of the built-in Block Manager UI in GrapesJS.
The default UI is a lightweight component with built-in Drag & Drop support, but as you'll see next in this guide, it's easy to extend and create your own UI manager.

::: warning
To get a better understanding of the content in this guide, we recommend reading [Components] first
:::
::: warning
This guide is referring to GrapesJS v0.17.27 or higher
:::

[[toc]]


## Configuration

To change the default configurations you have to pass the `blockManager` property with the main configuration object.

```js
const editor = grapesjs.init({
  ...
  blockManager: {
    blocks: [...],
    ...
  }
});
```

Check the full list of available options here: [Block Manager Config](https://github.com/GrapesJS/grapesjs/blob/master/src/block_manager/config/config.ts)


## Initialization

By default, Block Manager UI is considered a hidden component. Currently, the GrapesJS core, renders default panels and buttons that allow you to show them, but in long term, this is something that might will change. Here below you can see how to init the editor without default panels and immediately rendered Block Manager UI.

::: tip
Follow the [Getting Started] guide in order to setup properly the editor with custom panels.
:::

```js
const editor = grapesjs.init({
  container: '#gjs',
  height: '100%',
  storageManager: false,
  panels: { defaults: [] }, // Avoid default panels
  blockManager: {
    appendTo: '.myblocks',
    blocks: [
      {
        id: 'image',
        label: 'Image',
        media: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
            <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
        </svg>`,
        // Use `image` component
        content: { type: 'image' },
        // The component `image` is activatable (shows the Asset Manager).
        // We want to activate it once dropped in the canvas.
        activate: true,
        // select: true, // Default with `activate: true`
      }
    ],
  }
});
```





## Block content types
The key of connecting blocks to components is the `block.content` property and what we passed in the example above is the [Component Definition]. This is the component-oriented way to create blocks and this is how we highly recommend the creation of your blocks.

### Component-oriented
The `content` can accept different formats, like an HTML string (which will be parsed and converted to components), but the component-oriented approach is the most precise as you can keep the control of your each dropped block in the canvas. Another advice is to keep your blocks' [Component Definition] as light as possible, if you're defining a lot of redundant properties, probably it makes sense to create another dedicated component, this might reduce the size of your project JSON file. Here an example:

```js
// Your components
editor.Components.addType('my-cmp', {
  model: {
    defaults: {
      prop1: 'value1',
      prop2: 'value2',
    }
  }
});
// Your blocks
[
  { ..., content: { type: 'my-cmp', prop1: 'value1-EXT', prop2: 'value2-EXT' } }
  { ..., content: { type: 'my-cmp', prop1: 'value1-EXT', prop2: 'value2-EXT' } }
  { ..., content: { type: 'my-cmp', prop1: 'value1-EXT', prop2: 'value2-EXT' } }
]
```
Here we're reusing the same component multiple times with the same set of properties (just an example, makes more sense with composed content of components), this can be reduced to something like this.

```js
// Your components
editor.Components.addType('my-cmp', { ... });
editor.Components.addType('my-cmp-alt', {
  extend: 'my-cmp',
  model: {
    defaults: {
      prop1: 'value1-EXT',
      prop2: 'value2-EXT'
    }
  }
});
// Your blocks
[
  { ..., content: { type: 'my-cmp-alt' } }
  { ..., content: { type: 'my-cmp-alt' } }
  { ..., content: { type: 'my-cmp-alt' } }
]
```

### HTML strings
Using HTML strings as `content` is not wrong, in some cases you don't need the finest control over components and want to leave the user full freedom on template composition (eg. static site builder editor with HTML copy-pasted from a framework like [Tailwind Components](https://tailwindcomponents.com/))
```js
// Your block
{
  // ...
  content: `<div class="el-X">
    <div class="el-Y el-A">Element A</div>
    <div class="el-Y el-B">Element B</div>
    <div class="el-Y el-C">Element C</div>
  </div>`
}
```
In such a case, all rendered elements will be converted to the best suited default component (eg. `.el-Y` elements will be treated like `text` components). The user will be able to style and drag them with no particular restrictions.

Thanks to Components' [isComponet](Components.html#iscomponent) feature (executed post parsing), you're still able to bind your rendered elements to components and enforce an extra logic. Here an example how you would enforce all `.el-Y` elements to be placed only inside `.el-X` one, without touching any part of the original HTML used in the `content`.

```js
// Your component
editor.Components.addType('cmp-Y', {
  // Detect '.el-Y' elements
  isComponent: el => el.classList?.contains('el-Y'),
  model: {
    defaults: {
      name: 'Component Y', // Simple custom name
      draggable: '.el-X', // Add `draggable` logic
    }
  }
});
```
Another alternative is to leverage `data-gjs-*` attributes to attach properties to components.

::: tip
You can use most of the available [Component properties](/api/component.html#properties).
:::

```js
// -- [Option 1]: Declare type in HTML strings --
{
  // ...
  content: `<div class="el-X">
    <div data-gjs-type="cmp-Y" class="el-Y el-A">Element A</div>
    <div data-gjs-type="cmp-Y" class="el-Y el-B">Element B</div>
    <div data-gjs-type="cmp-Y" class="el-Y el-C">Element C</div>
  </div>`
}
// Component
editor.Components.addType('cmp-Y', {
  // You don't need `isComponent` anymore as you declare types already on elements
  model: {
    defaults: {
      name: 'Component Y', // Simple custom name
      draggable: '.el-X', // Add `draggable` logic
    }
  }
});

// -- [Option 2]: Declare properties in HTML strings (less recommended option) --
{
  // ...
  content: `<div class="el-X">
    <div data-gjs-name="Component Y" data-gjs-draggable=".el-X" class="el-Y el-A">Element A</div>
    <div data-gjs-name="Component Y" data-gjs-draggable=".el-X" class="el-Y el-B">Element B</div>
    <div data-gjs-name="Component Y" data-gjs-draggable=".el-X" class="el-Y el-C">Element C</div>
  </div>`
}
// No need for a custom component.
// You're already defining properties of each element.
```

Here we showed all the possibilities you have with HTML strings, but we strongly advise against the abuse of the `Option 2` and to stick to a more component-oriented approach.
Without a proper component type, not only your HTML will be harder to read, but all those defined properties will be "hard-coded" to a generic component of those elements. So, if one day you decide to "upgrade" the logic of the component (eg. `draggable: '.el-X'` -> `draggable: '.el-X, .el-Z'`), you won't be able.


### Mixed
It's also possible to mix components with HTML strings by passing an array.
```js
{
  // ...
  // Options like `activate`/`select` will be triggered only on the first component.
  activate: true,
  content: [
    { type: 'image' },
    `<div>Extra</div>`
  ]
}
```


## Important caveats

::: danger Read carefully
&nbsp;
:::

### Avoid non serializable properties

Don't put non serializable properties, like functions, in your blocks, keep them only in your components.
```js
// Your block
{
  content: {
    type: 'my-cmp',
    script() {...},
  },
}
```
This will work, but if you try to save and reload a stored project, those will disappear.

### Avoid styles
Don't put styles in your blocks, keep them always in your components.
```js
// Your block
{
  content: [
    // BAD: You risk to create conflicting styles
    { type: 'my-cmp', styles: '.cmp { color: red }' },
    { type: 'my-cmp', styles: '.cmp { color: green }' },

    // REALLY BAD: In case all related components are removed,
    // there is no safe way for the editor to know how to connect
    // and clean your styles.
    `<div class="el">Element</div>
    <div class="el2">Element 2</div>
    <style>
      .el { color: blue }
      .el2 { color: violet }
    </style>`,
  ],
}
```
<!-- Styles imported via component definition, by using the `styles` property, are connected to that specific component type. This allows the editor to remove automatically those styles if all related components are deleted. -->

With the component-oriented approach, you put yourself in a risk of conflicting styles and having a lot of useless redundant styles definitions in your project JSON.

With the HTML string, if you remove all related elements, the editor is not able to clean those styles from the project JSON, as there is no safe way to connect them.





## Programmatic usage
If you need to manage your blocks programmatically you can use its [APIs][Blocks API].

::: warning
All Blocks API methods update mainly your Block Manager UI, it has nothing to do with Components already dropped in the canvas.
:::

Below an example of commonly used methods.
```js
// Get the BlockManager module first
const bm = editor.Blocks; // `Blocks` is an alias of `BlockManager`

// Add a new Block
const block = bm.add('BLOCK-ID', {
  // Your block properties...
  label: 'My block',
  content: '...',
});

// Get the Block
const block2 = bm.get('BLOCK-ID-2');

// Update the Block properties
block2.set({
  label: 'Updated block',
});

// Remove the Block
const removedBlock = bm.remove('BLOCK-ID-2');
```

To know more about the available block properties, check the [Block API Reference][Block].





## Customization
The default Block Manager UI is great for simple things, but except the possibility to tweak some CSS style, adding more complex elements requires a replace of the default UI.

All you have to do is to indicate the editor your intent to use a custom UI and then subscribe to the `block:custom` event that will give you all the information on any requested change.

```js
const editor = grapesjs.init({
    // ...
    blockManager: {
      // ...
      custom: true,
    },
});

editor.on('block:custom', props => {
    // The `props` will contain all the information you need in order to update your UI.
    // props.blocks (Array<Block>) - Array of all blocks
    // props.dragStart (Function<Block>) - A callback to trigger the start of block dragging.
    // props.dragStop (Function<Block>) - A callback to trigger the stop of block dragging.
    // props.container (HTMLElement) - The default element where you can append your UI

    // Here you would put the logic to render/update your UI.
});
```

Here an example of using custom Block Manager with a Vue component.

<demo-viewer value="xyofm1qr" height="500" darkcode/>

From the demo above you can also see how we decided to hide our custom Block Manager and append it to the default container, but that is up to your preferences.


## Events

For a complete list of available events, you can check it [here](/api/block_manager.html#available-events).





<!--
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
-->





[Block]: </api/block.html>
[Component]: </api/component.html>
[Components]: <Components.html>
[Getting Started]: </getting-started.html>
[Blocks API]: </api/block_manager.html>
[Component Definition]: <Components.html#component-definition>
