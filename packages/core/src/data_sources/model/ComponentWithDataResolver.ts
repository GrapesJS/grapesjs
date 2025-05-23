import { ModelDestroyOptions } from 'backbone';
import { ObjectAny } from '../../common';
import Component from '../../dom_components/model/Component';
import { DataResolver, DataResolverProps, ResolverFromProps } from '../types';
import { ComponentOptions, ComponentProperties } from '../../dom_components/model/types';
import { DataCollectionStateMap } from './data_collection/types';

interface ComponentWithDataResolverProps<T extends DataResolverProps> extends ComponentProperties {
  type: T['type'];
  dataResolver: T;
}

export abstract class ComponentWithDataResolver<T extends DataResolverProps> extends Component {
  dataResolver: ResolverFromProps<T>;

  constructor(props: ComponentWithDataResolverProps<T>, opt: ComponentOptions) {
    super(props, opt);

    this.dataResolver = this.initializeDataResolver(props, opt);
    this.listenToPropsChange();
  }

  private initializeDataResolver(
    props: ComponentWithDataResolverProps<T>,
    opt: ComponentOptions,
  ): ResolverFromProps<T> {
    const resolverProps = props.dataResolver ?? {
      type: props.type,
    };

    const resolver = this.createResolverInstance(resolverProps, {
      ...opt,
      collectionsStateMap: this.collectionsStateMap,
    });

    return resolver as ResolverFromProps<T>;
  }

  protected abstract createResolverInstance(
    props: T,
    options: ComponentOptions & { collectionsStateMap: DataCollectionStateMap },
  ): DataResolver;

  getDataResolver(): T {
    return this.get('dataResolver');
  }

  setDataResolver(props: T) {
    return this.set('dataResolver', props);
  }

  onCollectionsStateMapUpdate(collectionsStateMap: DataCollectionStateMap): void {
    this.dataResolver.updateCollectionsStateMap(collectionsStateMap);
    super.onCollectionsStateMapUpdate(collectionsStateMap);
  }

  protected listenToPropsChange() {
    this.listenTo(
      this.dataResolver,
      'change',
      (() => {
        this.__changesUp({ m: this });
      }).bind(this),
    );

    this.on('change:dataResolver', () => {
      // @ts-ignore
      this.dataResolver.set(this.get('dataResolver'));
    });
  }

  protected removePropsListeners() {
    this.stopListening(this.dataResolver);
    this.off('change:dataResolver');
    this.off(`change:${this.collectionsStateMap}`);
  }

  destroy(options?: ModelDestroyOptions | undefined): false | JQueryXHR {
    this.removePropsListeners();
    return super.destroy(options);
  }

  toJSON(opts?: ObjectAny): any {
    const json = super.toJSON(opts);
    const dataResolver = this.dataResolver.toJSON();
    delete dataResolver.type;

    return {
      ...json,
      dataResolver,
    };
  }
}
