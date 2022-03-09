export default {
  // Prefix identifier that will be used inside storing and loading
  // @deprecated
  id: 'gjs-',

  // Default storage type. Available: local | remote
  type: 'local',

  // Enable/Disable autosaving
  autosave: true,

  // Enable/Disable autoload of data on editor init
  autoload: true,

  // If autosave enabled, indicates how many steps (general changes to structure)
  // need to be done before save. Useful with remoteStorage to reduce remote calls
  stepsBeforeSave: 1,

  // Default storage options
  options: {
    local: {
      key: 'gjsProject',

      // If enabled, checks if browser supports LocalStorage
      checkLocal: true,
    },
    remote: {
      // Custom parameters to pass with the remote request, eg. csrf token
      params: {},

      // Custom headers
      headers: {},

      // Endpoint URL where to store data project
      urlStore: '',

      // Endpoint URL where to load data project
      urlLoad: '',

      //Callback before request
      beforeSend(jqXHR, settings) {},

      //Callback after request
      onComplete(jqXHR, status) {},

      // set contentType paramater of $.ajax
      // true: application/json; charset=utf-8'
      // false: 'x-www-form-urlencoded'
      contentTypeJson: true,

      // Pass custom options to fetch API (remote storage)
      // You can pass a simple object: { someOption: 'someValue' }
      // or a function which returns and object to add:
      // currentOpts => {
      //  return currentOpts.method === 'post' ?  { method: 'patch' } : {};
      // }
      fetchOptions: '',

      credentials: 'include',

      /**
       * (TODO) This will enable the store of the project also on the local storage.
       * The local data are cleared on every sucessful remote save. In case the remote storage
       * fails (eg. network issue), on project reload, a dialog with the possibility to recovery
       * previous data will be shown.
       */
      recovery: true,
    },
  },
};
