import { PropertyProps } from '../model/Property';
import { SectorProperties } from '../model/Sector';

export interface StyleManagerConfig {
  /**
   * Default sectors and properties
   */
  sectors?: (Omit<SectorProperties, 'properties'> & { properties?: (string | PropertyProps)[] })[];

  /**
   * Specify the element to use as a container, string (query) or HTMLElement.
   * With the empty value, nothing will be rendered.
   */
  appendTo?: string | HTMLElement;

  /**
   * Style prefix.
   * @default 'sm-'
   */
  stylePrefix?: string;

  /**
   * Avoid rendering the default style manager.
   * @default false
   */
  custom?: boolean;

  /**
   * Hide the property in case it's not stylable for the
   * selected component (each component has 'stylable' property).
   * @deprecated
   */
  hideNotStylable?: boolean;

  /**
   * Highlight changed properties of the selected component.
   * @deprecated
   */
  highlightChanged?: boolean;

  /**
   * Highlight computed properties of the selected component.
   * @deprecated
   */
  highlightComputed?: boolean;

  /**
   * Show computed properties of the selected component, if this value
   * is set to false, highlightComputed will not take effect.
   * @deprecated
   */
  showComputed?: boolean;

  /**
   * Adds the possibility to clear property value from the target style.
   * @deprecated
   */
  clearProperties?: boolean;

  /**
   * Properties not to take in account for computed styles.
   * @deprecated
   */
  avoidComputed?: string[];

  pStylePrefix?: string;
}

export default {
  sectors: [
    {
      name: 'General',
      open: false,
      properties: ['display', 'float', 'position', 'top', 'right', 'left', 'bottom'],
    },
    {
      name: 'Flex',
      open: false,
      properties: [
        'flex-direction',
        'flex-wrap',
        'justify-content',
        'align-items',
        'align-content',
        'order',
        'flex-basis',
        'flex-grow',
        'flex-shrink',
        'align-self',
      ],
    },
    {
      name: 'Dimension',
      open: false,
      properties: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
    },
    {
      name: 'Typography',
      open: false,
      properties: [
        'font-family',
        'font-size',
        'font-weight',
        'letter-spacing',
        'color',
        'line-height',
        'text-align',
        'text-shadow',
      ],
    },
    {
      name: 'Decorations',
      open: false,
      properties: ['background-color', 'border-radius', 'border', 'box-shadow', 'background'],
    },
    {
      name: 'Extra',
      open: false,
      properties: ['opacity', 'transition', 'transform'],
    },
  ],
  appendTo: '',
  stylePrefix: 'sm-',
  custom: false,
  hideNotStylable: true,
  highlightChanged: true,
  highlightComputed: true,
  showComputed: true,
  clearProperties: true,
  avoidComputed: ['width', 'height'],
} as StyleManagerConfig;
