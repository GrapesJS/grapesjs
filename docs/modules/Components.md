---
title: Component Manager
---

# Component Manager

The Component is the base element for template composition. It is atomic, so elements like images, text boxes, maps, etc. fit the definition of a Component. The concept of the component was made to allow the developer to bind different behaviors to different elements. Like for example, opening the Asset Manager on double click of the image.

[[toc]]


## Built-in components
* default (Basic)
* wrapper
* text
* textnode
* svg
* script
* image
* video
* label
* link
* map
* table
* row (for the table)
* cell (for the table)



## How Components work?

When we pass an HTML string to the editor like this:

```html
<div>
  <img src="https://path/image" />
  <span title="foo">bar</span>
</div>
```

For each DOM element (`div`, `img`, `span`, etc.) the editor will create and store an object representation. Every future change to the template will be made on top of this structure, which will then reflect on the canvas. So each object, usually called *Model* (or state/store), will be the source of truth for the template, but what exactly does that mean?

In more practical example, once the template is rendered on the canvas, if you try to remove one of its elements (eg. by using the browser inspector) and ask the editor to print the HTML (using `editor.getHtml()`) you'll see that the element will still be there. This is because the editor relies on Models and not on the DOM elements inside the canvas. This approach allows us to be extremely flexible on how we generate the final code (from the *Model*) and how to render it inside the canvas (from the *View*).



# Manage Components

## Component recognition

But now, how does the editor recognize which Component to bind to the `img` element and what to do with the `span` one?
Each Component inherits, from the base one, a particular static method

```js
/**
 * @param {HTMLElement} el
 * @return {Object}
 */
isComponent: function(el) {
  ...
}
```

This method gives us the possibility to recognize and bind component types to each HTMLElement (div, img, iframe, etc.). Each **HTML string/element** introduced inside the canvas will be processed by `isComponent` of all available types and if it matches, the object represented the type should be returned. The method `isComponent` **is skipped** if you add the component object (`{ type: 'my-custom-type', tagName: 'div', attribute: {...}, ...}`) or declare the type explicitly on the element (`<div data-gjs-type="my-custom-type">...</div>`)

For example, with the image component this method looks like:

```js
// Image component
isComponent: function(el) {
  if(el.tagName == 'IMG')
    return {type: 'image'};
}
```

Let's try with something that might look a little bit tricky. What about a Google Map?!? Google Maps are generally embedded as `iframe`s, but the template can be composed by a lot of different `iframe`s. How can I tell the editor that a particular iframe is actually a Google's Map? Well, you'll have to figure out the right pattern, you have the `HTMLElement` so you can make all the checks you want. In this particular case this pattern is used:

```js
// Map component
isComponent: function(el) {
	if(el.tagName == 'IFRAME' && /maps\.google\.com/.test(el.src)) {
		return {type: 'map', src: el.src};
	}
},
```

In addition to `tagName` check, we also used the `src` property, but you can actually override it with your own logic by extending the built-in component.



## Define new Component

Let's see an example with another HTML element that is not handled by default Component types. What about `input` elements?

With the default GrapesJS configuration `input`s are treated like any other element; you can move it around, style it, etc. However, we'd like to handle this type of element more specifically. In this case, we have to create a new Component type.

Let's define few specs for our new *Input* type:

* Can be dropped only inside `form` elements
* Can't drop other elements inside it
* Can change the type of the input (text, password, email, etc.)
* Can make it required for the form

To define a new Component type you need to choose from which built-in Component inherit its properties, in our case we just gonna choose the default one. Let's see a complete example of the new type definition

```js
// Get DomComponents module
var comps = editor.DomComponents;

// Get the model and the view from the default Component type
var defaultType = comps.getType('default');
var defaultModel = defaultType.model;
var defaultView = defaultType.view;

var inputTypes = [
  {value: 'text', name: 'Text'},
  {value: 'email', name: 'Email'},
  {value: 'password', name: 'Password'},
  {value: 'number', name: 'Number'},
];

// The `input` will be the Component type ID
comps.addType('input', {
  // Define the Model
  model: defaultModel.extend({
    // Extend default properties
    defaults: Object.assign({}, defaultModel.prototype.defaults, {
      // Can be dropped only inside `form` elements
      draggable: 'form, form *',
      // Can't drop other elements inside it
      droppable: false,
      // Traits (Settings)
      traits: ['name', 'placeholder', {
          // Change the type of the input (text, password, email, etc.)
          type: 'select',
          label: 'Type',
          name: 'type',
          options: inputTypes,
        },{
          // Can make it required for the form
          type: 'checkbox',
          label: 'Required',
          name: 'required',
      }],
    }),
  },
  // The second argument of .extend are static methods and we'll put inside our
  // isComponent() method. As you're putting a new Component type on top of the stack,
  // not declaring isComponent() might probably break stuff, especially if you extend
  // the default one.
  {
    isComponent: function(el) {
      if(el.tagName == 'INPUT'){
        return {type: 'input'};
      }
    },
  }),

  // Define the View
  view: defaultType.view,
});
```

The code above is pretty much self-explanatory and as you see a lot of work is basically done on top of the Model properties.
The *View* is just extending the default one, so to cover also this part let's add some random behavior.

```js
comps.addType('input', {
  model: {...},
  view: defaultType.view.extend({
    // Bind events
    events: {
      // If you want to bind the event to children elements
      // 'click .someChildrenClass': 'methodName',
      click: 'handleClick',
      dblclick: function(){
        alert('Hi!');
      }
    },

    // It doesn't make too much sense this method inside the component
    // but it's ok as an example
    randomHex: function() {
      return '#' + Math.floor(Math.random()*16777216).toString(16);
    },

    handleClick: function(e) {
      this.model.set('style', {color: this.randomHex()}); // <- Affects the final HTML code
      this.el.style.backgroundColor = this.randomHex(); // <- Doesn't affect the final HTML code
      // Tip: updating the model will reflect the changes to the view, so, in this case,
      // if you put the model change after the DOM one this will override the backgroundColor
      // change made before
    },

    // The render() should return 'this'
    render: function () {
      // Extend the original render method
      defaultType.view.prototype.render.apply(this, arguments);
      this.el.placeholder = 'Text here'; // <- Doesn't affect the final HTML code
      return this;
    },
  }),
});
```

From the example above you can notice few interesting things: how to bind events, how to update directly the DOM and how to update the model. The difference between updating the DOM and the model is that the HTML code (the one you get with `editor.getHtml()`) is generated from the *Model* so updating directly the DOM will not affect it, it's just the change for the canvas.



## Update Component type

Here an example of how easily you can update/override the component

```js
var originalMap = comps.getType('map');

comps.addType('map', {
  model: originalMap.model.extend({
    // Override how the component is rendered to HTML
    toHTML: function() {
      return '<div>My Custom Map</div>';
    },
  }, {
    isComponent: function(el) {
      // ... new logic for isComponent
		},
  }),
  view: originalMap.view
});
```

## Improvement over addType <Badge text="0.14.50+"/>

Now, with the [0.14.50](https://github.com/artf/grapesjs/releases/tag/v0.14.50) release, defining new components or extending them is a bit easier (without breaking the old process)

* If you don't specify the type to extend, the `default` one will be used. In that case, you just
use objects for `model` and `view`
* The `defaults` property, in the `model`, will be merged automatically with defaults of the parent component
* If you use an object in `model` you can specify `isComponent` outside or omit it. In this case,
the `isComponent` is not mandatory but without it means the parser won't be able to identify the component
if not explicitly declared (eg. `<div data-gjs-type="new-component">...</div>`)

**Before**
```js
const defaultType = comps.getType('default');

comps.addType('new-component', {
  model: defaultType.model.extend({
    defaults: {
      ...defaultType.model.prototype.defaults,
      someprop: 'somevalue',
    },
    ...
  }, {
    // Even if it returns false, declaring isComponent is mandatory
    isComponent(el) {
      return false;
    },
  }),
  view: defaultType.view.extend({ ... });
});
```

**After**
```js
comps.addType('new-component', {
  // We can even omit isComponent here, as `false` return will be the default behavior
  isComponent: el => false,
  model: {
    defaults: {
      someprop: 'somevalue',
    },
    ...
  },
  view: { ... };
});
```
* If you need to extend some component, you can use `extend` and `extendView` property.
* You can now omit `view` property if you don't need to change it

**Before**
```js
const originalMap = comps.getType('map');

comps.addType('map', {
  model: originalMap.model.extend({
    ...
  }, {
    isComponent(el) {
      // ... usually, you'd reuse the same logic
    },
  }),
  // Even if I do nothing in view, I have to specify it
  view: originalMap.view
});
```
**After**

The `map` type is already defined, so it will be used as a base for the model and view.
We can skip `isComponent` if the recognition logic is the same of the extended component.
```js
comps.addType('map', {
  model: { ... },
});
```
Extend the `model` and `view` with some other, already defined, components.
```js
comps.addType('map', {
  extend: 'other-defined-component',
  model: { ... }, // Will extend 'other-defined-component'
  view: { ... }, // Will extend 'other-defined-component'
  // `isComponent` will be taken from `map`
});
```
```js
comps.addType('map', {
  extend: 'other-defined-component',
  model: { ... }, // Will extend 'other-defined-component'
  extendView: 'other-defined-component-2',
  view: { ... }, // Will extend 'other-defined-component-2'
  // `isComponent` will be taken from `map`
});
```

### Extend parent functions <Badge text="0.14.60+"/>

When you need to reuse functions, of the parent you're extending, you can avoid writing something like this in any function:
```js
domc.getType('parent-type').model.prototype.init.apply(this, arguments);
```
by using `extendFn` and `extendFnView` arrays:
```js
domc.addType('new-type', {
  extend: 'parent-type',
  extendFn: ['init'], // array of model functions to extend
  model: {
    init() {
      // do something;
    },
  }
});
```
The same would be for the view by using `extendFnView`



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




## Hints

```html
<div id="gjs">
 ...
 <cutom-element></cutom-element>
 ...
</div>

<script>
 var editor = grapesjs.init({
      container : '#gjs',
      fromElement: true,
  });

  editor.DomComponents.addType('cutom-element-type', {...});
</script>
```

In the example above the editor will not get the new type from the HTML because the content is already parsed and appended, so it'll get it only with new components (eg. from Blocks)

Solution 1: turn off `autorender`

```html
<script>
 var editor = grapesjs.init({
      autorender: 0,
      container : '#gjs',
      fromElement: true,
  });

  editor.DomComponents.addType('cutom-element-type', {...});

  // after all new types
  editor.render();
</script>
```
Solution 2: put all the stuff inside a plugin ([Creating plugins](Plugins.html))

