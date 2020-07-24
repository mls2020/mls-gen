# mls-gen
_code generator_

[![npm version](https://img.shields.io/npm/v/mlsgen.svg?style=flat)](https://www.npmjs.com/package/redux-helper) [![build](https://travis-ci.org/vgmr/mlsgen.svg)](https://travis-ci.org/vgmr/redux-helper) 

[![dependency](https://david-dm.org/vgmr/mlsgen/status.svg)](https://david-dm.org/vgmr/redux-helper) [![devDep](https://david-dm.org/vgmr/mlsgen/dev-status.svg)](https://david-dm.org/vgmr/redux-helper?type=dev)


# available templates
- https://github.com/mls2020/generator-pasv9

# quick start
create a yaml file in your project 
```yaml
## schema.yaml

name: "mysql-sample"
version: 1.0.0
template: 'https://github.com/mls2020/generator-mysql-ts.git'
plugins:
  - mysql
user:
  tablename: user
  config:
    ssn: string
tables:
  book: 
    columns:
      id: autoincrement primary number notnull
      title: notnull string
procedures:
  get_book_by_id: 
    parameters:
      id: int notnull
    columns:
      id: autoincrement primary number notnull
      title: notnull string
```
in this example we are using the [https://github.com/mls2020/generator-pasv9] template which will create a typescript application (web api, rest client and redux client) that will map its api to a mysql database that have:
- a book table
- a user table
- a get_book_by_id stored procedure

## code generation
```bash
## Install globally mls-gen
npm i -g mlsgen

## Generate code
mlsgen -s ./schema.yaml -o output 
```
