let Backbone = require('backbone')
let Category = require('./Category')

module.exports = Backbone.Model.extend({
  defaults: {
    label: '',
    content: '',
    category: '',
    attributes: {},
  },

  initialize(opts = {}) {
    let category = this.get('category')

    if (category) {
      if (typeof category == 'string') {
        let catObj = new Category({
          id: category,
          label: category,
        })
      }
    }
  },
})
