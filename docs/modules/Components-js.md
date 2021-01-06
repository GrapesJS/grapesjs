---
title: Components & JS
---

# Components & JS

In this guide you'll see how to attach component related scripts and deal with external JavaScript libraries (eg. counters, galleries, slideshows, etc.)

::: warning
This guide is referring to GrapesJS v0.16.34 or higher.<br><br>
To get a better understanding of the content in this guide, we recommend reading [Components](Components.html) and [Traits] first
:::

[[toc]]


## Basic scripts

Let's see how to create a component with scripts.

```js
// This is our custom script (avoid using arrow functions)
const script = function() {
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
      }
    }
  }
});

// Create a block for the component, so we can drop it easily
editor.Blocks.add('test-block', {
  label: 'Test block',
  attributes: { class: 'fa fa-text' },
  content: { type: 'comp-with-js' },
});
```
Now if you drag the new block inside the canvas you'll see an alert and the message in console, as you might expect.
One thing worth noting is that `this` context is bound to the component's element, so, for example, if you need to change its property, you'd do `this.innerHTML = 'inner content'`.

One thing you should take into account is how the script is bound to component once rendered in the canvas or in your final template. If now you check the generated HTML code in the editor (via Export button or `editor.getHtml()`), you might see something like this:

```html
<div id="c764"></div>
<script>
  var items = document.querySelectorAll('#c764');
  for (var i = 0, len = items.length; i < len; i++) {
    (function(){
      // START component code
      alert('Hi');
      console.log('the element', this)
      // END component code
    }.bind(items[i]))();
  }
</script>
```

As you see the editor attaches a unique ID to all components with scripts and retrieves them via `querySelectorAll`. Dragging another `test-block` will generate this:

```html
<div id="c764"></div>
<div id="c765"></div>
<script>
  var items = document.querySelectorAll('#c764, #c765');
  for (var i = 0, len = items.length; i < len; i++) {
    (function(){
      // START component code
      alert('Hi');
      console.log('the element', this)
      // END component code
    }.bind(items[i]))();
  }
</script>
```

## Important caveat

::: danger
Read carefully
:::

Keep in mind that all component scripts are executed inside the iframe of the canvas (isolated, just like your **final template**), and therefore are NOT part of the current `document`. All your external libraries (eg. those you're loading along with the editor) are not there (you'll see later how to manage components with dependencies).

That means **you can't use stuff outside of the function scope**. Take a look at this scenario:

```js
const myVar = 'John';

const script = function() {
  alert('Hi ' + myVar);
  console.log('the element', this);
};
```

This won't work. You'll get an error of the undefined `myVar`. The final HTML shows the reason more clearly

```html
<div id="c764"></div>
<script>
  var items = document.querySelectorAll('#c764');
  for (var i = 0, len = items.length; i < len; i++) {
    (function(){
      alert('Hi ' + myVar); // <- ERROR: undefined myVar
      console.log('the element', this);
    }.bind(items[i]))();
  }
</script>
```

## Passing properties to scripts

Let's say you need to make the script behave differently, based on some component property, maybe also changable via [Traits] (eg. you want to initiliaze some library with different options).
You can do it by using the `script-props` property on your component.

```js
// The `props` argument will contain only the properties you have declared in `script-props`
const script = function(props) {
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
        }, {
          type: 'number',
          name: 'myprop2',
          changeProp: true,
        }
      ],
      // Define which properties to pass (this will also reset your script on their changes)
      'script-props': ['myprop1', 'myprop2'],
      // ...
    }
  }
});
```
Now, if you try to change traits, you'll also see how the script will be triggered with the new updated properties.





## Dependencies

As we mentioned above, scripts are executed independently inside the canvas, without any dependencies, exactly as the final HTML generated by the editor.
If you want to make use of external libraries you have two approaches: component-related and template-related.

### Component related

The component related approach is definitely the best one, as the dependencies will be loaded dynamically and printed in the final HTML only when the component exists in the canvas.
All you have to do is to load your dependencies before executing your initialization script.

```js
const script = function(props) {
  const initLib = function() {
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

A dependency might be used along all your components (eg. JQuery) so instead requiring it inside each script you might want to inject it directly inside the canvas:

```js
const editor = grapesjs.init({
  ...
  canvas: {
    scripts: ['https://.../somelib.min.js'],
    // The same would be for external styles
    styles: ['https://.../ext-style.min.css'],
  }
});
```
Keep in mind that the editor won't render those dependencies in the exported HTML (eg. via `editor.getHtml()`), so it's up to you how to include them in the final page where the final HTML is rendered.



[Traits]: <Traits.html>