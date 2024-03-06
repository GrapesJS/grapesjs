import EditorModel from '../../../editor/model/Editor';
import Category from '../../../abstract/ModuleCategory';
import { LocaleOptions, Model, SetOptions } from '../../../common';
import TraitFactory from './TraitFactory';

export interface OnUpdateView<TraitValueType> {
  onUpdateEvent(value: TraitValueType, fromTarget: boolean): void;
}

export interface TraitProperties {
  default?: any;
  value?: any;
  traits?: any;
  changeProp?: boolean;
}

export default abstract class Trait<TraitValueType = any, Type extends string = string> {
  opts: any;
  private view?: OnUpdateView<TraitValueType>;

  get name(): string {
    return '';
  }
  get type(): Type {
    return this.opts.type;
  }

  get templates(): unknown {
    return this.opts.traits ?? [];
  }

  private _children: Trait[] = [];
  get children() {
    return this._children;
  }

  set children(children: Trait[]) {
    this._children = children;
    console.log('aaaa', children);
    console.log('aaaa', this.value);
  }

  constructor(opts: TraitProperties) {
    this.opts = { ...opts };
  }

  public registerForUpdateEvent(view: OnUpdateView<TraitValueType>) {
    this.view = view;
  }

  protected abstract getValue(): TraitValueType;

  protected abstract setValue(value: TraitValueType): void;

  public get changeProp(): boolean {
    return this.opts.changeProp ?? false;
  }

  abstract get em(): EditorModel;
  public get value(): TraitValueType {
    return (
      this.getValue() ??
      (typeof this.opts.default != 'undefined' ? (this.value = this.opts.default) && this.opts.default : '')
    );
  }

  protected updatingValue = false;
  public set value(value: TraitValueType) {
    this.updatingValue = true;
    console.log('setvalue ', this);
    this.setValue(value);
    this.updatingValue = false;
    this.refreshTrait();
  }

  refreshTrait() {}

  setValueFromModel() {
    if (!this.updatingValue) {
      this.onUpdateEvent();
    }
  }

  onUpdateEvent() {
    this.view?.onUpdateEvent(this.value, true);
  }

  updateOpts(opts: any) {
    this.opts = { ...this.opts, ...opts };
  }

  get viewType() {
    return this.type ?? 'text';
  }

  get category(): Category | undefined {
    const cat = this.opts.category;
    return cat instanceof Category ? cat : undefined;
  }

  /**
   * Get category label.
   * @param {Object} [opts={}] Options.
   * @param {Boolean} [opts.locale=true] Use the locale string from i18n module.
   * @returns {String}
   */
  getCategoryLabel(opts: LocaleOptions = {}): string {
    const { em, category } = this;
    const { locale = true } = opts;
    const catId = category?.getId();
    const catLabel = category?.getLabel();
    return (locale && em?.t(`traitManager.categories.${catId}`)) || catLabel || '';
  }
}
