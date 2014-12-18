'use strict';

angular.module('schoolApp', ['ui.router', 'ngResource', 'schoolApp.controllers','schoolApp.grid-controller', 'schoolApp.services', 'schoolApp.directives']);

angular.module('schoolApp').config(function($stateProvider) {
  // Login
  $stateProvider.state('login', {
    url: '/login',
    templateUrl: 'partials/login.html'
  });

  // Create Account
  $stateProvider.state('create-account', {
    url: '/create-account',
    templateUrl: 'partials/create-account.html'
  });

  // SCHOOL - For Each Entity with 'CRUD' operations
  $stateProvider.state('schools', { // state for showing all models
    abstract: true,
    url: '/schools',
    templateUrl: 'index.html',
    controller: 'DataCtrl',
    data: {
        url:'schools',
        model:'School', // name of Entity
        first:'NAME',   // name of first column in models list, searched by this
        second:'CITY',  // name of 2nd column in models list
        third:'COUNTY', // name of 3rd column in models list
        returnstate:'schools.list'   // return state after create,update, or delete
      }
  }).state('schools.list', {
    url: '/',
    templateUrl: 'partials/models.html',
    controller: 'ListCtrl'
  }).state('schools.view', { //state for showing single model
    url: '/:id/view',
    templateUrl: 'partials/model-view.html',
    controller: 'ViewCtrl'
  }).state('schools.new', { //state for adding a new model
    url: '/new',
    templateUrl: 'partials/model-add.html',
    controller: 'EditCtrl'
  }).state('schools.edit', { //state for updating a model
    url: '/:id/edit',
    templateUrl: 'partials/model-edit.html',
    controller: 'EditCtrl'
  }).state('schools.grid', { //state for updating a model
    url: '/grid',
    templateUrl: 'partials/grid.html',
    controller: 'gridCtrl'
  });

  // SPONSOR
  $stateProvider.state('sponsors', { // state for showing all models
    abstract: true,
    url: '/sponsors',
    templateUrl: 'index.html',
    controller: 'DataCtrl',
    data: {
      url:'sponsors',
      model:'Sponsor', // name of Entity
      first:'NAME',   // name of first column in models list, searched by this
      second:'AGR_NUMBER',  // name of 2nd column in models list
      third:'SPONSOR_TYPE', // name of 3rd column in models list
      returnstate:'sponsors.list'   // return state after create,update, or delete
    }
  }).state('sponsors.list', {
    url: '/',
    templateUrl: 'partials/models.html',
    controller: 'ListCtrl'
  }).state('sponsors.view', { //state for showing single model
    url: '/:id/view',
    templateUrl: 'partials/model-view.html',
    controller: 'ViewCtrl'
  }).state('sponsors.new', { //state for adding a new model
    url: '/new',
    templateUrl: 'partials/model-add.html',
    controller: 'EditCtrl'
  }).state('sponsors.edit', { //state for updating a model
    url: '/:id/edit',
    templateUrl: 'partials/model-edit.html',
    controller: 'EditCtrl'
  }).state('sponsors.grid', { //state for updating a model
    url: '/grid',
    templateUrl: 'partials/grid.html',
    controller: 'gridCtrl'
  });

  // Nutrition
  $stateProvider.state('nutrition', { // state for showing all models
    abstract: true,
    url: '/nutrition',
    templateUrl: 'index.html',
    controller: 'DataCtrl',
    data: {
      url:'nutrition',
      model:'Nutrition', // name of Entity
      first: 'PROGRAM_TYPE',
      second: 'SITE_NAME',
      third: 'CITY',
      returnstate:'nutrition.list'   // return state after create,update, or delete
    }
  }).state('nutrition.list', {
    url: '/',
    templateUrl: 'partials/models.html',
    controller: 'ListCtrl'
  }).state('nutrition.view', { //state for showing single model
    url: '/:id/view',
    templateUrl: 'partials/model-view.html',
    controller: 'ViewCtrl'
  }).state('nutrition.new', { //state for adding a new model
    url: '/new',
    templateUrl: 'partials/model-add.html',
    controller: 'EditCtrl'
  }).state('nutrition.edit', { //state for updating a model
    url: '/:id/edit',
    templateUrl: 'partials/model-edit.html',
    controller: 'EditCtrl'
  }).state('nutrition.grid', { //state for updating a model
    url: '/grid',
    templateUrl: 'partials/grid.html',
    controller: 'gridCtrl'
  });

  // Summerfood
  $stateProvider.state('summerfood', { // state for showing all models
    abstract: true,
    url: '/summerfood',
    templateUrl: 'index.html',
    controller: 'DataCtrl',
    data: {
      url:'summerfood',
      model:'Summerfood', // name of Entity
      first: 'SITE_NAME',
      second: 'SITE_NUMBER',
      third: 'CITY',
      returnstate:'summerfood.list'   // return state after create,update, or delete
    }
  }).state('summerfood.list', {
    url: '/',
    templateUrl: 'partials/models.html',
    controller: 'ListCtrl'
  }).state('summerfood.view', { //state for showing single model
    url: '/:id/view',
    templateUrl: 'partials/model-view.html',
    controller: 'ViewCtrl'
  }).state('summerfood.new', { //state for adding a new model
    url: '/new',
    templateUrl: 'partials/model-add.html',
    controller: 'EditCtrl'
  }).state('summerfood.edit', { //state for updating a model
    url: '/:id/edit',
    templateUrl: 'partials/model-edit.html',
    controller: 'EditCtrl'
  }).state('summerfood.grid', { //state for updating a model
    url: '/grid',
    templateUrl: 'partials/grid.html',
    controller: 'gridCtrl'
  });

  // Programs
  $stateProvider.state('programs', { // state for showing all models
    abstract: true,
    url: '/programs',
    templateUrl: 'index.html',
    controller: 'DataCtrl',
    data: {
      url:'programs',
      model:'Program', // name of Entity
      first: 'NAME',
      second: 'LICENSE_NUMBER',
      third: 'CITY',
      returnstate:'programs.list'   // return state after create,update, or delete
    }
  }).state('programs.list', {
    url: '/',
    templateUrl: 'partials/models.html',
    controller: 'ListCtrl'
  }).state('programs.view', { //state for showing single model
    url: '/:id/view',
    templateUrl: 'partials/model-view.html',
    controller: 'ViewCtrl'
  }).state('programs.new', { //state for adding a new model
    url: '/new',
    templateUrl: 'partials/model-add.html',
    controller: 'EditCtrl'
  }).state('programs.edit', { //state for updating a model
    url: '/:id/edit',
    templateUrl: 'partials/model-edit.html',
    controller: 'EditCtrl'
  }).state('programs.grid', { //state for updating a model
    url: '/grid',
    templateUrl: 'partials/grid.html',
    controller: 'gridCtrl'
  });

}).run(function($state){
  $state.go('schools.list');
});
