import { Model } from '../..';

export interface OnUpdateView<TraitValueType> {
  onUpdateEvent(value: TraitValueType): void;
}

export default class Trait<TraitValueType> {
  private name: string;
  private defaultValue: TraitValueType;
  private model: Model;
  private view?: OnUpdateView<TraitValueType>;

  constructor(name: string, model: Model, defaultValue: TraitValueType) {
    this.name = name;
    model.on('change:' + name, this.setValueFromModel, this);
    this.model = model;
    this.defaultValue = defaultValue;
  }

  public registerForUpdateEvent(view: OnUpdateView<TraitValueType>) {
    this.view = view;
  }

  public get value(): TraitValueType {
    return this.model.get(this.name) ?? this.defaultValue;
  }

  private updatingValue = false;
  public set value(value: TraitValueType) {
    this.updatingValue = true;
    this.model.set(this.name, value);
    this.updatingValue = false;
  }

  private setValueFromModel() {
    if (!this.updatingValue) {
      this.view?.onUpdateEvent(this.value);
    }
  }
}
