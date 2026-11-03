---
title: Getting Started
pageClass: page__getting-started
meta:
  - name: keywords
    content: grapesjs getting started
---

# Getting Started

This is a step-by-step guide for anyone who wants to create their own builder with GrapesJS. This is not a comprehensive guide, just a concise overview of the most common modules. Follow along to create a page builder from scratch. Skip to the end of this page to see the [final result](#final-result).

::: tip

Looking for a customizable version of GrapesJS with an embeddable, production-ready UI? [Explore the Grapes Studio SDK!](https://app.grapesjs.com/docs-sdk/overview/getting-started) 

:::

## Import the library

Before you start using GrapesJS, you'll have to import it. Let's import the latest version:

```html
<link rel="stylesheet" href="//unpkg.com/grapesjs/dist/css/grapes.min.css" />
<script src="//unpkg.com/grapesjs"></script>
<!--
If you need plugins, put them below the main grapesjs script
<script src="/path/to/some/plugin.min.js"></script>
-->
```

Or, if you're in a Node environment:

```js
import 'grapesjs/dist/css/grapes.min.css';
import grapesjs from 'grapesjs';
// If you need plugins, put them below the main grapesjs script
// import 'grapesjs-some-plugin';
```

## Start from the canvas

The first step is to define the interface of our editor. For this purpose, we're going to start with a basic HTML layout. Finding a common UI structure that works for every project is not an easy task. That's why GrapesJS keeps this process as simple as possible. We provide a few helpers but let you define the interface. This guarantees maximum flexibility.
The main part of the GrapesJS editor is the canvas, where you create the structure of your templates. Let's initialize the editor with the canvas and no panels.

<<< @/.vuepress/components/demos/DemoCanvasOnly.html
<<< @/.vuepress/components/demos/DemoCanvasOnly.js
<<< @/.vuepress/components/demos/DemoCanvasOnly.css
<Demo>
<DemoCanvasOnly/>
</Demo>

With just the canvas, you're already able to move, copy, and delete components in the structure. For now, we see the example template taken from the container. Next, let's look at how to create custom blocks and drag them into our canvas.

## Add Blocks

A block in GrapesJS is a reusable piece of HTML that you can drop onto the canvas. A block can be an image, a button, or an entire section with videos, forms, and iframes. Let's start by creating another container and appending a few basic blocks inside it. Later, we can use this technique to build more complex structures.

```html{4}
<div id="gjs">
  ...
</div>
<div id="blocks"></div>
```

```js
const editor = grapesjs.init({
  // ...
  blockManager: {
    appendTo: '#blocks',
    blocks: [
      {
        id: 'section', // id is mandatory
        label: '<b>Section</b>', // You can use HTML/SVG inside labels
        attributes: { class: 'gjs-block-section' },
        content: `<section>
          <h1>This is a simple title</h1>
          <div>This is just a Lorem text: Lorem ipsum dolor sit amet</div>
        </section>`,
      },
      {
        id: 'text',
        label: 'Text',
        content: '<div data-gjs-type="text">Insert your text here</div>',
      },
      {
        id: 'image',
        label: 'Image',
        // Select the component once it's dropped
        select: true,
        // You can pass components as JSON instead of a simple HTML string.
        // In this case, we also use the predefined component type `image`.
        content: { type: 'image' },
        // This triggers the `active` event on dropped components, and the `image`
        // component reacts by opening the AssetManager
        activate: true,
      },
    ],
  },
});
```

```css
.gjs-block {
  width: auto;
  height: auto;
  min-height: auto;
}
```

<Demo>
 <DemoBasicBlocks/>
</Demo>

As you can see, we add our blocks via the initial configuration. If you would like to add them dynamically, use the [Block Manager API](api/block_manager.html):

```js
editor.BlockManager.add('my-block-id', {
  label: '...',
  category: '...',
  // ...
});
```

::: tip
If you want to learn more about blocks, we suggest reading the dedicated article: [Block Manager Module](modules/Blocks.html).
:::

## Define Components

Technically, once you drop your HTML block onto the canvas, each element of the content is transformed into a GrapesJS Component. A GrapesJS Component is an object containing information about how the element is rendered in the canvas (managed in the View) and how it might look in the final code (created from the properties in the Model). Generally, all Model properties are reflected in the View. Therefore, if you add a new attribute to the model, it will be available in the exported code (which we will learn more about later), and the element you see in the canvas will be updated with the new attribute.
The unique thing about Components is that you can create a completely decoupled View. This means you can show the user whatever you want, regardless of what is in the Model. For example, when a user drags in placeholder text, you can fetch and display dynamic content in its place. If you want to learn more about Custom Components, check out the [Component Manager Module](modules/Components.html).

GrapesJS comes with a few [built-in Components](modules/Components.html#built-in-component-types) that enable different features once rendered in the canvas. For example, double-clicking an image component opens the default [Asset Manager](modules/Assets.html), which you can customize or replace with your own. By double-clicking a text component, you're able to edit it via the built-in Rich Text Editor, which is also customizable and [replaceable](guides/Replace-Rich-Text-Editor.html).

As we have seen before, you can create Blocks directly as Components:

```js
editor.BlockManager.add('my-block-id', {
  // ...
  content: {
    tagName: 'div',
    draggable: false,
    attributes: { 'some-attribute': 'some-value' },
    components: [
      {
        tagName: 'span',
        content: '<b>Some static content</b>',
      },
      {
        tagName: 'div',
        // Use `content` for static strings. A `components` string will be parsed
        // and transformed into Components.
        components: '<span>HTML at some point</span>',
      },
    ],
  },
});
```

::: tip
Check out the [Components API](api/components.html) to learn how to interact with components dynamically.
:::

Here's an example of how to select an inner component and replace its children with new content:

```js
// The wrapper is the root Component
const wrapper = editor.DomComponents.getWrapper();
const myComponent = wrapper.find('div.my-component')[0];
myComponent.components().forEach(component => /* ... do something ... */);
myComponent.components('<div>New content</div>');
```

## Panels & Buttons

Now that we have a canvas and custom blocks, let's see how to create a custom panel with buttons that trigger built-in or custom commands, using the [Panels API](api/panels.html).

```html{1,2,3}
<div class="panel__top">
    <div class="panel__basic-actions"></div>
</div>
<div id="gjs">
  ...
</div>
<div id="blocks"></div>
```

```css
.panel__top {
  padding: 0;
  width: 100%;
  display: flex;
  position: initial;
  justify-content: center;
  justify-content: space-between;
}
.panel__basic-actions {
  position: initial;
}
```

```js
editor.Panels.addPanel({
  id: 'panel-top',
  el: '.panel__top',
});
editor.Panels.addPanel({
  id: 'basic-actions',
  el: '.panel__basic-actions',
  buttons: [
    {
      id: 'visibility',
      active: true, // active by default
      className: 'btn-toggle-borders',
      label: '<u>B</u>',
      command: 'sw-visibility', // Built-in command
    },
    {
      id: 'export',
      className: 'btn-open-export',
      label: 'Exp',
      command: 'export-template',
      context: 'export-template', // For grouping context of buttons from the same panel
    },
    {
      id: 'show-json',
      className: 'btn-show-json',
      label: 'JSON',
      context: 'show-json',
      command(editor) {
        editor.Modal.setTitle('Components JSON')
          .setContent(
            `<textarea style="width:100%; height: 250px;">
            ${JSON.stringify(editor.getComponents())}
          </textarea>`,
          )
          .open();
      },
    },
  ],
});
```

<Demo>
 <DemoCustomPanels/>
</Demo>

We have defined where to render the panel using the `el` property, then added a `command` property to each button. The command could be an ID, an object with `run` and `stop` functions, or simply a single function.
Try to use [Commands](api/commands.html) when possible, as they allow you to track actions globally. Commands also execute callbacks before and after their execution (you can even interrupt them).

```js
editor.on('run:export-template:before', (opts) => {
  console.log('Before the command run');
  if (0 /* some condition */) {
    opts.abort = 1;
  }
});
editor.on('run:export-template', () => console.log('After the command run'));
editor.on('abort:export-template', () => console.log('Command aborted'));
```

::: tip
Check out the [Panels API](api/panels.html) to see all the available methods.
:::

## Layers

Another tool you might find useful when working with web elements is the Layer Manager. It provides a tree view of the nodes in your structure and enables you to manage them more easily. To enable it, you just have to specify where you want to render it.

```html{4,5,6,7,8,9,10,11}
<div class="panel__top">
    <div class="panel__basic-actions"></div>
</div>
<div class="editor-row">
  <div class="editor-canvas">
    <div id="gjs">...</div>
  </div>
  <div class="panel__right">
    <div class="layers-container"></div>
  </div>
</div>
<div id="blocks"></div>
```

<<< @/.vuepress/components/demos/DemoLayers.css

```js
const editor = grapesjs.init({
  // ...
  layerManager: {
    appendTo: '.layers-container',
  },
  // We define a default panel as a sidebar to contain layers
  panels: {
    defaults: [
      {
        id: 'layers',
        el: '.panel__right',
        // Make the panel resizable
        resizable: {
          maxDim: 350,
          minDim: 200,
          tc: false, // Top handler
          cl: true, // Left handler
          cr: false, // Right handler
          bc: false, // Bottom handler
          // As this is a flex child, we need to change the `flex-basis` property
          // instead of `width` (the default)
          keyWidth: 'flex-basis',
        },
      },
    ],
  },
});
```

<Demo>
 <DemoLayers/>
</Demo>

## Style Manager

Once you have defined the structure of the template, the next step is to style it. To meet this need, GrapesJS includes the Style Manager module, which consists of CSS style properties grouped into sectors. To make this clearer, let's see how to define a basic set.

Let's start by adding one more panel inside `panel__right` and another one in `panel__top`, which will contain a Layer/Style Manager switcher:

```html{3,8}
<div class="panel__top">
    <div class="panel__basic-actions"></div>
    <div class="panel__switcher"></div>
</div>
...
  <div class="panel__right">
    <div class="layers-container"></div>
    <div class="styles-container"></div>
  </div>
...
```

```css
.panel__switcher {
  position: initial;
}
```

```js
const editor = grapesjs.init({
  // ...
  panels: {
    defaults: [
      // ...
      {
        id: 'panel-switcher',
        el: '.panel__switcher',
        buttons: [
          {
            id: 'show-layers',
            active: true,
            label: 'Layers',
            command: 'show-layers',
            // Once activated, prevent it from being turned off
            togglable: false,
          },
          {
            id: 'show-style',
            active: true,
            label: 'Styles',
            command: 'show-styles',
            togglable: false,
          },
        ],
      },
    ],
  },
  // The Selector Manager allows you to assign classes and
  // different states (e.g., :hover) to components.
  // Generally, it's used in conjunction with the Style Manager,
  // but it's not mandatory
  selectorManager: {
    appendTo: '.styles-container',
  },
  styleManager: {
    appendTo: '.styles-container',
    sectors: [
      {
        name: 'Dimension',
        open: false,
        // Use built-in properties
        buildProps: ['width', 'min-height', 'padding'],
        // Use `properties` to define/override individual properties
        properties: [
          {
            // Type of the input,
            // options: integer | radio | select | color | slider | file | composite | stack
            type: 'integer',
            name: 'The width', // Label for the property
            property: 'width', // CSS property (if buildProps contains it, it will be extended)
            units: ['px', '%'], // Units, available only for 'integer' types
            defaults: 'auto', // Default value
            min: 0, // Min value, available only for 'integer' types
          },
        ],
      },
      {
        name: 'Extra',
        open: false,
        buildProps: ['background-color', 'box-shadow', 'custom-prop'],
        properties: [
          {
            id: 'custom-prop',
            name: 'Custom Label',
            property: 'font-size',
            type: 'select',
            defaults: '32px',
            // List of options, available only for 'select' and 'radio'  types
            options: [
              { value: '12px', name: 'Tiny' },
              { value: '18px', name: 'Medium' },
              { value: '32px', name: 'Big' },
            ],
          },
        ],
      },
    ],
  },
});

// Define commands
editor.Commands.add('show-layers', {
  getRowEl(editor) {
    return editor.getContainer().closest('.editor-row');
  },
  getLayersEl(row) {
    return row.querySelector('.layers-container');
  },

  run(editor, sender) {
    const lmEl = this.getLayersEl(this.getRowEl(editor));
    lmEl.style.display = '';
  },
  stop(editor, sender) {
    const lmEl = this.getLayersEl(this.getRowEl(editor));
    lmEl.style.display = 'none';
  },
});
editor.Commands.add('show-styles', {
  getRowEl(editor) {
    return editor.getContainer().closest('.editor-row');
  },
  getStyleEl(row) {
    return row.querySelector('.styles-container');
  },

  run(editor, sender) {
    const smEl = this.getStyleEl(this.getRowEl(editor));
    smEl.style.display = '';
  },
  stop(editor, sender) {
    const smEl = this.getStyleEl(this.getRowEl(editor));
    smEl.style.display = 'none';
  },
});
```

<Demo>
  <DemoStyle/>
</Demo>

In the Style Manager definition, we use `buildProps` to create common properties from [available built-in objects](modules/Style-manager.html#built-in-properties). Then, in `properties`, we can override those objects, identified by their `property` name (e.g., by passing another `name` to change the label). As you can see from the `custom-prop` example, it's a matter of defining the CSS `property` and the input `type`. For a more complete example of how to use Style Manager properties, see the [webpage preset demo](https://github.com/GrapesJS/grapesjs/blob/gh-pages/demo.html#L1000).

::: tip
Check the [Style Manager API](api/panels.html) to see how to update sectors and properties dynamically.
:::

<!--
To get more about style manager extension check out this guide.
Each component can also indicate what to style and what not.

-- Example component with limit styles
-->

## Traits

Most of the time, you'll style your components and place them somewhere in the structure, but sometimes your components might need custom attributes or behaviors. For this, you can use traits. Traits are commonly used to update HTML element attributes (e.g., `placeholder` for inputs or `alt` for images), but you can also define your own custom traits to access the selected Component model and customize its behavior. In this guide, we'll show you how to render the available traits. For more details on how to extend them, read the [Trait Manager Module page](modules/Traits.html).

Let's create a new container for traits. Tell the editor where to render it and update the sidebar switcher:

```html{5}
...
  <div class="panel__right">
    <div class="layers-container"></div>
    <div class="styles-container"></div>
    <div class="traits-container"></div>
  </div>
...
```

```js
const editor = grapesjs.init({
  // ...
  panels: {
    defaults: [
      // ...
      {
        id: 'panel-switcher',
        el: '.panel__switcher',
        buttons: [
          // ...
          {
            id: 'show-traits',
            active: true,
            label: 'Traits',
            command: 'show-traits',
            togglable: false,
          },
        ],
      },
    ],
  },
  traitManager: {
    appendTo: '.traits-container',
  },
});

// Define command
// ...
editor.Commands.add('show-traits', {
  getTraitsEl(editor) {
    const row = editor.getContainer().closest('.editor-row');
    return row.querySelector('.traits-container');
  },
  run(editor, sender) {
    this.getTraitsEl(editor).style.display = '';
  },
  stop(editor, sender) {
    this.getTraitsEl(editor).style.display = 'none';
  },
});
```

<Demo>
  <DemoTraits/>
</Demo>

Now, if you switch to the Trait panel and select one of the inner components, you should see its default traits.

## Responsive templates

GrapesJS implements a module which allows you to work with responsive templates easily. Let's see how to define different devices and a button for device switching:

```html{3}
<div class="panel__top">
    <div class="panel__basic-actions"></div>
    <div class="panel__devices"></div>
    <div class="panel__switcher"></div>
</div>
...
```

```css
.panel__devices {
  position: initial;
}
```

```js
const editor = grapesjs.init({
  // ...
  deviceManager: {
    devices: [
      {
        name: 'Desktop',
        width: '', // default size
      },
      {
        name: 'Mobile',
        width: '320px', // this value will be used on canvas width
        widthMedia: '480px', // this value will be used in CSS @media
      },
    ],
  },
  // ...
  panels: {
    defaults: [
      // ...
      {
        id: 'panel-devices',
        el: '.panel__devices',
        buttons: [
          {
            id: 'device-desktop',
            label: 'D',
            command: 'set-device-desktop',
            active: true,
            togglable: false,
          },
          {
            id: 'device-mobile',
            label: 'M',
            command: 'set-device-mobile',
            togglable: false,
          },
        ],
      },
    ],
  },
});

// Commands
editor.Commands.add('set-device-desktop', {
  run: (editor) => editor.setDevice('Desktop'),
});
editor.Commands.add('set-device-mobile', {
  run: (editor) => editor.setDevice('Mobile'),
});
```

<Demo>
  <DemoDevices/>
</Demo>

As you can see from the command definitions, we use the `editor.setDevice` method to change the size of the viewport. If you need to trigger an action when the device changes, you can set up a listener like this:

```js
editor.on('change:device', () => console.log('Current device: ', editor.getDevice()));
```

What about the mobile-first approach? You can achieve it by changing your configurations in this way:

```js
const editor = grapesjs.init({
  // ...
  mediaCondition: 'min-width', // default is `max-width`
  deviceManager: {
    devices: [
      {
        name: 'Mobile',
        width: '320',
        widthMedia: '',
      },
      {
        name: 'Desktop',
        width: '',
        widthMedia: '1024',
      },
    ],
  },
  // ...
});

// Set initial device as Mobile
editor.setDevice('Mobile');
```

::: tip
Check out the [Device Manager API](api/device_manager.html) to see all the available methods.
:::

## Store & load data

Once you have finished defining your builder's interface, the next step is to set up the storage and loading process.
GrapesJS implements two simple storage types in its Storage Manager: local storage (using `localStorage`, active by default) and remote storage. These cover most cases, but it's also possible to add new implementations ([grapesjs-indexeddb](https://github.com/GrapesJS/storage-indexeddb) is a good example).
Let's see how the default options work:

```js
grapesjs.init({
  // ...
  storageManager: {
    type: 'local', // Type of the storage, available: 'local' | 'remote'
    autosave: true, // Store data automatically
    autoload: true, // Autoload stored data on init
    stepsBeforeSave: 1, // If autosave is enabled, indicates how many changes are necessary before the store method is triggered
    options: {
      local: {
        // Options for the `local` type
        key: 'gjsProject', // The key for the local storage
      },
    },
  },
});
```

Let's take a look at the configuration required to set up remote storage:

```js
grapesjs.init({
  // ...
  storageManager: {
    type: 'remote',
    // ...
    stepsBeforeSave: 10,
    options: {
      remote: {
        headers: {}, // Custom headers for the remote storage request
        urlStore: 'https://your-server/endpoint/store', // Endpoint URL for storing project data
        urlLoad: 'https://your-server/endpoint/load', // Endpoint URL for loading project data
      },
    },
  },
});
```

As you might have noticed, we've left some default options unchanged, increased the number of changes necessary to trigger autosave, and provided remote endpoints.
If you prefer, you can disable autosaving and use a custom command to trigger storage:

```js
// ...
  storageManager: {
    type: 'remote',
    autosave: false,
    // ...
  },
  // ...
  commands: {
    defaults: [
      // ...
      {
        id: 'store-data',
        run(editor) {
          editor.store();
        },
      }
    ]
  }
// ...
```

For a better overview of the Storage Manager, including how to store/load templates and define new storage types, read the [Storage Manager Module](modules/Storage.html) page.

## Theming

One last step that can give your editor more personality is customizing its appearance. To make theming easy, we have adopted an atomic design approach. For example, to customize the main color palette, all you have to do is place your custom CSS rules after the GrapesJS styles.

To complete our builder, let's customize its color palette. To make the interface easier to scan, we can also replace all button labels with SVG icons:

```css
/* We can remove the border we've set at the beginning */
#gjs {
  border: none;
}
/* Theming */

/* Primary color for the background */
.gjs-one-bg {
  background-color: #78366a;
}

/* Secondary color for the text color */
.gjs-two-color {
  color: rgba(255, 255, 255, 0.7);
}

/* Tertiary color for the background */
.gjs-three-bg {
  background-color: #ec5896;
  color: white;
}

/* Quaternary color for the text color */
.gjs-four-color,
.gjs-four-color-h:hover {
  color: #ec5896;
}
```

There are also several [CSS custom properties (variables)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) that you can use to customize the editor's styles.

For example, you could achieve the same result as above by doing this:

```css
:root {
  --gjs-primary-color: #78366a;
  --gjs-secondary-color: rgba(255, 255, 255, 0.7);
  --gjs-tertiary-color: #ec5896;
  --gjs-quaternary-color: #ec5896;
}
```

And here is our final result:

<Demo id="final-result">
  <DemoTheme/>
</Demo>
