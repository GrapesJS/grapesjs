import { CommandFunction } from '../../commands/view/CommandAbstract';
import Component from '../model/Component';
import { isSymbolMain } from '../model/SymbolUtils';

export interface CommandOptionsSymbolAdd {
  component?: Component;
}

/**
 * Add a new symbol from a component.
 * If the passed component is not a symbol, it will be converted to an instance and will return the main symbol.
 * If the passed component is already an instance, a new instance will be created and returned.
 * If the passed component is the main symbol, a new instance will be created and returned.
 */
export default ((editor, _: any, opts = {}) => {
  const cmp = opts.component || editor.getSelected();
  if (!cmp) return;

  const { Components } = editor;
  const symbol = cmp.clone({ symbol: true });

  if (isSymbolMain(symbol)) {
    Components.symbols.add(symbol);
  }

  return symbol;
}) as CommandFunction<CommandOptionsSymbolAdd>;
