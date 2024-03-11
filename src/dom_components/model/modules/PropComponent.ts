import { Model } from "../../../common";
import Component from "../Component";
import ScriptSubComponent from "./ScriptSubComponent";

export type PropsType = {name: string, type: 'link'}


export default class PropComponent {
    private model?: Component;
    private script: ScriptSubComponent
    name: string;

    constructor(script: ScriptSubComponent, opts: PropsType){
        this.script = script;
        this.name = opts.name;
    }

    register(comp: Component){
        this.model = comp;
        this.model.on(`change:${this.name}`, this.propChange, this);
    }

    deregister(){
        this.model?.off(`change:${this.name}`, this.propChange, this);
        this.model = undefined;
    }

    private propChange(){
        this.script.onChange();
    }

    static linkToComponent(comp: ScriptSubComponent, name: string){
        return new PropComponent(comp, {name, type: 'link'})
    }
}