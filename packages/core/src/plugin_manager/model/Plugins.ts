import { Collection } from '../../common';
import PluginModel from './Plugin';

export default class Plugins extends Collection<PluginModel> {}

Plugins.prototype.model = PluginModel;
