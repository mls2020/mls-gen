


_parseType = type => type === 'date' ? 'MGDate' : type;

const JoiCommands = {
  string: () => ({ fieldType: 'string' }),
  number: () => ({ fieldType: 'number' }),
  boolean: () => ({ fieldType: 'boolean' }),
  date: () => ({ fieldType: 'date' }),
  alphanum: () => ({ alphanum: true }),
  optional: () => ({ required: false }),
  max: v => ({ max: v }),
  min: v => ({ min: v }),
}

parseType = type => {
  let returnValue = {
    required: true
  }
  const tokens = type.split(' ');
  tokens.forEach(token => {
    const [cmd, value] = token.split(':');
    const joiCommand = JoiCommands[cmd.toLowerCase()];
    const cmdResult = joiCommand ? joiCommand(value) : {
      schema: 'schemaFor' + cmd,
      fieldType: cmd
    }
    returnValue = { ...returnValue, ...cmdResult }
  })
  return returnValue;
}


makeFields = fields => typeof (fields) === 'object'
  ? {
    fields: Object.keys(fields).map(k => ({
      fieldName: k,
      type: parseType(fields[k])
    }))
  }
  : { refType: fields };

makeTypes = (cfg) => {
  const types = Object.keys(cfg.types).map(k => {
    return {
      typeName: k,
      ...makeFields(cfg.types[k])
    }
  });
  const proc = Object.keys(cfg.proc).map(k => {
    return {
      typeName: `Args_${k}`,
      ...makeFields(cfg.proc[k].in)
    }
  });
  const procRes = Object.keys(cfg.proc).map(k => {
    return {
      typeName: `Result_${k}`,
      ...makeFields(cfg.proc[k].out)
    }
  });
  const selectors = Object.keys(cfg.selectors).map(k => {
    return {
      typeName: `Args_${k}`,
      ...makeFields(cfg.selectors[k].in)
    }
  });
  const selectorsRes = Object.keys(cfg.selectors).map(k => {
    return {
      typeName: `Result_${k}`,
      ...makeFields(cfg.selectors[k].out)
    }
  });


  return [
    ...types,
    ...proc,
    ...procRes,
    ...selectors,
    ...selectorsRes
  ]
}

makeFnArgs = (fields) => {
  const args = makeFields(fields);
  console.log({ args });
  return args.fields
    ? args.fields.map(i => `${i.fieldName}:${i.fieldType}`).join(',')
    : ''

}
makeList = (selectors) => {
  return Object.keys(selectors).map(k => {
    return {
      verb: 'get',
      name: k,
      routeName: k.toLowerCase(),
      fnArgsDef: 'args: Args_' + k,
      args: makeFields(selectors[k].in),
      result: 'Result_' + k
    }
  })
}
makeProc = (proc) => {
  return Object.keys(proc).map(k => {
    return {
      verb: 'post',
      name: k,
      fnArgsDef: 'args: Args_' + k,
      routeName: k.toLowerCase(),
      args: makeFields(proc[k].in),
      result: 'Result_' + k
    }
  })
}
makeCrudList = (crudList) => {
  let ret = []
  Object.keys(crudList).forEach(k => {
    const value = crudList[k].toLowerCase();
    if (value.indexOf('get') > -1) {
      ret.push({
        verb: 'get',
        routeName: k.toLowerCase(),
        name: `get${k}ById`,
        fnArgsDef: 'id:string',
        param: { fieldName: 'id', fieldType: 'string' },
        result: k
      })
    }
    if (value.indexOf('list') > -1) {
      ret.push({
        verb: 'get',
        list: true,
        fnArgsDef: '',
        routeName: k.toLowerCase(),
        name: `list${k}`,
        result: k + "[]"
      })
    }
    if (value.indexOf('post') > -1) {
      ret.push({
        verb: 'post',
        routeName: k.toLowerCase(),
        fnArgsDef: 'item:' + k,
        name: `create${k}`,
        args: k,
        result: k
      })
    }
    if (value.indexOf('put') > -1) {
      ret.push({
        verb: 'put',
        routeName: k.toLowerCase(),
        fnArgsDef: 'id:string, item:'+k,
        name: `update${k}`,
        param: { fieldName: 'id', fieldType: 'string' },
        args: k,
        result: k
      })
    }
    if (value.indexOf('delete') > -1) {
      ret.push({
        verb: 'delete',
        routeName: k.toLowerCase(),
        fnArgsDef: 'id:string',
        name: `delete${k}`,
        param: { fieldName: 'id', fieldType: 'string' },
        result: 'boolean'
      })
    }
  })
  return ret;
}

const processConfig = (cfg) => {
  return {
    types: makeTypes(cfg),
    api: makeCrudList(cfg.crud),
    selApi: makeList(cfg.selectors),
    procApi: makeProc(cfg.proc),
    selectors: undefined,
    proc: undefined,
    crud: undefined
  }
}

module.exports = processConfig
