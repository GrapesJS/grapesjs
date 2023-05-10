---
title: Pages
---

# Pages

The Pages module in GrapesJS allows you to create a project with multiple pages. By default, one page is always created under the hood, even if you don't need multi-page support. This allows keeping the API consistent and easier to extend if you need to add multiple pages later.

::: warning
This guide is referring to GrapesJS v0.21.1 or higher
:::

[[toc]]

## Initialization

The default editor initialization doesn't require any knowledge of pages and this was mainly done to avoid introducing breaking changes when the Pages module was introduced.

This is how a typical editor initialization looks like:

```js
const editor = grapesjs.init({
  container: '#gjs',
  height: '100%',
  storageManager: false,
  // CSS or a JSON of styles
  style: '.my-el { color: red }',
  // HTML string or a JSON of components
  components: '<div class="my-el">Hello world!</div>',
  // ...other config options
});
```

What actually is happening is that this configuration is automatically migrated to the Page Manager.

```js
const editor = grapesjs.init({
  container: '#gjs',
  height: '100%',
  storageManager: false,
  pageManager: {
   pages: [
     {
       // without an explicit ID, a random one will be created
       id: 'my-first-page',
       // CSS or a JSON of styles
       styles: '.my-el { color: red }',
       // HTML string or a JSON of components
       component: '<div class="my-el">Hello world!</div>',
     }
  ]
 },
});
```

::: warning
Worth noting the previous keys are `style` and `components`, where in pages you should use `styles` and `component`.
:::

As you might guess, this is how initializing the editor with multiple pages would look like:

```js
const editor = grapesjs.init({
  // ...
  pageManager: {
   pages: [
     {
       id: 'my-first-page',
       styles: '.my-page1-el { color: red }',
       component: '<div class="my-page1-el">Page 1</div>',
     },
     {
       id: 'my-second-page',
       styles: '.my-page2-el { color: blue }',
       component: '<div class="my-page2-el">Page 2</div>',
     },
  ]
 },
});
```

GrapesJS doesn't provide any default UI for the Page Manager but you can easily built one by leveraging its [APIs][Pages API]. Check the [Customization](#customization) section for more details on how to create your own Page Manager UI.





## Programmatic usage

If you need to manage pages programmatically you can use its [APIs][Pages API].

Below are some commonly used methods:
```js
// Get the Pages module first
const pages = editor.Pages;

// Get an array of all pages
const allPages = pages.getAll();

// Get currently selected page
const selectedPage = pages.getSelected();

// Add a new Page
const newPage = pages.add({
  id: 'new-page-id',
  styles: '.my-class { color: red }',
  component: '<div class="my-class">My element</div>',
});

// Get the Page by ID
const page = pages.get('new-page-id');

// Select another page by ID
pages.select('new-page-id');
// or by passing the Page instance
pages.select(page);

// Get the HTML/CSS code from the page component
const component = page.getMainComponent();
const htmlPage = editor.getHtml({ component });
const cssPage = editor.getCss({ component });

// Remove the Page by ID (or by Page instance)
pages.remove('new-page-id');
```



## Customization

By using the [Pages API] it's easy to create your own Page Manager UI.

The simpliest way is to subscribe to the catch-all `page` event, which is triggered on any change related to the Page module (not related to page content like components or styles), and update your UI accordingly.

```js
const editor = grapesjs.init({
    // ...
});

editor.on('page', () => {
    // Update your UI
});
```

In the example below you can see an quick implementation of the Page Manager UI.

<demo-viewer value="1y6bgeo3" height="500" darkcode/>


<!-- Demo template, here for reference
<style>
  .app-wrap {
    height: 100%;
    width: 100%;
    display: flex;
  }
  .editor-wrap  {
    widtH: 100%;
    height: 100%;
  }
  .pages-wrp, .pages {
    display: flex;
    flex-direction: column
  }
  .pages-wrp {
      background: #333;
      padding: 5px;
  }
  .add-page {
    background: #444444;
    color: white;
    padding: 5px;
    border-radius: 2px;
    cursor: pointer;
    white-space: nowrap;
    margin-bottom: 10px;
  }
  .page {
    background-color: #444;
    color: white;
    padding: 5px;
    margin-bottom: 5px;
    border-radius: 2px;
    cursor: pointer;

    &.selected {
      background-color: #706f6f
    }
  }

  .page-close {
    opacity: 0.5;
    float: right;
    background-color: #2c2c2c;
    height: 20px;
    display: inline-block;
    width: 17px;
    text-align: center;
    border-radius: 3px;

    &:hover {
      opacity: 1;
    }
  }
</style>

<div style="height: 100%">
  <div class="app-wrap">
    <div class="pages-wrp">
        <div class="add-page" @click="addPage">Add new page</div>
        <div class="pages">
          <div v-for="page in pages" :key="page.id" :class="{page: 1, selected: isSelected(page) }" @click="selectPage(page.id)">
            {{ page.get('name') || page.id }} <span v-if="!isSelected(page)" @click="removePage(page.id)" class="page-close">&Cross;</span>
          </div>
        </div>
    </div>
    <div class="editor-wrap">
      <div id="gjs"></div>
    </div>
  </div>
</div>

<script>
const editor = grapesjs.init({
  container: '#gjs',
  height: '100%',
  storageManager: false,
  plugins: ['gjs-blocks-basic'],
  pageManager: {
    pages: [{
      id: 'page-1',
      name: 'Page 1',
      component: '<div id="comp1">Page 1</div>',
      styles: `#comp1 { color: red }`,
    }, {
      id: 'page-2',
      name: 'Page 2',
      component: '<div id="comp2">Page 2</div>',
      styles: `#comp2 { color: green }`,
    }, {
      id: 'page-3',
      name: 'Page 3',
      component: '<div id="comp3">Page 3</div>',
      styles: `#comp3 { color: blue }`,
    }]
  },
});

const pm = editor.Pages;

const app = new Vue({
  el: '.pages-wrp',
  data: { pages: [] },
  mounted() {
    this.setPages(pm.getAll());
    editor.on('page', () => {
      this.pages = [...pm.getAll()];
    });
  },
  methods: {
    setPages(pages) {
      this.pages = [...pages];
    },
    isSelected(page) {
      return pm.getSelected().id == page.id;
    },
    selectPage(pageId) {
      return pm.select(pageId);
    },
    removePage(pageId) {
      return pm.remove(pageId);
    },
    addPage() {
      const len = pm.getAll().length;
      pm.add({
        name: `Page ${len + 1}`,
        component: '<div>New page</div>',
      });
    },
  }
});
</script>
-->


## Events

For a complete list of available events, you can check it [here](/api/pages.html#available-events).


[Pages API]: </api/pages.html>
