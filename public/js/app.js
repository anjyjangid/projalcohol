/*This is the main file where angular is defined*/
var AlcoholDelivery = angular.module('AlcoholDelivery', ["ui.router", 'ngCookies','oc.lazyLoad', 'ui.bootstrap', 'bootstrapLightbox', 'angular-loading-bar']);

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
AlcoholDelivery.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
		$ocLazyLoadProvider.config({
				// global configs go here
		});
}]);
AlcoholDelivery.filter('capitalize', function() {
		return function(input, all) {
			var reg = (all) ? /([^\W_]+[^\s-]*) */g : /([^\W_]+[^\s-]*)/;
			return (!!input) ? input.replace(reg, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
		}
});

AlcoholDelivery.controller('AppController', ['$scope', '$rootScope','$http', function($scope, $rootScope,$http) {
	$scope.AppController = {};

    $http.get("/super/category/").success(function(response){
		
		$scope.categories = response;		
		$scope.parentCategories = [];

		for(key in $scope.categories){
			if(!$scope.categories[key].ancestors)
			$scope.parentCategories.push($scope.categories[key])
		}
		
	});



    $scope.featuredProducts = function(){
    	
    	$scope.featuredProduct = [];

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

						if(!$scope.parentCategories[key]['featured']){$scope.parentCategories[key]['featured']=[]}
						$scope.parentCategories[key]['featured'].push(response[proKey]);

					}
				}
				
				if($scope.parentCategories[key]['featured']!=="undefined" && $scope.featuredProduct.length==0){
					$scope.featuredProduct = $scope.parentCategories[key]['featured'];					
				}

			}

		});
		

	}


	$scope.setFeatured = function(keyPassed){
		
		$scope.featuredProduct = $scope.parentCategories[keyPassed]['featured'];

	}

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
				// Dashboard				
				.state('index', {
						url: "/",
						templateUrl: "/templates/index.html",
						controller:function($scope,$http){																

								setTimeout(initScripts,100)
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


				.state('mainLayout', {
						templateUrl: "/templates/mainLayout.html",
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
								alert("asd");
						}
				})

				.state('mainLayout.product', {
						url: "/{categorySlug}",
						templateUrl: "/templates/product/index.html"
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

AlcoholDelivery.directive('topMenu', function() {
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
	                $scope.forgot.errors = {};
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
		}
	};
})
.directive("owlCarousel", function() {
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
                $(element).owlCarousel(defaultOptions);
            };
        }
    };
})

.directive('owlCarouselItem', [function() {
    return {
        restrict: 'A',
        transclude: false,
        link: function(scope, element) {
        	
          // wait for the last item in the ng-repeat then call init          	
            if(scope.$last) {
                scope.initCarousel(element.parent());
            }
        }
    };
}]);

/* Init global settings and run the app */
AlcoholDelivery.run(["$rootScope", "$state" , function($rootScope, $state) {		
		$rootScope.$state = $state; // state to be accessed from view				
}]);