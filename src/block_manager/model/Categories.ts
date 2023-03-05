import { Collection } from '../../common';
import Category from './Category';

export default class Categories extends Collection<Category> {}

Categories.prototype.model = Category;
