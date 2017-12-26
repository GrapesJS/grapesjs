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
  clearProperties: 0,

  // Properties not to take in account for computed styles
  avoidComputed: ['width', 'height'],
};
