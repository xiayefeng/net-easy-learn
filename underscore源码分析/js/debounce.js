var _ = {}
// 获取时间戳
_.now = Date.now



_.debounce = function(func, wait, immediate){
  var lastTime,timeOut,args, result

  var later = function(){
    var last = _.now() - lastTime
    if(last < wait){
      timeOut = setTimeout(later, wait - last)
    }else{
      timeOut = null
      if(!immediate){
        result = func.apply(null, args)
      }
    }
  }

  return function(){ // 防抖函数
    args = arguments
    lastTime = _.now()
    // 立即调用满足两个条件
    var callNow = immediate && !timeOut
    if(!timeOut){
      timeOut = setTimeout(later, wait)
    }
    if(callNow) {
      result = func.apply(null, args)
    }
    return result
  }
}