const check = (searchedValue, text) => {
    if (text.toLowerCase().indexOf(searchedValue.toLowerCase()) > -1) {
        return searchedValue;
    }
}
const fieldType = (value) => {
    return check('number', value)
        || check('string', value)
        || check('boolean', value);
}
const mapField = (fields) => {
    if (!fields) return [];

    return Object.keys(fields).map(k => {
        return {
            name: k,
            type: fieldType(fields[k]),
            autoincrement: check('autoincrement', fields[k]) ? true : undefined,
            primary: check('primary', fields[k]) ? true : undefined,
            notnull: check('notnull', fields[k]) ? true : undefined
        }
    });
}
const mapProcedures = (procedures) => {
    return Object.keys(procedures).map(k => {
        return {
            name: k,
            inherit: procedures[k].inherit,
            parameters: mapField(procedures[k].parameters),
            mandatoryParameters: mapField(procedures[k].parameters).filter(c => c.notnull),
            columns: mapField(procedures[k].columns)
        }
    });
}
const processJoin = (join, cfg, tableName) => {
    if (!join) return undefined;
    return Object.keys(join).map(k => {
        const obj = join[k];
        const table = obj.table || k;
        const requestedFields = obj.fields.split(' ');
        const columns = mapField(cfg.tables[table].columns);
        //  console.log("TABLE:" + tableName,columns);
        //  console.log("REQUESTED:", requestedFields);

        return {
            name: k,
            table,
            clause: tableName + '.' + obj.fk + ' = ' + k + '.' + columns.filter(f => f.primary)[0].name,
            columns: columns.filter(c => requestedFields.filter(n => n == c.name).length > 0)
            /*                    .columns
                                .map(mapField) */
        }
    });
}
const mapTables = (tables, cfg) => {
    return Object.keys(tables).map(k => {
        const columns = mapField(tables[k].columns);
        const keys = columns.filter(c => c.primary);
        if (keys.length != 1) {
            throw Error(`table ${k} has ${keys.length} primary keys, tables must have only one primary key`);
        }

        let ret = {
            name: k,
            columns,
            join: processJoin(tables[k].join, cfg, k),
            keyName: keys[0].name,
            keyType: keys[0].type,
            mandatoryFields: columns.filter(c => c.notnull).map(c => c.name),
            insertFieldList: columns.filter(c => !c.primary && !c.autoincrement).map(f => f.name).join(','),
            insertFieldListValues: columns.filter(c => !c.primary && !c.autoincrement)
                .map(f => f.notnull ? f.name : `${f.name} || null`)
                .join(','),
            insertArgsPlaceholder: columns.filter(c => !c.primary && !c.autoincrement).map(f => '?').join(','),
            sort: tables[k].sort
        }
        let selFields = ret.columns.map(c => k + '.' + c.name);
        if (ret.join) {
            ret.join.forEach(j => {
                selFields = selFields.concat(j.columns.map(c => j.name + '.' + c.name + ' as ' + j.name + '_' + c.name));
            });
        }
        ret.selectFields = selFields.join(',');
        return ret;
    });
}



const processConfig = (cfg) => {
    return {
        /*
        user: {
            tablename: cfg.user.tablename,
            config: mapField(cfg.user.config)
        },
        */
        tables: mapTables(cfg.tables, cfg),
        procedures: mapProcedures(cfg.procedures)
    }
}

module.exports = processConfig