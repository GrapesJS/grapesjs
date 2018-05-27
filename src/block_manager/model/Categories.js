import Backbone from 'backbone';

module.exports = Backbone.Collection.extend({
  model: require('./Category')
});
