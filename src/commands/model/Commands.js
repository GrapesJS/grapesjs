import Backbone from 'backbone';
import Command from './Command';

export default Backbone.Collection.extend({
  model: Command
});
