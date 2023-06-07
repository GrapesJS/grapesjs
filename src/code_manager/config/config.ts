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
}

const config: CodeManagerConfig = {
  stylePrefix: 'cm-',
  optsCodeViewer: {},
};

export default config;
