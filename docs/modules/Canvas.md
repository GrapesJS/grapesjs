---
title: Canvas
---

# Canvas

> [!WARNING]
> The documentation of this module is still a work in progress.

::: warning
This guide is referring to GrapesJS v0.21.5 or higher
:::

[[toc]]


## Configuration

To change the default configurations you have to pass the `canvas` property with the main configuration object.

```js
const editor = grapesjs.init({
  ...
  canvas: {
    ...
  }
});
```

Check the full list of available options here: [Canvas Config](https://github.com/GrapesJS/grapesjs/blob/master/src/canvas/config/config.ts)


## Canvas Spots

Canvas spots are elements drawn on top of the canvas. They can be used to represent anything you might need but the most common use case of canvas spots is rendering information and managing components rendered in the canvas.

In order to get a better understanding of canvas spots let's see their built-in types usage.

### Built-in spot types

#### Select type

<img :src="$withBase('/canvas-spot-select.jpg')" class="img-ctr" style="max-height: 100px">

The `select` type is responsable for showing selected components and rendering the available toolbar items of the last selected component.

::: tip
Get the toolbar items from the component.
```js
const toolbarItems = editor.getSelected().toolbar;
```
:::

#### Resize type

<img :src="$withBase('/canvas-spot-resize.jpg')" class="img-ctr" style="max-height: 200px">

The `resize` type allows resizing of a component, based on the component's resizable options.

::: tip
Get the component resizable options.
```js
const resizable = editor.getSelected().resizable;
```
:::

#### Target type

<img :src="$withBase('/canvas-spot-target.jpg')" class="img-ctr" style="max-height: 200px">

The `target` type is used to highlight the component, like during the drag & drop, to show where the component will be placed.

::: warning
The default green position indicator is not part of the spot but you can easily customize it via CSS.
```css
.gjs-placeholder.horizontal {
   border-color: transparent red;
}
.gjs-placeholder.vertical {
   border-color: red transparent;
}
.gjs-placeholder-int {
   background-color: red;
}
```
:::

#### Hover type

<img :src="$withBase('/canvas-spot-hover.jpg')" class="img-ctr" style="max-height: 200px">

The `hover` is used to highlight the hovered component and show the component name.

::: tip
Get the component name.
```js
const name = editor.getSelected().getName();
```
:::

#### Spacing type

The `spacing` type is used to show component offsets like paddings and margins (visible on the `hover` type image above).





### Disable built-in types

```js
canvas: {
  customSpots: {
    select: true,
    hover: true,
    spacing: true,
    target: true,
    // resize: true,
  },
},
```




## Events

For a complete list of available events, you can check it [here](/api/canvas.html#available-events).