import { isArray, isString } from 'underscore';
import { AddOptions, Collection } from '../common';
import { normalizeKey } from '../utils/mixins';
import EditorModel from '../editor/model/Editor';
import Category, { CategoryProperties } from './ModuleCategory';

type CategoryCollectionParams = ConstructorParameters<typeof Collection<Category>>;

interface CategoryOptions {
  events?: { update?: string };
  em?: EditorModel;
}

export default class Categories extends Collection<Category> {
  constructor(models?: CategoryCollectionParams[0], opts: CategoryOptions = {}) {
    super(models, opts);
    const { events, em } = opts;
    const evUpdate = events?.update;
    if (em) {
      evUpdate &&
        this.on('change', (category, options) =>
          em.trigger(evUpdate, { category, changes: category.changedAttributes(), options }),
        );
    }
  }

  /** @ts-ignore */
  add(model: (CategoryProperties | Category)[] | CategoryProperties | Category, opts?: AddOptions) {
    const models = isArray(model) ? model : [model];
    models.forEach((md) => md && (md.id = normalizeKey(`${md.id}`)));
    return super.add(model, opts);
  }

  get(id: string | Category) {
    return super.get(isString(id) ? normalizeKey(id) : id);
  }
}

Categories.prototype.model = Category;
