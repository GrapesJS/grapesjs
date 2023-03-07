import ezygrapes from 'ezygrapes';

const PLUGIN_NAME = 'gjs-aviary';

export default ezygrapes.plugins.add(PLUGIN_NAME, (editor, opts = {}) => {
  let c = opts;
  let em = editor.getModel();
  let editorImage;

  let defaults = {
    key: '1',

    // By default, GrapesJS takes the modified image (hosted on AWS) and
    // adds it to the Asset Manager. If you need some custom logic (eg. add
    // watermark, upload the image on your servers) you can use custom
    // 'onApply' function
    // eg.
    // onApply: function(url, filename, imageModel) {
    //   var newUrl = ...;
    //   editor.AssetManager.add({ src: newUrl, name: filename });
    //   imageModel.set('src', newURL); // Update the image component
    // }
    onApply: null,

    // Customize the naming strategy
    // eg.
    // getFilename: function(model) {
    //   var name = model.get('src').split('/').pop();
    //   return Date.now() + '_' + name.slice(-15);
    // }
    getFilename: null,

    // Close the image editor on apply
    closeOnApply: true,

    // Aviary's configurations
    // https://creativesdk.adobe.com/docs/web/#/articles/imageeditorui/index.html
    config: {}
  };

  // Load defaults
  for (let name in defaults) {
    if (!(name in c))
      c[name] = defaults[name];
  }

  let config = c.config;
  config.apiKey = c.key;
  config.onSave = (imageID, newURL) => {
    editorImage.set('src', newURL);
    let getName = typeof c.getFilename == 'function' ? c.getFilename : getFilename;
    let filename = getName(editorImage);
    let apply = typeof c.onApply == 'function' ? c.onApply : onApply;

    apply(newURL, filename, editorImage);

    if (c.closeOnApply) {
      imageEditor.close();
    }
  };

  const imageEditor = new Aviary.Feather(config);
  const cmdm = editor.Commands;

  /**
   * Get filename
   * @param  Model model
   * @return string
   */
  const getFilename = (model) => {
    let name = model.get('src').split('/').pop();
    return `${Date.now()}_${name.slice(-15)}`;
  }

  /**
   * On apply callback
   * @param  string src
   * @param  string name
   */
  const onApply = (src, name) => {
    editor.AssetManager.add({src, name});
  }

  // Add edit command
  const imgEl = document.createElement('img');
  cmdm.add('image-editor', {
    run(ed, sender, opts) {
      let opt = opts || {};
      let sel = opt.model || ed.getSelected();
      editorImage = sel;
      imgEl.src = sel.get('src');
      imageEditor.launch({image: imgEl});
      em.trigger(`${PLUGIN_NAME}:launch`, sel, imageEditor);
    },
  });

});
