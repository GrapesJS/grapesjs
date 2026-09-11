import Backbone from 'backbone';
import type { EventHandler, ObjectAny } from '../common';
import Frame from '../canvas/model/Frame';
import Frames from '../canvas/model/Frames';
import CssRule from '../css_composer/model/CssRule';
import CssRules from '../css_composer/model/CssRules';
import DataSource from '../data_sources/model/DataSource';
import DataSources from '../data_sources/model/DataSources';
import Component from '../dom_components/model/Component';
import Components from '../dom_components/model/Components';
import type EditorModel from '../editor/model/Editor';
import { EditorEvents } from '../editor/types';
import Page from '../pages/model/Page';
import Pages from '../pages/model/Pages';
import Selector from '../selector_manager/model/Selector';
import Selectors from '../selector_manager/model/Selectors';

export type ProjectUpdateTarget =
  | 'page'
  | 'frame'
  | 'component'
  | 'selector'
  | 'cssRule'
  | 'dataSource'
  | 'model'
  | 'collection';

export type ProjectUpdateEntity = Backbone.Model | Backbone.Collection;

type ProjectUpdateModelByTarget = {
  page: Page;
  frame: Frame;
  component: Component;
  selector: Selector;
  cssRule: CssRule;
  dataSource: DataSource;
  model: Backbone.Model;
  collection: Backbone.Model;
};

type ProjectUpdateCollectionByTarget = {
  page: Pages;
  frame: Frames;
  component: Components;
  selector: Selectors;
  cssRule: CssRules;
  dataSource: DataSources;
  model: Backbone.Collection;
  collection: Backbone.Collection;
};

interface ProjectUpdateOperationBase<T extends ProjectUpdateTarget> {
  target: T;
  options: ObjectAny;
}

type ProjectUpdateAddOperationBase<T extends ProjectUpdateTarget> = ProjectUpdateOperationBase<T> & {
  type: 'add';
  model: ProjectUpdateModelByTarget[T];
  collection: ProjectUpdateCollectionByTarget[T];
};

export type ProjectUpdateAddOperation = {
  [T in ProjectUpdateTarget]: ProjectUpdateAddOperationBase<T>;
}[ProjectUpdateTarget];

type ProjectUpdateRemoveOperationBase<T extends ProjectUpdateTarget> = ProjectUpdateOperationBase<T> & {
  type: 'remove';
  model: ProjectUpdateModelByTarget[T];
  collection: ProjectUpdateCollectionByTarget[T];
};

export type ProjectUpdateRemoveOperation = {
  [T in ProjectUpdateTarget]: ProjectUpdateRemoveOperationBase<T>;
}[ProjectUpdateTarget];

type ProjectUpdateChangeOperationBase<T extends ProjectUpdateTarget> = ProjectUpdateOperationBase<T> & {
  type: 'change';
  model: ProjectUpdateModelByTarget[T];
  collection?: ProjectUpdateCollectionByTarget[T];
  changed: ObjectAny;
  previous: ObjectAny;
};

export type ProjectUpdateChangeOperation = {
  [T in ProjectUpdateTarget]: ProjectUpdateChangeOperationBase<T>;
}[ProjectUpdateTarget];

type ProjectUpdateResetOperationBase<T extends ProjectUpdateTarget> = ProjectUpdateOperationBase<T> & {
  type: 'reset';
  collection: ProjectUpdateCollectionByTarget[T];
  previousModels: Backbone.Model[];
  models: Backbone.Model[];
};

export type ProjectUpdateResetOperation = {
  [T in ProjectUpdateTarget]: ProjectUpdateResetOperationBase<T>;
}[ProjectUpdateTarget];

export type ProjectUpdateOperation =
  | ProjectUpdateAddOperation
  | ProjectUpdateRemoveOperation
  | ProjectUpdateChangeOperation
  | ProjectUpdateResetOperation;

export interface ProjectUpdateTransaction {
  id: string;
  operations: ProjectUpdateOperation[];
}

type TrackedEntity = ProjectUpdateEntity;

const isCollection = (entity: TrackedEntity): entity is Backbone.Collection => entity instanceof Backbone.Collection;

const getTarget = (entity: TrackedEntity): ProjectUpdateTarget => {
  if (entity instanceof Page || entity instanceof Pages) return 'page';
  if (entity instanceof Frame || entity instanceof Frames) return 'frame';
  if (entity instanceof Component || entity instanceof Components) return 'component';
  if (entity instanceof Selector || entity instanceof Selectors) return 'selector';
  if (entity instanceof CssRule || entity instanceof CssRules) return 'cssRule';
  if (entity instanceof DataSource || entity instanceof DataSources) return 'dataSource';

  return isCollection(entity) ? 'collection' : 'model';
};

const createTransactionId = (() => {
  let count = 0;
  return () => `project-update-${++count}`;
})();

export default class ProjectUpdates {
  private handlers = new Map<TrackedEntity, EventHandler>();
  private operations: ProjectUpdateOperation[] = [];
  private flushTimer?: ReturnType<typeof setTimeout>;

  constructor(private em: EditorModel) {}

  add(entity: TrackedEntity) {
    if (this.handlers.has(entity)) return this;

    const target = getTarget(entity);
    const handler: EventHandler = (event: string, ...args) => this.onEvent(entity, target, event, args);
    this.handlers.set(entity, handler);
    entity.on('all', handler);
    return this;
  }

  remove(entity: TrackedEntity) {
    const handler = this.handlers.get(entity);
    handler && entity.off('all', handler);
    this.handlers.delete(entity);
    return this;
  }

  removeAll() {
    this.flushTimer && clearTimeout(this.flushTimer);
    this.flushTimer = undefined;
    this.handlers.forEach((handler, entity) => entity.off('all', handler));
    this.handlers.clear();
    this.operations = [];
    return this;
  }

  private onEvent(entity: TrackedEntity, target: ProjectUpdateTarget, event: string, args: Parameters<EventHandler>) {
    const operation = this.createOperation(entity, target, event, args);
    if (!operation) return;

    this.operations.push(operation);
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush());
    }
  }

  private createOperation(
    entity: TrackedEntity,
    target: ProjectUpdateTarget,
    event: string,
    args: Parameters<EventHandler>,
  ): ProjectUpdateOperation | undefined {
    if (event === 'change') {
      const [model, options] = args as [Backbone.Model, ObjectAny];
      const changed = { ...(model.changedAttributes() || {}) };
      if (target === 'frame' && Object.keys(changed).every((key) => key === 'changesCount')) return;
      return {
        type: 'change',
        target,
        model,
        ...(isCollection(entity) ? { collection: entity } : {}),
        options,
        changed,
        previous: { ...model.previousAttributes() },
      } as ProjectUpdateChangeOperation;
    }

    if (!isCollection(entity)) return;

    if (event === 'add' || event === 'remove') {
      const [model, _collection, options] = args as [Backbone.Model, Backbone.Collection, ObjectAny];
      return { type: event, target, model, collection: entity, options } as ProjectUpdateOperation;
    }

    if (event === 'reset') {
      const [_collection, options] = args as [Backbone.Collection, ObjectAny];
      return {
        type: 'reset',
        target,
        collection: entity,
        options,
        previousModels: options.previousModels || [],
        models: [...entity.models],
      } as ProjectUpdateResetOperation;
    }
  }

  private flush() {
    this.flushTimer = undefined;
    const operations = this.operations;
    this.operations = [];
    operations.length && this.em.trigger(EditorEvents.projectUpdate, { id: createTransactionId(), operations });
  }

  destroy() {
    this.removeAll();
  }
}
