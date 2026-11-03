---
title: Selector Manager
---

# Selector Manager

<p align="center"><img :src="$withBase('/selector-manager.jpg')" alt="GrapesJS - Selector Manager"/></p>

A [Selector] allows you to reuse styles across all [Components] in your project, just as classes do in HTML. The main goal of the Selector Manager is to collect selectors and indicate the current state of the selection.

::: warning
This guide applies to GrapesJS v0.17.28 or higher.
:::

[[toc]]

## Configuration

To change the default configuration, pass the `selectorManager` property in the main configuration object.

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

The Selector Manager starts collecting data once components and styles are loaded. The default UI is displayed along with the default panels provided by GrapesJS core. If you need to set up the editor with your own panels, we recommend following the [Getting Started] guide.

In the example below, we initialize the editor with predefined components and styles.

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

Internally, the example above provides three selectors to the Selector Manager: `class-a`, `class-b`, and `class-c`.

When no component is selected, the Selector Manager UI is hidden by default (along with the Style Manager). Selecting `Element A-B-C` shows the current selection that will be styled.

<img :src="$withBase('/sm-selected-component.jpg')" alt="Selected component" style="display: block; margin: auto"/>

The label **Selected** indicates which CSS selector the styles will be applied to, so if you try to change the color of the current selection, this is what you'll get in the final code:

```css
.class-a.class-b.class-c {
  color: #483acb;
}
```

You can also disable specific selectors and change the state (e.g., Hover) in order to switch the target of styling.

<img :src="$withBase('/sm-disable-selector.jpg')" alt="Disabled selectors" style="display: block; margin: auto"/>

## Component-first selectors

By default, selecting components with classes sets their selectors as the style target. This means that any change in the Style Manager will be applied to all components containing those **Selected** classes.

If you need to select individual components as style targets, you can enable the `componentFirst` option.

```js
const editor = grapesjs.init({
  // ...
  selectorManager: {
    componentFirst: true,
  },
});
```

This option also lets you style multiple components and sync common selectors with the current component styles using the refresh icon.

<img :src="$withBase('/sm-component-first.jpg')" alt="Component First" style="display: block; margin: auto"/>

::: warning
With multiple selection, the Style Manager always shows the styles of the last selected component.
:::

## Programmatic usage

If you need to manage your selectors programmatically, you can use the [Selector Manager API][Selector API].

## Customization

The default UI can handle most common tasks, but you may need to replace it if you require more advanced logic or elements.

Tell the editor to use a custom UI, then subscribe to the `selector:custom` event, which is triggered whenever the UI needs to update.

```js
const editor = grapesjs.init({
  // ...
  selectorManager: {
    custom: true,
    // ...
  },
});

editor.on('selector:custom', (props) => {
  // props.container (HTMLElement) - The default element where you can append your UI
  // Here you would put the logic to render/update your UI.
});
```

In the example below, we'll replicate most of the default functionality using only the Selector Manager API.

<demo-viewer value="v8cgkLfr" height="500" darkcode/>

## Events

For a complete list of available events, check [here](/api/selector_manager.html#available-events).

[Selector]: /api/selector.html
[Style Manager]: Style-manager.html
[Components]: Components.html
[Getting Started]: /getting-started.html
[Selector API]: /api/selector_manager.html
