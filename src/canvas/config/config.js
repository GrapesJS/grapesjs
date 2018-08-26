module.exports = {
  stylePrefix: 'cv-',

  /*
   * Append external scripts to the `<head>` of the iframe.
   * Be aware that these scripts will not be printed in the export code
   * @example
   * scripts: [ 'https://...1.js', 'https://...2.js' ]
  */
  scripts: [],

  /*
   * Append external styles to the `<head>` of the iframe
   * Be aware that these styles will not be printed in the export code
   * @example
   * styles: [ 'https://...1.css', 'https://...2.css' ]
  */
  styles: [],

  /**
   * Add custom badge naming strategy
   * @example
   * customBadgeLabel: function(component) {
   *  return component.getName();
   * }
   */
  customBadgeLabel: ''
};
