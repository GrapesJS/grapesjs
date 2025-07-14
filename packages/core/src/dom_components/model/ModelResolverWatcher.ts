import { ObjectAny } from '../../common';
import DataResolverListener from '../../data_sources/model/DataResolverListener';
import { getDataResolverInstance, getDataResolverInstanceValue, isDataResolverProps } from '../../data_sources/utils';
import StyleableModel from '../../domain_abstract/model/StyleableModel';
import EditorModel from '../../editor/model/Editor';
import Component from './Component';

export interface DynamicWatchersOptions {
  skipWatcherUpdates?: boolean;
  fromDataSource?: boolean;
}

export interface ModelResolverWatcherOptions {
  em: EditorModel;
}

type NewType = StyleableModel | undefined;
type UpdateFn = (component: NewType, key: string, value: any) => void;

export class ModelResolverWatcher {
  private em: EditorModel;
  private resolverListeners: Record<string, DataResolverListener> = {};

  constructor(
    private model: NewType,
    private updateFn: UpdateFn,
    options: ModelResolverWatcherOptions,
  ) {
    this.em = options.em;
  }

  bindModel(model: StyleableModel) {
    this.model = model;
  }

  setDynamicValues(values: ObjectAny | undefined, options: DynamicWatchersOptions = {}) {
    const shouldSkipWatcherUpdates = options.skipWatcherUpdates || options.fromDataSource;
    if (!shouldSkipWatcherUpdates) {
      this.removeListeners();
    }

    return this.addDynamicValues(values, options);
  }

  addDynamicValues(values: ObjectAny | undefined, options: DynamicWatchersOptions = {}) {
    if (!values) return {};
    const evaluatedValues = this.evaluateValues(values);

    const shouldSkipWatcherUpdates = options.skipWatcherUpdates || options.fromDataSource;
    if (!shouldSkipWatcherUpdates) {
      this.updateListeners(values);
    }

    return evaluatedValues;
  }

  onCollectionsStateMapUpdate() {
    const resolvesFromCollections = this.getValuesResolvingFromCollections();
    if (!resolvesFromCollections.length) return;
    resolvesFromCollections.forEach((key) =>
      this.resolverListeners[key].resolver.updateCollectionsStateMap(this.collectionsStateMap),
    );

    const evaluatedValues = this.addDynamicValues(
      this.getSerializableValues(Object.fromEntries(resolvesFromCollections.map((key) => [key, null]))),
    );

    Object.entries(evaluatedValues).forEach(([key, value]) => this.updateFn(this.model, key, value));
  }

  private get collectionsStateMap() {
    const component = this.model;

    return component?.collectionsStateMap ?? {};
  }

  private updateListeners(values: { [key: string]: any }) {
    const { em, collectionsStateMap } = this;
    this.removeListeners(Object.keys(values));
    const propsKeys = Object.keys(values);

    for (let index = 0; index < propsKeys.length; index++) {
      const key = propsKeys[index];
      const resolverProps = values[key];

      if (!isDataResolverProps(resolverProps)) {
        continue;
      }

      const resolver = getDataResolverInstance(resolverProps, { em, collectionsStateMap })!;
      this.resolverListeners[key] = new DataResolverListener({
        em,
        resolver,
        onUpdate: (value) => this.updateFn(this.model, key, value),
      });
    }
  }

  private evaluateValues(values: ObjectAny) {
    const { em, collectionsStateMap } = this;
    const evaluatedValues = { ...values };
    const propsKeys = Object.keys(values);

    for (let index = 0; index < propsKeys.length; index++) {
      const key = propsKeys[index];
      const resolverProps = values[key];

      if (!isDataResolverProps(resolverProps)) {
        continue;
      }

      evaluatedValues[key] = getDataResolverInstanceValue(resolverProps, { em, collectionsStateMap });
    }

    return evaluatedValues;
  }

  /**
   * removes listeners to stop watching for changes,
   * if keys argument is omitted, remove all listeners
   * @argument keys
   */
  removeListeners(keys?: string[]) {
    const propsKeys = keys ? keys : Object.keys(this.resolverListeners);

    propsKeys.forEach((key) => {
      if (this.resolverListeners[key]) {
        this.resolverListeners[key].destroy?.();
        delete this.resolverListeners[key];
      }
    });

    return propsKeys;
  }

  getSerializableValues(values: ObjectAny | undefined) {
    if (!values) return {};
    const serializableValues = { ...values };
    const propsKeys = Object.keys(serializableValues);

    for (let index = 0; index < propsKeys.length; index++) {
      const key = propsKeys[index];
      const resolverListener = this.resolverListeners[key];
      if (resolverListener) {
        serializableValues[key] = resolverListener.resolver.toJSON();
      }
    }

    return serializableValues;
  }

  getAllSerializableValues() {
    const serializableValues: ObjectAny = {};
    const propsKeys = Object.keys(this.resolverListeners);

    for (let index = 0; index < propsKeys.length; index++) {
      const key = propsKeys[index];
      serializableValues[key] = this.resolverListeners[key].resolver.toJSON();
    }

    return serializableValues;
  }

  getValuesResolvingFromCollections() {
    const keys = Object.keys(this.resolverListeners).filter((key: string) => {
      return this.resolverListeners[key].resolver.resolvesFromCollection();
    });

    return keys;
  }

  destroy() {
    this.removeListeners();
  }
}
