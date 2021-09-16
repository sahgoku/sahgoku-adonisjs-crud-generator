# AdonisJS CRUD Generator
[![Ask](https://img.shields.io/badge/Ask%20me-anything-1abc9c.svg)](mailto:contact@jauressah.com)
[![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?&logo=telegram)](https://t.me/anikicommunity)
[![Donate](https://img.shields.io/badge/Donate-Beer-green.svg)](http://www.buymeacoffee.com/sahgoku)
[![Downloads](https://img.shields.io/npm/dt/@sahgoku/adonisjs-crud-generator)]()
[![Github](https://img.shields.io/badge/GitHub-100000?&logo=github&logoColor=white)](https://github.com/sahgoku/sahgoku-adonisjs-crud-generator)

**Hello, I hope this is useful for your projects. I need your [feedback](mailto:contact@jauressah.com) to improve the tool. Thank you.**


This package allows you to easily generate essential files for making CRUD with a database table using legacy version
of [AdonisJS](https://legacy.adonisjs.com) app. The package generates the following:

- Routes
- Controllers
- Models
- Services

## Currently Supported

[comment]: <> (- PostgreSQL, MySQL)

![](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![](https://img.shields.io/badge/MySQL-FFB830?style=for-the-badge&logo=mysql&logoColor=black)

## Installation

You can install the package via `npm`:

``` bash
npm install @sahgoku/adonisjs-crud-generator
```

`yarn`:

``` bash
yarn add @sahgoku/adonisjs-crud-generator
```

## Setup

- In `start/app.js`, add the following to `commands` array:

```
  '@sahgoku/adonisjs-crud-generator/Crud/CrudGenerator',
  '@sahgoku/adonisjs-crud-generator/Crud/ModelGenerator',
  '@sahgoku/adonisjs-crud-generator/Crud/RouteGenerator',
  '@sahgoku/adonisjs-crud-generator/Crud/ControllerGenerator',
  '@sahgoku/adonisjs-crud-generator/Crud/ServiceGenerator',
```

- In `start/app.js`, add the following to `aliases` object:

```
  ControllerHelper: '@sahgoku/adonisjs-crud-generator/Helpers/ControllerHelper',
  SearchFilterHelper: '@sahgoku/adonisjs-crud-generator/Helpers/SearchFilterHelper',
  CustomException: '@sahgoku/adonisjs-crud-generator/Helpers/CustomException',
```

## Usage

To generate CRUD for **existing** table `roles`, run `adonis crud:generate roles` and follow the instructions. The
following will be created :

- Controller `app/Controllers/Http/RoleController`.
- `start/routes.js` file will be updated with new routes.
- `Role` model will be created with appropriate relationships. The corresponding linked models will be updated with the
  new relationships.
- `Role` services will be created.

![](https://www.jauressah.com/wp-content/uploads/2021/06/render1624560390499.gif)

## Services

*Request Body*: 

```
{
  "populates" : ['permissions'], 
  "filter" : {"type":"operator","operand":"and","value":[{"type":"condition","value":5,"field":"id","operand":"equal"}, {"type":"condition","value":6,"field":"id","operand":"equal"}]}
  "pagination": {"sortBy":"id", "descending":true, "page":1, "rowsPerPage":10}, 
  "count" : ['permissions'], 
  "select" : ['name'] 
}
```

- list.js

```
'use strict';
const RoleModel = use("App/Models/auth/Role");
const ControllerHelper = use('ControllerHelper')

class List {

  constructor(transaction, user) {
    this.transaction = transaction;
    this.user = user;
  }

  async execute(payload) {
      let query = RoleModel.query();
      ControllerHelper.populate(query, payload.populates);
      return await ControllerHelper.search(query, payload.pagination, payload.filter, payload.count, payload.select);
    }
}

module.exports = List;
```

- create.js

```
'use strict';
const RoleModel = use("App/Models/auth/Role");
const _ = require('lodash');

class Create {

  constructor(transaction, user) {
    this.transaction = transaction;
    this.user = user;
  }

  async execute(form) {

    return await RoleModel.create({
        ..._.pick(form, ['name','code']),
        created_by: this.user.id,
      },
      this.transaction);
  }
}

module.exports = Create;
```

- update.js

```
'use strict';
const RoleModel = use("App/Models/auth/Role");
const CustomException = use('CustomException')
const _ = require('lodash');

class Update {
  constructor(transaction, user) {
    this.transaction = transaction;
    this.user = user;
  }

  async execute(form) {

    const response = await RoleModel.query(this.transaction)
      .where('id', form.id).first();

    if (!response) throw new CustomException("Role not found", 400, "ROLE_NOT_FOUND")

    response.merge({
      ..._.pick(form, ['name','code']),
      updated_by: this.user.id,
    })
    await response.save(this.transaction);
    return response;
  }

}

module.exports = Update;
```

- show.js

```
'use strict';
const RoleModel = use("App/Models/auth/Role");
const CustomException = use('CustomException')
const ControllerHelper = use('ControllerHelper')

class Show {

  constructor(transaction, user) {
    this.transaction = transaction;
    this.user = user;
  }

  async execute(form) {
    const query = RoleModel
      .query(this.transaction)
      .where('id', form.id)

       let response = await ControllerHelper
            .populate(query, form.populates)
            .first();

    if (!response) {
      throw new CustomException("Role not found", 400, "ROLE_NOT_FOUND")
    }
    return response;
  }
}

module.exports = Show;
```

- destroy.js

```
'use strict';
const RoleModel = use("App/Models/auth/Role");
const CustomException = use('CustomException')

class Destroy {

  constructor(transaction, user) {
    this.transaction = transaction;
    this.user = user;
  }

  async execute(form) {
    const response = await RoleModel.query(this.transaction).where('id', form.id).first();
    if (!response) throw new CustomException("Role not found", 400, "ROLE_NOT_FOUND")
    await response.delete();
  }
}

module.exports = Destroy;
```

## Available Commands

- `adonis crud:generate tableName`: This run all the below commands.
- `adonis crud:model tableName`: This create model file with relationships.
- `adonis crud:controller tableName`: This create controller file.
- `adonis crud:service tableName`: This create services files.
- `adonis crud:route tableName`: This create route file.

[comment]: <> (## Options)

[comment]: <> (- `--connection`: This option allows you specify which DB connection to use for the command e.g)

[comment]: <> (  `adonis crud:controller tableName --connection=sqlite`)

[comment]: <> (>NB: The connection must have been defined in `config/database.js`)

## Production

Run `npm run build` or `yarn build`

> Note: In running the commands, if you don't have adonis CLI installed globally, you can use `node ace` instead. For example, to generate CRUD for table posts, run `node ace crud:generate posts`

## Donation

If this project help you reduce time to develop, you can give me a beer 🍺 :)

[![Donate](https://img.shields.io/badge/Donate-Beer-green.svg)](http://www.buymeacoffee.com/?via=sahgoku)

## Credits

- [sahgoku](https://github.com/sahgoku)
- Inspired by [@shagital/adonisjs-crud-generator](https://github.com/Shagital/adonisjs-crud-generator)
