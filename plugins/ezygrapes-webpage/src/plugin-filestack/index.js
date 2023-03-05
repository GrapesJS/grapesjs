import ezygrapes from 'ezygrapes';

export default ezygrapes.plugins.add('gjs-plugin-filestack', (editor, opts = {}) => {
  let c = opts;
  let config = editor.getConfig();
  let pfx = config.stylePrefix || '';
  let btnEl;

  let defaults = {
    // Filestack's API key
    key: '',

    // Custom button element which triggers Filestack modal
    btnEl: '',

    // Text for the button in case the custom one is not provided
    btnText: 'Add images',

    // Filestack's options
    filestackOpts: {
      accept: 'image/*',
      maxFiles: 10
    },

    // On complete upload callback
    // blobs - Array of Objects, eg. [{url:'...', filename: 'name.jpeg', ...}]
    // assets - Array of inserted assets
    // for debug: console.log(JSON.stringify(blobs));
    onComplete: (blobs, assets) => {},
  };

  // Load defaults
  for (let name in defaults) {
    if (!(name in c))
      c[name] = defaults[name];
  }

  if(!filestack) {
    throw new Error('Filestack instance not found');
  }

  if(!c.key){
    throw new Error('Filestack\'s API key not found');
  }

  const fsClient = filestack.init(c.key);


  // When the Asset Manager modal is opened
  editor.on('run:open-assets', () => {
    const modal = editor.Modal;
    const modalBody = modal.getContentEl();
    const uploader = modalBody.querySelector('.' + pfx + 'am-file-uploader');
    const assetsHeader = modalBody.querySelector('.' + pfx + 'am-assets-header');
    const assetsBody = modalBody.querySelector('.' + pfx + 'am-assets-cont');

    uploader && (uploader.style.display = 'none');
    assetsHeader && (assetsHeader.style.display = 'none');
    assetsBody.style.width = '100%';

    // Instance button if not yet exists
    if(!btnEl) {
      btnEl = c.btnEl;

      if(!btnEl) {
        btnEl = document.createElement('button');
        btnEl.className = pfx + 'btn-prim ' + pfx + 'btn-filestack';
        btnEl.innerHTML = c.btnText;
      }

      btnEl.onclick = () => {
        fsClient.pick(c.filestackOpts).then((objs) => {
          const blob = objs.filesUploaded;
          const blobs = blob instanceof Array ? blob : [blob];
          let assets = addAssets(blobs);
          c.onComplete(blobs, assets);
        });
      };
    }

    assetsBody.insertBefore(btnEl, assetsHeader);
  });

  /**
   * Add new assets to the editor
   * @param {Array} files
   */
  const addAssets = (files) => {
    const urls = files.map((file) => {
        file.src = file.url;
        return file;
    });
    return editor.AssetManager.add(urls);
  };

});
