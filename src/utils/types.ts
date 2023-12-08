export type RectDim = {
    w: number;
    h: number;
    t: number;
    l: number;
    r: number;
};
  
export type BoundingRect = {
    left: number;
    top: number;
    width: number;
    height: number;
};

export type CallbackOptions = {
    docs: any;
    config: any;
    el: HTMLElement;
};
