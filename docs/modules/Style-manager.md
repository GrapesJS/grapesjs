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

The Style Manager module is organized in sectors where each sector contains a list of properties to display. The default Style Manager configuration contains already a list of common property styles and you can see them by simply skipping the `styleManagerConfig.sectors` option.

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

Define sectors + label i18n

### Property defintions

#### Built-in properties

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
[Style Manager API]: </api/style_manager.html>