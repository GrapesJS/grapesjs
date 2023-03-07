import PanelManager from '..';
import { ModuleCollection } from '../../abstract';
import Panel from './Panel';

export default class Panels extends ModuleCollection<Panel> {
  constructor(module: PanelManager, models: Panel[] | Array<Record<string, any>>) {
    super(module, models, Panel);
  }
}

Panels.prototype.model = Panel;
