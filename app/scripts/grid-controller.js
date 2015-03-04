(function () {
  'use strict';

  /*
  {
        "tables":[
        	{
            	"name":"school",
                "columns":["name","middle","county"]
            },
           	{
            	"name":"program",
                "columns":["name","county"]
            },
            {
            	"name":"program_info",
                "columns":["year","stem_offered"]
            }
        ],
        "filters":[]
        }
*/

  function GridCtrl($scope, $state, $window, $stateParams, Service) {
    $scope.model = $stateParams.model;
    $scope.searchModel = {
      tables:[{
        name:$scope.model,
        columns:[]
      }],
      filters:[]
    };

    $scope.addCol = function (index,key) {
      if(!$scope.searchModel.tables[index]) {
        $scope.searchModel.tables[index] = {
          name:$scope.model,
          columns:[]
        }
      }
      $scope.searchModel.tables[index].columns.push(key);
    }

    $scope.load = function () {
      Service.get({table:$scope.model,id:'new'}).$promise
        .then(function success(data) {
          $scope.entity = data.toJSON();
          console.log($scope.entity);
        })
        .catch(function error() {
          $state.go('data.login');
        })
    }


    $scope.search = function () {
      Service.search({table:'search_database'},$scope.searchModel).$promise
        .then(function success(data) {
          getCsvExport(data);
        })
        .catch(function error() {
          $state.go('data.login');
        })
    }

    function getCsvExport (results) {
      // Parse Json -> Csv
      var csv = Papa.unparse(JSON.stringify(results), {worker: true});
      var hiddenElement = document.createElement('a');

      hiddenElement.href = 'data:attachment/csv,' + encodeURI(csv);
      hiddenElement.target = '_blank';
      hiddenElement.download = 'Export.csv';
      hiddenElement.click();
    };

    $scope.load();
  }
  angular.module('schoolApp.grid-controller', ['angular-underscore'])
    .controller('GridCtrl', ['$scope', '$state', '$window', '$stateParams', 'Service', GridCtrl]);
})();
