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

/* Setup global settings */
AlcoholDelivery.factory('settings', ['$rootScope', function($rootScope) {
    // supported languages

    var settings = {};

    $http.get("/super/settings/").success(function(response){
    	settings = response;    	
    });
	
    $rootScope.settings = settings;
   

	return settings;

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
	
}]);


AlcoholDelivery.controller('ProductDetailController', ['$scope', '$rootScope','$state','$http','$stateParams', function($scope, $rootScope,$state,$http,$stateParams){

	$scope.ProductDetailController = {};

	var data = {
		product:$stateParams.product
	}

	var config = {
		params: data,
		headers : {'Accept' : 'application/json'}
	};
	

	$http.get("/getproductdetail", config).then(function(response) {

	   $scope.products = response.data;

	 }, function(response) {

	});

	

	
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

AlcoholDelivery.directive('sideBar', function() {
	return {
		restrict: 'E',
		templateUrl: '/templates/partials/sidebar.html',
		controller: function($scope){
								
				$scope.childOf = function(categories, parent){
					
						if(!categories) return [];

						if(!parent || parent==0){
								return categories.filter(function(category){
										return (!category.ancestors || category.ancestors.length==0);
								});
						}

						return categories.filter(function(category){
								return (category.ancestors && category.ancestors.length > 0 && category.ancestors[0]._id["$id"] == parent);
						});
				}
				
		}
	};
});

 AlcoholDelivery.directive('topMenu', function(){
	return {
		restrict: 'E',
		/*scope:{
			user:'='
		},*/
		templateUrl: '/templates/partials/topmenu.html',
		controller: function($scope,$http){			
			
			$scope.list = [];
			$scope.signup = {terms:null};
			$scope.login = {};
			$scope.forgot = {};
			$scope.errors = {};
			$scope.signup.errors = {};
			$scope.forgot.errors = {};

			$scope.signupSubmit = function() {
				$http.post('/auth/register',$scope.signup).success(function(response){
	                $scope.user = response;
						$scope.user.name = response.email;
	                $('#register').modal('hide');
	            }).error(function(data, status, headers) {                            
	                $scope.signup.errors = data;                
	            });
			};

			$scope.loginSubmit = function() {
				$http.post('/auth',$scope.login).success(function(response){
	                $scope.login = {};
	                $scope.user = response;
					$scope.user.name = response.email;
	                $('#login').modal('hide');
	            }).error(function(data, status, headers) {                            
	                $scope.errors = data;                
	            });
			};

			$http.get('/check').success(function(response){
	            $scope.user = response;            
	        }).error(function(data, status, headers) {                            
	          	
	        });

	        $scope.forgotSubmit = function() {
				$http.post('/password/email',$scope.forgot).success(function(response){					
	                $scope.forgot = {};	                
	                $scope.forgot.message = response;
	                $('#forgot_password').modal('hide');
	                $('#forgot_password_sent').modal('show');	                
	            }).error(function(data, status, headers) {                            
	                $scope.forgot.errors = data;                
	            });
			};

	        $scope.logout = function() {
				$http.get('/auth/logout').success(function(response){
	                $scope.user = {};      									
	            }).error(function(data, status, headers) {                            						                
	            });
			};

			$scope.searchbar = function(toggle){
				if(toggle){
					$(".searchtop").addClass("searchtop100").removeClass("again21");			
					$(".search_close").addClass("search_close_opaque");		
					$(".logoss").addClass("leftminusopacity leftminus100").removeClass("again0left againopacity");
					$(".homecallus_cover").addClass("leftminus2100").removeClass("again0left");
					$(".signuplogin_cover").addClass("rightminus100").removeClass("again0right");	
					$("input[name='search']").focus();
				}else{
					$(".searchtop").removeClass("searchtop100").addClass("again21");			
					$(".search_close").removeClass("search_close_opaque");		
					$(".logoss").removeClass("leftminusopacity leftminus100").addClass("again0left againopacity");
					$(".homecallus_cover").removeClass("leftminus2100").addClass("again0left");
					$(".signuplogin_cover").removeClass("rightminus100").addClass("again0right");
				}
			}
		}
	};
})
.directive("owlCarousel", function(){
    return {
        restrict: 'E',
        transclude: false,
        
        link: function (scope) {

            scope.initCarousel = function(element) {
              // provide any default options you want

                var defaultOptions = {
                };
                var customOptions = scope.$eval($(element).attr('data-options'));
                // combine the two options objects
                for(var key in customOptions) {
                    defaultOptions[key] = customOptions[key];
                }

            	// init carousel
            	if(typeof $(element).data('owlCarousel') === "undefined"){

                	$(element).owlCarousel(defaultOptions);
            	}
            };
        }
    };
})

.directive('owlCarouselItem', [function() {
    return {
        restrict: 'A',
        transclude: false,
        link: function(scope, element) {
        					          
          	if(scope.$first && typeof $(element.parent()).data('owlCarousel') !== "undefined"){

          		$(element.parent()).data('owlCarousel').destroy();
          		$(element.parent()).find(".owl-wrapper").remove();
          	}

            if(scope.$last) {

                scope.initCarousel(element.parent());

            }
        }
    };
}])

.directive("tscroll", function ($window) {
    return function(scope, element, attrs) {
        angular.element($window).bind("scroll", function() {
             
             if(element.hasClass('fixh')) return;

             if (this.pageYOffset >= 1) {
                 element.addClass('navbar-shrink');                 
             } else {
                 element.removeClass('navbar-shrink');                 
             }
        });
    };
});

AlcoholDelivery.directive('errProSrc', function() {
  return {
    link: function(scope, element, attrs) {
      element.bind('error', function() {

        element.parent(".prod_pic").addClass("no-image");

          attrs.$set('src', attrs.errSrc);
        
      });
    }
  }
});


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
AlcoholDelivery.run(["$rootScope", "$state" , function($rootScope, $state) {		
		
		$rootScope.$state = $state; // state to be accessed from view				

		$rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
		   $state.previous = {state:from, param:fromParams}
		});

}]);

