/**
 * from official documentation
 */
const { LogicalException } = require('@adonisjs/generic-exceptions')

/**
 * @constructor
 * @param {string} message - Exception message.
 * @param {string} status - Http status code.
 * @param {string} code - String status code exception.
 * @param {Array}  - String status code exception.
 */
class CustomException extends LogicalException {
  stack;
  constructor(message,status,code,stack) {
    super(message,status,code);
    this.stack = stack;
  }
}

/**
 *
 * @type {CustomException}
 */
module.exports = CustomException
