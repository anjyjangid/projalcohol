/***
Metronic AngularJS App Main Script
***/

/* Metronic App */
var MetronicApp = angular.module("MetronicApp", [
    "ui.router", 
    "ui.bootstrap", 
    "oc.lazyLoad",  
    "ngSanitize",
    "ngCookies",
    "19degrees.ngSweetAlert2",
    "slugifier"
]); 


/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
MetronicApp.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
        // global configs go here
    });
}]);

/********************************************
 BEGIN: BREAKING CHANGE in AngularJS v1.3.x:
*********************************************/
/**
`$controller` will no longer look for controllers on `window`.
The old behavior of looking on `window` for controllers was originally intended
for use in examples, demos, and toy apps. We found that allowing global controller
functions encouraged poor practices, so we resolved to disable this behavior by
default.

To migrate, register your controllers with modules rather than exposing them
as globals:

Before:

```javascript
function MyController() {
  // ...
}
```

After:

```javascript
angular.module('myApp', []).controller('MyController', [function() {
  // ...
}]);

Although it's not recommended, you can re-enable the old behavior like this:

```javascript
angular.module('myModule').config(['$controllerProvider', function($controllerProvider) {
  // this option might be handy for migrating old apps, but please don't use it
  // in new ones!
  $controllerProvider.allowGlobals();
}]);
**/

//AngularJS v1.3.x workaround for old style controller declarition in HTML
MetronicApp.config(['$controllerProvider', function($controllerProvider) {
  // this option might be handy for migrating old apps, but please don't use it
  // in new ones!
  $controllerProvider.allowGlobals();
}]);

/********************************************
 END: BREAKING CHANGE in AngularJS v1.3.x:
*********************************************/

/* Setup global settings */
MetronicApp.factory('settings', ['$rootScope', function($rootScope) {
    // supported languages
    
    var settings = {
        layout: {
            pageSidebarClosed: false, // sidebar menu state
            pageBodySolid: false, // solid body color state
            pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
        },
        layoutImgPath: Metronic.getAssetsPath() + 'admin/layout/img/',
        layoutCssPath: Metronic.getAssetsPath() + 'admin/layout/css/'
    };

    $rootScope.settings = settings;

    return settings;
}]);


MetronicApp.service('fileUpload', ['$http','$location', function ($http,$location) {

    this.uploadFileToUrl = function(files,fields,uploadUrl){

        var fd = new FormData();
                
        for (var file in files) {
            fd.append(file, files[file]);
        }

        for (var field in fields) {
            fd.append(field, fields[field]);
        }
            
        return $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}

        })
        .success(function(response) {
            
            if(response.success){
                $location.path("categories/list");
                Metronic.alert({
                    type: 'success',
                    icon: 'check',
                    message: response.message,
                    container: '#info-message',
                    place: 'prepend',
                    closeInSeconds: 3
                });
                
            }else{

                Metronic.alert({
                    type: 'danger',
                    icon: 'warning',
                    message: response.message,
                    container: '#info-message',
                    place: 'prepend',
                    closeInSeconds: 3
                });
            }


        }).error(function(data, status, headers) {            
            Metronic.alert({
                type: 'danger',
                icon: 'warning',
                message: data,
                container: '.portlet-body',
                place: 'prepend',
                closeInSeconds: 3
            });
        });

    }
}]);


/* Setup App Main Controller */
MetronicApp.controller('AppController', ['$scope', '$rootScope','$http','sweetAlert', function($scope, $rootScope,$http,sweetAlert) {

    $scope.$on('$viewContentLoaded', function() {
        Metronic.initComponents(); // init core components        
        //Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive 
    });

    $scope.changeStatus = function(id){

        var currObj = $("#"+id);
        var table = $(currObj).data("table");
        var status = parseInt($(currObj).data("status"));

        $http.get("/admin/global/status/"+id+'/'+table+'/'+status).success(function(response) {

            Metronic.alert({
                        type: 'success',
                        icon: 'check',
                        message: response.message,
                        container: '#info-message',
                        place: 'prepend',
                        closeInSeconds: 3
                    });

            var currObj = $("#"+id);

            if(response.status){

                $(currObj).removeClass("label-success").addClass("label-warning").text("In-Active");

            }else{
                
                $(currObj).removeClass("label-warning").addClass("label-success").text("Active");
                
            }
    
            $(currObj).data("status",response.status);
            

        });

    }

    $scope.globalRemove = function(tab,tabForIds){

        var checkedKeys = $(tabForIds).find("tbody").find("input:checkbox:checked").map(function () {
                          return this.value;
                        }).get();
        

        if(!checkedKeys.length){
        
            Metronic.alert({
                type: 'info',
                icon: 'warning',
                message: "Please select records you want to remove",
                container: '#info-message',
                place: 'prepend',
                closeInSeconds: 3
            });

        }else{
            sweetAlert.swal({   
                title: "Are you sure?",   
                text: "Your will not be able to recover them!",   
                type: "warning",   
                showCancelButton: true,   
                confirmButtonColor: "#DD6B55",   
                confirmButtonText: "Yes, remove !",
                closeOnConfirm: false,
                closeOnCancel: false

            },  function(isConfirm) {
                    if (isConfirm) {
                        
                        $http.delete("/admin/"+tab+"/"+checkedKeys)
                            .success(function(response) {

                                if(response.success){

                                    sweetAlert.swal("Deleted!", response.message, "success");

                                    grid.getDataTable().ajax.reload();//var grid = new Datatable(); Datatable should be init like this with global scope

                                }else{

                                    sweetAlert.swal("Cancelled!", response.message, "error");

                                }

                            })
                            .error(function(data, status, headers) {
                                sweetAlert.swal("Cancelled", data.message, "error");
                            })
                        
                    } else {
                        sweetAlert.swal("Cancelled", "Record(s) safe :)", "error");
                    }
                });
        }

        

    }
    
}]);

/***
Layout Partials.
By default the partials are loaded through AngularJS ng-include directive. In case they loaded in server side(e.g: PHP include function) then below partial 
initialization can be disabled and Layout.init() should be called on page load complete as explained above.
***/

/* Setup Layout Part - Header */
MetronicApp.controller('HeaderController', ['$scope','$http', '$rootScope', function($scope,$http,$rootScope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initHeader(); // init header
    });
    $http.get('admin/profile').success(function(response) {
        $rootScope.user = response;
        $rootScope.user.name = response.first_name+' '+response.last_name;
    });
}]);

/* Setup Layout Part - Sidebar */
MetronicApp.controller('SidebarController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initSidebar(); // init sidebar
    });
}]);

/* Setup Layout Part - Quick Sidebar */
MetronicApp.controller('QuickSidebarController', ['$scope', function($scope) {    
    $scope.$on('$includeContentLoaded', function() {
        setTimeout(function(){
            QuickSidebar.init(); // init quick sidebar        
        }, 2000)
    });
}]);

/* Setup Layout Part - Theme Panel */
MetronicApp.controller('ThemePanelController', ['$scope', function($scope) {    
    $scope.$on('$includeContentLoaded', function() {
        Demo.init(); // init theme panel
    });
}]);

/* Setup Layout Part - Footer */
MetronicApp.controller('FooterController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initFooter(); // init footer
    });
}]);

/* Setup Rounting For All Pages */
MetronicApp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/dashboard");     
    
    $stateProvider
        // Dashboard
        
        .state('dashboard', {
            url: "/dashboard",
            templateUrl: "adminviews/views/dashboard.html",            
            data: {pageTitle: 'Admin Dashboard Template'},
            controller: "DashboardController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/morris/morris.css',
                            'assets/admin/pages/css/tasks.css',
                            
                            'assets/global/plugins/morris/morris.min.js',
                            'assets/global/plugins/morris/raphael-min.js',
                            'assets/global/plugins/jquery.sparkline.min.js',

                            'assets/admin/pages/scripts/index3.js',
                            'assets/admin/pages/scripts/tasks.js',
                            'adminviews/js/controllers/DashboardController.js'
                        ] 
                    });
                }]
            }
        })
        
        // User Account 

        .state("account", {
            url: "/account",
            templateUrl: "adminviews/views/profile/account.html",
            data: {pageTitle: 'User Account'},            
            controller: "UserProfileController",
            resolve: {                
                deps: ['$ocLazyLoad', function($ocLazyLoad) {

                    return $ocLazyLoad.load({
                        name: 'MetronicApp',  
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [                            
                            'adminviews/js/models/userModel.js',
                            'adminviews/js/controllers/UserProfileController.js'
                        ]                    
                    });

                }]                
            }
        })

        // AngularJS plugins
        .state('fileupload', {
            url: "/file_upload.html",
            templateUrl: "views/file_upload.html",
            data: {pageTitle: 'AngularJS File Upload'},
            controller: "GeneralPageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'angularFileUpload',
                        files: [
                            'assets/global/plugins/angularjs/plugins/angular-file-upload/angular-file-upload.min.js',
                        ] 
                    }, {
                        name: 'MetronicApp',
                        files: [
                            'adminviews/js/controllers/GeneralPageController.js'
                        ]
                    }]);
                }]
            }
        })

        // UI Select

        .state('uiselect', {
            url: "/ui_select.html",
            templateUrl: "views/ui_select.html",
            data: {pageTitle: 'AngularJS Ui Select'},
            controller: "UISelectController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'ui.select',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/angularjs/plugins/ui-select/select.min.css',
                            'assets/global/plugins/angularjs/plugins/ui-select/select.min.js'
                        ] 
                    }, {
                        name: 'MetronicApp',
                        files: [
                            'adminviews/js/controllers/UISelectController.js'
                        ] 
                    }]);
                }]
            }
        })

        // UI Bootstrap
        .state('uibootstrap', {
            url: "/ui_bootstrap.html",
            templateUrl: "views/ui_bootstrap.html",
            data: {pageTitle: 'AngularJS UI Bootstrap'},
            controller: "GeneralPageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            'adminviews/js/controllers/GeneralPageController.js'
                        ] 
                    }]);
                }] 
            }
        })

        // Tree View
        .state('tree', {
            url: "/tree",
            templateUrl: "views/tree.html",
            data: {pageTitle: 'jQuery Tree View'},
            controller: "GeneralPageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/jstree/dist/themes/default/style.min.css',

                            'assets/global/plugins/jstree/dist/jstree.min.js',
                            'assets/admin/pages/scripts/ui-tree.js',
                            'adminviews/js/controllers/GeneralPageController.js'
                        ] 
                    }]);
                }] 
            }
        })     

        // Form Tools
        .state('formtools', {
            url: "/form-tools",
            templateUrl: "views/form_tools.html",
            data: {pageTitle: 'Form Tools'},
            controller: "GeneralPageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                            'assets/global/plugins/bootstrap-switch/css/bootstrap-switch.min.css',
                            'assets/global/plugins/jquery-tags-input/jquery.tagsinput.css',
                            'assets/global/plugins/bootstrap-markdown/css/bootstrap-markdown.min.css',
                            'assets/global/plugins/typeahead/typeahead.css',

                            'assets/global/plugins/fuelux/js/spinner.min.js',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                            'assets/global/plugins/jquery-inputmask/jquery.inputmask.bundle.min.js',
                            'assets/global/plugins/jquery.input-ip-address-control-1.0.min.js',
                            'assets/global/plugins/bootstrap-pwstrength/pwstrength-bootstrap.min.js',
                            'assets/global/plugins/bootstrap-switch/js/bootstrap-switch.min.js',
                            'assets/global/plugins/jquery-tags-input/jquery.tagsinput.min.js',
                            'assets/global/plugins/bootstrap-maxlength/bootstrap-maxlength.min.js',
                            'assets/global/plugins/bootstrap-touchspin/bootstrap.touchspin.js',
                            'assets/global/plugins/typeahead/handlebars.min.js',
                            'assets/global/plugins/typeahead/typeahead.bundle.min.js',
                            'assets/admin/pages/scripts/components-form-tools.js',

                            'adminviews/js/controllers/GeneralPageController.js'
                        ] 
                    }]);
                }] 
            }
        })        

        // Date & Time Pickers
        .state('pickers', {
            url: "/pickers",
            templateUrl: "views/pickers.html",
            data: {pageTitle: 'Date & Time Pickers'},
            controller: "GeneralPageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/clockface/css/clockface.css',
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            'assets/global/plugins/bootstrap-colorpicker/css/colorpicker.css',
                            'assets/global/plugins/bootstrap-daterangepicker/daterangepicker-bs3.css',
                            'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',

                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            'assets/global/plugins/clockface/js/clockface.js',
                            'assets/global/plugins/bootstrap-daterangepicker/moment.min.js',
                            'assets/global/plugins/bootstrap-daterangepicker/daterangepicker.js',
                            'assets/global/plugins/bootstrap-colorpicker/js/bootstrap-colorpicker.js',
                            'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',

                            'assets/admin/pages/scripts/components-pickers.js',

                            'adminviews/js/controllers/GeneralPageController.js'
                        ] 
                    }]);
                }] 
            }
        })

        // Custom Dropdowns
        .state('dropdowns', {
            url: "/dropdowns",
            templateUrl: "views/dropdowns.html",
            data: {pageTitle: 'Custom Dropdowns'},
            controller: "GeneralPageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-select/bootstrap-select.min.css',
                            'assets/global/plugins/select2/select2.css',
                            'assets/global/plugins/jquery-multi-select/css/multi-select.css',

                            'assets/global/plugins/bootstrap-select/bootstrap-select.min.js',
                            'assets/global/plugins/select2/select2.min.js',
                            'assets/global/plugins/jquery-multi-select/js/jquery.multi-select.js',

                            'assets/admin/pages/scripts/components-dropdowns.js',

                            'adminviews/js/controllers/GeneralPageController.js'
                        ] 
                    }]);
                }] 
            }
        }) 

        // Advanced Datatables
        .state('datatablesAdvanced', {
            url: "/datatables/advanced.html",
            templateUrl: "adminviews/views/datatables/advanced.html",
            data: {pageTitle: 'Advanced Datatables'},
            controller: "GeneralPageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/select2/select2.css',                             
                            'assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.css', 
                            'assets/global/plugins/datatables/extensions/Scroller/css/dataTables.scroller.min.css',
                            'assets/global/plugins/datatables/extensions/ColReorder/css/dataTables.colReorder.min.css',

                            'assets/global/plugins/select2/select2.min.js',
                            'assets/global/plugins/datatables/all.min.js',
                            'adminviews/js/scripts/table-advanced.js',

                            'adminviews/js/controllers/GeneralPageController.js'
                        ]
                    });
                }]
            }
        })

        // Ajax Datetables
        .state('datatablesAjax', {
            url: "/datatables/ajax.html",
            templateUrl: "adminviews/views/datatables/ajax.html",
            data: {pageTitle: 'Ajax Datatables'},
            controller: "GeneralPageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/select2/select2.css',                             
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.css',

                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            'assets/global/plugins/select2/select2.min.js',
                            'assets/global/plugins/datatables/all.min.js',

                            'assets/global/scripts/datatable.js',
                            'adminviews/js/scripts/table-ajax.js',

                            'adminviews/js/controllers/GeneralPageController.js'
                        ]
                    });
                }]
            }
        })

        .state('customer', {
            url: "/customer",
            templateUrl: "adminviews/views/customer/list.html",
            data: {pageTitle: 'Customer list'},
            controller: "GeneralPageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/select2/select2.css',                             
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.css',

                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            'assets/global/plugins/select2/select2.min.js',
                            'assets/global/plugins/datatables/all.min.js',

                            'assets/global/scripts/datatable.js',
                            'adminviews/js/scripts/table-ajax.js',

                            'adminviews/js/controllers/GeneralPageController.js'
                        ]
                    });
                }]
            }
        })

        // dealers complete route start{


        .state('dealers', {
            url: "/dealers",
            templateUrl: "adminviews/views/dealers/dealers.html",
            redirectTo: 'dealers.list',
            data: {pageTitle: 'Dealers'},
            controller: "DealersController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/select2/select2.css',                             
                            'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            'assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.css',

                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            'assets/global/plugins/select2/select2.min.js',
                            'assets/global/plugins/datatables/all.min.js',

                            'assets/global/scripts/datatable.js',
                            'adminviews/js/scripts/table-ajax.js',

                            'adminviews/js/models/dealerModel.js',
                            'adminviews/js/controllers/DealersController.js'
                        ]
                    });
                }]
            }
        })

        
            .state("dealers.list", {
                url: "/list",
                templateUrl: "adminviews/views/dealers/list.html",
                data: {pageSubTitle: 'Dealers List'}
            })

            .state("dealers.add", {
                    url: "/add",
                    templateUrl: "adminviews/views/dealers/add.html",
                    data: {pageSubTitle: 'Add New Dealer'},
                    controller:"DealerAddController"
            })
            .state("dealers.show", {
                    url: "/show/{dealerid}",
                    templateUrl: "adminviews/views/dealers/show.html",
                    data: {pageSubTitle: 'Dealer Detail'},
                    controller: "DealerShowController",
                    
            })
            .state("dealers.edit",{
                url: "/edit/{dealerid}",
                templateUrl: "adminviews/views/dealers/edit.html",
                data: {pageSubTitle: 'Dealer update'},
                controller:"DealerUpdateController"                
            })

        //  Dealers route end //

        // category complete route start{

            .state('categories', {
                url: "/categories",
                templateUrl: "adminviews/views/categories/index.html",
                data: {pageTitle: 'categories'},
                controller: "CategoryController",
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                                'assets/global/plugins/select2/select2.css',                             
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.css',

                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                                'assets/global/plugins/select2/select2.min.js',
                                'assets/global/plugins/datatables/all.min.js',

                                'assets/global/scripts/datatable.js',
                                'adminviews/js/scripts/table-ajax.js',
                                'js/angular-slugify.js',

                                'adminviews/js/models/categoryModel.js',
                                'adminviews/js/controllers/CategoryController.js'
                            ]
                        });
                    }],                    
                }
            })

            .state("categories.list", {
                url: "/list",
                templateUrl: "adminviews/views/categories/list.html",
                data: {pageTitle: 'Category List'}
            })

            .state("categories.add", {
                url: "/add",
                templateUrl: "adminviews/views/categories/add.html",
                data: {pageTitle: 'Add New Category'},
                
            })

            .state("categories.show", {
                url: "/show/{categoryid}",
                templateUrl: "adminviews/views/categories/show.html",
                data: {pageTitle: 'Category Detail'},
                controller: "CategoryShowController",                
                
            })
            .state("categories.edit",{
                url: "/edit/{categoryid}",
                templateUrl: "adminviews/views/categories/edit.html",
                data: {pageTitle: 'Category Detail'},
                controller:"CategoryUpdateController"                
            })
            


            
            .state('products', {
                url: "/product",
                templateUrl: "adminviews/views/products/index.html",
                data: {pageTitle: 'Products'},
                controller: "ProductsController",
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                                'assets/global/plugins/select2/select2.css',
                                'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                                'assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.css',

                                'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                                'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                                'assets/global/plugins/select2/select2.min.js',
                                'assets/global/plugins/datatables/all.min.js',

                                'assets/global/scripts/datatable.js',                               
                                
                                'adminviews/js/models/productModel.js',
                                'adminviews/js/controllers/ProductController.js'
                            ]
                        });
                    }]
                }
            })

            .state("products.list", {
                url: "/list",
                templateUrl: "adminviews/views/products/list.html",
                data: {pageSubTitle: 'List'}
            })

            .state("products.add", {
                url: "/add",
                templateUrl: "adminviews/views/products/add.html",
                data: {pageSubTitle: 'Add'}
            })

            .state("products.edit", {
                url: "/edit/{productid}",
                templateUrl: "adminviews/views/products/add.html",
                data: {pageSubTitle: 'Edit'}
            })





        // }category complete route end


        // User Profile
        .state("profile", {
            url: "/profile",
            templateUrl: "adminviews/views/profile/main.html",
            data: {pageTitle: 'User Profile'},
            controller: "UserProfileController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {

                    return $ocLazyLoad.load({
                        name: 'MetronicApp',  
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                            'assets/admin/pages/css/profile.css',
                            'assets/admin/pages/css/tasks.css',
                            
                            'assets/global/plugins/jquery.sparkline.min.js',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',

                            'assets/admin/pages/scripts/profile.js',

                            'adminviews/js/models/userModel.js',
                            'adminviews/js/controllers/UserProfileController.js'
                            

                        ]                    
                    });

                }]
            }
        })
        
        // User Profile Dashboard
        .state("profile.dashboard", {
            url: "/dashboard",
            templateUrl: "adminviews/views/profile/dashboard.html",
            data: {pageTitle: 'User Profile'}
        })

        // User Profile Account
        .state("profile.account", {
            url: "/account",
            templateUrl: "adminviews/views/profile/account.html",
            data: {pageTitle: 'User Account'}
        })

        

        // User Profile Help
        .state("profile.help", {
            url: "/help",
            templateUrl: "adminviews/views/profile/help.html",
            data: {pageTitle: 'User Help'}      
        })


        // CMS complete route start{


        .state('cms', {
            url: "/cms",
            templateUrl: "adminviews/views/cms/index.html",
            data: {pageTitle: 'CMS Pages'},
            controller: "CmsController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            'assets/global/plugins/ckeditor/ckeditor.js',                            

                            'adminviews/js/models/cmsModel.js',
                            'adminviews/js/controllers/CmsController.js'
                        ]
                    });
                }]
            }
        })

        
        .state("cms.list", {
            url: "/list",
            templateUrl: "adminviews/views/cms/list.html",
            data: {pageTitle: 'CMS List'}
        })

        .state("cms.edit",{
            url: "/edit/{pageid}",
            templateUrl: "adminviews/views/cms/edit.html",
            data: {pageTitle: 'Update Cms Page'},
            controller:"CmsUpdateController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                                                  
                        ]
                    });
                }]
            }
        })
    
        .state("cms.show", {
                url: "/show/{pageid}",
                templateUrl: "adminviews/views/cms/show.html",
                data: {pageTitle: 'Page Preview'},
                controller: "CmsPageShowController",
                
        })
            

        //  } CMS route end //

        // Testimonial complete route start{


        .state('testimonial', {
            url: "/testimonial",
            templateUrl: "adminviews/views/testimonial/index.html",
            data: {pageTitle: 'Testimonials'},
            controller: "TestimonialController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                            'assets/global/plugins/ckeditor/ckeditor.js',                            

                            'adminviews/js/models/testimonialModel.js',
                            'adminviews/js/controllers/TestimonialController.js'
                        ]
                    });
                }]
            }
        })

        
        .state("testimonial.list", {
            url: "/list",
            templateUrl: "adminviews/views/testimonial/list.html",
            data: {pageSubTitle: 'Testimonials Listing'}
        })

        .state("testimonial.add", {
            url: "/add",
            templateUrl: "adminviews/views/testimonial/add.html",
            data: {pageSubTitle: 'Add Testimonial'},
            controller: "TestimonialAddController"
        })

        .state("testimonial.edit",{
            url: "/edit/{testimonialid}",
            templateUrl: "adminviews/views/testimonial/add.html",
            data: {pageSubTitle: 'Update Testimonial'},
            controller:"TestimonialUpdateController",            
        })

        //  } Testimonials route end //


        // Brand complete route start{


        .state('brand', {
            url: "/brand",
            templateUrl: "adminviews/views/brand/index.html",
            data: {pageTitle: 'Brands'},
            controller: "BrandController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',                            

                            'adminviews/js/models/brandModel.js',
                            'adminviews/js/controllers/BrandController.js'
                        ]
                    });
                }]
            }
        })

        
        .state("brand.list", {
            url: "/list",
            templateUrl: "adminviews/views/brand/list.html",
            data: {pageSubTitle: 'Brands Listing'}
        })

        .state("brand.add", {
            url: "/add",
            templateUrl: "adminviews/views/brand/add.html",
            data: {pageSubTitle: 'Add Brand'},
            controller: "BrandAddController"
        })

        .state("brand.edit",{
            url: "/edit/{brandid}",
            templateUrl: "adminviews/views/brand/add.html",
            data: {pageSubTitle: 'Update Brand'},
            controller:"BrandUpdateController",            
        })

        //  } Brands route end //



        // Email Templates complete route start{


        .state('emailtemplates', {
            url: "/emailtemplates",
            templateUrl: "adminviews/views/emailtemplates/index.html",
            data: {pageTitle: 'CMS Pages'},
            controller: "EmailTemplateController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'adminviews/js/models/emailTemplateModel.js',
                            'adminviews/js/controllers/EmailTemplateController.js'
                        ]
                    });
                }]
            }
        })

        
        .state("emailtemplates.list", {
            url: "/list",
            templateUrl: "adminviews/views/emailtemplates/list.html",
            data: {pageTitle: 'Email Template List'}
        })

        .state("emailtemplates.edit",{
            url: "/edit/{templateid}",
            templateUrl: "adminviews/views/emailtemplates/edit.html",
            data: {pageTitle: 'Update Cms Page'},
            controller:"EmailTemplateUpdateController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/ckeditor/ckeditor.js'
                        ]
                    });
                }]
            }
        })
        
        .state("emailtemplates.show", {
                url: "/show/{templateid}",
                templateUrl: "adminviews/views/emailtemplates/show.html",
                data: {pageTitle: 'Template Preview'},
                controller: "EmailTemplateShowController",
                
        })
            

        //  } Email Template route end //


        // Settings complete route start{

            .state('settings', {
                url: "/settings",
                templateUrl: "adminviews/views/settings/index.html",
                redirectTo: 'settings.general',
                data: {pageTitle: 'Settings'},
                controller: "SettingsController",
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                                            
                                'adminviews/js/models/settingsModel.js',
                                'adminviews/js/controllers/SettingsController.js'
                            ]
                        });
                    }]
                }
            })

            .state("settings.general", {
                url: "/general",
                templateUrl: "adminviews/views/settings/general.html",
                data: {
                    pageSubTitle: 'General Settings',
                    "key":"general"
                }
            })

            .state("settings.social", {
                url: "/social",
                templateUrl: "adminviews/views/settings/social.html",
                data: {
                    pageSubTitle: 'Social Settings',
                    "key":"social"
                }
            })

            .state("settings.pricing", {
                url: "/pricing",
                templateUrl: "adminviews/views/settings/pricing.html",
                data: {
                    pageSubTitle: 'Pricing Settings',
                    "key":"pricing"
                }
            })

        //  Settings route end //

        // Todo
        .state('todo', {
            url: "/todo",
            templateUrl: "adminviews/views/todo.html",
            data: {pageTitle: 'Todo'},
            controller: "TodoController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({ 
                        name: 'MetronicApp',  
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-datepicker/css/datepicker3.css',
                            'assets/global/plugins/select2/select2.css',
                            'assets/admin/pages/css/todo.css',
                            
                            'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            'assets/global/plugins/select2/select2.min.js',

                            'assets/admin/pages/scripts/todo.js',

                            'adminviews/js/controllers/TodoController.js'  
                        ]                    
                    });
                }]
            }
        });        
}]);

MetronicApp.filter("ucwords", function () {
    return function (input){
        if(input) { //when input is defined the apply filter
           input = input.toLowerCase().replace(/\b[a-z]/g, function(letter) {
              return letter.toUpperCase();
           });
        }
        return input; 
    }    
});

MetronicApp.filter('isEmpty', [function() {
  return function(object) {
    return angular.equals({}, object);
  }
}]);

/* Init global settings and run the app */
MetronicApp.run(["$rootScope", "settings", "$state", function($rootScope, settings, $state) {

    $rootScope.$on('$stateChangeStart', function(evt, to, params) {
      if (to.redirectTo) {
        evt.preventDefault();
        $state.go(to.redirectTo, params)
      }
    });

    $rootScope.$state = $state; // state to be accessed from view    

}]);

var objectToFormData = function(obj, form, namespace) {
    
  var fd = form || new FormData();
  var formKey;
  
  for(var property in obj) {
    if(obj.hasOwnProperty(property)) {
      
      if(namespace) {
        formKey = namespace + '[' + property + ']';
      } else {
        formKey = property;
      }
        
      // if the property is an object, but not a File,
      // use recursivity.
      if(typeof obj[property] === 'object' && !(obj[property] instanceof File)) {

        objectToFormData(obj[property], fd, formKey);
        
      } else {
        
        // if it's a string or a File object
        fd.append(formKey, obj[property]);
      }
      
    }
  }
  
  return fd;
    
};
