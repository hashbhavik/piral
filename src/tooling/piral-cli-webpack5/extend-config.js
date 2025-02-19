function changePlugin(config, classRef, cb) {
  config.module.plugins = config.module.plugins
    .map((plugin) => {
      if (plugin instanceof classRef) {
        if (typeof cb === 'function') {
          return cb(plugin);
        } else {
          return cb;
        }
      }

      return plugin;
    })
    .filter(Boolean);
}

function changeRule(config, name, cb) {
  const loaderPath = require.resolve(name);
  config.module.rules = config.module.rules
    .map((rule) => {
      const uses = rule.use || [];

      if (uses.some((m) => m && (m === loaderPath || (typeof m === 'object' && m.loader === loaderPath)))) {
        if (typeof cb === 'function') {
          return cb(rule);
        } else {
          return cb;
        }
      }

      return rule;
    })
    .filter(Boolean);
}

function changeLoader(config, name, cb) {
  const loaderPath = require.resolve(name);

  changeRule(config, name, (rule) => {
    rule.use = rule.use.map((m) => {
      if (m === loaderPath) {
        if (typeof cb === 'function') {
          return cb({ loader: m });
        } else {
          return cb;
        }
      } else if (m.loader === loaderPath) {
        if (typeof cb === 'function') {
          return cb(m);
        } else {
          return cb;
        }
      } else {
        return m;
      }
    });

    return rule;
  });
}

function changeLoaderOptions(config, name, options) {
  changeLoader(config, name, (rule) => {
    rule.options = options;
    return rule;
  });
}

module.exports = function (override) {
  return (config) => {
    if (override && typeof override === 'object') {
      if ('fileLoaderOptions' in override) {
        changeLoaderOptions(config, 'file-loader', override.fileLoaderOptions);
      }

      if ('tsLoaderOptions' in override) {
        changeLoaderOptions(config, 'ts-loader', override.tsLoaderOptions);
      }

      if ('babelLoaderOptions' in override) {
        changeLoaderOptions(config, 'babel-loader', override.babelLoaderOptions);
      }

      if ('cssLoaderOptions' in override) {
        changeLoaderOptions(config, 'css-loader', override.cssLoaderOptions);
      }

      if ('sassLoaderOptions' in override) {
        changeLoaderOptions(config, 'sass-loader', override.sassLoaderOptions);
      }

      if (override.checkTypes === true) {
        changeLoader(
          config,
          'ts-loader',
          (rule) =>
            (rule.options = {
              ...rule.options,
              transpileOnly: false,
            }),
        );
      }

      if (override.noPresets === true) {
        changeLoader(
          config,
          'babel-loader',
          (rule) =>
            (rule.options = {
              ...rule.options,
              presets: undefined,
            }),
        );
      }

      if ('updateRules' in override && Array.isArray(override.updateRules)) {
        override.updateRules.forEach((def) => {
          if (typeof def.name === 'string' && def.rule) {
            changeRule(config, def.name, def.rule);
          }
        });
      }

      if ('removeRules' in override && Array.isArray(override.removeRules)) {
        override.removeRules.forEach((rule) => changeRule(config, rule, () => undefined));
      }

      if ('rules' in override && Array.isArray(override.rules)) {
        config.module.rules.push(...override.rules);
      }

      if ('updatePlugins' in override && Array.isArray(override.updatePlugins)) {
        override.updatePlugins.forEach((def) => {
          if (def.type && def.rule) {
            changePlugin(config, def.type, def.plugin);
          }
        });
      }

      if ('removePlugins' in override && Array.isArray(override.removePlugins)) {
        override.removePlugins.forEach((plugin) => changePlugin(config, plugin, () => undefined));
      }

      if ('plugins' in override && Array.isArray(override.plugins)) {
        config.plugins.push(...override.plugins);
      }

      if ('change' in override && typeof override.change === 'function') {
        config = override.change(config);
      }
    }

    return config;
  };
};
