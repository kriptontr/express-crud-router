"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseQuery = exports.getMany = void 0;

var _mapValues = _interopRequireDefault(require("lodash/mapValues"));

var _headers = require("./headers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getMany = (doGetFilteredList, doGetSearchList, filtersOption) => async (req, res, next) => {
  try {
    const {
      q,
      limit,
      offset,
      filter,
      order
    } = parseQuery(req.query, filtersOption);

    if (!q) {
      const {
        rows,
        count
      } = await doGetFilteredList({
        filter,
        limit,
        offset,
        order
      }, {
        req,
        res
      });
      (0, _headers.setGetListHeaders)(res, offset, count, rows.length);
      res.json(rows);
    } else {
      if (!doGetSearchList) {
        return res.status(400).json({
          error: 'Search has not been implemented yet for this resource'
        });
      }

      const {
        rows,
        count
      } = await doGetFilteredList({
        filter,
        limit,
        offset,
        order,
        q
      }, {
        req,
        res
      });
      (0, _headers.setGetListHeaders)(res, offset, count, rows.length);
      res.json(rows);
    }
  } catch (error) {
    next(error);
  }
};

exports.getMany = getMany;

const parseQuery = (query, filtersOption) => {
  const {
    range,
    sort,
    filter
  } = query;
  const [from, to] = range ? JSON.parse(range) : [0, 100];
  const {
    q,
    ...filters
  } = JSON.parse(filter || '{}');
  return {
    offset: from,
    limit: to - from + 1,
    filter: getFilter(filters, filtersOption),
    order: sort ? [JSON.parse(sort)] : [],
    q
  };
};

exports.parseQuery = parseQuery;

const getFilter = (filter, filtersOption) => (0, _mapValues.default)(filter, (value, key) => {
  if (filtersOption && filtersOption[key]) {
    return filtersOption[key](value);
  }

  return value;
});