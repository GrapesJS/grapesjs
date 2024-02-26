import { ComponentEvent } from '../model/ComponentEvent';

export default class ComponentEventView {
  event: ComponentEvent;
  constructor(event: ComponentEvent) {
    this.event = event;
  }

  renderJs() {
    return `function(){
            const subscriptions = {};
            let previousParams;

            return {trigger: function(params){
                previousParams = params;
                Object.values(subscriptions).forEach(sub => sub(params));
            }, subscribe: function(id, listener){
                subscriptions[id] = listener;
                listener(previousParams);
            }}
        }()`;
  }
}
