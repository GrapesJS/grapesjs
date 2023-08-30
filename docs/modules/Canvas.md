---
title: Canvas
---

# Canvas

::: danger WIP
The documentation of this module is still a work in progress.
:::

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

You can disable the rendering of built-in canvas spots (some or all of them) during the editor initialization.

```js
grapesjs.init({
    // ...
    canvas: {
        // Disable only the hover type spot
        customSpots: {
            hover: true,
        },
        // Disable all built-in spots
        customSpots: true,
    },
})
```
In the next section, we'll see how it's possible to reuse the built-in spots and create your own.




### Spots customization

In the example below we'll see how to reuse the built-in `hover` canvas spot to render our custom highlighting rectangle (we'll disable the rendering of the default one) and create a new one in order to render a button below the selected `text` components.

[DEMO](https://jsfiddle.net/artur_arseniev/zdetbjsg/)

<demo-viewer value="zdetbjsg" height="500" darkcode/>

Worth noting a few important points:

* Our custom container has to be moved inside the GrapesJS spots container.
```js
editor.onReady(() => {
 Canvas.getSpotsEl().appendChild(this.$el);
});
```
* We pass the `component` to our custom spot, in order to have the style coordinates properly updated when we scroll the page or update the component.
```js
Canvas.addSpot({ type: customSpotType, component });
```
* The single spot is placed properly with `spot.getStyle()`
```html
<div ... class="spot" :style="spot.getStyle()">...</div>
```
* The spots container, by default, relies on `pointer-events: none`, in order to prevent the spot from blocking the interaction with the components. This is why we have to re-enable the pointer event on the button in order to make it interactable.
```css
.spot-text-btn {
  /*...*/
  pointer-events: auto;
}
```

<!-- Demo template, here for reference
<style>
    .spot-text-btn {
        background-color: #3b97e3;
        border: none;
        color: white;
        padding: 4px 8px;
        border-radius: 3px;
        cursor: pointer;
        position: absolute;
        left: 50%;
        bottom: 0;
        translate: -50% 120%;
        pointer-events: auto;
    }
    .spot-hover {
        border: 2px solid #d23be3;
    }
    .spot-hover-tag {
        background-color: #d23be3;
        color: white;
        padding: 4px 8px;
        position: absolute;
        left: 0;
        bottom: 0;
        translate: 0% 100%;
        white-space: nowrap;
    }
</style>

<div class="vue-app">
    <div
      v-for="spot in spots"
      v-if="isSpotToShow(spot)"
      :key="spot.id"
      :class="{spot: 1, 'spot-hover': isHoverSpot(spot) }"
      :style="spot.getStyle()"
    >
      <button
        v-if="isTextSelectedSpot(spot)"
        class="spot-text-btn" type="button" @click="onBtnAdd"
      >
        + Add
      </button>
      <span
        v-if="isHoverSpot(spot)"
        class="spot-hover-tag"
      >
        Name: {{ spot.component.getName() }}
      </span>
    </div>
</div>

<script>
  const app = new Vue({
    el: '.vue-app',
    data: { spots: [] },
    mounted() {
      const { Canvas } = editor;
      // Catch-all event for any spot update
      editor.on('canvas:spot', this.onCanvasSpot);

      // Add a new custom canvas spot for the last selected text component.
      editor.on('component:toggled', (component) => {
        // Remove all spots related to out custom type
        Canvas.removeSpots({ type: 'my-text-spot' });

        if (component === editor.getSelected() && component.is('text')) {
          Canvas.addSpot({ type: 'my-text-spot', component });
        }
      });

      editor.onReady(() => {
        editor.Canvas.getSpotsEl().appendChild(this.$el);
      });
    },
    methods: {
      onCanvasSpot() {
        this.spots = editor.Canvas.getSpots();
        console.log('onCanvasSpot', this.spots.map(s => s.id));
      },
      onBtnAdd() {
        const selected = editor.getSelected();
        const parent = selected.parent();
        if (parent) {
          parent.append(
            { type: 'text', components: 'New text component' },
            { at: selected.index() + 1 }
          )
        }
      },
      isTextSelectedSpot(spot) {
        return spot.type === 'my-text-spot';
      },
      isHoverSpot(spot) {
        return spot.type === 'hover';
      },
      isSpotToShow(spot) {
        return this.isTextSelectedSpot(spot) || this.isHoverSpot(spot);
      },
    }
  });
</script>
-->





## Events

For a complete list of available events, you can check it [here](/api/canvas.html#available-events).