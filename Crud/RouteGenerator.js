'use strict'

const {Command} = require('@adonisjs/ace');
const {
    pascalCase,
    camelCase,
    getTableColumnsAndTypes,
    validateConnection
} = require('../Helpers/DatabaseHelper');
const {addRoutes} = require('../Helpers/CrudGeneratorHelper')
const tableColumns = getTableColumnsAndTypes();
const pluralize = require('pluralize');

class RouteGeneratorCommand extends Command {
    static get signature() {
        return `crud:route
            { table: Table to generate route }
            {--connection=@value: Specify custom DB connection to use }
            `;
    }

    static get description() {
        return 'Generate routes for a table'
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

        //Enter Controller Folder
        let folder = await this.ask(`Enter controller folder (eg: auth) : `);
        await addRoutes({vm, folder, columnTypes, singular, plural, pascalName});
        process.exit();

    }

}

module.exports = RouteGeneratorCommand;
