const $ = Backbone.$;

module.exports = {

  getOffsetMethod(state) {
    var method = state || '';
    return 'get' + method + 'OffsetViewerEl';
  },

  run(editor, sender, opts) {
    var opt = opts || {};
    var state = opt.state || '';
    var config = editor.getConfig();

    if (!config.showOffsets ||
        (!config.showOffsetsSelected && state == 'Fixed') ) {
      return;
    }

    var canvas = editor.Canvas;
    var el = opt.el || '';
    var pos = opt.elPos || canvas.getElementPos(el);
    var style = window.getComputedStyle(el);
    var ppfx = this.ppfx;
    var stateVar = state + 'State';
    var method = this.getOffsetMethod(state);
    var offsetViewer = canvas[method]();
    offsetViewer.style.display = 'block';

    var marginT = this['marginT' + state];
    var marginB = this['marginB' + state];
    var marginL = this['marginL' + state];
    var marginR = this['marginR' + state];
    var padT = this['padT' + state];
    var padB = this['padB' + state];
    var padL = this['padL' + state];
    var padR = this['padR' + state];

    if(!this[stateVar]) {
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
    var marginLeftSt = style.marginLeft.replace(unit, '');
    var marginTopSt = parseInt(style.marginTop.replace(unit, ''));
    var marginBottomSt = parseInt(style.marginBottom.replace(unit, ''));
    var mtStyle = marginT.style;
    var mbStyle = marginB.style;
    var mlStyle = marginL.style;
    var mrStyle = marginR.style;
    var ptStyle = padT.style;
    var pbStyle = padB.style;
    var plStyle = padL.style;
    var prStyle = padR.style;
    var posLeft = parseInt(pos.left);

    // Margin style
    mtStyle.height = style.marginTop;
    mtStyle.width = style.width;
    mtStyle.top = pos.top - style.marginTop.replace(unit, '') + unit;
    mtStyle.left = posLeft + unit;

    mbStyle.height = style.marginBottom;
    mbStyle.width = style.width;
    mbStyle.top = pos.top + pos.height + unit;
    mbStyle.left = posLeft + unit;

    var marginSideH = pos.height + marginTopSt + marginBottomSt + unit;
    var marginSideT = pos.top - marginTopSt + unit;
    mlStyle.height = marginSideH;
    mlStyle.width = style.marginLeft;
    mlStyle.top = marginSideT;
    mlStyle.left = posLeft - marginLeftSt + unit;

    mrStyle.height = marginSideH;
    mrStyle.width = style.marginRight;
    mrStyle.top = marginSideT;
    mrStyle.left = posLeft + pos.width + unit;

    // Padding style
    var padTop = parseInt(style.paddingTop.replace(unit, ''));
    ptStyle.height = style.paddingTop;
    ptStyle.width = style.width;
    ptStyle.top = pos.top + unit;
    ptStyle.left = posLeft + unit;

    var padBot = parseInt(style.paddingBottom.replace(unit, ''));
    pbStyle.height = style.paddingBottom;
    pbStyle.width = style.width;
    pbStyle.top = pos.top + pos.height - padBot + unit;
    pbStyle.left = posLeft + unit;

    var padSideH = (pos.height - padBot - padTop) + unit;
    var padSideT = pos.top + padTop + unit;
    plStyle.height = padSideH;
    plStyle.width = style.paddingLeft;
    plStyle.top = padSideT;
    plStyle.left = pos.left + unit;

    var padRight = parseInt(style.paddingRight.replace(unit, ''));
    prStyle.height = padSideH;
    prStyle.width = style.paddingRight;
    prStyle.top = padSideT;
    prStyle.left = pos.left + pos.width - padRight + unit;
  },

  stop(editor, sender, opts) {
    var opt = opts || {};
    var state = opt.state || '';
    var method = this.getOffsetMethod(state);
    var canvas = editor.Canvas;
    var offsetViewer = canvas[method]();
    offsetViewer.style.display = 'none';
  },

};
