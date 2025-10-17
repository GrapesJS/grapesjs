import { ObjectAny, ObjectHash } from '../../common';
import DataResolverListener from '../../data_sources/model/DataResolverListener';
import { getDataResolverInstance, getDataResolverInstanceValue, isDataResolverProps } from '../../data_sources/utils';
import StyleableModel from '../../domain_abstract/model/StyleableModel';
import EditorModel from '../../editor/model/Editor';

export interface DataWatchersOptions {
  skipWatcherUpdates?: boolean;
  fromDataSource?: boolean;
}

export interface ModelResolverWatcherOptions {
  em: EditorModel;
}

export type WatchableModel<T extends ObjectHash> = StyleableModel<T> | undefined;
export type UpdateFn<T extends ObjectHash> = (component: WatchableModel<T>, key: string, value: any) => void;

export class ModelResolverWatcher<T extends ObjectHash> {
  private em: EditorModel;
  private resolverListeners: Record<string, DataResolverListener> = {};

  constructor(
    private model: WatchableModel<T>,
    private updateFn: UpdateFn<T>,
    options: ModelResolverWatcherOptions,
  ) {
    this.em = options.em;
  }

  bindModel(model: WatchableModel<T>) {
    this.model = model;
  }

  setDataValues(values: ObjectAny | undefined, options: DataWatchersOptions = {}) {
    const shouldSkipWatcherUpdates = options.skipWatcherUpdates || options.fromDataSource;
    if (!shouldSkipWatcherUpdates) {
      this.removeListeners();
    }

    return this.addDataValues(values, options);
  }

  addDataValues(values: ObjectAny | undefined, options: DataWatchersOptions = {}) {
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

    const evaluatedValues = this.addDataValues(
      this.getValuesOrResolver(Object.fromEntries(resolvesFromCollections.map((key) => [key, '']))),
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

  getValuesOrResolver(values: ObjectAny) {
    if (!values) return {};
    const serializableValues: ObjectAny = { ...values };
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

  getAllDataResolvers() {
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
