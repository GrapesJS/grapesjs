---
title: Component Manager
---

# Component Manager

The Component is a base element of the template. It might be something simple and atomic like an image or a text box, but also complex structures, more probably composed by other components, like sections or pages. The concept of the component was made to allow the developer to bind different behaviors to different elements. For example, opening the Asset Manager on double click of the image is a custom behavior binded to that particular type of element.

::: warning
This guide is referring to GrapesJS v0.15.8 or higher
:::

[[toc]]





## How Components work?

Let's see in detail how components work by looking at all the steps from adding an HTML string to the editor.

::: tip
All the following snippets can be run  directly in console from the [main demo](https://grapesjs.com/demo.html)
:::

This is how we can add new components to the canvas:

```js
// Append components directly to the canvas
editor.addComponents(`<div>
  <img src="https://path/image" />
  <span title="foo">Hello world!!!</span>
</div>`);

// or into some, already defined, component.
// For instance, appending to a selected component would be:
editor.getSelected().append(`<div>...`);

// Actually, editor.addComponents is an alias of...
editor.getWrapper().append(`<div>...`);
```

::: tip
If you need to append a component in at a specific position, you can use `at` option. So, to add a component on top of all others (in the same collection) you would use
```js
component.append('<div>...', { at: 0 })
```
or in the middle
```js
const { length } = component.components();
component.append('<div>...', { at: parseInt(length / 2, 10) })
```
:::



### Component Definition

In the first step, the HTML string is parsed and transformed to what is called **Component Definition**, so the result of the input above would be:

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
        content: 'Hello wdsforld!!!'
      }]
    }
  ]
}
```

The real **Component Definition** would be a little bit bigger so so we'd reduced the JSON for the sake of simplicity.

You might notice the result is similar to what is generally called a **Virtual DOM**, a lightweight representation of the DOM element. This actually helps the editor to keep track of the state of our elements and make performance-friendly changes/updates.
The meaning of properties like `tagName`, `attributes` and `components` are quite obvious, but what about `type`?! This particular property specifies the **Component Type** of our **Component Definition** (you check the list of default components [below](#built-in-component-types)) and if it's omitted, the default one will be used `type: 'default'`.
At this point, a good question would be, how the editor assigns those types by starting from a simple HTML string? This step is identified as **Component Recognition** and it's explained in detail in the next paragraph.



### Component Recognition and Component Type Stack

As we mentioned before, when you pass an HTML string as a component to the editor, that string is parsed and compiled to the [Component Definition] with a new `type` property. To understand what `type` should be assigned, for each parsed HTML Element, the editor iterates over all the defined components, called **Component Type Stack**, and checks via `isComponent` method (we will see it later) if that component type is appropriate for that element. The Component Type Stack is just a simple array of component types but what is matter is the order of those types. Any new added custom **Component Type** (we'll see later how to create them) goes on top of the Component Type Stack and each element returned from the parser iterates the stack from top to bottom (the last element of the stack is the `default` one), the iteration stops once one of the component returns a truthy value from the `isComponent` method.

<img :src="$withBase('/component-type-stack.svg')" class="img-ctr">

::: tip
If you're importing big string chunks of HTML code you might want to improve the performances by skipping the parsing and the component recognition steps by passing directly Component Definition objects or using the JSX syntax.
Read [here](#setup-jsx-syntax) about how to setup JSX syntax parser
:::



### Component instance

Once the **Component Definition** is ready and the type is assigned, the [Component] instance can be created (known also as the **Model**). Let's step back to our previous example with the HTML string, the result of the `append` method is an array of added components.

```js
const component = editor.addComponents(`<div>
  <img src="https://path/image" />
  <span title="foo">Hello world!!!</span>
</div>`)[0];
```

The Component instance contains properties and methods which allows you to obtain its data and change them.
You can read properties with the `get` method, like, for example, the `type`
```js
const componentType = component.get('type'); // eg. 'image'
```
and to update properties you'd use `set`, which might change the way a component behavies in the canvas.
```js
// Make the component not draggable
component.set('draggable', false);
```
You can also use methods like `getAttributes`, `setAttributes`, `components`, etc.

```js
const innerComponents = component.components();
innerComponents.forEach(comp => console.log(comp.toHTML()));
// Update component content
component.components(`<div>Component 1</div><div>Component 2</div>`);
```

Each component can define its own properties and methods but all of them will always extend, at least, the `default` one (then you will see how to create new custom components and how to extend the already defined) so it's good to check the [Component API] to see all available properties and methods.

The **main purpose of the Component** is to keep track of its data and to return them when necessary. One common thing you might need to ask from the component is to show its current HTML

```js
const componentHTML = component.toHTML();
```

This will return a string containing the HTML of the component and all of its children.
The component implements also `toJSON` methods so you can get its JSON structure in this way

```js
JSON.stringify(component)
```

::: tip
For storing/loading all the components you should rely on the [Storage Manager](/modules/storage.html)
:::

So, the **Component instance** is responsible for the **final data** (eg. HTML, JSON) of your templates. If you need, for example, to update/add some attribute in the HTML you need to update its component (eg. `component.addAttributes({ title: 'Title added' })`), so the Component/Model is your **Source of Truth**.



### Component rendering

Another important part of components is how they are rendered in the **canvas**, this aspect is handled by its **View**. It has nothing to do with the **final HTML data**, you can return a big `<div>...</div>` string as HTML of your component but render it as a simple image in the canvas (think about placeholders for complex/dynamic data).

By default, the view of components is automatically synced with the data of its models (you can't have a View without a Model). If you update the attribute of the component or append a new one as a child, the view will render it in the canvas.

Unfortunately, sometimes, you might need some additional logic to handle better the component result. Think about allowing a user build its `<table>` element, for this specific case you might want to add custom buttons in the canvas, so it'd be easier adding/removing columns/rows. To handle those cases you can rely on the View, where you can add additional DOM component, attach events, etc. All of this will be completely unrelated with the final HTML of the `<table>` (the result the user would expect) as it handled by the Model.
Once the component is rendered you can always access its View and the DOM element.

```js
const component = editor.getSelected();
// Get the View
const view = component.getView();
// Get the DOM element
const el =  component.getEl();
```

Generally, the View is something you wouldn't need to change as the default one handles already the sync with the Model but in case you'd need more control over elements (eg. custom UI in canvas) you'll probably need to create a custom component type and extend the default View with your logic. We'll see later how to create custom Component Types.


So far we have seen the core concept behind Components and how they work. The **Model/Component** is the **source of truth** for the final code of templates (eg. the HTML export relies on it) and the **View/ComponentView** is what is used by the editor to **preview our components** to users in the canvas.


<!--
TODO
A more advanced use case of custom components is an implementation of a custom renderer inside of them
-->





## Built-in Component Types

Here below you can see the list of built-in component types, ordered by their position in the **Component Type Stack**

* [`cell`](https://github.com/artf/grapesjs/blob/dev/src/dom_components/model/ComponentTableCell.js) - Component for handle `<td>` and `<th>` elements
* [`row`](https://github.com/artf/grapesjs/blob/dev/src/dom_components/model/ComponentTableRow.js) - Component for handle `<tr>` elements
* [`table`](https://github.com/artf/grapesjs/blob/dev/src/dom_components/model/ComponentTable.js) - Component for handle `<table>` elements
* [`thead`](https://github.com/artf/grapesjs/blob/dev/src/dom_components/model/ComponentTableHead.js) - Component for handle `<thead>` elements
* [`tbody`](https://github.com/artf/grapesjs/blob/dev/src/dom_components/model/ComponentTableBody.js) - Component for handle `<tbody>` elements
* [`tfoot`](https://github.com/artf/grapesjs/blob/dev/src/dom_components/model/ComponentTableFoot.js) - Component for handle `<tfoot>` elements
* [`map`](https://github.com/artf/grapesjs/blob/dev/src/dom_components/model/ComponentMap.js) - Component for handle `<a>` elements
* [`link`](https://github.com/artf/grapesjs/blob/dev/src/dom_components/model/ComponentLink.js) - Component for handle `<a>` elements
* [`label`](https://github.com/artf/grapesjs/blob/dev/src/dom_components/model/ComponentLabel.js) - Component for handle properly `<label>` elements
* [`video`](https://github.com/artf/grapesjs/blob/dev/src/dom_components/model/ComponentVideo.js) - Component for videos
* [`image`](https://github.com/artf/grapesjs/blob/dev/src/dom_components/model/ComponentImage.js) - Component for images
* [`script`](https://github.com/artf/grapesjs/blob/dev/src/dom_components/model/ComponentScript.js) - Component for handle `<script>` elements
* [`svg`](https://github.com/artf/grapesjs/blob/dev/src/dom_components/model/ComponentSvg.js) - Component for handle SVG elements
* [`comment`](https://github.com/artf/grapesjs/blob/dev/src/dom_components/model/ComponentComment.js) - Component for comments (might be useful for email editors)
* [`textnode`](https://github.com/artf/grapesjs/blob/dev/src/dom_components/model/ComponentTextNode.js) - Similar to the textnode in DOM definition, so a text element without a tag element.
* [`text`](https://github.com/artf/grapesjs/blob/dev/src/dom_components/model/ComponentText.js) - A simple text component that can be edited inline
* [`wrapper`](https://github.com/artf/grapesjs/blob/dev/src/dom_components/model/ComponentWrapper.js) - The canvas need to contain a root component, a wrapper, this component was made to identify it
* [`default`](https://github.com/artf/grapesjs/blob/dev/src/dom_components/model/Component.js) - Default base component





## Define Custom Component Type

Now that we know how components work, we can start exploring the process of creating custom **Component Types**.

<u>The first rule of defining new component types is to place the code inside a plugin</u>. This is necessary if you want to load your custom types at the beginning, before any component initialization (eg. a template loaded from DB). The plugin is loaded before component fetch (eg. in case of Storage use) so it's a perfect place to define component types.

```js
const myNewComponentTypes = editor => {
  editor.DomComponents.addType(/* API for component type definition */);
};

const editor = grapesjs.init({
  container : '#gjs',
  // ...
  plugins: [ myNewComponentTypes ],
});
```

Let's say we want to make the editor understand and handle better `<input>` elements. This is how we would start defining our new component type

```js
editor.DomComponents.addType('my-input-type', {
  // Make the editor understand when to bind `my-input-type`
  isComponent: el => el.tagName === 'INPUT',

  // Model definition
  model: {
    // Default properties
    defaults: {
      tagName: 'input',
      draggable: 'form, form *', // Can be dropped only inside `form` elements
      droppable: false, // Can't drop other elements inside
      attributes: { // Default attributes
        type: 'text',
        name: 'default-name',
        placeholder: 'Insert text here',
      },
      traits: [
        'name',
        'placeholder',
        { type: 'checkbox', name: 'required' },
      ],
    }
  }
});
```

With this code, the editor will be able to understand simple text `<input>`s, assign default attributes and show some trait for a better attribute handling.

::: tip
To understand better how Traits work you should read its [dedicated page](Traits.html) but we highly suggest to read it after you've finished reading this one
:::



### isComponent

Let's see in detail what we have done so far. The first thing to notice is the `isComponent` function, we have already mentioned its usage in [this](#component-recognition-and-component-type-stack) section and we need it to make the editor understand `<input>` during the component recognition step.
It receives only the `el` argument, which is the parsed HTMLElement node and expects a truthy value in case the element satisfies your logic condition. So, if we add this HTML string as component

```js
// ...after editor initialization
editor.addComponents(`<input name="my-test" title="hello"/>`)
```

The resultant Component Definition will be

```js
{
  type: 'my-input-type',
  attributes: {
    name: 'my-test',
    title: 'hello',
  },
}
```

If you need you can also customize the resultant Component Definition by returning an object as the result:

```js
editor.DomComponents.addType('my-input-type', {
  isComponent: el => {
    if (el.tagName === 'INPUT') {
      // You should explicitly declare the type of your resultant
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

**Be aware** that this method will probably receive ANY parsed element from your canvas (eg. on load or on add) and not all the nodes have the same interface (eg. properties/methods).
If you do this:

```js
// ...
// Print elements
isComponent: el => {
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

You will see printing all the nodes, so doing something like this `el.getAttribute('...')` in your `isComponent` (which will work on the `div` but not on the `text node`), without an appropriate check, will break the code.


It's also important to understand that `isComponent` is executed only if the parsing is required (eg. by adding components as HTML string or initializing the editor with `fromElement`). In case the type is already defined, there is no need for the `isComponent` to be executed.
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



### Model

Now that we got how `isComponent` works we can start to explore the `model` property.
The `model` is probably the one you'll use the most as is what is used for the description of your component and the first thing you can see is its `defaults` key which just stands for *default component properties* and it reflects the already described [Component Definition]

The model defines also what you will see as the resultant HTML (the export code) and you've probably noticed the use of `tagName` (if not specified the `div` will be used) and `attributes` properties on the model.

One another important property (not used because `<input/>` doesn't need it) might be `components`, which defines default internal components

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
  // Or a function, which get as an argument the current
  // model and expects as the return one of the possible
  // values described above
  components: model => {
    return `<h1>Header test: ${model.get('type')}</h1>`;
  },
}
```

#### Read and update the model

You can read and update the model properties wherever you have the reference to it. Here some references to the most useful API

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
modelComponent.components().forEach(
  inner => console.log(inner.props())
);

// Update the inner content with an HTML string/Component Definitions
const addedComponents = modelComponent.components(`<div>...</div>`);

// Find components by query string
modelComponent.find(`.query-string[example=value]`).forEach(
  inner => console.log(inner.props())
);
```

You'll notice that, on any change, the component in the canvas and its export code are changing accordingly

:::tip
To know all the available methods/properties check the [Component API]
:::

#### Listen to property changes

If you need to accomplish some kind of action on some property change you can set up listeners in the `init` method

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
  }
});
```

You'll find other lifecycle methods, like `init`, [below](#lifecycle-hooks)

Now let's go back to our input component integration and see another useful part for the component customization



### View

Generally, when you create a component in GrapesJS you expect to see in the canvas the preview of what you've defined in the model. Indeed, by default, the editor does the exact thing and updates the element in the canvas when something in the model changes (eg. attributes, tag, etc.) to obtain the classic **WYSIWYG** (What You See Is What You Get) experience. Unfortunately, not always the simplest thing is the right one, by building components for the builder you will notice that sometimes you'll need something more:
  * You want to improve the experience of editing of the component.
    A perfect example is the TextComponent, its view is enriched with a built-in RTE (Rich Text Editor) which enables the user to edit the text faster by double-clicking on it.

    So you'll probably feel a need adding actions to react on some DOM events or even custom UI elements (eg. buttons) around the component.

  * The DOM representation of the component acts differently from what you'd expect, so you need to change some behavior.
    An example could be a VideoComponent which, for example, is loaded from Youtube via iframe. Once the iframe is loaded, everything inside it is in a different context, the editor is not able to see it, indeed if you point your cursor on the iframe you'll interact with the video and not the editor, so you can't even select your component. To workaround this "issue", in the render, we disabled the pointer interaction with the iframe and wrapped it with another element (without the wrapper the editor would select the parent component). Obviously, all of these changes have nothing to do with the final code, the result will always be a simple iframe

  * You need to customize the content or fill it with some data from the server

For all of these cases, you can use the `view` in your Component Type Definition. The `<input>` component is probably not the best use case for this scenario but we'll try to cover most of the cases with an example below

```js
editor.DomComponents.addType('my-input-type', {
  // ...
  model: {
    // ...
  },
  view: {
    // Be default, the tag of the element is the same of the model
    tagName: 'div',

    // Add easily component specific listeners with `events`
    // Being component specific (eg. you can't attach here listeners to window)
    // you don't need to care about removing them when the component is removed,
    // they will be managed automatically by the editor
    events: {
      click: 'clickOnElement',
      // You can also make use of event delegation
      // and listen to events bubbled from some inner element
      'dblclick .inner-el': 'innerElClick',
    },

    innerElClick(ev) {
      ev.stopPropagation();
      // ...

      // If you need you can access the model from any function in the view
      this.model.components('Update inner components');
    },

    // On init you can create listeners, like in the model, or start some other
    // function at the beginning
    init({ model }) {
      // Do something in view on model property change
      this.listenTo(model, 'change:prop', this.handlePropChange);

      // If you attach listeners on outside objects remember to unbind
      // them in `removed` function in order to avoid memory leaks
      this.onDocClick = this.onDocClick.bind(this);
      document.addEventListener('click', this.onDocClick)
    },

    // Callback triggered when the element is removed from the canvas
    removed() {
      document.removeEventListener('click', this.onDocClick)
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
      // None of the DOM change is stored in your template data,
      // if you need to store something, update the model properties
      el.appendChild(asyncContent);
    }
  },
});
```





## Update Component Type

Updating component types is quite easy, let's see how:

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
      // Ovverride `init` function in `some-component`
    }
  },

  // Update the view, if you need
  view: {},
});
```



### Extend Component Type

Sometimes you would need to create a new type by extending another one. Just use `extend` and `extendView` indicating the component to extend.

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

When you need to reuse functions, from the parent you're extending, you can avoid writing this:
```js
domc.getType('parent-type').model.prototype.init.apply(this, arguments);
```
by using `extendFn` and `extendFnView` options:
```js
domc.addType('new-type', {
  extend: 'parent-type',
  extendFn: ['init'], // array of model functions to extend from `parent-type`
  model: {
    init() {
      // do something
    },
  }
});
```
The same would be for the view by using `extendFnView`


:::tip
If you need you can also get all the current component types by using `getTypes`
```js
editor.DomComponents.getTypes().forEach(compType => console.log(compType.id))
```
:::





## Lifecycle Hooks

Each component triggers different lifecycle hooks, which allows you to add custom actions at their specific stages.
We can distinguish 2 different types of hooks: **global** and **local**.
You define **local** hooks when you create/extend a component type (usually via some `model`/`view` method) and the reason is to react to an event of that
particular component type. Instead, the **global** one, will be called indistinctly on any component (you listen to them via `editor.on`) and you can make
use of them for a more generic use case or also listen to them inside other components.

Let's see below the flow of all hooks:

* **Local hook**: `model.init()` method, executed once the model of the component is initiliazed
* **Global hook**: `component:create` event, called right after `model.init()`. The model is passed as an argument to the callback function.
  Es. `editor.on('component:create', model => console.log('created', model))`
* **Local hook**: `view.init()` method, executed once the view of the component is initiliazed
* **Local hook**: `view.onRender()` method, executed once the component is rendered on the canvas
* **Global hook**: `component:mount` event, called right after `view.onRender()`. The model is passed as an argument to the callback function.
* **Local hook**: `model.updated()` method, executes when some property of the model is updated.
* **Global hook**: `component:update` event, called after `model.updated()`. The model is passed as an argument to the callback function.
  You can also listen to specific property change via `component:update:{propertyName}`
* **Local hook**: `model.removed()` method, executed when the component is removed.
* **Global hook**: `component:remove` event, called after `model.removed()`. The model is passed as an argument to the callback function.

Below you can find an example usage of all the hooks

```js
editor.DomComponents.addType('test-component', {
  model: {
    defaults: {
      testprop: 1,
    },
    init() {
      console.log('Local hook: model.init');
      this.listenTo(this, 'change:testprop', this.handlePropChange);
      // Here we can listen global hooks with editor.on('...')
    },
    updated(property, value, prevValue) {
      console.log('Local hook: model.updated',
        'property', property, 'value', value, 'prevValue', prevValue);
    },
    removed() {
      console.log('Local hook: model.removed');
    },
    handlePropChange() {
      console.log('The value of testprop', this.get('testprop'));
    }
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
editor.on(`component:create`, model => console.log('Global hook: component:create', model.get('type')));
editor.on(`component:mount`, model => console.log('Global hook: component:mount', model.get('type')));
editor.on(`component:update:testprop`, model => console.log('Global hook: component:update:testprop', model.get('type')));
editor.on(`component:remove`, model => console.log('Global hook: component:remove', model.get('type')));
```





## Components & JS

If you want to know how to create Components with javascript attached (eg. counters, galleries, slideshows, etc.) check the dedicated page
[Components & JS](Components-js.html)





## Tips

### JSX syntax

If you're importing big chunks of HTML string into the editor (eg. defined via Blocks) JSX might be a great compromise between perfomances and code readibility as it allows you to skip the parsing and the component recognition steps by keeping the HTML syntax.
By default, GrapesJS understands objects generated from React JSX preset, so, if you're working in the React app probably you're already using JSX and you don't need to do anything else, your environment is already configured to parse JSX in javascript files.

So, intead of writing this:
```js
// I'm adding a string, so the parsing and the component recognition steps will be executed
editor.addComponents(`<div>
  <span data-gjs-type="custom-component" data-gjs-prop="someValue" title="foo">
    Hello!
  </span>
</div>`);
```
or this
```js
// I'm passing the Component Definition, so heavy steps will be skipped but the code is less readable
editor.addComponents({
  tagName: 'div',
  components: [
    {...}
  ],
});
```
you can use this format
```js
editor.addComponents(<div>
  <custom-component data-gjs-prop="someValue" title="foo">
    Hello!
  </custom-component>
</div>);
```
Another cool feature you will get by using JSX is the ability to pass component types as element tags `<custom-component>` instead of `data-gjs-type="custom-component"`

#### Setup JSX syntax

For those who are not using React you have the following options:

* GrapesJS has an option, `config.domComponents.processor`, thats allows you to easily implement other JSX presets. This scenario is useful if you work with a framework different from React but that uses JSX (eg. Vue). In that case, the result object from JSX pragma function (React uses `React.createElement`) will be different (you can log the JSX to see the result object) and you have to transform that in GrapesJS [Component Definition] object. Below an example of usage

```js
grapesjs.init({
  // ...
  domComponents: {
    processor: (obj) => {
     if (obj.$$typeof) { // eg. this is a React Element
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

* In case you need to support JSX from scratch (you don't use a framework which supports JSX) you have, at first, implement the parser which transforms JSX in your files in something JS-readable.

For Babel users, it's just a matter of adding few plugins: `@babel/plugin-syntax-jsx` and `@babel-plugin-transform-react`. Then update your `.babelrc` file
  ```json
  {
    “plugins”: [
      “@babel/plugin-syntax-jsx”,
      “@babel/plugin-transform-react-jsx”
    ]
  }
  ```

  You can also customize the pragma function which executes the transformation `[“@babel/plugin-transform-react-jsx”, { “pragma”: “customCreateEl” }]`, by default `React.createElement` is used (you'll need a React instance available in the file to make it work).

  A complete example of this approach can be found [here](https://codesandbox.io/s/x07xf)





  [Component Definition]: <#component-definition>
  [Component]: </api/component.html>
  [Component API]: </api/component.html>