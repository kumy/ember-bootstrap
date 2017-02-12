/* eslint-env node */
'use strict';

const rsvp = require('rsvp');
const fs = require('fs');
const path = require('path');
const writeFile = rsvp.denodeify(fs.writeFile);
const chalk = require('chalk');

const bs3Version = '^3.3.7';
const bs4Version = 'next';

module.exports = {
  name: 'ember-bootstrap',

  availableOptions: [
    { name: 'bootstrap-version', type: Number, default: 3 }
  ],

  normalizeEntityName() {
  },

  afterInstall(options) {
    return this.addDependencies(options)
      .then(() => this.addPreprocessorImport())
      .then(() => this.addBuildConfiguration(options));
  },

  addDependencies(options) {
    let dependencies = this.project.dependencies();

    if (options.bootstrapVersion === 4) {
      return this.addPackageToProject('bootstrap', bs4Version);
    }

    if ('ember-cli-sass' in dependencies) {
      return this.addPackageToProject('bootstrap-sass', bs3Version);
    }

    return this.addBowerPackageToProject('bootstrap', bs3Version);
  },

  addPreprocessorImport() {
    let dependencies = this.project.dependencies();
    let type;
    let importStatement = '\n@import "ember-bootstrap/bootstrap";\n';

    if ('ember-cli-sass' in dependencies) {
      type = 'scss';
    } else if ('ember-cli-less' in dependencies) {
      type = 'less';
    }

    if (type) {
      let stylePath = path.join('app', 'styles');
      let file = path.join(stylePath, `app.${type}`);

      if (!fs.existsSync(stylePath)) {
        fs.mkdirSync(stylePath);
      }
      if (fs.existsSync(file)) {
        this.ui.writeLine(chalk.green(`Added import statement to ${file}`));
        return this.insertIntoFile(file, importStatement, {});
      } else {
        this.ui.writeLine(chalk.green(`Created ${file}`));
        return writeFile(file, importStatement);
      }
    }
  },

  addBuildConfiguration(options) {
    let file = 'ember-cli-build.js';
    let includeFonts = options.bootstrapVersion === 3;
    let config = `
        'ember-bootstrap': {
            importBootstrapTheme: false,
            importBootstrapCSS: true,
            importBootstrapFont: ${includeFonts},
            bootstrapVersion: ${options.bootstrapVersion}
        },`;

    if (fs.existsSync(file)) {
      this.ui.writeLine(chalk.green(`Added ember-bootstrap configuration to ${file}`));
      return this.insertIntoFile(file, config, { after: 'new EmberApp(defaults, {' });
    } else {
      this.ui.writeLine(chalk.red(`Could not find ${file} to modify.`));
    }
  }
};
