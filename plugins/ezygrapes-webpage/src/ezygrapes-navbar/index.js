import ezygrapes from 'ezygrapes';
import loadBlocks from './blocks';
import loadComponents from './components';
import {
  hNavbarRef
} from './consts';

export default ezygrapes.plugins.add('gjs-navbar', (editor, opts = {}) => {
  let c = opts;

  let defaults = {
    blocks: [hNavbarRef],
    defaultStyle: 1,
    navbarClsPfx: 'navbar',
    labelNavbar: 'Navbar',
    labelNavbarContainer: 'Navbar Container',
    labelMenu: 'Navbar Menu',
    labelMenuLink: 'Menu link',
    labelBurger: 'Burger',
    labelBurgerLine: 'Burger Line',
    labelNavbarBlock: 'Navbar',
    labelNavbarCategory: 'Extra',
    labelHome: 'Home',
    labelAbout: 'About',
    labelContact: 'Contact',
  };

  // Load defaults
  for (let name in defaults) {
    if (!(name in c))
      c[name] = defaults[name];
  }

  loadBlocks(editor, c);
  loadComponents(editor, c);
});
