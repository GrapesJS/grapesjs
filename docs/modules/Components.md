---
title: Component Manager
---

# Component Manager

A Component is a basic element of a template. It can be something simple, like an image or a text box, or a complex structure composed of other components, like a section or a page. Components allow developers to bind different behaviors to different elements. For example, opening the Asset Manager when an image is double-clicked is a custom behavior bound to that element type.

::: warning
This guide applies to GrapesJS v0.15.8 or higher.
:::

::: tip
Skip the boilerplate—use a refined component editor out of the box. [Check out the Grapes Studio SDK!](https://app.grapesjs.com/docs-sdk/configuration/components/overview?utm_source=grapesjs-docs&utm_medium=tip)
:::

[[toc]]

## How Components work

Let's see how components work by looking at what happens when an HTML string is added to the editor.

::: tip
All the following snippets can be run directly in the console of the [main demo](https://grapesjs.com/demo.html).
:::

This is how we can add new components to the canvas:

```js
// Append components directly to the canvas
editor.addComponents(`<div>
  <img src="https://path/image" />
  <span title="foo">Hello world!!!</span>
</div>`);

// Or into an existing component.
// For instance, appending to a selected component would be:
editor.getSelected().append(`<div>...`);

// Actually, editor.addComponents is an alias of...
editor.getWrapper().append(`<div>...`);
```

::: tip
If you need to append a component at a specific position, you can use the `at` option. To add a component before all others in the same collection, use:

```js
component.append('<div>...', { at: 0 });
```

Or in the middle:

```js
const { length } = component.components();
component.append('<div>...', { at: parseInt(length / 2, 10) });
```

:::

### Component Definition

First, the HTML string is parsed and transformed into a **Component Definition**. The input above would produce the following result:

```js
{
  tagName: 'div',
  components: [
    {
      type: 'image',
      attributes: { src: 'https://path/image' },
    }, {
      tagName: 'span',
      type: 'text',
      attributes: { title: 'foo' },
      components: [{
        type: 'textnode',
        content: 'Hello world!!!'
      }]
    }
  ]
}
```

The actual **Component Definition** would be a little larger, so we've simplified the JSON for this example.

You might notice that the result is similar to what is generally called a **Virtual DOM**, a lightweight representation of a DOM element. This actually helps the editor to keep track of the state of our elements and make performance-friendly changes/updates.
The meanings of properties like `tagName`, `attributes`, and `components` are fairly clear, but what about `type`? This property specifies the **Component Type** of our **Component Definition** (see the list of default components [below](#built-in-component-types)). If omitted, it defaults to `type: 'default'`.
How does the editor assign those types when starting from a simple HTML string? This step is called **Component Recognition**, and it's explained in the next section.

### Component Recognition and Component Type Stack

As mentioned earlier, when you pass an HTML string to the editor, it is parsed and compiled into a [Component Definition] with a `type` property. To determine the `type` for each parsed HTML element, the editor iterates over the **Component Type Stack**, checking each type's `isComponent` method (explained later) to see whether it matches the element. The stack is an array of component types whose order matters. Each new custom **Component Type** is added to the top of the stack. For each parsed element, the editor checks the stack from top to bottom, stopping when a type's `isComponent` method returns a truthy value. The `default` type is at the bottom of the stack.

<img :src="$withBase('/component-type-stack.svg')" class="img-ctr">

Component recognition can also rely on `isParsedNode`, which receives the normalized parsed node instead of a DOM element. If a component defines both `isParsedNode` and `isComponent`, `isParsedNode` is preferred.

::: tip
If you're importing large chunks of HTML, you can improve performance by passing Component Definition objects directly or using JSX syntax to skip parsing and component recognition.
Read [here](#setup-jsx-syntax) about how to set up a JSX syntax parser.
:::

### Component instance

Once the **Component Definition** is ready and the type is assigned, the [Component] instance can be created (also known as the **Model**). In our previous HTML string example, the `append` method returns an array of added components:

```js
const component = editor.addComponents(`<div>
  <img src="https://path/image" />
  <span title="foo">Hello world!!!</span>
</div>`)[0];
```

The Component instance contains properties and methods that allow you to retrieve and update its data.
You can read properties with the `get` method, for example, the `type`:

```js
const componentType = component.get('type'); // e.g., 'image'
```

To update properties, use `set`, which may change how a component behaves in the canvas:

```js
// Make the component not draggable
component.set('draggable', false);
```

You can also use methods like `getAttributes`, `setAttributes`, `components`, etc.

```js
const innerComponents = component.components();
innerComponents.forEach((comp) => console.log(comp.toHTML()));
// Update component content
component.components(`<div>Component 1</div><div>Component 2</div>`);
```

Each component can define its own properties and methods, but all components extend the `default` type, directly or indirectly. Later, we'll see how to create custom components and extend existing ones. Check the [Component API] for the available properties and methods.

The **main purpose of the Component** is to track its data and return it when needed. For example, you might want to retrieve its current HTML:

```js
const componentHTML = component.toHTML();
```

This will return a string containing the HTML of the component and all of its children.
The component also implements a `toJSON` method, so you can get its JSON structure like this:

```js
JSON.stringify(component);
```

::: tip
To store/load all components, use the [Storage Manager](/modules/Storage.html).
:::

The **Component instance** is responsible for the **final data** (e.g., HTML and JSON) of your templates. To add or update an HTML attribute, update its component (e.g., `component.addAttributes({ title: 'Title added' })`). The Component/Model is your **Source of Truth**.

### Component rendering

Another important aspect of components is how they are rendered in the **canvas**. This is handled by the **View**, independently of the **final HTML data**. You can return a large `<div>...</div>` string as your component's HTML but render it as a simple image in the canvas, for example, as a placeholder for complex or dynamic data.

By default, a component's View is automatically synced with its Model's data (you can't have a View without a Model). If you update the attribute of the component or append a new one as a child, the view will render it in the canvas.

Sometimes, you need additional logic to improve the component's editing experience. For example, when a user builds a `<table>`, you might want to add custom buttons in the canvas to make adding or removing columns and rows easier. You can do this in the View, where you can add DOM elements, attach event listeners, etc. These additions are independent of the final `<table>` HTML, which is handled by the Model.
Once the component is rendered, you can access its View and DOM element:

```js
const component = editor.getSelected();
// Get the View
const view = component.getView();
// Get the DOM element
const el = component.getEl();
```

Generally, you don't need to change the View, as the default one already handles synchronization with the Model. If you need more control over elements (e.g., a custom UI in the canvas), create a custom component type and extend the default View with your logic. We'll see how to create custom Component Types later.

So far, we have seen the core concept behind Components and how they work. The **Model/Component** is the **source of truth** for the final code of templates (e.g., the HTML export relies on it) and the **View/ComponentView** is what is used by the editor to **preview our components** to users in the canvas.

<!--
TODO
A more advanced use case of custom components is an implementation of a custom renderer inside of them
-->

## Built-in Component Types

Below is the list of built-in component types, ordered by their position in the **Component Type Stack**:

- [`cell`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/dom_components/model/ComponentTableCell.ts) - Component for handling `<td>` and `<th>` elements
- [`row`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/dom_components/model/ComponentTableRow.ts) - Component for handling `<tr>` elements
- [`table`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/dom_components/model/ComponentTable.ts) - Component for handling `<table>` elements
- [`thead`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/dom_components/model/ComponentTableHead.ts) - Component for handling `<thead>` elements
- [`tbody`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/dom_components/model/ComponentTableBody.ts) - Component for handling `<tbody>` elements
- [`tfoot`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/dom_components/model/ComponentTableFoot.ts) - Component for handling `<tfoot>` elements
- [`map`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/dom_components/model/ComponentMap.ts) - Component for handling `<a>` elements
- [`link`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/dom_components/model/ComponentLink.ts) - Component for handling `<a>` elements
- [`label`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/dom_components/model/ComponentLabel.ts) - Component for correctly handling `<label>` elements
- [`video`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/dom_components/model/ComponentVideo.ts) - Component for videos
- [`image`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/dom_components/model/ComponentImage.ts) - Component for images
- [`script`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/dom_components/model/ComponentScript.ts) - Component for handling `<script>` elements
- [`svg`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/dom_components/model/ComponentSvg.ts) - Component for handling SVG elements
- [`comment`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/dom_components/model/ComponentComment.ts) - Component for comments (might be useful for email editors)
- [`textnode`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/dom_components/model/ComponentTextNode.ts) - Similar to a DOM text node: text content without an enclosing tag.
- [`text`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/dom_components/model/ComponentText.ts) - A simple text component that can be edited inline
- [`wrapper`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/dom_components/model/ComponentWrapper.ts) - The root component that wraps all content in the canvas
- [`default`](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/dom_components/model/Component.ts) Default base component

## Define Custom Component Type

Now that we know how components work, we can start exploring the process of creating custom **Component Types**.

<u>The first rule of defining new component types is to place the code inside a plugin</u>. This is necessary if you want to load your custom types at the beginning, before any components are initialized (e.g., from a template loaded from a database). Plugins run before components are fetched, including when using storage, making them a suitable place to define component types.

```js
const myNewComponentTypes = (editor) => {
  editor.DomComponents.addType(/* API for component type definition */);
};

const editor = grapesjs.init({
  container: '#gjs',
  // ...
  plugins: [myNewComponentTypes],
});
```

Let's say we want the editor to recognize and better handle `<input>` elements. We can start defining our new component type like this:

```js
editor.DomComponents.addType('my-input-type', {
  // Make the editor understand when to bind `my-input-type`
  isComponent: (el) => el.tagName === 'INPUT',

  // Model definition
  model: {
    // Default properties
    defaults: {
      tagName: 'input',
      draggable: 'form, form *', // Can be dropped only inside `form` elements
      droppable: false, // Can't drop other elements inside
      attributes: {
        // Default attributes
        type: 'text',
        name: 'default-name',
        placeholder: 'Insert text here',
      },
      traits: ['name', 'placeholder', { type: 'checkbox', name: 'required' }],
    },
  },
});
```

With this code, the editor can recognize text `<input>` elements, assign default attributes, and show traits for editing those attributes.

::: tip
To better understand how Traits work, read their [dedicated page](Traits.html). We recommend finishing this page first.
:::

### isComponent

::: warning
From `v0.23.1`, prefer `isParsedNode` over `isComponent` for new component types. It is the recommended API and avoids relying on DOM-specific behavior during component recognition.
:::

Let's look at what we have done so far. The `isComponent` function, mentioned in [this section](#component-recognition-and-component-type-stack), tells the editor how to recognize `<input>` elements during component recognition.
It receives a single `el` argument, the parsed HTML node, and should return a truthy value if the element matches your condition. If we add this HTML string as a component:

```js
// ...after editor initialization
editor.addComponents(`<input name="my-test" title="hello"/>`);
```

The resulting Component Definition will be:

```js
{
  type: 'my-input-type',
  attributes: {
    name: 'my-test',
    title: 'hello',
  },
}
```

If needed, you can also customize the resulting Component Definition by returning an object as the result:

```js
editor.DomComponents.addType('my-input-type', {
  isComponent: el => {
    if (el.tagName === 'INPUT') {
      // You should explicitly declare the type of your resulting
      // object, otherwise the `default` one will be used
      const result = { type: 'my-input-type' };

      if (/* some other condition */) {
        result.attributes = { title: 'Hi' };
      }

      return result;
    }
  },
  // ...
});
```

::: danger
Keep the `isComponent` function as simple as possible
:::

**Be aware** that this method will probably receive ANY parsed element from your canvas (e.g., when loading or adding components) and not all the nodes have the same interface (e.g., properties/methods).
If you do this:

```js
// ...
// Print elements
isComponent: (el) => {
  console.log(el);
  return el.tagName === 'INPUT';
},
  // ...
  editor.addComponents(`<div>
  I'm a text node
  <!-- I'm a comment node -->
  <img alt="Image here"/>
  <input/>
</div>`);
```

All nodes will be printed. Calling something like `el.getAttribute('...')` in `isComponent` without an appropriate check will break the code: it works on the `div` but not on the text node.

The `isComponent` method is executed only when parsing is required (e.g., when adding components as an HTML string or initializing the editor with `fromElement`). If the type is already specified, `isComponent` does not need to run.
Let's see some examples:

```js
// isComponent will be executed on some-element
editor.addComponents('<some-element>...</some-element>');

// isComponent WON'T be executed on OBJECTS
// If the object has no `type` key, the `default` one will be used
editor.addComponents({
  type: 'some-component',
});

// isComponent WON'T be executed as we're forcing the type
editor.addComponents('<some-element data-gjs-type="some-component">...');
```

If you define the Component Type without using `isComponent`, the only way for the editor to see that component will be with an explicitly declared type (via an object `{ type: '...' }` or using `data-gjs-type`).

### isParsedNode

If you want to avoid DOM dependencies during component recognition, you can use `isParsedNode`.

```js
editor.Components.addType('my-input-type', {
  isParsedNode: (node) => {
    if (node.tagName === 'input') {
      return {
        type: 'my-input-type',
      };
    }
  },
  // ...
});
```

The method receives a normalized parsed node and can return the same kind of values accepted by `isComponent`.
If both `isParsedNode` and `isComponent` are provided, `isParsedNode` always has priority.

Existing `isComponent` definitions continue to work in headless parsing too. When a custom HTML code parser is active, GrapesJS provides a read-only synthetic element with common DOM-like properties such as `tagName`, `childNodes`, `children`, `getAttribute`, and `textContent`.

If one of your legacy checks needs extra helpers, extend the synthetic element globally:

```js
editor.Parser.config.customSyntheticElement = (SyntheticElement) =>
  class MySyntheticElement extends SyntheticElement {
    get foo() {
      return this.getAttribute('data-foo') || '';
    }
  };
```

### Model

Now that we understand how `isComponent` works, we can explore the `model` property.
The `model` describes your component and is probably the property you'll use most. Its `defaults` key defines the _default component properties_ and reflects the [Component Definition] described earlier.

The model also defines the resulting HTML (the exported code). You've probably noticed its `tagName` and `attributes` properties. If `tagName` is not specified, `div` is used.

Another important property is `components`, which defines default child components. We didn't use it in our input component because `<input/>` doesn't need children:

```js
defaults: {
  tagName: 'div',
  attributes: { title: 'Hello' },
  // Can be a string
  components: `
    <h1>Header test</h1>
    <p>Paragraph test</p>
  `,
  // A component definition
  components: {
    tagName: 'h1',
    components: 'Header test',
  },
  // Array of strings/component definitions
  components: [
    {
      tagName: 'h1',
      components: 'Header test',
    },
    '<p>Paragraph test</p>',
  ],
  // Or a function that receives the current model
  // and returns one of the possible values described above
  components: model => {
    return `<h1>Header test: ${model.get('type')}</h1>`;
  },
}
```

#### Read and update the model

You can read and update model properties wherever you have a reference to the model. Here are some of the most useful API methods:

```js
// let's use the selected component
const modelComponent = editor.getSelected();

// Get all the model properties
const props = modelComponent.props();

// Get a single property
const tagName = modelComponent.get('tagName');

// Update a single property
modelComponent.set('tagName', '...');

// Update multiple properties
modelComponent.set({
  tagName: '...',
  // ...
});

// Some helpers

// Get all attributes
const attrs = modelComponent.getAttributes();

// Add attributes
modelComponent.addAttributes({ title: 'Test' });

// Replace all attributes
modelComponent.setAttributes({ title: 'Test' });

// Get the collection of all inner components
modelComponent.components().forEach((inner) => console.log(inner.props()));

// Update the inner content with an HTML string/Component Definitions
const addedComponents = modelComponent.components(`<div>...</div>`);

// Find components by query string
modelComponent.find(`.query-string[example=value]`).forEach((inner) => console.log(inner.props()));
```

Whenever you make a change, the component in the canvas and its exported code update accordingly.

:::tip
For all available methods/properties, check the [Component API].
:::

#### Listen to property changes

To perform an action when a property changes, set up listeners in the `init` method:

```js
editor.DomComponents.addType('my-input-type', {
  // ...
  model: {
    defaults: {
      // ...
      someprop: 'initial value',
    },

    init() {
      this.on('change:someprop', this.handlePropChange);
      // Listen to any attribute change
      this.on('change:attributes', this.handleAttrChange);
      // Listen to title attribute change
      this.on('change:attributes:title', this.handleTitleChange);
    },

    handlePropChange() {
      const { someprop } = this.props();
      console.log('New value of someprop: ', someprop);
    },

    handleAttrChange() {
      console.log('Attributes updated: ', this.getAttributes());
    },

    handleTitleChange() {
      console.log('Attribute title updated: ', this.getAttributes().title);
    },
  },
});
```

You'll find other lifecycle methods, like `init`, [below](#lifecycle-hooks).

Now let's return to our input component and explore another useful part of component customization.

### View

When you create a component in GrapesJS, you generally expect the canvas to show a preview of what you've defined in the model. By default, the editor does exactly that, updating the canvas element whenever the model changes (e.g., its attributes or tag) to provide a **WYSIWYG** (What You See Is What You Get) experience. When building components, however, you'll sometimes need more:

- You want to improve the component editing experience.
  For example, the TextComponent view includes a built-in RTE (Rich Text Editor) that lets users edit text by double-clicking it.

  You may want to add actions that respond to DOM events or custom UI elements (e.g., buttons) around the component.

- The DOM representation of the component acts differently from what you'd expect, so you need to change some behavior.
  For example, a VideoComponent may load a YouTube video in an iframe. The iframe content runs in a separate context that the editor cannot access. Pointer interactions go to the video, preventing you from selecting the component. To handle this during rendering, we disable pointer interactions with the iframe and wrap it in another element (without the wrapper, the editor would select the parent component). These changes do not affect the final code, which remains a simple iframe.

- You need to customize the content or fill it with some data from the server

For these cases, use the `view` property in your Component Type Definition. Although an `<input>` component may not need all these features, the example below illustrates how they work:

```js
editor.DomComponents.addType('my-input-type', {
  // ...
  model: {
    // ...
  },
  view: {
    // By default, the element's tag is the same as the model's
    tagName: 'div',

    // Easily add listeners specific to the component with `events`.
    // These listeners cannot target outside objects such as window.
    // The editor manages them automatically, so you don't need to remove them
    // when the component is removed.
    events: {
      click: 'clickOnElement',
      // You can also make use of event delegation
      // and listen to events bubbled from some inner element
      'dblclick .inner-el': 'innerElClick',
    },

    innerElClick(ev) {
      ev.stopPropagation();
      // ...

      // If needed, you can access the model from any function in the view
      this.model.components('Update inner components');
    },

    // On init you can create listeners, like in the model, or start some other
    // function at the beginning
    init({ model }) {
      // Do something in view on model property change
      this.listenTo(model, 'change:prop', this.handlePropChange);

      // If you attach listeners to outside objects, remember to unbind
      // them in the `removed` function to avoid memory leaks
      this.onDocClick = this.onDocClick.bind(this);
      document.addEventListener('click', this.onDocClick);
    },

    // Callback triggered when the element is removed from the canvas
    removed() {
      document.removeEventListener('click', this.onDocClick);
    },

    // Do something with the content once the element is rendered.
    // The DOM element is passed as `el` in the argument object,
    // but you can access it from any function via `this.el`
    onRender({ el }) {
      const btn = document.createElement('button');
      btn.value = '+';
      // This is just an example, AVOID adding events on inner elements,
      // use `events` for these cases
      btn.addEventListener('click', () => {});
      el.appendChild(btn);
    },

    // Example of async content
    async onRender({ el, model }) {
      const asyncContent = await fetchSomething({
        someDataFromModel: model.get('someData'),
      });
      // Remember, these changes exist only inside the editor canvas
      // None of the DOM changes are stored in your template data;
      // if you need to store something, update the model properties
      el.appendChild(asyncContent);
    },
  },
});
```

## Update Component Type

Updating component types is easy. Here's how:

```js
const domc = editor.DomComponents;

domc.addType('some-component', {
  // You can update the isComponent logic or leave the one from `some-component`
  // isComponent: (el) => false,

  // Update the model, if you need
  model: {
    // The `defaults` property is handled differently
    // and will be merged with the old `defaults`
    defaults: {
      tagName: '...', // Overrides the old one
      someNewProp: 'Hello', // Add new property
    },
    init() {
      // Override the `init` function in `some-component`
    },
  },

  // Update the view, if you need
  view: {},
});
```

### Extend Component Type

Sometimes you would need to create a new type by extending another one. Use `extend` and `extendView` to specify the component type to extend.

```js
comps.addType('my-new-component', {
  isComponent: el => {/* ... */},
  extend: 'other-defined-component',
  model: { ... }, // Will extend the model from 'other-defined-component'
  view: { ... }, // Will extend the view from 'other-defined-component'
});
```

```js
comps.addType('my-new-component', {
  isComponent: el => {/* ... */},
  extend: 'other-defined-component',
  model: { ... }, // Will extend the model from 'other-defined-component'
  extendView: 'other-defined-component-2',
  view: { ... }, // Will extend the view from 'other-defined-component-2'
});
```

### Extend parent functions

When you need to reuse functions from the parent type you're extending, you can avoid writing this:

```js
domc.getType('parent-type').model.prototype.init.apply(this, arguments);
```

by using the `extendFn` and `extendFnView` options:

```js
domc.addType('new-type', {
  extend: 'parent-type',
  extendFn: ['init'], // array of model functions to extend from `parent-type`
  model: {
    init() {
      // do something
    },
  },
});
```

The same applies to the view using `extendFnView`.

:::tip
You can also get all current component types using `getTypes`:

```js
editor.DomComponents.getTypes().forEach((compType) => console.log(compType.id));
```

:::

## Lifecycle Hooks

Each component triggers lifecycle hooks that let you add custom actions at specific stages.
There are two types of hooks: **global** and **local**.
You define **local** hooks when creating or extending a component type, usually through `model` or `view` methods, to react to events for that type.
**Global** hooks run for any component, and you listen to them via `editor.on`. You can use them for general behavior or listen to them from other components.

Let's see below the flow of all hooks:

- **Local hook**: `model.init()` method, executed once the model of the component is initialized
- **Global hook**: `component:create` event, called right after `model.init()`. The model is passed as an argument to the callback function.
  E.g., `editor.on('component:create', model => console.log('created', model))`
- **Local hook**: `view.init()` method, executed once the view of the component is initialized
- **Local hook**: `view.onRender()` method, executed once the component is rendered on the canvas
- **Global hook**: `component:mount` event, called right after `view.onRender()`. The model is passed as an argument to the callback function.
- **Local hook**: `model.updated()` method, executes when some property of the model is updated.
- **Global hook**: `component:update` event, called after `model.updated()`. The model is passed as an argument to the callback function.
  You can also listen for changes to a specific property via `component:update:{propertyName}`
- **Local hook**: `model.removed()` method, executed when the component is removed.
- **Global hook**: `component:remove` event, called after `model.removed()`. The model is passed as an argument to the callback function.

Below is an example of how to use all the hooks:

```js
editor.DomComponents.addType('test-component', {
  model: {
    defaults: {
      testprop: 1,
    },
    init() {
      console.log('Local hook: model.init');
      this.listenTo(this, 'change:testprop', this.handlePropChange);
      // Here we can listen for global hooks with editor.on('...')
    },
    updated(property, value, prevValue) {
      console.log('Local hook: model.updated', 'property', property, 'value', value, 'prevValue', prevValue);
    },
    removed() {
      console.log('Local hook: model.removed');
    },
    handlePropChange() {
      console.log('The value of testprop', this.get('testprop'));
    },
  },
  view: {
    init() {
      console.log('Local hook: view.init');
    },
    onRender() {
      console.log('Local hook: view.onRender');
    },
  },
});

// A block for the custom component
editor.BlockManager.add('test-component', {
  label: 'Test Component',
  content: '<div data-gjs-type="test-component">Test Component</div>',
});

// Global hooks
editor.on(`component:create`, (model) => console.log('Global hook: component:create', model.get('type')));
editor.on(`component:mount`, (model) => console.log('Global hook: component:mount', model.get('type')));
editor.on(`component:update:testprop`, (model) =>
  console.log('Global hook: component:update:testprop', model.get('type')),
);
editor.on(`component:remove`, (model) => console.log('Global hook: component:remove', model.get('type')));
```

## Components & CSS

::: warning
This section applies to GrapesJS v0.17.27 or higher.
:::

If you need to add component-related styles, use the `styles` property.

```js
domc.addType('component-css', {
  model: {
    defaults: {
      attributes: { class: 'cmp-css' },
      components: `
        <span>Component with styles<span>
        <div class="cmp-css-a">Component A</div>
        <div class="cmp-css-b">Component B</div>
      `,
      styles: `
        .cmp-css { color: red }
        .cmp-css-a { color: green }
        .cmp-css-b { color: blue }

        @media (max-width: 992px) {
          .cmp-css{ color: darkred; }
          .cmp-css-a { color: darkgreen }
          .cmp-css-b { color: darkblue }
        }
      `,
    },
  },
});
```

This approach allows the editor to group these styles ([CssRule] instances) and remove them when all instances of the associated component type are removed.

::: danger Important caveat
&nbsp;
:::

In the example above, we used one custom component and default child components. Styles are declared only on the custom component. If you remove all `.cmp-css-a` and `.cmp-css-b` instances from the canvas, their CssRules will still be stored in the project (**this refers to instances stored in your project JSON; the CSS export can skip unused rules**).

The cleanest approach would be to follow component-oriented styling, where you declare styles only in the scope of the component itself. Here's how that approach applies to the example above:

```js
domc.addType('cmp-a', {
  model: {
    defaults: {
      attributes: { class: 'cmp-css-a' },
      components: 'Component A',
      styles: `
        .cmp-css-a { color: green }
        @media (max-width: 992px) {
          .cmp-css-a { color: darkgreen }
        }
      `,
    },
  },
});
domc.addType('cmp-b', {
  model: {
    defaults: {
      attributes: { class: 'cmp-css-b' },
      components: 'Component B',
      styles: `
        .cmp-css-b { color: blue }
        @media (max-width: 992px) {
          .cmp-css-b { color: darkblue }
        }
      `,
    },
  },
});
domc.addType('component-css', {
  model: {
    defaults: {
      attributes: { class: 'cmp-css' },
      components: ['<span>Component with styles<span>', { type: 'cmp-a' }, { type: 'cmp-b' }],
      styles: `
        .cmp-css { color: red }
        @media (max-width: 992px) {
          .cmp-css{ color: darkred; }
        }
      `,
    },
  },
});
```

::: tip Component-first styling
By default, when you select a component in the canvas and style it, changes are applied to its existing classes. This affects all components with those classes. To apply styles only to the selected component, enable the `componentFirst` strategy:

```js
grapesjs.init({
  ...
  selectorManager: {
    componentFirst: true,
  },
})
```

:::

### External CSS

If you need to load external component-specific CSS, you have to rely on the `script` property. For more details, refer to [Components & JS](Components-js.html).

## Components & JS

To learn how to create Components with JavaScript attached (e.g., counters, galleries, and slideshows), see
[Components & JS](Components-js.html).

## Tips

### JSX syntax

If you're importing large chunks of HTML into the editor (e.g., through Blocks), JSX can offer a balance between performance and code readability. It lets you skip parsing and component recognition while retaining HTML-like syntax.
By default, GrapesJS understands objects generated by the React JSX preset. If you're working in a React app, your environment is probably already configured to parse JSX in JavaScript files, so you don't need any additional setup.

So, instead of writing this:

```js
// I'm adding a string, so the parsing and the component recognition steps will be executed
editor.addComponents(`<div>
  <span data-gjs-type="custom-component" data-gjs-prop="someValue" title="foo">
    Hello!
  </span>
</div>`);
```

Or this:

```js
// I'm passing the Component Definition, so heavy steps will be skipped but the code is less readable
editor.addComponents({
  tagName: 'div',
  components: [
    {...}
  ],
});
```

You can use this format:

```js
editor.addComponents(
  <div>
    <custom-component data-gjs-prop="someValue" title="foo">
      Hello!
    </custom-component>
  </div>,
);
```

Another cool feature you will get by using JSX is the ability to pass component types as element tags `<custom-component>` instead of `data-gjs-type="custom-component"`.

#### Setup JSX syntax

If you're not using React, you have the following options:

- The `config.domComponents.processor` option lets you support other JSX presets. This is useful if you use JSX with a framework other than React (e.g., Vue). The object returned by the JSX pragma function (React uses `React.createElement`) will differ, and you need to transform it into a GrapesJS [Component Definition] object. You can log a JSX expression to inspect the resulting object. Below is a usage example:

```js
grapesjs.init({
  // ...
  domComponents: {
    processor: (obj) => {
     if (obj.$$typeof) { // e.g., this is a React element
        const compDef = {
         type: obj.type,
         components: obj.props.children,
         ...
        };
        ...
        return compDef;
     }
    }
  }
})
```

- If you need to support JSX from scratch without a framework that supports it, first configure a parser to transform JSX in your files into JavaScript.

For Babel users, it's just a matter of adding a few plugins: `@babel/plugin-syntax-jsx` and `@babel-plugin-transform-react`. Then update your `.babelrc` file:

```json
{
  “plugins”: [
    “@babel/plugin-syntax-jsx”,
    “@babel/plugin-transform-react-jsx”
  ]
}
```

You can also customize the pragma function that performs the transformation: `[“@babel/plugin-transform-react-jsx”, { “pragma”: “customCreateEl” }]`. By default, `React.createElement` is used (you'll need a React instance available in the file to make it work).

A complete example of this approach can be found [here](https://codesandbox.io/s/x07xf).

[Component Definition]: #component-definition
[Component]: /api/component.html
[CssRule]: /api/css_rule.html
[Component API]: /api/component.html
