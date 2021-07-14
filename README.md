# AdonisJS CRUD Generator

[![Ask](https://img.shields.io/badge/Ask%20me-anything-1abc9c.svg)](mailto:contact@jauressah.com)
[![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?&logo=telegram)](https://t.me/anikicommunity)
[![Donate](https://img.shields.io/badge/Donate-Beer-green.svg)](http://www.buymeacoffee.com/sahgoku)
[![Downloads](https://img.shields.io/npm/dt/@sahgoku/adonisjs-crud-generator)]()
[![Github](https://img.shields.io/badge/GitHub-100000?&logo=github&logoColor=white)](https://github.com/sahgoku/sahgoku-adonisjs-crud-generator)

This package allows you to easily generate essential files for making CRUD with a database table using legacy version
of [AdonisJS](https://legacy.adonisjs.com) app. The package generates the following:

- Routes
- Controllers
- Models
- Services

## Currently Supported

[comment]: <> (- MySQL)

![](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![](https://img.shields.io/badge/MySQL-FF7600?style=for-the-badge&logo=mysql&logoColor=white)

[comment]: <> (- SQLite)

## Installation

You can install the package via NPM:

``` bash
npm install @sahgoku/adonisjs-crud-generator
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

To generate CRUD for **existing** table `roles`, run `adonis crud:generate roles` and follow the instructions. The following
will be created :

- Controller `app/Controllers/Http/RoleController`.
- `start/routes.js` file will be updated with new routes.
- `Role` model will be created with appropriate relationships, getters, setters and hooks.
- `Role` services will be created.

![](https://www.jauressah.com/wp-content/uploads/2021/06/render1624560390499.gif)

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
