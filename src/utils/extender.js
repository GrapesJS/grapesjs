import { isObject, isString, each, isUndefined } from 'underscore';

export default ({ $ }) => {
  if ($ && $.prototype.constructor.name !== 'jQuery') {
    const fn = $.fn;

    // Additional helpers

    fn.hide = function() {
      return this.css('display', 'none');
    };

    fn.show = function() {
      return this.css('display', 'block');
    };

    fn.focus = function() {
      const el = this.get(0);
      el && el.focus();
      return this;
    };

    // For SVGs in IE
    // (fn.removeClass = function(c) {
    //   if (!arguments.length) {
    //     return this.attr('class', '');
    //   }
    //   const classes = isString(c) && c.match(/\S+/g);
    //   return classes
    //     ? this.each(function(el) {
    //         each(classes, function(c) {
    //           if (el.classList) {
    //             el.classList.remove(c);
    //           } else {
    //             const val = el.className;
    //             const bval = el.className.baseVal;

    //             if (!isUndefined(bval)) {
    //               val.baseVal = bval.replace(c, '');
    //             } else {
    //               el.className = val.replace(c, '');
    //             }
    //           }
    //         });
    //       })
    //     : this;
    // }),
    //   (fn.remove = function() {
    //     return this.each(node => {
    //       return node.parentNode && node.parentNode.removeChild(node);
    //     });
    //   }),

    // For spectrum compatibility

    fn.bind = function(ev, h) {
      return this.on(ev, h);
    };

    fn.unbind = function(ev, h) {
      if (isObject(ev)) {
        for (let name in ev) {
          ev.hasOwnProperty(name) && this.off(name, ev[name]);
        }

        return this;
      } else {
        return this.off(ev, h);
      }
    };

    fn.click = function(h) {
      return h ? this.on('click', h) : this.trigger('click');
    };

    fn.change = function(h) {
      return h ? this.on('change', h) : this.trigger('change');
    };

    fn.keydown = function(h) {
      return h ? this.on('keydown', h) : this.trigger('keydown');
    };

    fn.delegate = function(selector, events, data, handler) {
      if (!handler) {
        handler = data;
      }

      return this.on(events, selector, function(e) {
        e.data = data;
        handler(e);
      });
    };

    fn.scrollLeft = function() {
      let el = this.get(0);
      el = el.nodeType == 9 ? el.defaultView : el;
      let win = el instanceof Window ? el : null;
      return win ? win.pageXOffset : el.scrollLeft || 0;
    };

    fn.scrollTop = function() {
      let el = this.get(0);
      el = el.nodeType == 9 ? el.defaultView : el;
      let win = el instanceof Window ? el : null;
      return win ? win.pageYOffset : el.scrollTop || 0;
    };

    const offset = $.prototype.offset;
    fn.offset = function(coords) {
      let top, left;

      if (coords) {
        top = coords.top;
        left = coords.left;
      }

      if (typeof top != 'undefined') {
        this.css('top', `${top}px`);
      }
      if (typeof left != 'undefined') {
        this.css('left', `${left}px`);
      }

      return offset.call(this);
    };

    $.map = function(items, clb) {
      const ar = [];

      for (var i = 0; i < items.length; i++) {
        ar.push(clb(items[i], i));
      }

      return ar;
    };

    const indexOf = Array.prototype.indexOf;

    $.inArray = function(val, arr, i) {
      return arr == null ? -1 : indexOf.call(arr, val, i);
    };

    $.Event = function(src, props) {
      if (!(this instanceof $.Event)) {
        return new $.Event(src, props);
      }

      this.type = src;
      this.isDefaultPrevented = () => false;
    };
  }
};
