import { Model } from '../..';
import Component from '../../../dom_components/model/Component';
import EditorModel from '../../../editor/model/Editor';
import Trait, { TraitProperties } from './Trait';

export default class TraitRoot<
  TModel extends Model & { em: EditorModel },
  TraitValueType = any
> extends Trait<TraitValueType> {
  readonly model: TModel;
  private readonly _name: string;
  get name(): string {
    return this._name;
  }
  constructor(name: string, model: TModel, opts: any) {
    super({ name, ...opts } as any);
    model.on('change:' + name, this.setValueFromModel, this);
    this.model = model;
    this._name = name;
    if (opts.type == 'list' || opts.type == 'object') {
      this.opts.changeProp = true;
    }
  }

  get em() {
    return this.model.em;
  }

  protected getValue(): TraitValueType {
    const { changeProp, model, name } = this;
    const value = changeProp
      ? model.get(name)
      : // TODO update post component update
        model.get('attributes')[name];

    return value;
  }

  protected setValue(value: TraitValueType): void {
    const { name, model, changeProp } = this;
    if (changeProp) {
      model.set(name, value);
      model.trigger(`change:${name}`);
    } else {
      model.set('attributes', { ...model.get('attributes'), [name]: value });
    }
    console.log('qwerrsetValue', value);
  }
}
