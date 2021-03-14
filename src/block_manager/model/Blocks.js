import Backbone from 'backbone';
import Block from './Block';

export default class Blocks extends Backbone.Collection {
}
Blocks.prototype.model = Block;
