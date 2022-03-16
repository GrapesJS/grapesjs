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

  /**
   * In case the `remote` storage is selected, and this options is enabled, the project
   * will be stored on the `local` storage in case the remote one fails.
   * The local data are cleared on every sucessful remote save. When the remote storage
   * fails (eg. network issue) and the editor is reloaded, a dialog with the possibility to
   * recovery previous data will be shown.
   * @example
   * // Enable recovery with default confirm dialog
   * recovery: true,
   * // Enable recovery with a custom dialog
   * recovery: (accept, cancel, editor) => {
   *   confirm('Recover data?') ? accept() : cancel();
   * },
   */
  recovery: false,

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
      // Custom headers
      headers: {},

      // Endpoint URL where to store data project
      urlStore: '',

      // Endpoint URL where to load data project
      urlLoad: '',

      // set contentType paramater of $.ajax
      // true: application/json; charset=utf-8'
      // false: 'x-www-form-urlencoded'
      contentTypeJson: true,

      // Pass custom options to fetch API (remote storage)
      // You can pass a simple object: { someOption: 'someValue' }
      // or a function which returns and object to add:
      // currentOpts => {
      //  return currentOpts.method === 'POST' ?  { method: 'PATCH' } : {};
      // }
      fetchOptions: '',

      credentials: 'include',

      /**
       * Edit project data before sending them to the storage.
       */
      onStore: data => data,

      /**
       * Edit project data before loading them from the storage.
       */
      onLoad: result => result,
    },
  },
};
