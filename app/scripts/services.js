'use strict';

angular.module('schoolApp.services',['base64','ngCookies'])
  .factory('Service',['$resource','$state','$cookies','$http',Service])
  .service('popupService',['$window',popupService])
  .service('AuthService',['$resource','$base64',AuthService])
  .service('DataService',[DataService]);

// Rest Service methods 'get','put','delete'
function Service($resource,$state,$cookies,$http){
    // Set headers on Service request
    $http.defaults.headers.common['Cache-Control'] = 'no-cache';
    $http.defaults.headers.common['Token'] = $cookies.token;

    // $resource will return data from rest-call
    // interceptor will fire on server responseError, delete token, redirect to login
    //  (session most likely expired)
    return $resource('//localhost:8080/api/:table/:id',{table:'@_table',id:'@_id'},{
        'save': {
          method: 'put',
          interceptor: {
            responseError: function (data) {
              delete $cookies["token"]
              $state.go('login');
            }
          }
        },
        'query': {
          method: 'get',
          isArray: true,
          interceptor: {
            responseError: function (data) {
              delete $cookies["token"]
              $state.go('login');
            }
          }
        },
        'delete': {
          method: 'delete',
          interceptor: {
            responseError: function (data) {
              delete $cookies["token"]
              $state.go('login');
            }
          }
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
function AuthService($resource, $base64) {
    this.Authenticate = function(user,pass,key) {
      console.log('user : ' + user + ', pass : ' + pass);
      return $resource('//localhost:8080/api/login',{}, {
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

// DataService shares members of ListCtrl with other controller
function DataService() {
  this.setData = function(data) {
    this.data = data;
  }
}
