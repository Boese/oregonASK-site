angular.module('schoolApp.grid-controller', ['ngAnimate','ui.grid','ui.grid.resizeColumns','ui.grid.selection','ui.grid.exporter','ui.grid.importer','ui.select','angular-underscore'])
  .controller('gridCtrl',['$scope','$state','$window','$stateParams','Service','uiGridConstants', gridCtrl]);

function gridCtrl($scope,$state,$stateParams,$window,Service,uiGridConstants) {
  $scope.rowsSelected = 0;
  $scope.rowsVisible = 0;

  // TABLE OPTIONS
  $scope.gridOptions = {
    enableGridMenu: false,
    enableFiltering: true,
    enableSorting: true,
    exporterLinkLabel: 'click here to download excel sheet',
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

  $scope.getCsvExport = function() {
    // Get Selected Rows
    var entities = angular.copy($scope.gridApi.selection.getSelectedRows());
    _.each(entities, function(entity) {
      entity = entity.toJSON();
    })

    // Get Biggest Row
    var biggestEntity = _.max(entities, function(entity) {
      return _.keys(entity).length
    }).toJSON();


    // Set Object keys to Biggest Row for header support
    _.each(entities, function(entity) {
      for(var key in biggestEntity) {
        if(!_.has(entity,key))
          entity[key] = ' ';
      }
    })

    // Parse Json -> Csv
    var csv = Papa.unparse(JSON.stringify(entities), {worker:true});
    var hiddenElement = document.createElement('a');

    hiddenElement.href = 'data:attachment/csv,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'Export.csv';
    hiddenElement.click();
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

  $scope.cols = [];
  function addColumn(name) {
    if(!_.find($scope.cols, function(col) {
      return col.name === name
    })) {
        $scope.cols.push({name:name,width:200})
    }
  }

  // START -> Load JSON Schema for table headers
  function loadColumns() {
    Service.get({table:$scope.model,id:'new'}).$promise
    .then(function success(data) {
      data = data.toJSON();
      for(var key in data) {
        if(!_.isArray(data[key]))
          addColumn(key);
      }
      $scope.gridOptions.columnDefs = angular.copy($scope.cols);
      })
      .catch(function error(err) {
        $state.go('data.login')
      })
  }

  // START -> Load all Models
  function loadModels() {
    Service.query({table:$scope.model}).$promise
    .then(function success(data) {
      $scope.entities = data;
      loadTable();
    })
    .catch(function error(err) {
      $state.go('data.login');
    })
  }

  // THEN -> Load Model Relationships
  $scope.entities = [];
  var oneToMany = [];
  var manyToOne = [];
  function loadTable() {
    Service.get({table:$scope.model,id:'new'}).$promise
      .then(function success(data) {
        data = data.toJSON();
        for(var key in data) {
          if(data[key] instanceof Array)
            manyToOne.push(key);
          else if(data[key] instanceof Object)
            oneToMany.push(key);
        }
        loadManyToOne();
      })
      .catch(function error(err) {
        $state.go('data.login')
      })
  }

  // THEN -> Load One->Many recursively
  function loadManyToOne() {
    if(manyToOne.length < 1)
      loadOneToMany();
    else {
      var tableName = manyToOne[0];
      var table = manyToOne[0].replace('_','')
      Service.query({table:table}).$promise
      .then(function success(data) {
        _.each($scope.entities, function(entity) {
          var search_obj = {};
          search_obj[$scope.model.toUpperCase() + '_ID'] = entity.id;
          var temp = _.where(data,search_obj)
          delete entity[tableName];
          if(temp) {
            var i = 0;
            _.each(temp, function(val) {
              val = val.toJSON();
              for(var key in val) {
                var name = table + '.' + i + '.' + key;
                entity[name] = val[key];
              }
              _.compact(entity[name]);
              i++;
            })

          }
        })
        manyToOne.splice(0,1);
        loadManyToOne();
      })
      .catch(function error(err) {
        $state.go('data.login');
      })
    }
  }

  // THEN -> Load Many->One recursively -> THEN -> set data
  function loadOneToMany() {
    if(oneToMany.length < 1) {
      $scope.gridOptions.data = $scope.entities;
    }
    else {
      var table = oneToMany[0];
      Service.query({table:table}).$promise
        .then(function success(data) {
          _.each($scope.entities, function(entity) {
            var temp = _.findWhere(data, {id:entity[(table + '_id').toUpperCase()]});
            if(temp) {
              entity[table] = temp.NAME
            }
          })
          oneToMany.splice(0,1);
          loadOneToMany();
        })
        .catch(function error(err) {
          $state.go('data.login');
        })
      }
  }

  loadColumns();
  loadModels();

  $scope.refreshData = function() {
    $scope.gridApi.selection.clearSelectedRows();
    loadColumns();
  }
}
