# mls-gen
code generator

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
## install globally mls-gen
npm i -g mls-gen

## generate code
mls-gen -s ./schema.yaml -o output 
```
