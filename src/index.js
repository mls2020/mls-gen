#!/usr/bin/env node

const { createCode, createDir, removeDir } = require('./utils/misc');
const transformConfig = require('./utils/transformConfig');
const program = require('commander');
const fs = require('fs');
const proc = require('child_process');
const path = require('path');
const ver = require('../package.json').version;
const copydir = require('copy-dir');
program
  .version(ver)
  .option('-s, --schema <schema>', 'db schema yaml file')
  .option('-o, --output <output>', 'output folder')
  //  .option('-p, --publish', 'publish to npm')
  .parse(process.argv);
let { schema, output } = program;
output = path.resolve(output);

if (!schema || !output) {
  console.error('wrong schema or output option !!');
  process.exit(20);
}

console.info(`Processing ${schema} to ${output}`);

// Creating target dir
removeDir(output);
createDir(output);

// Create js Schema
const jsSchema = path.join(output, 'schema.js');
const { name, template } = transformConfig(schema, jsSchema);
context = require(jsSchema);

// Load Templates
const templateDir = path.join(output, './___mlsgen-template');
if (template.toLowerCase().startsWith('http://') || template.toLowerCase().startsWith('https://')) {
  console.log('clone template from '+ templateDir)
  proc.execSync(`git clone ${template} ${templateDir}`, {
    cwd: output,
    stdio: 'inherit'
  })
} else {
  console.log('copy template from '+ templateDir)
  copydir.sync(template, templateDir);
}

createCode(output, context, templateDir);

console.info(`Code generated for ${name}`);
removeDir(templateDir);
fs.unlinkSync(jsSchema);

process.exit(0);

