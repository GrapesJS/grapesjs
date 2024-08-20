import { CommandObject } from './CommandAbstract';

export default {
  run(ed) {
    const em = ed.getModel();
    const models = [...ed.getSelectedAll()].map((md) => md.delegate?.copy?.(md) || md).filter(Boolean);
    models.length && em.set('clipboard', models);
  },
} as CommandObject;
