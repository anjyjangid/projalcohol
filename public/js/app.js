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
	'ngMessages',
	'ngTouch',
	'ngMap',
	'vAccordion',
	'ngFacebook'	
]);


/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
AlcoholDelivery.config(
	['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
		$ocLazyLoadProvider.config({
			// global configs go here
		});
}]);

AlcoholDelivery.config(['$facebookProvider', function($facebookProvider) {
    $facebookProvider.setAppId('273669936304095').setPermissions(['email','user_friends']);
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


AlcoholDelivery.controller('AppController', ['$scope', '$rootScope','$http', '$facebook', function($scope, $rootScope,$http,$facebook) {

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


	// YKB Facebook start //
	$scope.$on('fb.auth.authResponseChange', function() {
      $scope.status = $facebook.isConnected();
      if($scope.status) {
        $facebook.api('/me?fields=email,name').then(function(user) {
          //$scope.user = user;
          //console.log(user);
          user.fbid = user.id;
          $http.post('/auth/registerfb',user).success(function(response){

					if(response.success==true)
					{
						$scope.user = response.data;
						$('#login').modal('hide');
					}

	            }).error(function(data, status, headers) {                            
	                $scope.login.errors = data;                
	            });

        });
      }
    });

    $scope.loginToggle = function() {
      if($scope.status) {
        $facebook.logout();
      } else {
        $facebook.login();
      }
    };
    // YKB facebook end //

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

AlcoholDelivery.controller('PasswordController',['$scope','$rootScope','$state','$http','sweetAlert','UserService',function($scope,$rootScope,$state,$http,sweetAlert,UserService){

	UserService.GetUser().then(
			
	    function(result) {
	    	$scope.currentPasswordHide = result.loginfb;
	    }
	);


	
	
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

AlcoholDelivery.controller('CartController',['$scope','$rootScope','$state','$http','$q', '$mdDialog', '$mdMedia','$timeout','CartSession','UserService','sweetAlert',function($scope, $rootScope, $state, $http, $q, $mdDialog, $mdMedia, $timeout, CartSession, UserService, sweetAlert){

	//cart
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
					delivery : {
						type:1, // 0 => Express; 1 => advance;
						charges:0,
						address:{

							key:0,
							detail:""
							
						},
						contact:"",
						instruction:0,
						leaveatdoor:false,
					},
					timeslot : {
						datekey:false,
						slotkey:false,
						slug:"",
						slotslug:""
					}
				};
	
	

	$scope.smoke = {
		status:false,
		detail:""
	}

	$scope.payment = {
		type:"cod",
	}


	$scope.step = 1;

	$scope.checkout = function() {

		UserService.GetUser().then(

			function(result) {

				if(result.auth===false){

					$('#login').modal('show');

				}else{

					$scope.deployCart();

					$scope.step = 2;
					$state.go("mainLayout.checkout.address");

				}

			}
		);
	};

	$scope.setdeliverytype = function(type){

		if(type==1){
			$scope.cart.service.express.status = false
		}

		$scope.cart.delivery.type = type;
	}

	CartSession.GetDeliveryKey().then(

		function(result){
			
			$q.all([
						$http.get("cart/services").then(function(response){

							$scope.services = response.data;							
														
						}),
						$http.get("cart/"+result.deliverykey+"/").then(function(response){
							
							Object.assign($scope.cart, response.data);

							$scope.cart.productslength = Object.keys($scope.cart.products).length;

							for(key in $scope.cart.products){

								$scope.$watch('cart.products["'+key+'"].quantity',
									function(newValue, oldValue) {
										$scope.updatePricing();

									},true
								);

							}


						}),
									
					]).then(function(){			
						$scope.updatePricing();						

						$scope.$watch('cart.nonchilled',
							function(newValue, oldValue) {							
								$scope.deployCart();
							},true
						);

					})
		}
	);

	$scope.deployCart = function(){
		

		var tempCartData = {}
		angular.copy($scope.cart, tempCartData);
	
		delete tempCartData.products

		$http.put("deploycart", tempCartData,{

			        }).error(function(data, status, headers) {

			        }).success(function(response) {
			        	if(!response.success){

			        	}
			        });
	}

	$scope.updatePricing = function(){
		
		$scope.setProductFinalPrice();
		$scope.setCartSubTotal();
		$scope.setServicesChargesTotal();		
		$scope.setCartTotal();

	}

	$scope.setProductFinalPrice = function(){

		for(key in $scope.cart.products){

			var currPro = $scope.cart.products[key];
			var bulkArr = currPro.product.express_delivery_bulk.bulk;


			currPro.finalprice = (parseFloat(currPro.product.price) * parseInt(currPro.quantity)).toFixed(2);
			

			currPro.product.sprice = parseFloat(currPro.product.price);

			var orderValue = currPro.product.regular_express_delivery;
			
			if(orderValue.type==1){
				currPro.product.sprice +=  parseFloat(currPro.product.sprice * orderValue.value/100);
			}else{
				currPro.product.sprice += parseFloat(orderValue.value);
			}

			currPro.product.sprice = currPro.product.sprice.toFixed(2)


			for(i=0;i<bulkArr.length;i++){

				var bulk = bulkArr[i];

				if(currPro.quantity >= bulk.from_qty && currPro.quantity<=bulk.to_qty){

					if(bulk.type==1){
						currPro.finalprice = currPro.quantity * (currPro.product.price + (currPro.product.price * bulk.value/100));
					}else{
						currPro.finalprice = currPro.quantity * (currPro.product.price + bulk.value);
					}
					
					currPro.finalprice = currPro.finalprice.toFixed(2);
				}

			}

			$scope.cart.products[key].finalprice = currPro.finalprice;

		}

	}

	$scope.setCartChilled = function(status){

		if(typeof status !=="undefined"){
			
			$scope.cart.nonchilled = status;
			$scope.updatePricing();

		}else{
			$scope.cart.nonchilled = $scope.isSingleProductChilled();
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
	
	$scope.setDeliveryCharges = function(){

		if($scope.cart.subtotal>$scope.services.mincart){
			$scope.cart.delivery.charges = 0;
		}else{
			$scope.cart.delivery.charges = $scope.services.delivery;
		}

		return $scope.cart.delivery.charges;
		
	}

	$scope.getDeliveryCharges = function(){

		return $scope.setDeliveryCharges();

		
	}

	$scope.getCartTotal = function(){

		var cartTotal = 0;
		
		cartTotal+= $scope.getCartSubTotal();

		cartTotal+= $scope.getAllServicesCharges();

		cartTotal+= $scope.getDeliveryCharges();

		cartTotal-= $scope.getAllDiscounts();
		
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

	$scope.addtocart = function(key){
		
		if(typeof $scope.proUpdateTimeOut!=="undefined"){
			$timeout.cancel($scope.proUpdateTimeOut);
		}
		
		$scope.proUpdateTimeOut = $timeout(function(){

			CartSession.GetDeliveryKey().then(

				function(response){						

					$http.put("/cart/"+response.deliverykey, {
							"id":key,
							"quantity":$scope.cart.products[key].quantity,
							"chilled":true,
						},{

			        }).error(function(data, status, headers) {

			        }).success(function(response) {
			        	if(!response.success){
			        		
			        		switch(response.errorCode){
								case "100":
									$scope.cart.products[key].quantity = response.data.quantity;									
								break;
			        		}

			        	}
			        });

			        if($scope.cart.products[key].quantity==0){

			        	delete $scope.cart.products[key];
			        	$scope.cart.productslength = Object.keys($scope.cart.products).length;

					}

				}

			)
		},1500)
		
	};

	$scope.remove = function(key,type){

		$http.delete("cart/product/"+key+"/"+type)
				.success(function(response) {

				    if(response.success){

				    	if(response.removeCode==300){

				    		delete $scope.cart.products[key];

				    	}else if(response.removeCode==200){

				    		$scope.cart.products[key][type] = 0;

				    	}

				    	$scope.cart.productslength = Object.keys($scope.cart.products).length;

				    }else{

				        sweetAlert.swal("Cancelled!", response.message, "error");

				    }

				})
				.error(function(data, status, headers) {
				    sweetAlert.swal("Cancelled", data.message, "error");
				})
	}

  	
}]);

AlcoholDelivery.controller('CartSmokeController',['$scope','$rootScope','$state','CartSession','sweetAlert',function($scope, $rootScope, $state, $timeout, $http, $q, $mdDialog, $mdMedia, CartSession, sweetAlert){


}])

AlcoholDelivery.controller('CartAddressController',['$scope','$rootScope','$state','$timeout','$http','$q', '$mdDialog', '$mdMedia','CartSession','sweetAlert',function($scope, $rootScope, $state, $timeout, $http, $q, $mdDialog, $mdMedia, CartSession, sweetAlert){

	$scope.errors = {};

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

	$scope.setSelectedAddress = function(key){
		
		$scope.$parent.cart.delivery.address = {};
		$scope.$parent.cart.delivery.address.key = key;
		$scope.$parent.cart.delivery.address.detail = $scope.addresses[key];

	}

	$scope.addressCheckout = function(){

		if($scope.$parent.cart.delivery.address===""){
			sweetAlert.swal({
					type:'error',
					title: "Please select an address",
					timer: 2000
				});
			return false;
		}
		if($scope.$parent.cart.delivery.contact===""){
			
			$scope.errors.contact = "Please enter contact person number";
			
			return false;
		}

		$scope.$parent.deployCart();

		if($scope.$parent.cart.delivery.type==1){
			
			$scope.step = 3;
			$state.go("mainLayout.checkout.delivery");

		}else{

			$scope.step = 4;
			$state.go("mainLayout.checkout.payment");

		}

	}

}]);

AlcoholDelivery.controller('CartDeliveryController',['$scope','$rootScope','$state','$http','$q', '$mdDialog', '$mdMedia','CartSession','sweetAlert',function($scope, $rootScope, $state, $http, $q, $mdDialog, $mdMedia, CartSession, sweetAlert){

	if($scope.$parent.cart.delivery.type==0){
		$scope.step = 4;
		$state.go("mainLayout.checkout.payment");
	}

	$scope.timeslot = $scope.$parent.cart.timeslot;

	$scope.localDate = new Date();

	if($scope.$parent.cart.timeslot.slug){
		$scope.myDate = new Date($scope.$parent.cart.timeslot.slug);
	}else{
		$scope.myDate = new Date();
		$scope.myDate.setDate($scope.myDate.getDate()+1);
	}
	
	$scope.localDate.setDate($scope.localDate.getDate()+1);

	$scope.minDate = new Date(
		$scope.localDate.getFullYear(),
		$scope.localDate.getMonth(),
		$scope.localDate.getDate()
	);
	
	$scope.maxDate = new Date(
		$scope.localDate.getFullYear(),
		$scope.localDate.getMonth() + 5,
		$scope.localDate.getDate()
	);

	$scope.$watch('myDate',
			function(newValue, oldValue) {
				$scope.dateChangeAction();
			}
		);

	$scope.dateChangeAction = function(){

		$scope.weeksName = new Array(7);
		$scope.weeksName[0]=  "Sunday";
		$scope.weeksName[1] = "Monday";
		$scope.weeksName[2] = "Tuesday";
		$scope.weeksName[3] = "Wednesday";
		$scope.weeksName[4] = "Thursday";
		$scope.weeksName[5] = "Friday";
		$scope.weeksName[6] = "Saturday";

		$scope.monthsName = new Array(12);
		$scope.monthsName[0]=  "January";
		$scope.monthsName[1] = "February";
		$scope.monthsName[2] = "March";
		$scope.monthsName[3] = "April";
		$scope.monthsName[4] = "May";
		$scope.monthsName[5] = "June";
		$scope.monthsName[6] = "July";
		$scope.monthsName[7] = "August";
		$scope.monthsName[8] = "September";
		$scope.monthsName[9] = "Octomber";
		$scope.monthsName[10] = "November";
		$scope.monthsName[11] = "December";



		$scope.day = $scope.myDate.getDate();
		$scope.year = $scope.myDate.getFullYear();
		$scope.weekName = $scope.weeksName[$scope.myDate.getDay()];
		$scope.monthName = $scope.monthsName[$scope.myDate.getMonth()];

		$scope.daySlug = $scope.weekName+', '+$scope.day+' '+$scope.monthName+', '+$scope.year;

		$scope.currDate = $scope.myDate.getFullYear()+'-'+($scope.myDate.getMonth()+1)+'-'+$scope.myDate.getDate();

		$http.get("cart/timeslots/"+$scope.currDate).success(function(response){

			$scope.timeslots = response;		

	    });

	}


	$scope.timerange = {
		"0":'12am',
	    "30":'12:30am',
	    "60":'1am',
	    "90":'1:30am',
	    "120":'2am',
	    "150":'2:30am',
	    "180":'3am',
	    "210":'3:30am',
	    "240":'4am',
	    "270":'4:30am',
	    "300":'5am',
	    "330":'5:30am',
	    "360":'6am',
	    "390":'6:30am',
	    "420":'7am',
	    "450":'7:30am',
	    "480":'8am',
	    "510":'8:30am',
	    "540":'9am',
	    "570":'9:30am',
	    "600":'10am',
	    "630":'10:30am',
	    "660":'11am',
	    "690":'11:30am',
	    "720":'12pm',
	    "750":'12:30pm',
	    "780":'1pm',
	    "810":'1:30pm',
	    "840":'2pm',
	    "870":'2:30pm',
	    "900":'3pm',
	    "930":'3:30pm',
	    "960":'4pm',
	    "990":'4:30pm',
	    "1020":'5pm',
	    "1050":'5:30pm',
	    "1080":'6pm',
	    "1120":'6:30pm',
	    "1150":'7pm',
	    "1180":'7:30pm',
	    "1210":'8pm',
	    "1240":'8:30pm',
	    "1270":'9pm',
	    "1300":'9:30pm',
	    "1330":'10pm',
	    "1370":'10:30pm',
	    "1400":'11pm',
	    "1430":'11:30pm',
	
	};

	

	

	$scope.setSlot = function(status,dateKey,slotKey){

		if(status==0){
			return false;
		}

		$scope.timeslot.datekey = dateKey;
		$scope.timeslot.slotkey = slotKey;	
		$scope.timeslot.slug = $scope.myDate;

		var timeslots = $scope.timeslots;

		for(key in timeslots){

			if(timeslots[key].datekey==dateKey){

				for(skey in timeslots[key].slots){

					if(skey==slotKey){

						$scope.timeslot.slotslug = $scope.timerange[timeslots[key].slots[skey].from]+" - "+$scope.timerange[timeslots[key].slots[skey].to];

					}

				}

			}
		}

	}

	$scope.timeslotCheckout = function(){

		if($scope.timeslot.datekey===false || $scope.timeslot.slotkey===false){

			sweetAlert.swal({
				type:'error',
				title: 'Oops...',
				text:"Please select a available time slot",
				timer: 2000
			});

		}else{

			$scope.$parent.cart.timeslot = $scope.timeslot;

			$scope.$parent.deployCart();

			$state.go("mainLayout.checkout.payment");

		}

	}



}]);


AlcoholDelivery.controller('CartPaymentController',['$scope','$rootScope','$http','$q', '$mdDialog', '$mdMedia','CartSession','sweetAlert',function($scope, $rootScope, $http, $q, $mdDialog, $mdMedia, CartSession, sweetAlert){

}]);

AlcoholDelivery.controller('CartReviewController',['$scope','$rootScope','$http','$q','$state', '$mdDialog', '$mdMedia','CartSession','sweetAlert',function($scope, $rootScope, $http, $q, $state, $mdDialog, $mdMedia, CartSession, sweetAlert){

	$scope.address = $scope.$parent.cart.delivery.address;

	$scope.weeksName = new Array(7);
	$scope.weeksName[0]=  "Sunday";
	$scope.weeksName[1] = "Monday";
	$scope.weeksName[2] = "Tuesday";
	$scope.weeksName[3] = "Wednesday";
	$scope.weeksName[4] = "Thursday";
	$scope.weeksName[5] = "Friday";
	$scope.weeksName[6] = "Saturday";

	$scope.monthsName = new Array(12);
	$scope.monthsName[0]=  "January";
	$scope.monthsName[1] = "February";
	$scope.monthsName[2] = "March";
	$scope.monthsName[3] = "April";
	$scope.monthsName[4] = "May";
	$scope.monthsName[5] = "June";
	$scope.monthsName[6] = "July";
	$scope.monthsName[7] = "August";
	$scope.monthsName[8] = "September";
	$scope.monthsName[9] = "Octomber";
	$scope.monthsName[10] = "November";
	$scope.monthsName[11] = "December";

	var mili = $scope.$parent.cart.timeslot.datekey * 1000;
	$scope.myDate = new Date(mili);

	$scope.day = $scope.myDate.getDate();
	$scope.year = $scope.myDate.getFullYear();
	$scope.weekName = $scope.weeksName[$scope.myDate.getDay()];
	$scope.monthName = $scope.monthsName[$scope.myDate.getMonth()];

	$scope.daySlug = $scope.weekName+', '+$scope.day+' '+$scope.monthName+', '+$scope.year;
	$scope.slotslug = $scope.$parent.cart.timeslot.slotslug;


	$scope.orderConfirm = function(){

		$http.put("confirmorder", {} ,{		

		}).error(function(response, status, headers) {            
	            
				sweetAlert.swal({
					type:'error',
					title: 'Oops...',
					text:response.message,
					timer: 2000
				});
	            
	        })
	        .success(function(response) {	            
	            
	            if(!response.success){

	            	sweetAlert.swal({
						type:'error',
						title: 'Oops...',
						text:response.message,
						timer: 2000
					});
	            
	            }

	            sweetAlert.swal({
					type:'success',
					title: response.message,					
					timer: 1000
				});

	            delete $rootScope.deliverykey
	            localStorage.removeItem("deliverykey");

	            $state.go('orderplaced',{order:response.order},{reload: false, location: 'replace'});

	        })


	}

}]);



AlcoholDelivery.controller('OrderplacedController',['$scope','$http','$stateParams',function($scope,$http,$stateParams){
	
	$scope.order = $stateParams.order;

	$http.get("order/summary/"+$scope.order).success(function(response){
    	$scope.order = response;

    	$scope.orderNumber = $scope.order._id.substr(3, 10);

    	$scope.weeksName = new Array(7);
		$scope.weeksName[0]=  "Sunday";
		$scope.weeksName[1] = "Monday";
		$scope.weeksName[2] = "Tuesday";
		$scope.weeksName[3] = "Wednesday";
		$scope.weeksName[4] = "Thursday";
		$scope.weeksName[5] = "Friday";
		$scope.weeksName[6] = "Saturday";

		$scope.monthsName = new Array(12);
		$scope.monthsName[0]=  "January";
		$scope.monthsName[1] = "February";
		$scope.monthsName[2] = "March";
		$scope.monthsName[3] = "April";
		$scope.monthsName[4] = "May";
		$scope.monthsName[5] = "June";
		$scope.monthsName[6] = "July";
		$scope.monthsName[7] = "August";
		$scope.monthsName[8] = "September";
		$scope.monthsName[9] = "Octomber";
		$scope.monthsName[10] = "November";
		$scope.monthsName[11] = "December";

		var mili = $scope.order.timeslot.datekey * 1000;
		$scope.myDate = new Date(mili);

		$scope.day = $scope.myDate.getDate();
		$scope.year = $scope.myDate.getFullYear();
		$scope.weekName = $scope.weeksName[$scope.myDate.getDay()];
		$scope.monthName = $scope.monthsName[$scope.myDate.getMonth()];

		$scope.daySlug = $scope.day+' '+$scope.monthName+', '+$scope.year;
		$scope.slotslug = $scope.order.timeslot.slotslug;



		var dopmili = $scope.order.dop * 1000;
		$scope.dopDate = new Date(dopmili);

		$scope.dopDay = $scope.dopDate.getDate();
		$scope.dopYear = $scope.dopDate.getFullYear();		
		$scope.dopMonthName = $scope.monthsName[$scope.dopDate.getMonth()];
		$scope.dopSlug = $scope.dopMonthName+' '+$scope.dopDay+', '+$scope.year;



    });

	

	
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

AlcoholDelivery.controller('PackagesController', ['$scope', '$rootScope','$state','$http','$stateParams','$timeout','$anchorScroll', function($scope, $rootScope,$state,$http,$stateParams,$timeout,$anchorScroll){
	
	$rootScope.appSettings.layout.pageRightbarExist = false;

	$rootScope.$on("$locationChangeSuccess", function(){
        $timeout(function() {
            $anchorScroll();
       });
    }); 

	$scope.AppController.category = "packages";
	$scope.AppController.subCategory = $stateParams.type;

	$scope.packages = [];
	
	$http.get('/package/packages/'+$stateParams.type).success(function(response){
		$scope.packages = response;
	});	

	$scope.expandCallback = function (index, id) {
	$timeout(function() {
		$anchorScroll(id);
		});	    
	};

	$scope.collapseCallback = function (index, id) {
		$timeout(function() {
			$anchorScroll(id);
		});
	};

	$scope.validateSelection = function (index, id) {
			
	};

	  /*$scope.$on('accordionA:onReady', function () {
	    console.log('accordionA is ready!');
	  });*/	  

}]);

AlcoholDelivery.controller('PackageDetailController', ['$scope', '$rootScope','$state','$http','$stateParams','$timeout','$anchorScroll', function($scope, $rootScope,$state,$http,$stateParams,$timeout,$anchorScroll){
	
	$rootScope.appSettings.layout.pageRightbarExist = false;

	$rootScope.$on("$locationChangeSuccess", function(){
        $timeout(function() {
            $anchorScroll();
       });
    }); 

	$scope.AppController.category = "packages";
	$scope.AppController.subCategory = $stateParams.type;

	$scope.packages = [];
	
	$http.get('/package/packagedetail/'+$stateParams.type+'/'+$stateParams.id).success(function(response){
		$scope.packages = response;
	});	

	$scope.expandCallback = function (index, id) {
	
		/*$timeout(function() {
			$anchorScroll(id);
		});*/	    
	};

	$scope.collapseCallback = function (index, id) {
		/*$timeout(function() {
			$anchorScroll(id);
		});*/
	};

	$scope.validateSelection = function (index, id) {
			
	};

	  /*$scope.$on('accordionA:onReady', function () {
	    console.log('accordionA is ready!');
	  });*/	  

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

				.state('orderplaced', {
						url: "/orderplaced/{order}",
						templateUrl: "/templates/orderconfirmation.html",
						controller:"OrderplacedController"
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
				
		}]);

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
AlcoholDelivery.run(["$rootScope", "appSettings", "catPricing","UserService", "$state", "$window", function($rootScope, settings, catPricing, UserService, $state, $window) {		

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




	(function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
    $rootScope.$on('fb.load', function() {
      $window.dispatchEvent(new Event('fb.load'));
    });

}]);

