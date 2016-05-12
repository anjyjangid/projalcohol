/*This is the main file where angular is defined*/
var AlcoholDelivery = angular.module('AlcoholDelivery', [
	"ui.router", 
	'ngCookies',
	'oc.lazyLoad', 
	'ngSanitize',
	'ui.bootstrap', 
	'bootstrapLightbox', 
	"19degrees.ngSweetAlert2",
	'angular-loading-bar',
	'ngAnimate',
	'ngMaterial',
	'ngMessages',
	'ngTouch',
	'ngMap'
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

	$scope.hugediscount = {
		active:true
	};

	$scope.AppController.category = "";
	$scope.AppController.subCategory = "";

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

	$scope.setPrices = function(localpro){

		if(typeof localpro.categories === "undefined"){return true;}
		
		var catIdIndex = localpro.categories.length - 1;
		var catPriceObj = $rootScope.catPricing[localpro.categories[catIdIndex]];	

		if(typeof catPriceObj === "undefined"){

			console.log("Something wrong with this product : "+localpro._id);
			localpro.quantity = 0;
			return localpro;
		}

		localpro = $.extend(catPriceObj, localpro);
		localpro.price = parseFloat(localpro.price);

		var orderValue = localpro.regular_express_delivery;
		
		if(orderValue.type==1){
			localpro.price +=  parseFloat(localpro.price * orderValue.value/100);
		}else{
			localpro.price += parseFloat(orderValue.value);
		}
		

		for(i=0;i<localpro.express_delivery_bulk.bulk.length;i++){

			var bulk = localpro.express_delivery_bulk.bulk[i];

			if(bulk.type==1){
				bulk.price = localpro.price + (localpro.price * bulk.value/100);
			}else{
				bulk.price = localpro.price + bulk.value;
			}

			bulk.price = bulk.price.toFixed(2);
		}

		localpro.price = localpro.price.toFixed(2);
		
		return localpro;

	}


}]);

AlcoholDelivery.controller('ProductsController', ['$scope', '$rootScope','$state','$http','$stateParams', function($scope, $rootScope,$state,$http,$stateParams){

	$scope.ProductsController = {};
	
	$scope.products = {};
	
	$scope.AppController.category = $stateParams.categorySlug;
	$scope.AppController.subCategory = "";

	$category = $stateParams.categorySlug;

	if(typeof $stateParams.subcategorySlug!=='undefined'){
		$category = $stateParams.subcategorySlug;
		$scope.AppController.subCategory = $stateParams.subcategorySlug;
	}

	var data = {
		category:$category,
		type : $stateParams.toggle,
		sort: $stateParams.sort,		
	}

	$scope.AppController.toggle = data.type;

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

	$scope.fetchproducts = function(){
		$http.get("/search", config).then(function(response) {

		   $scope.products = response.data;

		 }, function(response) {

		});
	}

	$scope.$on('filterproduct', function(event, obj) {
		
		$state.$current.self.reloadOnSearch = false;

		if($scope.AppController.subCategory==''){
		
			$state.go('mainLayout.category.products',
            {
				categorySlug:$scope.AppController.category,             					
				toggle:typeof(obj.toggle)=='undefined'?data.type:obj.toggle,
				sort:typeof(obj.sort)=='undefined'?data.sort:obj.sort,
				
            },
            {reload: false, location: 'replace'});			

		}else{

			$state.go('mainLayout.category.subCatProducts',
            {
            	categorySlug:$scope.AppController.category, 
            	subcategorySlug:$scope.AppController.subCategory,
            	toggle:typeof(obj.toggle)=='undefined'?data.type:obj.toggle,
				sort:typeof(obj.sort)=='undefined'?data.sort:obj.sort,
            },
            {reload: false, location: 'replace'});

		}	

        	$state.$current.self.reloadOnSearch = true;

        	data.category = $category;
			data.type = $stateParams.toggle;
			data.sort = $stateParams.sort;

        	$scope.fetchproducts();

    })

	$scope.fetchproducts();	
	
}]);

AlcoholDelivery.controller('ProductsFeaturedController', ['$scope', '$rootScope','$state','$http','$stateParams', function($scope, $rootScope,$state,$http,$stateParams){

	$scope.ProductsFeaturedController = {};
	
	$scope.featured = {};

	$scope.category = $stateParams.categorySlug;	

	$category = $stateParams.categorySlug;

	if(typeof $stateParams.subcategorySlug!=='undefined'){
		$category = $stateParams.subcategorySlug;	
	}

	$scope.loadingfeatured = true;
	
	$http.get("/search",{
				
				params:{
					
					category:$category,
					type:'featured',
					limit:10,
					offset:0

				}

		}).success(function(response){
		$scope.featured = response;
		$scope.loadingfeatured = false;
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

	   $scope.product = $scope.setPrices(response.data);

	 }, function(response) {

	});
	
}]);

AlcoholDelivery.controller('ProfileController',['$scope','$rootScope','$state','$http','sweetAlert',function($scope,$rootScope,$state,$http,sweetAlert){

	$scope.user;

	initController();
	function initController() {

		$http.get('/loggedUser').success(function(response){
			
            $scope.user = response;
        }).error(function(data, status, headers){

        });

	}

	$scope.update = function(){

		$http.put("/profile", $scope.user, {
	            
	        }).error(function(response, status, headers) {            
	            
				//sweetAlert.swal({
				// 	type:'error',
				// 	title: 'Oops...',
				// 	text:response.message,					
				// 	timer: 2000
				// });
	            
	            $scope.errors = response.data;
	        })
	        .success(function(response) {	            
	            
	            if(!response.success){
	            	$scope.errors = response;
	            }

	            sweetAlert.swal({
					type:'success',
					title: response.message,					
					timer: 2000
				});
	            $state.go($state.current, {}, {reload: true});
	        })
	}

}]);

AlcoholDelivery.controller('PasswordController',['$scope','$rootScope','$state','$http','sweetAlert',function($scope,$rootScope,$state,$http,sweetAlert){

	
	
	$scope.password = {
		current:'',
		new:'',
		confirm:''
	}

	$scope.update = function(){

		$http.put("/password", $scope.password,{
	            
	        }).error(function(response, status, headers) {            
	            
	            $scope.errors = response.data;
	        })
	        .success(function(response) {	            
	            
	            if(!response.success){
	            	$scope.errors = response;
	            }

	            sweetAlert.swal({
					type:'success',
					title: response.message,					
					timer: 2000
				});
	            $state.go($state.current, {}, {reload: true});
	        })
	}

}]);

AlcoholDelivery.controller('CartController',['$scope','$rootScope','$state','$http','$q', '$mdDialog', '$mdMedia','CartSession','sweetAlert',function($scope, $rootScope, $state, $http, $q, $mdDialog, $mdMedia, CartSession, sweetAlert){

	$scope.cart = {
					service : {
						express : {
							status:false,
						},
						smoke : {
							status:false,
						},
						nonchilled:{
							status:false,
						},
						total:0,
					},
					total:0,
					nonchilled:false,										
				};

	$scope.delivery = {
						
						charges:0,
						address:0,
						contact:"",
						instruction:0,
						leaveatdoor:false,

					};

	$scope.smoke = {
		status:false,
		detail:""
	}

	$scope.payment = {
		type:"cod",
	}

	$scope.step = 1;

	$scope.checkout = function(){



	}

	CartSession.GetDeliveryKey().then(

		function(result){
			
			$q.all([
						$http.get("cart/services").then(function(response){

							$scope.services = response.data;		
														
						}),
						$http.get("cart/"+result.deliverykey+"/").then(function(response){
							
							Object.assign($scope.cart, response.data);				
							
						}),
									
					]).then(function(){			
						$scope.updatePricing();
						$scope.setCartChilled();						
					})
		}
	);
	
	$scope.updatePricing = function(){
				
		$scope.setCartSubTotal();
		$scope.setServicesChargesTotal();		
		$scope.setCartTotal();

	}

	$scope.setCartChilled = function(status){

		if(typeof status !=="undefined"){
			
			$scope.cart.nonchilled = status;
			$scope.updatePricing();

		}else{
			$scope.cart.nonchilled = !$scope.isSingleProductChilled();
		}
		
	}

	$scope.isSingleProductChilled = function(){

		var isChilled = false;
		var p = $scope.cart.products;
		
		for (var key in p) {
			
			if (p.hasOwnProperty(key)) {

				if(p[key].chilled===true){

					isChilled = true;
					break;
				}

			}			

		}
		
		return isChilled;

	}

	$scope.getProductsTotal = function(){

		var productsTotal = 0;
		var p = $scope.cart.products;

		for (var key in p) {
			
			if (p.hasOwnProperty(key)) {

				productsTotal = productsTotal + (p[key].price * p[key].quantity);
			}
		}
		
		return productsTotal;
	}

	$scope.getAllServicesCharges = function(){

		var allServicesCharges = 0;
		var service = $scope.cart.service;

		if(service.express.status){
			allServicesCharges+= $scope.services.express;
		}
		if(service.smoke.status){
			allServicesCharges+= $scope.services.smoke;
		}		
		
		return allServicesCharges;

	}

	$scope.getAllDiscounts = function(){

		var allDiscounts = 0;

		if($scope.cart.nonchilled){
			$scope.cart.service.nonchilled.status = $scope.cart.nonchilled;
			allDiscounts+= $scope.services.chilled;
		}

		return allDiscounts;

	}

	$scope.setServicesChargesTotal = function(){
				
		$scope.cart.service.total = $scope.getAllServicesCharges();
	}
	
	$scope.getCartTotal = function(){

		var cartTotal = 0;
		
		cartTotal+= $scope.getCartSubTotal();

		cartTotal+= $scope.getAllServicesCharges();

		cartTotal-= $scope.getAllDiscounts()
		
		return cartTotal;
	}

	$scope.getCartSubTotal = function(){

		var cartSubTotal = 0;

		cartSubTotal+= $scope.getProductsTotal();

		return cartSubTotal;

	}

	$scope.setCartSubTotal = function(){

		$scope.cart.subtotal = $scope.getCartSubTotal();

	}
	
	$scope.setCartTotal = function(){
		
		$scope.cart.total = $scope.getCartTotal();

	}

  	
}]);

AlcoholDelivery.controller('CartSmokeController',['$scope','$rootScope','$state','CartSession','sweetAlert',function($scope, $rootScope, $state, $timeout, $http, $q, $mdDialog, $mdMedia, CartSession, sweetAlert){


}])

AlcoholDelivery.controller('CartAddressController',['$scope','$rootScope','$state','$timeout','$http','$q', '$mdDialog', '$mdMedia','CartSession','sweetAlert',function($scope, $rootScope, $state, $timeout, $http, $q, $mdDialog, $mdMedia, CartSession, sweetAlert){

	$rootScope.getUserAddress = function(){

		$http.get("address")
			.success(function(response){

				$scope.addresses = response;
				$rootScope.addresses = $scope.addresses;

			})
			.error(function(data, status, headers) {
			   	if(data.auth===false){			   		
			   		$state.go("mainLayout.checkout.cart");
			   	}
			})
	}

	$rootScope.getUserAddress();

	$scope.showAddressViaMapModal = function(ev) {

		$mdDialog.show({
			controller: function($scope, $rootScope, $mdDialog, NgMap) {
				
				$scope.address = {
					step:1
				}
				

				$scope.hide = function() {
					$mdDialog.hide();
				};
				$scope.cancel = function() {
					$mdDialog.cancel();
				};
				$scope.answer = function(answer) {
					$mdDialog.hide(answer);
				};

				$scope.showAddressViaManuallyModal = function(ev) {

					$mdDialog.show({
						controller: function($scope, $rootScope,$mdDialog, $http) {

							$scope.hide = function() {
								$mdDialog.hide();
							};
							$scope.cancel = function() {
								$mdDialog.cancel();
							};
							$scope.answer = function(answer) {
								$mdDialog.hide(answer);
							};
							$scope.saveAddress = function(){

								$scope.errors = {};								

								$http.post("address", $scope.address, {
						            
						        }).success(function(response) {
						        							        	
						        	$scope.errors = {};
						        	$scope.hide();
						        	$rootScope.getUserAddress();

						        }).error(function(data, status, headers) {            
						        	$scope.errors = data;
						        })
							}
						},
						templateUrl: '/templates/partials/addressManually.html',
						parent: angular.element(document.body),
						targetEvent: ev,
						clickOutsideToClose:true
					})
					.then(function(answer) {
						$scope.status = 'You said the information was "' + answer + '".';
					}, function() {
						$scope.status = 'You cancelled the dialog.';
					});

				};


				// Google map auto complete code start //

				  $scope.types = "['geocode']";
				  $scope.restrictions="{country:'sg'}"
				  $scope.placeChanged = function() {
				  	
				    $scope.address.place = this.getPlace();				    
				    $scope.map.setCenter($scope.address.place.geometry.location);

				  }

				NgMap.getMap().then(function(map) {
					$scope.map = map;
				}); 			
				// Google map auto complete code ends //

				$scope.changeAddress = function(){

					$scope.address.step = 1;
					
				}

				$scope.setMapAddress = function(){

					var isValid = validateAddress($scope.address.place);

					if(isValid){
						$scope.address.step = 2;
					}else{
						sweetAlert.swal({

			                title: "Please choose a valid address.",   
			                text: "",
			                type: "warning",
			                timer: 1000,
			                showCancelButton: true,   
			                confirmButtonColor: "#DD6B55",   
			                confirmButtonText: "Ok",
			                closeOnConfirm: true,
			                closeOnCancel: true

			            });
					}

				}

				$scope.saveAddress = function(){

					$scope.errors = {};								

					$http.post("address", $scope.address, {
				        
				    }).success(function(response) {
				    							        	
				    	$scope.errors = {};
				    	$scope.hide();
				    	$rootScope.getUserAddress();

				    }).error(function(data, status, headers) {            
				    	$scope.errors = data;
				    })

				}				


			},
			templateUrl: '/templates/partials/addressMap.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose:true
		})
		.then(function(answer) {
			
		}, function() {
			
		});

	};

	function validateAddress(address){
		
		var pullAddress = {
			route:"",
			neighborhood:""

		};
		
		if(typeof address !== "object" || typeof address.address_components === "undefined"){
			return false;
		}

		for(addressObj in address.address_components){
			switch(address.address_components[addressObj].types[0]){
				case 'route':
					pullAddress.route = address.address_components[addressObj].long_name;
				break;
				case 'neighborhood':
					pullAddress.neighborhood = address.address_components[addressObj].long_name;
				break;
			}
		}

		if(pullAddress.route=="" || pullAddress.neighborhood==""){
			return false;
		}

		return true;
	}

	$scope.updateAddressModal = function(ev,key) {

		$mdDialog.show({

			controller: function($scope, $rootScope, $mdDialog, $http) {

				$scope.address = $rootScope.user.addresses[key];
				
				$scope.hide = function() {
					$mdDialog.hide();
				};
				$scope.cancel = function() {
					$mdDialog.cancel();
				};
				$scope.answer = function(answer) {
					$mdDialog.hide(answer);
				};
				$scope.saveAddress = function(){

					$scope.errors = {};								

					$http.put("address/"+key, $scope.address, {
			            
			        }).success(function(response) {

			        	if(response.success){

			        		$rootScope.getUserAddress();
			        		$scope.errors = {};
				        	$scope.hide();
				        	

			        	}else{
			        		alert(response.message)
			        	}
			        	

			        }).error(function(data, status, headers) {            
			        	$scope.errors = data;
			        })

				}

			},
			templateUrl: '/templates/partials/addressManually.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose:true,
			openFrom : angular.element(document.querySelector('#right')),
        	closeTo : angular.element(document.querySelector('#right'))
		})
		.then(function(answer) {
			$scope.status = 'You said the information was "' + answer + '".';
		}, function() {
			$scope.status = 'You cancelled the dialog.';
		});

	};

	$scope.removeAddress = function(key) {

		sweetAlert.swal({

                title: "Are you sure?",   
                text: "Your will not be able to recover this address!",
                type: "warning",
                timer: 3000,
                showCancelButton: true,   
                confirmButtonColor: "#DD6B55",   
                confirmButtonText: "Yes, remove !",
                closeOnConfirm: false,
                closeOnCancel: false

            },  function(isConfirm) {
                    if (isConfirm) {
                        
                        $http.delete("address/"+key)
                            .success(function(response) {

                                if(response.success){

                                    $rootScope.getUserAddress();
                                    sweetAlert.swal({
                                    	
                                    	title: response.message,
						                type: "success",
						                timer: 2000,

                                    });


                                }else{

                                    sweetAlert.swal("Cancelled!", response.message, "error");

                                }

                            })
                            .error(function(data, status, headers) {
                                sweetAlert.swal("Cancelled", data.message, "error");
                            })
                        
                    } else {
                        sweetAlert.swal("Cancelled", "Address safe :)", "error");
                    }
                });
	};

}]);

AlcoholDelivery.controller('CartDeliveryController',['$scope','$rootScope','$http','$q', '$mdDialog', '$mdMedia','CartSession','sweetAlert',function($scope, $rootScope, $http, $q, $mdDialog, $mdMedia, CartSession, sweetAlert){

}]);


AlcoholDelivery.controller('CartPaymentController',['$scope','$rootScope','$http','$q', '$mdDialog', '$mdMedia','CartSession','sweetAlert',function($scope, $rootScope, $http, $q, $mdDialog, $mdMedia, CartSession, sweetAlert){

}]);

AlcoholDelivery.controller('CartReviewController',['$scope','$rootScope','$http','$q', '$mdDialog', '$mdMedia','CartSession','sweetAlert',function($scope, $rootScope, $http, $q, $mdDialog, $mdMedia, CartSession, sweetAlert){

}]);

AlcoholDelivery.controller('CmsController',['$scope','$http','$stateParams',function($scope,$http,$stateParams){

$scope.cmsId = $stateParams.cmsId;
$scope.cmsData = "";
$scope.cmsTitle = "";
	
	$http.get("/super/cmsdata?cmsid="+$scope.cmsId).success(function(response){
    	$scope.cmsData = response.content;
    	$scope.cmsTitle = response.title;
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


AlcoholDelivery.factory("UserService", ["$q", "$timeout", "$http", function($q, $timeout, $http) {

	function GetUser() {
		
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

	return {
		GetUser: GetUser,
		GetUserAddress: GetUserAddress,
        currentUser: null,
        currentUserAddress: null
	};
}]);

AlcoholDelivery.factory("CartSession", ["$q", "$timeout", "$http","$rootScope", function($q, $timeout, $http, $rootScope) {
	
	function GetDeliveryKey() {

		var d = $q.defer();

		if(typeof(Storage) !== "undefined"){

				var deliverykey = localStorage.getItem("deliverykey");
				
				if(deliverykey===null || typeof deliverykey==="undefined" || deliverykey==="undefined"){
					deliverykey = $rootScope.deliverykey;
				}
				
				if(deliverykey===null || typeof deliverykey==="undefined" || deliverykey==="undefined"){

					$http.get("cart/deliverykey").success(function(response){					

						localStorage.setItem("deliverykey",response.deliverykey);
						$rootScope.deliverykey = response.deliverykey;

						d.resolve(response);
					
					})

				}else{

					var response = {"deliverykey":deliverykey}

					localStorage.setItem("deliverykey",deliverykey);
					$rootScope.deliverykey = deliverykey;

					d.resolve(response);

				}

				

			} else {
				alert("Browser is not compatible");
			}

		return d.promise;

	};

	return {		
		GetDeliveryKey: GetDeliveryKey,key: null
	};

}]);

// /* Setup global settings */
// AlcoholDelivery.factory('UserService', [function() {
//     // supported languages
//     var user = {
//         isLogged: false,
//     	  username: ''        
//     };   

//     return user;
// }]);

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
						templateUrl : "/templates/checkout/cart.html",
						data: {step: 'cart'},
						// controller:"CartController"
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
									$('#reset').modal('show');
								},1000)
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
				.state('accountLayout.credits', {
						url: "/credits",
						templateUrl: "/templates/account/credits.html",
						controller:"CreditsController"
				})

				.state('mainLayout.product', {
						url: "/product/{product}",
						templateUrl: "/templates/product/detail.html",
						controller: "ProductDetailController"
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
				});

				/*$locationProvider.html5Mode(true);
				$locationProvider.hashPrefix = '!';*/
				
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
AlcoholDelivery.run(["$rootScope", "appSettings", "catPricing","UserService", "$state" , function($rootScope, settings, catPricing, UserService, $state) {		

	$rootScope.$state = $state; // state to be accessed from view

	catPricing.GetCategoryPricing().then(

		function(result) {

			catPricing.categoryPricing = result;			
			$rootScope.catPricing = result;

		}

	);


	$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
		
		var regex = new RegExp('^accountLayout', 'i');

		UserService.GetUser().then(
			
		    function(result) {
		    	if(result.auth===false && regex.test(toState.name)){
		    		$state.go('mainLayout.index');
		    	}
		       UserService.currentUser = result;
		    }
		);
	})

	$rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {

	   $state.previous = {state:from, param:fromParams}
	   $rootScope.appSettings.layout.pageRightbarExist = true;

	});




}]);

