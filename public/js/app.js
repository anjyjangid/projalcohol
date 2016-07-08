/*This is the main file where angular is defined*/
var AlcoholDelivery = angular.module('AlcoholDelivery', [
	"ui.router",
	'ngCookies',
	'oc.lazyLoad',
	'ngSanitize',
	'ui.bootstrap',
	'bootstrapLightbox',
	'19degrees.ngSweetAlert2',
	'angular-loading-bar',
	'ngAnimate',
	'ngMaterial',
	'ngScrollbars',
	'ngMessages',	
	'ngMap',
	'vAccordion',	
	'alcoholCart.directives',
	'angularFblogin'
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

AlcoholDelivery.filter('isActive', function() {
		return function(obj, field, check) {

			if(typeof check !== 'undefined'){
				return obj[field]===check;
			}
			console.log(obj);
			console.log(field);
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

			return (price || freeTxt!==true)?currencyFilter(price,$rootScope.settings.general.currency,2):'free';
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
        }
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

    return appSettings;

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

AlcoholDelivery.factory("UserService", ["$q", "$timeout", "$http", function($q, $timeout, $http) {

	function GetUser(){

		var d = $q.defer();
		$timeout(function(){

			$http.get("/loggedUser").success(function(response){

		    	d.resolve(response);

		    })

		}, 500);

		return d.promise;
	};

	function GetUserAddress(){

	};

	function LogoutReset(){
		console.log(this);
	};

	return {
		GetUser: GetUser,
		GetUserAddress: GetUserAddress,
        currentUser: null,
        currentUserAddress: null
	};
}]);


AlcoholDelivery.factory('ScrollPaging', function($http) {
  var ScrollPaging = function(args,url) {
    this.items = [];
    this.busy = false;    
    this.limitreached = false;
    this.totalResult = 0;    
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


AlcoholDelivery.factory('ScrollPagination', function($http) {

  var Search = function(keyword,filter,sortby) {
    this.items = [];
    this.busy = false;
    this.skip = 0;
    this.keyword = keyword;
    this.take = 2;
    this.limitreached = false;
    this.totalResult = 0;
    this.filter = filter;
    this.sortby = sortby;
  };

  Search.prototype.nextPage = function() {
    if (this.busy || this.limitreached) return;
    this.busy = true;

    $http.get('/site/searchlist',{
    	params : {
    		loyalty:true,
	    	skip:this.skip,
	    	take:this.take,
	    	filter:this.filter,
	    	sortby:this.sortby
	    }
    }).then(function(result){

		var items = result.data.products;

		this.totalResult = result.data.total;
		for (var i = 0; i < items.length; i++) {
			this.items.push(items[i]);
		}
		this.busy = false;
		if(result.data.products.length < parseInt(this.take)){
			this.limitreached = true;
		}else{
			this.skip+= parseInt(this.take);
		}

	}.bind(this));

  };

  return Search;

});

// AlcoholDelivery.factory('ProductSerivce', ['$rootScope', '$log', function ($rootScope, $log){
		
// 		var product = function (productData) {
// 			console.log(productData);
// 			//this.setPrice(productData);
			
// 		};				
		
// 		product.prototype.setPrice = function(product){
			
// 			var originalPrice = parseFloat(product.price);

// 			var unitPrice = originalPrice;		

// 			var advancePricing = product.regular_express_delivery;
			
// 			if(advancePricing.type==1){

// 				unitPrice +=  parseFloat(originalPrice * advancePricing.value/100);

// 			}else{

// 				unitPrice += parseFloat(advancePricing.value);
				
// 			}

// 			price = unitPrice;
// 			price = parseFloat(price.toFixed(2));

// 			this.unitPrice = price;

// 			var bulkArr = original.express_delivery_bulk.bulk;

// 			for(i=0;i<bulkArr.length;i++){

// 				var bulk = bulkArr[i];

// 				if(quantity >= bulk.from_qty && quantity<=bulk.to_qty){

// 					if(bulk.type==1){

// 						price = quantity * (originalPrice + (originalPrice * bulk.value/100));

// 					}else{

// 						price = quantity * (originalPrice + bulk.value);

// 					}
					
// 					price = parseFloat(price.toFixed(2));
// 				}

// 			}

// 			this.discountedUnitPrice = price/quantity;
			
// 			return this.price = price;
			
// 		};

// 		product.prototype.getPrice = function(){
// 			return parseFloat(this.price);
// 		};

// 		return product;

// 	}]);


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
														'js/js_init_scripts.js',

												]
										});
								}]
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
								controller:function($scope,$http){
										$scope.AppController.category = "";
										$scope.AppController.subCategory = "";
										$scope.AppController.showpackage = false;
										setTimeout(function(){
												initScripts({
														disableScrollHeader:true
												});
										},100)
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

						
						data: {pageTitle: 'User Account'},
						
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
				})

				.state('mainLayout.checkout.cart', {
						url: "/cart",
						views : {
							"":{
								templateUrl : "/templates/checkout/cart.html",
							},
							"promotions@mainLayout.checkout.cart":{
								templateUrl: "/templates/partials/promotions.html",
								controller:"PromotionsController"
							},
						},
						data: {step: 'cart'},
						//controller:"CartController"
				})

				.state('mainLayout.checkout.address', {
						url: "/cart/address",
						templateUrl : "/templates/checkout/address.html",
						data: {step: 'address'},
						controller:"CartAddressController"
				})

				.state('mainLayout.checkout.delivery', {
						url: "/cart/delivery",
						templateUrl : "/templates/checkout/delivery.html",
						data: {step: 'delivery'},
						controller:"CartDeliveryController"
				})

				.state('mainLayout.checkout.payment', {
						url: "/cart/payment",
						templateUrl : "/templates/checkout/payment.html",
						data: {step: 'payment'},
						controller:"CartPaymentController"
				})

				.state('mainLayout.checkout.review', {
						url: "/cart/review",
						templateUrl : "/templates/checkout/review.html",
						data: {step: 'review'},
						controller:"CartReviewController"
				})

				.state('mainLayout.login', {

						url: "/login",
						templateUrl: "/templates/index/home.html",
						controller:function(){
							setTimeout(function(){
										$('#login').modal('show');
								},1000)

						}
				})

				.state('mainLayout.reset', {
						url: "/reset/{token}",
						templateUrl: "/templates/index/home.html",
						controller:function($rootScope,$stateParams){

							$rootScope.token = $stateParams.token;

							setTimeout(function(){

									$('#reset').modal({
									    backdrop: 'static',
				                        keyboard: true, 
				                        show: true
									})
									

								},1000)
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
						templateUrl: "/templates/cmsLayout.html",
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

				.state('cmsLayout.about-us', {
						url: "/about-us",
						templateUrl: "/templates/cms/cms.html",
						params: {pageTitle: 'About Us', cmsId:'56efc34e209a568c2067284d'},
						controller:function($scope,$http){

								setTimeout(function(){
										initScripts({
												disableScrollHeader:true
										});
										$("html, body").animate({ scrollTop: 0 }, 200);
								},100)
						},
				})

				.state('cmsLayout.privacy-policy', {
						url: "/privacy-policy",
						templateUrl: "/templates/cms/cms.html",
						params: {pageTitle: 'Privacy Policy', cmsId:'572d960763e8fe24e06a0f97'},
						controller:function($scope,$http){
								
								setTimeout(function(){
										initScripts({
												disableScrollHeader:true
										});
										$("html, body").animate({ scrollTop: 0 }, 200);
								},100)
						},
				})

				.state('cmsLayout.terms-conditions', {
						url: "/terms-conditions",
						templateUrl: "/templates/cms/cms.html",
						params: {pageTitle: 'Terms and Conditions', cmsId:'572d976063e8fe24e06a0f98'},
						controller:function($scope,$http){

								setTimeout(function(){
										initScripts({
												disableScrollHeader:true
										});
										$("html, body").animate({ scrollTop: 0 }, 200);
								},100)
						},
				})

				.state('orderplaced', {

						url: "/orderplaced/{order}",
						templateUrl: "/templates/orderconfirmation.html",
						controller:"OrderplacedController",
						// resolve: {
						// 		deps: ['$ocLazyLoad', function($ocLazyLoad) {
						// 				return $ocLazyLoad.load({
						// 						name: 'AlcoholDelivery',
						// 						insertBefore: '#ng_load_plugins_before',
						// 						// debug: true,
						// 						serie: true,
						// 						files: [
						// 								'http://w.sharethis.com/button/buttons.js',														
						// 						]
						// 				});
						// 		}]
						// }
						
				})

				.state('accountLayout', {
						abstract: true,
						views : {

							"" : {
								templateUrl : "/templates/accountLayout.html",
							},
							"navLeft@accountLayout" : {
								templateUrl: "/templates/account/navLeft.html",
							},

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
						templateUrl: "/templates/account/address.html",
						controller:"AddressController"
				})
				.state('accountLayout.order', {
						url: "/order/{orderid}",
						templateUrl: "/templates/account/order.html",
						controller:"OrderDetailController"
				})

				.state('accountLayout.invite', {
						url: "/invite",
						templateUrl: "/templates/account/invite.html",
						controller:"InviteController"
				})

				.state('mainLayout.product', {
						url: "/product/{product}",
						templateUrl: "/templates/product/detail.html",
						controller: "ProductDetailController"
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
						url: "/packagedetail/{type}/{id}",
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
						controller:"SearchController",
						resolve: {
								deps: ['$ocLazyLoad', function($ocLazyLoad) {
										return $ocLazyLoad.load({
												name: 'AlcoholDelivery',
												insertBefore: '#ng_load_plugins_before',
												// debug: true,
												serie: true,
												files: [
														'bower_components/ngInfiniteScroll/build/ng-infinite-scroll.js',
												]
										});
								}]
						}
				})

				.state('mainLayout.loyaltystore', {
						url: '/loyalty-store?{filter}&{sort}',
						templateUrl : "/templates/loyaltyStore.html",
						params: {pageTitle: 'Loyalty Store'},
						controller:"LoyaltyStoreController",
						resolve: {
								deps: ['$ocLazyLoad', function($ocLazyLoad) {
										return $ocLazyLoad.load({
												name: 'AlcoholDelivery',
												insertBefore: '#ng_load_plugins_before',
												// debug: true,
												serie: true,
												files: [
														'bower_components/ngInfiniteScroll/build/ng-infinite-scroll.js',
												]
										});
								}]
						}
				})

				.state('mainLayout.giftcategory', {
					url: "/gifts/{categorySlug}?/{type}",
					templateUrl : '/templates/gifts/index.html',
					controller: 'GiftCategoryController',
					resolve: {
						deps: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load({
								name: 'AlcoholDelivery',
								insertBefore: '#ng_load_plugins_before',
								// debug: true,
								serie: true,
								files: [
									'bower_components/ngInfiniteScroll/build/ng-infinite-scroll.js',
								]
							});
						}]
					}					
				})

				.state('mainLayout.gift', {
					url: "/gifts/product/{giftid}",
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
						// params: {
					 //    	toggle: 'all',
					 //    	sort: 'latest'
					 //  	},
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

				.state('invitation',{
					url:'/acceptinvitation/{rid}',
					controller:function($state){
						$state.go('/');
					}
				});

				/*$locationProvider.html5Mode(true);
				$locationProvider.hashPrefix = '!';*/

		}]);



AlcoholDelivery.service('LoadingInterceptor', ['$q', '$rootScope', '$log', '$location',
function ($q, $rootScope, $log, $location) {
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
            if(rejection.status == 404){
				$location.url('/404').replace();
			};

			if(rejection.status == 401){
				$location.url('/login').replace();
			};

            return $q.reject(rejection);
        }
    };
}]).config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('LoadingInterceptor');
}]);

/* Init global settings and run the app */
AlcoholDelivery.run(["$rootScope", "appSettings", "alcoholCart", "store", "alcoholWishlist", "catPricing", "categoriesFac","UserService", "$state", "$http", "$window","$mdToast","$document","$anchorScroll",
			 function($rootScope, settings, alcoholCart, store, alcoholWishlist, catPricing, categoriesFac, UserService, $state, $http, $window, $mdToast,$document,$anchorScroll) {
	
	angular.alcoholCart = alcoholCart;

	$rootScope.$state = $state; // state to be accessed from view
	
	UserService.GetUser().then(
		function(result) {
			UserService.currentUser = result;
		},
		function(errorRes){
			UserService.currentUser = result;
		}
	);

	categoriesFac.getCategories().then(

		function(response){			
			categoriesFac.categories = response;
		},
		function(errorRes){}
	);


	catPricing.GetCategoryPricing().then(

		function(result) {

			catPricing.categoryPricing = result;
			$rootScope.catPricing = result;

		}

	);


	$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){

		var regex = new RegExp('^accountLayout', 'i');
		$anchorScroll();

		UserService.GetUser().then(

			function(result) {
				if(result.auth===false && regex.test(toState.name)){
					$state.go('mainLayout.index');
				}
				//UserService.currentUser = result;
			}
		);


	})

	$rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
	   
	   $state.previous = {state:from, param:fromParams}
	   $rootScope.appSettings.layout.pageRightbarExist = true;

	});


	(function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    /*$rootScope.$on('fb.load', function() {
      $window.dispatchEvent(new Event('fb.load'));
    });*/
   

	$rootScope.$on('alcoholCart:promotionAdded', function(data,msg){

		$mdToast.show(
			$mdToast.simple()
				.textContent(msg)
				.highlightAction(false)
				.position("top right fixed")
				.hideDelay(4000)
			);

	});

	$rootScope.$on('alcoholCart:promotionRemoved', function(data,msg){

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
							$scope.isFreeDelivery = false;
							$scope.freeRequired = 28;

						},						
						templateUrl: '/templates/toast-tpl/cart-update.html',						
						parent : $document[0].querySelector('#cart-summary-icon'),
						position: 'top center',
						hideDelay:3000
					});

	});

	$rootScope.$on('alcoholWishlist:itemRemoved', function(product){

		$mdToast.show(
			$mdToast.simple()
				.textContent("Removed from wishlist !")				
				.highlightAction(false)
				.position("top right fixed")
				.hideDelay(4000)
			);
		

	});

	store.init();
	alcoholWishlist.init();

}]);
