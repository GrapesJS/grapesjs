export default class DragSelector {
  /** grapesjs editor model */
  private _editor: any;
  /** placce where lasso embedded, eg: canvas, document, etc... */
  private _target: any;
  /** target as a HTMLElement */
  private _targetEl?: HTMLElement;
  /** frame element that contains target */
  private _frameEl: HTMLFrameElement;
  /** mouse information */
  private _mouse: {
    x: number;
    y: number;
    startX: number;
    startY: number;
  };
  private _selectable = [];
  private _blockingArea?: HTMLDivElement;
  /** lasso's area, draws an area for selection's rage */
  private _area?: HTMLDivElement;
  /** flag to check if using lasso */
  private _dragging: boolean;
  /** store event whenever mousedown emitted */
  private _mousedownEvent?: MouseEvent;

  public get editor() {
    return this._editor;
  }

  public set editor(editor) {
    this._editor = editor;
  }

  public get target() {
    return this._target;
  }

  public set target(target) {
    this._target = target;
  }

  public get targetEl() {
    return this._targetEl;
  }

  public set targetEl(targetEl) {
    this._targetEl = targetEl;
  }

  public get frameEl() {
    return this._frameEl;
  }

  public set frameEl(el: HTMLFrameElement) {
    this._frameEl = el;
  }

  private sleep(ms: number = 0) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  constructor(editor: any, target: any) {
    this.editor = editor;
    this.target = target;
    this._mouse = {
      startX: 0,
      startY: 0,
      x: 0,
      y: 0,
    };
    this._dragging = false;

    /** get HTMLElement from target model */
    this.targetEl = this.target.getEl
      ? this.target.getEl()
      : this.target.getElement
      ? this.target.getElement()
      : undefined;
    if (!this.targetEl) throw new Error('no target element');

    /** get frame element */
    this._frameEl = this.editor.Canvas.getFrameEl();
    if (!this._frameEl) throw new Error('no frame element');

    this._initBlockingArea();

    this._initListeners();
  }

  private _initBlockingArea() {
    const el = this.frameEl?.contentWindow?.document.createElement('div');

    if (!el) return;

    el.style.zIndex = '-999';
    el.style.width = '100%';
    el.style.height = '100%';
    el.style.position = 'absolute';
    el.style.display = 'block';
    el.style.top = '0px';
    el.style.left = '0px';
    el.onclick = ev => ev.stopPropagation();

    this.targetEl?.appendChild(el);
    this._blockingArea = el;
  }

  /** binding mouse events listener */
  private _initListeners() {
    this.editor.on('component:drag:end', () => this.targetEl?.setAttribute('draggable', 'false'));

    this.targetEl?.addEventListener('mousedown', ev => {
      let target: any = ev.target;

      if (target.tagName?.toLowerCase() === 'canvas' && (ev as any).path[1]) {
        target = (ev as any).path[1];
      }

      if (target.getAttribute('data-gjs-type') !== 'wrapper') {
        return;
      } else {
        ev.stopPropagation();

        this._mousedownEvent = ev;
        const dispatchedEvent = new MouseEvent('mousedown', ev);

        this._blockingArea?.dispatchEvent(dispatchedEvent);
      }
    });

    this.targetEl?.addEventListener('mouseup', ev => {
      this._blockingArea?.dispatchEvent(new MouseEvent('mouseup'));
    });

    this._blockingArea?.addEventListener('mousedown', ev => {
      this._mousedownListener(ev);
    });

    this._blockingArea?.addEventListener('mousemove', ev => {
      new Promise(() => this._mousemoveListener(ev));
    });

    this._blockingArea?.addEventListener('mouseup', ev => {
      new Promise(() => this._mouseupListener(ev));
    });
  }

  private _mousedownListener(ev: any) {
    /** do not proceed if not left mouse */
    if (ev.button !== 0) return;

    this._dragging = true;

    if (this._blockingArea) this._blockingArea.style.display = 'block';

    /** draw area if not existed */
    if (!this._area) {
      this._mouse.x = ev.clientX + document.body.scrollLeft;
      this._mouse.y = ev.clientY + document.body.scrollTop;
      this._mouse.startX = this._mouse.x;
      this._mouse.startY = this._mouse.y;

      this._area = this.frameEl?.contentWindow?.document.createElement('div');

      if (!this._area) return;

      this._area.id = 'drag-selector-area';

      this._area.style.left = this._mouse.x + 'px';
      this._area.style.top = this._mouse.y + 'px';
      this._area.style.border = '1px solid rgba(0, 0, 255, 0.45)';
      this._area.style.backgroundColor = 'rgba(0, 0, 255, 0.1)';
      if (this._blockingArea) this._blockingArea.style.zIndex = '999';
      this._area.style.position = 'absolute';
      this._area.style.zIndex = '99';

      this._blockingArea?.appendChild(this._area);
    }
  }

  private async _mouseupListener(ev: any) {
    /** do not proceed if not left mouse */
    if (ev.button !== 0 || !this._area) return;

    /** cleanup area function */
    const cleanup = () => {
      this._area?.remove();

      // @ts-ignore
      this._area = null;
      if (this._blockingArea) this._blockingArea.style.display = 'none';
    };

    this._dragging = false;

    const { width, height } = this._area.style;
    /**
     * if area doesn't have a properly width & height,
     * then it's just a simple click,
     * don't proceed lasso, proceed click event
     */
    if (!(width && height)) {
      this._mousedownEvent && (this._mousedownEvent.target as HTMLElement).click();
      cleanup();
      return;
    }

    const selectableLength = this._selectable.length;
    if (selectableLength > 0) {
      const lastComponent = this._selectable[selectableLength - 1];
      this.sleep(200).then(() => {
        this.editor.select(this._selectable);

        // Make sure this is called one time here as this is triggering grapesJs multi events
        this.editor.trigger('select:end', lastComponent);
      });
    }

    cleanup();
    return;
  }

  private async _mousemoveListener(ev: any) {
    /** if doesn't have an area, do not proceed */
    if (!this._area) return;

    /** if not using lasso, do not proceed */
    if (!this._dragging) return;

    /** update mouse's info */
    this._mouse.x = ev.clientX + document.body.scrollLeft;
    this._mouse.y = ev.clientY + document.body.scrollTop;

    /** updating Area's size */
    this._area.style.width = Math.abs(this._mouse.x - this._mouse.startX) + 'px';
    this._area.style.height = Math.abs(this._mouse.y - this._mouse.startY) + 'px';

    /** updating Area's position */
    this._area.style.left = (this._mouse.x - this._mouse.startX < 0 ? this._mouse.x : this._mouse.startX) + 'px';
    this._area.style.top = (this._mouse.y - this._mouse.startY < 0 ? this._mouse.y : this._mouse.startY) + 'px';

    /** all components */
    let components = this.editor.getComponents();

    if (this._area.style.width && this._area.style.height) {
      /** filter out selectable components */
      this._selectable = components.filter((c: any) => {
        /** component's HTMLElement */
        const el: HTMLElement = c.getEl();
        /** get rect info */
        const elRect = el.getBoundingClientRect();
        const { bottom, right, left, top } = elRect;

        const areaRect = this._area?.getBoundingClientRect();
        // @ts-ignore
        const { bottom: areaBottom, right: areaRight, left: areaLeft, top: areaTop } = areaRect;

        /** check if component placed in range of Area's width */
        const inXArea = (x: number) => {
          return areaLeft <= x && areaRight >= x;
        };
        /** check if component placed in range of Area's height */
        const inYArea = (y: number) => {
          return areaTop <= y && areaBottom >= y;
        };
        /** check if Area placed in range of component's width */
        const inX = (x: number) => {
          return left <= x && right >= x;
        };
        /** check if Area placed in range of component's height */
        const inY = (y: number) => {
          return top <= y && bottom >= y;
        };

        /** x-axis condition */
        const xCondition = inXArea(left) || inXArea(right) || inX(areaLeft);
        /** y-axis condition */
        const yCondition = inYArea(top) || inYArea(bottom) || inY(areaTop);

        if (xCondition && yCondition) {
          return true;
        }

        return false;
      });
    } else {
      return;
    }
  }

  public destroy() {
    this._blockingArea?.remove();
  }
}
