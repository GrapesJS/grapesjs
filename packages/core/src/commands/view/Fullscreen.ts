import { isElement } from 'underscore';
import type { CommandPublicFnFromHandler } from '../registryHelpers';
import CommandAbstract from './CommandAbstract';

export interface CommandFullscreenOptions {
  target?: HTMLElement | string;
}

export interface FullscreenCommandRegistryRun {
  'core:fullscreen': CommandPublicFnFromHandler<CommandFullscreen['run']>;
  fullscreen: CommandPublicFnFromHandler<CommandFullscreen['run']>;
}

export interface FullscreenCommandRegistryStop {
  'core:fullscreen': CommandPublicFnFromHandler<CommandFullscreen['stop']>;
  fullscreen: CommandPublicFnFromHandler<CommandFullscreen['stop']>;
}

interface DocumentWithFullscreen extends Document {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  webkitExitFullscreen?: () => void;
  mozCancelFullScreen?: () => void;
  msExitFullscreen?: () => void;
}

export default class CommandFullscreen extends CommandAbstract<
  CommandFullscreenOptions,
  CommandFullscreenOptions,
  void,
  void
> {
  sender: any;
  fullscreenChangeEvent?: string;
  fullscreenChangeHandler?: EventListener;

  /**
   * Check if fullscreen mode is enabled
   * @return {Boolean}
   */
  isEnabled() {
    const d = document as DocumentWithFullscreen;
    return !!(d.fullscreenElement || d.webkitFullscreenElement || d.mozFullScreenElement);
  }

  /**
   * Enable fullscreen mode and return browser prefix
   * @param  {HTMLElement} el
   * @return {string}
   */
  enable(el?: HTMLElement | null) {
    let pfx = '';

    if (!el) {
      return pfx;
    }

    const target = el as HTMLElement & {
      webkitRequestFullscreen?: () => void;
      mozRequestFullScreen?: () => void;
      msRequestFullscreen?: () => void;
    };

    if (target.requestFullscreen) {
      target.requestFullscreen();
    } else if (target.webkitRequestFullscreen) {
      pfx = 'webkit';
      target.webkitRequestFullscreen();
    } else if (target.mozRequestFullScreen) {
      pfx = 'moz';
      target.mozRequestFullScreen();
    } else if (target.msRequestFullscreen) {
      target.msRequestFullscreen();
    }

    return pfx;
  }

  /**
   * Disable fullscreen mode
   */
  disable() {
    const d = document as DocumentWithFullscreen;

    if (this.isEnabled()) {
      if (d.exitFullscreen) d.exitFullscreen();
      else if (d.webkitExitFullscreen) d.webkitExitFullscreen();
      else if (d.mozCancelFullScreen) d.mozCancelFullScreen();
      else if (d.msExitFullscreen) d.msExitFullscreen();
    }
  }

  onFullscreenChange() {
    if (!this.isEnabled()) {
      this.stopCommand({ sender: this.sender });
    }
  }

  run(editor: any, sender: any, opts: CommandFullscreenOptions = {}) {
    this.sender = sender;
    const { target } = opts;
    const targetEl = isElement(target)
      ? target
      : typeof target === 'string'
        ? document.querySelector<HTMLElement>(target)
        : undefined;
    const pfx = this.enable(targetEl || editor.getContainer());
    this.fullscreenChangeEvent = `${pfx}fullscreenchange`;
    this.fullscreenChangeHandler = this.onFullscreenChange.bind(this);
    document.addEventListener(this.fullscreenChangeEvent, this.fullscreenChangeHandler);
  }

  stop(_editor: any, sender: any, _opts: CommandFullscreenOptions = {}) {
    if (sender && sender.set) {
      sender.set('active', false);
    }

    if (this.fullscreenChangeEvent && this.fullscreenChangeHandler) {
      document.removeEventListener(this.fullscreenChangeEvent, this.fullscreenChangeHandler);
      this.fullscreenChangeEvent = undefined;
      this.fullscreenChangeHandler = undefined;
    }

    this.disable();
  }
}
