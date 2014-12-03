'use strict';

angular.module('schoolApp.controllers', ['ngTable','ngCookies'])
    .controller('ListCtrl',['$scope','$state','popupService','$window','$filter','ngTableParams','Service','DataService',ListCtrl])
    .controller('ViewCtrl',['$scope','$state','$stateParams','Service','DataService',ViewCtrl])
    .controller('CreateCtrl',['$scope','$state','$stateParams','Service','ModelService','DataService','$http',CreateCtrl])
    .controller('EditCtrl',['$scope','$state','$stateParams','Service','DataService',EditCtrl])
    .controller('LoginCtrl',['$scope','$state','$stateParams','$cookieStore','AuthService',LoginCtrl]);

// List of models
function ListCtrl($scope, $state, popupService, $window, $filter, ngTableParams, Service,DataService) {
    $scope.model = DataService.data.model;   // name of Entity
    $scope.first = DataService.data.first;    // name of first column in models list, searched by this
    $scope.second = DataService.data.second;  // name of 2nd column in models list
    $scope.third = DataService.data.third;    // name of 3rd column in models list
    $scope.returnstate = DataService.data.returnstate;  // return state after create,update, or delete

    $scope.getColumn = function(table,name) {
      return table[name];
    };

    // Sort models alphabetically, search based $scope.first
    $scope.load = function() {
      Service.query({table:$scope.model}, function(data) {
        var filter = {}
        filter[$scope.first] = '';

        $scope.tableParams = new ngTableParams({
              page: 1,
              count: 10,
              filter: filter,
              sorting: {
                name: 'asc'
              },
            }, {
              total: data.length,
              getData: function($defer, params) {
                var filteredData = params.filter() ?
                        $filter('filter')(data, params.filter()) :
                        data;
                var orderedData = params.sorting() ?
                        $filter('orderBy')(filteredData, params.orderBy()) :
                        data;

                params.total(orderedData.length); // set total for recalc pagination
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
              }
            })
      })
    }

  $scope.delete=function(mod,id){
        if(popupService.showPopup('Really delete this?')){
            mod.$delete({table:$scope.model, id: id},function(){
                $state.go($scope.returnstate);
            });
        }
    }

    $scope.load();
}

// View a single model's data
function ViewCtrl($scope,$state,$stateParams, Service,DataService) {
  $scope.model = DataService.data.model;

  $scope.load = function() {
    Service.get({table:$scope.model, id: $stateParams.id }, function(data) {
      $scope.modelOnly = {}; //data from model only, no sets
      $scope.modelArray = {}; //arrays joined to model

      // Assign modelOnly data to modelOnly & array data to modelArray
      for(var key in data) {
        if(!(data[key] instanceof Array || key === 'toJSON')) {
            $scope.modelOnly[key] = data[key];
        }
        else if(data[key] instanceof Array) {
          for(var index in data[key]) {
            $scope.modelArray[key + index] = data[key][index];
          }
        }
      }
    });
  };

  $scope.removeNumbers = function(word) {
    return word.replace(/[0-9]/g, '').toUpperCase();
  }

  $scope.load();
}

// Create a new model
function CreateCtrl($scope, $state, $stateParams, Service, ModelService, DataService) {
  $scope.model = DataService.data.model;
  $scope.returnstate = DataService.data.returnstate;
  $scope.entity = {};

  $scope.modelOnly = {};
  $scope.modelArray = {};

  $scope.add = function(table) {
    $scope.entity[table][$scope.entity[table].length] = {};
  }

  $scope.remove = function(table) {
    $scope.entity[table].pop();
  }

  $scope.expand = function(table) {
      ModelService.get({model:table}, function(data) {
        $scope.modelArray[table] = data.model;
        $scope.entity[table] = [];
      })
  }

  $scope.notSorted = function(obj){
    if (!obj) {
      return [];
    }
    return Object.keys(obj);
  }

  $scope.loadModel = function() {
    ModelService.get({model:$scope.model}).$promise
      .then(function success(data){
        var result = data.model;
        for(var key in result) {
          if(result[key] instanceof Object) {
            $scope.expand(key);
          }
          else {
            $scope.modelOnly[key] = result[key];
          }
        }
    });
  }

  $scope.save = function() { //create a new model. Issues a PUT to /api/*
    Service.save({table:$scope.model}, $scope.entity, function() {
        $state.go($scope.returnstate);
      })
    };

  $scope.loadModel();
}

// Edit a model
function EditCtrl($scope, $state, $stateParams, Service,DataService) {
  $scope.model = DataService.data.model;
  $scope.returnstate = DataService.data.returnstate;

  $scope.update = function() { //Update the edited model. Issues a PUT to /api/*/:id
    $scope.modelOnly.$save({table:$scope.model},function() {
      $state.go($scope.returnstate); // on success go back to home i.e. schools state.
    });
  };

  $scope.load = function() { //Issues a GET request to /api/*/:id to get a model to update
    $scope.modelOnly = Service.get({table:$scope.model, id: $stateParams.id });
  };

  $scope.load(); // Load a model which can be edited on UI
}

function LoginCtrl($scope, $state, $stateParams,$cookieStore,AuthService) {
  $scope.user = { email:'',password:'',key:''};
  $scope.message = '';

  // Check if token cookie exists
  $scope.loggedin = function() {
    if($cookieStore.get('token'))
        return true;
    else
        return false;
  }

  // Toggle Login/Logout based on cookie token
  $scope.$watch('loggedin()', function(){
    $scope.loginbutton = $scope.loggedin() ? 'Logout' : 'Login';
    $scope.loginTitle = $scope.loggedin() ? 'Your already logged in' : 'Please Login';
  })

  // Clear form
  $scope.reset = function() {
    $scope.$broadcast('form-validation-reset');
    $scope.user = { email:'',password:'',key:''};
  }

  // Login button on form. Validate Form & login
  $scope.login = function(form) {
    $scope.$broadcast('form-validation-check-validity');
    // If form is invalid, return
    if (form.$invalid) { return; }

      // Clear any existing token cookie
      $cookieStore.remove("token");
      AuthService.Authenticate($scope.user.email,$scope.user.password).login().$promise
        // Server responded
        .then(function success(data) {
          var result = data.Token;
          // Server responded with Token
          if(result) {
            $cookieStore.put('token',data.Token);
            $state.go('schools');
          }
          // Server responded with error message
          else {
            $scope.message = 'Login failed, check your email and password';
          }
        })
        // Server didn't respond
        .catch(function error() {
          $scope.message = 'Login failed, the server might be down. Try refreshing the page.';
        });

        // Clear Form
        $scope.reset();
  }

  // Create button on form. Validate Form & create account
  $scope.create = function(form) {
    $scope.$broadcast('form-validation-check-validity');

    // If form is invalid, return
    if(form.$invalid) { return; }

    // Call AuthService to create new account
    AuthService.Authenticate($scope.user.email,$scope.user.password,$scope.user.key).create().$promise
      // Server resonded
      .then(function success(data) {
          var result = data.message;
          // Server responded with success message
          if(result === 'success') {
            $scope.message = 'Account created successfully';
            $state.go('login');
          }
          // Server responded with fail message
          else {
            $scope.message = 'Account creation failed, check to make sure your key is valid';
          }
      })
      // Server didn't respond
      .catch(function error() {
        $scope.message = 'Account creation failed, the server might be down. Try refreshing the page.';
      });
  }

  // On logout, remove token cookie
  $scope.logout = function() {
    $cookieStore.remove('token');
    $scope.message = '';
  }
}
