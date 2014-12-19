'use strict';

angular.module('schoolApp.controllers', ['ngTable','ngCookies','ngSanitize','ui.select'])
    .controller('DataCtrl',['$scope','$state',DataCtrl])
    .controller('ListCtrl',['$scope','$state','popupService','$window','$filter','ngTableParams','Service',ListCtrl])
    .controller('ViewCtrl',['$scope','$state','$stateParams','Service',ViewCtrl])
    .controller('EditCtrl',['$scope','$state','$stateParams','Service', 'ModelService',EditCtrl])
    .controller('LoginCtrl',['$scope','$state','$stateParams','$cookieStore','AuthService',LoginCtrl]);

function DataCtrl($scope, $state) {
  $scope.url = $state.current.data.url;
  $scope.model = $state.current.data.model;   // name of Entity
  $scope.first = $state.current.data.first;    // name of first column in models list, searched by this
  $scope.second = $state.current.data.second;  // name of 2nd column in models list
  $scope.third = $state.current.data.third;    // name of 3rd column in models list
  $scope.returnstate = $state.current.data.returnstate;  // return state after create,update, or delete
}

// List of models
function ListCtrl($scope, $state, popupService, $window, $filter, ngTableParams, Service) {
    $scope.schools = {};
    $scope.selectedSchools = {};

    $scope.getColumn = function(table,name) {
      return table[name];
    };

    // Sort models alphabetically, search based $scope.first
    $scope.load = function() {
      Service.query({table:$scope.model}, function(data) {
        $scope.schools = data;
        var filterOb = {};
        var sortOb = {};
        filterOb[$scope.first] = '';
        filterOb[$scope.second] = '';
        filterOb[$scope.third] = '';
        sortOb[$scope.first] = 'asc';

        $scope.tableParams = new ngTableParams({
              page: 1,
              count: 10,
              filter: filterOb,
              sorting: sortOb,
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
function ViewCtrl($scope,$state,$stateParams, Service) {
  $scope.modelOnly = {}; //data from model only, no sets
  $scope.modelArray = {}; //arrays joined to model

  $scope.notSorted = function(obj){
    if (!obj) {
      return [];
    }
    return Object.keys(obj);
  }

  $scope.load = function() {
    Service.get({table:$scope.model, id: $stateParams.id }).$promise
      .then(function(data) {
        data = data.toJSON();
        // Assign modelOnly data to modelOnly & array data to modelArray
        for(var key in data) {
          if(data[key] instanceof Array) {
            for(var index in data[key]) {
              $scope.modelArray[key + index] = data[key][index];
            }
          }
          else if(data[key] instanceof Object) {
            $scope.modelOnly[key] = data[key]['NAME'];
          }
          else {
            $scope.modelOnly[key] = data[key];
          }
        }
      });
  };

  $scope.removeNumbers = function(word) {
    return word.replace(/[0-9]/g, '').toUpperCase();
  }

  $scope.load();
}

// Edit a model
function EditCtrl($scope, $state, $stateParams, Service, ModelService) {
  $scope.modelOnly = {};
  $scope.modelArray = {};
  $scope.modelJSON = {};
  $scope.entity = {};

  $scope.save = function() { //create a new model. Issues a PUT to /api/*
    Service.save({table:$scope.model}, $scope.entity, function() {
      $state.go($scope.returnstate);
    })
  };

  $scope.notSorted = function(obj){
    if (!obj) {
      return [];
    }
    return Object.keys(obj);
  }

  $scope.expand = function(table) {
    ModelService.get({model:table}, function(data) {
      $scope.modelJSON[table] = data.model;
    })
  }

  $scope.add = function(table) {
    $scope.entity[table].push({});
    $scope.modelArray[table].push($scope.modelJSON[table]);
  }

  $scope.remove = function(table,index) {
    $scope.entity[table].splice(index,index+1);
    $scope.modelArray[table].splice(index,index+1);
  }

  $scope.option = {};
  $scope.options = {};
  $scope.tables = [];

  $scope.loadTables = function() {
    var table = $scope.tables[$scope.tables.length-1];

    if(table === undefined) {
      if($stateParams.id !== undefined)
        $scope.loadModelService();
      return;
    }
      Service.query({table:table}).$promise
      .then(function success(data){
        $scope.options[table] = data;
        $scope.tables.pop();
        $scope.loadTables();
      })
    }

  $scope.loadModelService = function() {
    Service.get({table:$scope.model, id: $stateParams.id }).$promise
    .then(function(data) {
      data = data.toJSON();
      // Assign modelOnly data to modelOnly & array data to modelArray
      for(var key in data) {
        if(data[key] instanceof Array) {
          if(key.indexOf('INFO') != -1) {
            $scope.modelArray[key] = [];
            $scope.entity[key] = [];
            for(var key2 in data[key]) {
              var info = {};
              for(var key3 in data[key][key2]) {
                info[key3] = data[key][key2][key3];
              }
              $scope.modelArray[key].push($scope.modelJSON[key]);
              $scope.entity[key].push(info);
            }
          }
        }
        else if(data[key] instanceof Object) {
          var temp ={};
          temp['id'] = data[key]['id'];
          $scope.entity[key] = temp;
        }
        else {
          $scope.entity[key] = data[key];
        }
      }
    });
  }

  $scope.loadModelJSON = function() {
    ModelService.get({model:$scope.model}).$promise
      .then(function success(data){
        data = data.model;
        for(var key in data) {
          if(data[key] instanceof Array) {
            $scope.expand(key);
            $scope.entity[key] = [];
            $scope.modelArray[key] = [];
          }
          else if(data[key] instanceof Object) {
            $scope.modelOnly[key] = data[key];
            $scope.tables.push(key);
          }
          else {
            $scope.modelOnly[key] = data[key];
          }
        }
        $scope.loadTables();
      });
    }

  $scope.loadModelJSON();
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
            $state.go('schools.list');
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
