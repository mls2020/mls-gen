#!/usr/bin/env node

const YAML = require('yamljs');
const fs = require('fs');
const mysqlProcess = require('../plugins/mysql');

const transformConfig = (fileIn, fileOut) => {

    var cfg = YAML.load(fileIn);

    //bump version
    const v = cfg.version.split('.');
    cfg.version = v[0] + '.' + v[1] + '.' + (parseInt(v[2]) + 1).toString();
    yamlString = YAML.stringify(cfg, 10, 2);
    fs.writeFileSync(fileIn, yamlString);

    // Process Plugins
    let plugins = {};
    (cfg.plugins || []).forEach(plugin => {
        if (plugin.toLowerCase() === 'mysql') {
            plugins = { ...plugins, ...mysqlProcess(cfg) }
        }
    });

    const { name, version, template, ...rest } = cfg;
    var newConfig = {
        name,
        version,
        template,
        major: version.split('.')[0],
        ...rest,
        ...plugins
    }

    var newConfigBody = "module.exports = " + JSON.stringify(newConfig, null, 2);
    fs.writeFileSync(fileOut, newConfigBody);

    console.info(`Created json schema from ${fileIn} to ${fileOut}`);
    return {
        name: cfg.name,
        template: cfg.template
    };
}

module.exports = transformConfig;