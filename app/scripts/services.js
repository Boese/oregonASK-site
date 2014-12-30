'use strict';

angular.module('schoolApp.services',['base64','ngCookies'])
  .factory('Service',['$resource','$state','$cookieStore','$http',Service])
  .factory('ModelService',['$resource',ModelService])
  .service('popupService',['$window',popupService])
  .service('AuthService',['$resource','$base64','$http',AuthService]);

// Rest Service methods 'get','put','delete'
function Service($resource,$state,$cookieStore,$http) {


    // $resource will return data from rest-call
    // interceptor will fire on server responseError, delete token, redirect to login
    //  (session most likely expired)
    return $resource('http://oregonask-service.herokuapp.com/api/:table/:id',{table:'@_table',id:'@_id'},{
      // Set headers on Service request
        save: {
          method: 'put'
        },
        query: {
          method: 'get',
          isArray: true
        },
        get: {
          method: 'get',
          isArray: false
        },
        delete: {
          method: 'delete',
          transformRequest : function(data, headerGetter) {
            headerGetter()['Cache-Control'] = 'no-cache';
            headerGetter()['Token'] = $cookieStore.get('token');
          }
        }
    })
};

function ModelService($resource) {
    return $resource('/models/:model.json', {model:'@_model'}, {
      query: {method:'get'}
    });
}

function popupService($window){
    this.showPopup=function(message){
        return $window.confirm(message);
    }
};

// AuthService calls rest service for login/create accounts
// (uses Basic Authentication)
function AuthService($resource, $base64,$http) {
    this.Authenticate = function(user,pass,key) {
      $http.defaults.headers.common['Cache-Control'] = 'no-cache';
      return $resource('http://oregonask-service.herokuapp.com/api/login',{}, {
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
