import { extend } from 'underscore'

const Backbone = require('backbone')
const Properties = require('./Properties')
const PropertyFactory = require('./PropertyFactory')

module.exports = Backbone.Model.extend({
  defaults: {
    id: '',
    name: '',
    open: true,
    buildProps: '',
    extendBuilded: 1,
    properties: [],
  },

  initialize(opts) {
    let o = opts || {}
    let props = []
    let builded = this.buildProperties(o.buildProps)
    !this.get('id') && this.set('id', this.get('name'))

    if (!builded) props = this.get('properties')
    else props = this.extendProperties(builded)

    let propsModel = new Properties(props)
    propsModel.sector = this
    this.set('properties', propsModel)
  },

  /**
   * Extend properties
   * @param {Array<Object>} props Start properties
   * @param {Array<Object>} moProps Model props
   * @param {Boolean} ex Returns the same amount of passed model props
   * @return {Array<Object>} Final props
   * @private
   */
  extendProperties(props, moProps, ex) {
    let pLen = props.length
    let mProps = moProps || this.get('properties')
    let ext = this.get('extendBuilded')
    let isolated = []

    for (let i = 0, len = mProps.length; i < len; i++) {
      let mProp = mProps[i]
      let found = 0

      for (let j = 0; j < pLen; j++) {
        let prop = props[j]
        if (mProp.property == prop.property || mProp.id == prop.property) {
          // Check for nested properties
          let mPProps = mProp.properties
          if (mPProps && mPProps.length) {
            mProp.properties = this.extendProperties(
              prop.properties,
              mPProps,
              1
            )
          }
          props[j] = ext ? extend(prop, mProp) : mProp
          isolated[j] = props[j]
          found = 1
          continue
        }
      }

      if (!found) {
        props.push(mProp)
        isolated.push(mProp)
      }
    }

    return ex ? isolated : props
  },

  /**
   * Build properties
   * @param {Array<string>} propr Array of props as sting
   * @return {Array<Object>}
   * @private
   */
  buildProperties(props) {
    let r
    let buildP = props || []

    if (!buildP.length) return

    if (!this.propFactory) this.propFactory = new PropertyFactory()

    r = this.propFactory.build(buildP)

    return r
  },
})
