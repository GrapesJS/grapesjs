import { extend, isString } from 'underscore';
import { AddOptions, Collection, Model } from '../../common';
import EditorModel from '../../editor/model/Editor';
import Properties from './Properties';
import Property, { PropertyProps } from './Property';

/** @private */
export interface SectorProperties {
  id?: string;
  name: string;
  open?: boolean;
  visible?: boolean;
  buildProps?: string[];
  extendBuilded?: boolean;
  properties?: PropertyProps[];
}

/**
 *
 * [Property]: property.html
 *
 * @typedef Sector
 * @property {String} id Sector id, eg. `typography`
 * @property {String} name Sector name, eg. `Typography`
 * @property {Boolean} [open=true] Indicates the open state.
 * @property {Array<Object>} [properties=[]] Indicate an array of Property defintions.
 */
export default class Sector extends Model<SectorProperties> {
  em: EditorModel;

  defaults() {
    return {
      id: '',
      name: '',
      open: true,
      visible: true,
      extendBuilded: true,
      properties: [],
    };
  }

  /**
   * @hideconstructor
   */
  constructor(prp: SectorProperties, opts: { em?: EditorModel } = {}) {
    super(prp);
    const { em } = opts;
    this.em = em!;
    const o = prp || {};
    const builded = this.buildProperties(o.buildProps!);
    const name = this.get('name') || '';
    let props = [];
    !this.get('id') && this.set('id', name.replace(/ /g, '_').toLowerCase());

    if (!builded) {
      props = this.get('properties')!
        .map(prop => (isString(prop) ? this.buildProperties(prop)[0] : prop))
        .filter(Boolean);
    } else {
      props = this.extendProperties(builded);
    }

    props = props.map(prop => this.checkExtend(prop));

    const propsModel = new Properties(props, { em });
    propsModel.sector = this;
    this.set('properties', propsModel);
  }

  get properties() {
    return this.get('properties') as unknown as Collection<Property>;
  }

  /**
   * Get sector id.
   * @returns {String}
   */
  getId() {
    return this.get('id')!;
  }

  /**
   * Get sector name.
   * @returns {String}
   */
  getName(): string {
    const id = this.getId();
    return this.em?.t(`styleManager.sectors.${id}`) || this.get('name');
  }

  /**
   * Update sector name.
   * @param {String} value New sector name
   */
  setName(value: string) {
    return this.set('name', value);
  }

  /**
   * Check if the sector is open
   * @returns {Boolean}
   */
  isOpen() {
    return !!this.get('open');
  }

  /**
   * Update Sector open state
   * @param {Boolean} value
   */
  setOpen(value: boolean) {
    return this.set('open', value);
  }

  /**
   * Check if the sector is visible
   * @returns {Boolean}
   */
  isVisible() {
    return !!this.get('visible');
  }

  /**
   * Get sector properties.
   * @param {Object} [opts={}] Options
   * @param {Boolean} [opts.withValue=false] Get only properties with value
   * @param {Boolean} [opts.withParentValue=false] Get only properties with parent value
   * @returns {Array<[Property]>}
   */
  getProperties(opts: { withValue?: boolean; withParentValue?: boolean } = {}) {
    const props = this.get('properties') as any;
    const res = (props.models ? [...props.models] : props) as Property[];
    return res.filter(prop => {
      let result = true;

      if (opts.withValue) {
        result = prop.hasValue({ noParent: true });
      }

      if (opts.withParentValue) {
        const hasVal = prop.hasValue({ noParent: true });
        result = !hasVal && prop.hasValue();
      }

      return result;
    });
  }

  getProperty(id: string): Property | undefined {
    return this.getProperties().filter(prop => prop.get('id') === id)[0] || undefined;
  }

  addProperty(property: PropertyProps, opts: AddOptions) {
    // @ts-ignore
    return this.get('properties')!.add(this.checkExtend(property), opts);
  }

  /**
   * Extend properties
   * @param {Array<Object>} props Start properties
   * @param {Array<Object>} moProps Model props
   * @param {Boolean} ex Returns the same amount of passed model props
   * @return {Array<Object>} Final props
   * @private
   */
  extendProperties(props: PropertyProps[], moProps?: PropertyProps[], ex = false) {
    var pLen = props.length;
    var mProps = moProps || this.get('properties')!;
    var ext = this.get('extendBuilded');
    var isolated = [];

    for (var i = 0, len = mProps.length; i < len; i++) {
      var mProp = mProps[i];
      var found = 0;

      for (var j = 0; j < pLen; j++) {
        var prop = props[j];
        if (mProp.property == prop.property || mProp.id == prop.property) {
          // @ts-ignore Check for nested properties
          var mPProps = mProp.properties;
          if (mPProps && mPProps.length) {
            // @ts-ignore
            mProp.properties = this.extendProperties(prop.properties || [], mPProps, 1);
          }
          props[j] = ext ? extend(prop, mProp) : mProp;
          isolated[j] = props[j];
          found = 1;
          continue;
        }
      }

      if (!found) {
        props.push(mProp);
        isolated.push(mProp);
      }
    }

    return ex ? isolated.filter(i => i) : props;
  }

  checkExtend(prop: any): PropertyProps {
    const { extend, ...rest } = (isString(prop) ? { extend: prop } : prop) || {};
    if (extend) {
      return {
        ...(this.buildProperties([extend])[0] || {}),
        ...rest,
      };
    } else {
      return prop;
    }
  }

  /**
   * Build properties
   * @param {Array<string>} propr Array of props as sting
   * @return {Array<Object>}
   * @private
   */
  buildProperties(props: string | string[]): PropertyProps[] {
    const buildP = props || [];

    if (!buildP.length) return [];

    const builtIn = this.em?.get('StyleManager').builtIn;

    return builtIn?.build(buildP);
  }
}
