---
title: Storage Manager
---

# Storage Manager

The Storage Manager is a built-in module that allows the persistence of your project data. The aim of this guide is to show how to setup correctly your storage configuration for common usages of the editor and explain also some additional advanced settings.

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

Check the full list of available options here: [Storage Manager Config](https://github.com/artf/grapesjs/blob/master/src/storage_manager/config/config.js)





## Project data

The project data is a JSON object containing all the necessary information (styles, pages, etc.) about your project in the editor. You can get the current state of the data in this way:

```js
const projectData = editor.getProjectData();
```

That object is used in the storage manager methods in order to store and load your project data (locally or remotely in your DB/file).

::: danger
You should only rely on the JSON project data in order to load your project properly in the editor.

The editor is able to parse and use HTML/CSS code, you can use it as part of your project initialization but never rely on it as a persitance layer in the load of projects as many information could be stripped off.
:::

<!-- If necessary, the JSON can be also enriched with your data of choice, but as the data schema might differ in time we highly recommend to store them in your domain specific keys-->




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

For the sake of simplicity we can setup a fake REST API server by relying on [json-server].

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
Be sure to configure properly [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) on your server API. The [json-server] is not intended to be used in production and therefore enables all of them automatically for the sake of simplicity.
:::





## Store and load templates

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
```

If for any reason you need to get the data from the remote storage you can trigger the load, at any time, manually

```js
editor.load(res => console.log('Load callback'));
```

Similarly, you have the same control over the storing. By default, the `autosave` is enabled and is triggered by how many changes are made to the template (change it via `stepsBeforeSave` option). As before, you can disable this behavior and trigger it manually when you need it

```js
...
const editor = grapesjs.init({
  ...
  storageManager: {
    ...
    autosave: false,
  },
});
// Call load somewhere
editor.store(res => console.log('Store callback'));
```

If you need to check changes which yet need to be stored you can use `editor.getDirtyCount()`. At any, successful, store of the editor, it resets the count.





## Setup the server

Server configuration might differ for any use case so generally, it's something up to you on how to make it work, but usually, the flow is pretty straightforward. Create two endpoints, one for storing (eg. `mydomain.com/store-page/123`) and the other one for loading (eg. `mydomain.com/load-page/123`), you can also create just one and distinguish them via HTTP methods (eg. `mydomain.com/page/123`, via GET you load the template, with POST you store it).
When you **store**, the editor doesn't expect any particular result but only a valid response from the server (status code 200).
When you **load** the template, return a JSON object with the data you have (don't forget to include the `id` prefix if it's used)
```js
{
  // `gjs-` is the id prefix
  'gjs-components': [{ tagName: 'div', ... }, {...}, ...],
  'gjs-styles': [{...}, {...}, ...],
}
```
Be sure to have a correct `Content-Type` response header, eg. in PHP you would do something like this:
```php
header('Content-Type: application/json');
echo json_encode([
  'gjs-components': [...],
  'gjs-styles': [...],
]);
```




## Storage API

The Storage module has also its own [set of API](https://github.com/artf/grapesjs/wiki/API-Storage-Manager) that allows you to extend and add new functionalities.



### Define new storage

One of the most useful methods of API is the possibility to add new storages. You might think, we have the `local` and `remote` storages, what else do we need, right? Well, let's take as an example the `local` one. As you already know, it relies on [localStorage API] which is really cool and easy to use but one of his specs might be a big limit, by default it has a limited amount of MB to use per site (something around 5MB-10MB, depends on the browser implementation). As an alternative, we can make use of [IndexedDB] which is also quite [well supported](https://caniuse.com/#search=indexedDB) and allows more space usage (each browser implements its own rules, for a better understanding on how browser storage limits work, check [here](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Browser_storage_limits_and_eviction_criteria)).
[IndexedDB configuration](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB) might be too much verbose for this guide so we decided to create the [grapesjs-indexeddb] plugin, so you can check its source and see how it's implemented. For this guide we are going to see something much simpler but with the same flow, it'll be just a simple javascript object which stores key-value data, not persistent at all but the concept is the same.

```js
const editor = grapesjs.init({
  ...
  storageManager: { type: 'simple-storage' },
});

// Here our `simple-storage` implementation
const SimpleStorage = {};

editor.StorageManager.add('simple-storage', {
  /**
   * Load the data
   * @param  {Array} keys Array containing values to load, eg, ['gjs-components', 'gjs-styles', ...]
   * @param  {Function} clb Callback function to call when the load is ended
   * @param  {Function} clbErr Callback function to call in case of errors
   */
  load(keys, clb, clbErr) {
    const result = {};

    keys.forEach(key => {
      const value = SimpleStorage[key];
      if (value) {
        result[key] = value;
      }
    });

    // Might be called inside some async method
    clb(result);
  },

  /**
   * Store the data
   * @param  {Object} data Data object to store
   * @param  {Function} clb Callback function to call when the load is ended
   * @param  {Function} clbErr Callback function to call in case of errors
   */
  store(data, clb, clbErr) {
    for (let key in data) {
      SimpleStorage[key] = data[key];
    }
    // Might be called inside some async method
    clb();
  }
});
```



### Extend storage

Among other needs, you might need to use existing storages to create more complex uses. For example, let's say we would like to mix the local and remote storages inside another one. This is how it would look like:
```js
const sm = editor.StorageManager;

sm.add('local-remote', {
  store(data, clb, clbErr) {
    const remote = sm.get('remote');
    const local = sm.get('local');
    // ...
    remote.store(data, clb, err => {
      // eg. some error on remote side, store it locally
      local.store(data, clb, clbError);
    });
  },

  load(keys, clb, clbErr) {
    // ...
  },
});
```

If you need to completely replace the storage, just use the same id in `add` method
```js
editor.StorageManager.add('local', {
  // New logic for the local storage
  load() {
    // ...
  },

  store() {
    // ...
  },
});
```



### Examples

Here you can find some of the plugins extending the Storage Manager

* [grapesjs-indexeddb] - Storage wrapper for IndexedDB
* [grapesjs-firestore] - Storage wrapper for [Cloud Firestore](https://firebase.google.com/docs/firestore)





## Events

Another way to extend storage capabilities is to make use of GrapesJS's event hooks, you can check [here](https://github.com/artf/grapesjs/wiki/API-Editor#storages) the list of all available events for the Storage module. Let's see some of the cases where you might want to use them:

* Loading animation on storage requests
```js
editor.on('storage:start', startLoading);
editor.on('storage:end', endLoading);
```
* Error handling
```js
editor.on('storage:error', (err) => {
    alert(`Error: ${err}`);
});
```
* Extend parameters to store
```js
editor.on('storage:start:store', (objectToStore) => {
    if (needToAddExtraParam) {
      objectToStore.customHtml = `<div>...${editor.getHtml()}...</div>`;
    }
});
```
* Do stuff post load
```js
editor.on('storage:end:load', (resultObject) => {
    if (resultObject.hasSomeKey) {
      // do stuff
    }
});
```




[grapesjs-indexeddb]: <https://github.com/artf/grapesjs-indexeddb>
[grapesjs-firestore]: <https://github.com/artf/grapesjs-firestore>
[localStorage API]: <https://developer.mozilla.org/it/docs/Web/API/Window/localStorage>
[IndexedDB]: <https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API>
[json-server]: <https://github.com/typicode/json-server>
