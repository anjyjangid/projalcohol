/*This is the main file where angular is defined*/
var AlcoholDelivery = angular.module('AlcoholDelivery', [
	"AlcoholCartFactories",
	"ui.router",
	'ngCookies',
	'ngSanitize',
	'ui.bootstrap',
	'19degrees.ngSweetAlert2',
	'ngAnimate',
	'ngMaterial',
	'ngScrollbars',
	'ngMessages',
	'ngMap',
	'vAccordion',
	'alcoholCart.directives',
	//'angularFblogin',
	'ngPayments',
	'infinite-scroll'
]).config(['$locationProvider','$mdThemingProvider', function($location,$mdThemingProvider) {

	$location.html5Mode({
		enabled: true,
		requireBase: false
	});

	// $location.hashPrefix('!');

	$mdThemingProvider.theme('default').primaryPalette('purple').accentPalette('purple');
    //.accentPalette('orange');    
}]);


/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */

/*AlcoholDelivery.config(
	['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
		$ocLazyLoadProvider.config({
			// global configs go here
		});
}]);*/

AlcoholDelivery.config(['$controllerProvider','ScrollBarsProvider', function($controllerProvider,ScrollBarsProvider) {
  // this option might be handy for migrating old apps, but please don't use it
  // in new ones!
  $controllerProvider.allowGlobals();
	ScrollBarsProvider.defaults = {
		scrollButtons: {
		enable: true //enable scrolling buttons by default
		},
		axis: 'yx',
		mouseWheel:{ preventDefault: true },
		// setHeight: 200,
		scrollInertia:0
	};

}]);

AlcoholDelivery.filter('capitalize', function() {
		return function(input, all) {
			var reg = (all) ? /([^\W_]+[^\s-]*) */g : /([^\W_]+[^\s-]*)/;
			return (!!input) ? input.replace(reg, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
		}
});


AlcoholDelivery.filter("ucwords", function () {
	return function (input){
		if(input) { //when input is defined the apply filter
		   input = input.toLowerCase().replace(/\b[a-z]/g, function(letter) {
			  return letter.toUpperCase();
		   });
		}
		return input;
	}
});

AlcoholDelivery.filter('isActive', function() {
		return function(obj, field, check) {

			if(typeof check !== 'undefined'){
				return obj[field]===check;
			}

			return true;
		}
});


AlcoholDelivery.filter('getProductThumb', function() {
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

AlcoholDelivery.filter('freeTxt', function() {
		return function(input) {
			input = parseFloat(input);
			return input>0?input:'FREE';
		}
});

AlcoholDelivery.filter('pricingTxt', function(currencyFilter,$rootScope) {

		return function(price,freeTxt) {

			if(price === null || isNaN(price)){
				price = 0;
			}

			price = parseFloat(price);

			if(typeof freeTxt==='undefined'){
				freeTxt = false;
			}

			return (price || freeTxt!==true)?currencyFilter(price,$rootScope.settings.general.currency,2):'FREE';
		}
});



AlcoholDelivery.filter('truncate', function (){
  return function (text, length, end){
    if (text !== undefined){
      if (isNaN(length)){
        length = 10;
      }

      if (end === undefined){
        end = "...";
      }

      if (text.length <= length || text.length - end.length <= length){
        return text;
      }else{
        return String(text).substring(0, length - end.length) + end;
      }
    }
  };
});

AlcoholDelivery.filter('deliveryDateSlug',function(){

	return function(input,all){
		var weeksName = new Array(7);
		weeksName[0]=  "Sunday";
		weeksName[1] = "Monday";
		weeksName[2] = "Tuesday";
		weeksName[3] = "Wednesday";
		weeksName[4] = "Thursday";
		weeksName[5] = "Friday";
		weeksName[6] = "Saturday";

		var monthsName = new Array(12);
		monthsName[0]=  "January";
		monthsName[1] = "February";
		monthsName[2] = "March";
		monthsName[3] = "April";
		monthsName[4] = "May";
		monthsName[5] = "June";
		monthsName[6] = "July";
		monthsName[7] = "August";
		monthsName[8] = "September";
		monthsName[9] = "Octomber";
		monthsName[10] = "November";
		monthsName[11] = "December";

		var mili = input * 1000;
		myDate = new Date(mili);

		var day = myDate.getDate();
		var year = myDate.getFullYear();
		var mWeekName = weeksName[myDate.getDay()];
		var mMonthName = monthsName[myDate.getMonth()];

		daySlug = mWeekName+', '+day+' '+mMonthName+', '+year;
		return daySlug;
	}
})


/* Setup global settings */
AlcoholDelivery.factory('appSettings', ['$rootScope', function($rootScope) {

    var appSettings = {
        layout: {
            pageRightbarExist: true, // sidebar menu state
            cartSummaryEnable:true // show cart summary on mouse hover
        },
        messages : {
        	hideDelay : 4000
        },

    };

    $rootScope.appSettings = appSettings;

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
        {opVal:1110,opTag:'06:30 pm'},
        {opVal:1140,opTag:'07:00 pm'},
        {opVal:1170,opTag:'07:30 pm'},
        {opVal:1200,opTag:'08:00 pm'},
        {opVal:1230,opTag:'08:30 pm'},
        {opVal:1260,opTag:'09:00 pm'},
        {opVal:1290,opTag:'09:30 pm'},
        {opVal:1320,opTag:'10:00 pm'},
        {opVal:1350,opTag:'10:30 pm'},
        {opVal:1380,opTag:'11:00 pm'},
        {opVal:1410,opTag:'11:30 pm'},
    ];

    return appSettings;

}]);

AlcoholDelivery.service('appConfig', [
			'$interval','$http','$q'
	,function($interval, $http, $q) {    
    
    this.workingTime = {};
    this.serverTime = "";

	this.setServerTime = function(serverTimeInSec){

		this.serverTime = serverTimeInSec;
		var _self = this;
		$interval(function(){			
			_self.serverTime+= 10;
		},10000);
		
	}

	this.getServerTime = function(){

    	return this.serverTime;

    }

    this.setWorkingTime = function(fromT,toT) {

    	this.workingTime = {
    		from : fromT,
    		to : toT
    	};
    }

    this.setWorkingTimeString = function(fromT,toT) {

    	this.workingTimeString = {
    		from : fromT,
    		to : toT
    	};
    }

    this.updateWorkingHrs = function(){
    	var _self = this;
    	return $q(function(resolve,reject){
    		$http.get("super/server-time").then(
				function(res){
					
					_self.serverTime = res.data.currentTime;
					_self.setWorkingTime(res.data.from,res.data.to);
					_self.setWorkingTimeString(res.data.string.from,res.data.string.to);

					resolve();
				}
			)
    	})
		

    }

    this.getWorkingTime = function() {
    	return this.workingTime;
    }

    this.getWorkingTimeString = function() {
    	return this.workingTimeString;
    }

    this.isServerUnderWorkingTime = function(fromServer) {
    	
    	var _self = this;
    	if(angular.isDefined(fromServer) && fromServer){

    		return $q(function(resolve,reject){

    			_self.updateWorkingHrs().then(
    				function(){

    					var workingTime = _self.getWorkingTime();
    					var serverTime = _self.getServerTime();

    					var isWorking = ((workingTime.from < serverTime) && (serverTime < workingTime.to));
    					if(isWorking)
    					resolve();
    					reject();
    				}
    			);
    		})

    	}else{

    		var workingTime = this.getWorkingTime();
			var serverTime = this.getServerTime();

    		return ((workingTime.from < serverTime) && (serverTime < workingTime.to));
    	}
    }

}]);

AlcoholDelivery.factory('catPricing', ["$q", "$timeout", "$rootScope", "$http", function($q, $timeout, $rootScope, $http){

	var catPricing = {};

	function GetCategoryPricing() {
		var d = $q.defer();
		$http.get("/category/pricing").success(function(response){
			d.resolve(response);
		});
		return d.promise;
	};

	return {

		GetCategoryPricing: GetCategoryPricing,
		categoryPricing : null

	};

}]);

AlcoholDelivery.factory('categoriesFac', ["$q", "$http", function($q, $http){

	var categoriesFac = {};

	function getCategories() {

		var d = $q.defer();

		$http.get("/super/category/",{params: {withCount:true}}).success(function(response){

			d.resolve(response);

		});

		return d.promise;

	};

	return {

		getCategories: getCategories,
		categories : null

	};

}]);

AlcoholDelivery.factory('appServices', ["$q", "$http", function($q, $http){

	var categoriesFac = {};

	function getCategories() {

		var d = $q.defer();

		$http.get("/super/category/",{params: {withCount:true}}).success(function(response){

			d.resolve(response);

		});

		return d.promise;

	};

	return {

		getCategories: getCategories,
		categories : null

	};

}]);

AlcoholDelivery.factory("UserService", [
"$q", "$timeout", "$http", "$state"
, function($q, $timeout, $http, $state) {

	function GetUserAddress(){

	};

	function LogoutReset(){


	};

	function getIfUser(serverCheck, redirect){
	var _self = this;

		if(serverCheck)
			return $http.get("/loggedUser")
			.then(function(res) {
				if(!res.data || !res.data.auth){
					_self.currentUser = false;
					if(redirect) {
						$state.go('mainLayout.index', null, {reload: true});
					}
				}
				else
					_self.currentUser = res.data;

				return angular.copy(_self.currentUser);
			})
			.catch(function(err){
				_self.currentUser = false;
				throw err;
			});

		return angular.copy(_self.currentUser);

	};

	return {
		GetUserAddress: GetUserAddress,
		currentUser: null,
		currentUserAddress: null,
		getIfUser:getIfUser,
	};
}]);

AlcoholDelivery.factory('ScrollPaging', function($http) {
  var ScrollPaging = function(args,url) {
    this.items = [];
    this.busy = false;
    this.limitreached = false;
    // this.totalResult = 0;
    this.url = url;
    this.params = args;
    this.params.skip = 0;
    this.data = {};
    //SET DEFAULT LIMIT IF NOT SPECIFIED
    if(!this.params.take)
    	this.params.take = 10;
  };

  ScrollPaging.prototype.nextPage = function() {
    if (this.busy || this.limitreached) return;
    this.busy = true;
    $http.get(this.url,{
    	params : this.params
    }).then(function(result){
		this.data = result.data;
		var items = result.data.items;
		this.totalResult = result.data.total;
		for (var i = 0; i < items.length; i++) {
			this.items.push(items[i]);
		}
		this.busy = false;
		if(result.data.items.length < parseInt(this.params.take)){
			this.limitreached = true;
		}else{
			this.params.skip+=parseInt(this.params.take);
		}

	}.bind(this));
  };

  return ScrollPaging;

});

AlcoholDelivery.factory('ScrollPagination', function($http,ProductService) {

  var Search = function(keyword,filter,sortby,type) {
    this.items = [];
    this.busy = false;
    this.skip = 0;
    this.keyword = keyword;
    this.take = 10;
    this.limitreached = false;
    this.totalResult = 0;
    this.filter = filter;
    this.sortby = sortby;
    this.type = type || 1;
  };

  Search.prototype.nextPage = function() {
    if (this.busy || this.limitreached) return;
    this.busy = true;
    var _self = this;

    ProductService.getProducts({

		type : this.type, // [1 for loyalty store]
		skip:this.skip,
		limit:this.take,
		filter:this.filter,
		sort:this.sortby,
		keyword:this.keyword,
		productList:1

	}).then(function(items){

		// _self.totalResult = result.data.total;
		for (var i = 0; i < items.length; i++) {
			_self.items.push(items[i]);
		}
		_self.busy = false;
		if(items.length < parseInt(_self.take)){
			_self.limitreached = true;
		}else{
			_self.skip+= parseInt(_self.take);
		}

	}.bind(_self));

  };

  return Search;

});

/* Setup Routing For All Pages */
AlcoholDelivery.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
		// Redirect any unmatched url
		$urlRouterProvider.otherwise("/");

		$stateProvider
				.state('mainLayout', {
						templateUrl: "/templates/index.html",
						controller:function(){

						},
						resolve: {

							appLoad : appLoad

						}
				})
				.state('mainLayout.notfound', {
						url: "/404",
						templateUrl: "/templates/404.html",
						// controller:function($rootScope,$stateParams,$state){

						// }
				})

				.state('mainLayout.index', {
						url: "/",
						"views" : {

							"" : {
								templateUrl : "/templates/index/home.html",
								controller:function($scope,$http,$rootScope){
										$scope.AppController.category = "";
										$scope.AppController.subCategory = "";
										$scope.AppController.showpackage = false;										
										$scope.showSignup = function(){
											$rootScope.$broadcast('showSignup');
										};
								},

							},
							"testimonials" : {
								templateUrl : "/templates/partials/testimonials.html",
								controller : function($scope,$http){

									$http.get("/super/testimonial/").success(function(response){
										$scope.testimonials = response;
									});

								}
							},
							"brands" : {
								templateUrl : "/templates/partials/brands.html",
								controller : function($scope,$http){

									$http.get("/super/brand/").success(function(response){
										$scope.brands = response;
									});

								}
							},
							"rightPanel" : {

								templateUrl : "/templates/partials/rightBarRecentOrder.html",
								controller : "RepeatOrderController",

							},

						},
						data: {pageTitle: 'User Account'}

				})

				.state('mainLayout.index.claim-gift-card', {

						url: "claim/gift/card/{token}",
						views: {
							"giftClaim" :{
								template : "",
								controller:"ClaimGiftCardController"
							}
						}

				})

				.state('mainLayout.checkout', {
						abstract: true,
						views : {

							"" : {
								templateUrl : "/templates/checkout/index.html",
								controller:"CartController"
							},
							"rightPanel" : {

								templateUrl: "/templates/partials/rightBarSmokeOffer.html",
								controller:"CartSmokeController"

							},
						},
						resolve: {
							allLoaded: function(cartValidate,appLoad){
								return cartValidate.init();
							}
						}

				})

				.state('mainLayout.checkout.cart', {
						url: "/cart",
						params: {err:false},
						views : {
							"":{
								templateUrl : "/templates/checkout/cart.html",
							},
							"promotions@mainLayout.checkout.cart":{
								templateUrl: "/templates/partials/promotions.html",
								controller:"PromotionsController"
							},
						},
						data: {step: 'cart', stepCount:1},
						resolve: {
							showToastIfErr: function($stateParams,cartValidation,cartValidate,allLoaded){
								return cartValidate.check('cart');
								//return cartValidation.init();
								//cartValidation.showToast($stateParams.err);
							}
						}
				})

				.state('mainLayout.checkout.address', {
						url: "/cart/address",
						params: {err:false},
						templateUrl : "/templates/checkout/address.html",
						controller:"CartAddressController",
						data: {step: 'address', stepCount:2},
						resolve: {
							showToastIfErr: function($stateParams,cartValidation,cartValidate,allLoaded){
								cartValidate.check('address');
								cartValidation.showToast($stateParams.err);
							}
						}
				})

				.state('mainLayout.checkout.delivery', {
						url: "/cart/delivery",
						params: {err:false},
						templateUrl : "/templates/checkout/delivery.html",
						controller:"CartDeliveryController",
						data: {step: 'delivery', stepCount:3},
						resolve: {
							showToastIfErr: function($stateParams,cartValidation,allLoaded){
								cartValidation.showToast($stateParams.err);
							}
						}
				})

				.state('mainLayout.checkout.payment', {
						url: "/cart/payment",
						params: {err:false},
						templateUrl : "/templates/checkout/payment.html",
						controller:"CartPaymentController",
						data: {step: 'payment', stepCount:4},
						resolve: {
							showToastIfErr: function($stateParams,cartValidation,allLoaded){

								cartValidation.showToast($stateParams.err);

							}
						}
				})

				.state('mainLayout.checkout.review', {
						url: "/cart/review?{pstatus:string}",
						params: {err:false},
						templateUrl : "/templates/checkout/review.html",
						controller:"CartReviewController",
						data: {step: 'review', stepCount:5},
						resolve: {
							showToastIfErr: function($stateParams,cartValidation,allLoaded){
								cartValidation.showToast($stateParams.err);
							}
						}
				})

				.state('mainLayout.login', {

						url: "/mailverified/{status}",
						//templateUrl: "/templates/index/home.html",
						controller:function(sweetAlert,$location,$stateParams){

							var title = '';
							var type = 'success';
							var msg = 'Your email is already verified.';
							if($stateParams.status == 1){
								title = 'Congratulations!';
								//type = 'success';
								msg = 'Your email has been verified successfully, you can login with your registered email & password.';	
							}							

							sweetAlert.swal({
								type:type,
								title: title,
								text : msg,
								timer: 0,
								closeOnConfirm: true
							});

							$location.url('/').replace();

						}
				})

				.state('mainLayout.expiredlink', {

						url: "/resetexpired",
						//templateUrl: "/templates/index/home.html",
						controller:function(sweetAlert,$location,$stateParams){

							var title = '';
							var type = 'error';
							var msg = 'Invalid or expired reset password link.';
							
							sweetAlert.swal({
								type:type,
								title: title,
								text : msg,
								timer: 0,
								closeOnConfirm: true
							});

							$location.url('/').replace();

						}
				})

				.state('cmsLayout.reset', {
						url: "/resetpassword/{token}",
						templateUrl: "/templates/partials/resetpassword.html",
						controller:function($rootScope,$stateParams,$scope,$http,$timeout,$mdDialog,sweetAlert,$location){

							$rootScope.token = $stateParams.token;

							$scope.resetSubmit = function() {
								$scope.reset.errors = {};
								$scope.reset.token = $rootScope.token;
								$http.post('/password/reset',$scope.reset).success(function(response){
					                $scope.reset = {};
					                $scope.reset.errors = {};
					                $timeout(function(){
										$location.url('/').replace();
									});
					                sweetAlert.swal({
										type:'success',
										title: "Congratulation!",
										text : response.message,
										timer: 4000,
										closeOnConfirm: false
									});														                
					            }).error(function(data, status, headers) {
					            	if(typeof data.token !== "undefined" && data.token===false){
					            		$timeout(function(){
											$location.url('/').replace();
										});
					            		sweetAlert.swal({
											type:'warning',
											title: "Expired or used reset link!",
											timer: 0,
											showConfirmButton:true,
											closeOnConfirm: true
										});

					            	}
					                $scope.reset.errors = data;
					            });
							};							

						}
				})

				.state('mainLayout.invite', {
						url: "/acceptinvitation/{reffererid}",
						templateUrl: "/templates/index/home.html",
						controller:function($rootScope,$stateParams,$state){
							$rootScope.refferal = $stateParams.reffererid;
							$state.go('mainLayout.index');
						}
				})
				// CMS Page YKB //

				.state('cmsLayout', {
					abstract: true,
					templateUrl:"/templates/cmsLayout.html",
					resolve: {
						appLoad : appLoad
					}
				})

				.state('cmsLayout.pages', {
					url: "/pages/{slug}",
					templateUrl:"/templates/cms/cms.html",
					controller:'CmsController'
				})

				.state('orderplaced', {
					url: "/orderplaced/{order}",
					templateUrl: "/templates/orderconfirmation.html",
					controller:"OrderplacedController",
					resolve: {
						loggedIn: function(UserService) {
							return UserService.getIfUser(true, true);
						}
					}

				})

				.state('accountLayout', {
					abstract: true,
					views : {

						"" : {
							templateUrl : "/templates/accountLayout.html",
						},
						"navLeft@accountLayout" : {
							templateUrl: "/templates/account/navLeft.html",
						}

					},
					resolve: {
						storeInit : function (store,alcoholWishlist){
							store.init().then(
								function(){
									return alcoholWishlist.init()
								}
							);

						},
						// wishlistInit : function(alcoholWishlist){
						// 	return alcoholWishlist.init();
						// },
						loggedIn: function(UserService) {
							return UserService.getIfUser(true, true);
						}
					}
				})
				.state('accountLayout.profile', {
						url: "/profile",
						templateUrl: "/templates/account/profile.html",
						controller:"ProfileController"
				})
				.state('accountLayout.password', {
						url: "/password",
						templateUrl: "/templates/account/password.html",
						controller:"PasswordController"
				})
				.state('accountLayout.loyalty', {
						url: "/loyalty",
						templateUrl: "/templates/account/loyalty.html",
						controller:"LoyaltyController"
				})
				.state('accountLayout.credits', {
						url: "/credits",
						templateUrl: "/templates/account/credits.html",
						controller:"CreditsController"
				})
				.state('accountLayout.orders', {
						url: "/orders",
						templateUrl: "/templates/account/orders.html",
						controller:"OrdersController"
				})
				.state('accountLayout.wishlist', {
						url: "/wishlist",
						templateUrl: "/templates/account/wishlist.html",
						controller:"WishlistController"
				})
				.state('accountLayout.address', {
						url: "/address",
						templateUrl: "/templates/account/address.html"
				})
				.state('accountLayout.order', {
						url: "/order/{orderid}",
						templateUrl: "/templates/account/order.html",
						controller:"OrderDetailController"
				})

				.state('accountLayout.cards', {
						url: "/cards",
						templateUrl: "/templates/account/savedcards.html",
				})

				.state('accountLayout.invite', {
						url: "/invite",
						templateUrl: "/templates/account/invite.html",
						controller:"InviteController"
				})

				.state('mainLayout.product', {

						url: "/product/{product}",
						views : {

							'' : {
								templateUrl: "/templates/product/detail.html",
								controller: "ProductDetailController"
							},
							'alsoboughtthis@mainLayout.product' : {

								templateUrl: "/templates/product/alsoBoughtThis.html",
								controller: "AlsoBoughtThisController",

							},

						}

				})

				.state('mainLayout.productLoyalty', {
						url: "/loyalty/product/{product}",
						templateUrl: "/templates/product/detail.html",
						params: {loyalty: true},
						controller: "ProductDetailController"
				})

				.state('mainLayout.packages', {
						url: "/packages/{type}",
						templateUrl : function(stateParams){
							return "/templates/packages/"+stateParams.type+".html";
						},
						params: {pageTitle: 'Packages'},
						controller:"PackagesController",
				})

				.state('mainLayout.packagedetail', {
						url: "/packagedetail/{type}/{id}/{uid}",
						templateUrl : function(stateParams){
							return "/templates/packages/"+stateParams.type+"detail.html";
						},
						params: {pageTitle: 'Packages Detail'},
						controller:"PackageDetailController",
				})

				.state('mainLayout.search', {
					url: '/search/{keyword}?{filter}&{sort}',
					templateUrl : function(stateParams){
						return "/templates/search.html";
					},
					params: {pageTitle: 'Search'},
					controller:"SearchController"
				})

				.state('mainLayout.loyaltystore', {
					url: '/loyalty-store?{filter}&{sort}',
					templateUrl : "/templates/loyaltyStore.html",
					params: {pageTitle: 'Loyalty Store'},
					controller:"LoyaltyStoreController"
				})

				.state('mainLayout.giftcategory', {
					url: "/gifts/{categorySlug}?/{type}",
					templateUrl : '/templates/gifts/index.html',
					controller: 'GiftProductController'
				})

				.state('mainLayout.gift', {
					url: "/gifts/product/{giftid}/:uid",
					templateUrl : '/templates/gifts/giftdetail.html',
					controller: 'GiftController'
				})

				.state('mainLayout.giftcards', {
					url: "/giftcards/addgiftcard",
					templateUrl : '/templates/gifts/giftcard.html',
					controller: 'GiftCardController'
				})

				.state('mainLayout.category', {
						abstract : true,
						views : {

							'' : {
								templateUrl : '/templates/product/index.html',
								controller:function($scope,$stateParams,$filter,$state,$anchorScroll){
									
									$scope.filterList = function(rstate,obj){
										$state.go(rstate,obj,
							            {reload: false, location: 'replace'});
										
										$scope.currentSort = $filter('filter')($scope.sortOptions,{value:obj.sort})[0];
									}

									$scope.currentSort = $filter('filter')($scope.sortOptions,{value:$stateParams.sort})[0];
									
								},
								//reloadOnSearch : false,								
							},
							'rightPanel' : {

								templateUrl : "/templates/partials/rightBarRecentOrder.html",
								controller : "RepeatOrderController",

							},							
							// 'left' : {
							// 	templateUrl : 'app/public/left.html',
							// 	controller : 'DashboardController'
							// },
						},


				})

				.state('mainLayout.category.products', {
						url: "/{categorySlug:string}?{toggle:string}&{sort:string}",
						views : {

							'content' : {
								templateUrl : '/templates/product/products.html',
								controller: "ProductsController",
							},
							'featured' : {
								templateUrl : '/templates/product/featured.html',
								controller: "ProductsFeaturedController",								

							},

						},

				})

				.state('mainLayout.category.subCatProducts', {
						url: "/{categorySlug}/{subcategorySlug}?{toggle:string}&{sort:string}",
						/*params: {
					    	toggle: 'all',
					    	sort: 'latest'
					  	},*/
						views : {

							'content' : {
								templateUrl : '/templates/product/products.html',
								controller: "ProductsController",
							},
							'featured' : {
								templateUrl : '/templates/product/featured.html',
								controller: "ProductsFeaturedController",
								//reloadOnSearch : false,
							},

						},
				})

				.state('invitation',{
					url:'/acceptinvitation/{rid}',
					controller:function($state){
						$state.go('/');
					}
				});

				/*$locationProvider.html5Mode(true);
				$locationProvider.hashPrefix = '!';*/

		}]);
	
function appLoad($q, $rootScope, $state, $timeout, $location, store, alcoholWishlist, UserService, catPricing) {
	
	var defer = $q.defer();

	catPricing.GetCategoryPricing().then(

		function(result) {

			catPricing.categoryPricing = result;
			$rootScope.catPricing = result;

			store.init().then(
				function(storeRes){
					alcoholWishlist.init().then(
						function(wishRes){
							UserService.getIfUser(true).then(
								function(userRes){
									defer.resolve();
								}
							);
						},
						function(wishErrRes){
							defer.reject();
						}
					)
				},
				function(storeErrRes){
					defer.reject();
				}
			);
		},
		function(cateErrRes){
			defer.reject();
		}

	);
	

	return defer.promise;
};

function validateCheckout($q, $state, $timeout, $location, store, alcoholWishlist, UserService) {
	var defer = $q.defer();
	
	//defer.reject();
	
	defer.resolve();
	
	return defer.promise;
}


AlcoholDelivery.service('LoadingInterceptor', [
'$q', '$rootScope', '$log', '$location', '$window',
function ($q, $rootScope, $log, $location, $window) {
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
            var urlStr = config.url;
            if(urlStr.indexOf('templates') == -1 && urlStr.indexOf('template') == -1){
	            if(urlStr.charAt(0) == '/') urlStr = urlStr.substr(1);
	            	config.url = 'api/'+urlStr;
	        }else{
	        	if(urlStr.indexOf('templates') > 0)
	        		config.url += '?ver=1.1';
	        }	        	
            return config;
        },
        requestError: function (rejection) {
            xhrResolutions++;
            updateStatus();
            // $log.error('Request error:', rejection);
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
            if(rejection.status == 404){
				$location.url('/404').replace();
			};

			if(rejection.status == 401){
				$location.url('/').replace();
				$rootScope.$broadcast('showLogin');
			};

			if(rejection.status == 500){				
				// $location.url('/404').replace();
			};

			if(rejection.status == 412){ // 412 => The server does not meet one of the preconditions that the requester put on the request.
				
				if(rejection.data.reset==='cart'){
					$window.localStorage.removeItem('deliverykey');
					$window.location.reload();
				}

				if(angular.isDefined(rejection.data.refresh) && rejection.data.refresh===true){
					//$window.location.reload();
				}

			};

			if(rejection.status == 405){ //405 => method not allowed
				$window.location.reload();
			};

            return $q.reject(rejection);
        }
    };
}]).config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('LoadingInterceptor');
}]);

/* Init global settings and run the app */
AlcoholDelivery.run([
		"$rootScope", "appSettings", "alcoholCart", "ProductService", "store", "alcoholWishlist", "catPricing"
		, "categoriesFac","UserService", "$state", "$http", "$window","$mdToast","$document","$anchorScroll"
		, "$timeout","cartValidation","cartValidate","$templateCache","$cookies"
, function($rootScope, settings, alcoholCart, ProductService, store, alcoholWishlist, catPricing
		,categoriesFac, UserService, $state, $http, $window, $mdToast,$document,$anchorScroll
		,$timeout,cartValidation,cartValidate,$templateCache,$cookies) {

	$rootScope.$state = $state; // state to be accessed from view
	angular.alcoholCart = alcoholCart;
	catPricing.GetCategoryPricing().then(

		function(result) {

			catPricing.categoryPricing = result;
			$rootScope.catPricing = result;

		}

	);

	$rootScope.isAppInitialized = false;
	$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
		settings.layout.cartSummaryEnable = false;
		if(angular.isDefined($rootScope.processingOrder) && $rootScope.processingOrder===true){

			$mdToast.show({

				controller:function($scope){
					$scope.message = "Cart under process";
				},
				templateUrl: '/templates/toast-tpl/wishlist-notify.html',
				parent : $document[0].querySelector('#cart-summary-icon'),
				position: 'top center',
				hideDelay:3000

			});

			event.preventDefault();

		}

		if((toState.name).indexOf('mainLayout.checkout')!==0){
			settings.layout.cartSummaryEnable = true;
		}

		var regex = new RegExp('^accountLayout', 'i');

		if(toState != fromState){			
			$anchorScroll();
		}

		angular.element('#wrapper').removeClass('toggled');
		angular.element('body').removeClass('hidden-scroll');

		if($rootScope.isAppInitialized && !cartValidation.init(toState, fromState))
			event.preventDefault();
	})

	$rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {

	   $state.previous = {state:from, param:fromParams}
	   $rootScope.appSettings.layout.pageRightbarExist = true;

		//SETTING HOME META DATA FOR EVERY ROUTE
		var mdata = {
			title:$rootScope.settings.general.site_title,
			description:$rootScope.settings.general.meta_desc,
			keyword:$rootScope.settings.general.meta_keyword
		};
		
		$rootScope.setMeta(mdata);

		if(!$rootScope.isAppInitialized){
			if(!cartValidation.init())
				ev.preventDefault();
			$rootScope.isAppInitialized = true;
		}
		$timeout(function() {
			if(/^mainLayout\.checkout\..+$/.test(to.name)){
				cartValidate.processValidators();
			}
		},1000);
		

	});	

	$rootScope.getProductInCart = function(_id){

		var product = alcoholCart.getProductInCartById(_id);
			
		return product

	};	


	// (function(d, s, id) {
 //      var js, fjs = d.getElementsByTagName(s)[0];
 //      if (d.getElementById(id)) return;
 //      js = d.createElement(s); js.id = id;
 //      js.src = "//connect.facebook.net/en_US/sdk.js";
 //      fjs.parentNode.insertBefore(js, fjs);
 //    }(document, 'script', 'facebook-jssdk'));

    /*$rootScope.$on('fb.load', function() {
      $window.dispatchEvent(new Event('fb.load'));
    });*/


	$rootScope.$on('alcoholCart:notify', function(data,msg,hideDelay){
		
		$mdToast.show({
			controller:function($scope){

				$scope.message = msg;
			},
			templateUrl: '/templates/toast-tpl/wishlist-notify.html',
			parent : $document[0].querySelector('#cart-summary-icon'),
			position: 'top center',
			hideDelay:hideDelay || settings.messages.hideDelay

		});


	});

	$rootScope.$on('alcoholCart:giftRemoved', function(data,msg){

		$mdToast.show(
			$mdToast.simple()
				.textContent(msg)
				.highlightAction(false)
				.position("top right fixed")
				.hideDelay(4000)
			);

	});

	$rootScope.$on('alcoholCart:updated', function(object,params){

		$mdToast.show({
						controller:function($scope){

							$scope.quantity = params.quantity;
							$scope.message = params.msg;

							$scope.freeRequired = alcoholCart.getRemainToFreeDelivery();
							$scope.requiredPer = alcoholCart.getRemainToFreeDelivery('percentage')+'%';

							if($scope.freeRequired>0){
								$scope.isFreeDelivery = false;
							}else{
								$scope.isFreeDelivery = true;
							}
							
						},
						templateUrl: '/templates/toast-tpl/cart-update.html',
						parent : $document[0].querySelector('#cart-summary-icon'),
						position: 'top center',
						hideDelay:3000
					});

	});

	$rootScope.$on('alcoholWishlist:itemRemoved', function(product){

		/*$mdToast.show({
			controller:function($scope){

				$scope.message = 'Item removed from wishlist';
			},
			templateUrl: '/templates/toast-tpl/wishlist-notify.html',
			parent : $document[0].querySelector('#usermenuli'),
			position: 'top center',
			hideDelay:3000
		});*/

	});

	$rootScope.$on('alcoholWishlist:change', function(object,params){
		var def = 5000;
		var targId = 'usermenuli';
		if(angular.isDefined(params.hideDelay))
			def = params.hideDelay;
		if(angular.isDefined(params.targId))
			targId = params.targId;		

		$mdToast.show({
			controller:function($scope){

				$scope.message = params.message;
				$scope.hideDelay = params.hideDelay;

				$scope.hidePopup = function(){
					$mdToast.hide();	
				}
			},
			templateUrl: '/templates/toast-tpl/wishlist-notify.html',
			parent : $document[0].querySelector('#'+targId),
			position: 'top center',
			hideDelay:def
		});

	});
		
	//LIVE
	var appId = '1269828463077215';
	//LOCAL OR BETA
	//var appId = '273669936304095';

	$window.fbAsyncInit = function() {
    	// Executed when the SDK is loaded
	    FB.init({
	      appId: appId,
	      status: true, 
	      cookie: true, 
	      xfbml: true,
	      version: 'v2.4'
	    }); 

	    /*FB.Event.subscribe('auth.authResponseChange', function(res) {
	    	console.log(res);
	    });*/  
	};

	(function(d, s, id) {
	  var js, fjs = d.getElementsByTagName(s)[0];
	  if (d.getElementById(id)) return;
	  js = d.createElement(s); js.id = id;
	  js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&version=v2.8&appId="+appId;
	  fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));
	
	/*angular.$templateCache = $templateCache;
	
	$rootScope.$on('$viewContentLoaded', function() {	  		  
	  var newversion = 'newupdate8.0';
      if(!$cookies.get('viewcached') || $cookies.get('viewcached')!=newversion){      		
      		$templateCache.removeAll();
	  		$cookies.put('viewcached',newversion);	      		
      }
   	});*/

}]);

/*AngularJS Credit Card Payment Service*/
angular.module('ngPayments', [])
  .factory('$payments', function() {

    var verCC, verCVC, verEXP, defaultFormat, isIE, verName;
    isIE = (document.documentMode && document.documentMode < 9); //Don't try to deal with selections on < IE9
    defaultFormat = /(\d{1,4})/g;

    return {

      verified: function() {
        return verCC && verCVC && verEXP && verName;
      },

      cards: [
        {
          type: 'maestro',
          pattern: /^(5018|5020|5038|6304|6759|676[1-3])/,
          format: defaultFormat,
          length: [12, 13, 14, 15, 16, 17, 18, 19],
          cvcLength: [3],
          luhn: true
        }, {
          type: 'dinersclub',
          pattern: /^(36|38|30[0-5])/,
          format: defaultFormat,
          length: [14],
          cvcLength: [3],
          luhn: true
        }, {
          type: 'laser',
          pattern: /^(6706|6771|6709)/,
          format: defaultFormat,
          length: [16, 17, 18, 19],
          cvcLength: [3],
          luhn: true
        }, {
          type: 'jcb',
          pattern: /^35/,
          format: defaultFormat,
          length: [16],
          cvcLength: [3],
          luhn: true
        }, {
          type: 'unionpay',
          pattern: /^62/,
          format: defaultFormat,
          length: [16, 17, 18, 19],
          cvcLength: [3],
          luhn: false
        }, {
          type: 'discover',
          pattern: /^(6011|65|64[4-9]|622)/,
          format: defaultFormat,
          length: [16],
          cvcLength: [3],
          luhn: true
        }, {
          type: 'mastercard',
          pattern: /^5[1-5]/,
          format: defaultFormat,
          length: [16],
          cvcLength: [3],
          luhn: true
        }, {
          type: 'amex',
          pattern: /^3[47]/,
          //format: /(\d{1,4})(\d{1,6})?(\d{1,5})?/,
          format: defaultFormat,
          length: [15],
          cvcLength: [3, 4],
          luhn: true
        }, {
          type: 'visa',
          pattern: /^4/,
          format: defaultFormat,
          length: [13, 14, 15, 16],
          cvcLength: [3],
          luhn: true
        }
      ],

      reFormatCardNumber: function(num) {
        var card, groups, upperLength, _ref;
        card = this.cardFromNumber(num);
        if (!card) {
          return num;
        }
        upperLength = card.length[card.length.length - 1];
        num = num.replace(/\D/g, '');
        num = num.slice(0, +upperLength + 1 || 9e9);
        if (card.format.global) {
          return (_ref = num.match(card.format)) != null ? _ref.join(' ') : void 0;
        } else {
          groups = card.format.exec(num);
          if (groups != null) {
            groups.shift();
          }
          return groups != null ? groups.join(' ') : void 0;
        }
      }, //reFormatCardNumber

      cardFromNumber: function(num) {
        var card, _i, _len;
        num = (num + '').replace(/\D/g, '');
        for (_i = 0, _len = this.cards.length; _i < _len; _i++) {
          card = this.cards[_i];
          if (card.pattern.test(num)) {
            return card;
          }
        }
      }, //cardFromNumber

      luhnCheck: function(num) {
        var digit, digits, odd, sum, _i, _len, card, length;
        odd = true;
        sum = 0;
        card = this.cardFromNumber(num);
        if(!card) { return false; }
        length = card.length[card.length.length - 1];
        digits = (num + '').split('').reverse();
        for (_i = 0, _len = digits.length; _i < _len; _i++) {
          digit = digits[_i];
          digit = parseInt(digit, 10);
          if ((odd = !odd)) {
            digit *= 2;
          }
          if (digit > 9) {
            digit -= 9;
          }
          sum += digit;
        }
        return verCC = sum % 10 === 0;
      }, //luhnCheck

      validateCardExpiry: function(month, year) {
        var currentTime, expiry, prefix, _ref;
        if (typeof month === 'object' && 'month' in month) {
          _ref = month, month = _ref.month, year = _ref.year;
        }
        if (!(month && year)) {
          return verEXP = false;
        }
        if (!/^\d+$/.test(month)) {
          return verEXP = false;
        }
        if (!/^\d+$/.test(year)) {
          return verEXP = false;
        }
        if (!(parseInt(month, 10) <= 12)) {
          return verEXP = false;
        }
        if (year.length === 2) {
          prefix = (new Date).getFullYear();
          prefix = prefix.toString().slice(0, 2);
          year = prefix + year;
        }
        expiry = new Date(year, month);
        currentTime = new Date;
        expiry.setMonth(expiry.getMonth() - 1);
        expiry.setMonth(expiry.getMonth() + 1, 1);
        return verEXP = expiry > currentTime;
      }, //validateCardExpiry

      validateCVC: function(a, b) {
        return verCVC = a.indexOf(b)>-1;
      },

      validateName: function(n) {
      	return verName = (n != "" && n != null);
      }
    }
  })
  .directive('validateCard', ['$payments', function($payments) {
      return {
        require: 'ngModel',
        scope: {
          ngModel: '='
        },
        link: function(scope, elem, attrs) {

          var expm, expy, card, length, upperLength, cvvLength, ccVerified, cname;

          upperLength = 16;
          ccVerified = false;

          scope.$watch('ngModel.number', function(newValue, oldValue) {
            if(newValue) {
              card = $payments.cardFromNumber(newValue);
              if(card && card.type) { scope.ngModel.type = card.type; }
              if (card) {
                upperLength = card.length[card.length.length - 1];
              }
              length = newValue.replace(/\D/g, '').length;
              if(length == upperLength) {
                ccVerified = scope.ngModel.valid = $payments.luhnCheck(newValue.replace(/\D/g, ''));
              }
              if(ccVerified && length != upperLength) {
                ccVerified = scope.ngModel.valid = false;
              }
              /*if(card && scope.ngModel.cvc){
              	var cl = scope.ngModel.cvc.length;
              	scope.ngModel.cvcValid = $payments.validateCVC(card.cvcLength, cl);
              }*/
            }
          }, true);

          scope.$watch('ngModel.month', function(newValue, oldValue) {

				expm = newValue;
				scope.expiry = $payments.validateCardExpiry(expm, expy);

          }, true);

          scope.$watch('ngModel.year', function(newValue, oldValue) {

				expy = newValue;
				scope.expiry = $payments.validateCardExpiry(expm, expy);

          }, true);

          scope.$watch('ngModel.cvc', function(newValue, oldValue) {
            	if(newValue && card){
            		scope.ngModel.cvcValid = $payments.validateCVC(card.cvcLength, newValue.length);
                }
          }, true);

          scope.$watch('ngModel.name', function(newValue, oldValue) {
				cname = newValue;
				scope.nameValid = $payments.validateName(cname);
          }, true);

        }
      }
  }])
  .directive('formatCard', ['$payments','$timeout', function($payments, $timeout) {
    return {
        scope: false,
        link: function(scope, elem, attrs, validateCtrl) {

          //Format and determine card as typing it in
          elem.on('keypress', function(e) {
            var digit, re, card, value, length;
            if(e.which === 8 || e.metaKey || (!e.which && e.keyCode)) {
                return;
            }

            digit = String.fromCharCode(e.which);
            if (!/^\d+$/.test(digit)) {
              e.preventDefault();
              return;
            }
            value = elem.val();

            card = $payments.cardFromNumber(value + digit);

            length = (value.replace(/\D/g, '') + digit).length;
            upperLength = 16;

            if (card) {
              upperLength = card.length[card.length.length - 1];
            }

            if (length > upperLength) {
              e.preventDefault();
              return;
            }

            if (!this.isIE && (e.currentTarget.selectionStart != null) && (e.currentTarget.selectionStart !== value.length)) {
              return;
            }

            if (card && card.type === 'amex') {
              re = /^(\d{4}|\d{4}\s\d{6})$/;
            } else {
              re = /(?:^|\s)(\d{4})$/;
            }

            if (re.test(value)) {
              e.preventDefault();
              elem.val(value + ' ' + digit);
            } else if (re.test(value + digit) && length < upperLength) {
              e.preventDefault();
              elem.val(value + digit + ' ');
            }
          });

          //Format the card if they paste it in and check it
          elem.on('paste', function(e) {
            $timeout(function() {
              var formatted, value;
              value = elem.val();
              var formatted = $payments.reFormatCardNumber(value);
              elem.val(formatted);
            });
          });
        }
    }
  }]);

AlcoholDelivery.filter('creditcard', function() {
	return function(number) {
		var r = number.substr(number.length-4,4);
		return 'XXXX XXXX XXXX '+r;
	}
});

AlcoholDelivery.filter('creditcardname', function() {
	return function(name) {
		var cardName = {
			visa:'VISA',
			maestro:'Maestro',
			dinersclub:'Diners Club',
			laser:'LASER',
			jcb:'JCB',
			unionpay:'UnionPay',
			discover:'Discover',
			mastercard:'MasterCard',
			amex:'American Express'
		};		
		return cardName[name];
	}
});

AlcoholDelivery.filter('filterParentCat', function(){

	return function(pCategories){

		var inputArray = [];

		for(var key in pCategories) {

			if(typeof pCategories[key].featured!=='undefined' && pCategories[key].featured.length>0){
				inputArray.push(pCategories[key]);
			}

		}

		return inputArray;
	}

});

AlcoholDelivery.filter('dateSuffix', function ($filter) {
    var suffixes = ["th", "st", "nd", "rd"];
    return function (input) {
        var dtfilter = $filter('date')(input, 'dd');
        var day = parseInt(dtfilter, 10);
        var relevantDigits = (day < 30) ? day % 20 : day % 30;
        var suffix = (relevantDigits <= 3) ? suffixes[relevantDigits] : suffixes[0];
        
        var weekDay = $filter('date')(input, 'EEEE');
        var monthYear = $filter('date')(input, 'MMMM')+', '+$filter('date')(input, 'yyyy');

        //Thursday, 13 October, 2016
        return weekDay+', '+day+suffix+' '+monthYear;
    };
});
