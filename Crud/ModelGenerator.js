'use strict'

const {Command} = require('@adonisjs/ace');
const {
  pascalCase,
  camelCase,
  getTableColumnsAndTypes,
  validateConnection
} = require('../Helpers/DatabaseHelper');
const {addModel} = require('../Helpers/CrudGeneratorHelper')
const tableColumns = getTableColumnsAndTypes();
const pluralize = require('pluralize');

class ModelGeneratorCommand extends Command {
  static get signature() {
    return `crud:model
            { table: Table to generate model and relationships }
            {--connection=@value: Specify custom DB connection to use }
            `;
  }

  static get description() {
    return 'Generate model and relationships for a table';
  }

  async handle(args, options) {
    if (options.connection) {
      validateConnection(options.connection);
    }

    let tableName = args.table.toLowerCase();
    let columnTypes = await tableColumns(tableName, options.connection);

    let singular = pluralize.singular(tableName);
    let pascalName = pascalCase(singular);
    let vm = this;

    //Enter Model Folder
    let folder = await this.ask(`Enter model folder (eg: auth) : `);
    await addModel({vm, folder, columnTypes, singular, tableName, pascalName})
    process.exit();
  }
}

module.exports = ModelGeneratorCommand;
