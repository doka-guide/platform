module.exports = function(config) {
  config.addPassthroughCopy('src/favicon.ico');
  config.addPassthroughCopy('src/manifest.json');
  config.addPassthroughCopy('src/fonts');
  config.addPassthroughCopy('src/styles');
  config.addPassthroughCopy('src/scripts');
  config.addPassthroughCopy('src/**/*.(html|gif|jpg|png|svg|mp4|webm|zip)');

  config.addFilter('ruDate', (value) => {
    return value.toLocaleString('ru', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).replace(' г.', '');
  });

  config.addFilter('shortDate', (value) => {
    return value.toLocaleString('ru', {
      month: 'short',
      day: 'numeric'
    }).replace('.', '');
  });

  config.addFilter('isoDate', (value) => {
    return value.toISOString();
  });

  return {
    dir: {
      input: 'src',
      output: 'dist',
      includes: 'includes',
      layouts: 'layouts',
      data: 'data',
    },
    dataTemplateEngine: 'njk',
    markdownTemplateEngine: false,
    htmlTemplateEngine: 'njk',
    passthroughFileCopy: true,
    templateFormats: [
      'md', 'njk'
    ],
  };
};
