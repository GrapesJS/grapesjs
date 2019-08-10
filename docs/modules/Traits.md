---
title: Trait Manager
---

# Trait Manager

In GrapesJS, Traits define different parameters and behaviors of a component. The user generally will see traits as the *Settings* of a component. A common use of traits is to customize element attributes (eg. `placeholder` for `<input>`) or you can also bind them to the properties of your components and react on their changes.

::: warning
This guide is referring to GrapesJS v0.14.67 or higher.<br><br>
To get a better understanding of the content in this guide we recommend reading [Components](Components.html) first
:::

[[toc]]




## Add Traits to Components

Generally you define traits on the definition of your new custom components (or by extending another one). Let's see in this example how to make inputs more customizable by the editor.

All components, by default, contain two traits: `id` and `title` (at the moment of writing). So, if you select an input and open the Settings panel you will see this:

<img :src="$withBase('/default-traits.png')">

We can start by creating e new custom `input` component in this way:

```js
editor.DomComponents.addType('input', {
    isComponent: el => el.tagName == 'INPUT',
    model: {
      defaults: {
        traits: [
          // Strings are automatically converted to text types
          'name', // Same as: { type: 'text', name: 'name' }
          'placeholder',
          {
            type: 'select', // Type of the trait
            label: 'Type', // The label you will see in Settings
            name: 'type', // The name of the attribute/property to use on component
            options: [
              { id: 'text', name: 'Text'},
              { id: 'email', name: 'Email'},
              { id: 'password', name: 'Password'},
              { id: 'number', name: 'Number'},
            ]
          }, {
            type: 'checkbox',
            name: 'required',
        }],
        // As by default, traits are binded to attributes, so to define
        // their initial value we can use attributes
        attributes: { type: 'text', required: true },
      },
    },
});
```

Now the result will be

<img :src="$withBase('/input-custom-traits.png')">

If you want you can also define traits dinamically via functions, which will be created on component initialization. It might be useful if you need to create traits based on some other component characteristic.

```js
editor.DomComponents.addType('input', {
    isComponent: el => el.tagName == 'INPUT',
    model: {
      defaults: {
        traits(component) {
          const result = [];

          // Example of some logic
          if (component.get('draggable')) {
            result.push('name');
          } else {
            result.push({
              type: 'select',
              // ....
            });
          }

          return result;
        }
      },
    },
});
```

If you need to react to some change of the trait you can subscribe to their attribute listeners

```js
editor.DomComponents.addType('input', {
  model: {
    defaults: {
      // ...
    },

    init() {
      this.on('change:attributes:type', this.handleTypeChange);
    },

    handleTypeChange() {
      const attrs = this.getAttributes();
      console.log('Input type changed to: ', attrs['type']);
    },
  }
})
```

As already mentioned, by default, traits modify attributes of the model, but you can also bind them to the properties by using `changeProp` options.

```js
editor.DomComponents.addType('input', {
  model: {
    defaults: {
      // ...
      traits: [
        {
          name: 'placeholder',
          changeProp: 1,
        }
        // ...
      ],
      // As we switched from attributes to properties the
      // initial value should be set from the property
      placeholder: 'Initial placeholder',
    },

    init() {
      // Also the listener changes from `change:attributes:*` to `change:*`
      this.on('change:placeholder', this.handlePlhChange);
    },
    // ...
  }
})
```

## Built-in trait types

GrapesJS comes along with few built-in types that you can use to define your traits:

* **Text** - Simple text input
```js
{
  type: 'text', // If you don't specify the type, the `text` is the default one
  name: 'my-trait', // Required and available for all traits
  label: 'My trait', // The label you will see near the input
  placeholder: 'Insert text', // Placeholder to show inside the input
}
```
* **Number** - Number input
```js
{
  type: 'number',
  // ...
  placeholder: '0-100',
  min: 0, // Minimum number value
  max: 100, // Maximum number value
  step: 5, // Number of steps
}
```
* **Checkbox** - Simple checkbox input
```js
{
  type: 'checkbox',
  // ...
  valueTrue: 'YES', // Value to assign when is checked, default: `true`
  valueFalse: 'NO', // Value to assign when is unchecked, default: `false`
}
```
* **Select** - Select input
```js
{
  type: 'select',
  // ...
  options: [ // Array of options
    { id: 'opt1', name: 'Option 1'},
    { id: 'opt2', name: 'Option 2'},
  ]
}
```
* **Color** - Color picker
```js
{
  type: 'color',
  // ...
}
```

## Updating traits at run-time

If you need to change some trait on your component you can update it wherever you want by using [Component API](/api/component.html)

The trait is a simple property of the component so to get the complete list of current traits you can use this:

```js
const component = editor.getSelected(); // Component selected in canvas
const traits = component.get('traits');
traits.forEach(trait => console.log(trait.props()))
```

In case you need a single one:

```js
const component = editor.getSelected();
console.log(component.getTrait('type').props()); // Finds by the `name` of the trait
```

If you want, for example, updating some property of the trait, do this:

```js
// Let's update `options` of our `type` trait, defined in Input component
const component = editor.getSelected();
component.getTrait('type').set('options', [
  { id: 'opt1', name: 'New option 1'},
  { id: 'opt2', name: 'New option 2'},
]);
// or with multiple values
component.getTrait('type').set({
  label: 'My type',
  options: [...],
});
```

You can also easily add new traits or remove some other by using [`addTrait`](/api/component.html#addtrait)/[`removeTrait`](/api/component.html#removetrait)

```js
// Add new trait
const component = editor.getSelected();
component.addTrait({
  type: 'text',
  ...
}, { at: 0 });
// The `at` option indicates the index where to place the new trait,
// without it, the trait will be appended at the end of the list

// Remove trait
component.removeTrait('type');
```



## Define new Trait type

If built-in types are not enough (eg. something with more complex UI) you can define a new one.
Let's see this simple `textarea` element which updates contents of the component.

```js
// Each new type extends the default Trait
editor.TraitManager.addType('content', {
  events:{
    'keyup': 'onChange',  // trigger parent onChange method on keyup
  },

  /**
  * Returns the input element
  * @return {HTMLElement}
  */
  getInputEl: function() {
    if (!this.inputEl) {
      var input = document.createElement('textarea');
      input.value = this.target.get('content');
      this.inputEl = input;
    }
    return this.inputEl;
  },

  /**
   * Triggered when the value of the model is changed
   */
  onValueChange: function () {
    this.target.set('content', this.model.get('value'));
  }
});

// And then use it in your component
...
traits: [{
    type: 'content',
}],
...
```

