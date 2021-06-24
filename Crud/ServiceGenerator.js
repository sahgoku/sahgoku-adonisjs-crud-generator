'use strict'

const {Command} = require('@adonisjs/ace');
const {
  pascalCase,
  camelCase,
  getTableColumnsAndTypes,
  validateConnection
} = require('../Helpers/DatabaseHelper');
const {addServices} = require('../Helpers/CrudGeneratorHelper')
const fs = require('fs');
const tableColumns = getTableColumnsAndTypes();
const pluralize = require('pluralize');

class RouteGeneratorCommand extends Command {
  static get signature() {
    return `crud:service
            { table: Table to generate services }
            {--connection=@value: Specify custom DB connection to use }
            `;
  }

  static get description() {
    return 'Generate services for a table'
  }

  async handle(args, options) {

    if (options.connection) {
      await validateConnection(options.connection);
    }

    let tableName = args.table.toLowerCase();
    const columnTypes = await tableColumns(tableName, options.connection);
    let singular = pluralize.singular(tableName);
    let plural = pluralize.plural(tableName);
    let pascalName = pascalCase(singular);
    let vm = this;

    //Enter Model Folder
    let modelFolder = await this.ask(`Enter model folder (eg: auth) : `);

    //Enter Services Folder
    let serviceFolder = await vm.ask(`Enter services folder (eg: auth/Permission) : `);

    await addServices({vm, columnTypes, serviceFolder, modelFolder, singular, plural, pascalName});
    process.exit();
  }
}

module.exports = RouteGeneratorCommand;
