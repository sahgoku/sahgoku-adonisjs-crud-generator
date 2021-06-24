const {validate} = use('Validator')
/**
 * @type Error
 */
const CustomException = use('CustomException')
const SearchFilterHelper = use('SearchFilterHelper')

class ControllerHelper {
  static getUserEventData (user) {
    return {user_id: user.id, full_name: user.full_name}
  }

  /**
   *
   * @param query
   * @param {Array} params
   * @returns {import(Database)}
   */
  static populate (query, params) {
    if (Array.isArray(params)) {
      params.forEach((row) => query.with(row))
    }
    return query
  }

  /**
   *
   * @param body
   * @param rules
   * @returns {Promise<boolean>,CustomException}
   */
  static async validate (body, rules) {
    const validation = await validate(body, rules)
    if (validation.fails()) {
      console.log('validation errors ', validation.messages())
      throw new CustomException('Invalid form', 400, 'INVALID_INPUTS', validation.messages())
    } else {
      return true
    }
  }

  static async search (query, pagination, filter) {
    filter = typeof filter === 'string' ? JSON.parse(filter) : filter
    pagination = typeof pagination === 'string'
      ? JSON.parse(pagination)
      : Object(pagination)
    SearchFilterHelper.build(query, pagination, filter)
    if (pagination.page) {
      return query.paginate(pagination.page, pagination.rowsPerPage)
    }
    return {data: await query.fetch()}
  }
}

module.exports = ControllerHelper
