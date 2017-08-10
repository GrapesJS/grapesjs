module.exports =  {
  // Default assets
  assets: [],

  // Style prefix
  stylePrefix: 'am-',

  // Url where uploads will be send, set false to disable upload
  upload: 'http://localhost/assets/upload',

  // Text on upload input
  uploadText: 'Drop files here or click to upload',

  // Label for the add button
  addBtnText: 'Add image',

  // Custom uploadFile function
  // @example
  // uploadFile: function(e) {
  //   var files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
  //   // ...send somewhere
  // }
  uploadFile: '',

  // Enable an upload dropzone on the entire editor (not document) when dragging
  // files over it
  dropzone: 1,

  // Open the asset manager once files are been dropped via the dropzone
  openAssetsOnDrop: 1,

  // Any dropzone content to append inside dropzone element
  dropzoneContent: '',
};
