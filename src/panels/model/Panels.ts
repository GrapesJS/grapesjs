import PanelManager from '..';
import { Collection } from '../../abstract';
import Panel from './Panel';

export default class Panels extends Collection<Panel> {
  constructor(module: PanelManager, models: Panel[] | Array<Record<string, any>>) {
    super(module, models, Panel);
  }
}

Panels.prototype.model = Panel;
