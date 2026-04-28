import { ObjectAny, ObjectHash } from '../../common';
import DataResolverListener from '../../data_sources/model/DataResolverListener';
import {
  DataBindingImportContext,
  DataBindingImportPolicy,
  DataBindingImportSource,
  DataBindingKind,
} from '../../data_sources/types';
import { getDataResolverInstance, getDataResolverInstanceValue, isDataResolverProps } from '../../data_sources/utils';
import type StyleableModel from '../../domain_abstract/model/StyleableModel';
import EditorModel from '../../editor/model/Editor';
import { isFunction } from 'underscore';

export interface DataWatchersOptions {
  skipWatcherUpdates?: boolean;
  fromDataSource?: boolean;
  parsedImportSource?: DataBindingImportSource;
  dataBindingImportPolicy?: DataBindingImportPolicy;
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
    private kind: DataBindingKind,
    options: ModelResolverWatcherOptions,
  ) {
    this.em = options.em;
  }

  bindModel(model: WatchableModel<T>) {
    this.model = model;
  }

  setDataValues(values: ObjectAny | undefined, options: DataWatchersOptions = {}) {
    values = this.applyImportPolicy(values, options);
    const shouldSkipWatcherUpdates = options.skipWatcherUpdates || options.fromDataSource;
    if (!shouldSkipWatcherUpdates) {
      this.removeListeners();
    }

    return this.addDataValues(values, options);
  }

  addDataValues(values: ObjectAny | undefined, options: DataWatchersOptions = {}) {
    if (!values) return {};
    const nextValues = this.applyImportPolicy(values, options);
    if (!nextValues) return {};
    const evaluatedValues = this.evaluateValues(nextValues);

    const shouldSkipWatcherUpdates = options.skipWatcherUpdates || options.fromDataSource;
    if (!shouldSkipWatcherUpdates) {
      this.updateListeners(nextValues);
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

  private applyImportPolicy(values: ObjectAny | undefined, options: DataWatchersOptions = {}) {
    const { parsedImportSource } = options;
    const dataBindingImportPolicy =
      options.dataBindingImportPolicy ?? this.em?.DataSources.config.dataBindingImportPolicy;

    if (!values || !parsedImportSource || dataBindingImportPolicy === 'overwrite') return values;

    const nextValues = { ...values };
    const source = parsedImportSource;

    Object.keys(nextValues).forEach((key) => {
      const resolverListener = this.resolverListeners[key];
      const incomingValue = nextValues[key];

      if (!resolverListener || isDataResolverProps(incomingValue)) {
        return;
      }

      const resolver = resolverListener.resolver.toJSON();
      const path = 'path' in resolver ? resolver.path : undefined;
      const context: DataBindingImportContext = {
        target: this.model as StyleableModel,
        kind: this.kind,
        source,
        key,
        value: incomingValue,
        resolvedValue: resolverListener.resolver.getDataValue(),
        resolver,
        path,
      };
      const action = this.resolveImportAction(dataBindingImportPolicy, context);

      if (action === 'overwrite') {
        return;
      }

      if (action === 'update') {
        const updated = this.tryUpdateDataSource(path, incomingValue);

        if (!updated) {
          this.warnImportFallback(key, source, path);
        }
      }

      nextValues[key] = resolver;
    });

    return nextValues;
  }

  private resolveImportAction(handler: DataBindingImportPolicy | undefined, context: DataBindingImportContext) {
    const action = isFunction(handler) ? handler(context) : handler;

    return action === 'skip' || action === 'update' || action === 'overwrite' ? action : 'overwrite';
  }

  private tryUpdateDataSource(path: string | undefined, value: any) {
    if (!path) {
      return false;
    }

    try {
      return this.em.DataSources.setValue(path, value);
    } catch (error) {
      return false;
    }
  }

  private warnImportFallback(key: string, source: DataBindingImportSource, path?: string) {
    this.em.logWarning(
      `[DataSources]: Failed to update the data source bound to "${key}" during ${source} import; keeping the existing binding.`,
      { key, source, path },
    );
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

  hasDataResolvers() {
    return Object.keys(this.resolverListeners).length > 0;
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
