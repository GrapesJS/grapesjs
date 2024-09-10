import { extend } from 'underscore';
import { Model } from '../../common';
import Component from '../../dom_components/model/Component';

function isFunctionEmpty(fn: string) {
  const content = fn.toString().match(/\{([\s\S]*)\}/m)?.[1] || ''; // content between first and last { }
  return content.replace(/^\s*\/\/.*$/gm, '').trim().length === 0; // remove comments
}

type MapJsItem = {
  ids: string[];
  code: string;
  props?: Record<string, any>;
};

export default class JsGenerator extends Model {
  mapJs!: Record<string, MapJsItem>;

  mapModel(model: Component) {
    let code = '';
    const script = model.get('script-export') || model.get('script');
    const type = model.get('type')!;
    const comps = model.get('components')!;
    const id = model.getId();

    if (script) {
      // If the component has scripts we need to expose his ID
      let attr = model.get('attributes');
      attr = extend({}, attr, { id });
      model.set('attributes', attr, { silent: true });
      // @ts-ignore
      const scrStr = model.getScriptString(script);
      const scrProps = model.get('script-props');

      // If the script was updated, I'll put its code in a separate container
      if (model.get('scriptUpdated') && !scrProps) {
        this.mapJs[type + '-' + id] = { ids: [id], code: scrStr };
      } else {
        let props;
        const mapType = this.mapJs[type];

        if (scrProps) {
          props = model.__getScriptProps();
        }

        if (mapType) {
          mapType.ids.push(id);
          if (props) mapType.props![id] = props;
        } else {
          const res: MapJsItem = { ids: [id], code: scrStr };
          if (props) res.props = { [id]: props };
          this.mapJs[type] = res;
        }
      }
    }

    comps.forEach((model: Component) => {
      code += this.mapModel(model);
    });

    return code;
  }

  build(model: Component) {
    this.mapJs = {};
    this.mapModel(model);
    let code = '';

    for (let type in this.mapJs) {
      const mapType = this.mapJs[type];

      if (!mapType.code) {
        continue;
      }

      if (mapType.props) {
        if (isFunctionEmpty(mapType.code)) {
          continue;
        }

        code += `
          var props = ${JSON.stringify(mapType.props)};
          var ids = Object.keys(props).map(function(id) { return '#'+id }).join(',');
          var els = document.querySelectorAll(ids);
          for (var i = 0, len = els.length; i < len; i++) {
            var el = els[i];
            (${mapType.code}.bind(el))(props[el.id]);
          }`;
      } else {
        // Deprecated
        const ids = '#' + mapType.ids.join(', #');
        code += `
          var items = document.querySelectorAll('${ids}');
          for (var i = 0, len = items.length; i < len; i++) {
            (function(){\n${mapType.code}\n}.bind(items[i]))();
          }`;
      }
    }

    return code;
  }
}
