---
title: Storage Manager
---

# Storage Manager

The Storage Manager is a built-in module that allows you to persist your project data.

::: warning
This guide requires GrapesJS v0.19.\* or higher.
:::

::: tip
Need more powerful and customizable storage options? [The Grapes Studio SDK has you covered.](https://app.grapesjs.com/docs-sdk/configuration/projects?utm_source=grapesjs-docs&utm_medium=tip#storage)
:::

[[toc]]

## Configuration

To change the default configuration, pass the `storageManager` property in the main configuration object.

```js
const editor = grapesjs.init({
  ...
  // Default configuration
  storageManager: {
    type: 'local', // Storage type. Available: local | remote
    autosave: true, // Store data automatically
    autoload: true, // Autoload stored data on init
    stepsBeforeSave: 1, // If autosave is enabled, indicates how many changes are necessary before the store method is triggered
    // ...
    // Default storage options
    options: {
      local: {/* ... */},
      remote: {/* ... */},
    }
  },
});
```

In case you don't need any persistence, you can disable the module in this way:

```js
const editor = grapesjs.init({
  ...
  storageManager: false,
});
```

Check the full list of available options here: [Storage Manager Config](https://github.com/GrapesJS/grapesjs/blob/master/src/storage_manager/config/config.ts)

## Project data

Project data is a JSON object containing all the necessary information (styles, pages, etc.) about your project in the editor. The Storage Manager uses this object to store and load your project locally or remotely in a database or file.

::: tip
You can get the current state of the data and load it manually in this way:

```js
// Get current project data
const projectData = editor.getProjectData();
// ...
// Load project data
editor.loadProjectData(projectData);
```

:::

::: danger
You should only rely on the JSON project data in order to load your project properly in the editor.

The editor can parse and use HTML/CSS code as part of your project initialization. However, never rely on HTML/CSS as a persistence layer when loading projects, as important information may be lost.
:::

<!-- If necessary, the JSON can also be enriched with your own data. As the schema might change over time, we strongly recommend storing it under keys specific to your application. -->

## Storage strategy

Project data is automatically stored every time the number of changes (`editor.getDirtyCount()`) reaches the number of steps before save (`editor.Storage.getStepsBeforeSave()`). After each successful save, the change counter is reset (`editor.clearDirtyCount()`).

::: tip
When necessary, you can always trigger store/load manually.

```js
// Store data
const storedProjectData = await editor.store();

// Load data
const loadedProjectData = await editor.load();
```

:::

## Setup local storage

By default, GrapesJS saves the data locally by using the built-in `local` storage, which uses the [localStorage API].

The main local storage option to consider is the `key` used to store the data. If the user loads different projects in your application, you may need to use a different key for each project ID (an ID defined by your application).

```js
// Get your project ID (e.g., taken from the route)
const projectId = getProjectId();

const editor = grapesjs.init({
  ...
  storageManager: {
    type: 'local',
    options: {
      local: { key: `gjsProject-${projectId}` }
    }
  },
});
```

## Setup remote storage

Project data is often saved remotely on your server (in a database, file, etc.), so you need to set up your server-side API to store/load it.

For simplicity, we can set up a mock REST API server using [json-server].

```sh
mkdir my-server
cd my-server
npm init
npm i json-server
echo '{"projects": [ {"id": 1, "data": {"assets": [], "styles": [], "pages": [{"component": "<div>Initial content</div>"}]} } ]}' > db.json
npx json-server --watch db.json
```

This will start up a local server with a single project available at `http://localhost:3000/projects/1`. The data will be updated in the `db.json` file.

Here's an example of how to configure `remote` storage in GrapesJS:

```js
const projectID = 1;
const projectEndpoint = `http://localhost:3000/projects/${projectID}`;

const editor = grapesjs.init({
  ...
  storageManager: {
    type: 'remote',
    stepsBeforeSave: 3,
    options: {
      remote: {
        urlLoad: projectEndpoint,
        urlStore: projectEndpoint,
        // The `remote` storage uses POST when storing data, but
        // the json-server API requires PATCH.
        fetchOptions: opts => (opts.method === 'POST' ?  { method: 'PATCH' } : {}),
        // As the API stores projects in this format `{id: 1, data: projectData }`,
        // we have to properly update the body before the store and extract the
        // project data from the response result.
        onStore: data => ({ id: projectID, data }),
        onLoad: result => result.data,
      }
    }
  }
});
```

::: danger
Be sure to configure [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) properly for your server API. [json-server] is not intended for production use and enables cross-origin requests automatically.
:::

<div id="setup-the-server"></div>

### Server setup

Server configuration varies from case to case, so adapt it to your requirements.
The default remote storage follows a simple REST API approach with project data exchanged as JSON (`Content-Type: application/json`).

- On **load** (`GET` method), the JSON project data is expected to be returned directly in the response. As shown in the example above, you can use `options.remote.onLoad` to extract the project data if the response contains other metadata.
- On **store** (`POST` method), the editor doesn't expect any particular result but only a valid response from the server (status code `200`).

<!-- ## Store and load templates

Even without a working endpoint, you can see what the editor sends by triggering storage and checking the inspector's network panel. GrapesJS sends four main types of parameters, prefixed with `gjs-` (you can disable the prefix via `storageManager.id`). The 'gjs-html' and 'gjs-css' parameters contain the final template/page that end users will see. The other two, 'gjs-components' and 'gjs-styles', contain a JSON representation of your template and should be used for editing. **Be careful**: although GrapesJS can start from HTML/CSS, use this only to import existing templates. Once the user starts editing, always rely on JSON objects, as HTML does not contain all component information. If you render your page on the server, you can provide the data directly without loading it asynchronously and disable `autoload`.

```js
// Let's say you have an existing HTML template and want to
// import it on the fly for the user
const LandingPage = {
  html: `<div>...</div>`,
  css: null,
  components: null,
  style: null,
};
// ...
const editor = grapesjs.init({
  ...
  // If set to true, then the content within the wrapper element overrides the following config,
  fromElement: false,
  // The `components` option accepts an HTML string or components in JSON format.
  // Use components if they are already defined; otherwise,
  // use the HTML string.
  components: LandingPage.components || LandingPage.html,
  // We might want to make the same check for styles
  style: LandingPage.style || LandingPage.css,
  // As we already initialize the editor with the template we can skip the `autoload`
  storageManager: {
    ...
    autoload: false,
  },
});
``` -->

## Storage API

The Storage Manager module also has its own [set of APIs](/api/storage_manager.html), which allows you to extend it and add functionality.

### Define new storage

Defining a new storage type involves passing two asynchronous methods to the `editor.Storage.add` API. For simplicity, the example below defines `session` storage using the [sessionStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage).

```js
const sessionStoragePlugin = (editor) => {
  // As sessionStorage is not an asynchronous API,
  // the `async` keyword could be skipped
  editor.Storage.add('session', {
    async load(options = {}) {
      return JSON.parse(sessionStorage.getItem(options.key));
    },

    async store(data, options = {}) {
      sessionStorage.setItem(options.key, JSON.stringify(data));
    }
  });
};

const editor = grapesjs.init({
  ...
  plugins: [sessionStoragePlugin],
  storageManager: {
    type: 'session',
    options: {
      session: { key: 'myKey' }
    }
  },
});
```

### Extend storage

You might need to combine existing storage types for a more complex use case.
For example, we can combine local and remote storage in a new storage type like this:

```js
const { Storage } = editor;

Storage.add('remote-local', {
  async store(data) {
    const remoteStorage = Storage.get('remote');

    try {
      await remoteStorage.store(data, Storage.getStorageOptions('remote'));
    } catch (err) {
      // On remote error, store data locally
      const localStorage = Storage.get('local');
      await localStorage.store(data, Storage.getStorageOptions('local'));
    }
  },

  async load() {
    // ...
  },
});
```

### Replace storage

You can also replace existing storage types with other implementations by passing the same storage type in the `Storage.add` method. You can switch, for example, the default `local` storage, which relies on the [localStorage API], with something more scalable like [IndexedDB API].

If you're already using an HTTP client library (e.g., [axios](https://github.com/axios/axios)) that handles the necessary HTTP headers in your application (CSRF token, session data, etc.), you can replace the default `remote` storage with your own implementation without relying on the default configuration.

```js
editor.Storage.add('remote', {
  async load() {
    return await axios.get(`projects/${projectId}`);
  },

  async store(data) {
    return await axios.patch(`projects/${projectId}`, { data });
  },
});
```

<!-- ### Examples

Here you can find some of the plugins extending the Storage Manager

* [grapesjs-indexeddb] - Storage wrapper for IndexedDB
* [grapesjs-firestore] - Storage wrapper for [Cloud Firestore](https://firebase.google.com/docs/firestore) -->

## Common use cases

### Skip initial load

If you're using `remote` storage, you may want to skip the initial remote call by providing the project data directly. To do this, specify `projectData` during initialization.

```js
// Get the data before initializing the editor (e.g., rendered on the server).
const projectData = {...};
// ...
grapesjs.init({
  // ...
  // If projectData is not defined we might want to load some initial data for the project.
  projectData: projectData || {
    pages: [
        {
          component: `
            <div class="test">Initial content</div>
            <style>.test { color: red }</style>
          `
        }
    ]
  },
  storageManager: {
    type: 'remote',
    // ...
  },
})
```

In case `projectData` is defined, the initial storage load will be automatically skipped.

### HTML code with project data

The project data doesn't contain the HTML/CSS of your pages, as its main purpose is to collect only the necessary information.
If you need to run additional logic when storing project data (e.g., deploying the HTML/CSS to a staging environment), you can enrich your remote calls using the `onStore` option in the remote configuration.

```js
grapesjs.init({
  // ...
  storageManager: {
    type: 'remote',
    options: {
      remote: {
        // Enrich the store call
        onStore: (data, editor) => {
          const pagesHtml = editor.Pages.getAll().map((page) => {
            const component = page.getMainComponent();
            return {
              html: editor.getHtml({ component }),
              css: editor.getCss({ component }),
            };
          });
          return { id: projectID, data, pagesHtml };
        },
        // If on load, you're returning the same JSON from above...
        onLoad: (result) => result.data,
      },
    },
  },
});
```

### Inline project data

In some cases, the editor isn't connected to a storage backend and simply reads/writes data in form inputs. For these cases, you can create inline storage.

```html
<form id="my-form">
  <input id="project-html" type="hidden" />
  <input id="project-data" type="hidden" value='{"pages": [{"component": "<div>Initial content</div>"}]}' />
  <div id="gjs"></div>
  <button type="submit">Submit</button>
</form>

<script>
  // Show data on submit
  document.getElementById('my-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const projectDataEl = document.getElementById('project-data');
    const projectHtmlEl = document.getElementById('project-html');
    alert(`HTML: ${projectHtmlEl.value}\n------\nDATA: ${projectDataEl.value}`);
  });

  // Inline storage
  const inlineStorage = (editor) => {
    const projectDataEl = document.getElementById('project-data');
    const projectHtmlEl = document.getElementById('project-html');

    editor.Storage.add('inline', {
      load() {
        return JSON.parse(projectDataEl.value || '{}');
      },
      store(data) {
        const component = editor.Pages.getSelected().getMainComponent();
        projectDataEl.value = JSON.stringify(data);
        projectHtmlEl.value = `<html>
          <head>
            <style>${editor.getCss({ component })}</style>
          </head>
          ${editor.getHtml({ component })}
        <html>`;
      },
    });
  };

  // Init editor
  grapesjs.init({
    container: '#gjs',
    height: '500px',
    plugins: [inlineStorage],
    storageManager: { type: 'inline' },
  });
</script>
```

In the example above, we use two hidden inputs: one for the project data and another for the HTML/CSS.

## Events

For a complete list of available events, check [here](/api/storage_manager.html#available-events).

[grapesjs-indexeddb]: https://github.com/GrapesJS/storage-indexeddb
[grapesjs-firestore]: https://github.com/GrapesJS/storage-firestore
[localStorage API]: https://developer.mozilla.org/it/docs/Web/API/Window/localStorage
[IndexedDB API]: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
[json-server]: https://github.com/typicode/json-server
