import { isArray, isString } from 'underscore';
import Component, { keySymbol, keySymbolOvrd, keySymbols } from './Component';
import { SymbolToUpOptions } from './types';

export const isSymbolMain = (cmp: Component) => isArray(cmp.get(keySymbols));

export const isSymbolInstance = (cmp: Component) => !!cmp.get(keySymbol);

export const isSymbol = (cmp: Component) => !!(isSymbolMain(cmp) || isSymbolInstance(cmp));

export const isSymbolTop = (symbol: Component) => {
  const parent = symbol.parent();
  return isSymbol(symbol) && (!parent || !isSymbol(parent));
};

export const isSymbolNested = (symbol: Component) => {
  if (!isSymbol(symbol)) return false;
  const symbTopSelf = getSymbolTop(isSymbolMain(symbol) ? symbol : getSymbol(symbol)!);
  const symbTop = getSymbolTop(symbol);
  const symbTopMain = isSymbolMain(symbTop) ? symbTop : getSymbol(symbTop);
  return symbTopMain !== symbTopSelf;
};

export const getSymbol = (symbol: Component): Component | undefined => {
  let result = symbol.get(keySymbol);

  if (result && isString(result)) {
    const ref = symbol.__getAllById()[result];
    if (ref) {
      result = ref;
      symbol.set(keySymbol, ref);
    } else {
      result = 0;
    }
  }

  return result || undefined;
};

export const getSymbols = (symbol?: Component): Component[] | undefined => {
  let symbs = symbol?.get(keySymbols);

  if (symbs && isArray(symbs)) {
    symbs.forEach((symb, idx) => {
      if (symb && isString(symb)) {
        symbs[idx] = symbol!.__getAllById()[symb];
      }
    });
    symbs = symbs.filter(symb => symb && !isString(symb));
  }

  return symbs;
};

export const isSymbolOverride = (symbol: Component, prop = '') => {
  const ovrd = symbol.get(keySymbolOvrd);
  const [prp] = prop.split(':');
  const props = prop !== prp ? [prop, prp] : [prop];
  return ovrd === true || (isArray(ovrd) && props.some(p => ovrd.indexOf(p) >= 0));
};

export const getSymbolsToUpdate = (symb: Component, opts: SymbolToUpOptions = {}) => {
  let result: Component[] = [];
  const { changed } = opts;

  if (
    opts.fromInstance ||
    opts.noPropagate ||
    opts.fromUndo ||
    // Avoid updating others if the current component has override
    (changed && isSymbolOverride(symb, changed))
  ) {
    return result;
  }

  const symbols = getSymbols(symb) || [];
  const symbol = getSymbol(symb);
  const all = symbol ? [symbol, ...(getSymbols(symbol) || [])] : symbols;
  result = all
    .filter(s => s !== symb)
    // Avoid updating those with override
    .filter(s => !(changed && isSymbolOverride(s, changed)));

  return result;
};

export const getSymbolTop = (symbol: Component, opts?: any) => {
  let result = symbol;
  let parent = symbol.parent(opts);

  // while (parent && (isSymbolMain(parent) || getSymbol(parent))) {
  while (parent && isSymbol(parent)) {
    result = parent;
    parent = parent.parent(opts);
  }

  return result;
};

export const logSymbol = (symb: Component, type: string, toUp: Component[], opts: any = {}) => {
  const symbol = getSymbol(symb);
  const symbols = getSymbols(symb);

  if (!symbol && !symbols) {
    return;
  }

  symb.em.log(type, { model: symb, toUp, context: 'symbols', opts });
};
