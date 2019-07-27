;(function(root) {

    // Save bytes in the minified (but not gzipped) version:
    var ArrayProto = Array.prototype, ObjProto = Object.prototype;
    var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;
    
  var push = Array.prototype.push,
      slice = ArrayProto.slice,
      toString = ObjProto.toString,
      hasOwnProperty = ObjProto.hasOwnProperty;

  var nativeIsArray = Array.isArray,
      nativeKeys = Object.keys,
      nativeCreate = Object.create;

   var _ = function(obj){
     if(obj instanceof _){
       return obj
     }
     if(!(this instanceof _)){
       return new _(obj)
     }
     this._wrapped = obj
   }
   _.unique = function(arr, callbacks){
     var ret = []
     var target, i = 0;
     for(; i< arr.length; i++){
       target = callbacks ? callbacks(arr[i]) : arr[i]
       if(ret.indexOf(target) === -1){
         ret.push(target)
       }
     }
     return ret
  }

  var has = function(obj, path) {
    return obj != null && hasOwnProperty.call(obj, path);
  }

   // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`.
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    // if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

   // Retrieve all the property names of an object.
   _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    // if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };


    // An internal function for creating assigner functions.
    var createAssigner = function(keysFunc, defaults) {
      return function(obj) {
        var length = arguments.length;
        if (defaults) obj = Object(obj);
        if (length < 2 || obj == null) return obj;
        for (var index = 1; index < length; index++) {
          var source = arguments[index],
              keys = keysFunc(source),
              l = keys.length;
          for (var i = 0; i < l; i++) {
            var key = keys[i];
            if (!defaults || obj[key] === void 0) obj[key] = source[key];
          }
        }
        return obj;
      };
    };

  _.extend = createAssigner(_.allKeys);

  _.extendOwn = _.assign = createAssigner(_.keys);

  _.chain = function(obj){
    var instance = _(obj)
    instance._chain = true
    return instance
  }

  var result = function(instance, obj){
    return instance._chain ? _(obj).chain() : obj
  }

  _.prototype.value = function(){
    return this._wrapped
  }

  _.functions = function(obj){
    var result = []
    var key
    for(key in obj){
      result.push(key)
    }
    return result
  }

  _.map = function(obj, iteratee, context){
    //生成不同功能迭代器
		var iteratee = cb(iteratee, context);
		//分辨 obj是数组对象, 还是object对象
		var keys = !_.isArray(obj) && Object.keys(obj);
		var length = (keys || obj).length;
		var result = Array(length);

		for (var index = 0; index < length; index++) {
			var currentKey = keys ? keys[index] : index;
			result[index] = iteratee(obj[currentKey], index, obj);
		}

		return result;
  }

  var cb = function(iteratee, context, count) {
		if (iteratee == null) {
			return _.identity;
		}

		if (_.isFunction(iteratee)) {
			return optimizeCb(iteratee, context, count);
		}
	}

	//optimizeCb优化迭代器
	var optimizeCb = function(func, context, count) {
		if (context == void 0) {
			return func;
		}

		switch (count == null ? 3 : count) {
			case 1:
				return function(value) {
					return func.call(context, value);
				};
			case 3:
				return function(value, index, obj) {
					return func.call(context, value, index, obj);
        };
      case 4:
        return function(memo, value, index, obj){
          return func.call(context, memo, value, index, obj)
        }  
		}
  }

  _.restArguments = function(func) {
    var startIndex = func.length - 1
    return function(){
      var length = arguments.length - startIndex,
          rest = Array(length),
          index = 0;
      for(; index < length; index++){
        rest[index] = arguments[index + startIndex]
      }

      var args = Array(startIndex + 1)
      for(index = 0; index < startIndex; index++){
        args[index] = arguments[index]
      }

      args[startIndex] = rest
      return func.apply(this, args)
    }
  }

  var Ctor = function() {}

  var baseCreate = function(prototype) {
    if(!_.isObject(prototype)) return {}
    if(nativeCreate) return nativeCreate(prototype)
    Ctor.prototype = prototype
    var result = new Ctor
    Ctor.prototype = null
    return result
  }

   var createReduce = function (dir) {
      var reduce = function(obj, iteratee, memo, init) {
        var keys = !_.isArray(obj) && Object.keys(obj)
        var length = (keys || obj).length
        var index = dir > 0 ? 0 : length -1
        if (!init) {
           memo = obj[keys ? keys[index] : index]
           index += dir
           
        }
        for(; index >= 0 && index < length; index += dir){
          var currentKey = keys ? keys[index] : index
          memo = iteratee(memo, obj[currentKey], currentKey, obj)
        }
        return memo
      }
      return function (obj, iteratee, memo, context) {
        var init = arguments.length >= 3
        return reduce(obj, optimizeCb(iteratee, context, 4), memo, init)
      }
   }

   _.reduce = createReduce(1)

   _.filter = _.select = function(obj, predicate, context) {
     var results = []
     predicate = cb(predicate, context)
     _.each(obj, function(value, index, list){
       if(predicate(value, index, list)) {
        results.push(value)
       }
     })
     return results
   }

  _.create = function(prototype, props) {
    var result = baseCreate(prototype)
    if(props) _.extendOwn(result, props)
    return result
  }
  
  _.isObject = function(obj) {
    return obj != null && this.toString.call(obj) === '[object Object]'
  }
   //默认迭代器
	_.identity = function(value) {
		return value;
	}

  _.isFunction = function(fn){
    return toString.call(fn) === '[object Function]'
  }

  _.isArray = function(arr){
    return toString.call(arr) === '[object Array]'
  }

  _.each = function(target, callback){
    var key, i = 0
    if(_.isArray(target)){
      var length = target.length
      for(; i< length; i++){
        callback.call(target, target[i], i)
      }
    } else {
      for(key in target){
        callback.call(target, key, target[key])
      }
    }
  }

  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name){
      var func = obj[name]

      _.prototype[name] = function(){
        var args = [this._wrapped]
        push.apply(args, arguments)
        return result(this, func.apply(this, args))
      }
    })
  }
  _.mixin(_)
  root._ = _;
})(this);