import { isElement } from 'underscore';

export default {
  /**
   * Check if fullscreen mode is enabled
   * @return {Boolean}
   */
  isEnabled() {
    var d = document;
    if (d.fullscreenElement || d.webkitFullscreenElement || d.mozFullScreenElement) return 1;
    else return 0;
  },

  /**
   * Enable fullscreen mode and return browser prefix
   * @param  {HTMLElement} el
   * @return {string}
   */
  enable(el) {
    var pfx = '';
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) {
      pfx = 'webkit';
      el.webkitRequestFullscreen();
    } else if (el.mozRequestFullScreen) {
      pfx = 'moz';
      el.mozRequestFullScreen();
    } else if (el.msRequestFullscreen) el.msRequestFullscreen();
    else console.warn('Fullscreen not supported');
    return pfx;
  },

  /**
   * Disable fullscreen mode
   */
  disable() {
    const d = document;
    if (this.isEnabled()) {
      if (d.exitFullscreen) d.exitFullscreen();
      else if (d.webkitExitFullscreen) d.webkitExitFullscreen();
      else if (d.mozCancelFullScreen) d.mozCancelFullScreen();
      else if (d.msExitFullscreen) d.msExitFullscreen();
    }
  },

  /**
   * Triggered when the state of the fullscreen is changed. Inside detects if
   * it's enabled
   * @param  {strinf} pfx Browser prefix
   * @param  {Event} e
   */
  fsChanged(pfx, e) {
    var d = document;
    var ev = (pfx || '') + 'fullscreenchange';
    if (!this.isEnabled()) {
      this.stop(null, this.sender);
      document.removeEventListener(ev, this.fsChanged);
    }
  },

  run(editor, sender, opts = {}) {
    this.sender = sender;
    const { target } = opts;
    const targetEl = isElement(target) ? target : document.querySelector(target);
    const pfx = this.enable(targetEl || editor.getContainer());
    this.fsChanged = this.fsChanged.bind(this, pfx);
    document.addEventListener(pfx + 'fullscreenchange', this.fsChanged);
    editor.trigger('change:canvasOffset');
  },

  stop(editor, sender) {
    if (sender && sender.set) sender.set('active', false);
    this.disable();
    if (editor) editor.trigger('change:canvasOffset');
  },
};
