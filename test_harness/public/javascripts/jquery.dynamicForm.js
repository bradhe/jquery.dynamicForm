(function($) {
  function DynamicForm(form, options) {
    var elements = $(form).find('input, select, textarea');
    var d = {};
    
    var settings = {
      success: null,
      error: null,
      errorListSelector: null,
      submitStart: function() {}, // Just swallow these things.
      submitDone: function() {},
      autoShowErrors: true,
      requestType: 'json'
    };
    
    if(options) {
      $.extend(settings, options);
    }
    
    function getData() {
      // Gather up all of the element's values and stick
      // them in to a payload to send over the wire.
      var l = elements.length;
      var data = {};
      
      for(var i = 0; i < l; i++) {
        var element = elements[i];
        
        // Before we go too much further, lets check the type.
        // we might need to do some special shit for different form types.
        // For instance, we only want to transmit the checked check boxes.
        var type = $(element).attr('type');
        if(type == 'checkbox' && !$(element).is(':checked')) {
          continue; // Pass on this one.
        }
        // TODO: Add support for radio buttons?
        
        var n = element.name;
        var val = $(element).val();

        // Support nesting.
        if(n.indexOf('[') > 0) {
          // We need to extract the stuff in the [];
          var pre = n.substring(0, n.indexOf('['));
          var matches = n.match(/\[.*\]/);
          
          if(matches.length < 1) {
            throw "Something really crazy happened.";
          }
          
          var match = matches[0];
          var post = match.substring(0, match.length - 1).substring(1);
          
          if(!data[pre]) {
            data[pre] = {};
          }
          // Otherwise just assume it's an object I guess.
          
          data[pre][post] = val;
        }
        else {
          data[n] = val;
        }
      }
      
      return data;
    }
    
    function populateErrorList(errors) {
      if(!settings.autoShowErrors || !settings.errorListSelector || !errors) {
        return false;
      }
      
      var ul = $(settings.errorListSelector);
      
      if(ul[0].children.length > 0) {
        ul.empty();
      }
      
      for(var i in errors) {
        if(typeof(errors[i]) == 'string') {
          var li = $('<li/>').text(errors[i]);
          ul.append(li);
        }
      }
    }
    
    d.onSubmit = function() {
      var data = getData();
      
      // If there is an error list we should clear it.
      if(settings.errorListSelector && settings.autoShowErrors) {
        $(settings.errorListSelector).empty();
      }
      
      // Initiate the post.
      var method = $(form).attr('method') || 'POST';
      var action = $(form).attr('action');
      
      if(!action) {
        throw "No action specified on the element. Sepecify one so we know where to post to!";
      }
      
      // Figure out what the format of the return message is going to be.
      if(settings.requestType == 'json') {
        // Ensure that the action ends with .json to tell the server side that
        // thsi is a JSON request!
        var matches = action.match(/\..*/);
        
        // TODO: Figure out if we should rip off the end of the thing. Perhaps in certain cases
        // we should, i.e. if it ends in .xml or something?
        if(!matches || (matches.length < 1) || (matches[0].toLowerCase() != '.json')) {
          action += '.json'
        }
      }
      
      // Whew, this is crazyness.
      $.ajax({
        url: action,
        type: method,
        data: data,
        beforeSend: settings.submitStart,
        complete: settings.submitDone,
        success: function(data, request, status) {
          if($.isFunction(settings.success)) {
            settings.success(data, request, status);
          }
        },
        error: function(jqXHR, textStatus, errorThrown) { 
          if($.isFunction(settings.error)) {
            // Get the response text and turn it in to JSON.
            var json = null;
            
            try {
              var json = JSON.parse(jqXHR.responseText);
            }
            catch(err) {
              throw "Failed to parse JSON message '" + jqXHW.responseText + "' Error: " + err;
            }
            
            populateErrorList(json);
            
            // Send across the errors too.
            settings.error(json);
          }
        }
      });
      
      return false;
    }
    
    // Wire up any event handlers here.
    $(form).submit(function() { return d.onSubmit(); });
    
    return d;
  }

  $.fn.dynamicForm = function(options) {
    this.each(function() {
      if(!$.dynamicForms) {
        $.dynamicForms = [];
      }
      
      $.dynamicForms.push(new DynamicForm(this, options));
    });
  };

  $(function() {
    $('form[data-dynamic]').dynamicForm();
  });
})(jQuery);