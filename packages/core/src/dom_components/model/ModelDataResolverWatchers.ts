import { ObjectAny } from '../../common';
import StyleableModel from '../../domain_abstract/model/StyleableModel';
import {
  ModelResolverWatcher as ModelResolverWatcher,
  ModelResolverWatcherOptions,
  DynamicWatchersOptions,
} from './ModelResolverWatcher';
import { getSymbolsToUpdate } from './SymbolUtils';

export const updateFromWatcher = { fromDataSource: true, avoidStore: true };

export class ModelDataResolverWatchers {
  private propertyWatcher: ModelResolverWatcher;
  private attributeWatcher: ModelResolverWatcher;
  private styleWatcher: ModelResolverWatcher;

  constructor(
    private model: StyleableModel | undefined,
    options: ModelResolverWatcherOptions,
  ) {
    this.propertyWatcher = new ModelResolverWatcher(model, this.onPropertyUpdate, options);
    this.attributeWatcher = new ModelResolverWatcher(model, this.onAttributeUpdate, options);
    this.styleWatcher = new ModelResolverWatcher(model, this.onStyleUpdate, options);
  }

  private onPropertyUpdate(component: StyleableModel | undefined, key: string, value: any) {
    component?.set(key, value, updateFromWatcher);
  }

  private onAttributeUpdate(component: StyleableModel | undefined, key: string, value: any) {
    (component as any)?.addAttributes({ [key]: value }, updateFromWatcher);
  }

  private onStyleUpdate(component: StyleableModel | undefined, key: string, value: any) {
    component?.addStyle({ [key]: value }, { ...updateFromWatcher, partial: true, avoidStore: true });
  }

  bindModel(model: StyleableModel) {
    this.model = model;
    this.propertyWatcher.bindModel(model);
    this.attributeWatcher.bindModel(model);
    this.styleWatcher.bindModel(model);
    this.updateSymbolOverride();
  }

  addProps(props: ObjectAny, options: DynamicWatchersOptions = {}) {
    const excludedFromEvaluation = ['components', 'dataResolver'];

    const evaluatedProps = Object.fromEntries(
      Object.entries(props).map(([key, value]) =>
        excludedFromEvaluation.includes(key)
          ? [key, value] // Return excluded keys as they are
          : [key, this.propertyWatcher.addDynamicValues({ [key]: value }, options)[key]],
      ),
    );

    if (props.attributes) {
      const evaluatedAttributes = this.attributeWatcher.setDynamicValues(props.attributes, options);
      evaluatedProps['attributes'] = evaluatedAttributes;
    }

    const skipOverrideUpdates = options.skipWatcherUpdates || options.fromDataSource;
    if (!skipOverrideUpdates) {
      this.updateSymbolOverride();
    }

    return evaluatedProps;
  }

  setStyles(styles: ObjectAny, options: DynamicWatchersOptions = {}) {
    return this.styleWatcher.setDynamicValues(styles, options);
  }

  /**
   * Disables inline style management for the component. Style handling is shifted to CSS rules
   */
  disableStyles() {
    this.styleWatcher.removeListeners();
    this.styleWatcher.destroy();
  }

  removeAttributes(attributes: string[]) {
    this.attributeWatcher.removeListeners(attributes);
    this.updateSymbolOverride();
  }

  private updateSymbolOverride() {
    const model = this.model as any;
    const isCollectionItem = !!Object.keys(model?.collectionsStateMap ?? {}).length;
    if (!this.model || !isCollectionItem) return;

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

  onCollectionsStateMapUpdate() {
    this.propertyWatcher.onCollectionsStateMapUpdate();
    this.attributeWatcher.onCollectionsStateMapUpdate();
    this.styleWatcher.onCollectionsStateMapUpdate();
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

  destroy() {
    this.propertyWatcher.destroy();
    this.attributeWatcher.destroy();
    this.styleWatcher.destroy();
  }
}
