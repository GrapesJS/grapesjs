export default {
  // Default sectors and properties
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

  // Specify the element to use as a container, string (query) or HTMLElement
  // With the empty value, nothing will be rendered
  appendTo: '',

  // Style prefix
  stylePrefix: 'sm-',

  // Avoid rendering the default style manager.
  custom: false,

  // Hide the property in case it's not stylable for the
  // selected component (each component has 'stylable' property)
  // @deprecated
  hideNotStylable: true,

  // Highlight changed properties of the selected component
  // @deprecated
  highlightChanged: true,

  // Highlight computed properties of the selected component
  // @deprecated
  highlightComputed: true,

  // Show computed properties of the selected component, if this value
  // is set to false, highlightComputed will not take effect
  // @deprecated
  showComputed: true,

  // Adds the possibility to clear property value from the target style
  // @deprecated
  clearProperties: true,

  // Properties not to take in account for computed styles
  // @deprecated
  avoidComputed: ['width', 'height'],
};
