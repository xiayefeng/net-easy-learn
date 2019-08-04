var _ = {}
// 获取时间戳
_.now = Date.now
_.throttle = function(func, wait, options){
  var lastTime = 0
  var timeOut = null
  var args, result
  if(!options){
    options = {}
  }
  var later = function(){
    lastTime = options.leading === false ? 0 : _.now()
    timeOut = null
    func.apply(null, args)
  }
  return function(){   // 节流函数
    // 首次执行节流函数的时间
    var now = _.now()
    agrs = arguments
    if(!lastTime && options.leading === false){
       lastTime = now
    }
    var remaining = wait - (now - lastTime)
    if(remaining <= 0){
      if(timeOut){
        clearTimeout(timeOut)
        timeOut = null
      }
      lastTime = now
      result = func.apply(null, args)
    }else if(!timeOut && options.trailing !== false) {
      timeOut = setTimeout(later, remaining)
    }
    return result
  }
}