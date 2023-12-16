import { Model } from '../..';

export interface OnUpdateView<TraitValueType> {
  onUpdateEvent(value: TraitValueType): void;
}

export interface TraitProperties {
  default?: any;
  value?: any;
  changeProp?: boolean;
}

export default class Trait<TraitValueType = any> {
  readonly name: string;
  opts: TraitProperties;
  readonly model: Model;
  private view?: OnUpdateView<TraitValueType>;

  constructor(name: string, model: Model, opts?: TraitProperties) {
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
      : // @ts-ignore TODO update post component update
        model.getAttributes()[name];

    return value ?? this.opts.default;
  }
  public get changeProp(): boolean {
    return this.opts.changeProp ?? false;
  }

  private updatingValue = false;
  public set value(value: TraitValueType) {
    const { name, model, changeProp } = this;
    this.updatingValue = true;

    if (changeProp) {
      model.set(name, value);
    } else {
      //@ts-ignore
      model.addAttributes({ [name]: value });
    }
    this.updatingValue = false;
  }

  private setValueFromModel() {
    if (!this.updatingValue) {
      this.view?.onUpdateEvent(this.value);
    }
  }

  updateOpts(opts: any) {
    this.opts = { ...this.opts, ...opts };
  }
}
