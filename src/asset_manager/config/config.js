module.exports = {
  // Default assets
  // eg. [
  //  'https://...image1.png',
  //  'https://...image2.png',
  //  {type: 'image', src: 'https://...image3.png', someOtherCustomProp: 1},
  //  ..
  // ]
  assets: [],

  // Content to add where there is no assets to show
  // eg. 'No <b>assets</b> here, drag to upload'
  noAssets: '',

  // Style prefix
  stylePrefix: 'am-',

  // Upload endpoint, set `false` to disable upload
  // upload: 'https://endpoint/upload/assets',
  // upload: false,
  upload: 0,

  // The name used in POST to pass uploaded files
  uploadName: 'files',

  // Custom headers to pass with the upload request
  headers: {},

  // Custom parameters to pass with the upload request, eg. csrf token
  params: {},

  // If true, tries to add automatically uploaded assets.
  // To make it work the server should respond with a JSON containing assets
  // in a data key, eg:
  // {
  //  data: [
  //    'https://.../image.png',
  //    ...
  //    {src: 'https://.../image2.png'},
  //    ...
  //  ]
  // }
  autoAdd: 1,

  // Text on upload input
  uploadText: 'Drop files here or click to upload',

  // Label for the add button
  addBtnText: 'Add image',

  // Custom uploadFile function
  // @example
  // uploadFile: (e) => {
  //   var files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
  //   // ...send somewhere
  // }
  uploadFile: '',

  // Handle the image url submit from the built-in 'Add image' form
  // @example
  // handleAdd: (textFromInput) => {
  //   // some check...
  //   editor.AssetManager.add(textFromInput);
  // }
  handleAdd: '',

  // Enable an upload dropzone on the entire editor (not document) when dragging
  // files over it
  // If active the dropzone disable/hide the upload dropzone in asset modal,
  // otherwise you will get double drops (#507)
  dropzone: 0,

  // Open the asset manager once files are been dropped via the dropzone
  openAssetsOnDrop: 1,

  // Any dropzone content to append inside dropzone element
  dropzoneContent: '',

  // Default title for the asset manager modal
  modalTitle: 'Select Image',

  //Default placeholder for input
  inputPlaceholder: 'http://path/to/the/image.jpg'
};
