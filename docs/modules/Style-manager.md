---
title: Style Manager
---

# Style Manager

Coming soon

[[toc]]


## Built-in properties

Here you can find all the available built-in properties that you can use inside Style Manager via `buildProps`:

`float`, `position`, `text-align`, `display`, `font-family`, `font-weight`, `border`, `border-style`, `border-color`, `border-width`, `box-shadow`, `background-repeat`, `background-position`, `background-attachment`, `background-size`, `transition`, `transition-duration`, `transition-property`, `transition-timing-function`, `top`, `right`, `bottom`, `left`, `margin`, `margin-top`, `margin-right`, `margin-bottom`, `margin-left`, `padding`, `padding-top`, `padding-right`, `padding-bottom`, `padding-left`, `width`, `heigth`, `min-width`, `min-heigth`, `max-width`, `max-heigth`, `font-size`, `letter-spacing`, `line-height`, `text-shadow`, `border-radius`, `border-top-left-radius`, `border-top-right-radius`, `border-bottom-left-radius`, `border-bottom-right-radius`, `perspective`, `transform`, `transform-rotate-x`, `transform-rotate-y`, `transform-rotate-z`, `transform-scale-x`, `transform-scale-y`, `transform-scale-z`, `color`, `background-color`, `background`, `background-image`, `cursor`

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
