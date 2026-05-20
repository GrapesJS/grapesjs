type CommandPublicHandler = (...args: any[]) => any;

export type CommandPublicFnFromHandler<T> = T extends (editor: any, sender: any, ...args: infer P) => infer R
  ? (...args: P) => R
  : never;

export type CommandPublicOptions<T extends CommandPublicHandler> =
  Parameters<T> extends [] ? undefined : Parameters<T>[0];
