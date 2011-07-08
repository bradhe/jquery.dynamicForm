(function($) {
  function DynamicForm(form, options) {
    var d = {};

    var settings = {
      // Callback for when the AJAX request is done and stuff.
      success: null,
      // Callback for when an error occurs server side.
      error: null,
      // Selector for where to poop error messages from validation on to.
      errorListSelector: null,
      // Callback for when AJAX starts.
      submitStart: function() {}, // Just swallow these things.
      // Callback for when AJAX is complete.
      submitDone: function() {},
      // Automatically populate $(errorListSelector) with error messages in the form of <li/>'s
      autoShowErrors: true,
      // The type of data to expect from the server. JSON will automatically parse the string to an object.
      responseType: 'json',
      // Automatically hook up the submit event for the form element.
      autoWireSubmit: true,
      contentType: null
    };

    if(options) {
      $.extend(settings, options);
    }

    // Do a good deed, make sure response type is lower case.
    settings.responseType = settings.responseType.toLowerCase();

    function getData() {
      var elements = $(form).find('input, select, textarea');

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
          if(data[pre][post] && !$.isArray(data[pre][post])) {
            data[pre][post] = [data[pre][post], val];
          }
          else if(data[pre][post]) {
            data[pre][post].push(val);
          }
          else {
            data[pre][post] = val;
          }
        }
        else {
          // Wish I didn't have to copy-pasta this.
          if(data[n] && !$.isArray(data[n])) {
            data[n] = [data[n], val];
          }
          else if(data[n]) {
            data[n].push(val);
          }
          else {
            data[n] = val;
          }
        }
      }

      return data;
    }

    function onError(jqXHR, textStatus, errorThrown) {
      if(settings.responseType == 'json') {
        // Get the response text and turn it in to JSON.
        var json = null;

        try {
          json = JSON.parse(jqXHR.responseText);
        }
        catch(err) {
          // Just fail I guess...
          //throw "Failed to parse JSON message '" + jqXHR.responseText + "' Error: " + err;
        }

        if(json != null) {
          populateErrorList(json);
        }

        // Send across the errors too.
        if($.isFunction(settings.error)) {
          settings.error(json);
        }
      }
      else {
        // Send across the errors too.
        if($.isFunction(settings.error)) {
            settings.error(jqXHR.responseText);
        }
      }
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
      // Initiate the post.
      var method = $(form).attr('method') || 'POST';
      var action = $(form).attr('action');

      if(!action) {
        throw "No action specified on the element. Sepecify one so we know where to post to!";
      }

      return d.submit(action, method, getData());
    }

    d.submit = function(action, method, data) {
      // Yoink the data from the form if we haven't already.
      if(!data) {
        data = getData();
      }

      // If there is an error list we should clear it.
      if(settings.errorListSelector && settings.autoShowErrors) {
        $(settings.errorListSelector).empty();
      }

      // Ensure that the action ends with .json to tell the server side that
      // thsi is a JSON request!
      var matches = action.match(/\..*/);
      var extension = '.' + settings.responseType;

      // TODO: Figure out if we should rip off the end of the thing. Perhaps in certain cases
      // we should, i.e. if it ends in .xml or something?
      if(!matches || (matches.length < 1) || (matches[0].toLowerCase() != extension)) {
        action += extension;
      }

      // If the method isn't defined we should try to deduce the method.
      // If we can't deduce the method, default to POST.
      if(!method) {
        method = $(form).attr('method') || 'POST';
      }
      else if(typeof(method) == 'string') {
        if(method.toUpperCase() == 'DELETE') {
          method = 'POST';
          data['_method'] = 'delete'
        }
        else if(method.toUpperCase() == 'PUT'){
          method = 'POST';
          data['_method'] = 'put'
        }
      }

      // Whew, this is crazyness.
      $.ajax({
        url: action,
        type: method,
        data: data,
        contentType: settings.contentType || 'application/x-www-form-urlencoded',
        beforeSend: function() {
            // TODO: Make sure that buttons that SHOULD be disabled don't end up un-disabled.
            $(form).find('input[type="submit"], button[type="submit"]').attr('disabled', true);
            settings.submitStart();
        },
        complete: function() {
            $(form).find('input[type="submit"], button[type="submit"]').removeAttr('disabled');
            settings.submitDone();
        },
        success: function(data, request, status) {
          if($.isFunction(settings.success)) {
            settings.success(data, request, status);
          }
        },
        error: onError
      });

      return false;
    }

    if(settings.autoWireSubmit) {
      // Wire up any event handlers here.
      $(form).submit(function() { return d.onSubmit(); });
    }

    return d;
  }

  var DATA_NAME = 'dynamicForm';

  $.fn.dynamicForm = function(options) {
    if(typeof(options) == 'object' || options == undefined) {
      this.each(function() {
        if(!$.dynamicForms) {
          $.dynamicForms = [];
        }

        var form = new DynamicForm(this, options);
        $(this).data(DATA_NAME, form);
      });
    }
    else if(typeof(options) == 'string') {
      $(this).data(DATA_NAME)[options]();
    }

    // Don't break chaining.
    return this;
  };

  $(function() {
    $('form[data-dynamic]').dynamicForm();
  });
})(jQuery);
