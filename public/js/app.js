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
AlcoholDelivery.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
		// Redirect any unmatched url
		$urlRouterProvider.otherwise("/");  
		
		$stateProvider
				// Dashboard
				
				.state('index', {
						url: "/",
						templateUrl: "/templates/index.html",
						controller:function($scope,$http,UserService){
								$scope.list = [];
								$scope.signup = {terms:null};
								$scope.login = {};
								$scope.errors = {};
								$scope.signup.errors = {};


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
						                $scope.user = response;
      									$scope.user.name = response.email;
						                $('#login').modal('hide');
						            }).error(function(data, status, headers) {                            
						                $scope.errors = data;                
						            });
								};

								/*$scope.logout = function() {
									$http.get('/auth/logout').success(function(response){
						                $scope.user = {};      									
						            }).error(function(data, status, headers) {                            						                
						            });
								};*/

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


				.state('mainLayout.product', {
						url: "/product",
						templateUrl: "/templates/product/index.html"
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
		}
		
]);

AlcoholDelivery.directive('sideBar', function() {
	return {
		restrict: 'E',
		templateUrl: '/templates/partials/sidebar.html',
		controller: function($scope){
				//console.log($scope.categories);

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

AlcoholDelivery.directive('topMenu', function(UserService) {
	return {
		restrict: 'E',
		/*scope:{
			user:'='
		},*/
		templateUrl: '/templates/partials/topmenu.html',
		controller: function($scope,$http){			
			//console.log(UserService);
			$http.get('/check').success(function(response){
	            $scope.user = response;            
	        }).error(function(data, status, headers) {                            
	          	
	        });

	        $scope.logout = function() {
				$http.get('/auth/logout').success(function(response){
	                $scope.user = {};      									
	            }).error(function(data, status, headers) {                            						                
	            });
			};
		}
	};
});

/* Init global settings and run the app */
AlcoholDelivery.run(["$rootScope", "$state" , function($rootScope, $state, $scope) {		
		$rootScope.$state = $state; // state to be accessed from view		
}]);