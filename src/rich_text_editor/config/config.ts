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
