var Backbone = require('backbone');

export default Backbone.Model.extend({
  defaults: {
    title: '',
    content: '',
    open: false
  }
});
