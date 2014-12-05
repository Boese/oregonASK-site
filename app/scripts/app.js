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
    data: {
        url:'schools',
        model:'School', // name of Entity
        first:'NAME',   // name of first column in models list, searched by this
        second:'CITY',  // name of 2nd column in models list
        third:'COUNTY', // name of 3rd column in models list
        returnstate:'schools.list'   // return state after create,update, or delete
      }
  }).state('schools.list', {
    templateUrl: 'partials/models.html',
    controller: 'ListCtrl'
  }).state('schools.view', { //state for showing single model
    url: '/:id/view',
    templateUrl: 'partials/model-view.html',
    controller: 'ViewCtrl'
  }).state('schools.new', { //state for adding a new model
    url: '/new',
    templateUrl: 'partials/model-add.html',
    controller: 'CreateCtrl'
  }).state('schools.edit', { //state for updating a model
    url: '/:id/edit',
    templateUrl: 'partials/model-edit.html',
    controller: 'EditCtrl'
  }).state('schools.grid', { //state for updating a model
    url: '/grid',
    templateUrl: 'partials/demogrid.html',
    controller: 'gridCtrl'
  });

  // SPONSOR
  $stateProvider.state('sponsors', {
    url: '/sponsors',
    templateUrl: 'partials/models.html',
    controller: 'ListCtrl',
    onEnter: function(DataService){
      var data = {
        model:'Sponsor',
        first:'NAME',
        second:'AGR_NUMBER',
        third:'SPONSOR_TYPE',
        returnstate:'sponsors'
      }
      DataService.setData(data);
    }
  }).state('viewSponsor', {
    url: '/sponsor/:id/view',
    templateUrl: 'partials/model-view.html',
    controller: 'ViewCtrl'
  }).state('newSponsor', {
    url: '/sponsors/new',
    templateUrl: 'partials/model-add.html',
    controller: 'CreateCtrl'
  }).state('editSponsor', {
    url: '/sponsors/:id/edit',
    templateUrl: 'partials/model-edit.html',
    controller: 'EditCtrl'
  });

  // Nutrition
  $stateProvider.state('nutrition', {
    url: '/nutrition',
    templateUrl: 'partials/models.html',
    controller: 'ListCtrl',
    onEnter: function(DataService){
      var data = {
        model:'Nutrition',
        first: 'PROGRAM_TYPE',
        second: 'SITE_NAME',
        third: 'CITY',
        returnstate: 'nutrition'
      }
      DataService.setData(data);
    }
  }).state('viewNutrition', {
    url: '/nutrition/:id/view',
    templateUrl: 'partials/model-view.html',
    controller: 'ViewCtrl'
  }).state('newNutrition', {
    url: '/nutrition/new',
    templateUrl: 'partials/model-add.html',
    controller: 'CreateCtrl'
  }).state('editNutrition', {
    url: '/nutrition/:id/edit',
    templateUrl: 'partials/model-edit.html',
    controller: 'EditCtrl'
  });

  // Summerfood
  $stateProvider.state('summerfood', {
    url: '/summerfood',
    templateUrl: 'partials/models.html',
    controller: 'ListCtrl',
    onEnter: function(DataService){
      var data = {
        model:'Summerfood',
        first: 'SITE_NAME',
        second: 'SITE_NUMBER',
        third: 'CITY',
        returnstate: 'summerfood'
      }
      DataService.setData(data);
    }
  }).state('viewSummerfood', {
    url: '/summerfood/:id/view',
    templateUrl: 'partials/model-view.html',
    controller: 'ViewCtrl'
  }).state('newSummerfood', {
    url: '/summerfood/new',
    templateUrl: 'partials/model-add.html',
    controller: 'CreateCtrl'
  }).state('editSummerfood', {
    url: '/summerfood/:id/edit',
    templateUrl: 'partials/model-edit.html',
    controller: 'EditCtrl'
  });

  // Programs
  $stateProvider.state('programs', {
    url: '/programs',
    templateUrl: 'partials/models.html',
    controller: 'ListCtrl',
    onEnter: function(DataService){
      var data = {
        model:'Program',
        first: 'NAME',
        second: 'LICENSE_NUMBER',
        third: 'CITY',
        returnstate: 'programs'
      }
      DataService.setData(data);
    }
  }).state('viewProgram', {
    url: '/program/:id/view',
    templateUrl: 'partials/model-view.html',
    controller: 'ViewCtrl'
  }).state('newProgram', {
    url: '/program/new',
    templateUrl: 'partials/model-add.html',
    controller: 'CreateCtrl'
  }).state('editProgram', {
    url: '/program/:id/edit',
    templateUrl: 'partials/model-edit.html',
    controller: 'EditCtrl'
  });

}).run(function($state){
  $state.go('schools.list');
});
