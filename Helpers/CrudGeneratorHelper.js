const fs = require('fs');
const _ = require('lodash');
let Helpers = use('Helpers');
const pluralize = require('pluralize');
const {promises: fsp, readdirSync, statSync} = require("fs");
const path = require("path")

const getAllFiles = function (dirPath, arrayOfFiles) {
    let files = readdirSync(dirPath)
    files.forEach(function (file) {
        if (statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
        } else {
            if (!file.match(/([a-zA-Z0-9\s_\\.\-\(\):])+(.js)$/i)) return
            arrayOfFiles.push(path.join(dirPath, "/", file))
        }
    })
    return arrayOfFiles
}

const {
    pascalCase,
    camelCase,
    validateConnection
} = require('../Helpers/DatabaseHelper');

async function addServices({vm, serviceFolder, columnTypes, modelFolder, plural, pascalName}) {

    /*Table Columns*/
    let filteredColumns = [];
    let primary = {};

    // get all columns except primary
    Object.keys(columnTypes).forEach(columnName => {
        if (!columnTypes[columnName].primary) {
            if (!['created_at', 'updated_at', 'created_by', 'updated_by'].includes(columnName))
                filteredColumns.push(columnName);
        }

        if (columnTypes[columnName].primary) {
            primary = columnTypes[columnName];
            primary.name = columnName;
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
            .replaceAll(new RegExp('{{primaryColumn}}', 'g'), _.get(primary, 'name'))
            .replace(new RegExp('{{modelFolder}}', 'g'), modelFolder)
            .replace(new RegExp('{{filteredColumns}}', 'g'), `['${filteredColumns.join("','")}']`)
            .replace(new RegExp('{{pascalName}}', 'g'), pascalName)
            .replace(new RegExp('{{uppercase}}', 'g'), pascalName.toUpperCase())
        await fs.writeFileSync(serviceCreate, data);

        // Service destroy
        let serviceDestroy = Helpers.appRoot(`app/Services/${serviceFolder}/destroy.js`);
        data = await fs.readFileSync(destroyServiceFile);
        data = data.toString()
            .replaceAll(new RegExp('{{primaryColumn}}', 'g'), _.get(primary, 'name'))
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
            .replaceAll(new RegExp('{{primaryColumn}}', 'g'), _.get(primary, 'name'))
            .replace(new RegExp('{{modelFolder}}', 'g'), modelFolder)
            .replace(new RegExp('{{pascalName}}', 'g'), pascalName)
            .replace(new RegExp('{{uppercase}}', 'g'), pascalName.toUpperCase())
        await fs.writeFileSync(serviceShow, data);

        // Service update
        let serviceUpdate = Helpers.appRoot(`app/Services/${serviceFolder}/update.js`);
        data = await fs.readFileSync(updateServiceFile);
        data = data.toString()
            .replaceAll(new RegExp('{{primaryColumn}}', 'g'), _.get(primary, 'name'))
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

async function addRoutes({vm, folder, columnTypes, singular, plural, pascalName}) {

    let primary = {};

    // get primary column
    Object.keys(columnTypes).forEach(columnName => {
        if (columnTypes[columnName].primary) {
            primary = columnTypes[columnName];
            primary.name = columnName;
        }
    });

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
            .replaceAll(new RegExp('{{primaryColumn}}', 'g'), _.get(primary, 'name'))
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
                .replaceAll(new RegExp('{{primaryColumn}}', 'g'), _.get(primary, 'name'))
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

    let modelFolder = `app/Models/${folder + '/' + pascalName}`;
    data = await generateModelString(vm, data, modelFolder, {columnTypes, singular, tableName, pascalName});
    await fs.writeFileSync(Helpers.appRoot(`${modelFolder}.js`), data);
    vm.info(`${vm.icon("success")} Generate model data`);
    return true;
}

async function generateModelString(vm, data, modelFolder, {columnTypes, tableName, pascalName}) {

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

    Object.keys(columnTypes).forEach(async columnName => {
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
     return this.belongsTo("${getModel(vm, column.primary_table)}", "${columnName}", "${column.primary_column}");
  }
`;

            addHasManyRelation(modelFolder, getModel(vm, column.primary_table));

        }
    });

    data = data.toString()
        .replace(new RegExp('{{pascalName}}', 'g'), pascalName)
        .replace(new RegExp('{{tableName}}', 'g'), tableName)
        .replace('{{createdAt}}', columns.find(s => s === 'created_at') ? "'created_at'" : null)
        .replace('{{updatedAt}}', columns.find(s => s === 'updated_at') ? "'updated_at'" : null)
        .replace(new RegExp('{{primaryColumn}}', 'g'), _.get(primary, 'name'))
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

async function addHasManyRelation(relatedModelFolder, folder) {

    let data = await fs.readFileSync(`${Helpers.appRoot(folder)}`).toString();
    let index = str.indexOf("static allowedRelationships")
    // if (index === -1) return
    // console.log({index: index})
}

/*Get Model name for an database table*/
function getModel(vm, table_name) {
    let folder = Helpers.appRoot(`/app/Models`);
    let files = getAllFiles(folder, [])

    if (_.isEmpty(files)) vm.error(`Model folder is empty!`);
    let item = _.find(files, item => require(item).table === table_name);
    if (!item) {
        vm.error(`Model not found for table '${table_name}' !`);
        process.exit();
    }
    return 'App'.concat(item.slice(0, -3).substring(item.indexOf('/Models/')));
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
    let requiredColumns = [];
    let primary = {};

    // get columns except created_at, updated_at
    Object.keys(columnTypes).forEach(columnName => {
        if (!columnTypes[columnName].primary) {
            if (!['created_at', 'updated_at'].includes(columnName))
                filteredColumns.push(columnName);
        }
        //Get primary column
        if (columnTypes[columnName].primary) {
            primary = columnTypes[columnName];
            primary.name = columnName;
        }
        // get required columns
        if (!columnTypes[columnName].primary &&
            !columnTypes[columnName].nullable) {
            requiredColumns.push(columnName);
        }
    });

    /*Required Columns*/
    let rules = 'const rules = {';
    requiredColumns.forEach((column, index) => {
        rules = index !== requiredColumns.length - 1 ?
            rules.concat(`${column}: 'required',`) : rules.concat(`${column}: 'required'`)
    });
    rules = rules.concat('}')

    /*Swagger*/
    //  let parameters = '';
    //  filteredColumns.forEach(column => {
    //      parameters = parameters.concat(
    //          `   \n*       - name: ${column}
    // *         in: formData
    // *         type: ${columnTypes[column].type}`)
    //  });

    vm.info(`${vm.icon("success")} Generate controller data.`);
    data = data.toString()
        .replaceAll(new RegExp('{{primaryColumn}}', 'g'), _.get(primary, 'name'))
        .replace(new RegExp('{{serviceFolder}}', 'g'), serviceFolder)
        .replace(new RegExp('{{modelFolder}}', 'g'), modelFolder)
        .replace(new RegExp('{{singular}}', 'g'), singular)
        .replace(new RegExp('{{plural}}', 'g'), plural)
        .replace(new RegExp('{{group}}', 'g'), plural.toUpperCase())
        .replace(new RegExp('{{pascalName}}', 'g'), pascalName)
        .replace(new RegExp('{{rules}}', 'g'), rules)
    return data;
}

module.exports = {
    addServices,
    addRoutes,
    addModel,
    addController
};
