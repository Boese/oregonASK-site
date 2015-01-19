angular.module('schoolApp.new-contacts-controller', [])
.controller('NewContactsCtrl',['$scope','$state','$stateParams','ContactService',NewContactsCtrl]);

function NewContactsCtrl($scope,$state,$stateParams,ContactService) {
  (function loadContacts() {
    ContactService.get().$promise
      .then(function success(data) {
        console.log(data);
      })
      .catch(function error(error) {
        console.log(error.status);
      })
  })();

}
