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

// Years Filter
$scope.years = ['all'];
$scope.yearSelected = 'all';

// Watch Year filter when user switches year
$scope.$watch('yearSelected', function(newValue, oldValue) {
  yearChanged(newValue);
});

// Update Year filter when year changes
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
  if(year !== 'all') {
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

// Show/Hide columns
$scope.toggleColumns = function(index) {
  ($scope.gridApi.grid.columns[index].visible) ? $scope.gridApi.grid.columns[index].hideColumn() : $scope.gridApi.grid.columns[index].showColumn();
  $scope.gridApi.core.notifyDataChange($scope.gridApi.grid, uiGridConstants.dataChange.COLUMN);
  ($scope.columns[index].active) ? $scope.columns[index].active = false : $scope.columns[index].active = true;
}

function checkColumn(name) {
  for(var col in $scope.gridOptions.columnDefs) {
    if($scope.gridOptions.columnDefs[col]['name'] === name)
      return true;
    }
    return false;
  }

  var dataToLoad = [];
  var i = 0;
  var percent = 0;
  var doneData = [];

  $scope.columns = [];

function loadRecur() {
  if(i < dataToLoad.length) {
    Service.get({table:$scope.model, id:dataToLoad[i].id}).$promise
    .then(function(data) {
      data = data.toJSON();

      function loadRecur() {
        if(i < dataToLoad.length) {
          Service.get({table:$scope.model, id:dataToLoad[i].id}).$promise
          .then(function(data) {
            data = data.toJSON();

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
                        if(!checkColumn(key3)) {
                          var temp = {};
                          temp['name'] = key3;
                          temp['width'] = '200';
                          $scope.gridOptions.columnDefs.push(temp);
                        }
                        if(key3.toLowerCase() === 'year' && $scope.years.indexOf(data[key][key2][key3]) === -1)
                          $scope.years.push(data[key][key2][key3]);
                        }
                        rowInfos.push(rowInfo);
                      }
                    }
                // parent contains children records ?
                else {
                    if(data[key].length > 0)
                      row[key + ' at location?'] = 'yes';
                    else
                      row[key + ' at location?'] = 'no';
                    if(!checkColumn(key + ' at location?')) {
                      var temp = {};
                      temp['name'] = key + ' at location?';
                      temp['width'] = '200';
                      $scope.gridOptions.columnDefs.push(temp);
                    }
                  }
                }
                // name of programs school or sponsor 'Object'
                else if(data[key] instanceof Object) {
                  row[key] = data[key]['NAME'];
                  if(!checkColumn(key)) {
                    var temp = {};
                    temp['name'] = key;
                    temp['width'] = '200';
                    $scope.gridOptions.columnDefs.push(temp);
                  }
                }
                // regular data 'regular type'
                else {
                  if(key.toLowerCase() === 'year' && $scope.years.indexOf(data[key]) === -1)
                    $scope.years.push(data[key]);
                    row[key] = data[key];
                    if(!checkColumn(key)) {
                      var temp = {};
                      temp['name'] = key;
                      temp['width'] = '200';
                      $scope.gridOptions.columnDefs.push(temp);
                    }
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
                    // copy data to grid
                    $scope.gridOptions.data = doneData;
                    // default year option to most recent year
                    $scope.yearSelected = $scope.years[$scope.years.length-1];

                    // button toggle for columns
                    $scope.columns = $scope.gridApi.grid.columns;
                    for(var key in $scope.columns) {
                      $scope.columns[key]['active'] = true;
                    }
                  }
                }
    doneData.push(data)

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
      // copy data to grid
      $scope.gridOptions.data = doneData;
      // default year option to most recent year
      $scope.yearSelected = $scope.years[$scope.years.length-1];

      // button toggle for columns
      $scope.columns = $scope.gridApi.grid.columns;
      for(var key in $scope.columns) {
        $scope.columns[key]['active'] = true;
      }
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

$scope.loadData();
}
