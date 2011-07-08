(function() {
  module('Initialization');

  test('it should not break chaining', function() {
    var form = $('<form/>');
    equal(form.dynamicForm(), form);
  });

  test('it should put the form object in data under key "dynamicForm"', function() {
    var form = $('<form/>').dynamicForm();
    ok(!!form.data('dynamicForm'));
  });
}());

(function() {
  var form = $('<form/>').dynamicForm();
  var dynamicForm = form.data('form');
}());
