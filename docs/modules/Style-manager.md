---
title: Style Manager
---

# Style Manager

::: danger TODO
Hero image
<!-- <p align="center"><img src="http://grapesjs.com/img/sc-grapesjs-blocks-prp.jpg" alt="GrapesJS - Block Manager" height="400" align="center"/></p> -->
:::

The Style Manager module is responsible to show and update style properties on your [Components]. In this guide, you will see how to setup and take full advantage of the built-in Style Manager UI in GrapesJS.
The default UI is a lightweight component with built-in properties, but as you'll see next in this guide, it's easy to extend with your own elements or even create the Style Manager UI from scratch by using the [Style Manager API].

::: warning
To get a better understanding of the content in this guide, we recommend reading [Components] first
:::
::: warning
This guide is referring to GrapesJS v0.17.30 or higher
:::

[[toc]]

## Configuration

To change the default configurations you have to pass the `styleManager` property with the main configuration object.

```js
const editor = grapesjs.init({
  ...
  styleManager: {
    sectors: [...],
    ...
  }
});
```

Check the full list of available options here: [Style Manager Config](https://github.com/artf/grapesjs/blob/master/src/style_manager/config/config.js)





## Initialization

The Style Manager module is organized in sectors where each sector contains a list of properties to display. The default Style Manager configuration contains already a list of default common property styles and you can use them by simply skipping the `styleManagerConfig.sectors` option.

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

### Sector defintions

Each sector is identified by its `name` and a list of `properties` to display. You can also specify the `id` in order to access the sector via API (if not indicated it will be generated from the `name`) and the default `open` state.

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
The label of the sector you see in the editor is using directly the `name` but you can also rely on the [I18n] module via sector's `id` in case you plan to have a multi-language editor.

```js
grapesjs.init({
  i18n: {
    // Use `messagesAdd` in order to extend the default set
    messagesAdd: {
      en: {
        styleManager: {
          sectors: {
            'first-sector-id': 'First sector EN'
          }
        }
      }
    }
  },
  // ...
  styleManager: {
    sectors: [
      {
        id: 'first-sector-id',
        // You can leave the name as a fallback in case the i18n definition is missing
        name: 'First sector',
      },
      // ...
    ],
  },
});
```

### Property defintions

Once you have defined your sector you can start adding property definitions inside `properties`. Each property has a common set of options (`label`, `default`, etc.) and others specific by their `type`.

Let's see below a simple definition for controlling the padding style.

```js
sectors: [
  {
    name: 'First sector',
    properties: [
      {
        // Default options
        // id: 'padding', // The id of the property, if missing, will be the same as `property` value
        type: 'number',
        label: 'Padding', // Label for the property
        property: 'padding', // CSS property to change
        default: '0', // Default value to display
        // Additonal `number` options
        units: ['px', '%'], // Units (available only for the 'number' type)
        min: 0, // Min value (available only for the 'number' type)
      }
    ],
  },
]
```
This will render the number input UI and will change the `padding` CSS property on the selected component.

The flexibility of the definition allows you to create easily different UI inputs for any possible CSS property. You're free to decide what will be the best UI for your users. If you take for example a numeric property like `font-size`, you can follow its CSS specification and define it as a `number`

```js
{
  type: 'number',
  label: 'Font size',
  property: 'font-size',
  units: ['px', '%', 'em', 'rem', 'vh', 'vw'],
  min: 0,
}
```
or you can decide to show it as a `select` and make available only a defined set of values (eg. based on your Design System tokens).

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

Each type defines the specific UI view and a model on how to handle inputs and updates.
Let's see below the list of all available default types with their relative UI and models.

#### Default types

::: tip
Each **Model** describes more in detail available props and their usage.
:::

* `base` - The base type, renders as a simple text input field. **Model**: [Property](/api/property.html)

  <img :src="$withBase('/sm-base-type.jpg')"/>

  ```js
  // Example
  {
    // type: 'base', // Omitting the type in definition will fallback to the 'base'
    property: 'some-css-property',
    label: 'Base type',
    default: 'Default value',
  },
  ```

* `color` - Same props as `base` but the UI is a color picker. **Model**: [Property](/api/property.html)

  <img :src="$withBase('/sm-type-color.jpg')"/>

* `number` - Number input field for numeric values. **Model**: [PropertyNumber](/api/property_number.html)

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
* `slider` - Same props as `number` but the UI is a slider. **Model**: [PropertyNumber](/api/property_number.html)

  <img :src="$withBase('/sm-type-slider.jpg')"/>

* `select` - Select input with options. **Model**: [PropertySelect](/api/property_select.html)

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

* `radio` - Same props as `select` but the UI is a radio button. **Model**: [PropertySelect](/api/property_select.html)

  <img :src="$withBase('/sm-type-radio.jpg')"/>

* `composite` - This type is great for CSS shorthand properties, where the final value is a composition of multiple sub properties. **Model**: [PropertyComposite](/api/property_composite.html)

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
* `stack` - This type is great for CSS multiple properties like `text-shadow`, `box-shadow`, `transform`, etc. **Model**: [PropertyStack](/api/property_stack.html)

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

In order to speed up the Style Manager configuration, GrapesJS is shipped with a set of already defined common CSS properties which you can reuse and extend.

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
      // If the property doesn't exist it will be converted to a base type
      'unknown-property' // -> { type: 'base', property: 'unknown-property' }
    ],
  },
]
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

## Orchestration by Components

## Programmatic usage

## Customization

## Events


Here you can find all the available built-in properties that you can use inside Style Manager via `buildProps`:

`float`, `position`, `text-align`, `display`, `font-family`, `font-weight`, `border`, `border-style`, `border-color`, `border-width`, `box-shadow`, `background-repeat`, `background-position`, `background-attachment`, `background-size`, `transition`, `transition-duration`, `transition-property`, `transition-timing-function`, `top`, `right`, `bottom`, `left`, `margin`, `margin-top`, `margin-right`, `margin-bottom`, `margin-left`, `padding`, `padding-top`, `padding-right`, `padding-bottom`, `padding-left`, `width`, `height`, `min-width`, `min-height`, `max-width`, `max-height`, `font-size`, `letter-spacing`, `line-height`, `text-shadow`, `border-radius`, `border-top-left-radius`, `border-top-right-radius`, `border-bottom-left-radius`, `border-bottom-right-radius`, `perspective`, `transform`, `transform-rotate-x`, `transform-rotate-y`, `transform-rotate-z`, `transform-scale-x`, `transform-scale-y`, `transform-scale-z`, `color`, `background-color`, `background`, `background-image`, `cursor`, `flex-direction`, `flex-wrap`, `justify-content`, `align-items`, `align-content`, `order`, `flex-basis`, `flex-grow`, `flex-shrink`, `align-self`, `overflow`, `overflow-x`, `overflow-y`

Example usage:
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


[Components]: <Components.html>
[I18n]: <I18n.html>
[Style Manager API]: </api/style_manager.html>