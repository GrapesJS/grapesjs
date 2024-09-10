export interface UndoManagerConfig {
  /**
   * Maximum number of undo items.
   * @default 500
   */
  maximumStackLength?: number;
  /**
   * Track component selection.
   * @default true
   */
  trackSelection?: boolean;
}

const config: UndoManagerConfig = {
  maximumStackLength: 500,
  trackSelection: true,
};

export default config;
