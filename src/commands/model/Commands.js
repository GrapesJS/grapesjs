import { Collection } from '../../common';
import Command from './Command';

export default class Commands extends Collection {}

Commands.prototype.model = Command;
