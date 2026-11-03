---
title: Components & JS
---

# Components & JS

In this guide, you'll see how to attach scripts to components and work with external JavaScript libraries (e.g., counters, galleries, and slideshows).

::: warning
This guide applies to GrapesJS v0.16.34 or higher.<br><br>
To get a better understanding of the content in this guide, we recommend reading [Components](Components.html) and [Traits] first.
:::

::: tip
Prefer a modern UI that's production-ready? [Get started with the Grapes Studio SDK!](https://app.grapesjs.com/docs-sdk/configuration/components/overview?utm_source=grapesjs-docs&utm_medium=tip)
:::

[[toc]]

## Basic scripts

Let's see how to create a component with scripts.

```js
// This is our custom script (avoid using arrow functions)
const script = function () {
  alert('Hi');
  // `this` is bound to the component element
  console.log('the element', this);
};

// Define a new custom component
editor.Components.addType('comp-with-js', {
  model: {
    defaults: {
      script,
      // Add some style, just to make the component visible
      style: {
        width: '100px',
        height: '100px',
        background: 'red',
      },
    },
  },
});

// Create a block for the component, so we can drop it easily
editor.Blocks.add('test-block', {
  label: 'Test block',
  attributes: { class: 'fa fa-text' },
  content: { type: 'comp-with-js' },
});
```

Now, if you drag the new block onto the canvas, you'll see an alert and a message in the console, as you might expect.
The `this` context is bound to the component's element. For example, to change its content, you'd use `this.innerHTML = 'inner content'`.

You should also consider how the script is bound to the component when rendered in the canvas or your final template. If you check the generated HTML code in the editor (via the Export button or `editor.getHtml()`), you might see something like this:

```html
<div id="c764"></div>
<script>
  var items = document.querySelectorAll('#c764');
  for (var i = 0, len = items.length; i < len; i++) {
    (function () {
      // START component code
      alert('Hi');
      console.log('the element', this);
      // END component code
    }).bind(items[i])();
  }
</script>
```

As you can see, the editor attaches a unique ID to all components with scripts and retrieves them via `querySelectorAll`. Dragging another `test-block` will generate this:

```html
<div id="c764"></div>
<div id="c765"></div>
<script>
  var items = document.querySelectorAll('#c764, #c765');
  for (var i = 0, len = items.length; i < len; i++) {
    (function () {
      // START component code
      alert('Hi');
      console.log('the element', this);
      // END component code
    }).bind(items[i])();
  }
</script>
```

## Important caveat

::: danger
Read carefully
:::

Keep in mind that all component scripts are executed inside the iframe of the canvas (isolated, just like your **final template**), and therefore are NOT part of the current `document`. External libraries loaded alongside the editor are not available there (you'll see later how to manage components with dependencies).

That means **you can't use stuff outside of the function scope**. Take a look at this scenario:

```js
const myVar = 'John';

const script = function () {
  alert('Hi ' + myVar);
  console.log('the element', this);
};
```

This won't work. You'll get an error because `myVar` is undefined. The final HTML shows the reason more clearly:

```html
<div id="c764"></div>
<script>
  var items = document.querySelectorAll('#c764');
  for (var i = 0, len = items.length; i < len; i++) {
    (function () {
      alert('Hi ' + myVar); // <- ERROR: undefined myVar
      console.log('the element', this);
    }).bind(items[i])();
  }
</script>
```

## Passing properties to scripts

Let's say you need to make the script behave differently based on a component property, which might also be editable via [Traits] (e.g., to initialize a library with different options).
You can do it by using the `script-props` property on your component.

```js
// The `props` argument will contain only the properties you have declared in `script-props`
const script = function (props) {
  const myLibOpts = {
    prop1: props.myprop1,
    prop2: props.myprop2,
  };
  alert('My lib options: ' + JSON.stringify(myLibOpts));
};

editor.Components.addType('comp-with-js', {
  model: {
    defaults: {
      script,
      // Define default values for your custom properties
      myprop1: 'value1',
      myprop2: '10',
      // Define traits, in order to change your properties
      traits: [
        {
          type: 'select',
          name: 'myprop1',
          changeProp: true,
          options: [
            { value: 'value1', name: 'Value 1' },
            { value: 'value2', name: 'Value 2' },
          ],
        },
        {
          type: 'number',
          name: 'myprop2',
          changeProp: true,
        },
      ],
      // Define which properties to pass (changes to them will also reset your script)
      'script-props': ['myprop1', 'myprop2'],
      // ...
    },
  },
});
```

Now, if you change the traits, you'll see the script run with the updated properties.

## Dependencies

As we mentioned above, scripts are executed independently inside the canvas, without any dependencies, just as they are in the final HTML generated by the editor.
If you want to use external libraries, you have two approaches: component-related and template-related.

### Component related

The component-related approach is definitely the best one, as the dependencies will be loaded dynamically and included in the final HTML only when the component exists in the canvas.
All you have to do is to load your dependencies before executing your initialization script.

```js
const script = function (props) {
  const initLib = function () {
    const el = this;
    const myLibOpts = {
      prop1: props.myprop1,
      prop2: props.myprop2,
    };
    someExtLib(el, myLibOpts);
  };

  if (typeof someExtLib == 'undefined') {
    const script = document.createElement('script');
    script.onload = initLib;
    script.src = 'https://.../somelib.min.js';
    document.body.appendChild(script);
  } else {
    initLib();
  }
};
```

### Template related

A dependency might be used across all your components (e.g., jQuery), so instead of loading it in each script, you might want to inject it directly into the canvas:

```js
const editor = grapesjs.init({
  ...
  canvas: {
    scripts: ['https://.../somelib.min.js'],
    // The same applies to external styles
    styles: ['https://.../ext-style.min.css'],
  }
});
```

Keep in mind that the editor won't include those dependencies in the exported HTML (e.g., via `editor.getHtml()`), so it's up to you to include them in the page where that HTML is rendered.

[Traits]: Traits.html
