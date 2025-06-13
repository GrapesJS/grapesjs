import { bindAll } from 'underscore';
import { getPointerEvent, off, on } from './dom';

export default class AutoScroller {
  private eventEl?: HTMLElement; // Element that handles mouse events
  private scrollEl?: HTMLElement | Window; // Element that will be scrolled
  private dragging: boolean = false;
  private lastClientY?: number;
  private lastMaxHeight: number = 0;
  private onScroll?: () => void;
  private autoscrollLimit: number;
  private zoom: number = 1;
  /**
   * When an element is inside an iframe, its `getBoundingClientRect()` values
   * are relative to the iframe's document, not the main window's.
   */
  private rectIsInScrollIframe: boolean = false;
  private ignoredElement?: HTMLElement; // If the mouse is over this element, don't autoscroll

  constructor(
    autoscrollLimit: number = 50,
    opts?: {
      lastMaxHeight?: number;
      onScroll?: () => void;
      rectIsInScrollIframe?: boolean;
    },
  ) {
    this.autoscrollLimit = autoscrollLimit;
    this.lastMaxHeight = opts?.lastMaxHeight ?? 0;
    this.onScroll = opts?.onScroll;
    this.rectIsInScrollIframe = !!opts?.rectIsInScrollIframe;
    bindAll(this, 'start', 'autoscroll', 'updateClientY', 'stop');
  }

  start(
    eventEl: HTMLElement,
    scrollEl: HTMLElement | Window,
    opts?: {
      lastMaxHeight?: number;
      zoom?: number;
      ignoredElement?: HTMLElement;
    },
  ) {
    this.eventEl = eventEl;
    this.scrollEl = scrollEl;
    this.lastMaxHeight = opts?.lastMaxHeight || Number.POSITIVE_INFINITY;
    this.zoom = opts?.zoom || 1;
    this.ignoredElement = opts?.ignoredElement;

    // By detaching those from the stack avoid browsers lags
    // Noticeable with "fast" drag of blocks
    setTimeout(() => {
      this.toggleAutoscrollFx(true);
      requestAnimationFrame(this.autoscroll);
    }, 0);
  }

  private autoscroll() {
    const scrollEl = this.scrollEl;
    if (!this.dragging || !scrollEl) return;
    if (this.lastClientY === undefined) {
      setTimeout(() => {
        requestAnimationFrame(this.autoscroll);
      }, 50);
      return;
    }

    const clientY = this.lastClientY ?? 0;
    const limitTop = this.autoscrollLimit;
    const eventElHeight = this.getEventElHeight();
    const limitBottom = eventElHeight - limitTop;
    let scrollAmount = 0;

    if (clientY < limitTop) scrollAmount += clientY - limitTop;
    if (clientY > limitBottom) scrollAmount += clientY - limitBottom;

    const scrollTop = this.getElScrollTop(scrollEl);
    scrollAmount = Math.min(scrollAmount, this.lastMaxHeight - scrollTop);
    scrollAmount = Math.max(scrollAmount, -scrollTop);
    if (scrollAmount !== 0) {
      scrollEl.scrollBy({ top: scrollAmount, behavior: 'auto' });
      this.onScroll?.();
    }

    requestAnimationFrame(this.autoscroll);
  }

  private getEventElHeight() {
    const eventEl = this.eventEl;
    if (!eventEl) return 0;

    const elRect = eventEl.getBoundingClientRect();
    return elRect.height;
  }

  private updateClientY(ev: Event) {
    const target = ev.target as HTMLElement;

    if (this.ignoredElement && this.ignoredElement.contains(target)) {
      return;
    }

    const scrollEl = this.scrollEl;
    ev.preventDefault();

    const scrollTop = !this.rectIsInScrollIframe ? this.getElScrollTop(scrollEl) : 0;
    this.lastClientY = getPointerEvent(ev).clientY * this.zoom - scrollTop;
  }

  private getElScrollTop(scrollEl: HTMLElement | Window | undefined) {
    return (scrollEl instanceof HTMLElement ? scrollEl.scrollTop : scrollEl?.scrollY) || 0;
  }

  private toggleAutoscrollFx(enable: boolean) {
    this.dragging = enable;
    const eventEl = this.eventEl;
    if (!eventEl) return;
    const method = enable ? 'on' : 'off';
    const mt = { on, off };
    mt[method](eventEl, 'mousemove dragover', this.updateClientY);
    mt[method](eventEl, 'mouseup', this.stop);
  }

  stop() {
    this.toggleAutoscrollFx(false);
    this.lastClientY = undefined;
    this.ignoredElement = undefined;
  }
}
