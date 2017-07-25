module.exports = {
  stylePrefix: 'sm-',

  sectors: [],

  // Text to show in case no element selected
  textNoElement: 'Select an element before using Style Manager',

  // Hide the property in case it's not stylable for the
  // selected component (each component has 'stylable' property)
  hideNotStylable: true,

  // Highlight changed properties of the selected component
  highlightChanged: true,

  // Highlight computed properties of the selected component
  highlightComputed: true,

  // Show computed properties of the selected component, if this value
  // is set to false, highlightComputed will not take effect
  showComputed: true,

  // Adds the possibility to clear property value from the target style
  clearProperties: false,

  // Properties which are valid to be shown as computed
  // (Identified as inherited properties: https://developer.mozilla.org/en-US/docs/Web/CSS/inheritance)
  validComputed: ['border-collapse', 'border-spacing', 'caption-side', 'color', 'cursor', 'direction', 'empty-cells',
  'font-family', 'font-size', 'font-style', 'font-variant', 'font-weight', 'font-size-adjust', 'font-stretch', 'font',
  'letter-spacing', 'line-height', 'list-style-image', 'list-style-position', 'list-style-type', 'list-style', 'orphans',
  'quotes', 'tab-size', 'text-align', 'text-align-last', 'text-decoration-color', 'text-indent', 'text-justify',
  'text-shadow', 'text-transform', 'visibility', 'white-space', 'widows', 'word-break', 'word-spacing', 'word-wrap'],
};
