# <%= name %>

## Live Demo

> **Show a live example of your plugin**

To make your plugin more engaging, create a simple live demo using online tools like [JSFiddle](https://jsfiddle.net), [CodeSandbox](https://codesandbox.io), or [CodePen](https://codepen.io). Include the demo link in your README. Adding a screenshot or GIF of the demo is a bonus.

Below, you'll find the necessary HTML, CSS, and JavaScript. Copy and paste this code into one of the tools mentioned. Once you're done, delete this section and update the link at the top with your demo.

### HTML

```html
<link href="https://unpkg.com/grapesjs/dist/css/grapes.min.css" rel="stylesheet" />
<script src="https://unpkg.com/grapesjs"></script>
<script src="https://unpkg.com/<%= rName %>"></script>

<div id="gjs"></div>
```

### JS

```js
const editor = grapesjs.init({
  container: '#gjs',
  height: '100%',
  fromElement: true,
  storageManager: false,
  plugins: ['<%= rName %>'],
});
```

### CSS

```css
body,
html {
  margin: 0;
  height: 100%;
}
```

## Summary

- Plugin name: `<%= rName %>`
- Components
  - `component-id-1`
  - `component-id-2`
  - ...
- Blocks
  - `block-id-1`
  - `block-id-2`
  - ...

## Options

| Option    | Description        | Default         |
| --------- | ------------------ | --------------- |
| `option1` | Description option | `default value` |

## Download

- CDN
  - `https://unpkg.com/<%= rName %>`
- NPM
  - `npm i <%= rName %>`
- GIT
  - `git clone https://github.com/<%= user %>/<%= rName %>.git`

## Usage

Directly in the browser

```html
<link href="https://unpkg.com/grapesjs/dist/css/grapes.min.css" rel="stylesheet" />
<script src="https://unpkg.com/grapesjs"></script>
<script src="path/to/<%= rName %>.min.js"></script>

<div id="gjs"></div>

<script type="text/javascript">
  var editor = grapesjs.init({
    container: '#gjs',
    // ...
    plugins: ['<%= rName %>'],
    pluginsOpts: {
      '<%= rName %>': {
        /* options */
      },
    },
  });
</script>
```

Modern javascript

```js
import grapesjs from 'grapesjs';
import plugin from '<%= rName %>';
import 'grapesjs/dist/css/grapes.min.css';

const editor = grapesjs.init({
  container : '#gjs',
  // ...
  plugins: [plugin],
  pluginsOpts: {
    [plugin]: { /* options */ }
  }
  // or
  plugins: [
    editor => plugin(editor, { /* options */ }),
  ],
});
```

## Development

Clone the repository

```sh
$ git clone https://github.com/<%= user %>/<%= rName %>.git
$ cd <%= rName %>
```

Install dependencies

```sh
npm i
```

Start the dev server

```sh
npm start
```

Build the source

```sh
npm run build
```

## License

MIT
