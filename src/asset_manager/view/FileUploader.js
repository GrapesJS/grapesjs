import fetch from 'utils/fetch';

module.exports = Backbone.View.extend({

  template: _.template(`
  <form>
    <div id="<%= pfx %>title"><%= title %></div>
    <input type="file" id="<%= uploadId %>" name="file" accept="image/*" <%= disabled ? 'disabled' : '' %> multiple/>
    <div style="clear:both;"></div>
  </form>
  `),

  events:   {},

  initialize(opts = {}) {
    this.options = opts;
    const c = opts.config || {};
    this.config = c;
    this.pfx = c.stylePrefix || '';
    this.ppfx = c.pStylePrefix || '';
    this.target = this.collection || {};
    this.uploadId = this.pfx + 'uploadFile';
    this.disabled = !c.upload;
    this.events['change #' + this.uploadId]  = 'uploadFile';
    let uploadFile = c.uploadFile;

    if (uploadFile) {
      this.uploadFile = uploadFile.bind(this);
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
    const em = this.config.em;
    em && em.trigger('asset:upload:end', res);
  },

  /**
   * Triggered on upload error
   * @param  {Object} err Error
   * @private
   */
  onUploadError(err) {
    console.error(err);
    this.onUploadEnd(err);
  },

  /**
   * Triggered on upload response
   * @param  {string} text Response text
   * @private
   */
  onUploadResponse(text) {
    const em = this.config.em;
    const config = this.config;
    const target = this.target;
    const json = JSON.parse(text);
    em && em.trigger('asset:upload:response', json);

    if (config.autoAdd && target) {
      target.add(json.data);
    }

    this.onUploadEnd(text);
  },

  /**
   * Upload files
   * @param  {Object}  e Event
   * @return {Promise}
   * @private
   * */
  uploadFile(e) {
    const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    const body = new FormData();
    const config = this.config;
    const params = config.params;

    for (let i = 0; i < files.length; i++) {
      body.append('files[]', files[i]);
    }

    for (let param in params) {
      body.append(param, params[param]);
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
      return fetch(url, {
        method: 'post',
        credentials: 'include',
        headers,
        body,
      }).then(res => (res.status/200|0) == 1 ?
        res.text() : res.text().then((text) =>
          Promise.reject(text)
        ))
      .then((text) => this.onUploadResponse(text))
      .catch(err => this.onUploadError(err));
    }
  },

  /**
   * Make input file droppable
   * @private
   * */
  initDrop() {
    var that  = this;
    if(!this.uploadForm){
      this.uploadForm = this.$el.find('form').get(0);
      if( 'draggable' in this.uploadForm ){
        var uploadFile = this.uploadFile;
        this.uploadForm.ondragover = function(){
          this.className = that.pfx + 'hover';
          return false;
        };
        this.uploadForm.ondragleave = function(){
          this.className = '';
          return false;
        };
        this.uploadForm.ondrop = function(e){
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
    }
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
    const onDrop = (e) => {
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
      [edEl, frameEl].forEach((item) => {
        item.ondragover = onDragOver;
        item.ondragleave = onDragLeave;
        item.ondrop = onDrop;
      });
    }
  },

  render() {
    this.$el.html( this.template({
      title: this.config.uploadText,
      uploadId: this.uploadId,
      disabled: this.disabled,
      pfx: this.pfx
    }) );
    this.initDrop();
    this.$el.attr('class', this.pfx + 'file-uploader');
    return this;
  },

});
