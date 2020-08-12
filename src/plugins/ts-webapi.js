


_parseType = type => type === 'date' ? 'MGDate' : type;

const JoiCommands = {
  string: () => ({ fieldType: 'string', swaggerFieldType: 'string' }),
  number: () => ({ fieldType: 'number', swaggerFieldType: 'float' }),
  boolean: () => ({ fieldType: 'boolean', swaggerFieldType: 'boolean' }),
  date: () => ({ fieldType: 'date', swaggerFieldType: 'string' }),
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
    const cmdResult = joiCommand
      ? joiCommand(value)
      : {
        schema: 'schemaFor' + cmd,
        fieldType: cmd,
        swaggerIsRef: true
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
      result: 'Result_' + k,
      definition: k

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
      result: 'Result_' + k,
      definition: k

    }
  })
}
makeCrudList = (crudList) => {
  let ret = []
  Object.keys(crudList).forEach(k => {
    console.log('CRUD',k)
    const item = {};
    const value = crudList[k].toLowerCase();
    if (value.indexOf('get') > -1) {
      item.getById = ({
        verb: 'get',
        routeName: k.toLowerCase(),
        name: `get${k}ById`,
        fnArgsDef: 'id:string',
        param: { fieldName: 'id', fieldType: 'string' },
        result: k,
        definition: k

      })
    }
    if (value.indexOf('list') > -1) {
      item.list = ({
        verb: 'get',
        list: true,
        fnArgsDef: '',
        routeName: k.toLowerCase(),
        name: `list${k}`,
        result: k + "[]",
        definition: k

      })
    }
    if (value.indexOf('post') > -1) {
      item.post = ({
        verb: 'post',
        routeName: k.toLowerCase(),
        fnArgsDef: 'item:' + k,
        name: `create${k}`,
        args: k,
        result: k,
        definition: k

      })
    }
    if (value.indexOf('put') > -1) {
      item.put = ({
        verb: 'put',
        routeName: k.toLowerCase(),
        fnArgsDef: 'id:string, item:' + k,
        name: `update${k}`,
        param: { fieldName: 'id', fieldType: 'string' },
        args: k,
        result: k,
        definition: k

      })
    }
    if (value.indexOf('delete') > -1) {
      item.delete = ({
        verb: 'delete',
        routeName: k.toLowerCase(),
        fnArgsDef: 'id:string',
        name: `delete${k}`,
        param: { fieldName: 'id', fieldType: 'string' },
        result: 'boolean',
        definition: k

      })
    }
    ret.push(item);
  })
  return ret;
}

const processConfig = (cfg) => {
  const ver = 'v' + cfg.version.split('.')[0];
  const apiPrefix = `/api/${ver}`;
  return {
    ver,
    apiPrefix,
    types: makeTypes(cfg),
    crudApi: makeCrudList(cfg.crud),
    selApi: makeList(cfg.selectors),
    procApi: makeProc(cfg.proc),
    selectors: undefined,
    proc: undefined,
    crud: undefined
  }
}

const postProcessing = (cfg) => {
  // Convert swagger.yaml to swagger.json
}

module.exports = processConfig

