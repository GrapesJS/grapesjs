import Component from './Component';
import { ComponentOptions } from './types';

export default class ComponentWrapper extends Component {
  get defaults() {
    return {
      // @ts-ignore
      ...super.defaults,
      tagName: 'body',
      removable: false,
      copyable: false,
      draggable: false,
      components: [],
      script: function (prop: any, events: any) {
        $.get(prop.ajax).done(data => events['ajax'](data));
      },
      'script-props': ['ajax'], //This cause the editor drag drop feature to freeze
      'script-global': [{ id: 'ajax', type: 'data-list' }],
      'script-events': [{ id: 'ajax', params: { type: 'object', inner: { data: { type: 'single' } } } }],
      ajax: {
        test: {
          urlRaw: 'https://reqres.in/api/users?page=2',
          dataSrc: 'data',
          dataIds: ['id', 'email', 'first_name', 'last_name', 'avatar'],
        },
      },
      traits: [
        {
          name: 'ajax',
          label: 'ajax',
          type: 'unique-list',
          changeProp: true,
          traits: { type: 'ajax' },
        },
      ],
      stylable: [
        'background',
        'background-color',
        'background-image',
        'background-repeat',
        'background-attachment',
        'background-position',
        'background-size',
      ],
    };
  }

  dataIds: { [id: string]: string[] } = {};

  constructor(props = {}, opt: ComponentOptions = {}) {
    super(props, opt);
    // this.on("change:ajax", () => {
    //   this.dataIds = {};
    //   // Object.entries(this.data).map(([id, value]) => (value.url && value.dataSrc) && eval(`(${this.ajaxFunctionTemplate(value)})`)()
    //   // .done((data: any) => this.dataIds[id] = Object.keys(data[value.dataSrc][0])) )
    //   // console.log(this.dataIds)
    //   // this.view?.render()
    // }, this);
    console.log(this.globalVariables);
  }
  //   (class {
  //     static data = (()=>{
  //     var data = undefined;
  //     const url = "${url}";
  //     var defaultOpts = {}

  //     return function(opts) {
  //     console.log(defaultOpts)
  //     console.log(opts)
  //     if (typeof data ==='undefined' || !(JSON.stringify(defaultOpts) == JSON.stringify(opts))){
  //         console.log("defining it")
  //         data = $.get( "https://reqres.in/api/users?page=2")//, { name: "John", time: "2pm" } )
  //         .done(( d ) => {data = d; console.log(d)})
  //         // console.log(ajax.responseJSON)
  //         // data = "flaksjf"
  //     }
  //     console.log(data.responseJSON)
  //     return data.responseJSON
  // }})()
  // })

  private ajaxFunctionTemplate(value: any) {
    return `function(){
      let savedOpts = {url: "${value.url}"};
      let result;
      return function(opts){
        if (typeof data === "undefined" || JSON.stringify({...opts, url: "${value.url}"}) != JSON.stringify(savedOpts)){
          savedOpts = opts;
          result = $.get("${value.url}")
        }
        return result;
      }
    }()`;
  }
  // get globalScript(){
  //   const {ajax, ccid} = this;
  //   return `
  //     window.${ccid}ScopedVariables = {${Object.entries(ajax).map(([id, value]) =>
  //       `"${id}": ${this.ajaxFunctionTemplate(value)}`).join(",")}};
  //     `
  // }

  renderJsDataUsage(id: string) {
    const { ajax, ccid } = this;
    if (typeof this.ajax[id] === 'undefined') {
      console.error('Selected data variable is missing');
      return;
    }
    console.log(ajax[id]);
    const dataFn = ajax[id]['dataSrc'] ? `data["${ajax[id]['dataSrc']}"]` : 'data';
    const jsString = `(function(callback){window.${ccid}ScopedVariables['${id}']().done((data)=>callback(${dataFn}))})`;
    let dataIds = this.dataIds[id];
    return { dataIds, jsString };
  }

  get ajax(): { [id: string]: any } {
    return this.get('ajax');
  }

  __postAdd() {
    const um = this.em?.UndoManager;
    !this.__hasUm && um?.add(this);
    return super.__postAdd();
  }

  __postRemove() {
    const um = this.em?.UndoManager;
    um?.remove(this);
    return super.__postRemove();
  }

  static isComponent() {
    return false;
  }
}
