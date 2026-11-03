---
title: Style Manager
---

# Style Manager

<p align="center"><img :src="$withBase('/style-manager.jpg')" alt="GrapesJS - Style Manager"/></p>

The Style Manager module displays and updates style properties for your [Components]. In this guide, you will see how to set up and take full advantage of the built-in Style Manager UI in GrapesJS.
The default UI is a lightweight component with built-in properties, but as you'll see next in this guide, it's easy to extend with your own elements or even create the Style Manager UI from scratch by using the [Style Manager API].

::: warning
To get a better understanding of the content in this guide, we recommend reading [Components] first.
:::
::: warning
This guide applies to GrapesJS v0.18.1 or higher.
:::

::: tip
Looking for a UI that is easy and ready to customize? [Check out the Grapes Studio SDK!](https://app.grapesjs.com/docs-sdk/configuration/components/overview?utm_source=grapesjs-docs&utm_medium=tip)
:::

[[toc]]

## Configuration

To change the default configuration, pass the `styleManager` property in the main configuration object.

```js
const editor = grapesjs.init({
  ...
  styleManager: {
    sectors: [...],
    ...
  }
});
```

Check the full list of available options here: [Style Manager Config](https://github.com/GrapesJS/grapesjs/blob/master/src/style_manager/config/config.ts)

## Initialization

The Style Manager module is organized into sectors, each containing a list of properties to display. The default configuration already includes common style properties. You can use them by omitting the `styleManagerConfig.sectors` option.

```js
grapesjs.init({
  ...
  styleManager: {
    // With no defined sectors, the default list will be loaded
    // sectors: [...],
    ...
  },
});
```

::: danger
It makes sense to show the Style Manager UI only when you have at least one component selected, so by default the Style Manager is hidden if there are no selected components.
:::

### Sector definitions

Each sector is identified by its `name` and a list of `properties` to display. You can also specify an `id` to access the sector via the API (if omitted, it is generated from the `name`) and set its default `open` state.

```js
grapesjs.init({
  // ...
  styleManager: {
    sectors: [
      {
        name: 'First sector',
        properties: [],
        // id: 'first-sector', // Id generated from the name
        // open: true, // The sector is open by default
      },
      {
        open: false, // render it closed by default
        name: 'Second sector',
        properties: [],
      },
    ],
  },
});
```

### Property definitions

Once you have defined your sector, you can start adding property definitions in `properties`. Each property has a common set of options (`label`, `default`, etc.) and other options specific to its `type`.

Below is a simple definition for controlling the padding style.

```js
sectors: [
  {
    name: 'First sector',
    properties: [
      {
        // Default options
        // id: 'padding', // The property ID defaults to the `property` value if omitted
        type: 'number',
        label: 'Padding', // Label for the property
        property: 'padding', // CSS property to change
        default: '0', // Default value to display
        // Additional `number` options
        units: ['px', '%'], // Units (available only for the 'number' type)
        min: 0, // Min value (available only for the 'number' type)
      },
    ],
  },
];
```

This will render the number input UI and will change the `padding` CSS property on the selected component.

The flexibility of the definition lets you easily create different UI inputs for any CSS property. You're free to choose the best UI for your users. For example, you can follow the CSS specification for a numeric property like `font-size` and define it as a `number`:

```js
{
  type: 'number',
  label: 'Font size',
  property: 'font-size',
  units: ['px', '%', 'em', 'rem', 'vh', 'vw'],
  min: 0,
}
```

Or you can show it as a `select` and offer only a predefined set of values (e.g., based on your design system tokens):

```js
{
  type: 'select',
  label: 'Font size',
  property: 'font-size',
  default: '1rem',
  options: [
    { id: '0.7rem', label: 'small' },
    { id: '1rem', label: 'medium' },
    { id: '1.2rem', label: 'large' },
  ]
}
```

Each type defines a UI view and a model for handling inputs and updates.
Below is a list of all available default types with their corresponding UI and models.

#### Default types

::: tip
Each **Model** describes the available properties and their usage in more detail.
:::

- `base` - The base type; renders as a simple text input field. **Model**: [Property](/api/property.html)

  <img :src="$withBase('/sm-base-type.jpg')"/>

  ```js
  // Example
  {
    // type: 'base', // Omitting the type in the definition defaults to 'base'
    property: 'some-css-property',
    label: 'Base type',
    default: 'Default value',
  },
  ```

- `color` - Same props as `base` but the UI is a color picker. **Model**: [Property](/api/property.html)

  <img :src="$withBase('/sm-type-color.jpg')"/>

- `number` - Number input field for numeric values. **Model**: [PropertyNumber](/api/property_number.html)

  <img :src="$withBase('/sm-type-number.jpg')"/>

  ```js
  // Example
  {
    type: 'number',
    property: 'width',
    label: 'Number type',
    default: '0%',
    // Additional props
    units: ['px', '%'],
    min: 0,
    max: 100,
  },
  ```

- `slider` - Same props as `number` but the UI is a slider. **Model**: [PropertyNumber](/api/property_number.html)

  <img :src="$withBase('/sm-type-slider.jpg')"/>

- `select` - Select input with options. **Model**: [PropertySelect](/api/property_select.html)

  <img :src="$withBase('/sm-type-select.jpg')"/>

  ```js
  // Example
  {
    type: 'select',
    property: 'display',
    label: 'Select type',
    default: 'block',
    // Additional props
    options: [
      {id: 'block', label: 'Block'},
      {id: 'inline', label: 'Inline'},
      {id: 'none', label: 'None'},
    ]
  },
  ```

- `radio` - Same props as `select` but the UI is a radio button. **Model**: [PropertySelect](/api/property_select.html)

  <img :src="$withBase('/sm-type-radio.jpg')"/>

- `composite` - This type is great for CSS shorthand properties, where the final value is a composition of multiple subproperties. **Model**: [PropertyComposite](/api/property_composite.html)

  <img :src="$withBase('/sm-type-composite.jpg')"/>

  ```js
  // Example
  {
    type: 'composite',
    property: 'margin',
    label: 'Composite type',
    // Additional props
    properties: [
      { type: 'number', units: ['px'], default: '0', property: 'margin-top' },
      { type: 'number', units: ['px'], default: '0', property: 'margin-right' },
      { type: 'number', units: ['px'], default: '0', property: 'margin-bottom' },
      { type: 'number', units: ['px'], default: '0', property: 'margin-left' },
    ]
  },
  ```

- `stack` - This type is useful for CSS properties with multiple layers or values, such as `text-shadow`, `box-shadow`, `transform`, etc. **Model**: [PropertyStack](/api/property_stack.html)

  <img :src="$withBase('/sm-type-stack.jpg')"/>

  ```js
  // Example
  {
    type: 'stack',
    property: 'text-shadow',
    label: 'Stack type',
    // Additional props
    properties: [
      { type: 'number', units: ['px'], default: '0', property: 'x' },
      { type: 'number', units: ['px'], default: '0', property: 'y' },
      { type: 'number', units: ['px'], default: '0', property: 'blur' },
      { type: 'color', default: 'black', property: 'color' },
    ]
  },
  ```

#### Built-in properties

In order to speed up the Style Manager configuration, GrapesJS ships with a set of predefined common CSS properties that you can reuse and extend.

```js
sectors: [
  {
    name: 'First sector',
    properties: [
      // Pass the built-in CSS property as a string
      'width',
      'min-width',
      // Extend the built-in property with your props
      {
        extend: 'max-width',
        units: ['px', '%'],
      },
      // If the property doesn't exist, it will be converted to a base type
      'unknown-property', // -> { type: 'base', property: 'unknown-property' }
    ],
  },
];
```

::: tip
You can check if the property is available by running

```js
editor.StyleManager.getBuiltIn('property-name');
```

or get the list of all available properties with

```js
editor.StyleManager.getBuiltInAll();
```

:::

## I18n

If you're planning to have a multilingual editor, you can easily connect sector and property labels to the [I18n] module via their IDs.

```js
grapesjs.init({
  styleManager: {
    sectors: [
      {
        id: 'first-sector-id',
        // You can leave the name as a fallback in case the i18n definition is missing
        name: 'First sector',
        properties: [
          'width',
          {
            id: 'display-prop-id', // By default the id is the same as its property name
            label: 'Display',
            type: 'select',
            property: 'display',
            default: 'block',
            options: [
              { id: 'block', label: 'Block' },
              { id: 'inline', label: 'Inline' },
              { id: 'none', label: 'None' },
            ],
          },
        ],
      },
      // ...
    ],
  },
  i18n: {
    // Use `messagesAdd` in order to extend the default set
    messagesAdd: {
      en: {
        styleManager: {
          sectors: {
            'first-sector-id': 'First sector EN',
          },
          properties: {
            width: 'Width EN',
            'display-prop-id': 'Display EN',
          },
          options: {
            'display-prop-id': {
              block: 'Block EN',
              inline: 'Inline EN',
              none: 'None EN',
            },
          },
        },
      },
    },
  },
});
```

## Component constraints

When you define custom components, you can also indicate, via `stylable` and `unstylable` props, which CSS properties should be available for styling. In that case, the Style Manager will only show the available properties. If the sector doesn't contain any available property, it won't be shown.

```js
const customComponents = (editor) => {
  // Component A
  editor.Components.addType('cmp-a', {
    model: {
      defaults: {
        // When this component is selected, the Style Manager will show only the following properties
        stylable: ['width', 'height'],
      },
    },
  });
  // Component B
  editor.Components.addType('cmp-b', {
    model: {
      defaults: {
        // When this component is selected, the Style Manager will hide the following properties
        unstylable: ['color'],
      },
    },
  });
};

grapesjs.init({
  // ...
  plugins: [customComponents],
  components: [
    { type: 'cmp-a', components: 'Component A' },
    { type: 'cmp-b', components: 'Component B' },
  ],
  styleManager: {
    sectors: [
      {
        name: 'First sector',
        properties: ['width', 'min-width', 'height', 'min-height'],
      },
      {
        name: 'Second sector',
        properties: ['color', 'font-size'],
      },
    ],
  },
});
```

## Programmatic usage

For more advanced usage, you can use the [Style Manager API] to perform different kinds of actions related to the module.

- Managing sectors/properties post-initialization.

  ```js
  // Get the module from the editor instance
  const sm = editor.StyleManager;

  // Add new sector
  const newSector = sm.addSector('sector-id', {
    name: 'New sector',
    open: true,
    properties: ['width'],
  });

  // Add new property to the sector
  sm.addProperty('sector-id', {
    type: 'number',
    property: 'min-width',
  });

  // Remove sector
  sm.removeSector('sector-id');
  ```

- Managing selected targets.

  ```js
  // Select the first button in the current page
  const wrapperCmp = editor.Pages.getSelected().getMainComponent();
  const btnCmp = wrapperCmp.find('button')[0];
  btnCmp && sm.select(btnCmp);

  // Set the CSS selector as the target (the corresponding CSSRule is created if it doesn't exist)
  sm.select('.btn > span');
  // Get the last selected target
  const lastTarget = sm.getLastSelected();
  lastTarget?.toCSS && console.log(lastTarget.toCSS());

  // Update selected targets with a custom style
  sm.addStyleTargets({ color: 'red' });
  ```

- Adding/extending built-in property definitions.

  ```js
  const myPlugin = (editor) => {
    editor.StyleManager.addBuiltIn('new-prop', {
      type: 'number',
      label: 'New prop',
    })
  };

  grapesjs.init({
    // ...
    plugins: [myPlugin],
    styleManager: {
      sectors: [
        {
          name: 'My sector',
          properties: [ 'new-prop', ... ],
        },
      ],
    },
  })
  ```

- [Adding new types](#adding-new-types).

## Customization

The default types cover most common styling properties. If you need more advanced control over styling, you can define your own types or create a completely custom Style Manager UI from scratch.

### Adding new types

To add a new type, use the `styleManager.addType` API call and define the methods needed to integrate it with the editor. Here's an implementation example using the native `range` input.

<demo-viewer value="y1mxv6p5" height="500" darkcode/>

<!-- ```js
const customType = (editor) => {
  editor.StyleManager.addType('my-custom-prop', {
    // Create UI
    create({ props, change }) {
      const el = document.createElement('div');
      el.innerHTML = `<input type="range" class="my-input" min="${props.min}" max="${props.max}"/>`;
      const inputEl = el.querySelector('.my-input');
      inputEl.addEventListener('change', event => change({ event })); // `change` will trigger the emit
      inputEl.addEventListener('input', event => change({ event, partial: true }));
      return el;
    },
    // Propagate UI changes up to the targets
    emit({ props, updateStyle }, { event, partial }) {
      const { value } = event.target;
      updateStyle(`${value}px`, { partial });
    },
    // Update the UI (e.g., when the target changes)
    update({ value, el }) {
      el.querySelector('.my-input').value = parseInt(value, 10);
    },
    // Clean up side effects if necessary (e.g., global event listeners)
    destroy() {
    },
  });
};

grapesjs.init({
  // ...
  plugins: [customType],
  styleManager: {
    sectors: [
      {
        name: 'My sector',
        properties: [
          {
            type: 'my-custom-prop',
            property: 'font-size',
            default: '15',
            min: 10,
            max: 70,
          },
        ],
      },
    ],
  },
})
``` -->

### Custom Style Manager

If you need a completely custom Style Manager UI (e.g., to use your own UI components), you can create it from scratch using the same sector/property architecture or interact directly with selected targets.

Tell the editor to use a custom UI, then subscribe to the `style:custom` event, which tells you when to create/update your UI.

```js
const editor = grapesjs.init({
  // ...
  styleManager: {
    custom: true,
    // ...
  },
});

editor.on('style:custom', (props) => {
  // props.container (HTMLElement)
  //    The default element where you can append your
  //    custom UI in order to render it in the default position.
  // Here you would put the logic to render/update your UI using the Style Manager API
});
```

Below is an example of a custom Style Manager UI rendered with Vuetify (Vue Material components), using the default sector/property state architecture via the API.

<demo-viewer value="46kf7brn" height="500" darkcode/>

In the example above, notice how we subscribe to `style:custom` and update `this.sectors = sm.getSectors({ visible: true });` on each trigger, and this is enough for the framework to update the rest of the template automatically.

In case you need to get/update the selected style targets directly, you can also rely on these APIs.

```js
// Get the module from the editor instance
const sm = editor.StyleManager;

// Select the first button in the current page
const wrapperCmp = editor.Pages.getSelected().getMainComponent();
const btnCmp = wrapperCmp.find('button')[0];
btnCmp && sm.select(btnCmp);

// You can also select a CSS selector as a target
sm.select('.btn > span');

// Once the target is selected, you can check its current style object
console.log(sm.getSelected()?.getStyle());

// and update all selected target styles when necessary
sm.addStyleTargets({ color: 'red' });
```

<!--
<style>
  .style-manager {
    font-size: 12px;
  }
  .sm-input-color {
    width: 16px !important;
    height: 15px !important;
    opacity: 0 !important;
  }
  .sm-type-cmp {
    background-color: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.25);
    border-radius: 3px;
    position: relative;
    min-height: 45px;
  }
  .sm-add-layer {
    position: absolute !important;
    top: -20px;
    right: 12px;
  }
  .sm-layer + .sm-layer {
    border-top: 1px solid rgba(255,255,255,.25);
  }
  .sm-layer-prv,
  .sm-btn-prv {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    display: inline-block;
  }

  .sm-layer-prv--text-shadow::after {
    color: #000;
    content: "T";
    font-weight: 900;
    font-size: 10px;
    text-align: center;
    display: block;
  }

  .gjs-pn-views-container, .gjs-pn-views {
    width: 280px;
  }
  .gjs-pn-options {
    right: 280px;
  }
  .gjs-cv-canvas {
    width: calc(100% - 280px);
  }

  /* Vuetify overrides */
  .v-application {
    background: transparent !important;
  }
  .v-application--wrap {
    min-height: auto;
  }
  .v-input__slot {
    font-size: 12px;
    min-height: 10px !important;
  }
  .v-select__selections {
    flex-wrap: nowrap;
  }
  .v-text-field .v-input__slot {
    padding: 0 10px !important;
  }
  .v-input--selection-controls {
    margin-top: 0;
  }
  .v-text-field__details, .v-messages {
    display: none;
  }
</style>
<div>
  <div class="style-manager">
      <v-app>
        <v-main>
        <v-expansion-panels  accordion multiple>
          <v-expansion-panel v-for="sector in sectors" :key="sector.getId()">
            <v-expansion-panel-header>
              {{ sector.getName() }}
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-row>
              <property-field v-for="prop in sector.getProperties()" :key="prop.getId() + prop.canClear()" :prop="prop"/>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        </v-main>
      </v-app>
  </div>

  <div id="property-field" style="display: none;">
    <v-col :class="['py-0 px-1 mb-1', prop.isFull() && 'mb-3']" :cols="prop.get('full') ? '12' : '6'">
        <v-row :class="labelCls">
          <v-col cols="auto pr-0">{{ prop.getLabel() }}</v-col>
          <v-col cols="auto" v-if="prop.canClear()">
            <v-icon @click="prop.clear()" color="indigo accent-1" small>mdi-close</v-icon>
          </v-col>
        </v-row>
        <div v-if="propType === 'number'">
          <v-text-field :placeholder="defValue" :value="inputValue" @change="handleChange" outlined dense/>
        </div>
        <div v-else-if="propType === 'radio'">
          <v-radio-group :value="prop.getValue()" @change="handleChange" row dense>
            <v-radio v-for="opt in prop.getOptions()" :key="prop.getOptionId(opt)" :label="prop.getOptionLabel(opt)" :value="prop.getOptionId(opt)"/>
          </v-radio-group>
        </div>
        <div v-else-if="propType === 'select'">
          <v-select :items="toOptions" :value="prop.getValue()" @change="handleChange" outlined dense/>
        </div>
        <div v-else-if="propType === 'color'">
          <v-text-field :placeholder="defValue" :value="inputValue" @change="handleChange" outlined dense>
            <template v-slot:append>
              <div :style="{ backgroundColor: prop.hasValue() ? prop.getValue() : defValue }">
                <input class="sm-input-color"
                  type="color"
                  :value="prop.hasValue() ? prop.getValue() : defValue"
                  @change="(ev) => handleChange(ev.target.value)"
                  @input="(ev) => handleInput(ev.target.value)"
                />
              </div>
          </template>
          </v-text-field>
        </div>
        <div v-else-if="propType === 'slider'">
          <v-slider
            track-color="white"
            :value="prop.getValue()"
            :min="prop.getMin()"
            :max="prop.getMax()"
            :step="prop.getStep()"
            @change="handleChange"
            @input="(value) => { console.log('trigger input', value) }"
            @start="(value) => { console.log('trigger start', value) }"
          />
        </div>
        <div v-else-if="propType === 'file'">
          <v-btn @click="openAssets(prop)" block>
            <v-row>
              <v-col v-if="prop.getValue() && prop.getValue() !== defValue" cols="auto">
                <div class="sm-btn-prv" :style="{ backgroundImage: `url(${prop.getValue()})` }"></div>
              </v-col>
              <v-col>Select image</v-col>
            </v-row>
          </v-btn>
        </div>
        <div v-else-if="propType === 'composite'">
          <v-row no-gutters class="sm-type-cmp pa-2">
            <property-field v-for="p in prop.getProperties()" :key="p.getId() + p.canClear()" :prop="p"/>
          </v-row>
        </div>
        <div v-else-if="propType === 'stack'">
          <div class="sm-type-cmp pa-3">
            <v-icon @click="prop.addLayer({}, { at: 0 })" class="sm-add-layer" small>mdi-plus</v-icon>
            <v-row class="sm-layer" v-for="layer in prop.getLayers()" :key="layer.getId()">
              <v-col>
                <v-row>
                  <v-col cols="auto" class="pr-1">
                    <v-icon @click="layer.move(layer.getIndex() - 1)" small>mdi-arrow-up</v-icon>
                  </v-col>
                  <v-col cols="auto" class="pl-1">
                    <v-icon @click="layer.move(layer.getIndex() + 1)" small>mdi-arrow-down</v-icon>
                  </v-col>
                  <v-col @click="layer.select()">{{ layer.getLabel() }}</v-col>
                  <v-col cols="auto">
                      <div :class="['sm-layer-prv white', `sm-layer-prv--${propName}`]" :style="layer.getStylePreview({ number: { min: -3, max: 3 } })"></div>
                  </v-col>
                  <v-col cols="auto">
                    <v-icon @click="layer.remove()" small>mdi-close</v-icon>
                  </v-col>
                </v-row>
                <v-row v-if="layer.isSelected()" no-gutters class="sm-type-cmp pa-2 mt-3">
                  <property-field v-for="p in prop.getProperties()" :key="p.getId()" :prop="p"/>
                </v-row>
              </v-col>
            </v-row>
          </div>
        </div>
        <div v-else>
          <v-text-field :placeholder="defValue" :value="inputValue" @change="handleChange" outlined dense/>
        </div>
    </v-col>
  </div>
</div>
<script>

  const sm = editor.StyleManager;
  const Observer = (new Vue()).$data.__ob__.constructor; // obj.__ob__ = new Observer({});

  Vue.mixin({
    data() {
      return { editor };
    }
  });

  Vue.component('property-field', {
    props: { prop: Object },
    template: '#property-field',
    computed: {
      labelCls() {
        const { prop } = this;
        const parent = prop.getParent();
        const hasParentValue = prop.hasValueParent() && (parent ? parent.isDetached() : true);
        return ['flex-nowrap', prop.canClear() && 'indigo--text text--accent-1', hasParentValue && 'orange--text'];
      },
      inputValue() {
        return this.prop.hasValue() ? this.prop.getValue() : '';
      },
      propName() {
        return this.prop.getName();
      },
      propType() {
        return this.prop.getType();
      },
      defValue() {
        return this.prop.getDefaultValue();
      },
      toOptions() {
        const { prop } = this;
        return prop.getOptions().map(o => ({ value: prop.getOptionId(o), text: prop.getOptionLabel(o) }))
      },
    },
    methods: {
      handleChange(value) {
        this.prop.upValue(value);
      },
      handleInput(value) {
        this.prop.upValue(value, { partial: true });
      },
      openAssets(prop) {
        const { Assets } = this.editor;
        Assets.open({
          select: (asset, complete) => {
            prop.upValue(asset.getSrc(), { partial: !complete });
            complete && Assets.close();
          },
          types: ['image'],
          accept: 'image/*',
        })
      }
    }
  })

  const app = new Vue({
    vuetify: new Vuetify({
      theme: { dark: true },
    }),
    el: '.style-manager',
    data: { sectors: [] },
    mounted() {
      editor.on('style:custom', this.handleCustom);
    },
    destroyed() {
      editor.off('style:custom', this.handleCustom);
    },
    methods: {
      handleCustom(props) {
        if (props.container && !props.container.contains(this.$el)) {
          props.container.appendChild(this.$el);
        }
        this.sectors = sm.getSectors({ visible: true });
      },
    }
  });
</script>
-->

## Events

For a complete list of available events, check [here](/api/style_manager.html#available-events).

[Components]: Components.html
[I18n]: I18n.html
[Style Manager API]: /api/style_manager.html
