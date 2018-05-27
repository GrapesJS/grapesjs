import Backbone from 'backbone';
var Category = require('./Category');

module.exports = Backbone.Model.extend({
  defaults: {
    label: '',
    content: '',
    category: '',
    attributes: {}
  },

  initialize(opts = {}) {
    let category = this.get('category');

    if (category) {
      if (typeof category == 'string') {
        var catObj = new Category({
          id: category,
          label: category
        });
      }
    }
  }
});
