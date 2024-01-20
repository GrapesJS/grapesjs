import { isString } from 'underscore';
import { Collection, Model } from '../common';
import Categories from './ModuleCategories';
import Category, { CategoryProperties } from './ModuleCategory';
import { isObject } from '../utils/mixins';

interface ModelWithCategoryProps {
  category?: string | CategoryProperties;
}

const CATEGORY_KEY = 'category';

export abstract class CollectionWithCategories<T extends Model<ModelWithCategoryProps>> extends Collection<T> {
  abstract getCategories(): Categories;

  initCategory(model: T) {
    let category = model.get(CATEGORY_KEY);
    const isDefined = category instanceof Category;

    // Ensure the category exists and it's not already initialized
    if (category && !isDefined) {
      if (isString(category)) {
        category = { id: category, label: category };
      } else if (isObject(category) && !category.id) {
        category.id = category.label;
      }

      const catModel = this.getCategories().add(category);
      model.set(CATEGORY_KEY, catModel as any, { silent: true });
      return catModel;
    } else if (isDefined) {
      const catModel = category as unknown as Category;
      this.getCategories().add(catModel);
      return catModel;
    }
  }
}
