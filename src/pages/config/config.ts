export interface PageManagerConfig {
  /**
   * Style prefix.
   * @default 'pgs-'
   */
  stylePrefix?: string;

  /**
   * Specify the element to use as a container, string (query) or HTMLElement.
   * With the empty value, nothing will be rendered.
   * @default ''
   */
  appendTo?: string | HTMLElement;

  /**
   * Avoid rendering the default Trait Manager UI.
   * @default false
   */
  custom?: boolean;

  optionsTarget?: Record<string, any>[];

  pages?: any[];
}

const config: PageManagerConfig = {
  stylePrefix: 'pg-',
  appendTo: '',
  optionsTarget: [{ value: false }, { value: '_blank' }],
  custom: false,
};

export default config;
