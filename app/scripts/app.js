(function () {
  'use strict';

  angular.module('schoolApp', ['ui.router', 'ngResource', 'schoolApp.controllers', 'schoolApp.grid-controller',
    'schoolApp.contacts-controller', 'schoolApp.services', 'schoolApp.directives']);

  angular.module('schoolApp').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/login');
    // Database
    $stateProvider.state('data', { // state for showing all models
      abstract: true,
      url: '/',
      templateUrl: 'index.html',
      controller: 'DataCtrl'
    }).state('data.list', {
      url: ':model/list',
      templateUrl: 'views/models.html',
      controller: 'ListCtrl'
    }).state('data.view', { //state for showing single model
      url: ':model/:id/view',
      templateUrl: 'views/model-view.html',
      controller: 'ViewCtrl'
    }).state('data.new', { //state for adding a new model
      url: ':model/new',
      templateUrl: 'views/model-add.html',
      controller: 'EditCtrl'
    }).state('data.edit', { //state for updating a model
      url: ':model/:id/edit',
      templateUrl: 'views/model-edit.html',
      controller: 'EditCtrl'
    }).state('data.grid', { //state for updating a model
      url: ':model/grid',
      templateUrl: 'views/grid.html',
      controller: 'GridCtrl'
    }).state('data.login', {
      url: 'login',
      templateUrl: 'views/login.html'
    }).state('data.create-account', {
      url: 'create-account',
      templateUrl: 'views/create-account.html'
    //Contacts from Constant Contacts
    }).state('data.contacts', {
      url: 'contacts',
      controller: 'ContactsCtrl',
      templateUrl: 'views/contacts.html'
    }).state('data.contacts.contact', {
      url: 'contact',
      controller: 'ContactViewCtrl',
      templateUrl: 'views/contacts-view.html',
      params: {contact: null, lists: null, campaigns: null}
    });
  });
})();
