---
title: Asset Manager
---

# Asset Manager

<p align="center"><img src="http://grapesjs.com/img/sc-grapesjs-assets-1.jpg" alt="GrapesJS - Asset Manager" align="center"/></p>

In this section, you will see how to set up and take full advantage of the built-in Asset Manager in GrapesJS. The Asset Manager is lightweight and includes only the `image` asset type in its core, but as you'll see, it's easy to extend and create your own asset types.

::: tip
Want an asset manager that looks great out of the box? [Try the Grapes Studio SDK!](https://app.grapesjs.com/docs-sdk/configuration/assets/overview?utm_source=grapesjs-docs&utm_medium=tip)
:::

[[toc]]

## Configuration

To change the default configuration, pass the `assetManager` property in the main configuration object:

```js
const editor = grapesjs.init({
  ...
  assetManager: {
    assets: [...],
    ...
  }
});
```

You can update most options later using the module's `getConfig` method:

```js
const amConfig = editor.AssetManager.getConfig();
```

Check the full list of available options here: [Asset Manager Config](https://github.com/GrapesJS/grapesjs/blob/master/src/asset_manager/config/config.ts)

## Initialization

The Asset Manager is ready to work by default, so pass a few URLs to see them loaded:

```js
const editor = grapesjs.init({
  ...
  assetManager: {
    assets: [
     'https://placeholder.photo/350x250/78c5d6/fff?text=image1.jpg',
     // Pass an object with your properties
     {
       type: 'image',
       src: 'https://placeholder.photo/350x250/459ba8/fff?text=image2.jpg',
       height: 350,
       width: 250,
       name: 'displayName'
     },
     {
       // As 'image' is the base asset type, omitting the type
       // will default to `image`
       src: 'https://placeholder.photo/350x250/79c267/fff?text=image3.jpg',
       height: 350,
       width: 250,
       name: 'displayName'
     },
    ],
  }
});
```

For a complete list of available properties, check the [AssetImage Model source](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/asset_manager/model/AssetImage.ts).

The built-in Asset Manager modal appears when requested. By default, you can open it by dragging Image Components onto the canvas, double-clicking images, or using other image-related features (e.g., CSS styling).

<img :src="$withBase('/assets-builtin-modal.png')">

<!--
A command is registered to open the modal, so you can use this:

```js
// This command shows only assets with `image` type
editor.runCommand('open-assets');
```


This alone doesn't let you do much with assets: double-clicking them has no effect because you haven't specified a target. Select an image in your canvas and run this in the console (first make the editor globally available by adding `window.editor = editor;` to your script):

```js
editor.runCommand('open-assets', {
  target: editor.getSelected()
});
```

Now you should be able to change the image of the component.
-->

## Uploading assets

The default Asset Manager also includes an easy-to-use drag-and-drop uploader with a few UI helpers. The default uploader is already visible when you open the Asset Manager.

<img :src="$withBase('/assets-uploader.png')">

You can click on the uploader to select your files or just drag them directly from your computer to trigger the uploader. Before it will work, you have to set up your server to receive assets and specify the upload endpoint in your configuration:

```js
const editor = grapesjs.init({
  ...
  assetManager: {
    ...
    // Upload endpoint, set `false` to disable upload, default `false`
    upload: 'https://endpoint/upload/assets',

    // The name used in POST to pass uploaded files, default: `'files'`
    uploadName: 'files',
    ...
  },
  ...
});
```

### Listeners

To execute an action before/after uploading (e.g., showing a loading animation) or when a response arrives, use these listeners:

```js
// The upload has started
editor.on('asset:upload:start', () => {
  startAnimation();
});

// The upload has ended (successfully or otherwise)
editor.on('asset:upload:end', () => {
  endAnimation();
});

// Error handling
editor.on('asset:upload:error', (err) => {
  notifyError(err);
});

// Do something on response
editor.on('asset:upload:response', (response) => {
  ...
});
```

### Response

When uploading finishes, the editor expects a JSON response containing the uploaded assets under a `data` key and tries to add them to the main collection by default (via the configuration parameter `autoAdd: 1`). The JSON might look like this:

```js
{
  data: [
    'https://.../image.png',
    // ...
    {
      src: 'https://.../image2.png',
      type: 'image',
      height: 100,
      width: 200,
    },
    // ...
  ];
}
```

<!-- Deprecated
### Setup Dropzone

There is another helper which improves the uploading of assets: A full-width editor dropzone.

<img :src="$withBase('/assets-full-dropzone.gif')">


Activate it and optionally set custom content (you might also want to hide the default uploader):

```js
const editor = grapesjs.init({
  ...
  assetManager: {
    ...,
    dropzone: 1,
    dropzoneContent: '<div class="dropzone-inner">Drop here your assets</div>'
  }
});
``` -->

## Programmatic usage

To manage your assets programmatically, use the [Asset Manager API][API-Asset-Manager].

```js
// Get the Asset Manager module first
const am = editor.AssetManager;
```

The Asset Manager keeps two collections of assets:

- **global** - Contains all available assets. Access it with `am.getAll()`.
- **visible** - Contains the assets currently rendered by the Asset Manager. Access it with `am.getAllVisible()`.

This allows you to decide which assets to show and when. Let's say we'd like to have a category switcher. First, add all your assets to the **global** collection (you may have already defined them during initialization with `config.assetManager.assets = [...]`):

```js
am.add([
  {
    // You can pass any custom property you want
    category: 'c1',
    src: 'https://placeholder.photo/350x250/78c5d6/fff?text=image1.jpg',
  },
  {
    category: 'c1',
    src: 'https://placeholder.photo/350x250/459ba8/fff?text=image2.jpg',
  },
  {
    category: 'c2',
    src: 'https://placeholder.photo/350x250/79c267/fff?text=image3.jpg',
  },
  // ...
]);
```

Now, if you call `render()` without an argument, you will see all the assets rendered:

```js
// without any argument
am.render();

am.getAll().length; // <- 3
am.getAllVisible().length; // <- 3
```

Now let's show only assets from the first category:

```js
const assets = am.getAll();

am.render(assets.filter((asset) => asset.get('category') == 'c1'));

am.getAll().length; // Still have 3 assets
am.getAllVisible().length; // but only 2 are shown
```

You can also mix arrays of assets:

```js
am.render([...assets1, ...assets2, ...assets3]);
```

<!--
If you want to customize the asset manager container you can get its `HTMLElement`

```js
am.getContainer().insertAdjacentHTML('afterbegin', '<div><button type="button">Click</button></div>');
```
-->

To update or remove an asset, use these methods:

```js
// Get the asset via its `src`
const asset = am.get('http://.../img.jpg');

// Update asset property
asset.set({ src: 'http://.../new-img.jpg' });

// Remove asset
am.remove(asset); // or via src, am.remove('http://.../new-img.jpg');
```

For more API methods, check out the [API Reference][API-Asset-Manager].

### Custom select logic

::: warning
This section applies to GrapesJS v0.17.26 or higher.
:::

You can open the Asset Manager with your own select logic.

```js
am.open({
  types: ['image'], // This is the default option
  // Without select, nothing will happen on asset selection
  select(asset, complete) {
    const selected = editor.getSelected();

    if (selected && selected.is('image')) {
      selected.addAttributes({ src: asset.getSrc() });
      // The default AssetManager UI will trigger `select(asset, false)`
      // on asset click and `select(asset, true)` on double-click
      complete && am.close();
    }
  },
});
```

## Customization

The default Asset Manager UI is useful for simple tasks and can be styled with CSS. Adding more complex features, such as a search input or filters, requires replacing the default UI.

Tell the editor to use a custom UI, then subscribe to the `asset:custom` event, which provides information about any requested changes.

```js
const editor = grapesjs.init({
  // ...
  assetManager: {
    // ...
    custom: true,
  },
});

editor.on('asset:custom', (props) => {
  // The `props` will contain all the information you need in order to update your UI.
  // props.open (boolean) - Indicates if the Asset Manager is open
  // props.assets (Array<Asset>) - Array of all assets
  // props.types (Array<String>) - Array of asset types requested, e.g., ['image'],
  // props.close (Function) - A callback to close the Asset Manager
  // props.remove (Function<Asset>) - A callback to remove an asset
  // props.select (Function<Asset, boolean>) - A callback to select an asset
  // props.container (HTMLElement) - The element where you should append your UI
  // Here you would put the logic to render/update your UI.
});
```

Here's an example of a custom Asset Manager using a Vue component.

<demo-viewer value="wbj4tmqk" height="500" darkcode/>

The example above shows how to replace the default UI. Notice that we append the mounted element to the container with `props.container.appendChild(this.$el);`.
This is required as the Asset Manager, by default, is placed in the [Modal](/modules/Modal.html).

If your Asset Manager is a completely independent/external module (e.g., it should appear in its own custom modal), you can bind its state via `assetManager.custom.open`.

```js
const editor = grapesjs.init({
  // ...
  assetManager: {
    // ...
    custom: {
      open(props) {
        // `props` contains the same properties as in the `asset:custom` event
        // ...
        // Init and open your external Asset Manager
        // ...
        // IMPORTANT:
        // When the external library is closed you have to communicate
        // this state back to the editor, otherwise GrapesJS will think
        // the Asset Manager is still open.
        // example: myAssetManager.on('close', () => props.close())
      },
      close(props) {
        // Close the external Asset Manager
      },
    },
  },
});
```

Also declare the `close` function so the editor can close the Asset Manager via `am.close()`.

<!--
### Define new Asset type

Images aren't the only assets you might use; others include a `video`, an `svg-icon`, or another kind of `document`. Each asset type is applied differently in templates/pages. To change a Component's image, you only need to update the URL in its `src` attribute. For an `svg-icon`, however, you might want to replace the element with new `<svg>` content. You also have to handle how the asset is presented or previewed in the panel/modal, for example, by showing thumbnails for large images or previews for videos.


Defining a new asset type means adding a new layer to the top of the 'Stack of Types'. The editor iterates over this stack whenever an asset is added to identify its type.

```js
am.add('https://.../image.png');
// string, url, ends with '.png' -> it's an 'image' type

am.add('<svg ...');
// string and starts with '<svg...' -> 'svg' type

am.add({type: 'video', src: '...'});
// an object, has 'video' type key -> 'video' type
```

It's up to you to tell the editor how to recognize your type using the `isType()` method.
Let's see how to start defining a type like `svg-icon`:


```js
am.addType('svg-icon', {
  // `value` is for example the argument passed in `am.add(VALUE);`
  isType(value) {
    // The condition is intentionally simple
    if (value.substring(0, 5) == '<svg ') {
      return {
        type: 'svg-icon',
        svgContent: value
      };
    }
    // Maybe you pass the `svg-icon` object already
    else if (typeof value == 'object' && value.type == 'svg-icon') {
      return value;
    }
  }
})
```

With this snippet, you can already add SVGs, and the Asset Manager will assign the appropriate type.

```js
// Add some random SVG
am.add(`<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M22,9 C22,8.4 21.5,8 20.75,8 L3.25,8 C2.5,8 2,8.4 2,9 L2,15 C2,15.6 2.5,16 3.25,16 L20.75,16 C21.5,16 22,15.6 22,15 L22,9 Z M21,15 L3,15 L3,9 L21,9 L21,15 Z"></path>
  <polygon points="4 10 5 10 5 14 4 14"></polygon>
</svg>`);
```


The default `open-assets` command shows only `image` assets, so to render `svg-icon`, run this:

```js
am.render(am.getAll().filter(
  asset => asset.get('type') == 'svg-icon'
));
```


You should see something like this

<img :src="$withBase('/assets-empty-view.png')">


The SVG asset is not rendered correctly because we haven't configured its view yet.

```js
am.addType('svg-icon', {
  view: {
    // `getPreview()` and `getInfo()` are just a few helpers, you can
    // override the entire template with `template()`
    // Check the base `template()` here:
    // https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/asset_manager/view/AssetView.ts
    getPreview() {
      return `<div style="text-align: center">${this.model.get('svgContent')}</div>`;
    },
    getInfo() {
      // You can use the model's properties if you passed them:
      // am.add({
      //  type: 'svg-icon',
      //  svgContent: '<svg ...',
      //  name: 'Some name'
      //  })
      //  ... then
      //  this.model.get('name');
      return '<div>SVG description</div>';
    },
  },
  isType(value) {...}
})
```


This is the result

<img :src="$withBase('/assets-svg-view.png')">


Now we have to deal with how to assign our `svgContent` to the selected element


```js
am.addType('svg-icon', {
  view: {
    // In our case the target is the selected component
    updateTarget(target) {
      const svg = this.model.get('svgContent');

      // To make things a bit more interesting, use a data URI for an image
      // component and set the content directly for other component types
      if (target.get('type') == 'image') {
        // Tip: you can also use `data:image/svg+xml;utf8,<svg ...` but you
        // have to escape a few characters
        target.set('src', `data:mime/type;base64,${btoa(svg)}`);
      } else {
        target.set('content', svg);
      }
    },
    ...
  },
  isType(value) {...}
})
```


Our custom `svg-icon` asset is ready to use. You can also add a `model` to the `addType` definition to group the business logic of your asset, but usually it's optional.


```js
// Just an example of model use
am.addType('svg-icon', {
  model: {
    // With `default` you define model's default properties
    defaults: {
      type:  'svg-icon',
      svgContent: '',
      name: 'Default SVG Name',
    },

    // You can call model's methods inside views:
    // const name = this.model.getName();
    getName() {
      return this.get('name');
    }
  },
  view: {...},
  isType(value) {...}
})
```


### Extend Asset Types

Extending asset types is similar to adding them. You can choose which type to extend and how.

```js
// svgIconType will contain the definition (model, view, isType)
const svgIconType = am.getType('svg-icon');

// Add new type and extend another one
am.addType('svg-icon2', {
  view: svgIconType.view.extend({
    getInfo() {
      return '<div>SVG2 description</div>';
    },
  }),
  // The `isType` is important, but if you omit it the default one will be added
  // isType(value) {
  //  if (value && value.type == id) {
  //    return {type: value.type};
  //  }
  // };
})
```


You can also extend existing types. To ensure assets load with the extended type, put your definitions in a plugin.

```js
// Extend the original `image` and add a confirm dialog before removing it
am.addType('image', {
  // As you're extending an existing type, you can omit
  // `am.getType('image').view.extend({...`; the editor does this by default.
  // You can also extend a different type.
  view: {
    // If you want to see more methods to extend check out
    // https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/src/asset_manager/view/AssetImageView.ts
    onRemove(e) {
      e.stopPropagation();
      const model = this.model;

      if (confirm('Are you sure?')) {
        model.collection.remove(model);
      }
    }
  },
})
``` -->

## Events

For a complete list of available events, check [here](/api/assets.html#available-events).

[API-Asset-Manager]: /api/assets.html
