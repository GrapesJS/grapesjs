import { ObjectAny } from '../../common';
import Component from './Component';
import {
  ComponentResolverWatcher,
  ComponentResolverWatcherOptions,
  DynamicWatchersOptions,
} from './ComponentResolverWatcher';
import { getSymbolsToUpdate } from './SymbolUtils';

export const updateFromWatcher = { fromDataSource: true, avoidStore: true };

export class ComponentDataResolverWatchers {
  private propertyWatcher: ComponentResolverWatcher;
  private attributeWatcher: ComponentResolverWatcher;

  constructor(
    private component: Component | undefined,
    options: ComponentResolverWatcherOptions,
  ) {
    this.propertyWatcher = new ComponentResolverWatcher(component, this.onPropertyUpdate, options);
    this.attributeWatcher = new ComponentResolverWatcher(component, this.onAttributeUpdate, options);
  }

  private onPropertyUpdate(component: Component | undefined, key: string, value: any) {
    component?.set(key, value, updateFromWatcher);
  }

  private onAttributeUpdate(component: Component | undefined, key: string, value: any) {
    component?.addAttributes({ [key]: value }, updateFromWatcher);
  }

  bindComponent(component: Component) {
    this.component = component;
    this.propertyWatcher.bindComponent(component);
    this.attributeWatcher.bindComponent(component);
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

  removeAttributes(attributes: string[]) {
    this.attributeWatcher.removeListeners(attributes);
    this.updateSymbolOverride();
  }

  private updateSymbolOverride() {
    const isCollectionItem = !!Object.keys(this.component?.collectionsStateMap ?? {}).length;
    if (!this.component || !isCollectionItem) return;

    const keys = this.propertyWatcher.getValuesResolvingFromCollections();
    const attributesKeys = this.attributeWatcher.getValuesResolvingFromCollections();

    const combinedKeys = ['locked', 'layerable', ...keys];
    const haveOverridenAttributes = Object.keys(attributesKeys).length;
    if (haveOverridenAttributes) combinedKeys.push('attributes');

    const toUp = getSymbolsToUpdate(this.component);
    toUp.forEach((child) => {
      child.setSymbolOverride(combinedKeys, { fromDataSource: true });
    });
    this.component.setSymbolOverride(combinedKeys, { fromDataSource: true });
  }

  onCollectionsStateMapUpdate() {
    this.propertyWatcher.onCollectionsStateMapUpdate();
    this.attributeWatcher.onCollectionsStateMapUpdate();
  }

  getDynamicPropsDefs() {
    return this.propertyWatcher.getAllSerializableValues();
  }

  getDynamicAttributesDefs() {
    return this.attributeWatcher.getAllSerializableValues();
  }

  getPropsDefsOrValues(props: ObjectAny) {
    return this.propertyWatcher.getSerializableValues(props);
  }

  getAttributesDefsOrValues(attributes: ObjectAny) {
    return this.attributeWatcher.getSerializableValues(attributes);
  }

  destroy() {
    this.propertyWatcher.destroy();
    this.attributeWatcher.destroy();
  }
}
