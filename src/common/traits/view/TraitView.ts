import { EventsHash } from 'backbone';
import { isString, isUndefined } from 'underscore';
import TraitFactory from '../model/TraitFactory';
import { Model } from '../..';
import { $, View } from '../..';
import EditorModel from '../../../editor/model/Editor';
import { capitalize } from '../../../utils/mixins';
import Trait, { OnUpdateView, TraitProperties } from '../model/Trait';

export interface TraitViewOpts<Type> {
  type?: Type;
  label?: string | false;
  noLabel?: boolean;
  el?: HTMLElement;
}

type ValueFromTrait<TTarget extends Trait> = TTarget extends Trait<infer M> ? M : unknown;
// type TypeFromTraitView<TView extends TraitView<string>> = TView extends TraitView<infer M> ? M : unknown;

export default abstract class TraitView<Target extends Trait = Trait>
  extends View
  implements OnUpdateView<ValueFromTrait<Target>>
{
  pfx: string;
  ppfx: string;
  get name() {
    return this.target?.opts.name;
  }
  protected abstract type: string;

  get clsField() {
    const { ppfx, type } = this;
    return `${ppfx}field ${ppfx}field-${type}`;
  }
  private _label?: string;
  get label(): string {
    return this._label ?? this.name;
  }
  noLabel: boolean;
  em: EditorModel;
  target!: Target;

  protected constructor(em: EditorModel, opts?: TraitViewOpts<string>) {
    super({ el: opts?.el });
    this.em = em;
    const config = this.em.Traits.config;
    this.ppfx = config.pStylePrefix || '';
    this.pfx = this.ppfx + config.stylePrefix || '';
    this._label = opts?.label as any;
    this.noLabel = (opts?.noLabel && opts?.label !== false) ?? false;
  }

  setTarget(popertyName: string, model: Model, opts?: Omit<TraitProperties, 'name'>): this;
  setTarget(target: Target): this;
  setTarget(target: unknown, model?: Model, opts?: Omit<TraitProperties, 'name'>) {
    if (isString(target) && model !== undefined) {
      target = TraitFactory.build(model, { ...opts, type: this.type as any, name: target });
    }
    this.target = target as Target;
    this.target.registerForUpdateEvent(this);
    return this;
  }

  abstract onUpdateEvent(value: ValueFromTrait<Target>): void;

  /**
   * Returns label for the input
   */
  protected getLabelText(): string | undefined {
    const { em, label } = this;
    return label && (em.t(`traitManager.traits.labels.${label}`) || capitalize(label).replace(/-/g, ' '));
  }

  hasLabel() {
    return !this.noLabel;
  }

  abstract render(): typeof this;
}
