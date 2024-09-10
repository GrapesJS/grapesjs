import { Model } from '../common';
import CategoryView from './ModuleCategoryView';

export interface CategoryProperties {
  /**
   * Category id.
   */
  id: string;
  /**
   * Category label.
   */
  label: string;
  /**
   * Category open state.
   * @default true
   */
  open?: boolean;
  /**
   * Category order.
   */
  order?: string | number;
  /**
   * Category attributes.
   * @default {}
   */
  attributes?: Record<string, any>;
}

export interface ItemsByCategory<T> {
  category?: Category;
  items: T[];
}

export interface ModelWithCategory {
  category?: Category;
}

export default class Category extends Model<CategoryProperties> {
  view?: CategoryView;

  defaults() {
    return {
      id: '',
      label: '',
      open: true,
      attributes: {},
    };
  }

  getId() {
    return this.get('id')!;
  }

  getLabel() {
    return this.get('label')!;
  }
}

export function getItemsByCategory<T extends ModelWithCategory>(allItems: T[]) {
  const categorySet = new Set<Category>();
  const categoryMap = new Map<Category, T[]>();
  const emptyItem: ItemsByCategory<T> = { items: [] };

  allItems.forEach((item) => {
    const { category } = item;

    if (category) {
      categorySet.add(category);
      const categoryItems = categoryMap.get(category);

      if (categoryItems) {
        categoryItems.push(item);
      } else {
        categoryMap.set(category, [item]);
      }
    } else {
      emptyItem.items.push(item);
    }
  });

  const categoryWithItems = Array.from(categorySet).map((category) => ({
    category,
    items: categoryMap.get(category) || [],
  }));

  return [...categoryWithItems, emptyItem];
}
