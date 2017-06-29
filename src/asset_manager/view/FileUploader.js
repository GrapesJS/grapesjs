var Backbone = require('backbone');
var fileUploaderTemplate = `
<form>
  <div id="<%= pfx %>title"><%= title %></div>
  <input type="file" id="<%= uploadId %>" name="file" accept="image/*" <%= disabled ? 'disabled' : '' %> multiple/>
  <div style="clear:both;"></div>
</form>
`;

module.exports = Backbone.View.extend({

  template:   _.template(fileUploaderTemplate),

  events:   {},

  initialize(o) {
    this.options   = o || {};
    this.config    = o.config  || {};
    this.pfx      = this.config.stylePrefix || '';
    this.target    = this.collection || {};
    this.uploadId  = this.pfx + 'uploadFile';
    this.disabled  = !this.config.upload;
    this.events['change #' + this.uploadId]  = 'uploadFile';
    let uploadFile = this.config.uploadFile;

    if (uploadFile) {
      this.uploadFile = uploadFile.bind(this);
    }

    this.delegateEvents();
  },

  /**
   * Upload files
   * @param  {Object}  e Event
   * @private
   * */
  uploadFile(e) {
    var files    = e.dataTransfer ? e.dataTransfer.files : e.target.files,
      formData   = new FormData();
    for (var i = 0; i < files.length; i++) {
        formData.append('files[]', files[i]);
      }
    var target = this.target;
    $.ajax({
      url      : this.config.upload,
      type    : 'POST',
      data    : formData,
      beforeSend  : this.config.beforeSend,
      complete  : this.config.onComplete,
      xhrFields  : {
        onprogress(e) {
          if (e.lengthComputable) {
            /*var result = e.loaded / e.total * 100 + '%';*/
          }
        },
        onload(e) {
            //progress.value = 100;
        }
      },
      cache: false, contentType: false, processData: false
    }).done(data => {
      target.add(data.data);
    }).always(() => {
      //turnOff loading
    });
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
