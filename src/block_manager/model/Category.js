import Backbone from 'backbone';

export default class Category extends Backbone.Model {
}
Category.prototype.defaults = {
    id: '',
    label: '',
    open: true,
    attributes: {}
  };
