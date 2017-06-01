var Backbone = require('backbone');
var Asset = require('./Asset');
var AssetImage = require('./AssetImage');

module.exports = Backbone.Collection.extend({

	model:	AssetImage,

  initialize(models, opt) {

    this.model = (attrs, options) => {
      var model;
      switch(attrs.type){
        default:
          model = new AssetImage(attrs, options);
      }
      return  model;
    };

  },

  /**
   * Add new image asset to the collection
   * @param {string} url URL of the image
   * @param {Object} opts Options
   * @return {this}
   * @private
   */
  addImg(url, opts) {
    this.add({
      type: 'image',
      src: url,
    }, opts);
    return this;
  },

  /**
   * Prevent inserting assets with the same 'src'
   * Seems like idAttribute is not working with dynamic model assignament
   * @private
   */
  add(models, opt) {
    var mods = [];
    models = models instanceof Array ? models : [models];

    for (var i = 0, len = models.length; i < len; i++) {
      var model = models[i];

      if(typeof model === 'string')
        model = {src: model, type: 'image'};

      if(!model || !model.src)
        continue;

      var found = this.where({src: model.src});

      if(!found.length)
        mods.push(model);
    }

    if(mods.length == 1)
      mods = mods[0];

    return Backbone.Collection.prototype.add.apply(this, [mods, opt]);
  },


});
