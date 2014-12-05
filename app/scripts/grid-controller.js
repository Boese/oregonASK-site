angular.module('schoolApp.grid-controller', ['ngAnimate','ui.grid','ui.grid.edit','ui.grid.resizeColumns',
          'ui.grid.selection', 'ui.grid.exporter','ui.grid.importer','ui.grid.moveColumns'])
  .controller('gridCtrl',['$scope','$state','$stateParams','Service','ModelService','uiGridConstants', gridCtrl]);

function gridCtrl($scope,$state,$stateParams,Service,ModelService,uiGridConstants) {
  $scope.model = $state.current.data.model;

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
    exporterPdfDefaultStyle: {fontSize: 9},
    exporterPdfTableHeaderStyle: {fontSize: 10, bold: true, italics: true, color: 'red'},
    exporterPdfOrientation: 'landscape',
    exporterPdfPageSize: 'A2',

    importerDataAddCallback: function ( grid, data ) {
      $scope.gridOptions.data = data;
    },
    onRegisterApi: function(gridApi){
      $scope.gridApi = gridApi;
    }
  };

  $scope.export = function(){
      if ($scope.export_format == 'csv') {
        var myElement = angular.element(document.querySelectorAll(".custom-csv-link-location"));
        $scope.gridApi.exporter.csvExport( $scope.export_row_type, $scope.export_column_type, myElement );
      } else if ($scope.export_format == 'pdf') {
        $scope.gridApi.exporter.pdfExport( $scope.export_row_type, $scope.export_column_type );
      };
    };

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

  $scope.loadData = function() {
    Service.query({table:$scope.model}).$promise
    .then(function success(data) {
      $scope.gridOptions.data = data;
    })
  };

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
