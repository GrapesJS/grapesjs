---
title: Storage Manager
---

# Storage Manager

The Storage Manager is a built-in module that allows the persistence of your project data.

::: warning
This guide requires GrapesJS v0.19.* or higher
:::

[[toc]]

## Configuration

To change the default configurations you have to pass the `storageManager` property with the main configuration object.

```js
const editor = grapesjs.init({
  ...
  // Default configurations
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

The project data is a JSON object containing all the necessary information (styles, pages, etc.) about your project in the editor and is the one used in the storage manager methods in order to store and load your project (locally or remotely in your DB/file).

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

The editor is able to parse and use HTML/CSS code, you can use it as part of your project initialization but never rely on it as a persitance layer in the load of projects as many information could be stripped off.
:::

<!-- If necessary, the JSON can be also enriched with your data of choice, but as the data schema might differ in time we highly recommend to store them in your domain specific keys-->




## Storage strategy

Project data are automatically stored every time the amount of changes (`editor.getDirtyCount()`) reaches the number of steps before save (`editor.Storage.getStepsBeforeSave()`). On any successful store of the data, the counter of changes is reset (`editor.clearDirtyCount()`).

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

By default, GrapesJS saves the data locally by using the built-in `local` storage which leverages [localStorage API].

The only option you might probably care for the local storage is the `key` used to store the data. If the user loads different projects in your application, you might probably need to differentiate the local storage by the ID of the project (the ID here is intended to be part of your application domain).

```js
// Get your project ID (eg. taken from the route)
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

Most commonly the data of the project might be saved remotely on your server (DB, file, etc.) therefore you need to setup your server-side API calls in order to store/load project data.

For a sake of simplicity we can setup a fake REST API server by relying on [json-server].

```sh
mkdir my-server
cd my-server
npm init
npm i json-server
echo '{"projects": [ {"id": 1, "data": {"assets": [], "styles": [], "pages": [{"component": "<div>Initial content</div>"}]} } ]}' > db.json
npx json-server --watch db.json
```

This will start up a local server with one single project available on `http://localhost:3000/projects/1`. The data will be updated on the `db.json` file.

Here below an example of how you would configure a `remote` storage in GrapesJS.

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
        // The `remote` storage uses the POST method when stores data but
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
Be sure to configure properly [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) on your server API. The [json-server] is not intended to be used in production and therefore enables all of them automatically.
:::

<div id="setup-the-server"></div>

### Server setup

Server configuration might differ case to case so usually, it's up to you to know how to configure it properly.
The default remote storage follows a simple REST API approach with project data exchanged as a JSON (`Content-Type: application/json`).
* On **load** (`GET` method), the JSON project data are expected to be returned directly in the response. As from example above, you can use `options.remote.onLoad` to extract the project data if the response contains other metadata.
* On **store** (`POST` method), the editor doesn't expect any particular result but only a valid response from the server (status code `200`).





<!-- ## Store and load templates

Even without a fully working endpoint, you can see what is sent from the editor by triggering the store and looking in the network panel of the inspector. GrapesJS sends mainly 4 types of parameters and it prefixes them with the `gjs-` key (you can disable it via `storageManager.id`). From the parameters, you will get the final result in 'gjs-html' and 'gjs-css' and this is what actually your end-users will gonna see on the final template/page. The other two, 'gjs-components' and 'gjs-styles', are a JSON representation of your template and therefore those should be used for the template editing. **So be careful**, GrapesJS is able to start from any HTML/CSS but use this approach only for importing already existent HTML templates, once the user starts editing, rely always on JSON objects because the HTML doesn't contain information about your components. You can achieve it in a pretty straightforward way and if you load your page by server-side you don't even need to load asynchronously your data (so you can turn off the `autoload`).

```js
// Lets say, for instance, you start with your already defined HTML template and you'd like to
// import it on fly for the user
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
  // The `components` accepts HTML string or a JSON of components
  // Here, at first, we check and use components if are already defined, otherwise
  // the HTML string gonna be used
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

The Storage Manager module has also its own [set of APIs](/api/storage_manager.html) that allows you to extend and add new functionalities.



### Define new storage

Defining a new storage is a matter of passing of two asyncronous methods to the `editor.Storage.add` API. For a sake of simplicity, the example below illustrates the API usage for defining the `session` storage by using [sessionStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage).

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

Among other needs, you might need to use existing storages to combine them in a more complex use case.
For example, let's say we would like to mix the local and remote storages inside another one. This is how it would look like:

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

You can also replace already defined storages with other implementations by passing the same storage type in the `Storage.add` method. You can switch, for example, the default `local`, which relies on [localStorage API], with something more scalable like [IndexedDB  API].

It might also be possible that you're already using some HTTP client library (eg. [axios](https://github.com/axios/axios)) which handles for you all the necessary HTTP headers in your application (CSRF token, session data, etc.), so you can simply replace the default `remote` storage with your implementation of choice without caring about the default configurations.

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

In case you're using the `remote` storage, you might probably want to skip the initial remote call by loading the project instantly. In that case, you can specify the `projectData` on initialization.

```js
// Get the data before initializing the editor (eg. printed on server-side).
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

The project data doesn't contain HTML/CSS of your pages as its main purpose is to collect only the strictly necessary information.
In case you have a strict requirement to execute also other logic connected to the store of your project data (eg. deploy HTML/CSS result to the stage environment) you can enrich your remote calls by using the `onStore` option in the remote configuration.

```js
grapesjs.init({
  // ...
  storageManager: {
    type: 'remote',
    options: {
      remote: {
        // Enrich the store call
        onStore: (data, editor) => {
          const pagesHtml = editor.Pages.getAll().map(page => {
            const component = page.getMainComponent();
            return {
              html: editor.getHtml({ component }),
              css: editor.getCss({ component })
            }
          });
          return { id: projectID, data, pagesHtml };
        },
        // If on load, you're returning the same JSON from above...
        onLoad: result => result.data,
      }
    },
  },
})
```

### Inline project data

In might be a case where the editor is not connected to any storage but simply read/write the data in inputs placed in a form. For such a case you can create an inline storage.

```html
<form id="my-form">
  <input id="project-html" type="hidden"/>
  <input id="project-data" type="hidden" value='{"pages": [{"component": "<div>Initial content</div>"}]}'/>
  <div id="gjs"></div>
  <button type="submit">Submit</button>
</form>

<script>
  // Show data on submit
  document.getElementById('my-form').addEventListener('submit', event => {
    event.preventDefault();
    const projectDataEl = document.getElementById('project-data');
    const projectHtmlEl = document.getElementById('project-html');
    alert(`HTML: ${projectHtmlEl.value}\n------\nDATA: ${projectDataEl.value}`)
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
      }
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

In the example above we're relying on two hidden inputs, one for containing the project data and the another one for the HTML/CSS.





## Events

For a complete list of available events, you can check it [here](/api/storage_manager.html#available-events).




[grapesjs-indexeddb]: <https://github.com/GrapesJS/storage-indexeddb>
[grapesjs-firestore]: <https://github.com/GrapesJS/storage-firestore>
[localStorage API]: <https://developer.mozilla.org/it/docs/Web/API/Window/localStorage>
[IndexedDB  API]: <https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API>
[json-server]: <https://github.com/typicode/json-server>
