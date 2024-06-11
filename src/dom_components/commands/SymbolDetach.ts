import { CommandFunction } from '../../commands/view/CommandAbstract';
import Component from '../model/Component';
import { detachSymbolInstance, isSymbolInstance } from '../model/SymbolUtils';

export interface CommandOptionsSymbolDetach {
  component?: Component;
}

/**
 * Detach symbol instance from the main one.
 */
export default ((editor, _: any, opts = {}) => {
  const cmp = opts.component || editor.getSelected();
  if (!cmp) return;

  if (isSymbolInstance(cmp)) {
    detachSymbolInstance(cmp);
  }
}) as CommandFunction<CommandOptionsSymbolDetach>;
