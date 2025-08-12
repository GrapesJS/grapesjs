import { ObjectHash } from 'backbone';
import { ObjectAny } from '../../common';
import {
  ModelResolverWatcher,
  ModelResolverWatcherOptions,
  DataWatchersOptions as DataWatchersOptions,
  WatchableModel,
} from './ModelResolverWatcher';
import { getSymbolsToUpdate } from './SymbolUtils';
import Component from './Component';
import { StyleableModelProperties } from '../../domain_abstract/model/StyleableModel';

export const updateFromWatcher = { fromDataSource: true, avoidStore: true };
export const keyDataValues = '__dynamic_values';

export class ModelDataResolverWatchers<T extends StyleableModelProperties> {
  private propertyWatcher: ModelResolverWatcher<T>;
  private attributeWatcher: ModelResolverWatcher<T>;
  private styleWatcher: ModelResolverWatcher<T>;

  constructor(
    private model: WatchableModel<T>,
    options: ModelResolverWatcherOptions,
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
      ...this.propertyWatcher.addDataValues({ ...filteredProps, ...dataValues.props }),
    };

    if (props.attributes || dataValues.attributes) {
      evaluatedProps.attributes = this.processAttributes(props, dataValues, options);
    }

    if (props.style || dataValues.style) {
      evaluatedProps.style = this.processStyles(props, dataValues, options);
    }

    const skipOverrideUpdates = options.skipWatcherUpdates || options.fromDataSource;
    if (!skipOverrideUpdates) {
      this.updateSymbolOverride();
      evaluatedProps[keyDataValues] = {
        props: this.propertyWatcher.getAllSerializableValues(),
        style: this.styleWatcher.getAllSerializableValues(),
        attributes: this.attributeWatcher.getAllSerializableValues(),
      };
    }

    return evaluatedProps;
  }

  setStyles(styles: ObjectAny, options: DataWatchersOptions = {}) {
    return this.addProps({ style: styles }, options);
  }

  removeAttributes(attributes: string[]) {
    this.attributeWatcher.removeListeners(attributes);
    this.updateSymbolOverride();
  }

  getDynamicPropsDefs() {
    return this.propertyWatcher.getAllSerializableValues();
  }

  getDynamicAttributesDefs() {
    return this.attributeWatcher.getAllSerializableValues();
  }

  getDynamicStylesDefs() {
    return this.styleWatcher.getAllSerializableValues();
  }

  getPropsDefsOrValues(props: ObjectAny) {
    return this.propertyWatcher.getSerializableValues(props);
  }

  getAttributesDefsOrValues(attributes: ObjectAny) {
    return this.attributeWatcher.getSerializableValues(attributes);
  }

  getStylesDefsOrValues(styles: ObjectAny) {
    return this.styleWatcher.getSerializableValues(styles);
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

  private updateSymbolOverride() {
    const model = this.model;
    if (!this.isComponent(model)) return;

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
    const excludedFromEvaluation = ['components', 'dataResolver'];
    const filteredProps = Object.fromEntries(
      Object.entries(props).filter(([key]) => !excludedFromEvaluation.includes(key)),
    );

    return filteredProps;
  }

  private processAttributes(baseValue: ObjectAny, dataValues: ObjectAny, options: DataWatchersOptions = {}) {
    return this.attributeWatcher.setDynamicValues(
      { ...baseValue.attributes, ...(dataValues.attributes ?? {}) },
      options,
    );
  }

  private processStyles(baseValue: ObjectAny | string, dataValues: ObjectAny, options: DataWatchersOptions = {}) {
    if (typeof baseValue === 'string') {
      this.styleWatcher.removeListeners();
      return baseValue;
    }

    return this.styleWatcher.setDynamicValues({ ...baseValue.style, ...(dataValues.style ?? {}) }, options);
  }
}
