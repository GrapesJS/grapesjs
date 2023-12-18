import { Model } from '../..';

export interface OnUpdateView<TraitValueType> {
  onUpdateEvent(value: TraitValueType): void;
}

export interface TraitProperties {
  default?: any;
  value?: any;
  changeProp?: boolean;
}

export default class Trait<TModel extends Model = Model, TraitValueType = any> {
  readonly name: string;
  opts: TraitProperties;
  readonly model: TModel;
  protected view?: OnUpdateView<TraitValueType>;

  constructor(name: string, model: TModel, opts?: TraitProperties) {
    this.name = name;
    model.on('change:' + name, this.setValueFromModel, this);
    this.model = model;
    this.opts = { ...opts, default: opts?.value ?? opts?.default ?? '' };
  }

  public registerForUpdateEvent(view: OnUpdateView<TraitValueType>) {
    this.view = view;
  }

  public get value(): TraitValueType {
    const { changeProp, model, name } = this;
    const value = changeProp
      ? model.get(name)
      : // TODO update post component update
        model.get('attributes')[name];

    return value ?? this.opts.default;
  }
  public get changeProp(): boolean {
    return this.opts.changeProp ?? false;
  }

  protected updatingValue = false;
  public set value(value: TraitValueType) {
    const { name, model, changeProp } = this;
    this.updatingValue = true;

    if (changeProp) {
      model.set(name, value);
    } else {
      model.set('attributes', { ...model.get('attributes'), [name]: value });
    }
    this.updatingValue = false;
  }

  protected setValueFromModel() {
    if (!this.updatingValue) {
      this.view?.onUpdateEvent(this.value);
    }
  }

  updateOpts(opts: any) {
    this.opts = { ...this.opts, ...opts };
  }
}
