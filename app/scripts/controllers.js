(function () {
  'use strict';

  // Controllers : DataCtrl, ListCtrl, ViewCtrl, EditCtrl

  function DataCtrl($scope, $state, $http, $cookieStore, Service, AuthService, $rootScope, $window) {
    $http.defaults.headers.common['Cache-Control'] = 'no-cache';
    $http.defaults.headers.common.Token = $cookieStore.get('token');

    $scope.user = { email: '', password: '', key: ''};
    $scope.message = '';
    $scope.loading = false;

    $scope.loggedin = function () {
      if (($cookieStore.get('token') !== null) && ($cookieStore.get('token') !== undefined)) {
        return true;
      }
      else {
        return false;
      }
    };

    $scope.clearTokens = function () {
      $scope.$broadcast('form-validation-reset');
      $scope.user = { email: '', password: '', key: ''};
    };

    // Toggle Login/Logout based on cookie token
    $scope.$watch('loggedin()', function () {
      $scope.loginbutton = $scope.loggedin() ? 'Logout' : 'Login';
      $scope.loginTitle = $scope.loggedin() ? 'Your logged in, Select a Data Table above' : 'Please Login';
    });

    // Login button on form. Validate Form & login
    $scope.login = function (form) {
      $scope.$broadcast('form-validation-check-validity');
      // If form is invalid, return
      if (form.$invalid) { return; }
      $scope.loading = true;

      // Clear any existing token cookie
      AuthService.Authenticate($scope.user.email, $scope.user.password).login().$promise
        // Server responded
        .then(function success(data) {
          if (data.Token) {
            $cookieStore.put('token', data.Token);
            $scope.initialize();
            $scope.loading = false;
          }
          // Server responded with error message
          else {
            $scope.message = 'Login failed, check your email and password';
            $scope.loading = false;
          }
        })
        // Server didn't respond
        .catch(function error() {
          $scope.message = 'Server might be down. Please try again shortly or refresh the page';
          $cookieStore.remove('token');
          $scope.loading = false;
        });
    };

    // Create button on form. Validate Form & create account
    $scope.create = function (form) {
      $scope.$broadcast('form-validation-check-validity');

      // If form is invalid, return
      if (form.$invalid) { return; }
      $scope.loading = true;

      // Call AuthService to create new account
      AuthService.Authenticate($scope.user.email, $scope.user.password, $scope.user.key).create().$promise
        // Server resonded
        .then(function success(data) {
            var result = data.message;
            // Server responded with success message
            if (result === 'success') {
              $scope.message = 'Account created successfully';
              $scope.loading = false;
              $state.go('login');
            }
            // Server responded with fail message
            else {
              $scope.message = 'Account creation failed, check to make sure your key is valid';
              $scope.loading = false;
            }
          })
        // Server didn't respond
        .catch(function error() {
          $scope.message = 'Server might be down. Please try again shortly or refresh the page';
          $cookieStore.remove('token');
          $scope.loading = false;
        });
    };

    // On logout, remove token cookie
    $scope.logout = function () {
      $cookieStore.remove('token');
      $scope.message = '';
      $state.go('data.login');
    };

    $scope.navCollapsed = true;
    $scope.collapse = function () {
      $scope.navCollapsed = !$scope.navCollapsed;
    };

    $scope.dataTables = [];
    $scope.initialize = function() {
      $http.defaults.headers.common.Token = $cookieStore.get('token');
      Service.query({table: 'initialize'}).$promise
        .then(function success(data) {
          $scope.dataTables = angular.copy(data);
          $state.go('data.login');
        })
        .catch(function error() {
          $state.go('data.login');
        });
    }

    $scope.initialize();

    // ** HELPER FUNCTIONS FOR ALL CONTROLLERS
    $rootScope.goBack = function(){
      $window.history.back();
    }
    // Used for keeping order of keys in ng-repeat
    $scope.notSorted = function (obj) {
      if (!obj) {
        return [];
      }
      return Object.keys(obj);
    };

    // Used for Recursive template
    $scope.type = function (thing) {
			switch(typeof thing){
				case "object":
					if(Object.prototype.toString.call(thing) === "[object Array]"){
						return 'array'
					} else if (thing == null) {
						return 'null'
					} else {
						return 'hash'
					}
				case "string":
          return "string"
        case "number":
          return "string"
        case "boolean":
          return "string"
				default:
					return typeof thing
			}
		}

    // Copy all values of existing object into new object
    $scope.deepExtend = function (src, dst) {
      _.each(dst, function(val, prop) {
        if(_.isArray(val)) {
          _.each(val, function(val2, prop2) {
            if(!src[prop][prop2]) {
              src[prop].push(val2);
            }
            src[prop][prop2] = $scope.deepExtend(src[prop][prop2], val2);
          })
        } else if(_.isObject(val)) {
          src[prop] = $scope.deepExtend(src[prop],val)
        } else {
          if(prop.toUpperCase() !== 'LAST_EDIT_BY' && prop.toUpperCase() !== 'TIME_STAMP') {
            src[prop] = dst[prop];
          }
        }
      })
      return src;
    }

    // Sort object : Properties -> Objects -> Arrays
    $scope.sortObject = function (object) {
      var sortedObj = {},
          keys = _.keys(object);

      // sorting object based on value.length -> arrays are pushed to end of object
      keys = _.sortBy(keys, function(key){
        if(_.isArray(object[key]))
          return 2;
        else if (_.isObject(object[key]))
          return 1;
        else
          return 0;
      });

      _.each(keys, function(key) {
          // if array, push each recursed sorted object into array
          if(_.isArray(object[key])) {
            sortedObj[key] = [];
            for(var x in object[key]) {
              sortedObj[key].push($scope.sortObject(object[key][x]))
            }
          }
          // else if object, recurse sorted object
          else if(_.isObject(object[key])){
              sortedObj[key] = $scope.sortObject(object[key]);
          // else save object
          } else {
              sortedObj[key] = object[key];
          }
      });

      return sortedObj;
    }
  }

  // List of models
  function ListCtrl($scope, $state, $stateParams, PopupService, $window, $filter, NgTableParams, Service) {
      $scope.loading = true;
      $scope.properties = [];
      $scope.model = $stateParams.model;

      $scope.getColumn = function (table, name) {
        return table[name];
      };

      (function loadProperties() {
        Service.get({table: $scope.model, id: 'new'}).$promise
          .then(function success(data) {
            data = data.toJSON();
            for(var key in data) {
              if (!_.isObject(data[key])) {
                $scope.properties.push(key);
              }
            }
            $scope.first = $scope.properties[0];
            $scope.second = $scope.properties[1];
            $scope.third = $scope.properties[2];
            load();
          })
          .catch(function error() {
            $scope.loading = false;
            $state.go('data.login');
          })
      })();

      // Sort models alphabetically, search based $scope.first
      function load() {
        Service.query({table: $scope.model}).$promise
          .then(function success(data) {
            var filterOb = {};
            var sortOb = {};
            filterOb[$scope.first] = undefined;
            filterOb[$scope.second] = undefined;
            filterOb[$scope.third] = undefined;


            $scope.tableParams = new NgTableParams({
              page: 1,
              count: 10,
              filter: filterOb,
              sorting: sortOb,
            }, {
              total: data.length,
              getData: function ($defer, params) {
                var filteredData = params.filter() ?
                $filter('filter')(data, params.filter()) :
                data;

                params.total(filteredData.length); // set total for recalc pagination
                $defer.resolve(filteredData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                $scope.loading = false;
              }
            });
          })
          .catch(function error() {
            $scope.loading = false;
            $state.go('data.login');
          });
      };

      $scope.delete = function (id) {
        if (PopupService.showPopup('Really delete this?')) {
          $scope.loading = true;
          Service.delete({table: $scope.model, id: id}).$promise
            .then(function success() {
              $scope.loading = false;
              $state.transitionTo($state.current, {model:$scope.model}, {
                  reload: true,
                  inherit: false,
                  notify: true
              });
            })
            .catch(function error() {
              $scope.loading = false;
              $state.go('data.login');
            });
        }
      };
    }

  // View a single model's data
  function ViewCtrl($scope, $state, $stateParams, Service, $q) {
    $scope.model = $stateParams.model;

    (function load() {
      Service.get({table: $scope.model, id: $stateParams.id}).$promise
        .then(function success(data) {
          $scope.value = $scope.sortObject(data.toJSON());
        })
        . catch(function error() {
          $scope.loading = false;
          $state.go('data.login');
        })
    })();

    $scope.parents = {};
    $scope.getParent = function (key, id) {
      if(id === 0) {
        return -1;
      }
      if($scope.parents[key+id]) {
        return key+id;
      }
      key = key.toUpperCase().replace('_ID','');
      Service.get({table:key, id:id }).$promise
        .then(function success(data) {
          $scope.parents[key+id] = data.toJSON();
        })
        .catch(function error() {
          $state.go('data.login');
        })
      return key+id;
    }
  }

  // Edit a model
  function EditCtrl($scope, $state, $stateParams, Service, PopupService) {
  $scope.model = $stateParams.model;
  $scope.loading = false;

    // Save new Object
    $scope.save = function () { //create a new model. Issues a PUT to /api/*
      // If valid, save model to database
      $scope.loading = true;
      Service.save({table: $scope.model}, $scope.value).$promise
        .then(function success(data) {
          $scope.loading = false;
          $state.go('data.list', {model: $scope.model});
        })
        .catch(function error() {
          $scope.loading = false;
          $state.go('data.login');
        });
    };

    $scope.delete = function (table, id, index) {
      if(!id) {
        if(table !== $scope.model) {
          removeTable(index, table, $scope.value);
        }
      } else {
        if (PopupService.showPopup('Really delete this?')) {
          $scope.loading = true;
          Service.delete({table: table, id: id}).$promise
            .then(function success(data) {
              removeTable(index, table, $scope.value);
              $state.go('data.list', {model: $scope.model});
              $scope.loading = false;
            })
            .catch(function error() {
              $scope.loading = false;
              $state.go('data.login');
            });
        }
      }
    };

    function removeTable(index, tableName, table) {
      _.each(table, function (val, key) {
        if(key === tableName) {
          table[key].splice(index,1);
          if(table[key].length < 1)
            table[key] = undefined;
          return;
        }
        if(_.isArray(val)) {
          _.each(val, function (val2, key2) {
            removeTable(index, key2, val2)
          })
        } else if(_.isObject(val)) {
          removeTable(index, key, val)
        }
      })
    }

    // When adding item to Array, clear values from it
    $scope.clearValues = function (table) {
      var temp = angular.copy(table);
      _.each(table, function(val, prop) {
        if(_.isArray(val)) {
          _.each(val, function(val2, prop2) {
            temp[prop][prop2] = $scope.clearValues(val2);
          })
        } else if(_.isObject(val)) {
          temp[prop] = $scope.clearValues(val);
        } else {
          temp[prop] = "";
        }
      })
      return temp;
    }



    // Determines if valid FK field, ex. school_id
    // Also determines if FK is nested in parent table, if so don't search
    $scope.checkForParent = function (key) {
      if(key.toUpperCase().indexOf('_ID') === -1) {
        return false;
      }

      key = key.toUpperCase().replace('_ID','');
      if(key === $scope.model.toUpperCase()) {
        return false;
      }

      return !checkParent($scope.value, key);
    }

    // Recursive function to check if FK links to Parent Table in Object
    function checkParent(data, key) {
      var hasParent = false;
      for(var prop in data) {
        if(prop.length > 1 && prop.toUpperCase() === key) {
          hasParent = true;
          break;
        }
        else if(_.isArray(data[prop])) {
          if(checkParent(data[prop],key)) {
            hasParent = true;
            break;
          }
        }
      }
      return hasParent;
    }

    // Get parent list for parent search option
    $scope.options = {};
    $scope.getParent = function (table) {
      if(!$scope.options[table]) {
        $scope.options[table] = [];
        Service.query({table: table}).$promise
        .then(function success(data) {
          $scope.options[table] = data;
        })
        .catch(function error() {
          $state.go('data.login');
        });
      } else {
        return $scope.options[table];
      }
    }

    // Load Existing Object
    function loadModel(val) {
      Service.get({table: $scope.model, id: $stateParams.id}).$promise
        .then(function success(data) {
            $scope.value = $scope.sortObject($scope.deepExtend(val,data.toJSON()));
        })
        .catch(function error() {
          $state.go('data.login');
        });
    }

    // Load new Object
    function loadNewModel() {
      Service.get({table: $scope.model, id: 'new'}).$promise
        .then(function success(data) {
          if ($stateParams.id) {
            loadModel(data.toJSON());
          } else {
            $scope.value = $scope.sortObject(data.toJSON());
          }
        })
        .catch(function error() {
          $state.go('data.login');
        });
    }

    loadNewModel();
  }

  function EditTableCtrl ($scope, $state, $stateParams, Service, PopupService) {
    $scope.parentTables = angular.copy($scope.dataTables);
    $scope.tableName = $stateParams.table;
    $scope.parents = [];
    $scope.props = [];
    $scope.add = true;

    $scope.table = {
      name: $scope.tableName,
      rename:[],
      add:[],
      drop:[],
      addParents:[],
      dropParents:[]
    };

    $scope.deleteTable = function () {
      if (PopupService.showPopup('Really delete this?')) {
        Service.delete({table: 'delete_table', id: $scope.tableName}).$promise
          .then(function success(data) {
            alert('success');
            $scope.initialize();
          })
          .catch(function error() {
            $state.go('data.login');
          });
      }
    }

    $scope.submitTable = function () {
      if($scope.table.name.length < 1) {
        alert('Enter table name');
        return;
      }
      if($scope.table.add.indexOf('') !== -1) {
        alert('Enter empty add property fields');
        return;
      }
      if($scope.table.addParents.indexOf('') !== -1) {
        alert('please select parents to add');
        return;
      }

      if($scope.add) {
        if (PopupService.showPopup('Really create this table?')) {
          Service.save({table: 'create_table'}, $scope.table).$promise
            .then(function success(data) {
              alert('success');
              $scope.initialize();
            })
            .catch(function error() {
              $state.go('data.login');
            });
        }
      } else {
        if (PopupService.showPopup('Really alter this table?')) {
          Service.save({table: 'alter_table'}, $scope.table).$promise
            .then(function success(data) {
              alert('success');
              $scope.initialize();
            })
            .catch(function error() {
              $state.go('data.login');
            });
        }
      }
    }

    $scope.getTable = function() {
      var tableFormat = [];
      tableFormat = _.union(tableFormat,$scope.parents,$scope.props,$scope.table.add,$scope.table.addParents);
      tableFormat = _.difference(tableFormat,$scope.table.drop,$scope.table.dropParents);

      _.each($scope.table.rename, function (val,key) {
        var idx = tableFormat.indexOf(val.old);
        tableFormat[idx] = val.new;
      });
      return tableFormat;
    }

    $scope.dropParent = function (prop) {
      prop = prop.toUpperCase().replace('_ID','');
      var idx = $scope.table.dropParents.indexOf(prop);
      if(idx !== -1) {
        $scope.table.dropParents.splice(idx,1);
      } else {
        $scope.table.dropParents.push(prop);
      }
    }

    $scope.dropProp = function (prop) {
      var idx = $scope.table.drop.indexOf(prop);
      if(idx !== -1) {
        $scope.table.drop.splice(idx,1);
      } else {
        $scope.table.drop.push(prop);
      }
    }

    $scope.rename = function (oldName, newName) {
      var idx = $scope.props.indexOf(oldName);
      $scope.props[idx] = newName;
      $scope.table.rename.push({
        'old' : oldName,
        'new' : newName
      })
    };

    (function loadTableProperties() {
      if($scope.tableName) {
        var idx = $scope.parentTables.indexOf($scope.tableName);
        $scope.parentTables.splice(idx,1);
        Service.get({table: $scope.tableName, id: 'new'}).$promise
          .then(function success(data) {
            data = data.toJSON();
            _.each(data, function(val,key) {
              if(!_.isArray(val) && !_.isObject(val)) {
                if(key.toUpperCase().indexOf('_ID') !== -1) {
                  $scope.parents.push(key);
                } else {
                  $scope.props.push(key);
                }
              }
            })
            $scope.add = false;

          })
          .catch(function error() {
            $state.go('data.login');
          });
      }
    })();
  }

  angular.module('schoolApp.controllers', ['ngTable', 'ngCookies', 'ngSanitize', 'ui.select'])
      .controller('DataCtrl', ['$scope', '$state', '$http', '$cookieStore', 'Service', 'AuthService', '$rootScope', '$window', DataCtrl])
      .controller('ListCtrl', ['$scope', '$state', '$stateParams', 'PopupService', '$window', '$filter', 'ngTableParams', 'Service', ListCtrl])
      .controller('ViewCtrl', ['$scope', '$state', '$stateParams', 'Service', '$q', ViewCtrl])
      .controller('EditCtrl', ['$scope', '$state', '$stateParams', 'Service', 'PopupService', EditCtrl])
      .controller('EditTableCtrl', ['$scope', '$state', '$stateParams', 'Service', 'PopupService', EditTableCtrl]);
})();
