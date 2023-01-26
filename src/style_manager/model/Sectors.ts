import { Collection } from '../../common';
import EditorModel from '../../editor/model/Editor';
import Sector from './Sector';

export default class Sectors extends Collection<Sector> {
  em!: EditorModel;
  module!: any;

  initialize(prop: any, opts: { em?: EditorModel; module?: any } = {}) {
    const { module, em } = opts;
    this.em = em!;
    this.module = module;
    this.listenTo(this, 'reset', this.onReset);
  }

  /** @ts-ignore */
  model(props, opts = {}) {
    // @ts-ignore
    const { em } = opts.collection;
    return new Sector(props, { ...opts, em });
  }

  onReset(models: any, opts: { previousModels?: Sector[] } = {}) {
    const prev = opts.previousModels || [];
    // @ts-ignore
    prev.forEach(sect => sect.get('properties').reset());
  }
}
