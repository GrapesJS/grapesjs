import Backbone from 'backbone';
var Command = require('./Command');

export default Backbone.Collection.extend({
  model: Command
});
