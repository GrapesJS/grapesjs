module.exports = ($) => {
  $.fn.hide = function() {
    return this.css('display', 'none');
  }

  $.fn.show = function() {
    return this.css('display', 'block');
  }
}
