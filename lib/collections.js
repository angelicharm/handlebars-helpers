'use strict';

var Handlebars = require('handlebars');
var filter = require('arr-filter');
var pluck = require('object.pluck');
var utils = require('./utils');
var eachProperty = require('./utils/eachProperty');
var indexOf = require('./utils/indexOf');
var helpers = module.exports;

/**
 * @param {Array} `array`
 * @param {Object} `options`
 */

helpers.any = function(array, options) {
  if (array.length > 0) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
};

/**
 * Return all of the items in the collection after the specified count.
 *
 * @param {Array} `array` Collection
 * @param {Number} `count` Number of items to exclude
 * @return {Array} Array excluding the number of items specified
 * @api public
 */

helpers.after = function(array, count) {
  return array.slice(count);
};

/**
 * Return all of the items in the collection before the specified
 * count. Opposite of {{after}}.
 *
 * @param {Array} `array`
 * @param {Number} count
 * @return {Array}
 * @api public
 */

helpers.before = function(array, count) {
  return array.slice(0, -count);
};

/**
 * Use all of the items in the collection after the specified count
 * inside a block.
 *
 * @param {Array} `array`
 * @param {Number} `count`
 * @param {Object} `options`
 * @return {Array}
 * @api public
 */

helpers.withAfter = function(array, count, options) {
  array = array.slice(count);
  var result = '';
  for (var item in array) {
    result += options.fn(array[item]);
  }
  return result;
};

/**
 * Converts a string such as "foo, bar, baz" to an ES Array of strings.
 *
 * @source: http://bit.ly/1840DsB
 * @param {String} `str`
 * @return {String}
 * @api public
 */

helpers.arrayify = function(str) {
  return str.split(",").map(function(tag) {
    return '"' + tag + '"';
  });
};

/**
 * Use all of the items in the collection before the specified count
 * inside a block. Opposite of {{withAfter}}
 *
 * @param {Array} `array`
 * @param {Number} count
 * @param {Object} `options`
 * @return {Array}
 * @api public
 */

helpers.withBefore = function(array, count, options) {
  array = array.slice(0, -count);
  var result = '';
  for (var item in array) {
    result += options.fn(array[item]);
  }
  return result;
};

/**
 * Return the first item in a collection.
 *
 * @param {Array} `array`
 * @param {Number} count
 * @return {*}
 * @api public
 */

helpers.first = function(array, count) {
  if (utils.isUndefined(count)) {
    return array[0];
  } else {
    return array.slice(0, count);
  }
};

/**
 * Use the first item in a collection inside a handlebars
 * block expression.
 *
 * @param {Array} `array`
 * @param {Number} count
 * @param {Object} `options`
 * @return {*}
 * @api public
 */

helpers.withFirst = function(arr, num, options) {
  if (!utils.isUndefined(arr)) {
    arr = utils.result(arr);
    if (!utils.isUndefined(num)) {
      num = parseFloat(utils.result(num));
    }
    if (utils.isUndefined(num)) {
      options = num;
      return options.fn(arr[0]);
    } else {
      arr = arr.slice(0, num);
      var result = '';
      for (var item in arr) {
        result += options.fn(arr[item]);
      }
      return result;
    }
  } else {
    return console.error('{{withFirst}} takes at least one argument (array).');
  }
};

/**
 * Return the last item in an array. Opposite of `first`.
 *
 * @param {Array} `array`
 * @param {Number} `num` The number of elements to return.
 * @return {Array}
 * @api public
 */

helpers.last = function(array, num) {
  if (utils.isUndefined(num)) {
    return array[array.length - 1];
  } else {
    return array.slice(-num);
  }
};

/**
 * Use the last item in a collection inside a block.
 * Opposite of {{withFirst}}.
 *
 * @param {Array} `array`
 * @param {Number} count
 * @param {Object} `options`
 * @return {*}
 * @api public
 */

helpers.withLast = function(array, count, options) {
  if (utils.isUndefined(count)) {
    options = count;
    return options.fn(array[array.length - 1]);
  } else {
    array = array.slice(-count);
    var result = '';
    for (var item in array) {
      result += options.fn(array[item]);
    }
    return result;
  }
};

/**
 * Joins all elements of a collection into a string
 * using a separator if specified.
 *
 * @param {Array} `array`
 * @param {String} `sep` The separator to use.
 * @return {String}
 * @api public
 */

helpers.join = function(arr, sep) {
  if (!Array.isArray(arr)) {
    return '';
  }
  sep = typeof sep === 'string'
    ? sep
    : '';
  return arr.join(sep);
};

/**
 * Handlebars "joinAny" block helper that supports arrays of objects
 * or strings. Sourced from: <https://github.com/wycats/handlebars.js/issues/133>
 *
 * If "delimiter" is not speficified, then it defaults to ",".
 * You can use "start", and "end" to do a "slice" of the array.
 *
 * Usage with objects
 *
 * ```handlebars
 * {{#join people delimiter=" and "}}{{name}}, {{age}}{{/join}}
 * ```
 * Usage with arrays:
 *
 * ```handlebars
 * {{join jobs delimiter=", " start="1" end="2"}}
 * ```
 */

helpers.joinAny = function(items, block) {
  var delimiter = block.hash.delimiter || ",";
  var start = block.hash.start || 0;
  var len = (items ? items.length : 0);
  var end = block.hash.end || len;
  var out = '';
  if (end > len) {
    end = len;
  }
  if ('function' === typeof block) {
    var i = start;
    while (i < end) {
      if (i > start) {
        out += delimiter;
      }
      if ('string' === typeof items[i]) {
        out += items[i];
      } else {
        out += block(items[i]);
      }
      i++;
    }
    return out;
  } else {
    return [].concat(items).slice(start, end).join(delimiter);
  }
};


/**
 * @name .sort
 * @param {type} `array`
 * @param {type} `field`
 * @return {String}
 * @api public
 */

helpers.sort = function(array, field) {
  if (utils.isUndefined(field)) {
    return array.sort();
  } else {
    return array.sort(function(a, b) {
      return a[field] > b[field];
    });
  }
};


/**
 * @name .withSort
 * @param {type} `array`
 * @param {type} `field`
 * @param {type} `options`
 * @return {String}
 * @api public
 */

helpers.withSort = function(array, field, options) {
  array = array.slice();

  var getDescendantProp = function(obj, desc) {
    var arr = desc.split('.');
    while (arr.length && (obj = obj[arr.shift()])) {
      continue;
    }
    return obj;
  };

  var result = '';
  var item;
  var i;
  var len;
  if (utils.isUndefined(field)) {
    options = field;
    array = array.sort();
    if (options.hash && options.hash.dir === 'desc') {
      array = array.reverse();
    }
    for (i = 0, len = array.length; i < len; i++) {
      item = array[i];
      result += options.fn(item);
    }
  } else {
    array = array.sort(function(a, b) {
      var aProp = getDescendantProp(a, field);
      var bProp = getDescendantProp(b, field);
      if (aProp > bProp) {
        return 1;
      } else {
        if (aProp < bProp) {
          return -1;
        }
      }
      return 0;
    });
    if (options.hash && options.hash.dir === 'desc') {
      array = array.reverse();
    }
    for (item in array) {
      result += options.fn(array[item]);
    }
  }
  return result;
};


/**
 * @name .length
 * @param {type} `array`
 * @return {String}
 * @api public
 */

helpers.length = function(array) {
  return (!array) ? 0 : array.length;
};


/**
 * @name .lengthEqual
 * @param {type} `array`
 * @param {type} `length`
 * @param {type} `options`
 * @return {String}
 * @api public
 */

helpers.lengthEqual = function(array, length, options) {
  if (array.length === length) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
};


/**
 * @name .empty
 * @param {type} `array`
 * @param {type} `options`
 * @return {String}
 * @api public
 */

helpers.empty = function(array, options) {
  if (array.length <= 0) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
};

/**
 * @name .inArray
 * @param {type} `array`
 * @param {type} `value`
 * @param {type} `options`
 * @return {String}
 * @api public
 */

helpers.inArray = function(array, value, options) {
  if (indexOf.call(array, value) >= 0) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
};

/**
 * @name .filter
 * @param {type} `array`
 * @param {type} `value`
 * @param {type} `options`
 * @return {String}
 * @api public
 */

helpers.filter = function(array, value, options) {

  var data = void 0;
  var content = '';
  var results = [];

  if (options.data) {
    data = Handlebars.createFrame(options.data);
  }

  // filter on a specific property
  var prop = options.hash && options.hash.property;
  if (prop) {
    results = filter(array, function (val) {
      if (val[prop] === value) {
        return true;
      }
    });
  } else {

    // filter on a string value
    results = filter(array, function(v, k) {
      return value === v;
    });
  }

  if (results && results.length > 0) {
    for (var i = 0; i < results.length; i++) {
      content += options.fn(results[i], {
        data: data
      });
    }
  } else {
    content = options.inverse(this);
  }
  return content;
};

/**
 * Similar to {{#each}} helper, but treats array-like objects
 * as arrays (e.g. objects with a `.length` property that
 * is a number) rather than objects. This lets us iterate
 * over our collections items.
 */

helpers.iterate = function(context, options) {
  var fn = options.fn;
  var inverse = options.inverse;
  var i = 0;
  var ret = "";
  var data = void 0;
  if (options.data) {
    data = Handlebars.createFrame(options.data);
  }
  if (context && typeof context === 'object') {
    if (typeof context.length === 'number') {
      var j = context.length;
      while (i < j) {
        if (data) {
          data.index = i;
        }
        ret = ret + fn(context[i], {
          data: data
        });
        i++;
      }
    } else {
      for (var key in context) {
        if (context.hasOwnProperty(key)) {
          if (data) {
            data.key = key;
          }
          ret = ret + fn(context[key], {
            data: data
          });
          i++;
        }
      }
    }
  }
  if (i === 0) {
    ret = inverse(this);
  }
  return ret;
};

/**
 * **Examples:**
 *
 * Data:
 *
 * ```js
 * var accounts = [
 *   {'name': 'John', 'email': 'john@example.com'},
 *   {'name': 'Malcolm', 'email': 'malcolm@example.com'},
 *   {'name': 'David', 'email': 'david@example.com'}
 * ];
 * ```
 *
 * Templates:
 *
 * ```handlebars
 * {{#forEach accounts}}
 *   <a href="mailto:{{ email }}" title="Send an email to {{ name }}">
 *     {{ name }}
 *   </a>{{#unless isLast}}, {{/unless}}
 * {{/forEach}}
 * ```
 * Credit: http://bit.ly/14HLaDR
 */

helpers.forEach = function(array, options) {
  var len = array.length;
  var i = 0;
  var buffer = '';

  while (i < len) {
    var item = array[i];
    item.index = i + 1;
    item._total = len;
    item.isFirst = i === 0;
    item.isLast = i === (len - 1);
    buffer += options.fn(item);
    i++;
  }
  return buffer;
};

/**
 * Handlebars block helper to enumerate the properties
 * in an object
 *
 * @param {Object} `context`
 * @param {Object} `options`
 * @return {String}
 * @api public
 */

helpers.eachProperty = function(context, options) {
  return eachProperty(context, options);
};

/**
 * @param {Array} `array`
 * @param {Object} `options`
 * @return {[type]}
 * @example:
 *
 * ```handlebars
 * {{#eachIndex collection}}
 *   {{item}} is {{index}}
 * {{/eachIndex}}
 * ```
 */

helpers.eachIndex = function(arr, options) {
  var result = '';

  for (var i = 0; i < arr.length; i++) {
    var ele = arr[i];
    result += options.fn({
      item: ele,
      index: i
    });
  }

  return result;
};

/**
 * @param {Array} `array`
 * @param {Object} `options`
 * @return {[type]}
 * @example:
 *
 * ```handlebars
 * {{#eachIndexPlusOne collection}}
 *   {{item}} is {{index}}
 * {{/eachIndexPlusOne}}
 * ```
 */

helpers.eachIndexPlusOne = function(arr, options) {
  var result = '';

  for (var i = 0; i < arr.length; i++) {
    var ele = arr[i];
    result += options.fn({
      item: ele,
      index: i + 1
    });
  }

  return result;
};