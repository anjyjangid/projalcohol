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
	'ngTouch',
	'ngMap',
	'vAccordion',
	'ngFacebook',
	'alcoholCart.directives'
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

AlcoholDelivery.filter('freeTxt', function() {
		return function(input) {
			input = parseFloat(input);
			return input>0?input:'free';
		}
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


AlcoholDelivery.controller('AppController', ['$scope', '$rootScope','$http', '$facebook', "$mdToast", function($scope, $rootScope,$http,$facebook,$mdToast) {

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
		localpro.unitprice = localpro.price;
		var orderValue = localpro.regular_express_delivery;
		
		if(orderValue.type==1){
			localpro.price +=  parseFloat(localpro.price * orderValue.value/100);
		}else{
			localpro.price += parseFloat(orderValue.value);
		}
		

		for(i=0;i<localpro.express_delivery_bulk.bulk.length;i++){

			var bulk = localpro.express_delivery_bulk.bulk[i];

			if(bulk.type==1){
				bulk.price = localpro.unitprice + (localpro.unitprice * bulk.value/100);
			}else{
				bulk.price = localpro.unitprice + bulk.value;
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


    // Toast settings

		var last = {
			bottom: false,
			top: true,
			left: false,
			right: true
		};

		$scope.toastPosition = angular.extend({},last);

		$scope.getToastPosition = function() {

			sanitizePosition();
			return Object.keys($scope.toastPosition)
				.filter(function(pos) { return $scope.toastPosition[pos]; })
				.join(' ');

		};

		function sanitizePosition() {
			var current = $scope.toastPosition;
			if ( current.bottom && last.top ) current.top = false;
			if ( current.top && last.bottom ) current.bottom = false;
			if ( current.right && last.left ) current.left = false;
			if ( current.left && last.right ) current.right = false;
			last = angular.extend({},current);
		}

		$rootScope.showSimpleToast = function(msg) {
			$mdToast.show(
			$mdToast.simple()
				.textContent(msg)
				.position($scope.getToastPosition())
				.hideDelay(300000)
			);
		};
  
    // Toast Settings

}]);





AlcoholDelivery.controller('ProductsController', ['$scope', '$rootScope','$state','$http','$stateParams', function($scope, $rootScope,$state,$http,$stateParams){

	$scope.ProductsController = {};
	
	$scope.products = {};
	
	$scope.AppController.category = $stateParams.categorySlug;
	$scope.AppController.subCategory = "";
	$scope.AppController.showpackage = false;

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

AlcoholDelivery.controller('ProductDetailController', ['$scope', '$rootScope','$state','$http','$stateParams','alcoholCart', function($scope, $rootScope,$state,$http,$stateParams,alcoholCart){

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

		var isInCart = alcoholCart.getProductById($scope.product._id);

		$scope.product.qChilled = 0;
		$scope.product.qNChilled = 0;
		
		$scope.product.servechilled=$scope.product.chilled;

		if(isInCart!==false){

			$scope.isInCart = true;
			$scope.product.qChilled = isInCart.getRQuantity('chilled');
			$scope.product.qNChilled = isInCart.getRQuantity('nonchilled');
			$scope.product.servechilled = isInCart.getLastServedAs();

		}

		$scope.maxQuantity = $scope.product.quantity;

		var available = $scope.maxQuantity-$scope.product.qNChilled+$scope.product.qChilled;

		if(available<0){
			
			$scope.overQunatity = true;
			$scope.product.qNChilled = $scope.product.qNChilled + available;				

		}

		var available = $scope.maxQuantity-$scope.product.qNChilled+$scope.product.qChilled;

		if(available<0){
			
			$scope.product.qChilled = $scope.product.qChilled + available;

		}
		
		$scope.$watchGroup(['product.qNChilled','product.qChilled','maxQuantity'],
					function(newValue, oldValue) {

						$scope.updateQuantity();

					},true
				);

		$scope.updateQuantity = function(){

			$scope.product.chilledMaxQuantity = $scope.maxQuantity - $scope.product.qNChilled;
			$scope.product.nonChilledMaxQuantity = $scope.maxQuantity - $scope.product.qChilled;
			$scope.tquantity = parseInt($scope.product.qNChilled)+parseInt($scope.product.qChilled);

		}

		$scope.addtocart = function(){

			alcoholCart.addItem($scope.product._id,$scope.product.qChilled,true);
			alcoholCart.addItem($scope.product._id,$scope.product.qNChilled,false);

		};


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

AlcoholDelivery.controller('OrdersController',['$scope','$rootScope','$state','$http','sweetAlert','UserService',function($scope,$rootScope,$state,$http,sweetAlert,UserService){


	$scope.rate = 3;
	$scope.max = 5;
	$scope.isReadonly = false;

	$scope.hoveringOver = function(value) {
		$scope.overStar = value;
		$scope.percent = 100 * (value / $scope.max);
	};

	$scope.ratingStates = [

		{stateOn: 'glyphicon-ok-sign', stateOff: 'glyphicon-ok-circle'},
		{stateOn: 'glyphicon-star', stateOff: 'glyphicon-star-empty'},
		{stateOn: 'glyphicon-heart', stateOff: 'glyphicon-ban-circle'},
		{stateOn: 'glyphicon-heart'},
		{stateOff: 'glyphicon-off'}

	];	


	$scope.order = [];
    
    $http.get("order/orders")
			.success(function(response){

				$scope.orders = response;
				//$scope.shipping = UserService.currentUser.address[response.delivery.address.key];

			})
			.error(function(data, status, headers) {
			   	if(data.auth===false){			   		
			   		$state.go("mainLayout.checkout.cart");
			   	}
			})   

}]);

AlcoholDelivery.controller('OrderDetailController',['$scope','$rootScope','$state','$stateParams','$http','sweetAlert','UserService',function($scope,$rootScope,$state,$stateParams,$http,sweetAlert,UserService){

	$scope.rate = 3;
	$scope.max = 5;
	$scope.isReadonly = false;
	$scope.orderid = $stateParams.orderid;

	$scope.hoveringOver = function(value) {
		$scope.overStar = value;
		$scope.percent = 100 * (value / $scope.max);
	};

	$scope.ratingStates = [

		{stateOn: 'glyphicon-ok-sign', stateOff: 'glyphicon-ok-circle'},
		{stateOn: 'glyphicon-star', stateOff: 'glyphicon-star-empty'},
		{stateOn: 'glyphicon-heart', stateOff: 'glyphicon-ban-circle'},
		{stateOn: 'glyphicon-heart'},
		{stateOff: 'glyphicon-off'}

	];	

	$scope.order = [];
    
    $http.get("order/"+$stateParams.orderid)
			.success(function(response){

				$scope.order = response;
				$scope.address = $scope.order.delivery.address;
				
				//$scope.shipping = UserService.currentUser.address[response.delivery.address.key];
			})
			.error(function(data, status, headers) {
			   	
			})   

}]);

AlcoholDelivery.controller('AddressController',['$scope','$rootScope','$state','$timeout', '$mdDialog', '$mdMedia', '$http','sweetAlert',function($scope, $rootScope, $state, $timeout, $mdDialog, $mdMedia, $http, sweetAlert){

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
				  $scope.restrictions="{country:'sg'}";
				  $scope.center = "[1.290270, 103.851959]";
				  $scope.zoom = 2;

				  $scope.placeChanged = function() {
				  	
				    $scope.address.place = this.getPlace();				    
				    var point = $scope.address.place.geometry.location;
				    $scope.map.setCenter(point);
				    
					$scope.map.setCenter(point);
					$scope.map.setZoom(16);
					$scope.marker.setMap(null);
    				$scope.marker = new google.maps.Marker({
							            position: point,
							            map: $scope.map,						            
							        });

				  }

				NgMap.getMap().then(function(map) {
				

					$scope.map = map;
					angular.map = $scope.map;

					setTimeout(function() {

						var point = new google.maps.LatLng(1.290270,103.851959);
						
						$scope.map.setCenter(point);
						$scope.map.setZoom(12);
						$scope.map.setOptions({draggable: false});

        				// $scope.marker = new google.maps.Marker({
								    //         position: point,
								    //         map: $scope.map,						            
								    //     });

					}, 500);
					


				}); 			
				// Google map auto complete code ends //

				$scope.changeAddress = function(){

					setTimeout(function() {
						
					    var point = $scope.address.place.geometry.location;
					    $scope.map.setCenter(point);

						$scope.map.setZoom(12);
						$scope.map.setOptions({draggable: false});

        				$scope.marker = new google.maps.Marker({
								            position: point,
								            map: $scope.map,						            
								        });

					}, 100);

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

				$scope.update = true;

				$scope.address = $rootScope.addresses[key];
				
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
                showCancelButton: true,   
                confirmButtonColor: "#DD6B55",   
                confirmButtonText: "Yes, remove !",
                closeOnConfirm: false,
                closeOnCancel: false

            }).then(

	            function(isConfirm) {

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
	                }
            );
	};

	

}]);

AlcoholDelivery.controller('WishlistController',['$scope','$rootScope','$state','$stateParams','$http','sweetAlert','UserService','alcoholCart','alcoholWishlist',function($scope,$rootScope,$state,$stateParams,$http,sweetAlert,UserService,alcoholCart,alcoholWishlist){

	$scope.alcoholCart = alcoholCart;
	$scope.alcoholWishlist = alcoholWishlist;
    
   //  $http.get("order/"+$stateParams.orderid)
			// .success(function(response){

			// 	$scope.order = response;
			// 	$scope.address = $scope.order.delivery.address;
				
			// 	//$scope.shipping = UserService.currentUser.address[response.delivery.address.key];
			// })
			// .error(function(data, status, headers) {
			   	
			// })

}]);


AlcoholDelivery.controller('CartController',['$scope','$rootScope','$state','$http','$q', '$mdDialog', '$mdMedia','$timeout','CartSession','UserService','sweetAlert','alcoholCart','store',function($scope, $rootScope, $state, $http, $q, $mdDialog, $mdMedia, $timeout, CartSession, UserService, sweetAlert, alcoholCart,store){

	$rootScope.storeInitUP = true;

	store.init().then(

		function(result) {

			$scope.alcoholCart = alcoholCart;

			angular.alcoholCart = alcoholCart;

			$scope.cart = alcoholCart.$cart;

			$rootScope.storeInitUP = false;

		}
	);

	$scope.showAlert = function(ev) {
	    $mdDialog.show(
	    	{	
				controller: function($scope, $rootScope,$mdDialog, $http) {

					$scope.hide = function() {
						$mdDialog.hide();
					};
				},	
				templateUrl: '/templates/partials/gift-packaging-popup.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose: true			
			}
		)
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

	
	

	$scope.addtocart = function(key,type){
		
		if(typeof $scope.proUpdateTimeOut!=="undefined"){
			$timeout.cancel($scope.proUpdateTimeOut);
		}
		
		$scope.proUpdateTimeOut = $timeout(function(){

			if(type=='qChilled'){

				alcoholCart.addItem(key,$scope.cart.products[key].qChilled,true);

			}else{

				alcoholCart.addItem(key,$scope.cart.products[key].qNChilled,false);

			}

			// CartSession.GetDeliveryKey().then(

			// 	function(response){

			// 		$http.put("/cart/"+response.deliverykey, {
			// 				"id":key,
			// 				"quantity":$scope.cart.products[key].quantity,
			// 				"chilled":true,
			// 			},{

			//         }).error(function(data, status, headers) {

			//         }).success(function(response) {
			//         	if(!response.success){
			        		
			//         		switch(response.errorCode){
			// 					case "100":
			// 						$scope.cart.products[key].quantity = response.data.quantity;
			// 					break;
			//         		}

			//         	}
			//         });

			//         if($scope.cart.products[key].quantity==0){

			//         	delete $scope.cart.products[key];
			//         	$scope.cart.productslength = Object.keys($scope.cart.products).length;

			// 		}

			// 	}

			// )

		},1500)
		
	};

	$scope.remove = function(key,type){

		if(type=='qChilled'){
			alcoholCart.addItem(key,0,true);
		}else{
			alcoholCart.addItem(key,0,false);
		}
		
	};

  	
}]);

AlcoholDelivery.controller('PromotionsController',['$scope', '$rootScope', '$http', '$interval', 'alcoholCart', 'promotionsService',function($scope, $rootScope, $http, $interval, alcoholCart, promotionsService){

var timer = $interval(function() {
				
				if(!$rootScope.storeInitUP){
					$interval.cancel(timer);
				}
								
				$scope.alcoholCart = alcoholCart;				
				$scope._promo = promotionsService;

				
			}, 500);					

}])			

AlcoholDelivery.controller('CartSmokeController',['$scope','$rootScope','$state', '$interval','alcoholCart',function($scope, $rootScope, $state, $interval, alcoholCart){

	var timer = $interval(function() {
					
					if(!$rootScope.storeInitUP){
						$interval.cancel(timer);
					}

					$scope.alcoholCart = alcoholCart;

					$scope.smoke = alcoholCart.$cart.service.smoke;

				}, 500);

}])

AlcoholDelivery.controller('CartAddressController',['$scope','$rootScope','$state','$interval','$http','$q', '$mdDialog', '$mdMedia','alcoholCart','sweetAlert',function($scope, $rootScope, $state, $interval, $http, $q, $mdDialog, $mdMedia, alcoholCart, sweetAlert){

	$scope.errors = {};

	var timer = $interval(function() {
					
					if(!$rootScope.storeInitUP){
						$interval.cancel(timer);
					}				

					$scope.delivery = alcoholCart.$cart.delivery;

				}, 500);

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
				  $scope.restrictions="{country:'sg'}";
				  $scope.center = "[1.290270, 103.851959]";
				  $scope.zoom = 2;

				  $scope.placeChanged = function() {
				  	
				    $scope.address.place = this.getPlace();				    
				    var point = $scope.address.place.geometry.location;
				    $scope.map.setCenter(point);
				    
					$scope.map.setCenter(point);
					$scope.map.setZoom(16);
					$scope.marker.setMap(null);
    				$scope.marker = new google.maps.Marker({
							            position: point,
							            map: $scope.map,						            
							        });

				  }

				NgMap.getMap().then(function(map) {
				

					$scope.map = map;
					angular.map = $scope.map;

					setTimeout(function() {

						var point = new google.maps.LatLng(1.290270,103.851959);
						
						$scope.map.setCenter(point);
						$scope.map.setZoom(12);
						$scope.map.setOptions({draggable: false});

        				$scope.marker = new google.maps.Marker({
								            position: point,
								            map: $scope.map,						            
								        });

					}, 500);
					


				}); 			
				// Google map auto complete code ends //

				$scope.changeAddress = function(){

					setTimeout(function() {
						
					    var point = $scope.address.place.geometry.location;
					    $scope.map.setCenter(point);

						$scope.map.setZoom(12);
						$scope.map.setOptions({draggable: false});

        				$scope.marker = new google.maps.Marker({
								            position: point,
								            map: $scope.map,						            
								        });

					}, 100);

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

				$scope.address = $rootScope.addresses[key];
				$scope.update = true;
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

            }).then(
            	function(isConfirm) {
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
                }
            );
	};

	$scope.setSelectedAddress = function(key){
		
		$scope.$parent.cart.delivery.address = {};
		$scope.$parent.cart.delivery.address.key = key;
		$scope.$parent.cart.delivery.address.detail = $scope.addresses[key];

	}

	$scope.addressCheckout = function(){

		if($scope.delivery.address==="" || $scope.delivery.address===null){

			sweetAlert.swal({
					type:'error',
					title: "Please select an address",
					timer: 2000
				});
			return false;
		}
		if($scope.delivery.contact===""  || $scope.delivery.contact===null){
			
			$scope.errors.contact = "Please enter contact person number";
			
			return false;
		}

		alcoholCart.deployCart().then(

			function(response){

				if($scope.delivery.type==1){
					
					$scope.step = 3;
					$state.go("mainLayout.checkout.delivery");

				}else{

					$scope.step = 4;
					$state.go("mainLayout.checkout.payment");

				}

			}
		);
	
	}

}]);

AlcoholDelivery.controller('CartDeliveryController',['$scope','$rootScope','$state','$http','$q', '$mdDialog', '$mdMedia','$interval', 'alcoholCart', 'sweetAlert',function($scope, $rootScope, $state, $http, $q, $mdDialog, $mdMedia, $interval, alcoholCart, sweetAlert){

	if($scope.$parent.cart.delivery.type==0){
		$scope.step = 4;
		$state.go("mainLayout.checkout.payment");
	}


	var timer = $interval(function() {
				
				if(!$rootScope.storeInitUP){
					$interval.cancel(timer);
				}

				$scope.alcoholCart = alcoholCart;

				$scope.timeslot = alcoholCart.$cart.timeslot;

				$scope.localDate = new Date();

				if($scope.timeslot.slug){
					$scope.myDate = new Date($scope.timeslot.slug);
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
						
						alcoholCart.deployCart().then(
							function(result){
								$state.go("mainLayout.checkout.payment");
							}
						);

						

					}

				}

			}, 500);
	

	



}]);


AlcoholDelivery.controller('CartPaymentController',['$scope','$rootScope','$http','$q', '$mdDialog', '$mdMedia','CartSession','sweetAlert',function($scope, $rootScope, $http, $q, $mdDialog, $mdMedia, CartSession, sweetAlert){

}]);

AlcoholDelivery.controller('CartReviewController',['$scope','$rootScope','$http','$q','$state', '$mdDialog', '$mdMedia', '$interval', 'alcoholCart','sweetAlert',function($scope, $rootScope, $http, $q, $state, $mdDialog, $mdMedia, $interval, alcoholCart, sweetAlert){

	var timer = $interval(function() {
				
				if(!$rootScope.storeInitUP){
					$interval.cancel(timer);
				}

				$scope.alcoholCart = alcoholCart;

				$scope.cart = alcoholCart.$cart;

				$scope.address = alcoholCart.$cart.delivery.address;			

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

				var mili = $scope.cart.timeslot.datekey * 1000;
				$scope.myDate = new Date(mili);

				$scope.day = $scope.myDate.getDate();
				$scope.year = $scope.myDate.getFullYear();
				$scope.weekName = $scope.weeksName[$scope.myDate.getDay()];
				$scope.monthName = $scope.monthsName[$scope.myDate.getMonth()];

				$scope.daySlug = $scope.weekName+', '+$scope.day+' '+$scope.monthName+', '+$scope.year;
				$scope.slotslug = $scope.$parent.cart.timeslot.slotslug;


				$scope.orderConfirm = function(){

					alcoholCart.deployCart().then(
						function(result){
							var cartKey = alcoholCart.getCartKey();

					$http.put("confirmorder/"+cartKey, {} ,{		

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
					)

					


				}
			});

	

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
	$scope.AppController.showpackage = true;

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

AlcoholDelivery.controller('PackageDetailController', ['$scope', '$rootScope','$state','$http','$stateParams','$timeout','$anchorScroll','alcoholCart','sweetAlert', function($scope, $rootScope,$state,$http,$stateParams,$timeout,$anchorScroll,alcoholCart,sweetAlert){
	
	$scope.errors = [];
	
	$scope.processing = false;
	$scope.btnText = "ADD TO CART";

	$rootScope.appSettings.layout.pageRightbarExist = false;

	$rootScope.$on("$locationChangeSuccess", function(){
        $timeout(function() {
            $anchorScroll();
       });
    }); 

	$scope.AppController.category = "packages";
	$scope.AppController.subCategory = $stateParams.type;
	$scope.AppController.showpackage = true;

	$scope.packages = [];
	
	$http.get('/package/packagedetail/'+$stateParams.type+'/'+$stateParams.id).success(function(response){

		delete response.productlist;

		$scope.packages = response;
	});	

	$scope.expandCallback = function (index, id) {		
		/*$timeout(function() {
			$anchorScroll(id);
		});*/	    
	};

	//PARTY PACKAGE CUSTOMISATION FUNCTION 
	$scope.collapseCallback = function (index, id) {
		
		var totalseleted = 0;		
		var packageItems = angular.copy($scope.packages.packageItems[index]);
		var maxQuantity = parseInt(packageItems.quantity);
		var packageUpdate = true;
		var hasErrors = [];

		angular.forEach($scope.packages.packageItems, function(pkgItem, pkgKey) {
			
			var totalseleted = 0;
			var maxQuantity = parseInt(pkgItem.quantity);

			angular.forEach(pkgItem.products, function(value, key) {
				totalseleted+=parseInt(value.customizequantity);
			});

			if(totalseleted!=maxQuantity){
				$scope.errors[pkgKey] = 'You must select total of '+maxQuantity+' items.';				
				hasErrors[pkgKey] = 1;
			}else{
				$scope.errors[pkgKey] = '';
				hasErrors.splice(pkgKey,1);
			}		
			
		});

		if(hasErrors.length==0){
			//ADD IN CARTQUATITY IF THERE IS NO ERROR
			angular.forEach($scope.packages.packageItems[index].products, function(inPkgItem, inPkgKey) {
				
				$scope.packages.packageItems[index].products[inPkgKey].cartquantity = parseInt(inPkgItem.customizequantity);
				
			});
			$scope.updatePackage();
		}else{
			$scope.accordionA.toggle(index);
		}		
	};

	$scope.customizeCocktail = function(pkgKey, proKey){
		
		angular.forEach($scope.packages.packageItems[pkgKey].products, function(item, key) {
			if(key == proKey){
				item.cartquantity = 1;
			}else{
				item.cartquantity = 0;
			}	
		});
		$scope.updatePackage();
	};

	$scope.updatePackage = function(){

		var discountAmount = 0;
		var originalAmount = 0;
		angular.forEach($scope.packages.packageItems, function(pkgItem, pkgkey) {
			var lineofproductadded = [];
			angular.forEach(pkgItem.products, function(value, key) {
				var quantityadded = parseInt(value.cartquantity);
				if(quantityadded > 0)
					lineofproductadded.push(quantityadded+' x '+value.name);

				discountAmount += parseFloat(value.cprice)*parseInt(quantityadded);
				originalAmount += parseFloat(value.sprice)*parseInt(quantityadded);
			});			
			$scope.packages.packageItems[pkgkey].selectedProducts = lineofproductadded.join(', ');	
		});			
		$scope.packages.packagePrice = discountAmount.toFixed(2);
		$scope.packages.packageSavings = parseFloat(originalAmount-discountAmount).toFixed(2);
		
	}

	$scope.addPackage = function(){
		
		$scope.processing = true;

		alcoholCart.addPackage($stateParams.id,$scope.packages).then(function(response) {
						
						if(response.success){
							
							$scope.packages.unique = response.key;
							$scope.processing = false;
							$scope.btnText = "UPDATE CART";

						}

					}, function(error) {

						console.error(error);
						$scope.processing = false;

					});
			

	}	

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

AlcoholDelivery.controller('SearchController', [
	'$timeout', '$q', '$log', '$http', '$state', '$scope', '$rootScope', '$timeout', '$anchorScroll', '$stateParams', 'Search',
	function($timeout, $q, $log, $http, $state, $scope, $rootScope, $timeout, $anchorScroll, $stateParams, Search){

		$scope.AppController.category = "";
		$scope.AppController.subCategory = "";
		$scope.AppController.showpackage = false;

		$timeout(function() {
			$anchorScroll();
		});	
		
		$rootScope.appSettings.layout.pageRightbarExist = true;

		var self = this;
	    self.simulateQuery = true;
	    self.isDisabled    = false;
	    // list of `state` value/display objects
	    
	    self.querySearch   = querySearch;
	    self.selectedItemChange = selectedItemChange;
	    self.searchTextChange   = searchTextChange;
	    self.submitQuery   = submitQuery;
    
    
    // ******************************
    // Internal methods
    // ******************************
    /**
     * Search for states... use $timeout to simulate
     * remote dataservice call.
     */
    function querySearch (query) {
		return $http.get('/site/search/' + query).then(function(result){
		    return result.data;
		});
    }
    function searchTextChange(text) {
      //$log.info('Text changed to ' + text);
    }
    function selectedItemChange(item) {      				      	
		if(item){
			$state.go('mainLayout.product',{product:item._id});      	
			self.searchText = '';
			$timeout(function() {
				$anchorScroll();
			});      	
		    $scope.searchbar(0);
		}	    
    }

    function submitQuery(){
    	if(self.searchText!=''){
    		$log.info(self.searchText);
			var autoChild = document.getElementById('Auto').firstElementChild;
		    var el = angular.element(autoChild);
		    el.scope().$mdAutocompleteCtrl.hidden = true;    		
    		$state.go('mainLayout.search',{keyword:self.searchText});
    	}
    	return false;
    }

    $scope.searchbar = function(toggle){
		if(toggle){
			$(".searchtop").addClass("searchtop100").removeClass("again21");			
			$(".search_close").addClass("search_close_opaque");		
			$(".logoss").addClass("leftminusopacity leftminus100").removeClass("again0left againopacity");
			$(".homecallus_cover").addClass("leftminus2100").removeClass("again0left");
			$(".signuplogin_cover").addClass("rightminus100").removeClass("again0right");	

			if($.trim($(".searchtop input").val())=="")
				$(".searchtop input").focus();
		}else{
			$(".searchtop").removeClass("searchtop100").addClass("again21");			
			$(".search_close").removeClass("search_close_opaque");		
			$(".logoss").removeClass("leftminusopacity leftminus100").addClass("again0left againopacity");
			$(".homecallus_cover").removeClass("leftminus2100").addClass("again0left");
			$(".signuplogin_cover").removeClass("rightminus100").addClass("again0right");
		}
	}

	if($stateParams.keyword){
    	if($stateParams.keyword!=''){
    		$scope.keyword = $stateParams.keyword;
    		$scope.filter = $stateParams.filter;
    		$scope.sortby = $stateParams.sort;
			$scope.products = new Search($stateParams.keyword,$stateParams.filter,$stateParams.sort);						
    	}
    }

}]);

AlcoholDelivery.factory('Search', function($http) {
  var Search = function(keyword,filter,sortby) {
    this.items = [];
    this.busy = false;
    this.skip = 0;
    this.keyword = keyword;
    this.take = 20;
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
    		keyword:this.keyword,
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

AlcoholDelivery.controller('InviteController', ['$scope', '$rootScope','$state','$http','$stateParams','$timeout','$anchorScroll', function($scope, $rootScope,$state,$http,$stateParams,$timeout,$anchorScroll){

	$timeout(function() {
		$anchorScroll();
	});

	$scope.errors = [];

	$scope.sendinvitation = function(){
		$http.post('/user/inviteusers',$scope.invite).success(function(res){
			$scope.errors = [];
			$scope.invite = res;
		}).error(function(data, status, headers){
			$scope.errors = data;	
		});
	}

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
														'js/js_init_scripts.js',
														
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
								$scope.AppController.category = "";
								$scope.AppController.subCategory = "";
								$scope.AppController.showpackage = false;
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
									$('#reset').modal('show');
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
AlcoholDelivery.run(["$rootScope", "appSettings", "alcoholCart", "store", "alcoholWishlist", "CartSession","catPricing","UserService", "$state", "$http", "$window","$mdToast",
			 function($rootScope, settings, alcoholCart, store, alcoholWishlist, CartSession, catPricing, UserService, $state, $http, $window, $mdToast) {

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


    // Cart synchronization
	$rootScope.$on('alcoholCart:change', function(){
				
		//alcoholCart.$save();

	});

	$rootScope.$on('alcoholWishlist:itemRemoved', function(product){

		$rootScope.showSimpleToast("Removed from wishlist !");

	});

	

	store.init();
	alcoholWishlist.init();



	// CartSession.GetDeliveryKey().then(

	// 	function(response){

	// 		$http.get("cart/"+response.deliverykey+"/").then(

	// 			function successCallback(successRes){
	// 				console.log("asdasd");
	// 				console.log(successRes);

	// 				// if(response.status==200){
						
	// 				// 	alcoholCart.$restore(response.data);

	// 				// }else{

	// 				// 	alcoholCart.init();
	// 				// 	alcoholCart.setServices();

	// 				// }
					
	// 			},

	// 			function errorCallback(errorRes){
	// 				if(errorRes.status===400){

	// 					alcoholCart.empty();
	// 					window.location = window.location;

	// 				}
	// 			}

	// 		)
	// 	}

	// )


}]);

