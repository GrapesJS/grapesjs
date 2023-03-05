export interface ModalConfig {
  stylePrefix?: string;
  title?: string;
  content?: string;
  /**
   * Close modal on interact with backdrop.
   * @default true
   */
  backdrop?: boolean;

  /**
   * Avoid rendering the default modal.
   * @default false
   */
  custom?: boolean;

  /**
   * Extend ModalView object (view/ModalView.js)
   * @example
   * extend: {
   *   template() {
   *     return '<div>...New modal template...</div>';
   *   },
   * },
   */
  extend?: Record<string, any>;
}

const config: ModalConfig = {
  stylePrefix: 'mdl-',
  title: '',
  content: '',
  backdrop: true,
  custom: false,
  extend: {},
};

export default config;
