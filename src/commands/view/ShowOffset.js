import Backbone from 'backbone';
import { isUndefined } from 'underscore';
import { isTextNode } from 'utils/mixins';
const $ = Backbone.$;

export default {
  getOffsetMethod(state) {
    var method = state || '';
    return 'get' + method + 'OffsetViewerEl';
  },

  run(editor, sender, opts) {
    var opt = opts || {};
    var state = opt.state || '';
    var config = editor.getConfig();
    const zoom = this.em.getZoomDecimal();
    const el = opt.el || '';

    if (
      !config.showOffsets ||
      isTextNode(el) ||
      (!config.showOffsetsSelected && state == 'Fixed')
    ) {
      editor.stopCommand(this.id, opts);
      return;
    }

    var canvas = editor.Canvas;
    var pos = { ...(opt.elPos || canvas.getElementPos(el)) };

    if (!isUndefined(opt.top)) {
      pos.top = opt.top;
    }
    if (!isUndefined(opt.left)) {
      pos.left = opt.left;
    }

    var style = window.getComputedStyle(el);
    var ppfx = this.ppfx;
    var stateVar = state + 'State';
    var method = this.getOffsetMethod(state);
    var offsetViewer = canvas[method](opts.view);
    offsetViewer.style.opacity = '';

    let marginT = this['marginT' + state];
    let marginB = this['marginB' + state];
    let marginL = this['marginL' + state];
    let marginR = this['marginR' + state];
    let padT = this['padT' + state];
    let padB = this['padB' + state];
    let padL = this['padL' + state];
    let padR = this['padR' + state];

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
      var stateLow = state.toLowerCase();
      var marginName = stateLow + 'margin-v';
      var paddingName = stateLow + 'padding-v';
      var marginV = $(`<div class="${ppfx}marginName">`).get(0);
      var paddingV = $(`<div class="${ppfx}paddingName">`).get(0);
      var marginEls = ppfx + marginName + '-el';
      var paddingEls = ppfx + paddingName + '-el';
      const fullMargName = `${marginEls} ${ppfx + marginName}`;
      const fullPadName = `${paddingEls} ${ppfx + paddingName}`;
      marginT = $(`<div class="${fullMargName}-top"></div>`).get(0);
      marginB = $(`<div class="${fullMargName}-bottom"></div>`).get(0);
      marginL = $(`<div class="${fullMargName}-left"></div>`).get(0);
      marginR = $(`<div class="${fullMargName}-right"></div>`).get(0);
      padT = $(`<div class="${fullPadName}-top"></div>`).get(0);
      padB = $(`<div class="${fullPadName}-bottom"></div>`).get(0);
      padL = $(`<div class="${fullPadName}-left"></div>`).get(0);
      padR = $(`<div class="${fullPadName}-right"></div>`).get(0);
      this['marginT' + state] = marginT;
      this['marginB' + state] = marginB;
      this['marginL' + state] = marginL;
      this['marginR' + state] = marginR;
      this['padT' + state] = padT;
      this['padB' + state] = padB;
      this['padL' + state] = padL;
      this['padR' + state] = padR;
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

    var unit = 'px';
    var marginLeftSt = parseFloat(style.marginLeft.replace(unit, '')) * zoom;
    var marginRightSt = parseFloat(style.marginRight.replace(unit, '')) * zoom;
    var marginTopSt = parseFloat(style.marginTop.replace(unit, '')) * zoom;
    var marginBottomSt =
      parseFloat(style.marginBottom.replace(unit, '')) * zoom;
    var mtStyle = marginT.style;
    var mbStyle = marginB.style;
    var mlStyle = marginL.style;
    var mrStyle = marginR.style;
    var ptStyle = padT.style;
    var pbStyle = padB.style;
    var plStyle = padL.style;
    var prStyle = padR.style;
    var posLeft = parseFloat(pos.left);
    var widthEl = parseFloat(style.width) * zoom + unit;

    // Margin style
    mtStyle.height = marginTopSt + unit;
    mtStyle.width = widthEl;
    mtStyle.top = pos.top - marginTopSt + unit;
    mtStyle.left = posLeft + unit;

    mbStyle.height = marginBottomSt + unit;
    mbStyle.width = widthEl;
    mbStyle.top = pos.top + pos.height + unit;
    mbStyle.left = posLeft + unit;

    var marginSideH = pos.height + marginTopSt + marginBottomSt + unit;
    var marginSideT = pos.top - marginTopSt + unit;
    mlStyle.height = marginSideH;
    mlStyle.width = marginLeftSt + unit;
    mlStyle.top = marginSideT;
    mlStyle.left = posLeft - marginLeftSt + unit;

    mrStyle.height = marginSideH;
    mrStyle.width = marginRightSt + unit;
    mrStyle.top = marginSideT;
    mrStyle.left = posLeft + pos.width + unit;

    // Padding style
    var padTop = parseFloat(style.paddingTop) * zoom;
    ptStyle.height = padTop + unit;
    ptStyle.width = widthEl;
    ptStyle.top = pos.top + unit;
    ptStyle.left = posLeft + unit;

    var padBot = parseFloat(style.paddingBottom) * zoom;
    pbStyle.height = padBot + unit;
    pbStyle.width = widthEl;
    pbStyle.top = pos.top + pos.height - padBot + unit;
    pbStyle.left = posLeft + unit;

    var padSideH = pos.height - padBot - padTop + unit;
    var padSideT = pos.top + padTop + unit;
    plStyle.height = padSideH;
    plStyle.width = parseFloat(style.paddingLeft) * zoom + unit;
    plStyle.top = padSideT;
    plStyle.left = pos.left + unit;

    var padRight = parseFloat(style.paddingRight) * zoom;
    prStyle.height = padSideH;
    prStyle.width = padRight + unit;
    prStyle.top = padSideT;
    prStyle.left = pos.left + pos.width - padRight + unit;
  },

  stop(editor, sender, opts = {}) {
    var opt = opts || {};
    var state = opt.state || '';
    var method = this.getOffsetMethod(state);
    var canvas = editor.Canvas;
    var offsetViewer = canvas[method](opts.view);
    offsetViewer.style.opacity = 0;
  }
};
