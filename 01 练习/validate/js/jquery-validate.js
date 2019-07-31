;(function(global, factory, plug){
 return factory.call(global, global.jQuery, plug)
})(this, function($, plug){
  var defaultOpt = {
    defaultEvent: 'blur',
    idCard: /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
    phone: /^1\d{10}$/,
    email: /^[a-zA-Z]\w*(?:\.\w+)*@([\da-z](-[\da-z])?)+(\.{1,2}[a-z]+)+$/,
  }
  var __DEF__ = {
    require: function(opt) {
      return !!this.val()
    },
    email: function(opt){
      return opt.email.test(this.val())
    },
    phone: function(opt){
      return opt.phone.test(this.val())
    },
    idCard: function(opt){
      return opt.idCard.test(this.val())
    },
    reg: function(opt, data){
      var reg = new RegExp(data)
      return reg.test(this.val())
    },
    min: function(opt, data){
      return this.val() > data
    },
    max: function(opt, data){
      return this.val() < data
    }
  }
  $.fn[plug] = function(opt) {
    
    var width = this.data('validate-label-width')
    if(width){
      this.find('.validate-label').css({
        width: width + 'px'
      })
    }
    var option = $.extend({}, defaultOpt, opt)
    
    this.each(function(i, input){
      var $dom = $(this)
      var currEvent = $dom.data('v-event') || option.defaultEvent
      var $fields =$dom.find('[data-'+ plug +'=true]')
      $fields.each(function(idx, item){
          var $field = $(item)
          if ($field.data('v-require')){
            $field.parent().find('.require-star').show()
          }

      })
      $fields.unbind().on(currEvent, function(){
         var $field = $(this)
         var result = true
         $.each(__DEF__, function(rule, valid){
           var selfData = $field.data('v-'+ rule)
           var errMsg = $field.data('v-'+ rule + '-error')
            if(selfData){
              result = valid.call($field, option, selfData)
              if(!result){
                $field.parent().next().find('.error-msg').text(errMsg)
              } else {
                $field.parent().next().find('.error-msg').text('')
              }
              return result
            }
         })
      })
    })
  }
}, 'validate')