angular.module('schoolApp.grid-controller', ['ngAnimate','ui.grid','ui.grid.edit','ui.grid.resizeColumns',
'ui.grid.selection', 'ui.grid.exporter','ui.grid.importer','ui.grid.moveColumns','ui.select','angular-underscore'])
.controller('gridCtrl',['$scope','$state','$window','$stateParams','Service','uiGridConstants', gridCtrl]);

function gridCtrl($scope,$state,$stateParams,$window,Service,uiGridConstants) {
  $scope.$scope = $scope;
  $scope.rowsSelected = 0;
  $scope.rowsVisible = 0;

  // TABLE OPTIONS
  $scope.gridOptions = {
    enableSorting: true,
    enableFiltering: true,
    enableColumnResizing: true,
    enableGridMenu: false,
    importerShowMenu: false,
    exporterMenuCsv: false,
    exporterMenuPdf: false,
    exporterLinkLabel: 'click here to download csv',
    exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    exporterPdfDefaultStyle: {fontSize: 7, alignment: 'center', color: 'black'},
    exporterPdfTableHeaderStyle: {fontSize: 8, bold: true, alignment: 'center', color: 'blue'},
    exporterPdfOrientation: 'landscape',
    exporterPdfPageSize: 'A2',
    exporterHeaderFilter: function( displayName ) {
      return displayName.toLowerCase();
    },
    importerDataAddCallback: function ( grid, data ) {
      $scope.gridOptions.data = data;
    },
    onRegisterApi: function(gridApi){
      $scope.gridApi = gridApi;

      gridApi.selection.on.rowSelectionChanged($scope, function(row) {
        $scope.rowsSelected = gridApi.selection.getSelectedRows().length
      })
      gridApi.selection.on.rowSelectionChangedBatch($scope, function(rows) {
        $scope.rowsSelected = gridApi.selection.getSelectedRows().length
      })
      gridApi.core.on.rowsVisibleChanged($scope, function() {
        $scope.rowsVisible = gridApi.core.getVisibleRows(gridApi.grid).length;
      })
    }
  };

  // CSV & PDF EXPORT
  $scope.export = function(){
    if ($scope.export_format == 'csv') {
      var myElement = angular.element(document.querySelectorAll(".custom-csv-link-location"));
      $scope.gridApi.exporter.csvExport( $scope.export_row_type, $scope.export_column_type, myElement );
    } else if ($scope.export_format == 'pdf') {
      $scope.gridApi.exporter.pdfExport( $scope.export_row_type, $scope.export_column_type );
    };
  };

  // Show/Hide columns
  $scope.toggleColumns = function(index) {
    ($scope.gridApi.grid.columns[index].visible) ? $scope.gridApi.grid.columns[index].hideColumn() : $scope.gridApi.grid.columns[index].showColumn();
    $scope.gridApi.core.notifyDataChange($scope.gridApi.grid, uiGridConstants.dataChange.COLUMN);
    ($scope.columns[index].active) ? $scope.columns[index].active = false : $scope.columns[index].active = true;
  }

  // Check if Column has already been added to grid
  function checkColumn(name) {
    for(var col in tempCols) {
      if(tempCols[col]['field'] === name)
        return true;
      }
      return false;
    }

  // Load new Model
  $scope.oneToMany = {};
  $scope.manyToOne = {};
  $scope.entities = [];
  function loadTable() {
    Service.get({table:$scope.model,id:'new'}).$promise
      .then(function success(data) {
        data = data.toJSON();
        for(var key in data) {
          if(data[key] instanceof Array) {
            $scope.oneToMany[key] = [];
            $scope.oneToMany[key].push(data[key][0]);
          }
          else if(data[key] instanceof Object) {
            $scope.manyToOne[key] = {}
          }
        }
        loadOneToMany();
        loadManyToOne();
        loadModels();
      })
      .catch(function error(err) {
        $state.go('data.login')
      })
  }

  function loadData(oneToMany,table) {
    Service.query({table:table.replace('_','')}).$promise
    .then(function success(data) {
      if(oneToMany)
        $scope.oneToMany[table] = data;
      else
        $scope.manyToOne[table] = data;
    })
    .catch(function error(err) {
      $state.go('data.login');
    })
  }

  function loadOneToMany() {
    for(var key in $scope.oneToMany) {
      loadData(true,key);
    }
  }

  function loadManyToOne() {
    for(var key in $scope.manyToOne) {
      loadData(false,key)
    }
  }

  function loadModels() {
    Service.query({table:$scope.model}).$promise
      .then(function success(data) {
        $scope.entities = data;
        joinTables();
      })
      .catch(function error(err) {
        $state.go('data.login');
      })
  }

  function joinTables() {
    $scope.sample([1, 2, 3]);
    console.log(_.indexOf([1,2,3], 2))
  }

  loadTable();
}
