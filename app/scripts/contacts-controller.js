(function () {
  'use strict';

  function ContactsCtrl($scope, $state, $stateParams, ContactService, $filter, NgTableParams) {
    $scope.state = $state;
    var contacts = [];
    var campaigns = [];
    $scope.filteredContacts = [];

    $scope.lists = [];
    $scope.status = 'ACTIVE';
    $scope.statuss = [
      'ALL',
      'UNCONFIRMED',
      'ACTIVE',
      'OPTOUT',
      'REMOVED',
      'NON_SUBSCRIBER',
      'VISITOR'
    ];

    $scope.searchOptions = [
      'name',
      'email_address',
      'company_name',
    ];

    $scope.searchOption = $scope.searchOptions[0];

    function filterCategory() {
      $scope.filteredContacts = [];
      if (!($scope.list.name === 'ALL' && $scope.status === 'ALL')) {
        for (var key in contacts) {
          for (var i = 0; i < contacts[key].lists.length; i++) {
            if ($scope.list.name === 'ALL') {
              if (contacts[key].status === $scope.status) {
                $scope.filteredContacts.push(contacts[key]);
                break;
              }
            }
            else if ($scope.status === 'ALL') {
              if ($scope.list.id === contacts[key].lists[i].id) {
                $scope.filteredContacts.push(contacts[key]);
                break;
              }
            }
            else if ($scope.list.id === contacts[key].lists[i].id && contacts[key].status === $scope.status) {
              $scope.filteredContacts.push(contacts[key]);
              break;
            }
          }
        }
      }
      else {
        $scope.filteredContacts = contacts;
      }
      $scope.tableParams.reload();
    }

    function watchCategory() {
      $scope.$watch('list', function () {
        filterCategory();
      });
      $scope.$watch('status', function () {
        filterCategory();
      });
    }

    function loadLists() {
      ContactService.query({table: 'lists'}).$promise
        .then(function success(data) {
          $scope.lists = data;
          $scope.lists.push({name: 'ALL'});
          $scope.list = $scope.lists[$scope.lists.length - 1];
        })
        .catch(function error() {
          $state.go('data.login');
        });
    }

    function loadCampaigns() {
      ContactService.get({table: 'campaigns'}).$promise
      .then(function success(data) {
        campaigns = data.toJSON().results;
      })
      .catch(function error() {
        $state.go('data.login');
      });
    }

    $scope.loadContact = function (contact) {
      $state.go('data.contacts.contact', {contact: contact, lists: $scope.lists, campaigns: campaigns});
    };

    $scope.closeContactView = function () {
      $state.go('data.contacts');
    };

    // Sort models alphabetically, search based $scope.first
    function loadContacts() {
      ContactService.get({table: 'contacts'}).$promise
        .then(function success(data) {
          data = data.toJSON();
          data = data.results;
          for (var key in data) {
            try {
              data[key].email_address = data[key].email_addresses[0].email_address;
            } catch (err) {
              data[key].email_address = '';
            }
            data[key].name = data[key].first_name + ' ' + data[key].last_name;
            contacts.push(data[key]);
          }
          watchCategory();

          var filterOb = {};
          filterOb.name = '';
          filterOb.email_address = '';
          filterOb.company_name = '';

          $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            filter: filterOb,
            sorting: {
              'last_name': 'asc'     // initial sorting
            }
          }, {
            total: $scope.filteredContacts.length,
            getData: function ($defer, params) {
              var filteredData = params.filter() ?
              $filter('filter')($scope.filteredContacts, params.filter()) :
              $scope.filteredContacts;

              var orderedData = params.sorting() ?
              $filter('orderBy')(filteredData, params.orderBy()) :
              $scope.filteredContacts;

              params.total(orderedData.length); // set total for recalc pagination
              $scope.count = orderedData.length;
              $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
          });
          $scope.tableParams.settings().$scope = $scope;
        })
        .catch(function error() {
          $state.go('data.login');
        });
    }

    loadLists();
    loadContacts();
    loadCampaigns();
  }

  function ContactViewCtrl($scope, $state, $stateParams, ContactService) {
    var campaigns = $stateParams.campaigns;
    var lists = $stateParams.lists;

    $scope.removeUnneededData = function (key, value) {
      if (!value) {
        return false;
      }

      if (key.toLowerCase().indexOf('id') !== -1) {
        return false;
      }
      return true;
    };

    function getCampaignName(id) {
      for (var key in campaigns) {
        if (campaigns[key].id === id) {
          return campaigns[key].name;
        }
      }
    }

    function getListName(id) {
      for (var key in lists) {
        if (lists[key].id === id) {
          return lists[key].name;
        }
      }
    }

    function createContactView() {
      var contact = $stateParams.contact;
      $scope.contactArray = {};
      $scope.contact = {};
      for (var key in contact) {
        if (contact[key] instanceof Array) {
          if (contact[key].length > 0) {
            $scope.contactArray[key] = contact[key];
          }
        }
        else {
          $scope.contact[key] = contact[key];
        }
      }
      for (var list in $scope.contactArray.lists) {
        $scope.contactArray.lists[list].name = getListName($scope.contactArray.lists[list].id);
      }
    }

    function loadContactTracking(table, url, isArray) {
      if (isArray) {
        ContactService.query({table: url}).$promise
        .then(function success(data) {
          for (var key in data) {
            data[key].name = getCampaignName(data[key].campaign_id);
          }
          $scope.contactArray[table] = data;
        })
        .catch(function error() {
          $state.go('login');
        });
      } else {
        ContactService.get({table: url}).$promise
        .then(function success(data) {
          data = data.toJSON().results;
          for (var key in data) {
            data[key].name = getCampaignName(data[key].campaign_id);
          }
          $scope.contactArray[table] = data;
        })
        .catch(function error() {
          $state.go('login');
        });
      }
    }

    if ($stateParams.contact !== null) {
      loadContactTracking('summary', 'contacts/' + $stateParams.contact.id + '/tracking/reports/summary', false);
      loadContactTracking('activity', 'contacts/' + $stateParams.contact.id + '/tracking', false);
      loadContactTracking('SummaryByCampaign', 'contacts/' + $stateParams.contact.id + '/tracking/reports/summaryByCampaign', true);
      createContactView();
    }
  }

  angular.module('schoolApp.contacts-controller', ['ngTable', 'ui.bootstrap'])
    .controller('ContactsCtrl', ['$scope', '$state', '$stateParams', 'ContactService', '$filter', 'ngTableParams', ContactsCtrl])
    .controller('ContactViewCtrl', ['$scope', '$state', '$stateParams', 'ContactService', ContactViewCtrl]);

})();
