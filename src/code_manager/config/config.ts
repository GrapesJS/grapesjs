export interface CodeManagerConfig {
  /**
   * Style prefix.
   * @default 'cm-'
   */
  stylePrefix?: string;

  /**
   * Pass default options to code viewer
   * @default {}
   */
  optsCodeViewer?: Record<string, any>;

  /**
   * Inline Css
   * @default false
   */
  inlineCss?: boolean;
}

const config: CodeManagerConfig = {
  stylePrefix: 'cm-',
  inlineCss: false,
  optsCodeViewer: {},
};

export default config;
