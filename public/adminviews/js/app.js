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
	"ngMaterial",
	"19degrees.ngSweetAlert2",
	"slugifier",
	"angular-storage",
	"ui.calendar",
	'ngMap',
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
        layoutCssPath: Metronic.getAssetsPath() + 'admin/layout/css/',
        general : {
        	currency : '$'
        }
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


MetronicApp.service('fileUpload', ['$http','$location','$q', function ($http,$location,$q) {

	this.uploadFileToUrl = function(files,fields,uploadUrl){

		var defer = $q.defer();
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

			defer.resolve(response);


		}).error(function(data, status, headers) {

			Metronic.alert({
				type: 'danger',
				icon: 'warning',
				message: "Please check all fields",
				container: '.portlet-body',
				place: 'prepend',
				closeInSeconds: 3
			});
			defer.reject(data);

		});

		return defer.promise;
	}
}]);


/* Setup App Main Controller */
MetronicApp.controller('AppController', ['$scope', '$rootScope','$http','sweetAlert','$state','$filter', function($scope, $rootScope,$http,sweetAlert,$state,$filter) {

	$scope.$on('$viewContentLoaded', function() {
		Metronic.initComponents(); // init core components        
		//Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive 
	});

	$scope.changeStatus = function(id){

		var currObj = $("#"+id);
		var table = $(currObj).data("table");
		var status = parseInt($(currObj).data("status"));

		$http.get("/adminapi/global/status/"+id+'/'+table+'/'+status).success(function(response) {

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

			}).then(
				function(isConfirm) {
					if (isConfirm) {
						
						$http.delete("/adminapi/"+tab+"/"+checkedKeys)
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
				}
			);
		}
	}

	$scope.isActivelink = function(arr,val){

		return (arr.indexOf(val) != -1);

	}

	$scope.notifyUser = function(id,mnum){    	
        $scope.notify = {
            time:30,
            sms:1,
            mail:1,
            numDisable:false,
            loading:false,            
            oid:id
        };

        $scope.notify.oid = id;

        if(mnum == 0){
            $scope.notify.sms = 0;
            $scope.notify.numDisable = true;
        }

        $('#notify').find('.alert').remove();

        $('#notify').modal('show');
    };

    $scope.sendNotification = function(){
        $scope.notify.loading = true;        
        $http.post('/adminapi/admin/notify',$scope.notify).then(function(res){
            $scope.notify.loading = false;            
            
            var st = '';

            if($scope.notify.mail){
                if(!res.data.mailsent){
                    Metronic.alert({
                        type: 'danger',
                        icon: 'warning',
                        message: 'Could not send mail, please try again.',
                        container: '#notify .portlet-body',
                        place: 'prepend',
                        reset: false,
                        closeInSeconds:5                
                    });
                }else{
                    Metronic.alert({
                        type: 'success',
                        icon: 'check',
                        message: 'Mail has been sent successfully.',
                        container: '#notify .portlet-body',
                        place: 'prepend',
                        reset: false,
                        closeInSeconds:5
                    });
                }
            }

            if($scope.notify.sms){
                if(!res.data.smssent){
                    Metronic.alert({
                        type: 'danger',
                        icon: 'warning',
                        message: 'Could not send SMS, please try again.',
                        container: '#notify .portlet-body',
                        place: 'prepend',
                        reset: false,
                        closeInSeconds:5
                    });
                }else{
                    Metronic.alert({
                        type: 'success',
                        icon: 'check',
                        message: 'SMS has been sent successfully.',
                        container: '#notify .portlet-body',
                        place: 'prepend',
                        reset: false,
                        closeInSeconds:5                
                    });
                }
            }            
        },function(erres){            
            $scope.notify.loading = false;
            Metronic.alert({
                type: 'danger',
                icon: 'warning',
                message: erres.data.message,
                container: '#notify .portlet-body',
                place: 'prepend'
            });
        });
    };	
	
}]);

/***
Layout Partials.
By default the partials are loaded through AngularJS ng-include directive. In case they loaded in server side(e.g: PHP include function) then below partial 
initialization can be disabled and Layout.init() should be called on page load complete as explained above.
***/

/* Setup Layout Part - Header */
MetronicApp.controller('HeaderController', ['$scope','$http', '$rootScope','AdminUserService', function($scope,$http,$rootScope,AdminUserService) {
	
	$scope.$on('$includeContentLoaded', function() {
		Layout.initHeader(); // init header
	});

	/*var data = AdminUserService.getUser();

	if(data){
		$scope.user = data;
		$scope.user.name = data.first_name+' '+data.last_name;
	}
	$http.get('admin/profile').success(function(response) {
		$rootScope.user = response;
		$rootScope.user.name = response.first_name+' '+response.last_name;
	});*/

}]);

/* Setup Layout Part - Sidebar */
MetronicApp.controller('SidebarController', ['$scope','$filter', function($scope,$filter) {

	$scope.$on('$includeContentLoaded', function() {
		Layout.initSidebar(); // init sidebar
	});

	var menuOptions = [
		{
			label:'Dashboard',
			uisref:'userLayout.dashboard',
			icon:'icon-home',
			id:'sidebar_menu_link_dashboard'
		},
		{
			label:'Users',			
			icon:'icon-users',
			id:'sidebar_menu_link_user',
			subItems:[
				{
					label:'Administrators',
					uisref:'userLayout.subadmin.list',
					icon:'icon-user-following',					
					links:['userLayout.subadmin.list','userLayout.subadmin.add','userLayout.subadmin.edit'],
					access : ['admin']
				},
				{
					label:'Dealers',
					uisref:'userLayout.dealers.list',
					icon:'icon-user-following',					
					links:['userLayout.dealers.list','userLayout.dealers.add','userLayout.dealers.edit','userLayout.dealers.show','userLayout.dealers.orders'],
					access : ['admin']
				},
				{
					label:'Customers',
					uisref:'userLayout.customer.list',
					icon:'icon-user-following',					
					links:['userLayout.customer.list','userLayout.customer.add','userLayout.customer.edit']
				},
				{
					label:'Businesses',
					uisref:'userLayout.business.list',
					icon:'icon-user-following',					
					links:['userLayout.business.list','userLayout.business.add','userLayout.business.edit'],
					access : ['admin']
				}				
			]
		},
		{
			label:'Orders',			
			icon:'icon-basket',
			id:'sidebar_menu_link_orders',
			subItems:[
				{
					label:'List',
					uisref:'userLayout.orders.list',
					icon:'icon-user-following',					
					links:['userLayout.customer.list','userLayout.customer.add','userLayout.customer.edit']
				},
				{
					label:'New Order',
					uisref:'userLayout.orders.consumer',
					icon:'icon-user-following',					
					links:['userLayout.dealers.list','userLayout.dealers.add','userLayout.dealers.edit','userLayout.dealers.show','userLayout.dealers.orders'],
				},
			]
		},
		{
			label:'Categories',
			uisref:'userLayout.categories.list',
			icon:'icon-list',
			id:'sidebar_menu_link_categories',
			access : ['admin']
		},
		{
			label:'Products',
			icon:'icon-handbag',
			//uisref:'userLayout.products.list',
			id:'sidebar_menu_link_products',
			access : ['admin'],
			subItems:[
				{
					label:'Product List',
					icon:'icon-handbag',
					uisref:'userLayout.products.list',
					id:'sidebar_menu_link_product_list',
					access : ['admin'],
					links:['userLayout.products.list','userLayout.products.add','userLayout.products.edit']	
				},
				{
					label:'Shared Inventory',
					icon:'icon-share',
					uisref:'userLayout.products.shared',
					id:'sidebar_menu_link_shared',
					access : ['admin'],	
					links:['userLayout.products.shared']	
				},
				{
					label:'Stock order list',
					icon:'icon-layers',
					uisref:'userLayout.products.stocks',
					id:'sidebar_menu_link_stocks',
					access : ['admin'],	
					links:['userLayout.products.stocks']	
				}
			]
		},
		{
			label:'Packages',			
			icon:'icon-social-dropbox',
			id:'sidebar_packages',
			access : ['admin'],
			subItems:[
				{
					label:'Party Packages',
					uisref:'userLayout.packages.party',
					icon:'icon-bag',					
					links:['userLayout.packages.party','userLayout.packages.addparty','userLayout.packages.editparty']
				},
				{
					label:'Cocktail Packages',
					uisref:'userLayout.packages.cocktail',
					icon:'icon-bag',					
					links:['userLayout.packages.cocktail','userLayout.packages.addcocktail','userLayout.packages.editcocktail']
				}
			]
		},
		{
			label:'Gifts',			
			icon:'icon-present',
			id:'sidebar_menu_link_gifts',
			access : ['admin'],
			subItems:[
				{
					label:'Gift Categories',
					uisref:'userLayout.gifts.categorylist',
					icon:'icon-layers',
					links:['userLayout.gifts.categorylist']
				},
				{
					label:'Gift Items',
					uisref:'userLayout.gifts.list',
					icon:'icon-bag',
					links:['userLayout.gifts.list']
				},
				{
					label:'Gift Certificates',
					uisref:'userLayout.gifts.cards',
					icon:'icon-credit-card',
					links:['userLayout.gifts.cards']
				}
			]
		},
		{
			label:'Time Slots',
			uisref:'userLayout.timeslots.list',
			icon:'icon-clock',
			id:'sidebar_menu_link_timeslots',
			access : ['admin']
		},
		{
			label:'Public Holidays',
			uisref:'userLayout.publicholidays',
			icon:'icon-calendar',
			id:'sidebar_menu_link_holidays',
			access : ['admin']
		},
		{
			label:'Global Settings',
			icon:'icon-settings',
			id:'sidebar_menu_link_settings',
			access : ['admin'],
			subItems:[
				{
					label:'Stores',
					uisref:'userLayout.stores.list',
					icon:'icon-home',					
					links:['userLayout.stores.list']
				},
				{
					label:'General',
					uisref:'userLayout.settings.general',
					icon:'icon-settings',					
					links:['userLayout.settings.general']
				},
				{
					label:'Social Links',
					uisref:'userLayout.settings.social',
					icon:'icon-share',					
					links:['userLayout.settings.social']
				},
				{
					label:'Pricing',
					uisref:'userLayout.settings.pricing',
					icon:'icon-wallet',					
					links:['userLayout.settings.pricing']
				},
				{
					label:'Loyalty points',
					uisref:'userLayout.settings.loyalty',
					icon:'icon-wallet',					
					links:['userLayout.settings.loyalty']
				}

			]
		},
		{
			label:'Discounts',
			icon:'icon-settings',
			id:'sidebar_menu_link_discounts',
			access : ['admin'],
			subItems:[
				{
					label:'Sale & tags',
					uisref:'userLayout.sale.list',
					icon:'icon-tag',					
					links:['userLayout.sale.list']
				},
				{
					label:'Promotions',
					uisref:'userLayout.promotion.list',
					icon:'icon-grid',					
					links:['userLayout.promotion.list']
				},
				{
					label:'Coupons',
					uisref:'userLayout.coupon.list',
					icon:'icon-grid',										
					links:['userLayout.coupon.list']
				}
			]
		},
		{
			label:'Email Templates',
			uisref:'userLayout.emailtemplates.list',
			icon:'icon-envelope',
			id:'sidebar_menu_link_emailtemplate',
			access : ['admin'],
		},
		{
			label:'CMS Pages',
			uisref:'userLayout.cms.list',
			icon:'icon-folder',
			id:'sidebar_menu_link_cms',
			access : ['admin']
		},
		{
			label:'Testimonials',
			uisref:'userLayout.testimonial.list',
			icon:'icon-speech',
			id:'sidebar_menu_link_testimonial',
			access : ['admin']
		},
		{
			label:'Brands',
			uisref:'userLayout.brand.list',
			icon:'icon-book-open',
			id:'sidebar_menu_link_brand',
			access : ['admin']
		},
		{
			label:'Dont miss',
			uisref:'userLayout.dontmiss',
			icon:'icon-magnet',
			id:'sidebar_menu_link_dontmiss',
			access : ['admin']
		}
		
	];

	$scope.menuOptions = $filter('accessValidate')(menuOptions);

}]);

/* Setup Layout Part - Quick Sidebar */
/*MetronicApp.controller('QuickSidebarController', ['$scope', function($scope) {    
	$scope.$on('$includeContentLoaded', function() {
		setTimeout(function(){
			QuickSidebar.init(); // init quick sidebar        
		}, 2000)
	});
}]);*/

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

MetronicApp.factory('AuthServices', ['$rootScope','$http', 'store', function($rootScope,$http,store) {
	var service = {};

	service.Login = function (username, password, callback) {

	}


}]);

MetronicApp.service("AdminUserService", ["$q", "$timeout", "$http", "store", "$rootScope", function($q, $timeout, $http, store, $rootScope) {

	var currentUser = false;

	this.getUser = function(){
		if (!currentUser) {
			currentUser = store.get('AdminUserData');
		}
		return currentUser;
	};

	this.getRole = function(){

		var currentUser = this.getUser();
		return currentUser.role==2?'subadmin':'admin';

	}

	this.storeUser = function(data){								
		var deferred = $q.defer();
		store.set('AdminUserData',data);		
		$rootScope.user = data;
		$rootScope.user.name = data.first_name+' '+data.last_name;
		deferred.resolve(data);
		return deferred.promise;
	};

	this.removeUser = function(){
		var deferred = $q.defer();	
		store.remove('AdminUserData');
		deferred.resolve();
		return deferred.promise;
	};

	this.isLogged = function(){		
		return store.get('AdminUserData');
	};

	this.chkUser = function(){		
		var deferred = $q.defer();
		if(store.get('AdminUserData')){
			var data = store.get('AdminUserData');
			$rootScope.user = data;
			$rootScope.user.name = data.first_name+' '+data.last_name;
			deferred.resolve(data);			
		}else{
			deferred.reject();
		}
		return deferred.promise;
	};

	this.checkToken = function(token){
		var deferred = $q.defer();
		$http.get('/adminapi/password/reset/'+token).success(function(res){
			deferred.resolve(res);
		}).error(function(err){
			
			deferred.reject(err);
		});
		return deferred.promise;
	}

}]);

MetronicApp.controller('LoginController', ['$scope','AdminUserService', '$rootScope', '$http', '$state', '$location', function($scope, AdminUserService, $rootScope, $http, $state, $location) {    

	$scope.credentials = {remember:0};
	$scope.reset = {};
	$scope.errors = [];
	$scope.reseterrors = [];
	
	if(typeof $rootScope.flash != 'undefined'){
		$scope.showlogin = $rootScope.flash.showlogin;
		$scope.linkerror = 1;
		$scope.linkerrormsg = $rootScope.flash.message; 
	    delete $rootScope.flash;
	}else{
		$scope.linkerror = 0;
		$scope.showlogin = true;	
	}

	$scope.adminlogin = function(){
		$scope.errors = [];
		$http.post('/adminapi/auth/login',$scope.credentials).success(function(res){
			if(res.email){
				AdminUserService.storeUser(res).then(function(res){
					$state.go('userLayout.dashboard',{},{reload:true});	
				});
			}else{
				$scope.errors = {email:['Error in login']};
			}
		}).error(function(data, status, headers) {
			$scope.errors = data;
		});
	};

	$scope.resetRequest = function(){
		$scope.reseterrors = [];
		$http.post('/adminapi/password/email',$scope.reset).success(function(res){		
			$scope.loginForm(true);
			Metronic.alert({
		        type: 'success',
		        icon: 'success',
		        message: res.status,
		        container: '.content',
		        place: 'prepend'        
		    });
		    $scope.reset = {};

		}).error(function(data, status, headers) {
			$scope.reseterrors = data;
		});
	}

	$scope.loginForm = function(f){
		$scope.showlogin = f;
	}

}]);

MetronicApp.controller('ResetpasswordController', ['$rootScope','$scope','$http', '$state', '$stateParams', function($rootScope, $scope, $http, $state, $stateParams) {    
	
	$scope.credentials = {token:$stateParams.key};
	$scope.resetPass = function(){
		$scope.errors = {};
		$http.post('/adminapi/password/reset',$scope.credentials).success(function(){
			$rootScope.flash = {
				showlogin:true,
				message:'Your password has been changed successfully!'
			};
			$state.go('login');
		}).error(function(errors){
			$scope.errors = errors;
			if(errors.invalid){							
				$rootScope.flash = {
					showlogin:false,
					message:'It looks like you clicked on an invalid password reset link. Please try again.'
				};	
				$state.go('login');			
			}
		});
	}

}]);
/* Setup Rounting For All Pages */
MetronicApp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/");     
    
    $stateProvider
        
        /*REDIRECT USER AS PER CONDITION*/
        .state('blank',{
        	url: "/",        	
        	resolve: {
            	authenticate: authenticate
            },
        	controller:function(AdminUserService, $state, $timeout) {	      		
	      		if (AdminUserService.isLogged()) {
	      			$s = 'userLayout.dashboard'	      			
	      		}else{
	      			$s = 'login'	      			
	      		}
	      		$timeout(function(){
	      			$state.go($s);
	      		});
        	}
        })

        .state('userLayout',{
        	
        	views:{
        		"":{
        			"templateUrl":"adminviews/views/userLayout.html",
        		},
        		"headerPanel@userLayout" : {
        	        "templateUrl":"adminviews/tpl/header.html",
        	        "controller":"HeaderController"
        	    },
        	    "sidebarPanel@userLayout":{
        	        "templateUrl":"adminviews/tpl/sidebar.html",
        	        "controller":"SidebarController"
        	    },
        	    "footerPanel@userLayout":{
        	    	"templateUrl":"adminviews/tpl/footer.html",
        	        "controller":"FooterController"
        	    }
        	}
        })

        .state('userLayout.dashboard', {
            url: "/dashboard",
            templateUrl: "adminviews/views/dashboard.html",            
            data: {pageTitle: 'Dashboard'},
            controller: "DashboardController",
            resolve: {
            	authenticate: authenticate,
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
        
        .state("userLayout.account", {
            url: "/account",
            templateUrl: "adminviews/views/profile/account.html",
            data: {pageTitle: 'User Account'},            
            controller: "UserProfileController",
            resolve: {                
                authenticate: authenticate,
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

        .state('userLayout.customer', {
            abstract:true,            
            templateUrl:'adminviews/views/auth.html',                        
            controller: "CustomerController",
            resolve: {
                authenticate: authenticate,
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

        .state("userLayout.customer.list", {
            url: "/customer/list",
            templateUrl: "adminviews/views/customer/list.html",
            data:{
				pageTitle:'Customers',
				breadCrumb:[
					{title:'Customers','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }
        })

        .state("userLayout.customer.add", {
            url: "/customer/add",
            templateUrl: "adminviews/views/customer/form.html",
            data:{
				pageTitle:'Add New Customer',
				breadCrumb:[
					{title:'Customers','uisref':'userLayout.customer.list'},
					{title:'Add','uisref':'#'}
				]				
			},            
            controller:"CustomerAddController",
			resolve: {                
                authenticate: authenticate
            }

        })

        .state("userLayout.customer.edit",{
            url: "/customer/edit/{customerid}",
            templateUrl: "adminviews/views/customer/form.html",           
            data:{
				pageTitle:'Edit Customer',
				breadCrumb:[
					{title:'Customers','uisref':'userLayout.customer.list'},
					{title:'Edit','uisref':'#'}
				]				
			},            
            controller:"CustomerUpdateController",
			resolve: {                
                authenticate: authenticate
            }  
        })    

        .state('userLayout.business', {
            abstract:true,            
            templateUrl:'adminviews/views/auth.html',                        
            controller: "BusinessController",
            resolve: {
                authenticate: authenticate,
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'adminviews/js/models/businessModel.js',
                            'adminviews/js/controllers/BusinessController.js'
                        ]
                    });
                }]
            }
        })

        .state("userLayout.business.list", {
            url: "/business/list",
            templateUrl: "adminviews/views/business/list.html",
            data:{
				pageTitle:'Businesses',
				breadCrumb:[
					{title:'Businesses','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }
        })

        .state("userLayout.business.add", {
            url: "/business/add",
            templateUrl: "adminviews/views/business/add.html",
            data:{
				pageTitle:'Add New Business',
				breadCrumb:[
					{title:'Businesses','uisref':'userLayout.business.list'},
					{title:'Add','uisref':'#'}
				]				
			},            
            controller:"BusinessAddController",
			resolve: {                
                authenticate: authenticate
            }

        })  

        .state("userLayout.business.edit",{
            url: "/business/edit/{businessid}",
            templateUrl: "adminviews/views/business/edit.html",           
            data:{
				pageTitle:'Edit Business',
				breadCrumb:[
					{title:'Businesses','uisref':'userLayout.business.list'},
					{title:'Edit','uisref':'#'}
				]				
			},            
            controller:"BusinessUpdateController",
			resolve: {                
                authenticate: authenticate
            }  
        })                      

        .state('userLayout.dealers', {
            abstract:true,            
            templateUrl:'adminviews/views/auth.html',            
            controller: "DealersController",
            resolve: {                
                authenticate: authenticate,
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
        
        .state("userLayout.dealers.list", {
            url: "/dealers/list",
            templateUrl: "adminviews/views/dealers/list.html",           
            data:{
				pageTitle:'Dealers',
				breadCrumb:[
					{title:'Dealers','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }            
        })

        .state("userLayout.dealers.add", {
            url: "/dealers/add",
            templateUrl: "adminviews/views/dealers/add.html",            
            data:{
				pageTitle:'Add New Dealer',
				breadCrumb:[
					{title:'Dealers','uisref':'userLayout.dealers.list'},
					{title:'Add','uisref':'#'}
				]				
			},
            controller:"DealerAddController",
            resolve: {                
                authenticate: authenticate
            }
        })

        .state("userLayout.dealers.show", {
            url: "/dealers/show/{dealerid}",
            templateUrl: "adminviews/views/dealers/show.html",
            resolve: {                
                authenticate: authenticate
            },
            data:{
				pageTitle:'View Dealer',
				breadCrumb:[
					{title:'Dealers','uisref':'userLayout.dealers.list'},
					{title:'View','uisref':'#'}
				]				
			},
            controller: "DealerShowController",
            resolve: {                
                authenticate: authenticate
            }               
        })

        .state("userLayout.dealers.edit",{
            url: "/dealers/edit/{dealerid}",
            templateUrl: "adminviews/views/dealers/edit.html",   
            data:{
				pageTitle:'Edit Dealer',
				breadCrumb:[
					{title:'Dealers','uisref':'userLayout.dealers.list'},
					{title:'Edit','uisref':'#'}
				]				
			},
            controller:"DealerUpdateController",
            resolve: {                
                authenticate: authenticate
            }
        })

		.state("userLayout.dealers.orders",{

            url: "/dealers/orders/{dealerid}",
            templateUrl: "adminviews/views/dealers/orders.html",
            data:{
				pageTitle:'Dealer orders',
				breadCrumb:[
					{title:'Dealers','uisref':'userLayout.dealers.list'},
					{title:'Orders','uisref':'#'}
				]				
			},            
            controller:"DealerOrderController",
            resolve: {                
                authenticate: authenticate
            }                
        })

        .state('userLayout.subadmin', {
			abstract:true,
			templateUrl:'adminviews/views/auth.html',
			controller:'SubadminController',			
			resolve: {                
                authenticate: authenticate,
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

		.state('userLayout.subadmin.list', {
			url: '/subadmin/list',
			templateUrl:'adminviews/views/subadmin/list.html',		
			data:{
				pageTitle:'Administrators',
				breadCrumb:[
					{title:'Administrators','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }
		})

		.state('userLayout.subadmin.add', {
			url: '/subadmin/add',
			templateUrl:'adminviews/views/subadmin/form.html',		
			data:{
				pageTitle:'Add Administrator',
				breadCrumb:[
					{title:'Administrators','uisref':'userLayout.subadmin.list'},
					{title:'Add','uisref':'#'}
				]				
			},
			resolve: {                
                authenticate: authenticate
            }
		})

		.state('userLayout.subadmin.edit', {
			url: '/subadmin/edit/{id}',
			templateUrl:'adminviews/views/subadmin/form.html',		
			data:{
				pageTitle:'Edit Administrator',
				breadCrumb:[
					{title:'Administrators','uisref':'userLayout.subadmin.list'},
					{title:'Edit','uisref':'#'}
				]				
			},
			resolve: {                
                authenticate: authenticate
            }
		})

        .state("userLayout.orders",{
			abstract:true,
			templateUrl:'adminviews/views/auth.html',			
			controller:"OrdersController",
			resolve: {                
                authenticate: authenticate,
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

		.state("userLayout.orders.list",{
			url: "/orders/list",
			templateUrl: "adminviews/views/orders/list.html",
			data:{
				pageTitle:'Orders List',
				breadCrumb:[
					{title:'Orders','uisref':'#'}
				]				
			},
			resolve: {                
                authenticate: authenticate
            }		
		})
		
		.state("userLayout.orders.show",{
			url: "/orders/show/{order}",
			controller:"OrderShowController",
			templateUrl: "adminviews/views/orders/show.html",
			data:{
				pageTitle:'View Order',
				breadCrumb:[
					{title:'Orders','uisref':'userLayout.orders.list'},
					{title:'View','uisref':'#'}
				]				
			},
			resolve: {                
                authenticate: authenticate
            }
		})                    

		.state("userLayout.orders.consumer",{
			url: "/orders/consumer",			
			views : {

				"" : {
					templateUrl: "adminviews/views/orders/order/index.html",
					controller : "OrderCreateController",
				},
				"products@userLayout.orders.consumer" : {					
					templateUrl: "adminviews/views/orders/order/products.html",
					controller : "OrderProductsController",
				},
				"delivery@userLayout.orders.consumer" : {
					templateUrl: "adminviews/views/orders/order/delivery.html",
					controller : "OrderDeliveryController",
				},
				"payment@userLayout.orders.consumer" : {
					templateUrl: "adminviews/views/orders/order/payment.html",
					controller : "OrderPaymentController",
				},
				"review@userLayout.orders.consumer" : {
					templateUrl: "adminviews/views/orders/order/review.html",
					controller : "OrderReviewController",
				}
			},			
			data:{
				step:'cart',
				pageTitle:'Create Order : Cart',
				breadCrumb:[
					{title:'Orders','uisref':'userLayout.orders.list'},
					{title:'Create','uisref':'userLayout.orders.consumer'},					
				]
			},
			resolve: {
				authenticate: authenticate,
				storeInit : function (alcoholStore){

					return alcoholStore.init();

			    }
				
			}
		})

        .state('userLayout.categories', {
            abstract:true,            
            templateUrl:'adminviews/views/auth.html',
            controller: "CategoryController",
            resolve: {                
                authenticate: authenticate,
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

        .state("userLayout.categories.list", {
            url: "/categories/list",
            templateUrl: "adminviews/views/categories/list.html",
            data:{
				pageTitle:'Categories',
				breadCrumb:[
					{title:'Categories','uisref':'#'}
				]				
			},
			resolve: {                
                authenticate: authenticate
            }            
        })

        .state("userLayout.categories.add", {
            url: "/categories/add",
            templateUrl: "adminviews/views/categories/add.html",
            data:{
				pageTitle:'Add New Category',
				breadCrumb:[
					{title:'Categories','uisref':'userLayout.categories.list'},
					{title:'Add','uisref':'#'}
				]				
			},
			resolve: {                
                authenticate: authenticate
            }
        })

        .state("userLayout.categories.show", {
            url: "/categories/show/{categoryid}",
            templateUrl: "adminviews/views/categories/show.html",
            data:{
				pageTitle:'View Category',
				breadCrumb:[
					{title:'Categories','uisref':'userLayout.categories.list'},
					{title:'View','uisref':'#'}
				]				
			},            
            controller: "CategoryShowController",                
            resolve: {                
                authenticate: authenticate
            }
        })

        .state("userLayout.categories.edit",{
            url: "/categories/edit/{categoryid}",
            templateUrl: "adminviews/views/categories/add.html",
            data:{
				pageTitle:'Edit Category',
				breadCrumb:[
					{title:'Categories','uisref':'userLayout.categories.list'},
					{title:'Edit','uisref':'#'}
				]				
			},            
            controller:"CategoryUpdateController",
            resolve: {                
                authenticate: authenticate
            }                
        })            
        
        .state('userLayout.products', {
            abstract:true,            
            templateUrl:'adminviews/views/auth.html',
            controller: "ProductController",
            resolve: {                
                authenticate: authenticate,
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

        .state("userLayout.products.list", {
            url: "/products/list",
            templateUrl: "adminviews/views/products/list.html",
            data:{
				pageTitle:'Products',
				breadCrumb:[
					{title:'Products','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }            
        })

        .state("userLayout.products.add", {
            url: "/products/add",
            templateUrl: "adminviews/views/products/form.html",
            data:{
				pageTitle:'Add New Product',
				breadCrumb:[
					{title:'Products','uisref':'userLayout.products.list'},
					{title:'Add','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }            
        })

        .state("userLayout.products.edit", {
            url: "/products/edit/{productid}",
            templateUrl: "adminviews/views/products/form.html",
            data:{
				pageTitle:'Edit Product',
				breadCrumb:[
					{title:'Products','uisref':'userLayout.products.list'},
					{title:'Edit','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }            
        })

        .state("userLayout.products.shared", {
            url: "/products/sharedinventory",
            templateUrl: "adminviews/views/products/shared.html",
            controller: "SharedInventoryController",
            data:{
				pageTitle:'Shared Inventory',
				breadCrumb:[					
					{title:'Shared Inventory','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }            
        })

        .state("userLayout.products.stocks", {
            url: "/products/stocks",
            templateUrl: "adminviews/views/stocks/list.html",
            controller: "StockController",
            data:{
				pageTitle:'Stock Order List',
				breadCrumb:[					
					{title:'Stock Order List','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }            
        })

        .state('userLayout.packages', {
            abstract:true,            
            templateUrl:'adminviews/views/auth.html',            
            controller: "PackageController",
            resolve: {                
                authenticate: authenticate,
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

        .state("userLayout.packages.party", {
            url: "/packages/party",
            templateUrl: "adminviews/views/packages/list.html",
            data:{
				pageTitle:'Party Packages',
				type:1,
				breadCrumb:[
					{title:'Party Packages','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }            
        })

        .state("userLayout.packages.cocktail", {
            url: "/packages/cocktail",
            templateUrl: "adminviews/views/packages/list.html",
            data:{
				pageTitle:'Cocktail Packages',
				type:2,
				breadCrumb:[
					{title:'Cocktail Packages','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }            
        })

        .state("userLayout.packages.addparty", {
            url: "/packages/addparty",
            templateUrl: "adminviews/views/packages/form.html",
            data:{
				pageTitle:'Add Party Package',
				type:1,
				breadCrumb:[
					{title:'Party Packages','uisref':'userLayout.packages.party'},
					{title:'Add','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }            
        })

        .state("userLayout.packages.editparty", {
            url: "/packages/editparty/:packageid",
            templateUrl: "adminviews/views/packages/form.html",
            data:{
				pageTitle:'Edit Party Package',
				type:1,
				breadCrumb:[
					{title:'Party Packages','uisref':'userLayout.packages.party'},
					{title:'Edit','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }            
        })

        .state("userLayout.packages.addcocktail", {
            url: "/packages/addcocktail",
            templateUrl: "adminviews/views/packages/form.html",
            data:{
				pageTitle:'Add Cocktail Package',
				type:2,
				breadCrumb:[
					{title:'Cocktail Packages','uisref':'userLayout.packages.cocktail'},
					{title:'Add','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }            
        })

        .state("userLayout.packages.editcocktail", {
            url: "/packages/editcocktail/:packageid",
            templateUrl: "adminviews/views/packages/form.html",
            data:{
				pageTitle:'Edit Cocktail Package',
				type:2,
				breadCrumb:[
					{title:'Cocktail Packages','uisref':'userLayout.packages.cocktail'},
					{title:'Edit','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }            
        })

        .state('userLayout.gifts', {            
            abstract:true,            
			controller:"GiftController",					            
            templateUrl:'adminviews/views/auth.html',
            resolve: {                
                authenticate: authenticate,
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [                                                        
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                            'js/angular-slugify.js',
							'adminviews/js/models/giftModel.js',
                            'adminviews/js/controllers/GiftController.js'
                        ]
                    });
                }]
            }
        })

        .state('userLayout.gifts.list', {
            url: "/gifts/list",            
            templateUrl: "adminviews/views/gifts/list.html",		            
            controller:"GiftFormController",
            data:{
				pageTitle:'Gifts Items',
				breadCrumb:[
					{title:'Gifts Items','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }           
        })

        .state('userLayout.gifts.add', {
            url: "/gifts/add",            
            templateUrl: "adminviews/views/gifts/form.html",		            
            controller:"GiftFormController",
            data:{
				pageTitle:'Add Gift',
				breadCrumb:[
					{title:'Gifts Items','uisref':'userLayout.gifts.list'},
					{title:'Add','uisref':'#'}
				]				
			},
			resolve: {                
                authenticate: authenticate
            }           
        })

        .state('userLayout.gifts.edit', {
            url: "/gifts/edit/{giftid}",            
            templateUrl: "adminviews/views/gifts/form.html",		            
            controller:"GiftFormController",
            data:{
				pageTitle:'Edit Gift',
				breadCrumb:[
					{title:'Gifts Items','uisref':'userLayout.gifts.list'},
					{title:'Add','uisref':'#'}
				]				
			},
			resolve: {                
                authenticate: authenticate
            }           
        })

        .state('userLayout.gifts.categorylist', {
            url: "/gifts/categorylist",            
            templateUrl: "adminviews/views/gifts/categorylist.html",		            
            controller:"GiftCategoryFormController",
            data:{
				pageTitle:'Gift Categories',
				breadCrumb:[
					{title:'Gift Categories','uisref':'#'},					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }           
        })

        .state('userLayout.gifts.categoryadd', {
            url: "/gifts/categoryadd",            
            templateUrl: "adminviews/views/gifts/categoryform.html",		            
            controller:"GiftCategoryFormController",
            data:{
				pageTitle:'Gift Category Add',
				breadCrumb:[
					{title:'Gift Categories','uisref':'userLayout.gifts.categorylist'},					
					{title:'Add','uisref':'#'},					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }           
        })

        .state('userLayout.gifts.categoryedit', {
            url: "/gifts/categoryedit/{categoryid}",            
            templateUrl: "adminviews/views/gifts/categoryform.html",		            
            controller:"GiftCategoryFormController",
            data:{
				pageTitle:'Gift Category Edit',
				breadCrumb:[
					{title:'Gift Categories','uisref':'userLayout.gifts.categorylist'},					
					{title:'Edit','uisref':'#'},					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }           
        })

        .state('userLayout.gifts.cards', {
            url: "/gifts/giftcards",            
            templateUrl: "adminviews/views/gifts/giftcards.html",		            
            controller:"GiftCardController",
            data:{
				pageTitle:'Gift Certificates',
				breadCrumb:[
					{title:'Gift Certificates','uisref':'#'}									
				]				
			},
			resolve: {                
                authenticate: authenticate
            }           
        })

        .state('userLayout.timeslots', {
            abstract:true,            
			controller:"TimeslotController",					            
            templateUrl:'adminviews/views/auth.html',
            resolve: {                
                authenticate: authenticate,
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

        .state('userLayout.timeslots.list', {
            url: "/timeslots/list",            
            templateUrl: "adminviews/views/timeslots/timeslots.html",		            
            data:{
				pageTitle:'Time Slots',
				breadCrumb:[
					{title:'Time Slots','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }           
        })

        .state('userLayout.publicholidays', {
            url: "/publicholidays",            
            templateUrl: "adminviews/views/publicholidays.html",	
            controller:"PublicholidaysController",	            
            data:{
				pageTitle:'Public Holidays',
				breadCrumb:[
					{title:'Public Holidays','uisref':'#'}					
				]								
			},
			resolve: {                
                authenticate: authenticate,
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [                        	
                        	'adminviews/js/controllers/PublicholidaysController.js'
                        ]
                    });
                }]
            }           
        })

        
        .state('userLayout.stores', {
            abstract:true,
			templateUrl:'adminviews/views/auth.html',
            controller: "StoresController",
            resolve: {                
                authenticate: authenticate,
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [                                                        
                            'adminviews/js/models/storeModel.js',
                            'adminviews/js/controllers/StoresController.js'
                        ]
                    });
                }]
            }
        })

        .state("userLayout.stores.list", {
            url: "/store/list",
            templateUrl: "adminviews/views/stores/list.html",
            data:{
				pageTitle:'Stores',								
				breadCrumb:[
					{title:'Stores','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }            
        })

        .state("userLayout.stores.add", {
            url: "/store/add",
            templateUrl: "adminviews/views/stores/form.html",
            data:{
				pageTitle:'Add Store',								
				breadCrumb:[
					{title:'Stores','uisref':'userLayout.stores.list'},
					{title:'Add','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            },
            controller: "StoreFormController",            
        })

        .state("userLayout.stores.edit", {
            url: "/store/edit/{storeId}",
            templateUrl: "adminviews/views/stores/form.html",
            data:{
				pageTitle:'Edit Store',								
				breadCrumb:[
					{title:'Stores','uisref':'userLayout.stores.list'},
					{title:'Edit','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            },
            controller: "StoreFormController",            
        })

        .state('userLayout.settings', {
            abstract:true,
			templateUrl:'adminviews/views/auth.html',
            controller: "SettingsController",
            resolve: {                
                authenticate: authenticate,
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

        

        .state("userLayout.settings.general", {
            url: "/settings/general",
            templateUrl: "adminviews/views/settings/general.html",
            data:{
				pageTitle:'General Settings',				
				key:"general",
				breadCrumb:[
					{title:'General Settings','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }            
        })

        .state("userLayout.settings.social", {
            url: "/settings/social",
            templateUrl: "adminviews/views/settings/social.html",
            data:{
				pageTitle:'Social Settings',
				key:"social",
				breadCrumb:[
					{title:'Social Settings','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }            
        })

        .state("userLayout.settings.pricing", {
            url: "/pricing",
            templateUrl: "adminviews/views/settings/pricing.html",
            data:{
				pageTitle:'Pricing Settings',
				key:"pricing",
				breadCrumb:[
					{title:'Pricing Settings','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }            
        })

        .state("userLayout.settings.loyalty", {
            url: "/loyalty",
            templateUrl: "adminviews/views/settings/loyalty.html",
            data:{
				pageTitle:'Loyalty Settings',
				key:"loyalty",
				breadCrumb:[
					{title:'Loyalty points Settings','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }            
        })

        .state('userLayout.promotion', {
            abstract:true,
			templateUrl:'adminviews/views/auth.html',
            controller: "PromotionController",
            resolve: {                
                authenticate: authenticate,
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',                            

                            'adminviews/js/models/promotionModel.js',
                            'adminviews/js/models/packageModel.js',
                            'adminviews/js/controllers/PromotionController.js'
                        ]
                    });
                }]
            }
        })

        .state("userLayout.promotion.list", {
            url: "/promotion/list",
            templateUrl: "adminviews/views/promotion/list.html",
            data:{
				pageTitle:'Promotions Listing',				
				breadCrumb:[
					{title:'Promotions','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }            
        })

        .state("userLayout.promotion.add", {
            url: "/promotion/add",
            templateUrl: "adminviews/views/promotion/add.html",
            data:{
				pageTitle:'Add Promotions',				
				breadCrumb:[
					{title:'Promotions','uisref':'userLayout.promotion.list'},
					{title:'Add','uisref':'#'}					
				]				
			},            
            controller: "PromotionAddController",
            resolve: {                
                authenticate: authenticate
            }
        })

        .state("userLayout.promotion.edit",{
            url: "/promotion/edit/{promotionId}",
            templateUrl: "adminviews/views/promotion/add.html",
            data:{
				pageTitle:'Edit Promotions',				
				breadCrumb:[
					{title:'Promotions','uisref':'userLayout.promotion.list'},
					{title:'Edit','uisref':'#'}					
				]				
			},            
            controller:"PromotionAddController",            
            resolve: {                
                authenticate: authenticate
            }
        })

        .state('userLayout.coupon', {
            abstract:true,
			templateUrl:'adminviews/views/auth.html',
            controller: "CouponController",
            resolve: {                
                authenticate: authenticate,
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',                            

                            'adminviews/js/models/couponModel.js',
                            'adminviews/js/models/packageModel.js',
                            'adminviews/js/controllers/CouponController.js'
                        ]
                    });
                }]
            }
        })

        .state("userLayout.coupon.list", {
            url: "/coupon/list",
            templateUrl: "adminviews/views/coupon/list.html",
            data:{
				pageTitle:'Coupons Listing',				
				breadCrumb:[
					{title:'Coupons','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }            
        })

        .state("userLayout.coupon.add", {
            url: "/coupon/add",
            templateUrl: "adminviews/views/coupon/add.html",
            data:{
				pageTitle:'Add coupons',				
				breadCrumb:[
					{title:'Coupons','uisref':'userLayout.coupon.list'},
					{title:'Add','uisref':'#'}					
				]				
			},            
            controller: "CouponAddController",
            resolve: {                
                authenticate: authenticate
            }
        })

        .state("userLayout.coupon.edit",{
            url: "/coupon/edit/{couponId}",
            templateUrl: "adminviews/views/coupon/add.html",
            data:{
				pageTitle:'Edit coupons',				
				breadCrumb:[
					{title:'Coupons','uisref':'userLayout.coupon.list'},
					{title:'Edit','uisref':'#'}					
				]				
			},            
            controller:"CouponAddController",            
            resolve: {                
                authenticate: authenticate
            }
        })

        .state('userLayout.dontmiss', {
        	url: "/dontmiss",
			templateUrl:'adminviews/views/dontmiss/index.html',
            controller: "DontMissSuggestionController",
            data:{
				pageTitle:"Don't miss suggestions",
				breadCrumb:[
					{title:"Don't miss suggestions",'uisref':'#'}					
				]				
			},
            resolve: {                
                authenticate: authenticate,
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'adminviews/js/models/dontmissModel.js',
                            'adminviews/js/controllers/DontMissSuggestionController.js'
                        ]
                    });
                }]
            }
        })

        .state('userLayout.emailtemplates', {
            abstract:true,
			templateUrl:'adminviews/views/auth.html',
            controller: "EmailTemplateController",
            resolve: {                
                authenticate: authenticate,
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
        
        .state("userLayout.emailtemplates.list", {
            url: "/emailtemplates/list",
            templateUrl: "adminviews/views/emailtemplates/list.html",
            data:{
				pageTitle:'Email Templates',
				breadCrumb:[
					{title:'Email Templates','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }            
        })

        .state("userLayout.emailtemplates.edit",{
            url: "/emailtemplates/edit/{templateid}",
            templateUrl: "adminviews/views/emailtemplates/edit.html",
            data:{
				pageTitle:'Edit Email Templates',
				breadCrumb:[
					{title:'Email Templates','uisref':'userLayout.emailtemplates.list'},
					{title:'Edit','uisref':'#'}
				]				
			},            
            controller:"EmailTemplateUpdateController",
            resolve: {                
                authenticate: authenticate
            }
        })
        
        .state("userLayout.emailtemplates.show", {
            url: "/emailtemplates/view/{templateid}",
            templateUrl: "adminviews/views/emailtemplates/show.html",
            data:{
				pageTitle:'Email Templates Preview',
				breadCrumb:[
					{title:'Email Templates','uisref':'userLayout.emailtemplates.list'},
					{title:'View','uisref':'#'}
				]				
			},            
            controller: "EmailTemplateShowController",                
            resolve: {                
                authenticate: authenticate
            }
        })        
        
        .state('userLayout.cms', {
            abstract:true,
			templateUrl:'adminviews/views/auth.html',
            controller: "CmsController",
            resolve: {                
                authenticate: authenticate,
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

        .state("userLayout.cms.list", {
            url: "/cms/list",
            templateUrl: "adminviews/views/cms/list.html",
            data:{
				pageTitle:'CMS Pages',
				breadCrumb:[
					{title:'CMS Pages','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }            
        })

        .state("userLayout.cms.edit",{
            url: "/cms/edit/{pageid}",
            templateUrl: "adminviews/views/cms/edit.html",
            data:{
				pageTitle:'Edit CMS Pages',
				breadCrumb:[
					{title:'CMS Pages','uisref':'userLayout.cms.list'},
					{title:'Edit','uisref':'#'}					
				]				
			},
            controller:"CmsUpdateController", 
            resolve: {                
                authenticate: authenticate
            }           
        })

        .state("userLayout.cms.show", {
            url: "/cms/show/{pageid}",
            templateUrl: "adminviews/views/cms/show.html",
            data:{
				pageTitle:'Preview CMS Pages',
				breadCrumb:[
					{title:'CMS Pages','uisref':'userLayout.cms.list'},
					{title:'Show','uisref':'#'}					
				]				
			},
            controller: "CmsPageShowController",
            resolve: {                
                authenticate: authenticate
            }
    	})           

        .state('userLayout.testimonial', {
            abstract:true,
			templateUrl:'adminviews/views/auth.html',
            controller: "TestimonialController",
            resolve: {                
                authenticate: authenticate,
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

        .state("userLayout.testimonial.list", {
            url: "/testimonial/list",
            templateUrl: "adminviews/views/testimonial/list.html",
            data:{
				pageTitle:'Testimonials',
				breadCrumb:[
					{title:'Testimonials','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }            
        })

        .state("userLayout.testimonial.add", {
            url: "/testimonial/add",
            templateUrl: "adminviews/views/testimonial/add.html",
            data:{
				pageTitle:'Add Testimonial',
				breadCrumb:[
					{title:'Testimonials','uisref':'userLayout.testimonial.list'},
					{title:'Add','uisref':'#'}					
				]				
			},            
            controller: "TestimonialAddController",
            resolve: {                
                authenticate: authenticate
            }
        })

        .state("userLayout.testimonial.edit",{
            url: "/testimonial/edit/{testimonialid}",
            templateUrl: "adminviews/views/testimonial/add.html",
            data:{
				pageTitle:'Edit Testimonial',
				breadCrumb:[
					{title:'Testimonials','uisref':'userLayout.testimonial.list'},
					{title:'Edit','uisref':'#'}					
				]				
			},             
            controller:"TestimonialUpdateController",
            resolve: {                
                authenticate: authenticate
            }            
        })

        .state('userLayout.brand', {
            abstract:true,
			templateUrl:'adminviews/views/auth.html',
            controller: "BrandController",
            resolve: {                
                authenticate: authenticate,
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

        .state("userLayout.brand.list", {
            url: "/brands/list",
            templateUrl: "adminviews/views/brand/list.html",
            data:{
				pageTitle:'Brands',
				breadCrumb:[
					{title:'Brands','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }
        })

        .state("userLayout.brand.add", {
            url: "/brands/add",
            templateUrl: "adminviews/views/brand/add.html",            
            data:{
				pageTitle:'Add Brand',
				breadCrumb:[
					{title:'Brands','uisref':'userLayout.brand.list'},
					{title:'Add','uisref':'#'}
				]				
			},
            controller: "BrandAddController",
            resolve: {                
                authenticate: authenticate
            }
        })

        .state("userLayout.brand.edit",{
            url: "/brands/edit/{brandid}",
            templateUrl: "adminviews/views/brand/add.html",
            data:{
				pageTitle:'Edit Brands',
				breadCrumb:[
					{title:'Brands','uisref':'userLayout.brand.list'},
					{title:'Edit','uisref':'#'}
				]				
			},
            controller:"BrandUpdateController", 
            resolve: {                
                authenticate: authenticate
            }           
        })

        //SALE FEATURE

        .state('userLayout.sale', {
            abstract:true,
			templateUrl:'adminviews/views/auth.html',
            controller: "SaleController",
            resolve: {
                authenticate: authenticate,
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                            'adminviews/js/models/saleModel.js',
                            'adminviews/js/controllers/SaleController.js'
                        ]
                    });
                }]
            }
        })

        .state("userLayout.sale.list", {
            url: "/sale/list",
            templateUrl: "adminviews/views/sale/list.html",
            data:{
				pageTitle:'Sale & tags',				
				breadCrumb:[
					{title:'Sale & tags','uisref':'#'}					
				]				
			},
			resolve: {                
                authenticate: authenticate
            }            
        })

        .state("userLayout.sale.add", {
            url: "/sale/add",
            templateUrl: "adminviews/views/sale/add.html",
            data:{
				pageTitle:'Add sale & tags',				
				breadCrumb:[
					{title:'Sale & tags','uisref':'userLayout.sale.list'},
					{title:'Add','uisref':'#'}					
				]				
			},            
            controller: "SaleFormController",
            resolve: {                
                authenticate: authenticate
            }
        })

        .state("userLayout.sale.edit",{
            url: "/sale/edit/{saleId}",
            templateUrl: "adminviews/views/sale/add.html",
            data:{
				pageTitle:'Edit sale & tags',				
				breadCrumb:[
					{title:'Sale & tags','uisref':'userLayout.sale.list'},
					{title:'Edit','uisref':'#'}					
				]				
			},            
            controller:"SaleFormController",            
            resolve: {                
                authenticate: authenticate
            }
        })

        //SALE FEATURE

        .state("login", {
            url: "/login",
            templateUrl: "adminviews/views/login.html",
            data: {pageTitle: 'Administrator Login'},            
            controller: "LoginController",
            resolve: {                
                checkStatus: checkStatus
            }            
        })

        .state("logout", {
            url: "/logout",
            //templateUrl: "adminviews/views/login.html",
            //data: {pageTitle: 'Administrator Login'},            
            controller: function($http,AdminUserService, $state){
            	$http.get('/adminapi/auth/logout').success(function(res){
					AdminUserService.removeUser().then(function(){
						$state.go('login',{},{reload:true});						
					});					
				}).error(function(data, status, headers) {
					
				});
            }            
        })

        .state("resetpassword", {
            url: "/resetpassword/{key}",
            templateUrl: "adminviews/views/resetpassword.html",
            data: {pageTitle: 'Reset password'},            
            controller: "ResetpasswordController",
            resolve: {                
                checkStatus: function($location,AdminUserService,$state,$q,$timeout,$rootScope){
                	if (AdminUserService.isLogged()) {
				        // Resolve the promise successfully
				        $timeout(function() {
				          // This code runs after the authentication promise has been rejected.
				          // Go to the log-in page
				          $state.go('userLayout.dashboard');
				        })

				        // Reject the authentication promise to prevent the state from loading
				        return $q.reject();
				    } else {
                		var token = $location.path().replace('/resetpassword/','');	
						AdminUserService.checkToken(token).then(function(){

						},function(err){
							$rootScope.flash = {
								showlogin:false,
								message:'It looks like you clicked on an invalid password reset link. Please try again.'
							};	
							$state.go('login',{},{reload:true});														
						});
					}	
                }
            }            
        });        



        function authenticate($q, AdminUserService, $state, $timeout, $location) {

	      if (AdminUserService.isLogged()) {
	        // Resolve the promise successfully
	        return $q.when()
	      } else {
	        // The next bit of code is asynchronously tricky.

	        $timeout(function() {
	          // This code runs after the authentication promise has been rejected.
	          // Go to the log-in page
	          $state.go('login',{},{reload:true})
	        })

	        // Reject the authentication promise to prevent the state from loading
	        return $q.reject()
	      }
	    }

	    function checkStatus($q, AdminUserService, $state, $timeout, $location) {

	      if (AdminUserService.isLogged()) {
	        // Resolve the promise successfully
	        $timeout(function() {
	          // This code runs after the authentication promise has been rejected.
	          // Go to the log-in page
	          $state.go('userLayout.dashboard');
	        })

	        // Reject the authentication promise to prevent the state from loading
	        return $q.reject();

	      } else {
	        return $q.when();
	      }
	    }    

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

MetronicApp.filter('accessValidate', ['$filter','AdminUserService',function($filter,AdminUserService) {

	var userRole = AdminUserService.getRole();
	
	return function(listArr) {

  		var listArrCopy = angular.copy(listArr);
  		var splicedCount = 0;

		angular.forEach(listArrCopy, function(value, key) {
			
			if(typeof value.access!=='undefined'){			

				var allowed = value.access.indexOf(userRole);
				
				if(parseInt(allowed)<0){
					
					key-=splicedCount;

					listArr.splice(key,1);

					splicedCount++;

				}
			}

			if(typeof value.subItems!=='undefined'){

				listArr[key].subItems = $filter('accessValidate')(value.subItems);

			}			

		});

		return listArr;
	}

}]);

MetronicApp.filter('getProductThumb', function() {
		return function(input) {

			if(angular.isString(input)){
				return input;
			}

			for(i=0;i<=input.length;i++){
				if(input[i].coverimage==1){
					return input[i].source;
				}
			}
			return "product-default.jpg";
		}
});

MetronicApp.filter('freeTxt', function() {
		return function(input) {
			input = parseFloat(input);
			return input>0?input:'FREE';
		}
});

MetronicApp.filter('pricingTxt', function(currencyFilter,$rootScope) {
		return function(price,freeTxt) {
			
			if(price === null || isNaN(price)){
				price = 0;
			}

			price = parseFloat(price);

			if(typeof freeTxt==='undefined'){
				freeTxt = false;
			}					

			return (price || freeTxt!==true)?currencyFilter(price,$rootScope.settings.general.currency,2):'free';
		}
});

/* Init global settings and run the app */
MetronicApp.run(["$rootScope", "settings", "$state", "$cookieStore", "$log", "store", "$location", "AdminUserService", "$timeout", "$stateParams", function($rootScope, settings, $state, $cookieStore, $log, store, $location, AdminUserService, $timeout, $stateParams) {

	$rootScope.$on('$locationChangeStart', function (event, next, current) {
		AdminUserService.chkUser().then(function(userdata){
			//USER IS LOOGED IN 
		},function(){
			//THROW USER TO LOGIN IN CASE OF SESSION TIMEOUT OR NOT LOGIN AND ALLOW RESETPASSWORD
			if($location.path().indexOf('resetpassword') <= 0){
				$location.path('/login');
			}			
		});                
    });
	
	$rootScope.$state = $state; // state to be accessed from view    

	

}]);




MetronicApp.service('myRequestInterceptor', ['$q', '$rootScope', '$log', '$injector', '$location', function ($q, $rootScope, $log, $injector, $location) {
	'use strict'; 

	var xhrCreations = 0;
    var xhrResolutions = 0;

    //var AdminUserService = $injector.get('AdminUserService');

    function isLoading() {
        return xhrResolutions < xhrCreations;
    }

    function updateStatus() {
        $rootScope.loading = isLoading();
    }

	return {
		request: function (config) {
			xhrCreations++;
            updateStatus();
			return config;
		},
		requestError: function (rejection) {
			xhrResolutions++;
            updateStatus();             
			return $q.reject(rejection);
		},
		response: function (response) {			
			xhrResolutions++;
			updateStatus();
			return response;
		},
		responseError: function (rejection) {
			xhrResolutions++;
            updateStatus();			
			if(rejection.status == 401){				
				$injector.get('AdminUserService').removeUser().then(function(){
					$location.path('/login');										
				});				
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

	
