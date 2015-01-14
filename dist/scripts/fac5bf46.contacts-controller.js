angular.module('schoolApp.contacts-controller', ['ngTable',])
  .controller('ContactsCtrl',['$scope','$state','$stateParams','popupService','$filter','ngTableParams','Service',contactsCtrl])
  .filter('propsFilter', [propsFilter]);

// Filter by OR instead of Angular default AND on ui-select
function propsFilter() {
  return function(items, props) {
    var out = [];

    if (angular.isArray(items)) {
      items.forEach(function(item) {
        var itemMatches = false;

        var keys = Object.keys(props);
        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();
          if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
            itemMatches = true;
            break;
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  }
};

// Contacts Controller
function contactsCtrl($scope,$state,$stateParams,popupService,$filter,ngTableParams,Service) {

  $scope.category;
  $scope.categories = [];
  $scope.filteredContacts = [];
  $scope.contact = {};

  // New Category
  $scope.saveCategory = function(newCategory) {
    Service.save({table:'Category'}, newCategory, function() {
      resyncCategories();
    })
  }

  // Delete Category
  $scope.deleteCategory = function() {
    if(popupService.showPopup('Really delete this Category?')){
      Service.delete({table:'Category', id:$scope.category.id},function(){
        resyncCategories();
      });
    }
  }

  // Resync Categories
  function resyncCategories() {
    $scope.clear();
    loadCategories();
  }

  $scope.closeText = "Close";
  $scope.editText = 'Edit';
  $scope.edit = false;
  $scope.newContact = false;

  // Clear Search
  $scope.clear = function() {
    $scope.contact.selected = undefined;
    $scope.entity = undefined;
    $scope.closeText = "Close";
    $scope.editText = 'Edit';
    $scope.edit = false;
  }

  // Close Contact View
  $scope.close = function() {
    if($scope.newContact) {
      $scope.edit = false;
      $scope.newContact = false;
    }
    if($scope.edit) {
      $scope.editText = 'Edit';
      $scope.edit = !($scope.edit);
    } else {
      $scope.clear();
    }
    $scope.closeText = "Close";
  }

  // Toggle Edit View
  $scope.toggleEdit = function() {
    if($scope.edit) {
      $scope.closeText = "Close";
      $scope.editText = 'Edit';
      $scope.save();
    }
    else {
      $scope.closeText = "Cancel edit";
      $scope.editText = 'Save';
    }

    $scope.edit = !($scope.edit);
  }

  // Filter Contacts off category
  function watchCategory() {
    $scope.$watch('category', function(newValue, oldValue) {
      $scope.filteredContacts = [];
      // All Categories
      if(newValue.id === 0)
        loadContacts();

      loadCategory(newValue.id)
    })
  };

  // Load Contacts from Category Selected
  function loadCategory(id) {
    Service.get({table:$scope.first,id:id}).$promise
    .then(function success(data) {
      $scope.filteredContacts = data.contacts;
      for(var key in $scope.filteredContacts) {
        $scope.filteredContacts[key]['FULLNAME'] = $scope.filteredContacts[key]['FIRSTNAME'] + ' ' + $scope.filteredContacts[key]['LASTNAME'];
      }
    })
    .catch(function error(error) {
      console.log(error);
    })
  }

  // Load Categories Set Default to first category
  function loadCategories() {
    Service.query({table:$scope.first}).$promise
      .then(function success(data) {
        $scope.categories = data;
        $scope.categories.push({
          'id': 0,
          'NAME': '**ALL** (slower)'
        });
        $scope.category = $scope.categories[0];
        loadCategory($scope.categories[0].id);
        watchCategory();
      })
      .catch(function error(error) {
        console.log(error);
      })
  }

  // Load Contacts from all Categories
  function loadContacts() {
    Service.query({table:'Contact'}).$promise
    .then(function success(data) {
      $scope.filteredContacts = data;
      for(var key in $scope.filteredContacts) {
        $scope.filteredContacts[key]['FULLNAME'] = $scope.filteredContacts[key]['FIRSTNAME'] + ' ' + $scope.filteredContacts[key]['LASTNAME'];
      }
    })
    .catch(function error(error) {
      console.log(error);
    })
  }

  // Load join tables for Entity
  var tables = [];
  var tableData = {};
  $scope.joins = {};
  function loadTables() {
    if(tables.length > 0) {
      var table = tables[tables.length-1].slice(0, - 1).replace('_','');
      Service.get({table:table, id:'new'}).$promise
        .then(function success(data) {
          tableData[tables[tables.length-1]] = [];
          tableData[tables[tables.length-1]].push(data.toJSON());
          $scope.joins[tables[tables.length-1]] = [];
          tables.pop();
          if(tables.length == 0)
            syncJoins();
          else
            loadTables();
        })
        .catch(function error(error) {
          console.log(error);
        })
    }
  }

  // Sync Join tables data with Entity Join tables
  function syncJoins() {
    for(var key in $scope.entity) {
      if($scope.entity[key] instanceof Array) {
        for(var key2 in $scope.entity[key]) {
          $scope.joins[key].push(tableData[key][0]);
        }
      }
    }
    console.log($scope.joins);
  }

  $scope.isArray = function(value) {
    if(value instanceof Array)
      return true;
    return false;
  }

  $scope.display = function(key,value) {
    if(value !== undefined && key !== 'id' && key !== 'CONTACT' && key !== '$$hashKey' && key !== 'CONTACTS')
      return true;
    return false;
  }

  $scope.addContact = function() {
    $scope.closeText = "Close";
    $scope.editText = 'Save';
    $scope.edit = true;
    $scope.newContact = true;
    $scope.loadContact();
  }

  // Load Single Contact Details or New Contact
  $scope.loadContact = function(item) {
    tables = [];
    tableData = {};
    $scope.joins = {};

    var id = 'new'
    if(item) {
      id = item.id
    }

    Service.get({table:$scope.model,id:id}).$promise
    .then(function success(data) {
      $scope.entity = data.toJSON();
      for(var key in data) {
        if(data[key] instanceof Array)
          tables.push(key);
      }
      loadTables();
    })
    .catch(function error(error) {
      console.log(error);
    })
  }

  // Add a join record to entity
  $scope.add = function(table) {
    $scope.entity[table].push({});
    $scope.joins[table].push(tableData[table][0]);
  }

  // Remove a join record from entity
  $scope.remove = function(table,index) {
    $scope.entity[table].splice(index,1);
    $scope.joins[table].splice(index,1);
  }

  // Reload Contacts
  function reSyncContacts() {
    try {
      var inCurrentCategory = false;
      for(var key in $scope.entity['CATEGORYS']) {
        if($scope.entity['CATEGORYS'][key]['id'] === $scope.category.id)
          inCurrentCategory = true;
      }
      if(!inCurrentCategory) {
        $scope.clear();
        loadCategories();
      } else {
        $scope.loadContact($scope.entity);
      }
    } catch(err) {
      $scope.clear();
      loadCategories();
      $scope.loadContact($scope.entity);
    }

  }

  // Save or update Contact
  $scope.save = function() {
      Service.save({table:$scope.model}, $scope.entity, function() {
        reSyncContacts();
      })
    };

  // Delete Contact
  $scope.delete=function(){
    if(popupService.showPopup('Really delete this Contact?')){
      Service.delete({table:$scope.model, id:$scope.entity.id},function(){
        $scope.clear();
        loadCategories();
      });
    }
  }

  loadCategories();
}
