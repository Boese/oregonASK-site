(function () {
  'use strict';

  //Services : Service, PopupService, ContactService, AuthService

  // Rest Service methods 'get','put','delete'
  function Service($resource) {
    // $resource will return data from rest-call
    return $resource('http://oregonask-service.herokuapp.com/api/:table/:id', {table: '@_table', id: '@_id'}, {
    //return $resource('http://192.168.11.148:8080/api/:table/:id', {table: '@_table', id: '@_id'}, {
      // Set headers on Service request
        query: {
          method: 'get',
          isArray: true
        },
        save: {
          method: 'put'
        },
        search: {
          method: 'put',
          isArray: true
        }
      });
  }

  // Alert Service
  function PopupService($window) {
    this.showPopup = function (message) {
        return $window.confirm(message);
      };
  }

  // AuthService calls rest service for login/create accounts
  // (uses Basic Authentication)
  function AuthService($resource, $base64) {
      this.Authenticate = function (user, pass, key) {
        return $resource('http://oregonask-service.herokuapp.com/api/login', {}, {
        //return $resource('http://192.168.11.148:8080/api/login', {}, {
          login: {
              method : 'get',
              headers: {'Authorization': 'Base ' + $base64.encode(user + ':' + pass)}
            },
            create: {
              method : 'put',
              headers: {'Authorization': 'Base ' + $base64.encode(user + ':' + pass + ':' + key)}
            }
          });
      };
    }

  // Contacts api Service
  function ContactService($resource) {
    return $resource('http://oregonask-service.herokuapp.com/api/contactsAPI/:table', {table: '@_table'}, {
    //return $resource('http://192.168.11.148:8080/api/contactsAPI/:table', {table: '@_table'}, {
        save: {
          method: 'put'
        }
      });
  }

  angular.module('schoolApp.services', ['base64'])
    .factory('Service', ['$resource', Service])
    .service('PopupService', ['$window', PopupService])
    .service('AuthService', ['$resource', '$base64', AuthService])
    .factory('ContactService', ['$resource', ContactService]);

})();
