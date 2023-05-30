export interface CustomRTE<T = any> {
  /**
   * If true, the returned HTML content will be parsed into Components, allowing
   * the custom RTE to behave in the same way as the native one.
   * If false, the HTML content will be used as it is in the canvas and the export code.
   */
  parseContent?: boolean;
  /**
   * Create or enable the custom RTE.
   */
  enable: (el: HTMLElement, rte: T | undefined) => T | Promise<T>;
  /**
   * Disable the custom RTE.
   */
  disable: (el: HTMLElement, rte: T) => any | Promise<any>;
  /**
   * Get HTML content from the custom RTE.
   * If not specified, it will use the innerHTML of the element (passed also as `content` in options).
   */
  getContent?: (el: HTMLElement, rte: T | undefined) => string | Promise<string>;
  /**
   * Destroy the custom RTE.
   * Will be triggered on editor destroy.
   */
  destroy?: () => void;

  [key: string]: unknown;
}

export interface RichTextEditorConfig {
  /**
   * Class name prefix for styles
   * @default 'rte-'
   */
  stylePrefix?: string;

  /**
   * If true, moves the toolbar below the element when the top canvas edge is reached.
   * @default true
   */
  adjustToolbar?: boolean;

  /**
   * Default RTE actions.
   * @default ['bold', 'italic', 'underline', 'strikethrough', 'link', 'wrap']
   */
  actions?: string[];
  /**
   * Avoid rendering the default RTE UI.
   * @default false
   */
  custom?: boolean;
}

const config: RichTextEditorConfig = {
  stylePrefix: 'rte-',
  adjustToolbar: true,
  actions: ['bold', 'italic', 'underline', 'strikethrough', 'link', 'wrap'],
  custom: false,
};

export default config;
