;(function(global, factory, plugin) {
	global[plugin] = factory.call(global)
})(this,	function() {
		var __obj__ = {
			init: function() {
            this.eles =$('img[data-src]')
            if(this.eles.length === 0){
               return
            }
            this.transformSrc()
            this.bindEvent()
         },
         eles: null,
         hasBind: false,
			throttle: function(func, time) {
				var timer = null
				var startTime = new Date()
				var _this = this
				return function() {
					var curTime = new Date()
					if (timer) {
						timer = clearTimeout(timer)
					}

					if (curTime - startTime >= time) {
						func.apply(_this, arguments)
						startTime = curTime
					} else {
						timer = setTimeout(function() {
							func.apply(_this, arguments)
						}, time)
					}
				}
         },
         winHeight: function(){
           return window && window.innerHeight || 0
         },
         transformSrc: function() {
            var $imgAll = this.eles
            var _this = this
            $imgAll.each(function(idx, img){
               var offset = img.getBoundingClientRect()
               var $img = $(img)
               if(offset.top <= _this.winHeight() && !$img.data('show')){
                  img.src = $img.data('src')
                  $img.data('show', 1)
               }
            })
         },
         bindEvent: function() {
            $(window).off('scroll').on('scroll', this.throttle(this.transformSrc, 100))
            this.hasBind = true
         },
         off: function() {
            if(this.hasBind){
               $(window).off('scroll')
            }
         }
      }
      return __obj__
	},	'LazyLoad')
