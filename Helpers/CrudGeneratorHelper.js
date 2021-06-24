const fs = require('fs');
const _ = require('lodash');
let Helpers = use('Helpers');
const pluralize = require('pluralize');

const {
    pascalCase,
    camelCase,
    getTableColumnsAndTypes,
    validateConnection
} = require('../Helpers/DatabaseHelper');

async function addServices({vm, serviceFolder, columnTypes, modelFolder, plural, pascalName}) {

    /*Table Columns*/
    let filteredColumns = [];
    // get all columns except primary
    Object.keys(columnTypes).forEach(columnName => {
        if (!columnTypes[columnName].primary) {
            if (!['created_at', 'updated_at', 'created_by', 'updated_by'].includes(columnName))
                filteredColumns.push(columnName);
        }
    });

    // Services Templates folder
    let createServiceFile = `${__dirname}/../templates/crud/service.create`;
    let destroyServiceFile = `${__dirname}/../templates/crud/service.destroy`;
    let listServiceFile = `${__dirname}/../templates/crud/service.list`;
    let showServiceFile = `${__dirname}/../templates/crud/service.show`;
    let updateServiceFile = `${__dirname}/../templates/crud/service.update`;

    /*Create folder if not exist*/
    if (!fs.existsSync(Helpers.appRoot(`app/Services/${serviceFolder}`))) {
        await fs.mkdirSync(Helpers.appRoot(`app/Services/${serviceFolder}`), {recursive: true});
        let data;

        /*Save contents*/
        // Service create
        let serviceCreate = Helpers.appRoot(`app/Services/${serviceFolder}/create.js`);
        data = await fs.readFileSync(createServiceFile);
        data = data.toString()
            .replace(new RegExp('{{modelFolder}}', 'g'), modelFolder)
            .replace(new RegExp('{{filteredColumns}}', 'g'), `['${filteredColumns.join("','")}']`)
            .replace(new RegExp('{{pascalName}}', 'g'), pascalName)
            .replace(new RegExp('{{uppercase}}', 'g'), pascalName.toUpperCase())
        await fs.writeFileSync(serviceCreate, data);

        // Service destroy
        let serviceDestroy = Helpers.appRoot(`app/Services/${serviceFolder}/destroy.js`);
        data = await fs.readFileSync(destroyServiceFile);
        data = data.toString()
            .replace(new RegExp('{{modelFolder}}', 'g'), modelFolder)
            .replace(new RegExp('{{pascalName}}', 'g'), pascalName)
            .replace(new RegExp('{{uppercase}}', 'g'), pascalName.toUpperCase())
        await fs.writeFileSync(serviceDestroy, data);

        // Service list
        let serviceList = Helpers.appRoot(`app/Services/${serviceFolder}/list.js`);
        data = await fs.readFileSync(listServiceFile);
        data = data.toString()
            .replace(new RegExp('{{modelFolder}}', 'g'), modelFolder)
            .replace(new RegExp('{{pascalName}}', 'g'), pascalName)
        await fs.writeFileSync(serviceList, data);

        // Service show
        let serviceShow = Helpers.appRoot(`app/Services/${serviceFolder}/show.js`);
        data = await fs.readFileSync(showServiceFile);
        data = data.toString()
            .replace(new RegExp('{{modelFolder}}', 'g'), modelFolder)
            .replace(new RegExp('{{pascalName}}', 'g'), pascalName)
            .replace(new RegExp('{{uppercase}}', 'g'), pascalName.toUpperCase())
        await fs.writeFileSync(serviceShow, data);

        // Service update
        let serviceUpdate = Helpers.appRoot(`app/Services/${serviceFolder}/update.js`);
        data = await fs.readFileSync(updateServiceFile);
        data = data.toString()
            .replace(new RegExp('{{modelFolder}}', 'g'), modelFolder)
            .replace(new RegExp('{{filteredColumns}}', 'g'), `['${filteredColumns.join("','")}']`)
            .replace(new RegExp('{{pascalName}}', 'g'), pascalName)
            .replace(new RegExp('{{uppercase}}', 'g'), pascalName.toUpperCase())
        await fs.writeFileSync(serviceUpdate, data);
    }

    /*If folder exist*/
    else {
        vm.error(`Services/${serviceFolder} already exist!`);
        process.exit()
    }

    vm.info(`${vm.icon("success")} Add services`);
    return true

}

async function addRoutes({vm, folder, singular, plural, pascalName}) {

    // Route Table folder
    let routeFolder = await vm.ask(`Enter routes folder (eg: auth) : `);
    let routeFile = (`${__dirname}/../templates/crud/route`)

    //Middleware name
    let middleware = await vm.ask(`Enter middleware name (eg: auth) : `);

    /*Create folder if not exist*/
    if (!fs.existsSync(Helpers.appRoot(`start/routes/${routeFolder}`))) {
        await fs.mkdirSync(Helpers.appRoot(`start/routes/${routeFolder}`), {recursive: true});

        // Create route table index and contents
        let index = Helpers.appRoot(`start/routes/${routeFolder}/index.js`)
        await fs.writeFileSync(index, `require('./routes.${plural}')\n`);

        // Create route table and contents
        let route = Helpers.appRoot(`start/routes/${routeFolder}/routes.${plural}.js`)
        let data = await fs.readFileSync(routeFile, 'utf8');
        data = data.toString()
            .replace(new RegExp('{{group}}', 'g'), plural.toUpperCase())
            .replace(new RegExp('{{middleware}}', 'g'), middleware)
            .replace(new RegExp('{{plural}}', 'g'), plural)
            .replace(new RegExp('{{singular}}', 'g'), singular)
            .replace(new RegExp('{{controllerFolder}}', 'g'), folder)
            .replace(new RegExp('{{pascalName}}', 'g'), pascalName)
        await fs.writeFileSync(route, data);

        // Update Routes index contents
        return await updateRoutesIndexContent(vm, routeFolder);
    }

    /*If folder exist*/
    else {

        // If route table file exist
        if (fs.existsSync(Helpers.appRoot(`start/routes/${routeFolder}/routes.${plural}.js`))) {
            vm.error(`start/routes/${routeFolder}/routes.${plural}.js already exist!`);
            process.exit();
        } else {

            // update route table index contents
            let routeIndex = Helpers.appRoot(`start/routes/${routeFolder}/index.js`)
            await fs.appendFileSync(routeIndex, `require('./routes.${plural}')\n`);

            // Create route and contents
            let route = Helpers.appRoot(`start/routes/${routeFolder}/routes.${plural}.js`)
            let data = await fs.readFileSync(routeFile);
            data = data.toString()
                .replace(new RegExp('{{group}}', 'g'), plural.toUpperCase())
                .replace(new RegExp('{{plural}}', 'g'), plural)
                .replace(new RegExp('{{middleware}}', 'g'), middleware)
                .replace(new RegExp('{{singular}}', 'g'), singular)
                .replace(new RegExp('{{controllerFolder}}', 'g'), folder)
                .replace(new RegExp('{{pascalName}}', 'g'), pascalName)
            await fs.writeFileSync(route, data);

            // Update Routes index contents
            return await updateRoutesIndexContent(vm, routeFolder)
        }

    }
}

async function addModel({vm, folder, columnTypes, singular, tableName, pascalName}) {
    let modelFile = `${__dirname}/../templates/crud/model`
    let data = await fs.readFileSync(modelFile);

    /*Create Directory if not exist*/
    if (!fs.existsSync(Helpers.appRoot(`app/Models/${folder}`))) {
        await fs.mkdirSync(Helpers.appRoot(`app/Models/${folder}`), {recursive: true});
    }

    if (fs.existsSync(Helpers.appRoot(`app/Models/${folder + '/' + pascalName}.js`))) {
        vm.error(`app/Models/${folder + '/' + pascalName}.js already exist!`);
        process.exit();
    }

    data = await generateModelString(data, {columnTypes, singular, tableName, pascalName});
    await fs.writeFileSync(Helpers.appRoot(`app/Models/${folder + '/' + pascalName}.js`), data);
    vm.info(`${vm.icon("success")} Generate model data`);
    return true;
}

async function generateModelString(data, {columnTypes, tableName, pascalName}) {

    let columns = Object.keys(columnTypes);

    let primary = {};
    let dates = [];
    let dateCast = '';
    let dateFormat = '';
    let relationships = '';
    let hooks = '';
    let hash = '';
    let relationshipArray = [];
    let hidden = [];

    Object.keys(columnTypes).forEach(columnName => {
        let column = columnTypes[columnName];

        if (column.primary) {
            primary = column;
            primary.name = columnName;
        } else if (columnName === 'password') {
            hidden.push(columnName);
            hash = `const Hash = use('Hash')`;
            hooks += `
    this.addHook('beforeCreate', async (modelInstance) => {
      modelInstance.password = await Hash.make(modelInstance.password)
    });
 `;
        } else if (column.primary_table && column.primary_column && column.relation_name) {
            let pascal = pascalCase(pluralize.singular(column.primary_table));
            let camel = camelCase(pluralize.singular(column.relation_name));

            relationshipArray.push(camel);
            relationships += `
  ${camel}() {
     return this.belongsTo("${column.primary_table}", "${column.primary_column}", "${columnName}");
  }
`;
        }
    });

    data = data.toString()
        .replace(new RegExp('{{pascalName}}', 'g'), pascalName)
        .replace(new RegExp('{{tableName}}', 'g'), tableName)
        .replace('{{createdAt}}', columns.find(s => s === 'created_at') ? "'created_at'" : null)
        .replace('{{updatedAt}}', columns.find(s => s === 'updated_at') ? "'updated_at'" : null)
        .replace('{{primaryColumn}}', primary ? primary['name'] : null)
        .replace('{{autoIncrement}}', primary ? !!primary['autoincrement'] : false)
        .replace('{{dates}}', dates.length ? `[\n   '${dates.join("',\n    '")}'\n]` : '[]')
        .replace('{{dateFormat}}', dateFormat)
        .replace('{{dateCast}}', dateCast)
        .replace('{{relationships}}', relationships)
        .replace('{{relationshipArray}}', relationshipArray.length ? `['${relationshipArray.join("','")}']` : '[]')
        .replace('{{hiddenColumns}}', hidden.length ? `[\n    '${hidden.join(`',\n    '`)}'\n]` : '[]')
        .replace('{{hooks}}', hooks)
        .replace('{{hash}}', hash);
    return data;

}

async function updateRoutesIndexContent(vm, routeFolder) {
    // Update Routes index contents
    let index = Helpers.appRoot(`start/routes/index.js`)
    let data = `require('./${routeFolder}/index')\n`;
    const file = await fs.readFileSync(index, 'utf8');
    if (!file.includes(data)) {
        await fs.appendFileSync(index, data);
        vm.info(`routes.${routeFolder} added to routes/index.js`);
    }
    vm.info(`${vm.icon("success")} Add routes`);
    return true
}

async function addController({
                                 vm,
                                 folder,
                                 columnTypes,
                                 modelFolder,
                                 singular,
                                 plural,
                                 pascalName,
                                 serviceFolder,
                                 tableName
                             }) {

    let data = await fs.readFileSync(`${__dirname}/../templates/crud/controller`);

    /*Create Directory if not exist*/
    if (!fs.existsSync(Helpers.appRoot(`app/Controllers/Http/${folder}`))) {
        await fs.mkdirSync(Helpers.appRoot(`app/Controllers/Http/${folder}`), {recursive: true});
    }

    /*Create controller*/
    let controllerPath = Helpers.appRoot(`app/Controllers/Http/${folder + '/' + pascalName}Controller.js`);
    if (fs.existsSync(controllerPath)) {
        vm.error(`app/Controllers/Http/${folder + '/' + pascalName}Controller.js already exist!`);
        process.exit();
    }

    data = await generateControllerString(data, {
        vm,
        columnTypes,
        singular,
        modelFolder,
        serviceFolder,
        tableName,
        pascalName,
        plural
    });
    await fs.writeFileSync(controllerPath, data);
    return true;
}

async function generateControllerString(data, {
    vm,
    columnTypes,
    singular,
    serviceFolder,
    modelFolder,
    tableName,
    pascalName,
    plural
}) {
    /*Table Columns*/
    let filteredColumns = [];
    // get all columns except primary
    Object.keys(columnTypes).forEach(columnName => {
        if (!columnTypes[columnName].primary) {
            if (!['created_at', 'updated_at'].includes(columnName))
                filteredColumns.push(columnName);
        }
    });

    let parameters = '';
    filteredColumns.forEach(column => {
        parameters = parameters.concat(
            `   \n*       - name: ${column}
   *         in: formData
   *         type: ${columnTypes[column].type}`)
    });

    vm.info(`${vm.icon("success")} Generate controller data`);
    data = data.toString()
        .replace(new RegExp('{{serviceFolder}}', 'g'), serviceFolder)
        .replace(new RegExp('{{modelFolder}}', 'g'), modelFolder)
        .replace(new RegExp('{{singular}}', 'g'), singular)
        .replace(new RegExp('{{plural}}', 'g'), plural)
        .replace(new RegExp('{{group}}', 'g'), plural.toUpperCase())
        .replace(new RegExp('{{pascalName}}', 'g'), pascalName)
        .replace(new RegExp('{{parameters}}', 'g'), parameters)
    return data;
}

module.exports = {
    addServices,
    addRoutes,
    addModel,
    addController
};
