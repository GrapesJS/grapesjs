import JSZip from 'jszip';
import FileSaver from 'file-saver';

export default (editor, opts = {}) => {
  let pfx = editor.getConfig('stylePrefix');
  let btnExp = document.createElement('button');
  let commandName = 'gjs-export-zip';

  let config = {
    addExportBtn: 1,
    btnLabel: 'Export to ZIP',
    filenamePfx: 'grapesjs_template',
    filename: null,
    root: {
      css: {
        'style.css': ed => ed.getCss(),
      },
      'index.html': ed =>
        `<!doctype html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <link rel="stylesheet" href="./css/style.css">
          </head>
          <body>${ed.getHtml()}</body>
        <html>`,
    },
    isBinary: null,
    ...opts,
  };

  btnExp.innerHTML = config.btnLabel;
  btnExp.className = `${pfx}btn-prim`;

  // Add command
  editor.Commands.add(commandName, {
    createFile(zip, name, content) {
      const opts = {};
      const ext = name.split('.')[1];
      const isBinary = config.isBinary ?
        config.isBinary(content, name) :
        !(ext && ['html', 'css'].indexOf(ext) >= 0) &&
        !/^[\x00-\x7F]*$/.test(content);

      if (isBinary) {
        opts.binary = true;
      }

      editor.log(['Create file', { name, content, opts }],
        { ns: 'plugin-export' });

      zip.file(name, content, opts);
    },

    async createDirectory(zip, root) {
      root = typeof root === 'function' ? await root(editor) : root;

      for (const name in root) {
        if (root.hasOwnProperty(name)) {
          let content = root[name];
          content = typeof content === 'function' ? await content(editor) : content;
          const typeOf = typeof content;

          if (typeOf === 'string') {
            this.createFile(zip, name, content);
          } else if (typeOf === 'object') {
            const dirRoot = zip.folder(name);
            await this.createDirectory(dirRoot, content);
          }
        }
      }
    },

    run(editor) {
      const zip = new JSZip();
      this.createDirectory(zip, config.root).then(() => {
        zip.generateAsync({ type: 'blob' })
        .then(content => {
          const filenameFn = config.filename;
          let filename = filenameFn ?
            filenameFn(editor) : `${config.filenamePfx}_${Date.now()}.zip`;
          FileSaver.saveAs(content, filename);
        });
      });
    }
  });

  // Add button inside export dialog
  if (config.addExportBtn) {
    editor.on('run:export-template', () => {
      editor.Modal.getContentEl().appendChild(btnExp);
      btnExp.onclick = () => {
        editor.runCommand(commandName);
      };
    });
  }
};
