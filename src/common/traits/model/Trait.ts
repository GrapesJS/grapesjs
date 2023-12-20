import { Model } from '../..';

export interface OnUpdateView<TraitValueType> {
  onUpdateEvent(value: TraitValueType): void;
}

export interface TraitProperties {
  name: string;
  default?: any;
  value?: any;
  changeProp?: boolean;
}

export default abstract class Trait<TraitValueType = any> {
  opts: any;
  protected view?: OnUpdateView<TraitValueType>;

  public get name() {
    return this.opts.name;
  }

  constructor(opts: TraitProperties) {
    this.opts = { ...opts, default: opts?.value ?? opts?.default ?? '' };
  }

  public registerForUpdateEvent(view: OnUpdateView<TraitValueType>) {
    this.view = view;
  }

  protected abstract getValue(): TraitValueType;

  protected abstract setValue(value: TraitValueType): void;

  public get changeProp(): boolean {
    return this.opts.changeProp ?? false;
  }

  public get value(): TraitValueType {
    return this.getValue() ?? this.opts.default;
  }

  protected updatingValue = false;
  public set value(value: TraitValueType) {
    this.updatingValue = true;
    this.setValue(value);
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
