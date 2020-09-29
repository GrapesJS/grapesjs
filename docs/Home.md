# Getting started

This page will introduce you to the main options of GrapesJS and how it works, in the way to be able to create your custom editor.

The pretty minimalistic way to instantiate the editor could be like this:

```html
<link rel="stylesheet" href="path/to/grapes.min.css">
<script src="path/to/grapes.min.js"></script>

<div id="gjs"></div>

<script type="text/javascript">
  var editor = grapesjs.init({
      container : '#gjs',
      components: '<div class="txt-red">Hello world!</div>',
      style: '.txt-red{color: red}',
  });
</script>
```
In just few lines, with the default configurations, you're already able to see something with which play around.

[[img/default-gjs.jpg]]

You'll see components commands on top left position that come handy to create and manage your blocks, below there are options which need to highlight and export them. When you select components ('mouse pointer' icon), on the right side, you should see pop up Class Manager and Style Manager options which allow to customize the style of the components. There is also a Layer Manager/Navigator ('hamburger' icon) which helps to manage easily the structure.

Of course all those stuff (panels, buttons, commands, etc.) are set just as default so you can overwrite them and add more other. Before you start to create things you should know that GrapesJS UI is composed basically by a canvas (where you will 'draw') and panels (which will contain buttons)

[[img/canvas-panels.jpg]]


If you'd like to extend the already instantiated editor you have to check [API Reference]. Check also [how to create plugins](./Creating-plugins) using the same API.
In this guide we'll focus on how to initialize the editor with all custom UI from scratch.

Let's start the editor with some basic toolbar panel

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
In this example we set a panel with 'commands' as an id and after the render we'll see nothing more than an empty div added to our panels. The new panel is already styled as the id 'commands' is one of the default but you can use whatever you like and place it wherever you want with CSS. With refresh we might see something like shown in the image below, with the new panel on the left:

[[img/new-panel.png]]

> Check [Editor API Reference] for more details about editor configurations

Now let's put some button inside

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

On refresh the page might present some changes ('fa fa-smile-o' are from FontAwesome set, so be sure to have placed correctly the font directory)

[[img/new-btn.png]]

Yeah, the button is pretty nice and happy, but useless without any command assigned, if you click on it nothing gonna happen.

> Check [Panels API Reference] for more details about Panels and Buttons


Assigning commands is pretty easy, but before you should define one or use one of defaults ([Built-in commands](./Built-in-commands)). So in this case we gonna create a new one.

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
As you see we added a new command `helloWorld` and used its `id` as an identifier inside `button.command`. In addition to this we've also implemented two required methods, `run` and `stop`, to make button execute commands.

[[img/btn-clicked.png]]


> Check [Commands API Reference]


Check the [demo](http://grapesjs.com/demo.html) for more complete usage of panels, buttons and built-in commands.


## Components

Components are elements inside the canvas, which can be drawn by commands or injected directly via configurations. In simple terms components represent the structure of our HTML document. You can init the editor with passing components as an HTML string

```js
...
  // Disable default local storage in case you've already used GrapesJS
  storageManager: {type: 'none'},

  components: '<div style="width:300px; min-height:100px; margin: 0 auto"></div>' +
              '<div style="width:400px; min-height:100px; margin: 0 auto"></div>' +
              '<div style="width:500px; min-height:100px; margin: 0 auto"></div>',
...
```
We added 3 simple components with some basic style. If you refresh probably you'll see the same empty page but are actually there, you only need to highlight them.
For this purpose already exists a command, so add it to your panel in this way

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
Worth noting the use of `context` option (try to click 'smile' command without it) and `active` to enable it after the render.
Now you should be able to see blocks inside canvas.

[[img/blocks3.jpg]]

You could add other commands to enable interactions with blocks. Check [Built-in commands](./Built-in-commands) to get more information

> Check [Components API Reference]


## Style Manager

Any HTML structure requires, at some point, a proper style, so to meet this need the Style Manager was added as a built-in feature in GrapesJS. Style manager is composed by sectors, which group inside different types of CSS properties. So you can add, for instance, a `Dimension` sector for `width` and `height`, and another one as `Typography` for `font-size` and `color`. So it's up to you decide how organize sectors.

To enable this module we rely on a built-in command `open-sm`, which shows up the Style Manager, which we gonna bind to another button in a separate panel

```js
...
panels: {
    defaults  : [
      {
        id      : 'commands',
        ...
      },{
        // If you use this id the default CSS will place this panel on top right corner for you
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

After this you'll be able to see something like in the image below

[[img/enabled-sm.jpg]]

As you can see Style Manager is enabled but before using it you have to select an element in the canvas, for this purpose we can add another button with a built-in command `select-comp` in this way

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

Selecting one of the component will show up the Style Manager with default sectors, properties and an input where you can manage classes. The default class you see (cXX) was generated by extracting style from the component

[[img/default-sm.jpg]]

As we exploring different configurations inside GrapesJS we gonna overwrite all the default sectors to create some custom one

Let's put a few sectors with use of `buildProps` which helps us building common properties

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

Now you should be able to style components

[[img/style-comp.jpg]]

You can check the list of usable properties inside `buildProps` here: [Built-in properties](./Built-in-properties)
otherwise is possible to build them on your own, let's see how we'd have done the previous configuration without the `buildProps` helper

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
      // Sectors are expanded by default so put this one closed
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
                  // Nested properties with stack/composite type don't require proper 'property' name
                  // as all of them will be merged to parent property, eg. box-shadow: X Y ...;
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

As you can see using `buildProps` actually will save you a lot of work. You could also mix this techniques to obtain custom properties in less time. For example, let's see how can we setup the same width but with a different value of `min`:

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

In this last part we're gonna see how to store and load template data inside GrapesJS. You may already noticed that even if you refresh the page after changes on canvas your data are not lost and this because GrapesJS comes with some built-in storage implementation.
The default one is the localStorage which is pretty simple and all the data are stored locally on your computer. Let's see the options available for this storage

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
      stepsBeforeSave: 1,     // If autosave enabled, indicates how many changes are necessary before store method is triggered
      storeComponents: false, // Enable/Disable storing of components in JSON format
      storeStyles: false,     // Enable/Disable storing of rules/style in JSON format
      storeHtml: true,        // Enable/Disable storing of components as HTML string
      storeCss: true,         // Enable/Disable storing of rules/style as CSS string
    }
});
...
```

Worth noting the defaut `id` parameter which adds a prefix for all keys to store. If you check the localStorage inside your DOM panel you'll see something like `{ 'gjs-components': '<div>....' ...}` in this way it prevents the risk of collisions, quite common with localStorage use in large applications.

Storing data locally it's easy and fast but useless in some common cases. In the next example we'll see how to setup a remote storage, which is not far from the previous one

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

As you can see we've left some default option unchanged, increased changes necessary for autosave triggering and passed remote endpoints.

If you prefer you could also disable autosaving and do it by yourself using some custom command in this way:

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


[API Reference]: <API-Reference>
[Panels API Reference]: <API-Panels>
[Commands API Reference]: <API-Commands>
[Components API Reference]: <API-Components>
[Style Manager API Reference]: <API-Style-Manager>
[Editor API Reference]: <API-Editor>
[Storage Manager API Reference]: <API-Storage-Manager>