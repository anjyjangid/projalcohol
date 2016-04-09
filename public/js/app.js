/*This is the main file where angular is defined*/
var AlcoholDelivery = angular.module('AlcoholDelivery', [
	"ui.router", 
	'ngCookies',
	'oc.lazyLoad', 
	'ngSanitize',
	'ui.bootstrap', 
	'bootstrapLightbox', 
	'angular-loading-bar',
	'ngAnimate'
]);

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
AlcoholDelivery.config(
	['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
		$ocLazyLoadProvider.config({
				// global configs go here
		});
}]);	

AlcoholDelivery.config(['$controllerProvider', function($controllerProvider) {
  // this option might be handy for migrating old apps, but please don't use it
  // in new ones!
  $controllerProvider.allowGlobals();

}]);


AlcoholDelivery.filter('capitalize', function() {
		return function(input, all) {
			var reg = (all) ? /([^\W_]+[^\s-]*) */g : /([^\W_]+[^\s-]*)/;
			return (!!input) ? input.replace(reg, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
		}
});

AlcoholDelivery.controller('AppController', ['$scope', '$rootScope','$http', function($scope, $rootScope,$http) {

	$scope.AppController = {};
	$scope.featuredProduct = [];

	$http.get("/super/settings/").success(function(response){
    	$rootScope.settings = response;    	
    });
	   

    $http.get("/super/category/").success(function(response){
		
		$scope.categories = response;
		$scope.AppController.categories = response;
		$scope.parentCategories = [];

		$scope.parentChildcategory = {}

		for(key in $scope.categories){
			if(!$scope.categories[key].ancestors){
				$scope.parentCategories.push($scope.categories[key])
			}
		}

	});

    $http.get("/super/testimonial/").success(function(response){
    	$scope.testimonials = response;
    });

    $http.get("/super/brand/").success(function(response){
    	$scope.brands = response;
    });



    $scope.featuredProducts = function(){

		$http({

			url: "/getproduct/",
			method: "GET",
			params: {
				type:"featured",
			}

		}).success(function(response){
			
			for(key in $scope.parentCategories){

				$scope.parentCategories[key]['featured'] = [];

				for(proKey in response){
					
					if(!$.inArray( $scope.parentCategories[key]._id, response[proKey].categories )){

						if(!$scope.parentCategories[key]['featured']){
							$scope.parentCategories[key]['featured']=[]
						}
						$scope.parentCategories[key]['featured'].push(response[proKey]);
					}
				}

				if($scope.parentCategories[key]['featured']!=="undefined" && $scope.parentCategories[key]['featured'].length>0 && typeof $scope.AppController.feTabActive=="undefined"){					
					$scope.AppController.feTabActive = key;
				}

			}

		});
		
	}

}]);

AlcoholDelivery.controller('ProductsController', ['$scope', '$rootScope','$state','$http','$stateParams', function($scope, $rootScope,$state,$http,$stateParams){

	$scope.ProductsController = {};

	$scope.products = {};
	$scope.featured = {};

	$scope.category = $stateParams.categorySlug;
	$scope.subCategory = "";

	$category = $stateParams.categorySlug;

	if(typeof $stateParams.subcategorySlug!=='undefined'){
		$category = $stateParams.subcategorySlug;
		$scope.subCategory = $stateParams.subcategorySlug;
	}

	var data = {
		category:$category
	}

	var config = {
		params: data,
		headers : {'Accept' : 'application/json'}
	};

	
	if($state.previous.param.categorySlug!==$stateParams.categorySlug){
		
		$http.get("/super/category",{params: {category:$stateParams.categorySlug,withChild:true}}).success(function(response){
			
			$scope.categoriesList = response;
			$rootScope.categoriesList = response;

		})	

	}else{		

		$scope.categoriesList = $rootScope.categoriesList;
	}


	$http.get("/search", config).then(function(response) {

	   $scope.products = response.data;

	 }, function(response) {

	});

	$http.get("/search",{
				
				params:{
					
					category:$category,
					type:'featured',

				}

		}).success(function(response){
		$scope.featured = response;
	});

	
	
}]);

AlcoholDelivery.controller('ProductDetailController', ['$scope', '$rootScope','$state','$http','$stateParams', function($scope, $rootScope,$state,$http,$stateParams){

	$rootScope.appSettings.layout.pageRightbarExist = false;

	$scope.ProductDetailController = {};

	$scope.product = {};
	
  $scope.syncPosition = function(el){

		var current = this.currentItem;
		
		$($scope.sync2)
		  .find(".owl-item")
		  .removeClass("synced")
		  .eq(current)
		  .addClass("synced")

		if($($scope.sync2).data("owlCarousel") !== undefined){
		  $scope.center(current);
		}
  }

  $scope.syncClick = function(number){
		
		$scope.sync1.trigger("owl.goTo",number);

  }

  $scope.center = function(number){
		
		var sync2visible = $scope.sync2.data("owlCarousel").owl.visibleItems;
		var num = number;
		var found = false;
		for(var i in sync2visible){
		  if(num === sync2visible[i]){
			var found = true;
		  }
		}
	 
		if(found===false){
		  if(num>sync2visible[sync2visible.length-1]){
			$scope.sync2.trigger("owl.goTo", num - sync2visible.length+2)
		  }else{
			if(num - 1 === -1){
			  num = 0;
			}
			$scope.sync2.trigger("owl.goTo", num);
		  }
		} else if(num === sync2visible[sync2visible.length-1]){
		  $scope.sync2.trigger("owl.goTo", sync2visible[1])
		} else if(num === sync2visible[0]){
		  $scope.sync2.trigger("owl.goTo", num-1)
		}
	
  }

	$scope.parentOwlOptions = {

    singleItem 						: true,
    slideSpeed 						: 1000,
    navigation 						: false,
    pagination 						: false,
    afterAction 					: $scope.syncPosition,
  	responsiveRefreshRate : 200,
    
  }

  $scope.childOwlOptions = {

    items 						: 6,
    itemsDesktop      : [1199,4],
    itemsDesktopSmall : [979,4],
    itemsTablet       : [768,4],
    itemsMobile       : [479,4],
    pagination 				: false,
    responsiveRefreshRate : 100,    
		afterInit : function(el){
		  el.find(".owl-item").eq(0).addClass("synced");
		}

  }
	var data = {
		product:$stateParams.product
	}

	var config = {
		params: data,
		headers : {'Accept' : 'application/json'}
	};
	
	$http.get("/getproductdetail", config).then(function(response) {

	   $scope.product = response.data;

	 }, function(response) {

	});
	
}]);

/* Setup global settings */
AlcoholDelivery.factory('appSettings', ['$rootScope', function($rootScope) {
        
    var appSettings = {
        layout: {
            pageRightbarExist: true, // sidebar menu state            
        }        
    };

    $rootScope.appSettings = appSettings;

    return appSettings;
}]);

/* Setup global settings */
AlcoholDelivery.factory('UserService', [function() {
    // supported languages
    var user = {
        isLogged: false,
    	  username: ''        
    };   

    return user;
}]);

/* Setup Rounting For All Pages */
AlcoholDelivery.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
		// Redirect any unmatched url
		$urlRouterProvider.otherwise("/");  
		
		$stateProvider
				.state('mainLayout', {
						templateUrl: "/templates/index.html",
						controller:function(){
								setTimeout(function(){
										initScripts({
												disableScrollHeader:true
										});
								},100)
						},
						resolve: {
								deps: ['$ocLazyLoad', function($ocLazyLoad) {
										return $ocLazyLoad.load({
												name: 'AlcoholDelivery',
												insertBefore: '#ng_load_plugins_before',
												debug: true,
												serie: true,
												files: [
														//'js/controller/ProductsController.js',
														'js/owl.carousel.min.js',
														'http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js',
														'js/jquery.switchButton.js',
														'js/jquery.mCustomScrollbar.concat.min.js',
														'js/jquery.bootstrap-touchspin.min.js',
														'https://cdnjs.cloudflare.com/ajax/libs/velocity/1.2.2/velocity.min.js',
														'https://cdnjs.cloudflare.com/ajax/libs/velocity/1.2.2/velocity.ui.min.js',
														'js/all_animations.js',
														'js/js_init_scripts.js'
												] 
										});
								}]
						}
				})			

				.state('mainLayout.index', {
						url: "/",
						templateUrl: "/templates/index/home.html",
						data: {pageTitle: 'User Account'},
						controller:function($scope,$http){																

								setTimeout(function(){
										initScripts({
												disableScrollHeader:true
										});
								},100)
						},
						resolve: {
								deps: ['$ocLazyLoad', function($ocLazyLoad) {
										return $ocLazyLoad.load({
												name: 'AlcoholDelivery',
												insertBefore: '#ng_load_plugins_before',
												// debug: true,
												serie: true,
												files: [														
														'js/owl.carousel.min.js',
														'http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js',
														'js/jquery.switchButton.js',
														'js/jquery.mCustomScrollbar.concat.min.js',
														'assets/global/plugins/bootstrap-touchspin/bootstrap.touchspin.js',
														'https://cdnjs.cloudflare.com/ajax/libs/velocity/1.2.2/velocity.min.js',
														'https://cdnjs.cloudflare.com/ajax/libs/velocity/1.2.2/velocity.ui.min.js',
														'js/all_animations.js',
														'js/js_init_scripts.js'
												] 
										});
								}]
						}
				})

				.state('mainLayout.cart', {
						url: "/cart",
						templateUrl: "/templates/cart.html",
						controller:function(){
								setTimeout(function(){
										initScripts({
												disableScrollHeader:true
										});
								},100)
						}
				})

				.state('mainLayout.resetpassword', {
						url: "/resetpassword?resetkey={key}",
						templateUrl: "/templates/cart.html",
						controller:function(){
								setTimeout(function(){
										initScripts({
												disableScrollHeader:true
										});
								},100)
						}
				})


				.state('accountLayout', {
						templateUrl: "/templates/accountLayout.html",
						controller:function(){
								 
						},
						resolve: {
								deps: ['$ocLazyLoad', function($ocLazyLoad) {
										return $ocLazyLoad.load({
												name: 'AlcoholDelivery',
												insertBefore: '#ng_load_plugins_before',
												// debug: true,
												serie: true,
												files: [
														'js/owl.carousel.min.js',
														'http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js',
														'js/jquery.switchButton.js',
														'js/jquery.mCustomScrollbar.concat.min.js',
														'assets/global/plugins/bootstrap-touchspin/bootstrap.touchspin.js',
														'https://cdnjs.cloudflare.com/ajax/libs/velocity/1.2.2/velocity.min.js',
														'https://cdnjs.cloudflare.com/ajax/libs/velocity/1.2.2/velocity.ui.min.js',
														'js/all_animations.js',
														'js/js_init_scripts.js'
												] 
										});
								}]
						}
				})
				.state('accountLayout.account', {
						url: "/myacount",
						templateUrl: "/templates/account/index.html",
						controller:function(){
							
						}
				})

				.state('mainLayout.product', {
						url: "/product/{product}",
						templateUrl: "/templates/product/detail.html",
						controller: "ProductDetailController"
				})

				.state('mainLayout.category', {
						url: "/{categorySlug}",
						templateUrl: "/templates/product/index.html",
						controller: "ProductsController",
				})

				.state('mainLayout.products', {
						url: "/{categorySlug}/{subcategorySlug}",
						templateUrl: "/templates/product/index.html",
						controller: "ProductsController"
				});


				//$locationProvider.html5Mode(true);
		}
		
]);

AlcoholDelivery.service('LoadingInterceptor', ['$q', '$rootScope', '$log', 
function ($q, $rootScope, $log) {
    'use strict';
 
    var xhrCreations = 0;
    var xhrResolutions = 0;
 
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
            //$log.error('Request error:', rejection);
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
            //$log.error('Response error:', rejection);
            return $q.reject(rejection);
        }
    };
}]).config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('LoadingInterceptor');
}]);

/* Init global settings and run the app */
AlcoholDelivery.run(["$rootScope", "appSettings", "$state" , function($rootScope, settings, $state) {		
		
		$rootScope.$state = $state; // state to be accessed from view				
		
		$rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {

		   $state.previous = {state:from, param:fromParams}
		   $rootScope.appSettings.layout.pageRightbarExist = true;

		});

}]);

