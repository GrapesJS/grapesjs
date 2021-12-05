import {
  hNavbarRef,
  navbarRef,
  navbarItemsRef,
  menuRef
} from './consts';

export default (editor, opt = {}) => {
  const c = opt;
  const bm = editor.BlockManager;
  const navbarPfx = c.navbarClsPfx || 'navbar';
  const style = c.defaultStyle ? `
  <style>
    .${navbarPfx}-items-c {
      display: inline-block;
      float: right;
    }

    .${navbarPfx} {
      background-color: #222;
      color: #ddd;
      min-height: 50px;
      width: 100%;
    }

    .${navbarPfx}-container {
      max-width: 950px;
      margin: 0 auto;
      width: 95%;
    }

    .${navbarPfx}-container::after {
      content: "";
      clear: both;
      display: block;
    }

    .${navbarPfx}-brand {
      vertical-align: top;
      display: inline-block;
      padding: 5px;
      min-height: 50px;
      min-width: 50px;
      color: inherit;
      text-decoration: none;
    }

    .${navbarPfx}-menu {
      padding: 10px 0;
      display: block;
      float: right;
      margin: 0;
    }

    .${navbarPfx}-menu-link {
      margin: 0;
      color: inherit;
      text-decoration: none;
      display: inline-block;
      padding: 10px 15px;
    }

    .${navbarPfx}-burger {
      margin: 10px 0;
      width: 45px;
      padding: 5px 10px;
      display: none;
      float: right;
      cursor: pointer;
    }

    .${navbarPfx}-burger-line {
      padding: 1px;
      background-color: white;
      margin: 5px 0;
    }

    @media (max-width: 768px) {
      .${navbarPfx}-burger {
        display: block;
      }

      .${navbarPfx}-items-c {
        display: none;
        width: 100%;
      }

      .${navbarPfx}-menu {
        width: 100%;
      }

      .${navbarPfx}-menu-link {
        display: block;
      }
    }
  </style>
  ` : '';

  if (c.blocks.indexOf(hNavbarRef) >= 0) {
    bm.add(hNavbarRef, {
      label: `
        <svg class="gjs-block-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path class="gjs-block-svg-path" d="M22,9 C22,8.4 21.5,8 20.75,8 L3.25,8 C2.5,8 2,8.4 2,9 L2,15 C2,15.6 2.5,16 3.25,16 L20.75,16 C21.5,16 22,15.6 22,15 L22,9 Z M21,15 L3,15 L3,9 L21,9 L21,15 Z" fill-rule="nonzero"></path>
          <rect class="gjs-block-svg-path" x="15" y="10" width="5" height="1"></rect>
          <rect class="gjs-block-svg-path" x="15" y="13" width="5" height="1"></rect>
          <rect class="gjs-block-svg-path" x="15" y="11.5" width="5" height="1"></rect>
        </svg>
        <div class="gjs-block-label">${c.labelNavbarBlock}</div>`,
      category: c.labelNavbarCategory,
      content: `
        <div class="${navbarPfx}" data-gjs-droppable="false" data-gjs-custom-name="${c.labelNavbar}" data-gjs="${navbarRef}">
          <div class="${navbarPfx}-container" data-gjs-droppable="false" data-gjs-draggable="false"
            data-gjs-removable="false" data-gjs-copyable="false" data-gjs-highlightable="false"
            data-gjs-custom-name="${c.labelNavbarContainer}">

            <a href="/" class="${navbarPfx}-brand" data-gjs-droppable="true"></a>

            <div class="${navbarPfx}-burger" data-gjs-type="burger-menu">
              <div class="${navbarPfx}-burger-line" data-gjs-custom-name="${c.labelBurgerLine}" data-gjs-droppable="false" data-gjs-draggable="false"></div>
              <div class="${navbarPfx}-burger-line" data-gjs-custom-name="${c.labelBurgerLine}" data-gjs-droppable="false" data-gjs-draggable="false"></div>
              <div class="${navbarPfx}-burger-line" data-gjs-custom-name="${c.labelBurgerLine}" data-gjs-droppable="false" data-gjs-draggable="false"></div>
            </div>

            <div class="${navbarPfx}-items-c" data-gjs="${navbarItemsRef}">
              <nav class="${navbarPfx}-menu" data-gjs="${menuRef}" data-gjs-custom-name="${c.labelMenu}">
                <a href="#" class="${navbarPfx}-menu-link" data-gjs-custom-name="${c.labelMenuLink}" data-gjs-draggable="[data-gjs=${menuRef}]">${c.labelHome}</a>
                <a href="#" class="${navbarPfx}-menu-link" data-gjs-custom-name="${c.labelMenuLink}" data-gjs-draggable="[data-gjs=${menuRef}]">${c.labelAbout}</a>
                <a href="#" class="${navbarPfx}-menu-link" data-gjs-custom-name="${c.labelMenuLink}" data-gjs-draggable="[data-gjs=${menuRef}]">${c.labelContact}</a>
              </nav>
            </div>

          </div>
        </div>
        ${style}
      `,
    });
  }
}
