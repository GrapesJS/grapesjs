import type { CommandPublicFnFromHandler } from '../registryHelpers';
import CommandAbstract from './CommandAbstract';

export interface CanvasClearCommandRegistryRun {
  'core:canvas-clear': CommandPublicFnFromHandler<CommandCanvasClear['run']>;
}

export default class CommandCanvasClear extends CommandAbstract {
  run(ed: any) {
    ed.Components.clear();
    ed.Css.clear();
  }
}
