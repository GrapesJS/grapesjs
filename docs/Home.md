# Getting started

This page introduces you to the main options in GrapesJS and explains how it works so you can create your own custom editor.

Here's a minimal example of how to instantiate the editor:

```html
<link rel="stylesheet" href="path/to/grapes.min.css" />
<script src="path/to/grapes.min.js"></script>

<div id="gjs"></div>

<script type="text/javascript">
  var editor = grapesjs.init({
    container: '#gjs',
    components: '<div class="txt-red">Hello world!</div>',
    style: '.txt-red{color: red}',
  });
</script>
```

With just a few lines and the default configuration, you already have something to experiment with.

[[img/default-gjs.jpg]]

You'll see component commands at the top left that help you create and manage your blocks. Below them are options to highlight and export the blocks. When you select components using the 'mouse pointer' icon, you should see Class Manager and Style Manager options on the right, allowing you to customize the components' styles. There is also a Layer Manager/Navigator ('hamburger' icon) that helps you manage the structure easily.

All of these elements (panels, buttons, commands, etc.) are provided by default, so you can override them and add others. Before you start creating things, you should know that the GrapesJS UI consists of a canvas (where you will 'draw') and panels (which will contain buttons).

[[img/canvas-panels.jpg]]

If you'd like to extend an already instantiated editor, check the [API Reference]. Also see [how to create plugins](./Creating-plugins) using the same API.
In this guide, we'll focus on how to initialize the editor with a fully custom UI from scratch.

Let's start the editor with a basic toolbar panel:

```js
...
var editor = grapesjs.init({
    container : '#gjs',
    height: '100%',

    panels: {
      defaults: [{
          id: 'commands',
      }],
    }
});
...
```

In this example, we create a panel with 'commands' as its ID. After rendering, we'll see an empty div added to our panels. The new panel is already styled because 'commands' is one of the default IDs, but you can use any ID you like and place the panel wherever you want with CSS. After refreshing, we should see something like the image below, with the new panel on the left:

[[img/new-panel.png]]

> Check [Editor API Reference] for more details about editor configurations

Now let's put a button inside:

```js
...
  panels: {
    defaults  : [{
        id      : 'commands',
        buttons : [{
            id          : 'smile',
            className   : 'fa fa-smile-o',
            attributes  : { title: 'Smile' }
        }],
    }],
  }
...
```

After refreshing the page, you should see some changes ('fa fa-smile-o' comes from the FontAwesome set, so be sure to place the font directory correctly).

[[img/new-btn.png]]

The button looks nice, but it's useless without a command assigned to it. If you click it, nothing will happen.

> Check [Panels API Reference] for more details about Panels and Buttons

Assigning commands is easy, but first you should define one or use one of the defaults ([Built-in commands](./Built-in-commands)). In this case, we're going to create a new one.

```js
...
  panels: {
    defaults  : [{
        id      : 'commands',
        buttons : [{
            id          : 'smile',
            className   : 'fa fa-smile-o',
            attributes  : { title: 'Smile' },
            command     : 'helloWorld',
        }],
    }],
  },
  commands: {
    defaults: [{
        id: 'helloWorld',

        run:  function(editor, senderBtn){
          alert('Hello world!');
          // Deactivate button
          senderBtn.set('active', false);
        },

        stop:  function(editor, senderBtn){
        },
    }]
  }
...
```

As you can see, we added a new command, `helloWorld`, and used its `id` as an identifier in `button.command`. We've also implemented the two required methods, `run` and `stop`, to let the button execute the command.

[[img/btn-clicked.png]]

> Check [Commands API Reference]

Check the [demo](http://grapesjs.com/demo.html) for a more complete example of panels, buttons, and built-in commands.

## Components

Components are elements inside the canvas that can be drawn by commands or injected directly via configuration. In simple terms, components represent the structure of our HTML document. You can initialize the editor by passing components as an HTML string:

```js
...
  // Disable default local storage in case you've already used GrapesJS
  storageManager: {type: 'none'},

  components: '<div style="width:300px; min-height:100px; margin: 0 auto"></div>' +
              '<div style="width:400px; min-height:100px; margin: 0 auto"></div>' +
              '<div style="width:500px; min-height:100px; margin: 0 auto"></div>',
...
```

We added three simple components with some basic styling. If you refresh, you'll probably see the same empty page, but the components are there; you only need to highlight them.
A command already exists for this purpose, so add it to your panel like this:

```js
...
  panels: {
    defaults  : [{
        id      : 'commands',
        buttons : [
          {
            id: 'smile',
            ...
          },
          {
            id        : 'vis',
            className : 'fa fa-eye',
            command   : 'sw-visibility',
            context   : 'some-random-context', // For grouping context of buttons in the same panel
            active    : true,
          },
        ],
    }],
  },
...
```

Notice the use of the `context` option (try clicking the 'smile' command without it) and `active` to enable the button after rendering.
Now you should be able to see blocks inside the canvas.

[[img/blocks3.jpg]]

You can add other commands to enable interactions with blocks. Check [Built-in commands](./Built-in-commands) for more information.

> Check [Components API Reference]

## Style Manager

Any HTML structure will need styling at some point, so the Style Manager is included as a built-in feature in GrapesJS. The Style Manager consists of sectors that group different types of CSS properties. For instance, you can add a `Dimension` sector for `width` and `height`, and a `Typography` sector for `font-size` and `color`. It's up to you to decide how to organize sectors.

To enable this module, we use the built-in command `open-sm`, which shows the Style Manager. We're going to bind it to another button in a separate panel:

```js
...
panels: {
    defaults  : [
      {
        id      : 'commands',
        ...
      },{
        // If you use this ID, the default CSS will place this panel in the top-right corner
        id      : 'views',
        buttons : [{
            id        : 'open-style-manager',
            className : 'fa fa-paint-brush',
            command   : 'open-sm',
            active    : true,
        }]
      }
    ],
},
...
```

After this, you'll see something like the image below:

[[img/enabled-sm.jpg]]

As you can see, the Style Manager is enabled, but before using it, you have to select an element in the canvas. For this purpose, we can add another button with the built-in command `select-comp`:

```js
...
  panels: {
    defaults  : [{
        id      : 'commands',
        buttons : [
          {
            id: 'smile',
            ...
          },{
            id         : 'select',
            className : 'fa fa-mouse-pointer',
            command   : 'select-comp',
          }
        ],
    }],
  },
...
```

Selecting one of the components will show the Style Manager with default sectors, properties, and an input where you can manage classes. The default class you see (cXX) was generated by extracting styles from the component.

[[img/default-sm.jpg]]

As we explore different configurations in GrapesJS, we're going to override all the default sectors to create custom ones.

Let's add a few sectors using `buildProps`, which helps us build common properties:

```js
...
  styleManager : {
    sectors: [{
      name: 'Dimension',
      buildProps: ['width', 'min-height']
    },{
      name: 'Extra',
      buildProps: ['background-color', 'box-shadow']
    }]
  }
...
```

Now you should be able to style components.

[[img/style-comp.jpg]]

You can check the list of properties available in `buildProps` here: [Built-in properties](./Built-in-properties).
You can also build them yourself. Let's see how we'd create the previous configuration without the `buildProps` helper:

```js
...
styleManager : {
  sectors: [
    {
      name: 'Dimension',
      properties:[
        {
            // Just the name
            name      : 'Width',
            // CSS property
            property  : 'width',
            // Type of the input, options: integer | radio | select | color | file | composite | stack
            type      : 'integer',
            // Units, available only for 'integer' types
            units     : ['px', '%'],
            // Default value
            defaults  : 'auto',
            // Min value, available only for 'integer' types
            min       : 0,
        },{
            // Here I'm going to be more original
            name      : 'Minimum height',
            property  : 'min-height',
            type      : 'select',
            defaults  : '100px',
            // List of options, available only for 'select' and 'radio'  types
            list    : [{
                      value   : '100px',
                      name    : '100',
                    },{
                      value   : '200px',
                      name    : '200',
                    },{
                      value   : '300px',
                      name    : '300',
                    }],
        }
      ]
    },{
      name: 'Extra',
      // Sectors are expanded by default, so start with this one closed
      open: false,
      properties:[
        {
          name      : 'Background',
          property  : 'background-color',
          type      : 'color',
          defaults:   'none'
        },{
          name    : 'Box shadow',
          property  : 'box-shadow',
          type    : 'stack',
          preview   : true,
          // List of nested properties, available only for 'stack' and 'composite'  types
          properties  : [{
                  name:     'Shadow type',
                  // Nested properties with the stack/composite type don't require a CSS 'property' name
                  // as all of them will be merged into the parent property, e.g., box-shadow: X Y ...;
                  property:   'shadow-type',
                  type:     'select',
                  defaults:   '',
                  list:   [ { value : '', name : 'Outside', },
                              { value : 'inset', name : 'Inside', }],
                },{
                  name:     'X position',
                  property:   'shadow-x',
                  type:     'integer',
                  units:    ['px','%'],
                  defaults :  0,
                },{
                  name:     'Y position',
                  property:   'shadow-y',
                  type:     'integer',
                  units:    ['px','%'],
                  defaults :  0,
                },{
                  name:     'Blur',
                  property: 'shadow-blur',
                  type:     'integer',
                  units:    ['px'],
                  defaults :  0,
                  min:    0,
                },{
                  name:     'Spread',
                  property:   'shadow-spread',
                  type:     'integer',
                  units:    ['px'],
                  defaults :  0,
                },{
                  name:     'Color',
                  property:   'shadow-color',
                  type:     'color',
                  defaults:   'black',
                },],
        }
      ]
    }
  ]
}
...
```

As you can see, using `buildProps` will save you a lot of work. You can also combine these techniques to create custom properties in less time. For example, let's see how we can set up the same width property with a different value for `min`:

```js
...
  styleManager : {
    sectors: [{
      name: 'Dimension',
      buildProps: ['width', 'min-height'],
      properties:[{
        property: 'width', // Use 'property' as id
        min: 30
      }]
    },
    ...
  }
...
```

> Check [Style Manager API Reference]

## Store/load data

In this last part, we're going to see how to store and load template data in GrapesJS. You may have already noticed that even if you refresh the page after changing the canvas, your data is not lost. This is because GrapesJS comes with built-in storage implementations.
The default implementation uses localStorage, which stores all the data locally on your computer. Let's see the options available for this storage type:

```js
...
var editor = grapesjs.init({
    container : '#gjs',
    ...
    // Default configuration
    storageManager: {
      id: 'gjs-',             // Prefix identifier that will be used inside storing and loading
      type: 'local',          // Type of the storage
      autosave: true,         // Store data automatically
      autoload: true,         // Autoload stored data on init
      stepsBeforeSave: 1,     // If autosave is enabled, indicates how many changes are necessary before the store method is triggered
      storeComponents: false, // Enable/Disable storing of components in JSON format
      storeStyles: false,     // Enable/Disable storing of rules/style in JSON format
      storeHtml: true,        // Enable/Disable storing of components as HTML string
      storeCss: true,         // Enable/Disable storing of rules/style as CSS string
    }
});
...
```

Notice the default `id` parameter, which adds a prefix to all stored keys. If you check localStorage in your DOM panel, you'll see something like `{ 'gjs-components': '<div>....' ...}`. This helps prevent key collisions, which are quite common when using localStorage in large applications.

Storing data locally is easy and fast, but it isn't suitable for every use case. In the next example, we'll see how to set up remote storage, which is similar to the previous configuration:

```js
...
var editor = grapesjs.init({
    container : '#gjs',
    ...
    storageManager: {
      type: 'remote',
      stepsBeforeSave: 10,
      urlStore: 'http://store/endpoint',
      urlLoad: 'http://load/endpoint',
      params: {},   // For custom values on requests
    }
});
...
```

As you can see, we've left some default options unchanged, increased the number of changes necessary to trigger autosave, and provided remote endpoints.

If you prefer, you can disable autosaving and save manually using a custom command like this:

```js
...
  storageManager: {
    type: 'remote',
    autosave: false,
  },
  ...
  commands: {
    defaults: [{
        id: 'storeData',
        run:  function(editor, senderBtn){
          editor.store();
        },
    }]
  }
...
```

> Check [Storage Manager API Reference]

[API Reference]: API-Reference
[Panels API Reference]: API-Panels
[Commands API Reference]: API-Commands
[Components API Reference]: API-Components
[Style Manager API Reference]: API-Style-Manager
[Editor API Reference]: API-Editor
[Storage Manager API Reference]: API-Storage-Manager
