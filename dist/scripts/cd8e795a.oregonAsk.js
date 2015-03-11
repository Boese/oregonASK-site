!function(){"use strict";angular.module("schoolApp",["ui.router","ngResource","schoolApp.controllers","schoolApp.grid-controller","schoolApp.contacts-controller","schoolApp.services","schoolApp.directives"]),angular.module("schoolApp").config(["$stateProvider","$urlRouterProvider",function(a,b){b.otherwise("/login"),a.state("data",{"abstract":!0,url:"/",templateUrl:"index.html",controller:"DataCtrl"}).state("data.list",{url:":model/list",templateUrl:"views/models.html",controller:"ListCtrl"}).state("data.view",{url:":model/:id/view",templateUrl:"views/model-view.html",controller:"ViewCtrl"}).state("data.new",{url:":model/new",templateUrl:"views/model-add.html",controller:"EditCtrl"}).state("data.edit",{url:":model/:id/edit",templateUrl:"views/model-edit.html",controller:"EditCtrl"}).state("data.grid",{url:":model/grid",templateUrl:"views/grid.html",controller:"GridCtrl"}).state("data.edit-table",{url:":table/edit-table",templateUrl:"views/edit-table.html",controller:"EditTableCtrl"}).state("data.login",{url:"login",templateUrl:"views/login.html"}).state("data.create-account",{url:"create-account",templateUrl:"views/create-account.html"}).state("data.contacts",{url:"contacts",controller:"ContactsCtrl",templateUrl:"views/contacts.html"}).state("data.contacts.contact",{url:"contact",controller:"ContactViewCtrl",templateUrl:"views/contacts-view.html",params:{contact:null,lists:null,campaigns:null}})}])}(),function(){"use strict";function a(a,b,c,d,e,f,g,h){c.defaults.headers.common["Cache-Control"]="no-cache",c.defaults.headers.common.Token=d.get("token"),a.user={email:"",password:"",key:""},a.message="",a.loading=!1,a.loggedin=function(){return null!==d.get("token")&&void 0!==d.get("token")?!0:!1},a.clearTokens=function(){a.$broadcast("form-validation-reset"),a.user={email:"",password:"",key:""}},a.$watch("loggedin()",function(){a.loginbutton=a.loggedin()?"Logout":"Login",a.loginTitle=a.loggedin()?"Your logged in, Select a Data Table above":"Please Login"}),a.login=function(b){a.$broadcast("form-validation-check-validity"),b.$invalid||(a.loading=!0,f.Authenticate(a.user.email,a.user.password).login().$promise.then(function(b){b.Token?(d.put("token",b.Token),a.initialize(),a.loading=!1):(a.message="Login failed, check your email and password",a.loading=!1)})["catch"](function(){a.message="Server might be down. Please try again shortly or refresh the page",d.remove("token"),a.loading=!1}))},a.create=function(c){a.$broadcast("form-validation-check-validity"),c.$invalid||(a.loading=!0,f.Authenticate(a.user.email,a.user.password,a.user.key).create().$promise.then(function(c){var d=c.message;"success"===d?(a.message="Account created successfully",a.loading=!1,b.go("login")):(a.message="Account creation failed, check to make sure your key is valid",a.loading=!1)})["catch"](function(){a.message="Server might be down. Please try again shortly or refresh the page",d.remove("token"),a.loading=!1}))},a.logout=function(){d.remove("token"),a.message="",b.go("data.login")},a.navCollapsed=!0,a.collapse=function(){a.navCollapsed=!a.navCollapsed},a.dataTables=[],a.initialize=function(){c.defaults.headers.common.Token=d.get("token"),e.query({table:"initialize"}).$promise.then(function(c){a.dataTables=angular.copy(c),b.go("data.login")})["catch"](function(){b.go("data.login")})},a.initialize(),g.goBack=function(){h.history.back()},a.notSorted=function(a){return a?Object.keys(a):[]},a.type=function(a){switch(typeof a){case"object":return"[object Array]"===Object.prototype.toString.call(a)?"array":null==a?"null":"hash";case"string":return"string";case"number":return"string";case"boolean":return"string";default:return typeof a}},a.deepExtend=function(b,c){return _.each(c,function(d,e){_.isArray(d)?_.each(d,function(c,d){b[e][d]||b[e].push(c),b[e][d]=a.deepExtend(b[e][d],c)}):_.isObject(d)?b[e]=a.deepExtend(b[e],d):"LAST_EDIT_BY"!==e.toUpperCase()&&"TIME_STAMP"!==e.toUpperCase()&&(b[e]=c[e])}),b},a.sortObject=function(b){var c={},d=_.keys(b);return d=_.sortBy(d,function(a){return _.isArray(b[a])?2:_.isObject(b[a])?1:0}),_.each(d,function(d){if(_.isArray(b[d])){c[d]=[];for(var e in b[d])c[d].push(a.sortObject(b[d][e]))}else c[d]=_.isObject(b[d])?a.sortObject(b[d]):b[d]}),c}}function b(a,b,c,d,e,f,g,h){function i(){h.query({table:a.model}).$promise.then(function(b){var c={},d={};c[a.first]=void 0,c[a.second]=void 0,c[a.third]=void 0,a.tableParams=new g({page:1,count:10,filter:c,sorting:d},{total:b.length,getData:function(c,d){var e=d.filter()?f("filter")(b,d.filter()):b;d.total(e.length),c.resolve(e.slice((d.page()-1)*d.count(),d.page()*d.count())),a.loading=!1}})})["catch"](function(){a.loading=!1,b.go("data.login")})}a.loading=!0,a.properties=[],a.model=c.model,a.getColumn=function(a,b){return a[b]},function(){h.get({table:a.model,id:"new"}).$promise.then(function(b){b=b.toJSON();for(var c in b)_.isObject(b[c])||a.properties.push(c);a.first=a.properties[0],a.second=a.properties[1],a.third=a.properties[2],i()})["catch"](function(){a.loading=!1,b.go("data.login")})}(),a["delete"]=function(c){d.showPopup("Really delete this?")&&(a.loading=!0,h["delete"]({table:a.model,id:c}).$promise.then(function(){a.loading=!1,b.transitionTo(b.current,{model:a.model},{reload:!0,inherit:!1,notify:!0})})["catch"](function(){a.loading=!1,b.go("data.login")}))}}function c(a,b,c,d){a.model=c.model,function(){d.get({table:a.model,id:c.id}).$promise.then(function(b){a.value=a.sortObject(b.toJSON())})["catch"](function(){a.loading=!1,b.go("data.login")})}(),a.parents={},a.getParent=function(c,e){return 0===e?-1:a.parents[c+e]?c+e:(c=c.toUpperCase().replace("_ID",""),d.get({table:c,id:e}).$promise.then(function(b){a.parents[c+e]=b.toJSON()})["catch"](function(){b.go("data.login")}),c+e)}}function d(a,b,c,d,e){function f(a,b,c){_.each(c,function(d,e){return e===b?(c[e].splice(a,1),void(c[e].length<1&&(c[e]=void 0))):void(_.isArray(d)?_.each(d,function(b,c){f(a,c,b)}):_.isObject(d)&&f(a,e,d))})}function g(a,b){var c=!1;for(var d in a){if(d.length>1&&d.toUpperCase()===b){c=!0;break}if(_.isArray(a[d])&&g(a[d],b)){c=!0;break}}return c}function h(e){d.get({table:a.model,id:c.id}).$promise.then(function(b){a.value=a.sortObject(a.deepExtend(e,b.toJSON()))})["catch"](function(){b.go("data.login")})}function i(){d.get({table:a.model,id:"new"}).$promise.then(function(b){c.id?h(b.toJSON()):a.value=a.sortObject(b.toJSON())})["catch"](function(){b.go("data.login")})}a.model=c.model,a.loading=!1,a.save=function(){a.loading=!0,d.save({table:a.model},a.value).$promise.then(function(){a.loading=!1,b.go("data.list",{model:a.model})})["catch"](function(){a.loading=!1,b.go("data.login")})},a["delete"]=function(c,g,h){g?e.showPopup("Really delete this?")&&(a.loading=!0,d["delete"]({table:c,id:g}).$promise.then(function(){f(h,c,a.value),b.go("data.list",{model:a.model}),a.loading=!1})["catch"](function(){a.loading=!1,b.go("data.login")})):c!==a.model&&f(h,c,a.value)},a.clearValues=function(b){var c=angular.copy(b);return _.each(b,function(b,d){_.isArray(b)?_.each(b,function(b,e){c[d][e]=a.clearValues(b)}):c[d]=_.isObject(b)?a.clearValues(b):""}),c},a.checkForParent=function(b){return-1===b.toUpperCase().indexOf("_ID")?!1:(b=b.toUpperCase().replace("_ID",""),b===a.model.toUpperCase()?!1:!g(a.value,b))},a.options={},a.getParent=function(c){return a.options[c]?a.options[c]:(a.options[c]=[],void d.query({table:c}).$promise.then(function(b){a.options[c]=b})["catch"](function(){b.go("data.login")}))},i()}function e(a,b,c,d,e){a.parentTables=angular.copy(a.dataTables),a.tableName=c.table,a.parents=[],a.props=[],a.add=!0,a.table={name:a.tableName,rename:[],add:[],drop:[],addParents:[],dropParents:[]},a.deleteTable=function(){e.showPopup("Really delete this?")&&d["delete"]({table:"delete_table",id:a.tableName}).$promise.then(function(){alert("success"),a.initialize()})["catch"](function(){b.go("data.login")})},a.submitTable=function(){return a.table.name.length<1?void alert("Enter table name"):-1!==a.table.add.indexOf("")?void alert("Enter empty add property fields"):-1!==a.table.addParents.indexOf("")?void alert("please select parents to add"):void(a.add?e.showPopup("Really create this table?")&&d.save({table:"create_table"},a.table).$promise.then(function(){alert("success"),a.initialize()})["catch"](function(){b.go("data.login")}):e.showPopup("Really alter this table?")&&d.save({table:"alter_table"},a.table).$promise.then(function(){alert("success"),a.initialize()})["catch"](function(){b.go("data.login")}))},a.getTable=function(){var b=[];return b=_.union(b,a.parents,a.props,a.table.add,a.table.addParents),b=_.difference(b,a.table.drop,a.table.dropParents),_.each(a.table.rename,function(a){var c=b.indexOf(a.old);b[c]=a["new"]}),b},a.dropParent=function(b){b=b.toUpperCase().replace("_ID","");var c=a.table.dropParents.indexOf(b);-1!==c?a.table.dropParents.splice(c,1):a.table.dropParents.push(b)},a.dropProp=function(b){var c=a.table.drop.indexOf(b);-1!==c?a.table.drop.splice(c,1):a.table.drop.push(b)},a.rename=function(b,c){var d=a.props.indexOf(b);a.props[d]=c,a.table.rename.push({old:b,"new":c})},function(){if(a.tableName){var c=a.parentTables.indexOf(a.tableName);a.parentTables.splice(c,1),d.get({table:a.tableName,id:"new"}).$promise.then(function(b){b=b.toJSON(),_.each(b,function(b,c){_.isArray(b)||_.isObject(b)||(-1!==c.toUpperCase().indexOf("_ID")?a.parents.push(c):a.props.push(c))}),a.add=!1})["catch"](function(){b.go("data.login")})}}()}angular.module("schoolApp.controllers",["ngTable","ngCookies","ngSanitize","ui.select"]).controller("DataCtrl",["$scope","$state","$http","$cookieStore","Service","AuthService","$rootScope","$window",a]).controller("ListCtrl",["$scope","$state","$stateParams","PopupService","$window","$filter","ngTableParams","Service",b]).controller("ViewCtrl",["$scope","$state","$stateParams","Service","$q",c]).controller("EditCtrl",["$scope","$state","$stateParams","Service","PopupService",d]).controller("EditTableCtrl",["$scope","$state","$stateParams","Service","PopupService",e])}(),function(){"use strict";function a(a,b,c,d,e,f){function g(a){var b=Papa.unparse(JSON.stringify(a),{worker:!0}),c=document.createElement("a");c.href="data:attachment/csv,"+encodeURI(b),c.target="_blank",c.download="Export.csv",c.click()}function h(c){var d=Papa.parse(c,{header:!0});e.save({table:"upload_data",id:a.model},d.data).$promise.then(function(){alert("done")})["catch"](function(){b.go("data.login")})}a.model=d.model,a.searchModel={tables:[{name:a.model,columns:[]}],filters:[]},a.updateTable=function(b){var c=_.indexOf(_.pluck(a.searchModel.tables,"name"),b);-1===c?a.searchModel.tables.push({name:b,columns:[]}):a.searchModel.tables.splice(c,1)},a.updateColumns=function(b,c){a.errorMessage=void 0;var d=_.indexOf(_.pluck(a.searchModel.tables,"name"),b),e=_.indexOf(a.searchModel.tables[d].columns,c);-1===e?a.searchModel.tables[d].columns.push(c):a.searchModel.tables[d].columns.splice(e,1)},a.updateTags=function(b,c,d){d=c+"."+d;var e=_.indexOf(_.pluck(a.searchModel.filters,"name"),d);-1===e&&(a.searchModel.filters.push({name:d,values:[]}),e=a.searchModel.filters.length-1),a.searchModel.filters[e].values=_.pluck(b,"text"),b.length<1&&(a.searchModel.filters[e]=[])},a.load=function(){e.get({table:a.model,id:"new"}).$promise.then(function(b){a.value=a.sortObject(b.toJSON())})["catch"](function(){b.go("data.login")})},a.search=function(){var c=!1,d="";_.each(a.searchModel.tables,function(a){a.columns<1&&(d+=a.name+",",c=!0)}),c&&(a.errorMessage="must select at least one field in "+d),c||e.search({table:"search_database"},a.searchModel).$promise.then(function(a){g(a)})["catch"](function(){b.go("data.login")})},a.load(),a.csv={content:null,header:!0,separator:",",result:null},a.openModalUpload=function(){var a=f.open({templateUrl:"modalUpload.html",controller:"ModalUploadCtrl"});a.result.then(function(a){h(a.content)})}}function b(a,b){a.ok=function(a){b.close(a)},a.cancel=function(){b.dismiss("cancel")}}angular.module("schoolApp.grid-controller",["angular-underscore","ngAnimate","ngTagsInput","ngCsvImport"]).controller("GridCtrl",["$scope","$state","$window","$stateParams","Service","$modal",a]).controller("ModalUploadCtrl",["$scope","$modalInstance",b])}(),function(){"use strict";function a(a,b,c,d,e,f){function g(){if(a.filteredContacts=[],"ALL"!==a.list.name||"ALL"!==a.status){for(var b in l)for(var c=0;c<l[b].lists.length;c++)if("ALL"===a.list.name){if(l[b].status===a.status){a.filteredContacts.push(l[b]);break}}else if("ALL"===a.status){if(a.list.id===l[b].lists[c].id){a.filteredContacts.push(l[b]);break}}else if(a.list.id===l[b].lists[c].id&&l[b].status===a.status){a.filteredContacts.push(l[b]);break}}else a.filteredContacts=l;a.tableParams.reload()}function h(){a.$watch("list",function(){g()}),a.$watch("status",function(){g()})}function i(){d.query({table:"lists"}).$promise.then(function(b){a.lists=b,a.lists.push({name:"ALL"}),a.list=a.lists[a.lists.length-1]})["catch"](function(){b.go("data.login")})}function j(){d.get({table:"campaigns"}).$promise.then(function(a){m=a.toJSON().results})["catch"](function(){b.go("data.login")})}function k(){d.get({table:"contacts"}).$promise.then(function(b){b=b.toJSON(),b=b.results;for(var c in b){try{b[c].email_address=b[c].email_addresses[0].email_address}catch(d){b[c].email_address=""}b[c].name=b[c].first_name+" "+b[c].last_name,l.push(b[c])}h();var g={};g.name="",g.email_address="",g.company_name="",a.tableParams=new f({page:1,count:10,filter:g,sorting:{last_name:"asc"}},{total:a.filteredContacts.length,getData:function(b,c){var d=c.filter()?e("filter")(a.filteredContacts,c.filter()):a.filteredContacts,f=c.sorting()?e("orderBy")(d,c.orderBy()):a.filteredContacts;c.total(f.length),a.count=f.length,b.resolve(f.slice((c.page()-1)*c.count(),c.page()*c.count()))}}),a.tableParams.settings().$scope=a})["catch"](function(){b.go("data.login")})}a.state=b;var l=[],m=[];a.filteredContacts=[],a.lists=[],a.status="ACTIVE",a.statuss=["ALL","UNCONFIRMED","ACTIVE","OPTOUT","REMOVED","NON_SUBSCRIBER","VISITOR"],a.searchOptions=["name","email_address","company_name"],a.searchOption=a.searchOptions[0],a.loadContact=function(c){b.go("data.contacts.contact",{contact:c,lists:a.lists,campaigns:m})},a.closeContactView=function(){b.go("data.contacts")},i(),k(),j()}function b(a,b,c,d){function e(a){for(var b in i)if(i[b].id===a)return i[b].name}function f(a){for(var b in j)if(j[b].id===a)return j[b].name}function g(){var b=c.contact;a.contactArray={},a.contact={};for(var d in b)b[d]instanceof Array?b[d].length>0&&(a.contactArray[d]=b[d]):a.contact[d]=b[d];for(var e in a.contactArray.lists)a.contactArray.lists[e].name=f(a.contactArray.lists[e].id)}function h(c,f,g){g?d.query({table:f}).$promise.then(function(b){for(var d in b)b[d].name=e(b[d].campaign_id);a.contactArray[c]=b})["catch"](function(){b.go("login")}):d.get({table:f}).$promise.then(function(b){b=b.toJSON().results;for(var d in b)b[d].name=e(b[d].campaign_id);a.contactArray[c]=b})["catch"](function(){b.go("login")})}var i=c.campaigns,j=c.lists;a.removeUnneededData=function(a,b){return b?-1!==a.toLowerCase().indexOf("id")?!1:!0:!1},null!==c.contact&&(h("summary","contacts/"+c.contact.id+"/tracking/reports/summary",!1),h("activity","contacts/"+c.contact.id+"/tracking",!1),h("SummaryByCampaign","contacts/"+c.contact.id+"/tracking/reports/summaryByCampaign",!0),g())}angular.module("schoolApp.contacts-controller",["ngTable","ui.bootstrap"]).controller("ContactsCtrl",["$scope","$state","$stateParams","ContactService","$filter","ngTableParams",a]).controller("ContactViewCtrl",["$scope","$state","$stateParams","ContactService",b])}(),function(){"use strict";function a(a){return a("http://192.168.11.148:8080/api/:table/:id",{table:"@_table",id:"@_id"},{query:{method:"get",isArray:!0},save:{method:"put"},search:{method:"put",isArray:!0}})}function b(a){this.showPopup=function(b){return a.confirm(b)}}function c(a,b){this.Authenticate=function(c,d,e){return a("http://192.168.11.148:8080/api/login",{},{login:{method:"get",headers:{Authorization:"Base "+b.encode(c+":"+d)}},create:{method:"put",headers:{Authorization:"Base "+b.encode(c+":"+d+":"+e)}}})}}function d(a){return a("http://192.168.11.148:8080/api/contactsAPI/:table",{table:"@_table"},{save:{method:"put"}})}angular.module("schoolApp.services",["base64"]).factory("Service",["$resource",a]).service("PopupService",["$window",b]).service("AuthService",["$resource","$base64",c]).factory("ContactService",["$resource",d])}(),function(){"use strict";function a(a){return{restrict:"A",require:"^form",link:function(b,c,d,e){var f=c[0].querySelector("[name]"),g=angular.element(f),h=g.attr("name");b.$on("form-validation-check-validity",function(){c.toggleClass("has-error",e[h].$invalid)}),b.$on("form-validation-reset",function(){a(function(){c.removeClass("has-error")},0,!1)})}}}angular.module("schoolApp.directives",[]).directive("formValidation",["$timeout",a])}();