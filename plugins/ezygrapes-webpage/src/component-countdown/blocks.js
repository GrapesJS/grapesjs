import {
  countdownRef
} from './consts';

export default function (editor, opt = {}) {
  const c = opt;
  const bm = editor.BlockManager;
  const pfx = c.countdownClsPfx;
  const style = c.defaultStyle ? `<style>
    .${pfx} {
      text-align: center;
      font-family: Helvetica, serif;
    }

    .${pfx}-block {
      display: inline-block;
      margin: 0 10px;
      padding: 10px;
    }

    .${pfx}-digit {
      font-size: 5rem;
    }

    .${pfx}-endtext {
      font-size: 5rem;
    }

    .${pfx}-cont,
    .${pfx}-block {
      display: inline-block;
    }
  </style>` : '';

  if (c.blocks.indexOf(countdownRef) >= 0) {
    bm.add(countdownRef, {
      label: c.labelCountdown,
      category: c.labelCountdownCategory,
      attributes: {class: 'far fa-clock', style: 'font-size: 1.5rem; font-weight: 900'},
      content: `
        <div class='${pfx}' data-gjs-type='countdown'></div>
        ${style}
      `
    });
  }
}
