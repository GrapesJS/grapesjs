import { isString } from 'underscore';
import { Collection } from '../../common';
import Categories from '../../abstract/ModuleCategories';
import Category from '../../abstract/ModuleCategory';
import { isObject } from '../../utils/mixins';
import EditorModel from '../../editor/model/Editor';
import Block from './Block';

const CATEGORY_KEY = 'category';

export default class Blocks extends Collection<Block> {
  em: EditorModel;

  constructor(coll: any[], options: { em: EditorModel }) {
    super(coll, options);
    this.em = options.em;
    this.on('add', this.handleAdd);
  }

  getCategories(): Categories {
    return this.em.Blocks.getCategories();
  }

  initCategory(model: Block) {
    let category = (model as any).get(CATEGORY_KEY);
    const isDefined = category instanceof Category;

    // Ensure the category exists and it's not already initialized
    if (category && !isDefined) {
      if (isString(category)) {
        category = { id: category, label: category };
      } else if (isObject(category) && !category.id) {
        category.id = category.label;
      }

      const catModel = this.getCategories().add(category);
      (model as any).set(CATEGORY_KEY, catModel as any, { silent: true });
      return catModel;
    } else if (isDefined) {
      const catModel = category as unknown as Category;
      this.getCategories().add(catModel);
      return catModel;
    }
  }

  handleAdd(model: Block) {
    this.initCategory(model);
  }
}

Blocks.prototype.model = Block;
