import Backbone from 'backbone';
import Command from './Command';

export default class Commands extends Backbone.Collection {
}
Commands.prototype.model = Command;
