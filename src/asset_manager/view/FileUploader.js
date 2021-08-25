import Backbone from 'backbone';
import fetch from 'utils/fetch';
import html from 'utils/html';

export default Backbone.View.extend(
  {
    template({ pfx, title, uploadId, disabled, multiUpload }) {
      return html`
        <form>
          <div id="${pfx}title">${title}</div>
          <input
            type="file"
            id="${uploadId}"
            name="file"
            accept="*/*"
            ${disabled ? 'disabled' : ''}
            ${multiUpload ? 'multiple' : ''}
          />
          <div style="clear:both;"></div>
        </form>
      `;
    },

    events: {},

    initialize(opts = {}) {
      this.options = opts;
      const c = opts.config || {};
      this.config = c;
      this.em = this.config.em;
      this.pfx = c.stylePrefix || '';
      this.ppfx = c.pStylePrefix || '';
      this.target = this.options.globalCollection || {};
      this.uploadId = this.pfx + 'uploadFile';
      this.disabled =
        c.disableUpload !== undefined
          ? c.disableUpload
          : !c.upload && !c.embedAsBase64;
      this.multiUpload = c.multiUpload !== undefined ? c.multiUpload : true;
      this.events['change #' + this.uploadId] = 'uploadFile';
      let uploadFile = c.uploadFile;

      if (uploadFile) {
        this.uploadFile = uploadFile.bind(this);
      } else if (!c.upload && c.embedAsBase64) {
        this.uploadFile = this.constructor.embedAsBase64;
      }

      this.delegateEvents();
    },

    /**
     * Triggered before the upload is started
     * @private
     */
    onUploadStart() {
      const em = this.config.em;
      em && em.trigger('asset:upload:start');
    },

    /**
     * Triggered after the upload is ended
     * @param  {Object|string} res End result
     * @private
     */
    onUploadEnd(res) {
      const { $el, config } = this;
      const em = config.em;
      em && em.trigger('asset:upload:end', res);
      const input = $el.find('input');
      input && input.val('');
    },

    /**
     * Triggered on upload error
     * @param  {Object} err Error
     * @private
     */
    onUploadError(err) {
      const em = this.config.em;
      console.error(err);
      this.onUploadEnd(err);
      em && em.trigger('asset:upload:error', err);
    },

    /**
     * Triggered on upload response
     * @param  {string} text Response text
     * @private
     */
    onUploadResponse(text, clb) {
      const em = this.config.em;
      const config = this.config;
      const target = this.target;
      let json;
      try {
        json = typeof text === 'string' ? JSON.parse(text) : text;
      } catch (e) {
        json = text;
      }

      em && em.trigger('asset:upload:response', json);

      if (config.autoAdd && target) {
        target.add(json.data, { at: 0 });
      }

      this.onUploadEnd(text);
      clb && clb(json);
    },

    /**
     * Upload files
     * @param  {Object}  e Event
     * @return {Promise}
     * @private
     * */
    uploadFile(e, clb) {
      const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
      const { config } = this;
      const { beforeUpload } = config;

      const beforeUploadResponse = beforeUpload && beforeUpload(files);
      if (beforeUploadResponse === false) return;

      const body = new FormData();
      const { params, customFetch } = config;

      for (let param in params) {
        body.append(param, params[param]);
      }

      if (this.multiUpload) {
        for (let i = 0; i < files.length; i++) {
          body.append(`${config.uploadName}[]`, files[i]);
        }
      } else if (files.length) {
        body.append(config.uploadName, files[0]);
      }

      var target = this.target;
      const url = config.upload;
      const headers = config.headers;
      const reqHead = 'X-Requested-With';

      if (typeof headers[reqHead] == 'undefined') {
        headers[reqHead] = 'XMLHttpRequest';
      }

      if (url) {
        this.onUploadStart();
        const fetchOpts = {
          method: 'post',
          credentials: config.credentials || 'include',
          headers,
          body
        };
        const fetchResult = customFetch
          ? customFetch(url, fetchOpts)
          : fetch(url, fetchOpts).then(res =>
              ((res.status / 200) | 0) == 1
                ? res.text()
                : res.text().then(text => Promise.reject(text))
            );
        return fetchResult
          .then(text => this.onUploadResponse(text, clb))
          .catch(err => this.onUploadError(err));
      }
    },

    /**
     * Make input file droppable
     * @private
     * */
    initDrop() {
      var that = this;
      if (!this.uploadForm) {
        this.uploadForm = this.$el.find('form').get(0);
        if ('draggable' in this.uploadForm) {
          var uploadFile = this.uploadFile;
          this.uploadForm.ondragover = function() {
            this.className = that.pfx + 'hover';
            return false;
          };
          this.uploadForm.ondragleave = function() {
            this.className = '';
            return false;
          };
          this.uploadForm.ondrop = function(e) {
            this.className = '';
            e.preventDefault();
            that.uploadFile(e);
            return;
          };
        }
      }
    },

    initDropzone(ev) {
      let addedCls = 0;
      const c = this.config;
      const em = ev.model;
      const edEl = ev.el;
      const editor = em.get('Editor');
      const container = em.get('Config').el;
      const frameEl = em.get('Canvas').getBody();
      const ppfx = this.ppfx;
      const updatedCls = `${ppfx}dropzone-active`;
      const dropzoneCls = `${ppfx}dropzone`;
      const cleanEditorElCls = () => {
        edEl.className = edEl.className.replace(updatedCls, '').trim();
        addedCls = 0;
      };
      const onDragOver = () => {
        if (!addedCls) {
          edEl.className += ` ${updatedCls}`;
          addedCls = 1;
        }
        return false;
      };
      const onDragLeave = () => {
        cleanEditorElCls();
        return false;
      };
      const onDrop = e => {
        cleanEditorElCls();
        e.preventDefault();
        e.stopPropagation();
        this.uploadFile(e);

        if (c.openAssetsOnDrop && editor) {
          const target = editor.getSelected();
          editor.runCommand('open-assets', {
            target,
            onSelect() {
              editor.Modal.close();
              editor.AssetManager.setTarget(null);
            }
          });
        }

        return false;
      };

      ev.$el.append(`<div class="${dropzoneCls}">${c.dropzoneContent}</div>`);
      cleanEditorElCls();

      if ('draggable' in edEl) {
        [edEl, frameEl].forEach(item => {
          item.ondragover = onDragOver;
          item.ondragleave = onDragLeave;
          item.ondrop = onDrop;
        });
      }
    },

    render() {
      const { $el, pfx, em } = this;
      $el.html(
        this.template({
          title: em && em.t('assetManager.uploadTitle'),
          uploadId: this.uploadId,
          disabled: this.disabled,
          multiUpload: this.multiUpload,
          pfx
        })
      );
      this.initDrop();
      $el.attr('class', pfx + 'file-uploader');
      return this;
    }
  },
  {
    embedAsBase64: function(e, clb) {
      // List files dropped
      const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
      const response = { data: [] };

      // Unlikely, widely supported now
      if (!FileReader) {
        this.onUploadError(
          new Error('Unsupported platform, FileReader is not defined')
        );
        return;
      }

      const promises = [];
      const mimeTypeMatcher = /^(.+)\/(.+)$/;

      for (const file of files) {
        // For each file a reader (to read the base64 URL)
        // and a promise (to track and merge results and errors)
        const promise = new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.addEventListener('load', event => {
            let type;
            const name = file.name;

            // Try to find the MIME type of the file.
            const match = mimeTypeMatcher.exec(file.type);
            if (match) {
              type = match[1]; // The first part in the MIME, "image" in image/png
            } else {
              type = file.type;
            }

            /*
          // Show local video files, http://jsfiddle.net/dsbonev/cCCZ2/embedded/result,js,html,css/
          var URL = window.URL || window.webkitURL
          var file = this.files[0]
          var type = file.type
          var videoNode = document.createElement('video');
          var canPlay = videoNode.canPlayType(type) // can use also for 'audio' types
          if (canPlay === '') canPlay = 'no'
          var message = 'Can play type "' + type + '": ' + canPlay
          var isError = canPlay === 'no'
          displayMessage(message, isError)

          if (isError) {
            return
          }

          var fileURL = URL.createObjectURL(file)
          videoNode.src = fileURL
           */

            // If it's an image, try to find its size
            if (type === 'image') {
              const data = {
                src: reader.result,
                name,
                type,
                height: 0,
                width: 0
              };

              const image = new Image();
              image.addEventListener('error', error => {
                reject(error);
              });
              image.addEventListener('load', () => {
                data.height = image.height;
                data.width = image.width;
                resolve(data);
              });
              image.src = data.src;
            } else if (type) {
              // Not an image, but has a type
              resolve({
                src: reader.result,
                name,
                type
              });
            } else {
              // No type found, resolve with the URL only
              resolve(reader.result);
            }
          });
          reader.addEventListener('error', error => {
            reject(error);
          });
          reader.addEventListener('abort', error => {
            reject('Aborted');
          });

          reader.readAsDataURL(file);
        });

        promises.push(promise);
      }

      Promise.all(promises).then(
        data => {
          response.data = data;
          this.onUploadResponse(response, clb);
        },
        error => {
          this.onUploadError(error);
        }
      );
    }
  }
);
