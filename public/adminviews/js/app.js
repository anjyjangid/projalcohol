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
	"slugifier",
	"angular-storage"
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

    $rootScope.timerange = [
        {opVal:0,opTag:'12:00 am'},
        {opVal:30,opTag:'12:30 am'},
        {opVal:60,opTag:'01:00 am'},
        {opVal:90,opTag:'01:30 am'},
        {opVal:120,opTag:'02:00 am'},
        {opVal:150,opTag:'02:30 am'},
        {opVal:180,opTag:'03:00 am'},
        {opVal:210,opTag:'03:30 am'},
        {opVal:240,opTag:'04:00 am'},
        {opVal:270,opTag:'04:30 am'},
        {opVal:300,opTag:'05:00 am'},
        {opVal:330,opTag:'05:30 am'},
        {opVal:360,opTag:'06:00 am'},
        {opVal:390,opTag:'06:30 am'},
        {opVal:420,opTag:'07:00 am'},
        {opVal:450,opTag:'07:30 am'},
        {opVal:480,opTag:'08:00 am'},
        {opVal:510,opTag:'08:30 am'},
        {opVal:540,opTag:'09:00 am'},
        {opVal:570,opTag:'09:30 am'},
        {opVal:600,opTag:'10:00 am'},
        {opVal:630,opTag:'10:30 am'},
        {opVal:660,opTag:'11:00 am'},
        {opVal:690,opTag:'11:30 am'},
        {opVal:720,opTag:'12:00 pm'},
        {opVal:750,opTag:'12:30 pm'},
        {opVal:780,opTag:'01:00 pm'},
        {opVal:810,opTag:'01:30 pm'},
        {opVal:840,opTag:'02:00 pm'},
        {opVal:870,opTag:'02:30 pm'},
        {opVal:900,opTag:'03:00 pm'},
        {opVal:930,opTag:'03:30 pm'},
        {opVal:960,opTag:'04:00 pm'},
        {opVal:990,opTag:'04:30 pm'},
        {opVal:1020,opTag:'05:00 pm'},
        {opVal:1050,opTag:'05:30 pm'},
        {opVal:1080,opTag:'06:00 pm'},
        {opVal:1120,opTag:'06:30 pm'},
        {opVal:1150,opTag:'07:00 pm'},
        {opVal:1180,opTag:'07:30 pm'},
        {opVal:1210,opTag:'08:00 pm'},
        {opVal:1240,opTag:'08:30 pm'},
        {opVal:1270,opTag:'09:00 pm'},
        {opVal:1300,opTag:'09:30 pm'},
        {opVal:1330,opTag:'10:00 pm'},
        {opVal:1370,opTag:'10:30 pm'},
        {opVal:1400,opTag:'11:00 pm'},
        {opVal:1430,opTag:'11:30 pm'},
    ];

    return settings;

}]);


MetronicApp.service('fileUpload', ['$http','$location', function ($http,$location) {

	this.uploadFileToUrl = function(files,fields,uploadUrl){

		//var fd = new FormData();
		var fd = objectToFormData(fields);            
				
		for (var file in files) {
			fd.append(file, files[file]);
		}
		
		// for (var field in fields) {
		//     fd.append(field, fields[field]);
		// }
			
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
MetronicApp.controller('AppController', ['$scope', '$rootScope','$http','sweetAlert','$state', function($scope, $rootScope,$http,sweetAlert,$state) {

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

	$scope.isActivelink = function(arr,val){

		return (arr.indexOf(val) != -1);

	}

	$scope.menuOptions = [
		{
			label:'Dashboard',
			uisref:'dashboard',
			icon:'icon-home',
			id:'sidebar_menu_link_dashboard'
		},
		{
			label:'Users',			
			icon:'icon-user',
			id:'sidebar_menu_link_user',
			subItems:[
				{
					label:'Customers',
					uisref:'customer.list',
					icon:'icon-user',					
					links:['customer.list','customer.add','customer.edit']
				},
				{
					label:'Dealers',
					uisref:'dealers.list',
					icon:'icon-user',					
					links:['dealers.list','dealers.add','dealers.edit','dealers.show','dealers.orders']
				},
				{
					label:'Sub Administrator',
					uisref:'subadmin.list',
					icon:'icon-user',					
					links:['subadmin.list','subadmin.add','subadmin.edit']
				}
			]
		},
		{
			label:'Orders',
			uisref:'orders.list',
			icon:'icon-user',
			id:'sidebar_menu_link_orders',

		},
		{
			label:'Categories',
			uisref:'categories.list',
			icon:'icon-wrench',
			id:'sidebar_menu_link_categories'
		},
		{
			label:'Products',
			uisref:'products.list',
			icon:'icon-handbag',
			id:'sidebar_menu_link_products'
		},
		{
			label:'Packages',			
			icon:'icon-social-dropbox',
			id:'sidebar_packages',
			subItems:[
				{
					label:'Party Packages',
					uisref:'packages.party',
					icon:'icon-bag',					
					links:['packages.party','packages.addparty','packages.editparty']
				},
				{
					label:'Cocktail Packages',
					uisref:'packages.cocktail',
					icon:'icon-bag',					
					links:['packages.cocktail','packages.addcocktail','packages.editcocktail']
				}
			]
		},
		{
			label:'Time Slots',
			uisref:'timeslots.list',
			icon:'icon-clock',
			id:'sidebar_menu_link_timeslots'
		},
		{
			label:'Global Settings',			
			icon:'icon-settings',
			id:'sidebar_menu_link_settings',
			subItems:[
				{
					label:'General',
					uisref:'settings.general',
					icon:'icon-settings',					
					links:['settings.general']
				},
				{
					label:'Social Links',
					uisref:'settings.social',
					icon:'icon-share',					
					links:['settings.social']
				},
				{
					label:'Pricing',
					uisref:'settings.pricing',
					icon:'icon-wallet',					
					links:['settings.pricing']
				}
			]
		},
		{
			label:'Email Templates',
			uisref:'emailtemplates.list',
			icon:'icon-envelope',
			id:'sidebar_menu_link_emailtemplate'
		},
		{
			label:'CMS Pages',
			uisref:'cms.list',
			icon:'icon-folder',
			id:'sidebar_menu_link_cms'
		},
		{
			label:'Testimonials',
			uisref:'testimonial.list',
			icon:'icon-speech',
			id:'sidebar_menu_link_testimonial'
		},
		{
			label:'Brands',
			uisref:'brand.list',
			icon:'icon-book-open',
			id:'sidebar_menu_link_brand'
		}
	];	
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



MetronicApp.service("AdminUserService", ["$q", "$timeout", "$http", "store", function($q, $timeout, $http, store) {

	var currentUser = null;

	this.getUser = function(){
		if (!currentUser) {
			currentUser = store.get('AdminUser');
		}
		return currentUser;
	};

	this.storeUser = function(data){
		return store.set('AdminUser',data);
	};

	this.removeUser = function(){
		return store.remove('AdminUser');
	};

}]);

MetronicApp.controller('LoginController', ['$scope','AdminUserService', '$rootScope', '$http', function($scope, AdminUserService, $rootScope, $http) {    
	
	$scope.credentials = {};
	$scope.errors = [];

	$scope.adminlogin = function(){
		$http.post('/admin/login',$scope.credentials).success(function(res){
			AdminUserService.storeUser(res);
			$scope.errors = [];
		}).error(function(data, status, headers) {
			$scope.errors = data;
		});
	};

}]);

/* Setup Rounting For All Pages */
MetronicApp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/dashboard");     
    
    $stateProvider
        
        .state('dashboard', {
            url: "/dashboard",
            templateUrl: "adminviews/views/dashboard.html",            
            data: {pageTitle: 'Dashboard'},
            controller: "DashboardController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'adminviews/js/controllers/DashboardController.js'
                        ] 
                    });
                }]
            }
        })
        
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

        .state('customer', {
            abstract:true,            
            templateUrl:'adminviews/views/auth.html',                        
            controller: "CustomerController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'adminviews/js/models/customerModel.js',
                            'adminviews/js/controllers/CustomerController.js'
                        ]
                    });
                }]
            }
        })

        .state("customer.list", {
            url: "/customer/list",
            templateUrl: "adminviews/views/customer/list.html",
            data:{
				pageTitle:'Customers',
				breadCrumb:[
					{title:'Customers','uisref':'#'}					
				]				
			}            
        })

        .state("customer.add", {
            url: "/customer/add",
            templateUrl: "adminviews/views/customer/form.html",
            data:{
				pageTitle:'Add New Customer',
				breadCrumb:[
					{title:'Customers','uisref':'customer.list'},
					{title:'Add','uisref':'#'}
				]				
			},            
            controller:"CustomerAddController"
        })

        .state("customer.edit",{
            url: "/customer/edit/{customerid}",
            templateUrl: "adminviews/views/customer/form.html",
            data:{
				pageTitle:'Edit Customer',
				breadCrumb:[
					{title:'Customers','uisref':'customer.list'},
					{title:'Edit','uisref':'#'}
				]				
			},            
            controller:"CustomerUpdateController"                
        })    

        .state('dealers', {
            abstract:true,            
            templateUrl:'adminviews/views/auth.html',            
            controller: "DealersController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [                            
                            'adminviews/js/models/dealerModel.js',
                            'adminviews/js/controllers/DealersController.js'
                        ]
                    });
                }]
            }
        })
        
        .state("dealers.list", {
            url: "/dealers/list",
            templateUrl: "adminviews/views/dealers/list.html",
            data:{
				pageTitle:'Dealers',
				breadCrumb:[
					{title:'Dealers','uisref':'#'}					
				]				
			}            
        })

        .state("dealers.add", {
            url: "/dealers/add",
            templateUrl: "adminviews/views/dealers/add.html",            
            data:{
				pageTitle:'Add New Dealer',
				breadCrumb:[
					{title:'Dealers','uisref':'dealers.list'},
					{title:'Add','uisref':'#'}
				]				
			},
            controller:"DealerAddController"
        })

        .state("dealers.show", {
            url: "/dealers/show/{dealerid}",
            templateUrl: "adminviews/views/dealers/show.html",
            data:{
				pageTitle:'View Dealer',
				breadCrumb:[
					{title:'Dealers','uisref':'dealers.list'},
					{title:'View','uisref':'#'}
				]				
			},
            controller: "DealerShowController"                
        })

        .state("dealers.edit",{
            url: "/dealers/edit/{dealerid}",
            templateUrl: "adminviews/views/dealers/edit.html",            
            data:{
				pageTitle:'Edit Dealer',
				breadCrumb:[
					{title:'Dealers','uisref':'dealers.list'},
					{title:'Edit','uisref':'#'}
				]				
			},
            controller:"DealerUpdateController"                
        })

        .state("dealers.orders",{
            url: "/dealers/orders/{dealerid}",
            templateUrl: "adminviews/views/dealers/orders.html",
            data:{
				pageTitle:'Dealer orders',
				breadCrumb:[
					{title:'Dealers','uisref':'dealers.list'},
					{title:'Orders','uisref':'#'}
				]				
			},            
            controller:"DealerOrderController"                
        })

        .state('subadmin', {
			abstract:true,
			templateUrl:'adminviews/views/auth.html',
			controller:'SubadminController',			
			resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before',
                        files: [                                                        
                            'adminviews/js/controllers/SubadminController.js'
                        ]
                    });
                }]
            }
		})

		.state('subadmin.list', {
			url: '/subadmin/list',
			templateUrl:'adminviews/views/subadmin/list.html',		
			data:{
				pageTitle:'Sub Administrators',
				breadCrumb:[
					{title:'Sub Administrators','uisref':'#'}					
				]				
			}
		})

		.state('subadmin.add', {
			url: '/subadmin/add',
			templateUrl:'adminviews/views/subadmin/form.html',		
			data:{
				pageTitle:'Add Sub Administrator',
				breadCrumb:[
					{title:'Sub Administrators','uisref':'subadmin.list'},
					{title:'Add','uisref':'#'}
				]				
			}
		})

		.state('subadmin.edit', {
			url: '/subadmin/edit/{id}',
			templateUrl:'adminviews/views/subadmin/form.html',		
			data:{
				pageTitle:'Edit Sub Administrator',
				breadCrumb:[
					{title:'Sub Administrators','uisref':'subadmin.list'},
					{title:'Edit','uisref':'#'}
				]				
			}
		})

        .state("orders",{
			abstract:true,
			templateUrl:'adminviews/views/auth.html',			
			controller:"OrdersController",
			resolve: {
				deps: ['$ocLazyLoad',function($ocLazyLoad){
					return $ocLazyLoad.load({
						name: 'MetronicApp',
						insertBefore: "#ng_load_plugins_before",
						files: [
							'adminviews/js/models/orderModel.js',
							'adminviews/js/controllers/OrdersController.js'
						]
					});
				}]
			}
		})

		.state("orders.list",{
			url: "/orders/list",
			templateUrl: "adminviews/views/orders/list.html",
			data:{
				pageTitle:'Orders List',
				breadCrumb:[
					{title:'Orders','uisref':'#'}
				]				
			}			
		})
		
		.state("orders.show",{
			url: "/orders/show/{order}",
			controller:"OrderShowController",
			templateUrl: "adminviews/views/orders/show.html",
			data:{
				pageTitle:'View Order',
				breadCrumb:[
					{title:'Orders','uisref':'orders.list'},
					{title:'View','uisref':'#'}
				]				
			}
		})                    

        .state('categories', {
            abstract:true,            
            templateUrl:'adminviews/views/auth.html',
            controller: "CategoryController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',                            
                            'js/angular-slugify.js',
                            'adminviews/js/models/categoryModel.js',
                            'adminviews/js/models/settingsModel.js',
                            'adminviews/js/controllers/CategoryController.js'
                        ]
                    });
                }],                    
            }
        })

        .state("categories.list", {
            url: "/categories/list",
            templateUrl: "adminviews/views/categories/list.html",
            data:{
				pageTitle:'Categories',
				breadCrumb:[
					{title:'Categories','uisref':'#'}
				]				
			}            
        })

        .state("categories.add", {
            url: "/categories/add",
            templateUrl: "adminviews/views/categories/add.html",
            data:{
				pageTitle:'Add New Category',
				breadCrumb:[
					{title:'Categories','uisref':'categories.list'},
					{title:'Add','uisref':'#'}
				]				
			}
        })

        .state("categories.show", {
            url: "/categories/show/{categoryid}",
            templateUrl: "adminviews/views/categories/show.html",
            data:{
				pageTitle:'View Category',
				breadCrumb:[
					{title:'Categories','uisref':'categories.list'},
					{title:'View','uisref':'#'}
				]				
			},            
            controller: "CategoryShowController",                
            
        })

        .state("categories.edit",{
            url: "/edit/{categoryid}",
            templateUrl: "adminviews/views/categories/add.html",
            data:{
				pageTitle:'Edit Category',
				breadCrumb:[
					{title:'Categories','uisref':'categories.list'},
					{title:'Edit','uisref':'#'}
				]				
			},            
            controller:"CategoryUpdateController"                
        })            
        
        .state('products', {
            abstract:true,            
            templateUrl:'adminviews/views/auth.html',
            controller: "ProductsController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',                            
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                            'adminviews/js/models/productModel.js',
                            'adminviews/js/controllers/ProductController.js'
                        ]
                    });
                }]
            }
        })

        .state("products.list", {
            url: "/products/list",
            templateUrl: "adminviews/views/products/list.html",
            data:{
				pageTitle:'Products',
				breadCrumb:[
					{title:'Products','uisref':'#'}					
				]				
			},            
        })

        .state("products.add", {
            url: "/products/add",
            templateUrl: "adminviews/views/products/form.html",
            data:{
				pageTitle:'Add New Product',
				breadCrumb:[
					{title:'Products','uisref':'products.list'},
					{title:'Add','uisref':'#'}					
				]				
			}            
        })

        .state("products.edit", {
            url: "/products/edit/{productid}",
            templateUrl: "adminviews/views/products/form.html",
            data:{
				pageTitle:'Edit Product',
				breadCrumb:[
					{title:'Products','uisref':'products.list'},
					{title:'Edit','uisref':'#'}					
				]				
			}            
        })

        .state('packages', {
            abstract:true,            
            templateUrl:'adminviews/views/auth.html',            
            controller: "PackageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',                            
                            'adminviews/js/models/packageModel.js',
                            'adminviews/js/controllers/PackageController.js'
                        ]
                    });
                }]
            }
        })

        .state("packages.party", {
            url: "/packages/party",
            templateUrl: "adminviews/views/packages/list.html",
            data:{
				pageTitle:'Party Packages',
				type:1,
				breadCrumb:[
					{title:'Party Packages','uisref':'#'}					
				]				
			}            
        })

        .state("packages.cocktail", {
            url: "/packages/cocktail",
            templateUrl: "adminviews/views/packages/list.html",
            data:{
				pageTitle:'Cocktail Packages',
				type:2,
				breadCrumb:[
					{title:'Cocktail Packages','uisref':'#'}					
				]				
			}            
        })

        .state("packages.addparty", {
            url: "/packages/addparty",
            templateUrl: "adminviews/views/packages/form.html",
            data:{
				pageTitle:'Add Party Package',
				type:1,
				breadCrumb:[
					{title:'Party Packages','uisref':'packages.party'},
					{title:'Add','uisref':'#'}					
				]				
			}            
        })

        .state("packages.editparty", {
            url: "/packages/editparty/:packageid",
            templateUrl: "adminviews/views/packages/form.html",
            data:{
				pageTitle:'Edit Party Package',
				type:1,
				breadCrumb:[
					{title:'Party Packages','uisref':'packages.party'},
					{title:'Edit','uisref':'#'}					
				]				
			}            
        })

        .state("packages.addcocktail", {
            url: "/packages/addcocktail",
            templateUrl: "adminviews/views/packages/form.html",
            data:{
				pageTitle:'Add Cocktail Package',
				type:2,
				breadCrumb:[
					{title:'Cocktail Packages','uisref':'packages.cocktail'},
					{title:'Add','uisref':'#'}					
				]				
			}            
        })

        .state("packages.editcocktail", {
            url: "/packages/editcocktail/:packageid",
            templateUrl: "adminviews/views/packages/form.html",
            data:{
				pageTitle:'Edit Cocktail Package',
				type:2,
				breadCrumb:[
					{title:'Cocktail Packages','uisref':'packages.cocktail'},
					{title:'Edit','uisref':'#'}					
				]				
			}            
        })

        .state('timeslots', {            
            abstract:true,            
			controller:"TimeslotController",					            
            templateUrl:'adminviews/views/auth.html',
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [                                                        
                            'adminviews/js/controllers/TimeslotController.js'
                        ]
                    });
                }]
            }
        })

        .state('timeslots.list', {
            url: "/timeslots/list",            
            templateUrl: "adminviews/views/timeslots/timeslots.html",		            
            data:{
				pageTitle:'Time Slots',
				breadCrumb:[
					{title:'Time Slots','uisref':'#'}					
				]				
			}           
        })

        .state('settings', {
            abstract:true,
			templateUrl:'adminviews/views/auth.html',
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
            url: "/settings/general",
            templateUrl: "adminviews/views/settings/general.html",
            data:{
				pageTitle:'General Settings',				
				key:"general",
				breadCrumb:[
					{title:'General Settings','uisref':'#'}					
				]				
			}            
        })

        .state("settings.social", {
            url: "/settings/social",
            templateUrl: "adminviews/views/settings/social.html",
            data:{
				pageTitle:'Social Settings',
				key:"social",
				breadCrumb:[
					{title:'Social Settings','uisref':'#'}					
				]				
			}            
        })

        .state("settings.pricing", {
            url: "/pricing",
            templateUrl: "adminviews/views/settings/pricing.html",
            data:{
				pageTitle:'Pricing Settings',
				key:"pricing",
				breadCrumb:[
					{title:'Pricing Settings','uisref':'#'}					
				]				
			}            
        })

        .state('emailtemplates', {
            abstract:true,
			templateUrl:'adminviews/views/auth.html',
            controller: "EmailTemplateController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/ckeditor/ckeditor.js',
                            'adminviews/js/models/emailTemplateModel.js',
                            'adminviews/js/controllers/EmailTemplateController.js'
                        ]
                    });
                }]
            }
        })
        
        .state("emailtemplates.list", {
            url: "/emailtemplates/list",
            templateUrl: "adminviews/views/emailtemplates/list.html",
            data:{
				pageTitle:'Email Templates',
				breadCrumb:[
					{title:'Email Templates','uisref':'#'}					
				]				
			}            
        })

        .state("emailtemplates.edit",{
            url: "/emailtemplates/edit/{templateid}",
            templateUrl: "adminviews/views/emailtemplates/edit.html",
            data:{
				pageTitle:'Edit Email Templates',
				breadCrumb:[
					{title:'Email Templates','uisref':'emailtemplates.list'},
					{title:'Edit','uisref':'#'}
				]				
			},            
            controller:"EmailTemplateUpdateController"            
        })
        
        .state("emailtemplates.show", {
            url: "/emailtemplates/view/{templateid}",
            templateUrl: "adminviews/views/emailtemplates/show.html",
            data:{
				pageTitle:'Email Templates Preview',
				breadCrumb:[
					{title:'Email Templates','uisref':'emailtemplates.list'},
					{title:'View','uisref':'#'}
				]				
			},            
            controller: "EmailTemplateShowController",                
        })        
        
        .state('cms', {
            abstract:true,
			templateUrl:'adminviews/views/auth.html',
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
            url: "/cms/list",
            templateUrl: "adminviews/views/cms/list.html",
            data:{
				pageTitle:'CMS Pages',
				breadCrumb:[
					{title:'CMS Pages','uisref':'#'}					
				]				
			}            
        })

        .state("cms.edit",{
            url: "/cms/edit/{pageid}",
            templateUrl: "adminviews/views/cms/edit.html",
            data:{
				pageTitle:'Edit CMS Pages',
				breadCrumb:[
					{title:'CMS Pages','uisref':'cms.list'},
					{title:'Edit','uisref':'#'}					
				]				
			},
            controller:"CmsUpdateController",            
        })

        .state("cms.show", {
            url: "/cms/show/{pageid}",
            templateUrl: "adminviews/views/cms/show.html",
            data:{
				pageTitle:'Preview CMS Pages',
				breadCrumb:[
					{title:'CMS Pages','uisref':'cms.list'},
					{title:'Show','uisref':'#'}					
				]				
			},
            controller: "CmsPageShowController"                
    	})           

        .state('testimonial', {
            abstract:true,
			templateUrl:'adminviews/views/auth.html',
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
            url: "/testimonial/list",
            templateUrl: "adminviews/views/testimonial/list.html",
            data:{
				pageTitle:'Testimonials',
				breadCrumb:[
					{title:'Testimonials','uisref':'#'}					
				]				
			}            
        })

        .state("testimonial.add", {
            url: "/testimonial/add",
            templateUrl: "adminviews/views/testimonial/add.html",
            data:{
				pageTitle:'Add Testimonial',
				breadCrumb:[
					{title:'Testimonials','uisref':'testimonial.list'},
					{title:'Add','uisref':'#'}					
				]				
			},            
            controller: "TestimonialAddController"
        })

        .state("testimonial.edit",{
            url: "/testimonial/edit/{testimonialid}",
            templateUrl: "adminviews/views/testimonial/add.html",
            data:{
				pageTitle:'Edit Testimonial',
				breadCrumb:[
					{title:'Testimonials','uisref':'testimonial.list'},
					{title:'Edit','uisref':'#'}					
				]				
			},             
            controller:"TestimonialUpdateController",            
        })

        .state('brand', {
            abstract:true,
			templateUrl:'adminviews/views/auth.html',
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
            url: "/brands/list",
            templateUrl: "adminviews/views/brand/list.html",
            data:{
				pageTitle:'Brands',
				breadCrumb:[
					{title:'Brands','uisref':'#'}					
				]				
			},
        })

        .state("brand.add", {
            url: "/brands/add",
            templateUrl: "adminviews/views/brand/add.html",            
            data:{
				pageTitle:'Add Brand',
				breadCrumb:[
					{title:'Brands','uisref':'brand.list'},
					{title:'Add','uisref':'#'}
				]				
			},
            controller: "BrandAddController"
        })

        .state("brand.edit",{
            url: "/brands/edit/{brandid}",
            templateUrl: "adminviews/views/brand/add.html",
            data:{
				pageTitle:'Edit Brands',
				breadCrumb:[
					{title:'Brands','uisref':'brand.list'},
					{title:'Edit','uisref':'#'}
				]				
			},
            controller:"BrandUpdateController",            
        })

        .state("login", {
            url: "/login",
            templateUrl: "adminviews/views/login.html",
            data: {pageTitle: 'Administrator Login'},            
            controller: "LoginController"            
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

MetronicApp.service('myRequestInterceptor', ['$q', '$rootScope', '$log', 
function ($q, $rootScope, $log) {    
	'use strict'; 
	return {
		request: function (config) {            
			return config;
		},
		requestError: function (rejection) {
			return $q.reject(rejection);
		},
		response: function (response) {            
			
			return response;
		},
		responseError: function (rejection) {            
			if(rejection.status == 401){
				$state.go('/admin/login');
			}
			return $q.reject(rejection);
		}
	};
}]).config(['$httpProvider', function($httpProvider) {
	$httpProvider.interceptors.push('myRequestInterceptor');
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

