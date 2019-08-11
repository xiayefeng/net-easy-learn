;(function(root) {
	// Save bytes in the minified (but not gzipped) version:
	var ArrayProto = Array.prototype,
		ObjProto = Object.prototype
	var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null

	var push = Array.prototype.push,
		slice = ArrayProto.slice,
		toString = ObjProto.toString,
		hasOwnProperty = ObjProto.hasOwnProperty

	var nativeIsArray = Array.isArray,
		nativeKeys = Object.keys,
		nativeCreate = Object.create

	var shallowProperty = function(key) {
		return function(obj) {
			return obj == null ? void 0 : obj[key]
		}
	}
	var MAX_ARRAY_INDEX = Math.pow(2, 32) - 1
	var getLength = shallowProperty('length')
	var isArrayLike = function(collection) {
		var length = getLength(collection)
		return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX
	}

	var _ = function(obj) {
		if (obj instanceof _) {
			return obj
		}
		if (!(this instanceof _)) {
			return new _(obj)
		}
		this._wrapped = obj
	}
	/* 	_.uniq = _.unique = function(arr, callback) {
		var ret = []
		var target,
			i = 0
		for (; i < arr.length; i++) {
			target = callbacks ? callbacks(arr[i]) : arr[i]
			if (ret.indexOf(target) === -1) {
				ret.push(target)
			}
		}
		return ret
	} */
	_.uniq = _.unique = function(arr, isSorted, iteratee, context) {
		if (!_.isBoolean(isSorted)) {
			context = iteratee
			iteratee = isSorted
			isSorted = false
		}

		if (iteratee != null) {
			iteratee = cb(iteratee, context)
		}

		var result = []

		var seen,
			i = 0

		for (; i < arr.length; i++) {
			// target = callbacks ? callbacks(arr[i]) : arr[i]
			var computed = iteratee ? iteratee(arr[i], i, arr) : arr[i]
			if (isSorted) {
				if (!i || seen !== computed) {
					result.push(computed)
				}
				seen = computed
			} else if (result.indexOf(computed) === -1) {
				result.push(computed)
			}
		}
		return result
	}

	var has = function(obj, path) {
		return obj != null && hasOwnProperty.call(obj, path)
	}

	// Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
	var hasEnumBug = !{ toString: null }.propertyIsEnumerable('toString')
	var nonEnumerableProps = [
		'valueOf',
		'isPrototypeOf',
		'toString',
		'propertyIsEnumerable',
		'hasOwnProperty',
		'toLocaleString',
	]
	var collectNonEnumProps = function(obj, keys) {
		var nonEnumIdx = nonEnumerableProps.length
		var constructor = obj.constructor
		var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto

		// Constructor is a special case.
		var prop = 'constructor'
		if (has(obj, prop) && !_.contains(keys, prop)) keys.push(prop)

		while (nonEnumIdx--) {
			prop = nonEnumerableProps[nonEnumIdx]
			if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
				keys.push(prop)
			}
		}
	}

	_.rest = function(array, n, guard) {
		return slice.call(array, n == null ? 1 : n)
	}

	_.random = function(min, max) {
		if (max == null) {
			max = min
			min = 0
		}
		return min + Math.floor(Math.random() * (max - min + 1))
	}

	// Retrieve the names of an object's own properties.
	// Delegates to **ECMAScript 5**'s native `Object.keys`.
	_.keys = function(obj) {
		if (!_.isObject(obj)) return []
		if (nativeKeys) return nativeKeys(obj)
		var keys = []
		for (var key in obj) if (has(obj, key)) keys.push(key)
		// Ahem, IE < 9.
		if (hasEnumBug) collectNonEnumProps(obj, keys)
		return keys
	}

	// Retrieve all the property names of an object.
	_.allKeys = function(obj) {
		if (!_.isObject(obj)) return []
		var keys = []
		for (var key in obj) keys.push(key)
		// Ahem, IE < 9.
		if (hasEnumBug) collectNonEnumProps(obj, keys)
		return keys
	}

	// Determine if the array or object contains a given item (using `===`).
	// Aliased as `includes` and `include`.
	_.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
		if (!isArrayLike(obj)) obj = _.values(obj)
		if (typeof fromIndex != 'number' || guard) fromIndex = 0
		return _.indexOf(obj, item, fromIndex) >= 0
	}

	// An internal function for creating assigner functions.
	var createAssigner = function(keysFunc, defaults) {
		return function(obj) {
			var length = arguments.length
			if (defaults) obj = Object(obj)
			if (length < 2 || obj == null) return obj
			for (var index = 1; index < length; index++) {
				var source = arguments[index],
					keys = keysFunc(source),
					l = keys.length
				for (var i = 0; i < l; i++) {
					var key = keys[i]
					if (!defaults || obj[key] === void 0) obj[key] = source[key]
				}
			}
			return obj
		}
	}

	_.extend = createAssigner(_.allKeys)

	_.extendOwn = _.assign = createAssigner(_.keys)

	_.chain = function(obj) {
		var instance = _(obj)
		instance._chain = true
		return instance
	}

	var result = function(instance, obj) {
		return instance._chain ? _(obj).chain() : obj
	}

	_.prototype.value = function() {
		return this._wrapped
	}

	_.functions = function(obj) {
		var result = []
		var key
		for (key in obj) {
			result.push(key)
		}
		return result
	}

	_.map = function(obj, iteratee, context) {
		//生成不同功能迭代器
		var iteratee = cb(iteratee, context)
		//分辨 obj是数组对象, 还是object对象
		var keys = !_.isArray(obj) && Object.keys(obj)
		var length = (keys || obj).length
		var result = Array(length)

		for (var index = 0; index < length; index++) {
			var currentKey = keys ? keys[index] : index
			result[index] = iteratee(obj[currentKey], index, obj)
		}

		return result
	}

	var cb = function(iteratee, context, count) {
		if (iteratee == null) {
			return _.identity
		}

		if (_.isFunction(iteratee)) {
			return optimizeCb(iteratee, context, count)
		}
	}

	//optimizeCb优化迭代器
	var optimizeCb = function(func, context, count) {
		if (context == void 0) {
			return func
		}

		switch (count == null ? 3 : count) {
			case 1:
				return function(value) {
					return func.call(context, value)
				}
			case 3:
				return function(value, index, obj) {
					return func.call(context, value, index, obj)
				}
			case 4:
				return function(memo, value, index, obj) {
					return func.call(context, memo, value, index, obj)
				}
		}
	}

	_.restArguments = function(func) {
		var startIndex = func.length - 1
		return function() {
			var length = arguments.length - startIndex,
				rest = Array(length),
				index = 0
			for (; index < length; index++) {
				rest[index] = arguments[index + startIndex]
			}

			var args = Array(startIndex + 1)
			for (index = 0; index < startIndex; index++) {
				args[index] = arguments[index]
			}

			args[startIndex] = rest
			return func.apply(this, args)
		}
	}

	var Ctor = function() {}

	var baseCreate = function(prototype) {
		if (!_.isObject(prototype)) return {}
		if (nativeCreate) return nativeCreate(prototype)
		Ctor.prototype = prototype
		var result = new Ctor()
		Ctor.prototype = null
		return result
	}

	var createReduce = function(dir) {
		var reduce = function(obj, iteratee, memo, init) {
			var keys = !_.isArray(obj) && Object.keys(obj)
			var length = (keys || obj).length
			var index = dir > 0 ? 0 : length - 1
			if (!init) {
				memo = obj[keys ? keys[index] : index]
				index += dir
			}
			for (; index >= 0 && index < length; index += dir) {
				var currentKey = keys ? keys[index] : index
				memo = iteratee(memo, obj[currentKey], currentKey, obj)
			}
			return memo
		}
		return function(obj, iteratee, memo, context) {
			var init = arguments.length >= 3
			return reduce(obj, optimizeCb(iteratee, context, 4), memo, init)
		}
	}

	_.reduce = createReduce(1)
	_.reduceRight = createReduce(-1)

	_.filter = _.select = function(obj, predicate, context) {
		var results = []
		predicate = cb(predicate, context)
		_.each(obj, function(value, index, list) {
			if (predicate(value, index, list)) {
				results.push(value)
			}
		})
		return results
	}

	// Returns the first key on an object that passes a predicate test.
	_.findKey = function(obj, predicate, context) {
		predicate = cb(predicate, context)
		var keys = _.keys(obj),
			key
		for (var i = 0, length = keys.length; i < length; i++) {
			key = keys[i]
			if (predicate(obj[key], key, obj)) return key
		}
	}

	// Return the first value which passes a truth test. Aliased as `detect`.
	_.find = _.detect = function(obj, predicate, context) {
		var keyFinder = isArrayLike(obj) ? _.findIndex : _.findKey
		var key = keyFinder(obj, predicate, context)
		if (key !== void 0 && key !== -1) return obj[key]
	}

	_.sortedIndex = function(array, obj, iteratee, context) {
		iteratee = cb(iteratee, context, 1)
		var value = iteratee(obj)
		var low = 0,
			high = array.length

		while (low < high) {
			var mid = Math.floor((low + high) / 2)
			if (iteratee(array[mid]) < value) {
				low = mid + 1
			} else {
				high = mid
			}
		}
		return low
	}

	// Generator function to create the findIndex and findLastIndex functions.
	var createPredicateIndexFinder = function(dir) {
		return function(array, predicate, context) {
			predicate = cb(predicate, context)
			var length = getLength(array)
			var index = dir > 0 ? 0 : length - 1
			for (; index >= 0 && index < length; index += dir) {
				if (predicate(array[index], index, array)) return index
			}
			return -1
		}
	}

	// Returns the first index on an array-like that passes a predicate test.
	_.findIndex = createPredicateIndexFinder(1)
	_.findLastIndex = createPredicateIndexFinder(-1)

	var createIndexFinder = function(dir, predicateFind, sortedIndex) {
		return function(array, item, idx) {
			var i = 0,
				length = getLength(array)
			if (typeof idx == 'number') {
				if (dir > 0) {
					i = idx >= 0 ? idx : Math.max(idx + length, i)
				} else {
					length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1
				}
			} else if (sortedIndex && _.isBoolean(idx) && length) {
				idx = sortedIndex(array, item)
				return array[idx] === item ? idx : -1
			}

			if (item !== item) {
				idx = predicateFind(slice.call(array, i, length), _.isNaN)
				return idx >= 0 ? idx + i : -1
			}
			for (
				idx = dir > 0 ? i : length - 1;
				idx >= 0 && idx < length;
				idx += dir
			) {
				if (array[idx] === item) return idx
			}
			return -1
		}
	}

	_.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex)
	_.lastIndexOf = createIndexFinder(-1, _.findLastIndex)

	_.create = function(prototype, props) {
		var result = baseCreate(prototype)
		if (props) _.extendOwn(result, props)
		return result
	}

	_.isObject = function(obj) {
		return obj != null && toString.call(obj) === '[object Object]'
	}
	//默认迭代器
	_.identity = function(value) {
		return value
	}

	_.isFunction = function(fn) {
		return toString.call(fn) === '[object Function]'
	}

	_.isArray = function(arr) {
		return toString.call(arr) === '[object Array]'
	}
	// Is the given value `NaN`?
	_.isNaN = function(obj) {
		return _.isNumber(obj) && isNaN(obj)
	}

	// Is a given variable undefined?
	_.isUndefined = function(obj) {
		return obj === void 0
	}

	// Shortcut function for checking if an object has a given property directly
	// on itself (in other words, not on a prototype).
	_.has = function(obj, path) {
		if (!_.isArray(path)) {
			return has(obj, path)
		}
		var length = path.length
		for (var i = 0; i < length; i++) {
			var key = path[i]
			if (obj == null || !hasOwnProperty.call(obj, key)) {
				return false
			}
			obj = obj[key]
		}
		return !!length
	}

	_.clone = function(obj) {
		if (!_.isObject(obj)) return obj
		return _.isArray(obj) ? obj.slice() : _.extend({}, obj)
	}

	_.deepClone = function(obj) {
		if (_.isArray(obj)) {
		  return	_.map(obj, function(item, idx, arr) {
				return _.isArray(item) || _.isObject(item) ? _.deepClone(item) : item
			})
		} else if (_.isObject(obj)) {
			return _.reduce(
				obj,
				function(memo, value, key) {
					memo[key] =
						_.isObject(value) || _.deepClone(value) ? _.deepClone(value) : value
					return memo
				},
				{}
			)
		} else {
       return obj
		}
	}

	_.pick = function(object, oiteratee, context){
		var result = {}
		var iteratee
		var keys
    if(object == null){
			return result
		}
    if(_.isFunction(oiteratee)){
			keys = _.keys(object)
      iteratee = optimizeCb(oiteratee, context)
		} else {
				keys = slice.call(arguments, 1)
				iteratee = function(value, key, obj){
					return key in object
				}
		}

		for(var i = 0; i < keys.length; i++) {
			var key = keys[i]
			var value = object[key]
			if(iteratee(value, key, object)){
         result[key] = value
			}
		}
		return result
	}

	var escapes = {
		"'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
	}

	var escapeRegExp = /\\|'|\r|\n|\u2028\u2029/g

	var escapeChar = function(match){
		return '\\' + escapes[match]
	}

	_.template = function(templateString, settings){
		var RULES = {
			interpolate: /<%=([\s\S]+?)%>/g,
			escape: /<%-([\s\S]+?)%>/g,
			expression: /<%([\s\S]+?)%>/g
		}
		settings = _.extend({}, RULES, settings)
		var matcher = new RegExp([
			settings.interpolate.source,
			settings.escape.source,
			settings.expression.source,
		].join('|'), 'g')
		// var matcher = /<%=([\s\S]+?)%>|<%-([\s\S]+?)%>|<%([\s\S]+?)%>/g
		var source = "_p+='"
		var index = 0
		templateString.replace(matcher, function(match, interpolate, escape, expression, offset){
			 source += templateString.slice(index, offset).replace(escapeRegExp, escapeChar)
			 index = offset + match.length
       if(interpolate){
         source += "'+\n ((_t=(" + interpolate + "))== null ? '' :_t)+ \n'"
			 }else if(escape){
				source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
			 }else if(expression){
         source += "';\n" + expression + "\n_p+='"
			 }
		})
		source += " ';"
		source = "with(obj){\n"+ source +"}\n"
		source = "var _t, _p='';" + source + "return _p;\n"
		console.log(source)
		var render = new Function("obj", source)
		var template = function(data){
      return render.call(null, data)
		}
		return template
	}

	//解析模板
/* 	_.template = function(templateString, settings) {
		//默认规则
		var RULES = {
			interpolate: /<%=([\s\S]+?)%>/g,
			escape: /<%-([\s\S]+?)%>/g,
			expression: /<%([\s\S]+?)%>/g
		}
		settings = _.extend({}, RULES, settings);

		//解析 
		var matcher = new RegExp([
			settings.interpolate.source,
			settings.escape.source,
			settings.expression.source
		].join("|"), "g");

		var source = "_p+='";
		var index = 0;
		templateString.replace(matcher, function(match, interpolate, escape, expression, offset) {
			source += templateString.slice(index, offset).replace(/\n/g, function(){
				  return "\\n";
			});
			index = offset + match.length;
			if (interpolate) { //name  _p+='';
				source += "'+\n ((_t=(" + interpolate + ")) == null?'':_t)+\n'";
			} else if (escape) {

			} else if (expression) {   //obj.forEach(function(e, i, a){
				source +="';\n"+expression+"\n_p+='"
			}
		});
		source += " ';";
		source = "with(obj){\n" + source + "}\n"
		//渲染函数    字符串
		source = "var _t,_p='';" + source + "return _p;\n";
        console.log(source)
		//data 传参的问题  预编译
		var render = new Function("obj", source);

		var template = function(data) {
			return render.call(null, data); //renderString
		}
		return template;
	} */

	_.shuffle = function(array) {
		return _.sample(array, Infinity)
	}

	_.sample = function(array, n) {
		if (n == null) {
			return array[_.random(array.length - 1)]
		}
		var sample = _.clone(array)
		var length = sample.length
		var last = length - 1
		n = Math.max(Math.min(n, length), 0)
		for (var index = 0; index < n; index++) {
			var rand = _.random(index, last)
			var temp = sample[index]
			sample[index] = sample[rand]
			sample[rand] = temp
		}
		return sample.slice(0, n)
	}

	/* 	var flatten = function(array, shallow, strict, output) {
		 output = output || []
		var idx = output.length
		for (var i = 0; i < array.length; i++) {
			var value = array[i]
			if (_.isArray(value) || _.isArguments(value)) {
				if (!shallow) {
					flatten(value, shallow, strict, output)
          idx = output.length
				} else {
					var j = 0,
						len = value.length
					// ret.length += len
					while (j < len) {
						output[idx++] = value[j++]
					}
				}
			} else if(!strict){
				output[idx++] = value
			}
		}
		return output
	} */
	//摊平数组
	var flatten = function(array, shallow) {
		var ret = []
		var index = 0
		for (var i = 0; i < array.length; i++) {
			var value = array[i] //展开一次
			if (_.isArray(value) || _.isArguments(value)) {
				//递归全部展开
				if (!shallow) {
					value = flatten(value, shallow)
				}
				var j = 0,
					len = value.length

				ret.length += len

				while (j < len) {
					ret[index++] = value[j++]
				}
			} else {
				ret[index++] = value
			}
		}
		return ret
	}

	_.flatten = function(array, shallow) {
		return flatten(array, shallow, false)
	}

	_.initial = function(array, n) {
		return slice.call(array, 0, Math.max(0, array.length - (n == null ? 1 : n)))
	}

	_.compact = function(array) {
		return _.filter(array, Boolean)
	}

	_.range = function(start, stop, step) {
		if (stop == null) {
			stop = start || 0
			start = 0
		}

		step = step || 1
		var length = Math.max(Math.ceil((stop - start) / step), 0)

		var range = Array(length)
		for (var index = 0; index < length; index++, start += step) {
			range[index] = start
		}
		return range
	}

	_.partial = function(func) {
		var args = slice.call(arguments, 1)
		var bound = function() {
			var index = 0
			var length = args.length
			var ret = Array(length)
			for (var i = 0; i < length; i++) {
				ret[i] = args[i]
			}
			while (index < arguments.length) {
				ret.push(arguments[index++])
			}
			return func.apply(this, ret)
		}
		return bound
	}

	_.delay = function(func, wait) {
		var args = slice.call(arguments, 2)
		return setTimeout(function() {
			func.apply(null, args)
		}, wait)
	}

	// Invert the keys and values of an object. The values must be serializable.
	_.invert = function(obj) {
		var result = {}
		var keys = _.keys(obj)
		for (var i = 0, length = keys.length; i < length; i++) {
			result[obj[keys[i]]] = keys[i]
		}
		return result
	}

	// 字符串的逃逸
	var escapeMap = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#x27;',
		'`': '&#x60;',
	}

	var unescapeMap = _.invert(escapeMap)

	var createEscaper = function(map) {
		var sourece = '(?:' + Object.keys(map).join('|') + ')'
		var reg = new RegExp(sourece, 'g')
		var replace = function(match) {
			return map[match]
		}
		return function(str) {
			return reg.test(str) ? str.replace(reg, replace) : str
		}
	}
	_.escape = createEscaper(escapeMap)
	_.unescape = createEscaper(unescapeMap)

	_.compose = function() {
		var args = arguments
		var end = args.length - 1
		return function() {
			var i = end
			var result = args[i].apply(null, arguments)
			while (i--) {
				result = args[i].call(null, result)
			}
			return result
		}
	}

	_.memoize = function(func, hasher) {
		var memoize = function(key) {
			var cache = memoize.cache

			var address = '' + (hasher ? hasher.apply(this, arguments) : key)

			if (!_.has(cache, address)) {
				cache[address] = func.apply(this, arguments)
			}
			return cache[address]
		}
		memoize.cache = {}
		return memoize
	}

	_.now =
		Date.now ||
		function() {
			return new Date().getTime()
		}

	_.throttle = function(func, wait, options) {
		var lastTime = 0
		var timeOut = null
		var args, result
		if (!options) {
			options = {}
		}
		var later = function() {
			lastTime = options.leading === false ? 0 : _.now()
			timeOut = null
			func.apply(null, args)
		}
		return function() {
			// 节流函数
			// 首次执行节流函数的时间
			var now = _.now()
			agrs = arguments
			if (!lastTime && options.leading === false) {
				lastTime = now
			}
			var remaining = wait - (now - lastTime)
			if (remaining <= 0) {
				if (timeOut) {
					clearTimeout(timeOut)
					timeOut = null
				}
				lastTime = now
				result = func.apply(null, args)
			} else if (!timeOut && options.trailing !== false) {
				timeOut = setTimeout(later, remaining)
			}
			return result
		}
	}

	_.debounce = function(func, wait, immediate) {
		var lastTime, timeOut, args, result

		var later = function() {
			var last = _.now() - lastTime
			if (last < wait) {
				timeOut = setTimeout(later, wait - last)
			} else {
				timeOut = null
				if (!immediate) {
					result = func.apply(null, args)
				}
			}
		}

		return function() {
			// 防抖函数
			args = arguments
			lastTime = _.now()
			// 立即调用满足两个条件
			var callNow = immediate && !timeOut
			if (!timeOut) {
				timeOut = setTimeout(later, wait)
			}
			if (callNow) {
				result = func.apply(null, args)
			}
			return result
		}
	}

	_.each = function(target, callback) {
		var key,
			i = 0
		if (_.isArray(target)) {
			var length = target.length
			for (; i < length; i++) {
				callback.call(target, target[i], i)
			}
		} else {
			for (key in target) {
				callback.call(target, key, target[key])
			}
		}
	}
	// Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError, isMap, isWeakMap, isSet, isWeakSet.
	_.each(
		[
			'Arguments',
			'Function',
			'String',
			'Number',
			'Date',
			'RegExp',
			'Error',
			'Symbol',
			'Map',
			'WeakMap',
			'Set',
			'WeakSet',
		],
		function(name) {
			_['is' + name] = function(obj) {
				return toString.call(obj) === '[object ' + name + ']'
			}
		}
	)
	// Is a given object a finite number?
	_.isFinite = function(obj) {
		return !_.isSymbol(obj) && isFinite(obj) && !isNaN(parseFloat(obj))
	}

	// Is a given value a boolean?
	_.isBoolean = function(obj) {
		return (
			obj === true || obj === false || toString.call(obj) === '[object Boolean]'
		)
	}

	// Is a given value equal to null?
	_.isNull = function(obj) {
		return obj === null
	}

	_.mixin = function(obj) {
		_.each(_.functions(obj), function(name) {
			var func = obj[name]

			_.prototype[name] = function() {
				var args = [this._wrapped]
				push.apply(args, arguments)
				return result(this, func.apply(this, args))
			}
		})
	}
	_.mixin(_)
	root._ = _
})(this)
