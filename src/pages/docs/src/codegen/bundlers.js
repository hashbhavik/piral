const { sep, resolve } = require('path');
const { render, generatePage, docRef, generated, readme } = require('@pidoc/core');

function getBundlers() {
  const toolingRoot = resolve(__dirname, '../../../../tooling');
  const webpackRoot = resolve(toolingRoot, 'piral-cli-webpack');
  const parcelRoot = resolve(toolingRoot, 'piral-cli-parcel');

  return [resolve(webpackRoot, readme), resolve(parcelRoot, readme)];
}

function getRoute(basePath, name) {
  return (name && `${basePath}/${name}`) || '';
}

/**
 * Takes a path and seperates it into single parts
 * @param filePath The path in form of a string
 */
function getPathElements(filePath) {
  return filePath.split(sep);
}

exports.find = function (basePath, docsFolder, options) {
  const bundlers = getBundlers();
  return bundlers.map((file) => {
    const pathElements = getPathElements(file);
    const name = pathElements[pathElements.length - 2];
    const route = getRoute(basePath, name);
    return {
      name,
      route,
      file,
    };
  });
};

exports.build = function (entry, options) {
  const { name, file, route } = entry;
  const { mdValue, meta = {} } = render(file, generated);
  const pageMeta = {
    ...meta,
    link: route,
    source: file,
  };
  const content = ['`', `<h1><code>${name}</code></h1>`, mdValue.substr(mdValue.indexOf('</h1>') + 5)].join('');

  const head = `
    import { PageContent, Markdown } from '@pidoc/components';

    const link = "${docRef(file)}";
    const html = ${content};
  `;

  const body = `
    <PageContent>
      <Markdown content={html} link={link} />
    </PageContent>
  `;

  return generatePage(name, pageMeta, `bundlers-${name}`, head, body, route, name);
};
