var Backbone = require('backbone');
var Category = require('./Category');

module.exports = Backbone.Model.extend({

  defaults: {
    label: '',
    content: '',
    category: '',
    categoryOpen: false,
    categoryType: '',
    attributes: {},
  },

  initialize(opts = {}) {
    let category = this.get('category');
    if (category) {
      if (typeof category == 'string') {
        let categoryOpen = this.get('categoryOpen');
        let categoryType = this.get('categoryType');
        var catObj = new Category({
          id: category,
          label: category,
          open: categoryOpen,
          type: categoryType
        });
        this.set('category', catObj);
      }
    }
  },

});
