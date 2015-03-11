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
                "columns":["name","county","city"]
            },
            {
            	"name":"program_info",
                "columns":["year","stem_offered"]
                }
        ],
    "filters":[
      {
        "name":"school.county",
        "values":["Washington","marion"]
      },
      {
      	"name":"program.city",
        "values":["portland"]
      }
    ]
  }

*/

  function GridCtrl($scope, $state, $window, $stateParams, Service, $modal) {

    //** SEARCH (EXPORT)
    $scope.model = $stateParams.model;
    $scope.searchModel = {
      tables:[
        {
          name:$scope.model,
          columns:[]
        }
      ],
      filters:[]
    };

    $scope.updateTable = function (table) {
      var idx = _.indexOf(_.pluck($scope.searchModel.tables,'name'),table)
      if(idx === -1)
        $scope.searchModel.tables.push({name:table,columns:[]});
      else
        $scope.searchModel.tables.splice(idx,1);
    }

    $scope.updateColumns = function (table,col) {
      $scope.errorMessage = undefined;
      var idx = _.indexOf(_.pluck($scope.searchModel.tables,'name'),table);
      var colIdx = _.indexOf($scope.searchModel.tables[idx].columns, col);
      if(colIdx === -1)
        $scope.searchModel.tables[idx].columns.push(col);
      else
        $scope.searchModel.tables[idx].columns.splice(colIdx,1);
    }

    $scope.updateTags = function (tags,table,key) {
      key = table + '.' + key;
      var idx = _.indexOf(_.pluck($scope.searchModel.filters,'name'),key);

      if(idx === -1) {
        $scope.searchModel.filters.push({name:key, values:[]});
        idx = $scope.searchModel.filters.length-1;
      }
      $scope.searchModel.filters[idx].values = _.pluck(tags, 'text');

      if(tags.length < 1) {
        $scope.searchModel.filters[idx] = [];
      }
    }

    $scope.load = function () {
      Service.get({table:$scope.model,id:'new'}).$promise
        .then(function success(data) {
          $scope.value = $scope.sortObject(data.toJSON());
        })
        .catch(function error() {
          $state.go('data.login');
        })
    }


    $scope.search = function () {
      var error = false;
      var tables = "";
      _.each($scope.searchModel.tables, function (table) {
        if(table.columns < 1) {
          tables += table.name + ",";
          error = true;
        }
      })

      if(error) {
        $scope.errorMessage = "must select at least one field in " + tables;
      }

      if(!error) {
        Service.search({table:'search_database'},$scope.searchModel).$promise
          .then(function success(data) {
            getCsvExport(data);
          })
          .catch(function error() {
            $state.go('data.login');
          })
      }
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

    //** IMPORT
    $scope.csv = {
    	content: null,
    	header: true,
    	separator: ',',
    	result: null
    };
    $scope.openModalUpload = function () {
      var modalInstance = $modal.open({
          templateUrl: 'modalUpload.html',
          controller: 'ModalUploadCtrl',
        });

      modalInstance.result.then(function (csv) {
        importFile(csv.content);
      });
    };

    function importFile (file) {
      var result = Papa.parse(file, {header:true});
      Service.save({table: 'upload_data', id: $scope.model}, result.data).$promise
        .then(function success(data) {
          alert('done');
        })
        .catch(function error(data) {
          $state.go('data.login');
        })
    }
  }

  function ModalUploadCtrl ($scope, $modalInstance) {
    $scope.ok = function (content) {
      $modalInstance.close(content);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }

  angular.module('schoolApp.grid-controller', ['angular-underscore','ngAnimate','ngTagsInput','ngCsvImport'])
    .controller('GridCtrl', ['$scope', '$state', '$window', '$stateParams', 'Service', '$modal', GridCtrl])
    .controller('ModalUploadCtrl', ['$scope', '$modalInstance', ModalUploadCtrl]);
})();
