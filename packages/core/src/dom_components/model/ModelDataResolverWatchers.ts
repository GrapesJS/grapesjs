import { ObjectAny } from '../../common';
import {
  ModelResolverWatcher,
  ModelResolverWatcherOptions,
  DataWatchersOptions,
  WatchableModel,
} from './ModelResolverWatcher';
import { getSymbolsToUpdate, isSymbol } from './SymbolUtils';
import Component, { keySymbolOvrd } from './Component';
import { StyleableModelProperties } from '../../domain_abstract/model/StyleableModel';
import { isEmpty, isObject } from 'underscore';

export const updateFromWatcher = { fromDataSource: true, avoidStore: true };
export const keyDataValues = '__data_values';

export class ModelDataResolverWatchers<T extends StyleableModelProperties> {
  private propertyWatcher: ModelResolverWatcher<T>;
  private attributeWatcher: ModelResolverWatcher<T>;
  private styleWatcher: ModelResolverWatcher<T>;

  constructor(
    private model: WatchableModel<T>,
    private options: ModelResolverWatcherOptions,
  ) {
    this.propertyWatcher = new ModelResolverWatcher(model, this.onPropertyUpdate, options);
    this.attributeWatcher = new ModelResolverWatcher(model, this.onAttributeUpdate, options);
    this.styleWatcher = new ModelResolverWatcher(model, this.onStyleUpdate, options);
  }

  bindModel(model: WatchableModel<T>) {
    this.model = model;
    this.watchers.forEach((watcher) => watcher.bindModel(model));
    this.updateSymbolOverride();
  }

  addProps(props: ObjectAny, options: DataWatchersOptions = {}) {
    const dataValues = props[keyDataValues] ?? {};

    const filteredProps = this.filterProps(props);
    const evaluatedProps = {
      ...props,
      ...this.propertyWatcher.addDataValues({ ...filteredProps, ...dataValues.props }, options),
    };

    if (this.shouldProcessProp('attributes', props, dataValues)) {
      evaluatedProps.attributes = this.processAttributes(props, dataValues, options);
    }

    if (this.shouldProcessProp('style', props, dataValues)) {
      evaluatedProps.style = this.processStyles(props, dataValues, options);
    }

    const skipOverrideUpdates = options.skipWatcherUpdates || options.fromDataSource;
    if (!skipOverrideUpdates) {
      this.updateSymbolOverride();
      evaluatedProps[keyDataValues] = {
        props: this.propertyWatcher.getAllDataResolvers(),
        style: this.styleWatcher.getAllDataResolvers(),
        attributes: this.attributeWatcher.getAllDataResolvers(),
      };
    }

    return evaluatedProps;
  }

  getProps(data: ObjectAny): ObjectAny {
    const resolvedProps = this.getValueOrResolver('props', data);
    const result = {
      ...resolvedProps,
    };
    delete result[keyDataValues];

    if (!isEmpty(data.attributes)) {
      result.attributes = this.getValueOrResolver('attributes', data.attributes);
    }

    if (isObject(data.style) && !isEmpty(data.style)) {
      result.style = this.getValueOrResolver('styles', data.style);
    }

    return result;
  }

  /**
   * Resolves properties, styles, or attributes to their final values or returns the data resolvers.
   * - If `data` is `null` or `undefined`, the method returns an object containing all data resolvers for the specified `target`.
   */
  getValueOrResolver(target: 'props' | 'styles' | 'attributes', data?: ObjectAny) {
    let watcher;

    switch (target) {
      case 'props':
        watcher = this.propertyWatcher;
        break;
      case 'styles':
        watcher = this.styleWatcher;
        break;
      case 'attributes':
        watcher = this.attributeWatcher;
        break;
      default: {
        const { em } = this.options;
        em?.logError(`Invalid target '${target}'. Must be 'props', 'styles', or 'attributes'.`);
        return {};
      }
    }

    if (!data) {
      return watcher.getAllDataResolvers();
    }

    return watcher.getValuesOrResolver(data);
  }

  removeAttributes(attributes: string[]) {
    this.attributeWatcher.removeListeners(attributes);
    this.updateSymbolOverride();
  }

  /**
   * Disables inline style management for the component. Style handling is shifted to CSS rules
   */
  disableStyles() {
    this.styleWatcher.removeListeners();
    this.styleWatcher.destroy();
  }

  onCollectionsStateMapUpdate() {
    this.watchers.forEach((watcher) => watcher.onCollectionsStateMapUpdate());
  }

  destroy() {
    this.watchers.forEach((watcher) => watcher.destroy());
  }

  private get watchers() {
    return [this.propertyWatcher, this.styleWatcher, this.attributeWatcher];
  }

  private isComponent(model: any): model is Component {
    return model instanceof Component;
  }

  private onPropertyUpdate = (model: WatchableModel<T>, key: string, value: any) => {
    model?.set(key, value, updateFromWatcher);
  };

  private onAttributeUpdate = (model: WatchableModel<T>, key: string, value: any) => {
    if (!this.isComponent(model)) return;
    model?.addAttributes({ [key]: value }, updateFromWatcher);
  };

  private onStyleUpdate = (model: WatchableModel<T>, key: string, value: any) => {
    model?.addStyle({ [key]: value }, { ...updateFromWatcher, partial: true, avoidStore: true });
  };

  private shouldProcessProp(key: 'attributes' | 'style', newProps: ObjectAny, dataValues: ObjectAny): boolean {
    const watcher = key === 'attributes' ? this.attributeWatcher : this.styleWatcher;
    const dataSubProps = dataValues[key];

    const hasNewValues = !!newProps[key];
    const hasExistingDataValues = dataSubProps && Object.keys(dataSubProps).length > 0;
    const hasApplicableWatchers = dataSubProps && Object.keys(watcher.getAllDataResolvers()).length > 0;

    return hasNewValues || hasExistingDataValues || hasApplicableWatchers;
  }

  private updateSymbolOverride() {
    const { model } = this;
    if (!this.isComponent(model) || !isSymbol(model)) return;

    const isCollectionItem = !!Object.keys(model?.collectionsStateMap ?? {}).length;
    if (!isCollectionItem) return;

    const keys = this.propertyWatcher.getValuesResolvingFromCollections();
    const attributesKeys = this.attributeWatcher.getValuesResolvingFromCollections();

    const combinedKeys = ['locked', 'layerable', ...keys];
    const haveOverridenAttributes = Object.keys(attributesKeys).length;
    if (haveOverridenAttributes) combinedKeys.push('attributes');

    const toUp = getSymbolsToUpdate(model);
    toUp.forEach((child) => {
      child.setSymbolOverride(combinedKeys, { fromDataSource: true });
    });
    model.setSymbolOverride(combinedKeys, { fromDataSource: true });
  }

  private filterProps(props: ObjectAny) {
    const excludedFromEvaluation = [
      'components',
      'dataResolver',
      'status',
      'state',
      'open',
      keySymbolOvrd,
      keyDataValues,
    ];
    const filteredProps = Object.fromEntries(
      Object.entries(props).filter(([key]) => !excludedFromEvaluation.includes(key)),
    );

    return filteredProps;
  }

  private processAttributes(baseValue: ObjectAny, dataValues: ObjectAny, options: DataWatchersOptions = {}) {
    return this.attributeWatcher.setDataValues({ ...baseValue.attributes, ...(dataValues.attributes ?? {}) }, options);
  }

  private processStyles(baseValue: ObjectAny | string, dataValues: ObjectAny, options: DataWatchersOptions = {}) {
    if (typeof baseValue === 'string') {
      this.styleWatcher.removeListeners();
      return baseValue;
    }

    return this.styleWatcher.setDataValues({ ...baseValue.style, ...(dataValues.style ?? {}) }, options);
  }
}
