angular.module('schoolApp.grid-controller', ['ngAnimate','ui.grid','ui.grid.edit','ui.grid.resizeColumns',
'ui.grid.selection', 'ui.grid.exporter','ui.grid.importer','ui.grid.moveColumns','ui.select'])
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

  // Load Entities without Joins
  var entities = {}
  var tempCols = [];
  function loadData() {
    Service.query({table:$scope.model}).$promise
      .then(function success(data) {
        entities = data;
        for(var key in entities) {
          try {
            for(var key2 in entities[key].toJSON()) {
              if(!entities[key][key2])
                delete entities[key][key2]
              else if(!checkColumn(key2)) {
                tempCols.push({
                  'field':key2,
                  'width':200
                });
              }
            }
          } catch(error) {}
        }
        loadJoins();
      })
      .catch(function error(error) {
        $state.go('data.login');
      })
  }

  // Load Joins
  var joins = {}
  $scope.columns = [];
  function loadJoins() {
    Service.query({table:$scope.model + 'Info'}).$promise
      .then(function success(data) {
        joins = data;
        for(var key in joins) {
          var id = joins[key][($scope.model + '_ID').toUpperCase()];
          var entityID = findEntity(id)
          try {
            for(var key2 in joins[key].toJSON()) {
              entities[entityID][key2 + ":" + joins[key].YEAR] = joins[key][key2];
              if(!checkColumn(key2 + ":" + joins[key].YEAR)) {
                tempCols.push({
                  'field': key2 + ":" + joins[key].YEAR,
                  'width':200
                });
              }
            }
          } catch(error) {}
        }

        // Load Grid
        $scope.gridOptions.data = entities;

        // button toggle for columns
        $scope.gridOptions.columnDefs = tempCols;
        $scope.columns = $scope.gridApi.grid.columns;
        for(var key in $scope.columns) {
          $scope.columns[key]['active'] = true;
        }
      })
      .catch(function error(error) {
        $state.go('data.login');
      })
  }

  // Return entity location in list
  function findEntity(id) {
    for(var i = 0; i < entities.length; i++) {
      if(entities[i].id === id)
        return i;
    }
  }

  loadData();
}
