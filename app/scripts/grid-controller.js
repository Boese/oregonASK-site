angular.module('schoolApp.grid-controller', ['ngAnimate','ui.grid','ui.grid.edit','ui.grid.resizeColumns',
'ui.grid.selection', 'ui.grid.exporter','ui.grid.importer','ui.grid.moveColumns','ui.select'])
.controller('gridCtrl',['$scope','$state','$stateParams','Service','ModelService','uiGridConstants', gridCtrl]);

function gridCtrl($scope,$state,$stateParams,Service,ModelService,uiGridConstants) {
  $scope.$scope = $scope;
  $scope.msg = {};
  $scope.rowsSelected = 0;
  $scope.rowsVisible = 0;

  // TABLE OPTIONS
  $scope.gridOptions = {
    enableSorting: true,
    enableColumnResizing: true,
    enableFiltering: true,
    enableGridMenu: true,
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

$scope.years = ['Select a Year'];
$scope.yearSelected = 'Select a Year';

$scope.$watch('yearSelected', function(newValue, oldValue) {
  console.log(oldValue);
  console.log(newValue);
  yearChanged(newValue);
});

function yearChanged(year) {
  var grid = $scope.gridApi.grid;
  var column = null;
  for(var key in grid.columns) {
    if(grid.columns[key].displayName === 'Year') {
      column = grid.columns[key];
      break;
    }
  }
  var filter = {
    'term': ''
  };
  if(year !== 'Select a Year') {
    filter.term = year;
  }
  if(column !== null) {
    column.filters[0] = filter;
    $scope.gridApi.core.refresh();
  }
}

// CSV & PDF EXPORT
$scope.export = function(){
  if ($scope.export_format == 'csv') {
    var myElement = angular.element(document.querySelectorAll(".custom-csv-link-location"));
    $scope.gridApi.exporter.csvExport( $scope.export_row_type, $scope.export_column_type, myElement );
  } else if ($scope.export_format == 'pdf') {
    $scope.gridApi.exporter.pdfExport( $scope.export_row_type, $scope.export_column_type );
  };
};

// NEEDED FOR SEARCH FILTERS
$scope.loadColumns = function() {
  $scope.gridOptions.columnDefs = [];
  ModelService.get({model:$scope.model}).$promise
  .then(function success(data){
    var columndata = data.model;
    var columns = [];
    for(var key in columndata) {
      var temp = {};
      temp['name'] = key;
      temp['width'] = '200';
      $scope.gridOptions.columnDefs.push(temp);
    }
  })
};

var dataToLoad = [];
var i = 0;
var percent = 0;
var doneData = [];

function loadRecur() {
  if(i < dataToLoad.length) {
    Service.get({table:$scope.model, id:dataToLoad[i].id}).$promise
      .then(function(data) {
        data = data.toJSON();

        //** LOAD COLUMNS ONLY ONCE **//
        if(i === 0) {
          $scope.gridOptions.columnDefs = [];
          for(var key in data) {
            var column = {};
            //nested info table
            if(data[key] instanceof Array) {
              if(key.indexOf('INFO') != -1) {
                for(var key2 in data[key]) {
                  for(var key3 in data[key][key2]) {
                    column = {};
                    column['name'] = key3;
                    column['width'] = '200';
                    $scope.gridOptions.columnDefs.push(column);
                  }
                }
              }
            }
            // name of programs school or sponsor
            else if(data[key] instanceof Object) {
              column['name'] = key;
              column['width'] = '200';
              $scope.gridOptions.columnDefs.push(column);
            }
            // regular data
            else {
              column['name'] = key;
              column['width'] = '200';
              $scope.gridOptions.columnDefs.push(column);
            }
          }
        }

        //** LOAD DATA **//
        var row = {};
        var rowInfos = [];
        for(var key in data) {
          var column = {};
          //nested info table 'Array'
          if(data[key] instanceof Array) {
            if(key.indexOf('INFO') != -1) {
              for(var key2 in data[key]) {
                var rowInfo = {};
                for(var key3 in data[key][key2]) {
                  if(key3 !== 'id')
                    rowInfo[key3] = data[key][key2][key3];
                  if(key3.toLowerCase() === 'year' && $scope.years.indexOf(data[key][key2][key3]) === -1)
                    $scope.years.push(data[key][key2][key3]);
                }
                rowInfos.push(rowInfo);
              }
            }
          }
          // name of programs school or sponsor 'Object'
          else if(data[key] instanceof Object) {
            row[key] = data[key]['NAME'];
          }
          // regular data 'regular type'
          else {
            if(key.toLowerCase() === 'year' && $scope.years.indexOf(data[key]) === -1)
              $scope.years.push(data[key]);
            row[key] = data[key];
          }
        }

        // No info tables
        if(rowInfos.length === 0)
          doneData.push(row);
        // At least 1 info table
        else {
          for(var count = 0; count < rowInfos.length; count++) {
            var mainRow = {};
            for(var key in row) {
              mainRow[key] = row[key];
            }
            for(var key in rowInfos[count]) {
              mainRow[key] = rowInfos[count][key];
            }
            doneData.push(mainRow);
          }
        }

        // increment counter
        i++;

        // increment percentage done
        if(i >= dataToLoad.length)
          percent = i;
        else if(i%50 === 0)
          percent += 50;

        // Recur
        loadRecur();
      })
  } else {
    $scope.gridOptions.data = doneData;
  }
}

$scope.loadData = function() {
  Service.query({table:$scope.model}).$promise
  .then(function success(data) {
    dataToLoad = data;
    loadRecur();
  })
};

$scope.getPercentage = function() {
  return Math.ceil((percent/dataToLoad.length) * 100)
}

$scope.resetTable = function() {
  $scope.gridApi.selection.clearSelectedRows();
  delete $scope.gridOptions.enableFiltering;
  $scope.gridOptions['enableFiltering'] = true;
  $scope.gridApi.core.refresh();
}

$scope.loadTable = function() {
  $scope.loadColumns();
  $scope.loadData();
}

$scope.loadTable();
}
