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
  abstract get categories(): Categories;

  initCategory(model: T) {
    let category = model.get(CATEGORY_KEY);

    // Ensure the category exists and it's not already initialized
    if (category && !(category instanceof Category)) {
      if (isString(category)) {
        category = { id: category, label: category };
      } else if (isObject(category) && !category.id) {
        category.id = category.label;
      }

      const catModel = this.categories.add(category);
      model.set(CATEGORY_KEY, catModel as any, { silent: true });
    }
  }
}
