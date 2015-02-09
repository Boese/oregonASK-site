"use strict";function DataCtrl(a,b,c,d,e){c.defaults.headers.common["Cache-Control"]="no-cache",c.defaults.headers.common.Token=d.get("token"),a.dataTables=[],a.$on("initialize",function(d,f){c.defaults.headers.common.Token=f.token,e.query({table:"initialize"}).$promise.then(function(b){a.dataTables=b})["catch"](function(){b.go("data.login")})}),a.setTable=function(b){a.model=b.model,a.first=b.first,a.second=b.second,a.third=b.third},a.notSorted=function(a){return a?Object.keys(a):[]}}function ListCtrl(a,b,c,d,e,f,g,h){a.getColumn=function(a,b){return a[b]},a.load=function(){h.query({table:a.model}).$promise.then(function(b){var c={},d={};c[a.first]=void 0,c[a.second]=void 0,c[a.third]=void 0,d[a.first]="asc",a.tableParams=new g({page:1,count:10,filter:c,sorting:d},{total:b.length,getData:function(a,c){var d=c.filter()?f("filter")(b,c.filter()):b,e=c.sorting()?f("orderBy")(d,c.orderBy()):b;c.total(e.length),a.resolve(e.slice((c.page()-1)*c.count(),c.page()*c.count()))}})})["catch"](function(){b.go("data.login")})},a["delete"]=function(c,e){d.showPopup("Really delete this?")&&c.$delete({table:a.model,id:e}).$promise.then(function(){b.go("data.list",{model:a.model})})["catch"](function(){b.go("data.login")})},a.load()}function ViewCtrl(a,b,c,d){function e(){d.get({table:a.model,id:c.id}).$promise.then(function(b){b=b.toJSON();for(var c in b)if(b[c]instanceof Array)for(var d in b[c])a.modelArray[c+d]=b[c][d];else a.modelOnly[c]=b[c]instanceof Object?b[c].NAME:b[c]})["catch"](function(){b.go("data.login")})}a.modelOnly={},a.modelArray={},a.removeNumbers=function(a){return a.replace(/[0-9]/g,"").toUpperCase()},e()}function EditCtrl(a,b,c,d){function e(c){d.query({table:c}).$promise.then(function(b){a.options[c]=b})["catch"](function(){b.go("data.login")})}function f(){d.get({table:a.model,id:c.id}).$promise.then(function(b){b=b.toJSON();for(var c in b)if(b[c]instanceof Array){a.modelArray[c]=[],a.entity[c]=[];for(var d in b[c]){var e={};for(var f in b[c][d])e[f]=b[c][d][f];a.modelArray[c].push(h[c][0]),a.entity[c].push(e)}}else-1!==c.indexOf("_ID")?(a.entity[c.replace("_ID","")]={id:""},a.entity[c.replace("_ID","")].id=b[c]):a.entity[c]=b[c]})["catch"](function(){b.go("data.login")})}function g(){d.get({table:a.model,id:"new"}).$promise.then(function(b){b=b.toJSON();for(var d in b)b[d]instanceof Array?(h[d]=[],a.entity[d]=[],a.modelArray[d]=[],h[d].push(b[d][0])):b[d]instanceof Object?(e(d),a.modelParent[d]=b[d]):a.modelOnly[d]=b[d];c.id&&f()})["catch"](function(){b.go("data.login")})}a.options={},a.entity={},a.modelOnly={},a.modelParent={},a.modelArray={},a.save=function(){return void 0===a.entity[a.first]||void 0===a.entity[a.second]||void 0===a.entity[a.third]?void(a.error="Must enter all the red fields above"):a.entity[a.first].length<1||a.entity[a.second].length<1||a.entity[a.third].length<1?void(a.error="Must enter all the red fields above"):void d.save({table:a.model},a.entity).$promise.then(function(){b.go("data.view",{model:a.model,id:c.id})})["catch"](function(){b.go("data.login")})};var h={};a.add=function(b){a.entity[b].push({}),a.modelArray[b].push(h[b][0])},a.remove=function(b,c){a.entity[b].splice(c,c+1),a.modelArray[b].splice(c,c+1)},g()}function LoginCtrl(a,b,c,d,e,f){a.user={email:"",password:"",key:""},a.message="",function(){e.remove("token"),a.$broadcast("form-validation-reset"),a.user={email:"",password:"",key:""}}(),a.loggedin=function(){return null!=e.get("token")&&void 0!==e.get("token")?!0:!1},a.$watch("loggedin()",function(){a.loginbutton=a.loggedin()?"Logout":"Login",a.loginTitle=a.loggedin()?"Your logged in, Select a Data Table above":"Please Login"}),a.login=function(c){a.$broadcast("form-validation-check-validity"),c.$invalid||(e.remove("token"),f.Authenticate(a.user.email,a.user.password).login().$promise.then(function(c){c.Token?(e.put("token",c.Token),b.$broadcast("initialize",{token:c.Token})):a.message="Login failed, check your email and password"})["catch"](function(){a.message="Server might be down. Please try again shortly or refresh the page",e.remove("token")}))},a.create=function(b){a.$broadcast("form-validation-check-validity"),b.$invalid||f.Authenticate(a.user.email,a.user.password,a.user.key).create().$promise.then(function(b){var d=b.message;"success"===d?(a.message="Account created successfully",c.go("login")):a.message="Account creation failed, check to make sure your key is valid"})["catch"](function(){a.message="Server might be down. Please try again shortly or refresh the page",e.remove("token")})},a.logout=function(){e.remove("token"),a.message="",c.go("data.login")}}function gridCtrl(a,b,c,d,e){function f(b){_.find(a.cols,function(a){return a.name===b})||a.cols.push({name:b,width:200})}function g(){e.get({table:a.model,id:"new"}).$promise.then(function(b){b=b.toJSON();for(var c in b)_.isArray(b[c])||f(c);a.gridOptions.columnDefs=angular.copy(a.cols)})["catch"](function(){b.go("data.login")})}function h(){e.query({table:a.model}).$promise.then(function(b){a.entities=b,i()})["catch"](function(){b.go("data.login")})}function i(){e.get({table:a.model,id:"new"}).$promise.then(function(a){a=a.toJSON();for(var b in a)a[b]instanceof Array?n.push(b):a[b]instanceof Object&&m.push(b);j()})["catch"](function(){b.go("data.login")})}function j(){if(n.length<1)k();else{var c=n[0],d=n[0].replace("_","");e.query({table:d}).$promise.then(function(b){_.each(a.entities,function(e){var f={};f[a.model.toUpperCase()+"_ID"]=e.id;var g=_.where(b,f);if(delete e[c],g){var h=0;_.each(g,function(a){a=a.toJSON();for(var b in a){var c=d+"."+h+"."+b;e[c]=a[b]}_.compact(e[c]),h++})}}),n.splice(0,1),j()})["catch"](function(){b.go("data.login")})}}function k(){if(m.length<1)a.gridOptions.data=a.entities,l=!0;else{var c=m[0];e.query({table:c}).$promise.then(function(b){_.each(a.entities,function(a){var d=_.findWhere(b,{id:a[(c+"_id").toUpperCase()]});d&&(a[c]=d.NAME)}),m.splice(0,1),k()})["catch"](function(){b.go("data.login")})}}a.rowsSelected=0,a.rowsVisible=0;var l=!1;a.gridActive=function(){return l},a.gridOptions={enableGridMenu:!1,enableFiltering:!0,enableSorting:!0,exporterLinkLabel:"click here to download excel sheet",exporterCsvLinkElement:angular.element(document.querySelectorAll(".custom-csv-link-location")),exporterPdfDefaultStyle:{fontSize:7,alignment:"center",color:"black"},exporterPdfTableHeaderStyle:{fontSize:8,bold:!0,alignment:"center",color:"blue"},exporterPdfOrientation:"landscape",exporterPdfPageSize:"A2",exporterHeaderFilter:function(a){return a.toLowerCase()},importerDataAddCallback:function(b,c){a.gridOptions.data=c},onRegisterApi:function(b){a.gridApi=b,b.selection.on.rowSelectionChanged(a,function(){a.rowsSelected=b.selection.getSelectedRows().length}),b.selection.on.rowSelectionChangedBatch(a,function(){a.rowsSelected=b.selection.getSelectedRows().length}),b.core.on.rowsVisibleChanged(a,function(){a.rowsVisible=b.core.getVisibleRows(b.grid).length})}},a.getCsvExport=function(){var b=angular.copy(a.gridApi.selection.getSelectedRows());_.each(b,function(a){a=a.toJSON()});var c=_.max(b,function(a){return _.keys(a).length}).toJSON();_.each(b,function(a){for(var b in c)_.has(a,b)||(a[b]=" ")});var d=Papa.unparse(JSON.stringify(b),{worker:!0}),e=document.createElement("a");e.href="data:attachment/csv,"+encodeURI(d),e.target="_blank",e.download="Export.csv",e.click()},a["export"]=function(){if("csv"==a.export_format){var b=angular.element(document.querySelectorAll(".custom-csv-link-location"));a.gridApi.exporter.csvExport(a.export_row_type,a.export_column_type,b)}else"pdf"==a.export_format&&a.gridApi.exporter.pdfExport(a.export_row_type,a.export_column_type)},a.cols=[],a.entities=[];var m=[],n=[];g(),h(),a.refreshData=function(){l=!1,a.gridApi.selection.clearSelectedRows(),g(),l=!0}}function ContactsCtrl(a,b,c,d,e,f){function g(){if(a.filteredContacts=[],"ALL"!==a.list.name||"ALL"!==a.status){for(var b in l)for(var c=0;c<l[b].lists.length;c++)if("ALL"===a.list.name){if(l[b].status===a.status){a.filteredContacts.push(l[b]);break}}else if("ALL"===a.status){if(a.list.id===l[b].lists[c].id){a.filteredContacts.push(l[b]);break}}else if(a.list.id===l[b].lists[c].id&&l[b].status===a.status){a.filteredContacts.push(l[b]);break}}else a.filteredContacts=l;a.tableParams.reload()}function h(){a.$watch("list",function(){g()}),a.$watch("status",function(){g()})}function i(){d.query({table:"lists"}).$promise.then(function(b){a.lists=b,a.lists.push({name:"ALL"}),a.list=a.lists[a.lists.length-1]})["catch"](function(){b.go("data.login")})}function j(){d.get({table:"campaigns"}).$promise.then(function(a){m=a.toJSON().results})["catch"](function(){b.go("data.login")})}function k(){d.get({table:"contacts"}).$promise.then(function(b){b=b.toJSON(),b=b.results;for(var c in b){try{b[c].email_address=b[c].email_addresses[0].email_address}catch(d){b[c].email_address=""}b[c].name=b[c].first_name+" "+b[c].last_name,l.push(b[c])}h();var g={};g.name="",g.email_address="",g.company_name="",a.tableParams=new f({page:1,count:10,filter:g,sorting:{last_name:"asc"}},{total:a.filteredContacts.length,getData:function(b,c){var d=c.filter()?e("filter")(a.filteredContacts,c.filter()):a.filteredContacts,f=c.sorting()?e("orderBy")(d,c.orderBy()):a.filteredContacts;c.total(f.length),a.count=f.length,b.resolve(f.slice((c.page()-1)*c.count(),c.page()*c.count()))}}),a.tableParams.settings().$scope=a})["catch"](function(){b.go("data.login")})}a.state=b;var l=[],m=[];a.filteredContacts=[],a.lists=[],a.status="ACTIVE",a.statuss=["ALL","UNCONFIRMED","ACTIVE","OPTOUT","REMOVED","NON_SUBSCRIBER","VISITOR"],a.searchOptions=["name","email_address","company_name"],a.searchOption=a.searchOptions[0],a.loadContact=function(c){b.go("data.contacts.contact",{contact:c,lists:a.lists,campaigns:m})},a.closeContactView=function(){b.go("data.contacts")},i(),k(),j()}function ContactViewCtrl(a,b,c,d){function e(a){for(var b in i)if(i[b].id===a)return i[b].name}function f(a){for(var b in j)if(j[b].id===a)return j[b].name}function g(){var b=c.contact;a.contactArray={},a.contact={};for(var d in b)b[d]instanceof Array?b[d].length>0&&(a.contactArray[d]=b[d]):a.contact[d]=b[d];for(var d in a.contactArray.lists)a.contactArray.lists[d].name=f(a.contactArray.lists[d].id)}function h(c,f,g){g?d.query({table:f}).$promise.then(function(b){for(var d in b)b[d].name=e(b[d].campaign_id);a.contactArray[c]=b})["catch"](function(){b.go("login")}):d.get({table:f}).$promise.then(function(b){b=b.toJSON().results;for(var d in b)b[d].name=e(b[d].campaign_id);a.contactArray[c]=b})["catch"](function(){b.go("login")})}var i=c.campaigns,j=c.lists;a.removeUnneededData=function(a,b){return b?-1!==a.toLowerCase().indexOf("id")?!1:!0:!1},null!==c.contact&&(h("summary","contacts/"+c.contact.id+"/tracking/reports/summary",!1),h("activity","contacts/"+c.contact.id+"/tracking",!1),h("SummaryByCampaign","contacts/"+c.contact.id+"/tracking/reports/summaryByCampaign",!0),g())}function Service(a){return a("http://0.0.0.0:8080/api/:table/:id",{table:"@_table",id:"@_id"},{save:{method:"put"}})}function popupService(a){this.showPopup=function(b){return a.confirm(b)}}function AuthService(a,b){this.Authenticate=function(c,d,e){return a("http://0.0.0.0:8080/api/login",{},{login:{method:"get",headers:{Authorization:"Base "+b.encode(c+":"+d)}},create:{method:"put",headers:{Authorization:"Base "+b.encode(c+":"+d+":"+e)}}})}}function ContactService(a){return a("http://0.0.0.0:8080/api/contactsAPI/:table",{table:"@_table"},{save:{method:"put"}})}function formValidation(a){return{restrict:"A",require:"^form",link:function(b,c,d,e){var f=c[0].querySelector("[name]"),g=angular.element(f),h=g.attr("name");b.$on("form-validation-check-validity",function(){c.toggleClass("has-error",e[h].$invalid)}),b.$on("form-validation-reset",function(){a(function(){c.removeClass("has-error")},0,!1)})}}}angular.module("schoolApp",["ui.router","ngResource","schoolApp.controllers","schoolApp.grid-controller","schoolApp.contacts-controller","schoolApp.services","schoolApp.directives"]),angular.module("schoolApp").config(["$stateProvider","$urlRouterProvider",function(a,b){b.otherwise("/login"),a.state("data",{"abstract":!0,url:"/",templateUrl:"index.html",controller:"DataCtrl"}).state("data.list",{url:":model/list",templateUrl:"views/models.html",controller:"ListCtrl"}).state("data.view",{url:":model/:id/view",templateUrl:"views/model-view.html",controller:"ViewCtrl"}).state("data.new",{url:":model/new",templateUrl:"views/model-add.html",controller:"EditCtrl"}).state("data.edit",{url:":model/:id/edit",templateUrl:"views/model-edit.html",controller:"EditCtrl"}).state("data.grid",{url:":model/grid",templateUrl:"views/grid.html",controller:"gridCtrl"}).state("data.login",{url:"login",templateUrl:"views/login.html"}).state("data.create-account",{url:"create-account",templateUrl:"views/create-account.html"}).state("data.contacts",{url:"contacts",controller:"ContactsCtrl",templateUrl:"views/contacts.html"}).state("data.contacts.contact",{url:"contact",controller:"ContactViewCtrl",templateUrl:"views/contacts-view.html",params:{contact:null,lists:null,campaigns:null}})}]),angular.module("schoolApp.controllers",["ngTable","ngCookies","ngSanitize","ui.select"]).controller("DataCtrl",["$scope","$state","$http","$cookieStore","Service",DataCtrl]).controller("ListCtrl",["$scope","$state","$stateParams","popupService","$window","$filter","ngTableParams","Service",ListCtrl]).controller("ViewCtrl",["$scope","$state","$stateParams","Service",ViewCtrl]).controller("EditCtrl",["$scope","$state","$stateParams","Service",EditCtrl]).controller("LoginCtrl",["$scope","$rootScope","$state","$stateParams","$cookieStore","AuthService",LoginCtrl]),angular.module("schoolApp.grid-controller",["ngAnimate","ui.grid","ui.grid.resizeColumns","ui.grid.selection","ui.grid.exporter","ui.grid.importer","ui.select","angular-underscore"]).controller("gridCtrl",["$scope","$state","$window","$stateParams","Service","uiGridConstants",gridCtrl]),angular.module("schoolApp.contacts-controller",["ngTable","ui.bootstrap"]).controller("ContactsCtrl",["$scope","$state","$stateParams","ContactService","$filter","ngTableParams",ContactsCtrl]).controller("ContactViewCtrl",["$scope","$state","$stateParams","ContactService",ContactViewCtrl]),angular.module("schoolApp.services",["base64"]).factory("Service",["$resource","$state","$http",Service]).service("popupService",["$window",popupService]).service("AuthService",["$resource","$base64","$http",AuthService]).factory("ContactService",["$resource",ContactService]),angular.module("schoolApp.directives",[]).directive("formValidation",["$timeout",formValidation]);