const _ = require('lodash')

/**
 * @class
 *  {
        "type":"operator",
        "operand": "and",// and || or
        "value": [
            {
                "type":"condition",
                "field": "first_name",
                "operand": "",
                "value":"jean"
            },
            {
                "type": "condition",
                "field": "last_name",
                "operand": "contains",
                "value": "DOGLASE"
            }
        ]
    }
 */
class SearchFilterHelper {
    whereBuilder(query, operator) {
        let isCalledFirstWhere = false
        let counter = 0
        return (suffix = '', ...arg) => {
            console.log('whereBuilderOperator', arg, operator, isCalledFirstWhere, ++counter)
            if (!isCalledFirstWhere) {
                isCalledFirstWhere = true
                return query['where' + _.capitalize(suffix)](...arg)
            }
            if ((suffix || '').toLowerCase() === 'has') {
                return query[this.getMethod(operator)]((qb) => qb[this.getMethod('') + _.capitalize(suffix)](...arg))
            }
            // console.log('Method', this.getMethod(operator) + _.capitalize(suffix))
            return query[this.getMethod(operator) + _.capitalize(suffix)](...arg)
        }

    }

    static build({query, pagination, filter, count, select}) {
        const search = new SearchFilterHelper()
        search.compose(query, filter, count, select, Object(pagination))
    }

    compose(query, filter, count, select, pagination) {
        if (Object(filter) === filter) this.builder(this.whereBuilder(query, filter.operand), filter);

        if (pagination && pagination.sortBy && !this.isDeep(pagination.sortBy)) {
            query.clearOrder();
            query.orderBy(pagination.sortBy, pagination.descending ? 'DESC' : 'ASC')
        }
        if (select) {
            query.select(select)
        }
        if (count) {
            for (let relation of count) query.withCount(`${relation} as size_${relation}`)
        }
        return query
    }

    builder(where, filter) {
        switch (filter.type) {
            case 'operator':
                where('', (builder) => {
                    const _where = this.whereBuilder(builder, filter.operand)
                    Array
                        .from(filter.value)
                        .forEach((row) => {
                            this.builder(_where, row)
                        })
                })
                break
            case 'condition':
                const value = this.getValue(filter.operand, filter.value)
                //if (!value) break
                const descriptor = this.getAccessor(filter.field)
                const operand = this.getOperator(filter.operand)
                if (descriptor.relation) {
                    where('has', descriptor.relation, (builder) => {
                        builder.where(descriptor.name, operand, value)
                    }, '>=', 1)
                } else if (_.isNull(value)) {

                    where(operand === '=' ? 'Null' : 'NotNull', descriptor.name, operand);
                } else if (['Null', 'NotNull'].includes(operand)) {
                    where(operand, descriptor.name, operand)
                } else {
                    where('', descriptor.name, operand, value)
                }
                break
        }
    }

    isDeep(field) {
        return /\./.test(field)
    }

    getOperator(operand) {
        switch (operand) {
            case 'in':
                return 'between'

            case 'neq':
            case 'ne':
            case 'not-equal':
            case '!=':
                return '<>'

            case 'eq':
            case 'equals':
            case 'equal':
            case '=':
                return '='

            case 'like':
            case '%':
            case 'contains':
            case 'start':
            case 'end':
                return 'ilike';
            case 'not_contains':
            case 'not-contains':
                return 'not ilike';
            case 'lt':
            case '<':
                return '<';
            case 'gt':
            case '>':
                return '>';

            case 'lte':
            case '<=':
                return '<=';

            case 'gte':
            case '>=':
                return '>=';

            case 'is_null':
            case 'is-null':
                return 'Null';

            case 'is_not_null':
            case 'is-not-null':
                return 'NotNull';

            default:
                return 'ilike';
        }
    }

    getValue(operand, value) {
        switch (operand) {
            case 'in':
                return Array.isArray(value) ? value : [value]

            case 'neq':
            case 'not-equal':
            case 'ne':
            case 'equal':
            case 'equals':
            case '!=':
            case '<>':
            case 'eq':
            case 'lt':
            case 'gt':
            case 'lte':
            case 'gte':
            case '<=':
            case '>=':
            case '<':
            case '>':
            case '=':
                return value

            case 'like':
            case '%':
            case 'contains':
            case 'not_contains':
            case 'not-contains':
            default:
                return `%${value || ''}%`

            case 'start':
                return `${value || ''}%`

            case 'end':
                return `%${value || ''}`
        }
    }

    getAccessor(value) {
        const temp = value.split('.')
        const name = temp.pop()
        return {relation: temp.join('.'), name}
    }

    getMethod(operator) {
        operator = operator.toLowerCase().trim();
        return ['and', 'or', 'xor'].includes(operator) ? `${operator}Where` : 'where'
    }
}

module.exports = SearchFilterHelper
