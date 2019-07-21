;(function(root) {
  var push = Array.prototype.push
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

  _.map = function(args){
    return args
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