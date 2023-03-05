---
title: Layer Manager
---

# Layer Manager

<p align="center"><img :src="$withBase('/layer-manager.png')" alt="GrapesJS - Layer Manager"/></p>

The Layer Manager module is responsible to manage and display your [Components] as a tree.

::: warning
This guide is referring to GrapesJS v0.19.5 or higher
:::

[[toc]]


## Configuration

To change the default configurations you have to pass the `layerManager` option with the main configuration object.

```js
const editor = grapesjs.init({
  ...
  layerManager: {
    ...
  }
});
```

You can check here the full list of available configuration options: [Layer Manager Config](https://github.com/GrapesJS/grapesjs/blob/master/src/navigator/config/config.ts)


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



## Programmatic usage

If you need to manage layers programmatically you can use its [APIs][Layers API].





## Customization

By using the [Layers API][Layers API] you're able to replace the default UI with your own implementation.

All you have to do is to indicate to the editor your intent to use a custom UI and then subscribe to a few events that allow you to properly update your UI.

```js
const editor = grapesjs.init({
    // ...
    layerManager: {
      custom: true,
      // ...
    },
});

// Use this event to append your UI in the default container provided by GrapesJS.
// You can skip this event if you don't rely on the core panels and decide to
// place the UI in some other place.
editor.on('layer:custom', (props) => {
    // props.container (HTMLElement) - The default element where you can append your UI
});

// Triggered when the root layer is changed.
editor.on('layer:root', (root) => {
    // Update the root of your UI
});

// Triggered when a component is updated, this allows you to update specific layers.
editor.on('layer:component', (component) => {
    // Update the specific layer of your UI
});
```

In the example below we'll replicate most of the default functionality with our own implementation.

<demo-viewer value="L24hkgm5" height="500" darkcode/>


<!-- Demo template, here for reference
<style>
.layer-manager {
  position: relative;
  text-align: left;
}
.layer-item.hidden {
  opacity: 0.5;
}
.layer-item-icon {
  width: 15px;
  cursor: pointer;
}
.layer-item-eye {
}
.layer-item-chevron {
  transform: rotate(90deg);
}
.layer-item-chevron.open {
  transform: rotate(180deg);
}
.layer-item-chevron.hidden {
  opacity: 0;
  pointer-events: none;
}
.layer-item-row {
  display: flex;
  align-items: center;
  user-select: none;
  gap: 8px;
  padding: 5px 8px;
  border-bottom: 1px solid rgba(0,0,0,0.35);
}
.layer-item-row.selected {
  background-color: rgba(255,255,255,0.15);
}
.layer-item-row.hovered {
  background-color: rgba(255,255,255,0.05);
}
.layer-item-name {
  margin-left: 3px;
}
.layer-item-name.editing {
  background-color: white;
  color: #555;
  padding: 0 3px;
}
.layer-item-name-cnt {
  display: flex;
  align-items: center;
  flex-grow: 1;
}
.layer-drag-indicator {
  position: absolute;
  width: 100%;
  height: 1px;
  left: 0;
  background-color: #3b97e3;
}
</style>
<div style="display: none">
  <div
    class="layer-manager"
    @pointerdown="onDragStart"
    @pointermove="onDragMove"
    @pointerup="onDragEnd"
  >
    <layer-item v-if="root" :component="root" :level="0"></layer-item>
    <div
      v-if="dragIndicator.show"
      class="layer-drag-indicator"
      :style="{ top: `${dragIndicator.y}px`, marginLeft: `${dragIndicator.offset}px`, width: `calc(100% - ${dragIndicator.offset}px)` }"></div>
  </div>

  <div id="layer-item-template" style="display: none;">
    <div :class="['layer-item', !visible && 'hidden']">
      <div
        :class="['layer-item-row', selected && 'selected', hovered && 'hovered']"
        @click="setSelected"
        @mouseenter="setHover(true)"
        @mouseleave="setHover(false)"
        ref="layerRef"
        data-layer-item
      >
        <div class="layer-item-icon layer-item-eye" @click.stop="toggleVisibility()">
          <svg v-if="visible" viewBox="0 0 24 24"><path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" /></svg>
          <svg v-else viewBox="0 0 24 24"><path fill="currentColor" d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z" /></svg>
        </div>
        <div class="layer-item-name-cnt" :style="{ marginLeft: `${level*10}px` }">
          <div :class="['layer-item-icon layer-item-chevron', open && 'open', !components.length && 'hidden']" @click.stop="toggleOpen()">
            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z" /></svg>
          </div>
          <div ref="nameInput"
            :class="['layer-item-name', editing && 'editing']"
            :contenteditable="editing"
            @dblclick.stop="setEditing(true)"
            @blur.stop="setEditing(false)"
            @keydown.enter="setEditing(false)"
          >
            {{ name }}
          </div>
        </div>
        <div v-if="component.get('draggable')" class="layer-item-icon layer-item-move" data-layer-move>
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M13,6V11H18V7.75L22.25,12L18,16.25V13H13V18H16.25L12,22.25L7.75,18H11V13H6V16.25L1.75,12L6,7.75V11H11V6H7.75L12,1.75L16.25,6H13Z"/></svg>
        </div>
      </div>
      <div v-if="open" class="layer-items">
        <layer-item v-for="cmp in components" :key="cmp.getId()" :component="cmp" :level="level + 1"/>
      </div>
    </div>
  </div>
</div>
<script>
const { Components, Layers } = editor;
const cmpElMap = new WeakMap();

Vue.component('layer-item', {
  template: '#layer-item-template',
  props: { component: Object, level: Number },
  data() {
    return {
      name: '',
      components: [],
      visible: true,
      open: false,
      selected: false,
      hovered: false,
      editing: false,
    }
  },
  mounted() {
    this.updateLayer(Layers.getLayerData(this.component));
    cmpElMap.set(this.$refs.layerRef, this.component);
    editor.on('layer:component', this.onLayerComponentUpdate);
  },
  destroyed() {
    editor.off('layer:component', this.onLayerComponentUpdate);
  },
  methods: {
    onLayerComponentUpdate(cmp) {
      if (cmp === this.component) {
        this.updateLayer(Layers.getLayerData(cmp));
      }
    },
    updateLayer(data) {
      this.name = data.name;
      this.components = data.components;
      this.visible = data.visible;
      this.open = data.open;
      this.selected = data.selected;
      this.hovered = data.hovered;
    },
    toggleVisibility() {
      const { component } = this;
      Layers.setVisible(this.component, !this.visible);
    },
    toggleOpen() {
      const { component } = this;
      Layers.setOpen(this.component, !this.open);
    },
    setHover(hovered) {
      Layers.setLayerData(this.component, { hovered })
    },
    setSelected(event) {
      Layers.setLayerData(this.component, { selected: true }, { event })
    },
    setEditing(value) {
      this.editing = value;
      const el = this.$refs.nameInput;
      if (!value) {
        Layers.setName(this.component, el.innerText)
      } else {
        setTimeout(() => el.focus())
      }
    },
  }
});

const app = new Vue({
  el: '.layer-manager',
  data: {
    root: null,
    isDragging: false,
    draggingCmp: null,
    draggingOverCmp: null,
    dragIndicator: {},
    canMoveRes: {},
  },
  mounted() {
    editor.on('layer:custom', this.handleCustom);
    editor.on('layer:root', this.handleRootChange);
  },
  destroyed() {
    editor.off('layer:custom', this.handleCustom);
    editor.off('layer:root', this.handleRootChange);
  },
  methods: {
    handleCustom(props = {}) {
      const { container, root } = props;
      container && container.appendChild(this.$el);
      this.handleRootChange(root);
    },
    handleRootChange(root) {
      console.log('root update', root);
      this.root = root;
    },
    getDragTarget(ev) {
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      const dragEl = el?.closest('[data-layer-move]');
      const elLayer = el?.closest('[data-layer-item]');

      return {
          dragEl,
          elLayer,
          cmp: cmpElMap.get(elLayer),
      }
    },
    onDragStart(ev) {
      if (this.getDragTarget(ev).dragEl) {
        this.isDragging = true;
      }
    },
    onDragMove(ev) {
      if (!this.isDragging) return;
      const { cmp, elLayer } = this.getDragTarget(ev);
      if (!cmp || !elLayer) return;
      const { draggingCmp } = this;
      const layerRect = elLayer.getBoundingClientRect();
      const layerH = elLayer.offsetHeight;
      const layerY = elLayer.offsetTop;
      const pointerY = ev.clientY;
      const isBefore = pointerY < (layerRect.y + layerH / 2);
      const cmpSource = !draggingCmp ? cmp : draggingCmp;
      const cmpTarget = cmp.parent();
      const cmpIndex = cmp.index() + (isBefore ? 0 : 1);
      this.draggingCmp = !draggingCmp ? cmp : draggingCmp;
      this.draggingOverCmp = cmp;
      const canMove = Components.canMove(cmpTarget, cmpSource, cmpIndex);
      const canMoveInside = Components.canMove(cmp, cmpSource);
      const canMoveRes = {
          ...canMove,
          canMoveInside,
          index: cmpIndex,
      };
      // if (
      //     canMoveInside.result &&
      //     (
      //         pointerY > (layerRect.y + LAYER_PAD)
      //         && pointerY < (layerRect.y + layerH - LAYER_PAD))
      // ) {
      //     pointerInside = true;
      //     canMoveRes.target = cmp;
      //     delete canMoveRes.index;
      // }
      // setDragParent(pointerInside ? cmp : undefined);
      this.canMoveRes = canMoveRes;
      const dragLevel = (cmp ? cmp.parents() : []).length;
      this.dragIndicator = {
          y: layerY + (isBefore ? 0 : layerH),
          h: layerH,
          offset: dragLevel * 10 + 20,
          show: !!(this.draggingCmp && canMoveRes?.result),
      };
    },
    onDragEnd(ev) {
      const { canMoveRes } = this;
      canMoveRes.result && canMoveRes.source.move(canMoveRes.target, { at: canMoveRes.index });
      this.isDragging = false;
      this.draggingCmp = null;
      this.draggingOverCmp = null;
      this.dragIndicator = {};
      this.canMoveRes = {};
    },
  }
});
</script>
-->


## Events

For a complete list of available events, you can check it [here](/api/layer_manager.html#available-events).


[Components]: <Components.html>
[Layers API]: </api/layer_manager.html>
