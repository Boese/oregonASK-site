angular.module('schoolApp.grid-controller', ['ngAnimate','ui.grid','ui.grid.edit','ui.grid.resizeColumns',
'ui.grid.selection', 'ui.grid.exporter','ui.grid.importer','ui.grid.moveColumns','ui.select'])
.controller('gridCtrl',['$scope','$state','$stateParams','Service','ModelService','uiGridConstants', gridCtrl]);

function gridCtrl($scope,$state,$stateParams,Service,ModelService,uiGridConstants) {
  $scope.$scope = $scope;
  $scope.msg = {};

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

    importerDataAddCallback: function ( grid, data ) {
      $scope.gridOptions.data = data;
    },
    onRegisterApi: function(gridApi){
      $scope.gridApi = gridApi;
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
      temp['width'] = '20%';
      $scope.gridOptions.columnDefs.push(temp);
    }
  })
};

var dataToLoad = [];
var i = 0;
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
                    column['width'] = '20%';
                    $scope.gridOptions.columnDefs.push(column);
                  }
                }
              }
            }
            // name of programs school or sponsor
            else if(data[key] instanceof Object) {
              column['name'] = key;
              column['width'] = '20%';
              $scope.gridOptions.columnDefs.push(column);
            }
            // regular data
            else {
              column['name'] = key;
              column['width'] = '20%';
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

        i++;
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
  return Math.ceil((i/dataToLoad.length) * 100)
}

$scope.resetTable = function() {
  $scope.gridOptions.data = {};
  $scope.gridOptions.columnDefs = [];
}

$scope.loadTable = function() {
  $scope.loadColumns();
  $scope.loadData();
}

$scope.loadTable();
}
