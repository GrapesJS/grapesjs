#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run docs:build

# navigate into the build output directory
cd docs/.vuepress/dist

# I need to deploy all the documentation inside docs folder
mkdir docs-new

# move all the files from the current directory in docs
mv `\ls -1 ./ | grep -v docs-new` ./docs-new

# fetch the current site, remove the old docs dir and make current the new one
git clone -b gh-pages https://github.com/artf/grapesjs.git tmp && mv tmp/* tmp/.* . && rm -rf tmp
rm -fR docs
mv ./docs-new ./docs

# stage all and commit
git add -A
git commit -m 'deploy docs'
git push https://github.com/artf/grapesjs.git gh-pages
# surge --domain grapesjs.surge.sh
cd -
