'use strict';

angular.module('schoolApp.controllers', ['ngTable','ngCookies','ngSanitize','ui.select'])
    .controller('DataCtrl',['$scope','$state','$http','$cookieStore',DataCtrl])
    .controller('ListCtrl',['$scope','$state','popupService','$window','$filter','ngTableParams','Service',ListCtrl])
    .controller('ViewCtrl',['$scope','$state','$stateParams','Service',ViewCtrl])
    .controller('EditCtrl',['$scope','$state','$stateParams','Service', 'ModelService',EditCtrl])
    .controller('LoginCtrl',['$scope','$state','$http','$stateParams','$cookieStore','AuthService','Service',LoginCtrl]);

function DataCtrl($scope, $state, $http, $cookieStore) {
  try {
    $scope.url = $state.current.data.url;
    $scope.model = $state.current.data.model;   // name of Entity
    $scope.first = $state.current.data.first;    // name of first column in models list, searched by this
    $scope.second = $state.current.data.second;  // name of 2nd column in models list
    $scope.third = $state.current.data.third;    // name of 3rd column in models list
    $scope.returnstate = $state.current.data.returnstate;  // return state after create,update, or delete
  } catch(err) {}

  $http.defaults.headers.common['Cache-Control'] = 'no-cache';
  $http.defaults.headers.common['Token'] = $cookieStore.get('token');

  $scope.notSorted = function(obj){
    if (!obj) {
      return [];
    }
    return Object.keys(obj);
  }
}

// List of models
function ListCtrl($scope, $state, popupService, $window, $filter, ngTableParams, Service) {

    $scope.getColumn = function(table,name) {
      return table[name];
    };

    // Sort models alphabetically, search based $scope.first
    $scope.load = function() {
      Service.query({table:$scope.model}, function(data) {
        var filterOb = {};
        var sortOb = {};
        filterOb[$scope.first] = undefined;
        filterOb[$scope.second] = undefined;
        filterOb[$scope.third] = undefined;
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

  // Load parent name (school/sponsor)
  function loadParent(parentName,id) {
    Service.get({table:parentName, id:id}).$promise
      .then(function success(data) {
        data = data.toJSON();
        $scope.modelOnly[parentName] = data['NAME'];
      })
      .catch(function error(error) {
        console.log(error);
      });
  }

  function load() {
    Service.get({table:$scope.model, id: $stateParams.id }).$promise
      .then(function success(data) {
        data = data.toJSON();
        // Assign modelOnly data to modelOnly & array data to modelArray
        for(var key in data) {
          if(data[key] instanceof Array) {
            for(var index in data[key]) {
              $scope.modelArray[key + index] = data[key][index];
            }
          }
          else if(key.indexOf('_ID') !== -1) {
            loadParent(key.replace('_ID',''),data[key]);
          }
          else {
            $scope.modelOnly[key] = data[key];
          }
        }
      })
      .catch(function error(error) {
        console.log(error);
      });
  };

  $scope.removeNumbers = function(word) {
    return word.replace(/[0-9]/g, '').toUpperCase();
  }

  load();
}

// Edit a model
function EditCtrl($scope, $state, $stateParams, Service, ModelService) {
  $scope.modelOnly = {};
  $scope.modelArray = {};
  $scope.modelJSON = {};
  $scope.entity = {};
  $scope.error = '';

  $scope.save = function() { //create a new model. Issues a PUT to /api/*
    // Make sure required fields are entered
    if($scope.entity[$scope.first] === undefined ||
      $scope.entity[$scope.second] === undefined ||
      $scope.entity[$scope.third] === undefined) {
      $scope.error = 'Must enter all the red fields above'
      return;
    }
    if($scope.entity[$scope.first].length < 1 ||
      $scope.entity[$scope.second].length < 1 ||
      $scope.entity[$scope.third].length < 1) {
        $scope.error = 'Must enter all the red fields above'
        return;
      }
    // If valid, save model to database
    Service.save({table:$scope.model}, $scope.entity, function() {
      $state.go($scope.returnstate);
    })
  };

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

function LoginCtrl($scope, $state, $http, $stateParams,$cookieStore,AuthService,Service) {

  $scope.user = { email:'',password:'',key:''};
  $scope.message = '';

  // On load remove token
  (function clearTokens() {
    $cookieStore.remove('token');
  })();

  $scope.loggedin = function() {
    if(($cookieStore.get('token') != null) && ($cookieStore.get('token') !== undefined))
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
          if(data.Token) {
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
          $scope.message = 'Login failed, check your email and password';
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
    $state.go('login')
  }
}
