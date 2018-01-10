var Backbone = require('backbone');
var Category = require('./Category');

module.exports = Backbone.Model.extend({

  defaults: {
    label: '',
    content: '',
    category: {
      label: '',
      order: '',
    },
    attributes: {},
  },

  // initialize(opts = {}) {
  //   let category = this.get('category');
  //   let catLabel = category.label;

  //   // if (catLable) {
  //   //   if (typeof catLabel == 'string') {
  //   //     var catObj = new Category({
  //   //       id: catLabel,
  //   //       label: catLabel,
  //   //       order: category.order,
  //   //     });
  //   //   }
  //   // }
  // },

});
