import Backbone from 'backbone';
import Category from './Category';

export default class Categories extends Backbone.Collection {
}
Categories.prototype.model = Category;
