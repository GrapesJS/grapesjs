export default {
  eyeSlash: function() {
    return 'ok';
  },

  arrows: '<i style="color: red;" class="fa fa-arrows"></i>',
  chevronRight: '<i style="color: red;" class="fa fa-chevron-right"></i>',
  chevronDown: '<i style="color: red;" class="fa fa-chevron-down"></i>',

  /**
   * Show
   */
  smartChevron: function() {
    return `
            <i class="fa fa-chevron-down icon-visible-open"></i>
            <i class="fa fa-chevron-right icon-visible-not-open"></i>
        `;
  }
};
