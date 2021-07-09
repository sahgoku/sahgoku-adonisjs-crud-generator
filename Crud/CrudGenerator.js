'use strict'

const {Command} = require('@adonisjs/ace');
const Config = use('Config');
const {
    pascalCase,
    camelCase,
    getTableColumnsAndTypes,
    validateConnection
} = require('../Helpers/DatabaseHelper');
const {addServices, addController, addModel, addRoutes} = require('../Helpers/CrudGeneratorHelper')
const fs = require('fs');
const tableColumns = getTableColumnsAndTypes();
const pluralize = require('pluralize');

class CrudGeneratorCommand extends Command {
    static get signature() {
        return `crud:generate
            { table: Table to generate model/controller/routes/services }
            {--connection=@value: Specify custom DB connection to use }
            `;
    }

    static get description() {
        return 'Generate controller/routes/services for a table'
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
        let modelFolder;
        let vm = this;

        //Model Folder
        let model = await this.confirm(`Have you an existing model for "${pascalName}" table ?`);
        if (!model) {
            modelFolder = await this.ask(`Enter model folder (eg: auth) : `);
            await addModel({vm, folder: modelFolder, columnTypes, singular, tableName, pascalName})
        } else
            //Enter Model Folder
            modelFolder = await this.ask(`Enter model folder (eg: auth) : `);

        //Enter Services Folder
        let serviceFolder = await vm.ask(`Enter services folder (eg: auth/${pascalName}) : `);

        //Enter Controller Folder
        let folder = await this.ask(`Enter controller folder (eg: auth) : `);
        await addController({
            vm,
            folder,
            columnTypes,
            modelFolder,
            singular,
            plural,
            pascalName,
            serviceFolder,
            tableName
        });
        await addServices({vm, columnTypes, serviceFolder, modelFolder, singular, plural, pascalName});
        await addRoutes({vm, folder, columnTypes, singular, plural, pascalName});
        process.exit();
    }
}

module.exports = CrudGeneratorCommand;
