export interface TraitManagerConfig {
  /**
   * Style prefix.
   * @default 'trt-'
   */
  stylePrefix?: string;

  /**
   * Specify the element to use as a container, string (query) or HTMLElement.
   * With the empty value, nothing will be rendered.
   * @default ''
   */
  appendTo?: string | HTMLElement;

  optionsTarget?: Record<string, any>[];
}

const config: TraitManagerConfig = {
  stylePrefix: 'trt-',
  appendTo: '',
  optionsTarget: [{ value: false }, { value: '_blank' }],
};

export default config;
