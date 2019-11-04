const fs = require('fs');
const path = require('path');
const localeDir = './locale';
const localeSrcDir = './src/i18n/locale';

const copyRecursiveSync = (src, dest) => {
    const exists = fs.existsSync(src);
    const isDir = exists && fs.statSync(src).isDirectory();

    if (isDir) {
        fs.mkdirSync(dest);
        fs.readdirSync(src).forEach((file) => {
            copyRecursiveSync(path.join(src, file), path.join(dest, file));
        });
    } else if (exists) {
        fs.createReadStream(src).pipe(fs.createWriteStream(dest));
    }
};

copyRecursiveSync(localeSrcDir, localeDir);

// Create locale/index.js file
let result = '';
fs.readdirSync(localeDir).forEach(file => {
    const name = file.replace('.js', '');
    result += `export { default as ${name} } from './${name}'\n`;
});
fs.writeFileSync(`${localeDir}/index.js`, result);