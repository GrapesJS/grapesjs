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


## Built-in trait types

* text
* number
* checkbox
* select
* color





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
          'name',
          'placeholder',
          {
            type: 'select', // Type of the trait
            label: 'Type', // The label you will see in Settings
            name: 'type', // The name of the attribute/property to use on component
            options: [
              { value: 'text', name: 'Text'},
              { value: 'email', name: 'Email'},
              { value: 'password', name: 'Password'},
              { value: 'number', name: 'Number'},
            ]
          }, {
            type: 'checkbox',
            label: 'Required',
            name: 'required',
        }],
      },
    },
});
```

Now the result will be

<img :src="$withBase('/input-custom-traits.png')">

Traits modify attributes of the model (which than reflected in canvas), but you can also have traits which change the property

```js
...
traits: [{
    type: 'text',
    label: 'Test',
    name: 'model-prop-name',
    changeProp: 1,
}],
...
```

In this way you're able to listen for changes and react with your own logic

```js
editor.DomComponents.addType('input', {
    model: dModel.extend({
      init() {
        this.listenTo(this, 'change:model-prop-name', this.doStuff);
      },

      doStuff() {}
    }),
    ...
});
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

