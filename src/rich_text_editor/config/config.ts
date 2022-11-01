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
}

const config: RichTextEditorConfig = {
  stylePrefix: 'rte-',
  adjustToolbar: true,
  actions: ['bold', 'italic', 'underline', 'strikethrough', 'link', 'wrap'],
};

export default config;
