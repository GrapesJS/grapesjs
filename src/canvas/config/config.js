module.exports = {

  stylePrefix: 'cv-',

  // Coming soon
  rulers: false,

  /*
   * Append external scripts in head of the iframe before renderBody content
   * In this case, you have to add them manually later in the final HTML page
   * @example
   * scripts: [
   *  'https://...',
   * ]
  */
  scripts: [],

  /*
   * Append external styles. This styles won't be added to the final HTML/CSS
   * @example
   * styles: [
   *  'https://...',
   * ]
  */
  styles: [],

  /**
   * Add custom badge naming strategy
   * @example
   * customBadgeLabel: function(ComponentModel) {
   *  return ComponentModel.getName();
   * }
   */
  customBadgeLabel: '',

};
