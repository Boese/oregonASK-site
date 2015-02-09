'use strict';

angular.module('schoolApp.controllers', ['ngTable','ngCookies','ngSanitize','ui.select'])
    .controller('DataCtrl',['$scope','$state','$http','$cookieStore','Service',DataCtrl])
    .controller('ListCtrl',['$scope','$state','$stateParams','popupService','$window','$filter','ngTableParams','Service',ListCtrl])
    .controller('ViewCtrl',['$scope','$state','$stateParams','Service',ViewCtrl])
    .controller('EditCtrl',['$scope','$state','$stateParams','Service',EditCtrl])
    .controller('LoginCtrl',['$scope','$rootScope','$state','$stateParams','$cookieStore','AuthService',LoginCtrl]);

function DataCtrl($scope, $state, $http, $cookieStore,Service) {
  $http.defaults.headers.common['Cache-Control'] = 'no-cache';
  $http.defaults.headers.common['Token'] = $cookieStore.get('token');

  $scope.dataTables = [];
  $scope.$on('initialize',function(event,args) {
    $http.defaults.headers.common['Token'] = args.token;
    Service.query({table:'initialize'}).$promise
      .then(function success(data) {
        $scope.dataTables = data;
      })
      .catch(function error(err) {
        $state.go('data.login');
      })
  })

  $scope.setTable = function(table) {
    $scope.model = table.model;
    $scope.first = table.first;
    $scope.second = table.second;
    $scope.third = table.third;
  }

  $scope.notSorted = function(obj){
    if (!obj) {
      return [];
    }
    return Object.keys(obj);
  }
}

// List of models
function ListCtrl($scope, $state,$stateParams, popupService, $window, $filter, ngTableParams, Service) {

    $scope.getColumn = function(table,name) {
      return table[name];
    };

    // Sort models alphabetically, search based $scope.first
    $scope.load = function() {
      Service.query({table:$scope.model}).$promise
        .then(function success(data) {
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
        .catch(function error(err) {
          $state.go('data.login');
        })
      }



  $scope.delete=function(mod,id){
    if(popupService.showPopup('Really delete this?')) {
        mod.$delete({table:$scope.model, id: id}).$promise
          .then(function success(data) {
            $state.go('data.list',{model:$scope.model});
          })
          .catch(function error(err) {
            $state.go('data.login')
          })
        };
  }

  $scope.load();
}

// View a single model's data
function ViewCtrl($scope,$state,$stateParams, Service) {
  $scope.modelOnly = {}; //data from model only, no sets
  $scope.modelArray = {}; //arrays joined to model

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
          else if(data[key] instanceof Object)
            $scope.modelOnly[key] = data[key].NAME;
          else
            $scope.modelOnly[key] = data[key];
        }
      })
      .catch(function error(err) {
        $state.go('data.login');
      });
  };

  $scope.removeNumbers = function(word) {
    return word.replace(/[0-9]/g, '').toUpperCase();
  }

  load();
}

// Edit a model
function EditCtrl($scope, $state, $stateParams, Service) {
  $scope.options = {};
  $scope.entity = {};
  $scope.modelOnly = {};
  $scope.modelParent = {};
  $scope.modelArray = {};

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
    Service.save({table:$scope.model}, $scope.entity).$promise
      .then(function success(data) {
        $state.go('data.view',{model:$scope.model,id:$stateParams.id});
      })
      .catch(function error(err) {
        $state.go('data.login');
      })
  }

  function loadParent(table) {
    Service.query({table:table}).$promise
    .then(function success(data) {
      $scope.options[table] = data;
    })
    .catch(function error(err) {
      $state.go('data.login')
    })
  }

  function loadModel() {
    Service.get({table:$scope.model,id:$stateParams.id}).$promise
      .then(function success(data) {
        data = data.toJSON();
        for(var key in data) {
          if(data[key] instanceof Array) {
            $scope.modelArray[key] = [];
            $scope.entity[key] = [];
            for(var key2 in data[key]) {
              var info = {};
              for(var key3 in data[key][key2]) {
                info[key3] = data[key][key2][key3];
              }
              $scope.modelArray[key].push(joins[key][0]);
              $scope.entity[key].push(info);
            }
          }
          else if(key.indexOf('_ID') !== -1) {
            $scope.entity[key.replace('_ID','')] = {id:''};
            $scope.entity[key.replace('_ID','')].id = data[key];
          }
          else {
            $scope.entity[key] = data[key];
          }
        }
      })
      .catch(function error(err) {
        $state.go('data.login')
      })
  }

  var joins = {};
  function loadNewModel() {
    Service.get({table:$scope.model,id:'new'}).$promise
      .then(function success(data) {
        data = data.toJSON();
        for(var key in data) {
          if(data[key] instanceof Array) {
            joins[key] = [];
            $scope.entity[key] = [];
            $scope.modelArray[key] = [];
            joins[key].push(data[key][0]);
          }
          else if(data[key] instanceof Object) {
            loadParent(key);
            $scope.modelParent[key] = data[key]
          }
          else
            $scope.modelOnly[key] = data[key]
        }
        if($stateParams.id)
          loadModel();
      })
      .catch(function error(err) {
        $state.go('data.login')
      })
  }

  $scope.add = function(table) {
    $scope.entity[table].push({});
    $scope.modelArray[table].push(joins[table][0]);
  }

  $scope.remove = function(table,index) {
    $scope.entity[table].splice(index,index+1);
    $scope.modelArray[table].splice(index,index+1);
  }

  loadNewModel();
}

function LoginCtrl($scope, $rootScope, $state, $stateParams,$cookieStore,AuthService) {

  $scope.user = { email:'',password:'',key:''};
  $scope.message = '';

  // On load remove token
  (function clearTokens() {
    $cookieStore.remove('token');
    $scope.$broadcast('form-validation-reset');
    $scope.user = { email:'',password:'',key:''};
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
    $scope.loginTitle = $scope.loggedin() ? 'Your logged in, Select a Data Table above' : 'Please Login';
  })

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
            $rootScope.$broadcast('initialize',{token:data.Token});
          }
          // Server responded with error message
          else {
            $scope.message = 'Login failed, check your email and password';
          }
        })
        // Server didn't respond
        .catch(function error() {
          $scope.message = 'Server might be down. Please try again shortly or refresh the page';
          $cookieStore.remove('token');
        });
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
        $scope.message = 'Server might be down. Please try again shortly or refresh the page';
        $cookieStore.remove('token');
      });
  }

  // On logout, remove token cookie
  $scope.logout = function() {
    $cookieStore.remove('token');
    $scope.message = '';
    $state.go('data.login')
  }
}
