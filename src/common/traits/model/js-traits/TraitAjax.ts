import Trait from '../Trait';
import TraitModifier from '../TraitModifier';
import { jsFunction, jsModifier } from '../TraitModifierJs';
import TraitObject from '../TraitObject';
import TraitObjectItem from '../TraitObjectItem';

export default class TraitAjax extends TraitObject<{ url: string; dataSrc?: string }> {
  constructor(target: Trait<{ url: string; dataSrc?: string }>) {
    super(target);
  }

  protected initChildren() {
    return [
      new TraitObjectItem('url', this, { type: 'url' }),
      new TraitObjectItem('dataSrc', this, { type: 'text', default: 'data' }),
    ];
  }

  protected overrideValue(value: { url: string; dataSrc?: string }) {
    return jsModifier(
      jsFunction(value => {
        const dataSrc = value?.dataSrc;
        const dataFn = dataSrc ? `data['${dataSrc}']` : 'data';
        return `function(){
            let savedOpts = {url: ${value.url}};
            const callbacks = []
            let result;
            return function(opts, callback){
              if (typeof result === "undefined" || JSON.stringify({...opts, url: ${value.url}}) != JSON.stringify(savedOpts)){
                savedOpts = opts;
                result = $.get(${value.url})
              }
              if(callback){
                  callbacks.push(callback)
              }
              result.done((data) => callbacks.foreach(c => c(${dataFn}, data)))
              return result;
            }
          }()`;
      })
    )(value);
  }
}
