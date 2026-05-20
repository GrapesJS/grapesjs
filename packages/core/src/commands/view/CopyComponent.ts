import Editor from '../../editor';
import type { CommandPublicFnFromHandler } from '../registryHelpers';
import CommandAbstract from './CommandAbstract';

export interface CopyComponentCommandRegistryRun {
  'core:copy': CommandPublicFnFromHandler<CommandCopyComponent['run']>;
}

export default class CommandCopyComponent extends CommandAbstract {
  run(ed: Editor) {
    const em = ed.getModel();
    const models = [...ed.getSelectedAll()].map((md) => md.delegate?.copy?.(md) || md).filter(Boolean);
    models.length && em.set('clipboard', models);
  }
}
