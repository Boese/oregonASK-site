'use strict';

angular.module('schoolApp', ['ui.router', 'ngResource', 'schoolApp.controllers', 'schoolApp.services', 'schoolApp.directives']);

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
    url: '/schools',
    templateUrl: 'partials/models.html',
    controller: 'ListCtrl',
    onEnter: function(DataService){  // set data for controllers
      var data = {
        model:'School', // name of Entity
        first:'name',   // name of first column in models list, searched by this
        second:'city',  // name of 2nd column in models list
        third:'county', // name of 3rd column in models list
        returnstate:'schools'   // return state after create,update, or delete
      }
      DataService.setData(data);
    }
  }).state('viewSchool', { //state for showing single model
    url: '/school/:id/view',
    templateUrl: 'partials/model-view.html',
    controller: 'ViewCtrl'
  }).state('newSchool', { //state for adding a new model
    url: '/schools/new',
    templateUrl: 'partials/model-add.html',
    controller: 'CreateCtrl'
  }).state('editSchool', { //state for updating a model
    url: '/schools/:id/edit',
    templateUrl: 'partials/model-edit.html',
    controller: 'EditCtrl'
  });

  // SPONSOR
  $stateProvider.state('sponsors', {
    url: '/sponsors',
    templateUrl: 'partials/models.html',
    controller: 'ListCtrl',
    onEnter: function(DataService){
      var data = {
        model:'Sponsor',
        first:'name',
        second:'agrNumber',
        third:'sponsorType',
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
        first: 'programType',
        second: 'siteName',
        third: 'city',
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
        first: 'siteName',
        second: 'siteNumber',
        third: 'city',
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
        first: 'name',
        second: 'licenseNumber',
        third: 'city',
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
  $state.go('login');
});
