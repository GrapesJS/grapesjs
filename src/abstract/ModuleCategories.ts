import { isArray, isString } from 'underscore';
import { AddOptions, Collection } from '../common';
import { normalizeKey } from '../utils/mixins';
import Category, { CategoryProperties } from './ModuleCategory';

export default class Categories extends Collection<Category> {
  /** @ts-ignore */
  add(model: (CategoryProperties | Category)[] | CategoryProperties | Category, opts?: AddOptions) {
    const models = isArray(model) ? model : [model];
    models.forEach(md => md && (md.id = normalizeKey(`${md.id}`)));
    return super.add(model, opts);
  }

  get(id: string | Category) {
    return super.get(isString(id) ? normalizeKey(id) : id);
  }
}

Categories.prototype.model = Category;
