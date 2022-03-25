export default {
  // Prefix identifier that will be used inside storing and loading
  id: 'gjs-',

  // Enable/Disable autosaving
  autosave: true,

  // Indicates if load data inside editor after init
  autoload: true,

  // Indicates which storage to use. Available: local | remote
  type: 'local',

  // If autosave enabled, indicates how many steps (general changes to structure)
  // need to be done before save. Useful with remoteStorage to reduce remote calls
  stepsBeforeSave: 1,

  //Enable/Disable components model (JSON format)
  storeComponents: true,

  //Enable/Disable styles model (JSON format)
  storeStyles: true,

  //Enable/Disable saving HTML template
  storeHtml: true,

  //Enable/Disable saving CSS template
  storeCss: true,

  // ONLY FOR LOCAL STORAGE
  // If enabled, checks if browser supports Local Storage
  checkLocal: true,

  // ONLY FOR REMOTE STORAGE
  // Custom parameters to pass with the remote storage request, eg. csrf token
  params: {},

  // Custom headers for the remote storage request
  headers: {},

  // Endpoint where to save all stuff
  urlStore: '',

  // Endpoint where to fetch data
  urlLoad: '',

  //Callback before request
  beforeSend(jqXHR, settings) {},

  //Callback after request
  onComplete(jqXHR, status) {},

  // set contentType paramater of $.ajax
  // true: application/json; charset=utf-8'
  // false: 'x-www-form-urlencoded'
  contentTypeJson: true,

  credentials: 'include',

  // Pass custom options to fetch API (remote storage)
  // You can pass a simple object: { someOption: 'someValue' }
  // or a function which returns and object to add:
  // currentOpts => {
  //  return currentOpts.method === 'post' ?  { method: 'patch' } : {};
  // }
  fetchOptions: '',
};
