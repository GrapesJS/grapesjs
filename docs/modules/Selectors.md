---
title: Selector Manager
---

# Selector Manager

<p align="center"><img :src="$withBase('/selector-manager.jpg')" alt="GrapesJS - Selector Manager"/></p>


The [Selector] allows the reuse of styles across all of your [Components] in the project (exactly what classes do in HTML) and the main goal of the Selector Manager is to collect them and indicate the current state of the selection.

::: warning
This guide is referring to GrapesJS v0.17.28 or higher
:::

[[toc]]


## Configuration

To change the default configurations you have to pass the `selectorManager` property with the main configuration object.

```js
const editor = grapesjs.init({
  ...
  selectorManager: {
    ...
  }
});
```

Check the full list of available options here: [Selector Manager Config](https://github.com/GrapesJS/grapesjs/blob/master/src/selector_manager/config/config.ts)


## Initialization

The Selector Manager starts to collect data once componenets and styles are loaded. The default UI is displayed along with the default panels provided by GrapesJS core, in case you need to setup the editor with your own panels we recommend following the [Getting Started] guide.

In the example below we init the editor with already provided components and styles.

```js
const editor = grapesjs.init({
  container: '#gjs',
  height: '100%',
  storageManager: false,
  components: `
    <div class="class-a">Element A</div>
    <div class="class-a class-b">Element A-B</div>
    <div class="class-a class-b class-c">Element A-B-C</div>
  `,
  style: `
    .class-a { color: red }
    .class-b { color: green }
    .class-c { color: blue }
  `,
});
```
Internally, the example above will provide to Selector Manager 3 selectors: `class-a`, `class-b` and `class-c`.

Without any selected component, the Selector Manager UI is hidden by default (along with the Style Manager). By selecting the `Element A-B-C` you will see the current selection of what will be actually styled.

<img :src="$withBase('/sm-selected-component.jpg')" alt="Selected component" style="display: block; margin: auto"/>

The label **Selected** indicates on which CSS query styles will be applied, so if you try to change the color of the current selection, this is what you'll get in the final code:

```css
.class-a.class-b.class-c {
  color: #483acb;
}
```

You can also disable specific selectors and change the state (eg. Hover) in order to switch the target of styling.

<img :src="$withBase('/sm-disable-selector.jpg')" alt="Disabled selectors" style="display: block; margin: auto"/>




## Component-first selectors

By default, selecting components with classes will indicate their selectors as target style. That means that any change in Style Manager will be applied to all components containing those **Selected** classes.

In case you need to select single components as style targets, you can enable `componentFirst` option.

```js
const editor = grapesjs.init({
  // ...
  selectorManager: {
    componentFirst: true,
  },
});
```

This option enables also the possibility to style multiple components and the ability to sync common selectors with the current component styles (the refresh icon).

<img :src="$withBase('/sm-component-first.jpg')" alt="Component First" style="display: block; margin: auto"/>

::: warning
With multiple selection, the Style Manager shows always styles of the last selected component.
:::



## Programmatic usage
If you need to manage your selectors programmatically you can use its [APIs][Selector API].





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

For a complete list of available events, you can check it [here](/api/selector_manager.html#available-events).


[Selector]: </api/selector.html>
[Style Manager]: <Style-manager.html>
[Components]: <Components.html>
[Getting Started]: </getting-started.html>
[Selector API]: </api/selector_manager.html>
