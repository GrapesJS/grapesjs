const $ = Backbone.$

module.exports = {
  getOffsetMethod(state) {
    let method = state || ''
    return 'get' + method + 'OffsetViewerEl'
  },

  run(editor, sender, opts) {
    let opt = opts || {}
    let state = opt.state || ''
    let config = editor.getConfig()

    if (
      !config.showOffsets ||
      (!config.showOffsetsSelected && state == 'Fixed')
    ) {
      return
    }

    let canvas = editor.Canvas
    let el = opt.el || ''
    let pos = opt.elPos || canvas.getElementPos(el)
    let style = window.getComputedStyle(el)
    let ppfx = this.ppfx
    let stateVar = state + 'State'
    let method = this.getOffsetMethod(state)
    let offsetViewer = canvas[method]()
    offsetViewer.style.display = 'block'

    let marginT = this['marginT' + state]
    let marginB = this['marginB' + state]
    let marginL = this['marginL' + state]
    let marginR = this['marginR' + state]
    let padT = this['padT' + state]
    let padB = this['padB' + state]
    let padL = this['padL' + state]
    let padR = this['padR' + state]

    if (!this[stateVar]) {
      let stateLow = state.toLowerCase()
      let marginName = stateLow + 'margin-v'
      let paddingName = stateLow + 'padding-v'
      let marginV = $(`<div class="${ppfx}marginName">`).get(0)
      let paddingV = $(`<div class="${ppfx}paddingName">`).get(0)
      let marginEls = ppfx + marginName + '-el'
      let paddingEls = ppfx + paddingName + '-el'
      const fullMargName = `${marginEls} ${ppfx + marginName}`
      const fullPadName = `${paddingEls} ${ppfx + paddingName}`
      marginT = $(`<div class="${fullMargName}-top"></div>`).get(0)
      marginB = $(`<div class="${fullMargName}-bottom"></div>`).get(0)
      marginL = $(`<div class="${fullMargName}-left"></div>`).get(0)
      marginR = $(`<div class="${fullMargName}-right"></div>`).get(0)
      padT = $(`<div class="${fullPadName}-top"></div>`).get(0)
      padB = $(`<div class="${fullPadName}-bottom"></div>`).get(0)
      padL = $(`<div class="${fullPadName}-left"></div>`).get(0)
      padR = $(`<div class="${fullPadName}-right"></div>`).get(0)
      this['marginT' + state] = marginT
      this['marginB' + state] = marginB
      this['marginL' + state] = marginL
      this['marginR' + state] = marginR
      this['padT' + state] = padT
      this['padB' + state] = padB
      this['padL' + state] = padL
      this['padR' + state] = padR
      marginV.appendChild(marginT)
      marginV.appendChild(marginB)
      marginV.appendChild(marginL)
      marginV.appendChild(marginR)
      paddingV.appendChild(padT)
      paddingV.appendChild(padB)
      paddingV.appendChild(padL)
      paddingV.appendChild(padR)
      offsetViewer.appendChild(marginV)
      offsetViewer.appendChild(paddingV)
      this[stateVar] = '1'
    }

    let unit = 'px'
    let marginLeftSt = style.marginLeft.replace(unit, '')
    let marginTopSt = parseInt(style.marginTop.replace(unit, ''))
    let marginBottomSt = parseInt(style.marginBottom.replace(unit, ''))
    let mtStyle = marginT.style
    let mbStyle = marginB.style
    let mlStyle = marginL.style
    let mrStyle = marginR.style
    let ptStyle = padT.style
    let pbStyle = padB.style
    let plStyle = padL.style
    let prStyle = padR.style
    let posLeft = parseInt(pos.left)

    // Margin style
    mtStyle.height = style.marginTop
    mtStyle.width = style.width
    mtStyle.top = pos.top - style.marginTop.replace(unit, '') + unit
    mtStyle.left = posLeft + unit

    mbStyle.height = style.marginBottom
    mbStyle.width = style.width
    mbStyle.top = pos.top + pos.height + unit
    mbStyle.left = posLeft + unit

    let marginSideH = pos.height + marginTopSt + marginBottomSt + unit
    let marginSideT = pos.top - marginTopSt + unit
    mlStyle.height = marginSideH
    mlStyle.width = style.marginLeft
    mlStyle.top = marginSideT
    mlStyle.left = posLeft - marginLeftSt + unit

    mrStyle.height = marginSideH
    mrStyle.width = style.marginRight
    mrStyle.top = marginSideT
    mrStyle.left = posLeft + pos.width + unit

    // Padding style
    let padTop = parseInt(style.paddingTop.replace(unit, ''))
    ptStyle.height = style.paddingTop
    ptStyle.width = style.width
    ptStyle.top = pos.top + unit
    ptStyle.left = posLeft + unit

    let padBot = parseInt(style.paddingBottom.replace(unit, ''))
    pbStyle.height = style.paddingBottom
    pbStyle.width = style.width
    pbStyle.top = pos.top + pos.height - padBot + unit
    pbStyle.left = posLeft + unit

    let padSideH = pos.height - padBot - padTop + unit
    let padSideT = pos.top + padTop + unit
    plStyle.height = padSideH
    plStyle.width = style.paddingLeft
    plStyle.top = padSideT
    plStyle.left = pos.left + unit

    let padRight = parseInt(style.paddingRight.replace(unit, ''))
    prStyle.height = padSideH
    prStyle.width = style.paddingRight
    prStyle.top = padSideT
    prStyle.left = pos.left + pos.width - padRight + unit
  },

  stop(editor, sender, opts) {
    let opt = opts || {}
    let state = opt.state || ''
    let method = this.getOffsetMethod(state)
    let canvas = editor.Canvas
    let offsetViewer = canvas[method]()
    offsetViewer.style.display = 'none'
  },
}
