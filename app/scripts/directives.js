(function () {
  'use strict';

  // directive for validating forms
  function FormValidation($timeout) {
    return {
      restrict: 'A',
      require:  '^form',
      link: function (scope, el, attrs, ctrl) {
        var inputEl   = el[0].querySelector('[name]');
        var inputNgEl = angular.element(inputEl);
        var inputName = inputNgEl.attr('name');

        // only apply the has-error class after user presses button
        scope.$on('form-validation-check-validity', function () {
          el.toggleClass('has-error', ctrl[inputName].$invalid);
        });

        // reset form
        scope.$on('form-validation-reset', function () {
          $timeout(function () {
            el.removeClass('has-error');
          }, 0, false);
        });
      }
    };
  }

  angular.module('schoolApp.directives', [])
    .directive('formValidation', ['$timeout', FormValidation]);

})();
