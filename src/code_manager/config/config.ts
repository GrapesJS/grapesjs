export interface CodeManagerConfig {
  /**
   * Style prefix.
   * @default 'cm-'
   */
  stylePrefix?: string;

  /**
   * Inline Css
   * @default false
   */
  inlineCss?: boolean;
}

const config: CodeManagerConfig = {
  stylePrefix: 'cm-',
  inlineCss: false,
};

export default config;
