(function(root) {
	var optionsCache = {};
	var _ = {
		callbacks: function(options) {
			options = typeof options === "string" ? (optionsCache[options] || createOptions(options)) : {};
            var list = [];
			var index,length,testting,memory,start,starts;
			var fire = function(data){
				memory = options.memory && data;
				index = starts||0;
				starts = 0;
				testting = true;  // once 为 true, 保证触发一次
				length = list.length;
				for(;index < length;index++){
					if(list[index].apply(data[0], data[1]) === false && options.stopOnfalse){
						break;
					}
				}
			}
			var self = {
				add: function(){
					var args = Array.prototype.slice.call(arguments);
					start = list.length;
					args.forEach(function(fn){
						if(toString.call(fn) ==="[object Function]"){
							if(!options.unique || !self.has(fn)) {
                list.push(fn);
							}
						}
					});
					if(memory){
					 starts = start;  // 只有当 memory 为 true 时，才使用下标
					 fire(memory);	
					}
				},
				fireWith: function(context, arguments){
					var args = [context, arguments];
					if(!options.once || !testting){
					 fire(args);
					}
				},
				fire: function(){
					self.fireWith(this, arguments);
				},
				remove: function(fn) {
          if(toString.call(fn)==='[object Function]' && list.includes(fn)) {
						var idx = list.findIndex((item) => item === fn)
						list.splice(idx, 1)
					}
				},
				has: function(fn) {
          return fn ? list.indexOf(fn) > -1 : !!(list && list.length)
				}
			}
			return self;
		},
	}

	function createOptions(options) {
		var object = optionsCache[options] = {};
		options.split(/\s+/).forEach(function(value) {  // 以空格切割参数
			object[value] = true;
		});
		return object;
	}
	root._ = _;
})(this);
