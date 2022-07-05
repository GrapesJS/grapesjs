---
title: Layer Manager
---

# Layer Manager

<!-- <p align="center"><img :src="$withBase('/selector-manager.jpg')" alt="GrapesJS - Selector Manager"/></p> -->

The Layer Manager module is responsible to manage and display your [Components] as a tree.

::: warning
This guide is referring to GrapesJS v0.19.4 or higher
:::

[[toc]]


## Configuration

To change the default configurations you have to pass the `layerManager` property with the main configuration object.

```js
const editor = grapesjs.init({
  ...
  layerManager: {
    ...
  }
});
```

Layers are a direct representation of your components, therefore they will only be available once your components are loaded in the editor (eg. you might load your project data from a remote endpoint).

In your configuration, you're able to change the global behavior of layers (eg. make all the layers not sortable) and also decide which component layer should be used as a root.

```js
const editor = grapesjs.init({
  ...
  layerManager: {
    // If the `root` is not specified or the component element is not found,
    // the main wrapper component will be used.
    root: '#my-custom-root',
    sortable: false,
    hidable: false,
  }
});
```

The configurations are mainly targeting the default UI provided by GrapesJS core, in case you need more control over the tree of your layers, you can read more in the [Customization](#customization) section below.

You can check here the full list of available configuration options: [Layer Manager Config](https://github.com/artf/grapesjs/blob/master/src/navigator/config/config.ts)



## Programmatic usage

If you need to manage layers programmatically you can use its [APIs][Layers API].





## Customization

The default UI can handle most of the common tasks but in case you need a more advanced logic/elements, that requires a replace of the default UI.

All you have to do is to indicate the editor your intent to use a custom UI and then subscribe to the `selector:custom` event that will trigger on any necessary update of the UI.

```js
const editor = grapesjs.init({
    // ...
    selectorManager: {
      custom: true,
      // ...
    },
});

editor.on('selector:custom', props => {
    // props.container (HTMLElement) - The default element where you can append your UI

    // Here you would put the logic to render/update your UI.
});
```

In the example below we'll replicate most of the default functionality by using solely the Selector Manager API.

<demo-viewer value="v8cgkLfr" height="500" darkcode/>





## Events

For a complete list of available events, you can check it [here](/api/layer_manager.html#available-events).


[Selector]: </api/selector.html>
[Style Manager]: <Style-manager.html>
[Components]: <Components.html>
[Getting Started]: </getting-started.html>
[Layers API]: </api/layer_manager.html>
