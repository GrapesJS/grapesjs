---
title: Trait Manager
---

# Trait Manager

In GrapesJS, Traits can define different parameters and behaviors of a component. The user generally will see traits as the *Settings* of a component. A common use of traits is to customize element attributes (eg. `placeholder` for inputs) and in this case the editor comes already with some built-in, easy configurable, types.

[[toc]]


## Built-in trait types

* text
* number
* checkbox
* select
* color





## Add Traits to Components

You can add traits to the component by extending them or while creating a new one. Let's see in this example how to make inputs more customizable by the editor. All components, by default, contain two traits: id and title (at the moment of writing). So, if you select an input and open the Settings panel you will see this:

<img :src="$withBase('/default-traits.png')">

In this example we are going to create a new Component. ([Check here](Components) for more details about the creation of new components with a new set of traits

```js
var editor = grapesjs.init({...});
var domComps = editor.DomComponents;
var dType = domComps.getType('default');
var dModel = dType.model;
var dView = dType.view;

domComps.addType('input', {
    model: dModel.extend({
      defaults: Object.assign({}, dModel.prototype.defaults, {
        traits: [
          // strings are automatically converted to text types
          'name',
          'placeholder',
          {
            type: 'select',
            label: 'Type',
            name: 'type',
            options: [
              {value: 'text', name: 'Text'},
              {value: 'email', name: 'Email'},
              {value: 'password', name: 'Password'},
              {value: 'number', name: 'Number'},
            ]
          }, {
            type: 'checkbox',
            label: 'Required',
            name: 'required',
        }],
      }),
    }, {
      isComponent: function(el) {
        if(el.tagName == 'INPUT'){
          return {type: 'input'};
        }
      },
    }),

    view: dView,
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

