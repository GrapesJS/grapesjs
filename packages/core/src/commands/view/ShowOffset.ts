import { isUndefined } from 'underscore';
import { CanvasSpotBuiltInTypes } from '../../canvas/model/CanvasSpot';
import { $ } from '../../common';
import Editor from '../../editor';
import type { CommandPublicFnFromHandler } from '../registryHelpers';
import CommandAbstract from './CommandAbstract';

export interface ShowOffsetCommandRegistryRun {
  'core:component-offset': CommandPublicFnFromHandler<CommandShowOffset['run']>;
  'show-offset': CommandPublicFnFromHandler<CommandShowOffset['run']>;
}

export interface ShowOffsetCommandRegistryStop {
  'core:component-offset': CommandPublicFnFromHandler<CommandShowOffset['stop']>;
  'show-offset': CommandPublicFnFromHandler<CommandShowOffset['stop']>;
}

export default class CommandShowOffset extends CommandAbstract {
  [key: string]: any;

  getOffsetMethod(state: string) {
    const method = state || '';
    return `get${method}OffsetViewerEl`;
  }

  run(editor: Editor, sender: any, opts: any) {
    const { canvas } = this;
    const opt = opts || {};
    const state = opt.state || '';
    const config = editor.getConfig();
    const zoom = this.em.getZoomDecimal();
    const el = opt.el as HTMLElement | undefined;

    if (!config.showOffsets || !(el instanceof HTMLElement) || (!config.showOffsetsSelected && state == 'Fixed')) {
      editor.stopCommand(`${this.id}`, opts);
      return;
    }

    if (canvas.hasCustomSpot(CanvasSpotBuiltInTypes.Spacing)) {
      return;
    }

    const pos = { ...(opt.elPos || canvas.getElementPos(el)) };

    if (!isUndefined(opt.top)) {
      pos.top = opt.top;
    }
    if (!isUndefined(opt.left)) {
      pos.left = opt.left;
    }

    const style = window.getComputedStyle(el);
    const ppfx = this.ppfx;
    const stateVar = `${state}State`;
    const method = this.getOffsetMethod(state);
    const offsetViewer = (canvas as any)[method](opts.view);
    offsetViewer.style.opacity = '';

    let marginT = this[`marginT${state}`];
    let marginB = this[`marginB${state}`];
    let marginL = this[`marginL${state}`];
    let marginR = this[`marginR${state}`];
    let padT = this[`padT${state}`];
    let padB = this[`padB${state}`];
    let padL = this[`padL${state}`];
    let padR = this[`padR${state}`];

    if (offsetViewer.childNodes.length) {
      this[stateVar] = '1';
      marginT = offsetViewer.querySelector('[data-offset-m-t]');
      marginB = offsetViewer.querySelector('[data-offset-m-b]');
      marginL = offsetViewer.querySelector('[data-offset-m-l]');
      marginR = offsetViewer.querySelector('[data-offset-m-r]');
      padT = offsetViewer.querySelector('[data-offset-p-t]');
      padB = offsetViewer.querySelector('[data-offset-p-b]');
      padL = offsetViewer.querySelector('[data-offset-p-l]');
      padR = offsetViewer.querySelector('[data-offset-p-r]');
    }

    if (!this[stateVar]) {
      const stateLow = state.toLowerCase();
      const marginName = `${stateLow}margin-v`;
      const paddingName = `${stateLow}padding-v`;
      const marginV = $(`<div class="${ppfx}marginName">`).get(0) as HTMLElement;
      const paddingV = $(`<div class="${ppfx}paddingName">`).get(0) as HTMLElement;
      const marginEls = `${ppfx}${marginName}-el`;
      const paddingEls = `${ppfx}${paddingName}-el`;
      const fullMargName = `${marginEls} ${ppfx}${marginName}`;
      const fullPadName = `${paddingEls} ${ppfx}${paddingName}`;
      marginT = $(`<div class="${fullMargName}-top"></div>`).get(0);
      marginB = $(`<div class="${fullMargName}-bottom"></div>`).get(0);
      marginL = $(`<div class="${fullMargName}-left"></div>`).get(0);
      marginR = $(`<div class="${fullMargName}-right"></div>`).get(0);
      padT = $(`<div class="${fullPadName}-top"></div>`).get(0);
      padB = $(`<div class="${fullPadName}-bottom"></div>`).get(0);
      padL = $(`<div class="${fullPadName}-left"></div>`).get(0);
      padR = $(`<div class="${fullPadName}-right"></div>`).get(0);
      this[`marginT${state}`] = marginT;
      this[`marginB${state}`] = marginB;
      this[`marginL${state}`] = marginL;
      this[`marginR${state}`] = marginR;
      this[`padT${state}`] = padT;
      this[`padB${state}`] = padB;
      this[`padL${state}`] = padL;
      this[`padR${state}`] = padR;
      marginV.appendChild(marginT);
      marginV.appendChild(marginB);
      marginV.appendChild(marginL);
      marginV.appendChild(marginR);
      paddingV.appendChild(padT);
      paddingV.appendChild(padB);
      paddingV.appendChild(padL);
      paddingV.appendChild(padR);
      offsetViewer.appendChild(marginV);
      offsetViewer.appendChild(paddingV);
      this[stateVar] = '1';
    }

    const unit = 'px';
    const marginLeftSt = parseFloat(style.marginLeft.replace(unit, '')) * zoom;
    const marginRightSt = parseFloat(style.marginRight.replace(unit, '')) * zoom;
    const marginTopSt = parseFloat(style.marginTop.replace(unit, '')) * zoom;
    const marginBottomSt = parseFloat(style.marginBottom.replace(unit, '')) * zoom;
    const mtStyle = marginT.style;
    const mbStyle = marginB.style;
    const mlStyle = marginL.style;
    const mrStyle = marginR.style;
    const ptStyle = padT.style;
    const pbStyle = padB.style;
    const plStyle = padL.style;
    const prStyle = padR.style;
    const posLeft = parseFloat(pos.left);
    const widthEl = parseFloat(style.width) * zoom + unit;

    mtStyle.height = marginTopSt + unit;
    mtStyle.width = widthEl;
    mtStyle.top = pos.top - marginTopSt + unit;
    mtStyle.left = posLeft + unit;

    mbStyle.height = marginBottomSt + unit;
    mbStyle.width = widthEl;
    mbStyle.top = pos.top + pos.height + unit;
    mbStyle.left = posLeft + unit;

    const marginSideH = pos.height + marginTopSt + marginBottomSt + unit;
    const marginSideT = pos.top - marginTopSt + unit;
    mlStyle.height = marginSideH;
    mlStyle.width = marginLeftSt + unit;
    mlStyle.top = marginSideT;
    mlStyle.left = posLeft - marginLeftSt + unit;

    mrStyle.height = marginSideH;
    mrStyle.width = marginRightSt + unit;
    mrStyle.top = marginSideT;
    mrStyle.left = posLeft + pos.width + unit;

    const padTop = parseFloat(style.paddingTop) * zoom;
    ptStyle.height = padTop + unit;

    const padBot = parseFloat(style.paddingBottom) * zoom;
    pbStyle.height = padBot + unit;

    const padSideH = pos.height - padBot - padTop + unit;
    const padSideT = pos.top + padTop + unit;
    plStyle.height = padSideH;
    plStyle.width = parseFloat(style.paddingLeft) * zoom + unit;
    plStyle.top = padSideT;

    const padRight = parseFloat(style.paddingRight) * zoom;
    prStyle.height = padSideH;
    prStyle.width = padRight + unit;
    prStyle.top = padSideT;
  }

  stop(editor: Editor, sender: any, opts: any = {}) {
    const opt = opts || {};
    const state = opt.state || '';
    const method = this.getOffsetMethod(state);
    const { view } = opts;
    const { canvas } = this;
    const offsetViewer = (canvas as any)[method](view);
    offsetViewer.style.opacity = 0;
  }
}
