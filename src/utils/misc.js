#!/usr/bin/env node
const fs = require('fs');
const Engine = require('velocity').Engine
const path = require('path');
const YAML = require('yamljs');

const generate = (template, context, output) => {
   // console.info(template,context,output);
    const cfg = {template,context,output};
    const engine = new Engine(cfg);
    const result = engine.render(cfg.context);
    console.info(`generated file ${output}`)
}

function createCode(root, context, templateDir) {
    const index = path.join(templateDir, 'index.yaml');
    const config = YAML.load(index);
    Object.keys(config.scope).map(scopeName => {
      const gen = scopeGenerator(scopeName, root, context, templateDir);
      Object.keys(config.scope[scopeName]).map(outputFile => {
        const inputFile = config.scope[scopeName][outputFile];
        gen(inputFile, path.join(root, scopeName, outputFile));
  
      })
    })
  }
  
  function createDir(target) {
    if (!fs.existsSync(target, { recursive: true })) fs.mkdirSync(target);
  }
  
  function scopeGenerator(scope, root, jsSchema, templateDir) {
    const target = path.join(root, scope);
    createDir(target);
  
    let ret = (fileIn, fileOut) => {
      const actualFileIn = path.join(templateDir, '', fileIn);
      createDir(path.dirname(fileOut));
      generate(actualFileIn, jsSchema, fileOut);
    }
  
    ret.target = target;
    return ret;
  }


module.exports = {
    generate,
    createCode,
    createDir,
    scopeGenerator
};
