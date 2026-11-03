---
title: Block Manager
---

# Block Manager

<p align="center"><img src="http://grapesjs.com/img/sc-grapesjs-blocks-prp.jpg" alt="GrapesJS - Block Manager" height="400" align="center"/></p>

A [Block] is a simple object which allows the end-user to reuse your [Components]. It can be connected to a single [Component] or to a complex composition of them. In this guide, you will see how to set up and take full advantage of the built-in Block Manager UI in GrapesJS.
The default UI is a lightweight component with built-in drag-and-drop support, but as you'll see next in this guide, it's easy to extend and create your own UI manager.

::: warning
To get a better understanding of the content in this guide, we recommend reading [Components] first.
:::
::: warning
This guide applies to GrapesJS v0.17.27 or higher.
:::

::: tip
Need a sleek block UI that’s easy to extend and customize? [Explore the Grapes Studio SDK!](https://app.grapesjs.com/docs-sdk/configuration/blocks?utm_source=grapesjs-docs&utm_medium=tip)
:::

[[toc]]

## Configuration

To change the default configuration, pass the `blockManager` property in the main configuration object.

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

By default, the Block Manager UI is hidden. GrapesJS core currently renders default panels and buttons that allow you to show it, but this may change in the future. Below, you can see how to initialize the editor without default panels and render the Block Manager UI immediately.

::: tip
Follow the [Getting Started] guide to set up the editor properly with custom panels.
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
        // We want to activate it once dropped onto the canvas.
        activate: true,
        // select: true, // Default with `activate: true`
      },
    ],
  },
});
```

## Block content types

The key to connecting blocks to components is the `block.content` property. In the example above, we passed a [Component Definition]. We strongly recommend this component-oriented approach to creating blocks.

### Component-oriented

The `content` property accepts different formats, such as an HTML string (which will be parsed and converted to components). The component-oriented approach gives you the most precise control over each block dropped onto the canvas. Keep your blocks' [Component Definition] as light as possible. If you're defining many redundant properties, consider creating another dedicated component to reduce the size of your project JSON file. Here's an example:

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

Here, we're reusing the same component multiple times with the same set of properties. This is a simple example; the benefit is greater when composing multiple components. We can simplify it like this:

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

Using HTML strings as `content` is valid. In some cases, you don't need fine control over components and want to give users full freedom to compose templates (e.g., in a static site builder with HTML copied from a resource like [Tailwind Components](https://tailwindcomponents.com/)).

```js
// Your block
{
  // ...
  content: `<div class="el-X">
    <div class="el-Y el-A">Element A</div>
    <div class="el-Y el-B">Element B</div>
    <div class="el-Y el-C">Element C</div>
  </div>`;
}
```

In such a case, all rendered elements will be converted to the most suitable default component (e.g., `.el-Y` elements will be treated like `text` components). The user will be able to style and drag them with no particular restrictions.

The Components module's [isComponent](Components.html#iscomponent) feature (executed after parsing) lets you bind rendered elements to components and apply additional logic. Here's how to restrict all `.el-Y` elements to being placed only inside `.el-X` elements, without changing the original HTML used in `content`:

```js
// Your component
editor.Components.addType('cmp-Y', {
  // Detect '.el-Y' elements
  isComponent: (el) => el.classList?.contains('el-Y'),
  model: {
    defaults: {
      name: 'Component Y', // Simple custom name
      draggable: '.el-X', // Add `draggable` logic
    },
  },
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
  </div>`;
}
// Component
editor.Components.addType('cmp-Y', {
  // You don't need `isComponent` anymore, as types are already declared on the elements
  model: {
    defaults: {
      name: 'Component Y', // Simple custom name
      draggable: '.el-X', // Add `draggable` logic
    },
  },
});

// -- [Option 2]: Declare properties in HTML strings (less recommended option) --
{
  // ...
  content: `<div class="el-X">
    <div data-gjs-name="Component Y" data-gjs-draggable=".el-X" class="el-Y el-A">Element A</div>
    <div data-gjs-name="Component Y" data-gjs-draggable=".el-X" class="el-Y el-B">Element B</div>
    <div data-gjs-name="Component Y" data-gjs-draggable=".el-X" class="el-Y el-C">Element C</div>
  </div>`;
}
// No need for a custom component.
// You're already defining properties of each element.
```

These examples show the options available with HTML strings. We strongly recommend avoiding overuse of `Option 2` and following a component-oriented approach.
Without a dedicated component type, your HTML will be harder to read, and the properties will be hard-coded into the generic components created for those elements. This prevents you from centrally updating the component logic later (e.g., changing `draggable: '.el-X'` to `draggable: '.el-X, .el-Z'`).

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

### Avoid non-serializable properties

Don't put non-serializable properties, such as functions, in your blocks. Keep them in your component types.

```js
// Your block
{
  content: {
    type: 'my-cmp',
    script() {...},
  },
}
```

This will work, but if you try to save and reload a stored project, those properties will disappear.

### Avoid styles

Don't put styles in your blocks. Keep them in your component types.

```js
// Your block
{
  content: [
    // BAD: You risk creating conflicting styles
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

<!-- Styles imported via component definition, by using the `styles` property, are connected to that specific component type. This allows the editor to automatically remove those styles if all related components are deleted. -->

With the component-oriented approach, you risk creating conflicting styles and redundant style definitions in your project JSON.

With the HTML string, if you remove all related elements, the editor is not able to clean those styles from the project JSON, as there is no safe way to connect them.

## Programmatic usage

To manage your blocks programmatically, use the [Blocks API][Blocks API].

::: warning
Blocks API methods mainly update your Block Manager UI. They do not affect Components already dropped onto the canvas.
:::

Below is an example of commonly used methods.

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

The default Block Manager UI is useful for simple tasks and can be styled with CSS. Adding more complex elements requires replacing the default UI.

Tell the editor to use a custom UI, then subscribe to the `block:custom` event, which provides information about any requested changes.

```js
const editor = grapesjs.init({
  // ...
  blockManager: {
    // ...
    custom: true,
  },
});

editor.on('block:custom', (props) => {
  // The `props` will contain all the information you need in order to update your UI.
  // props.blocks (Array<Block>) - Array of all blocks
  // props.dragStart (Function<Block>) - A callback to trigger the start of block dragging.
  // props.dragStop (Function<Block>) - A callback to trigger the stop of block dragging.
  // props.container (HTMLElement) - The default element where you can append your UI
  // Here you would put the logic to render/update your UI.
});
```

Here's an example of a custom Block Manager using a Vue component.

<demo-viewer value="xyofm1qr" height="500" darkcode/>

In the demo above, you can also see how we decided to hide our custom Block Manager and append it to the default container, but you can adapt this to your preferences.

## Events

For a complete list of available events, check [here](/api/block_manager.html#available-events).

<!--
## Custom render <Badge text="0.14.55+"/>

To customize the appearance of each block, pass a `render` callback function in the block definition. Let's see how it works.

As a first option, you can return a simple HTML string, which will be used as the new inner content of the block. As an argument to the callback, you will receive an object containing the following properties:

* `model` - Block's model (so you can use any property passed to it)
* `el` - Currently rendered HTMLElement of the block
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

[Block]: /api/block.html
[Component]: /api/component.html
[Components]: Components.html
[Getting Started]: /getting-started.html
[Blocks API]: /api/block_manager.html
[Component Definition]: Components.html#component-definition
