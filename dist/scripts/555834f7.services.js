'use strict';

angular.module('schoolApp.services',['base64'])
  .factory('Service',['$resource','$state','$http',Service])
  .service('popupService',['$window',popupService])
  .service('AuthService',['$resource','$base64','$http',AuthService])
  .factory('ContactService',['$resource',ContactService]);

// Rest Service methods 'get','put','delete'
function Service($resource,$state,$http) {
    // $resource will return data from rest-call
    //return $resource('http://oregonask-service.herokuapp.com/api/:table/:id',{table:'@_table',id:'@_id'},{
    return $resource('http://0.0.0.0:8080/api/:table/:id',{table:'@_table',id:'@_id'},{
      // Set headers on Service request
        save: {
          method: 'put'
        }
    })
};

function popupService($window){
    this.showPopup=function(message){
        return $window.confirm(message);
    }
};

// AuthService calls rest service for login/create accounts
// (uses Basic Authentication)
function AuthService($resource, $base64,$http) {
    this.Authenticate = function(user,pass,key) {
      //return $resource('http://oregonask-service.herokuapp.com/api/login',{}, {
      return $resource('http://0.0.0.0:8080/api/login',{}, {
        login: {
            method : 'get',
            headers: {'Authorization':'Base ' + $base64.encode(user + ':' + pass)}
          },
        create: {
          method : 'put',
          headers: {'Authorization':'Base ' + $base64.encode(user + ':' + pass + ':' + key)}
          }
        })
    }
};

function ContactService($resource) {
  return $resource('http://0.0.0.0:8080/api/contactsAPI/:table', {table:'@_table'}, {
      save: {
        method: 'put'
      }
  })
};
