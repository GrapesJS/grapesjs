module.exports = ($) => {
  const fn = $.fn;
  fn.hide = function() {
    return this.css('display', 'none');
  }

  fn.show = function() {
    return this.css('display', 'block');
  }

  fn.focus = function() {
    const el = this.get(0);
    el && el.focus();
    return this;
  }
}
