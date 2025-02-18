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

  start(eventEl: HTMLElement, scrollEl: HTMLElement | Window, opts?: { lastMaxHeight?: number; zoom?: number }) {
    this.eventEl = eventEl;
    this.scrollEl = scrollEl;
    this.lastMaxHeight = opts?.lastMaxHeight || Number.POSITIVE_INFINITY;
    this.zoom = opts?.zoom || 1;

    // By detaching those from the stack avoid browsers lags
    // Noticeable with "fast" drag of blocks
    setTimeout(() => {
      this.toggleAutoscrollFx(true);
      requestAnimationFrame(this.autoscroll);
    }, 0);
  }

  private autoscroll() {
    const scrollEl = this.scrollEl;
    if (this.dragging && scrollEl) {
      const clientY = this.lastClientY ?? 0;
      const limitTop = this.autoscrollLimit;
      const eventElHeight = this.getEventElHeight();
      const limitBottom = eventElHeight - limitTop;
      let nextTop = 0;

      if (clientY < limitTop) nextTop += clientY - limitTop;
      if (clientY > limitBottom) nextTop += clientY - limitBottom;

      const scrollTop = this.getElScrollTop(scrollEl);
      if (this.lastClientY !== undefined && nextTop !== 0 && this.lastMaxHeight - nextTop > scrollTop) {
        scrollEl.scrollBy({ top: nextTop, left: 0, behavior: 'auto' });
        this.onScroll?.();
      }

      requestAnimationFrame(this.autoscroll);
    }
  }

  private getEventElHeight() {
    const eventEl = this.eventEl;
    if (!eventEl) return 0;

    const elRect = eventEl.getBoundingClientRect();
    return elRect.height;
  }

  private updateClientY(ev: Event) {
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
  }
}
