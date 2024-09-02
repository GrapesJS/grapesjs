export interface CssComposerConfig {
  /**
   * Style prefix.
   * @default 'css-'
   */
  stylePrefix?: string;

  /**
   * Default CSS style rules
   */
  rules?: Array<string>; // TODO
}

const config: CssComposerConfig = {
  stylePrefix: 'css-',
  rules: [],
};

export default config;
