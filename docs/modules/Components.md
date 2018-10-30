---
title: Component Manager
---

# Component Manager

The Component is the base element for template composition. It is atomic, so elements like images, text boxes, maps, etc. fit the definition of a Component. The concept of the component was made to allow the developer to bind different behaviors to different elements. Like for example, opening the Asset Manager on double click of the image.

[[toc]]


## Built-in components
* Default (Basic)
* Text
* Image
* Video
* Link
* Map
* Table
* Row (for the table)
* Cell (for the table)



## How Components work?

When we pass an HTML string to the editor like this:

```html
<div>
  <img src="https://path/image" />
  <span title="foo">bar</span>
</div>
```

For each DOM element the editor will create and store an object representation. Every future change to the template will be made on top of this structure, which will then reflect on the canvas. So each object, usually called *Model* (or state/store), will be the source of truth for the template, but what exactly does that mean? In more practical example, once the template is rendered on the canvas, if you try to remove one of the elements using the browser inspector and then ask the editor to print the HTML (using `editor.getHtml()`) you'll see that the element will still be present. This is because the editor relies on Models and not on the DOM inside the canvas. This approach allows us to be extremely flexible on how we generate the final code (from the *Model*) and how to render it inside the canvas (from the *View*).



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

This method gives us the possibility to recognize and bind component types to each HTMLElement (div, img, iframe, etc.). Each HTML element introduced inside the canvas will be processed by `isComponent` of all available types and if it matches, the object represented the type should be returned. For example, with the image component this method looks like:

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



## Components & JS

If you want to know how to create Components with javascript attached (eg. counters, galleries, slideshows, etc.) check the dedicated page
[Components & JS](Components-&-JS)




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
Solution 2: put all the stuff inside a plugin ([Creating plugins](https://github.com/artf/grapesjs/wiki/Creating-plugins))

