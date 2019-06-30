import Backbone from 'backbone';

export default Backbone.Model.extend({
  defaults: {
    title: '',
    content: '',
    open: false
  }
});
