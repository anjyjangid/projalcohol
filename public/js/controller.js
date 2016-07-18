AlcoholDelivery.controller('AppController', 
	['$scope', '$rootScope','$http', "$mdToast", "categoriesFac", "$mdDialog",
	function($scope, $rootScope,$http,$mdToast,categoriesFac, $mdDialog) {

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

    $http.get("/super/category/",{params: {withCount:true}}).success(function(response){

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
    // Toast settings

		// var last = {
		// 	bottom: false,
		// 	top: true,
		// 	left: false,
		// 	right: true
		// };

		// $scope.toastPosition = angular.extend({},last);

		// $scope.getToastPosition = function() {

		// 	sanitizePosition();
		// 	return Object.keys($scope.toastPosition)
		// 		.filter(function(pos) { return $scope.toastPosition[pos]; })
		// 		.join(' ');

		// };

		// function sanitizePosition() {
		// 	var current = $scope.toastPosition;
		// 	if ( current.bottom && last.top ) current.top = false;
		// 	if ( current.top && last.bottom ) current.bottom = false;
		// 	if ( current.right && last.left ) current.left = false;
		// 	if ( current.left && last.right ) current.right = false;
		// 	last = angular.extend({},current);
		// }

		// $rootScope.showSimpleToast = function(msg) {
		// 	$mdToast.show(
		// 	$mdToast.simple()
		// 		.textContent(msg)
		// 		.position($scope.getToastPosition())
		// 		.hideDelay(300000)
		// 	);
		// };

    // Toast Settings

    $scope.giftPopup = function(ev) {
	    $mdDialog.show(
	    	{
				controller: function($scope, $rootScope,$mdDialog, $http) {					
					$scope.giftcategories = {
						types:[]
					};
					$scope.processinggift = true;

					$http.get('/giftcategory').success(function(result){
						$scope.giftcategories.types = result;
						
						$scope.processinggift = false;
					}).error(function(){
						$scope.processinggift = false;
					});

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

	if(typeof $stateParams.toggle==="undefined"){$stateParams.toggle="all";}

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

		}else{
		
			if($scope.product.chilled){
				$scope.product.qChilled = 1;
			}else{
				$scope.product.qNChilled = 1;
			}
			

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
			$scope.isInCart = true;
		};


	 }, function(response) {
	 	$scope.product = false;
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
		controller: function($scope, $rootScope, $mdDialog, NgMap, $document) {

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

	$scope.alcoholWishlist.init();  

}]);

AlcoholDelivery.controller('LoyaltyController',['$scope','$http','sweetAlert','$timeout',function($scope,$http,sweetAlert,$timeout){

	$scope.pagination = {

		start : 0,
		limit : 1,

	}

	$scope.prev = function(){
		
		if($scope.pagination.start==0){
			return;
		}
		$scope.pagination.start--;

	}
	$scope.next = function(){

		$scope.pagination.start++;

	}

		

	$scope.getLoyalty = function(){

		$scope.process = {
			fetching:true
		};


		$http.get("loyalty",{params: $scope.pagination}).then(

			function(response){

				$scope.loyalty = response.data;

				$http.get("loyalty/statics").then(

					function(statRes){

						$scope.statics = statRes.data;

					},
					function(errStatRes){

					}
				);

			},function(errRes){

				console.log(errRes);

			}

		).finally(function(){

			$timeout(function(){
				
				$scope.process.fetching = false;

			},1000)
			
		});

	}

	$scope.$watch('pagination',
		function(newValue, oldValue) {

			$scope.getLoyalty();

		},true
	);

}]);

AlcoholDelivery.controller('CreditsController',['$scope','$http','sweetAlert',function($scope,$http,sweetAlert){}]);


AlcoholDelivery.controller('CartController',['$scope','$rootScope','$state','$http','$q', '$mdDialog', '$mdMedia','$timeout','UserService','sweetAlert','alcoholCart','store',function($scope, $rootScope, $state, $http, $q, $mdDialog, $mdMedia, $timeout, UserService, sweetAlert, alcoholCart,store){

	$rootScope.storeInitUP = true;
	
	store.init().then(

		function(result) {

			$scope.alcoholCart = alcoholCart;

			angular.alcoholCart = alcoholCart;

			$scope.cart = alcoholCart.$cart;

			$rootScope.storeInitUP = false;

		}
	);

	

	$scope.smoke = {

		status:false,
		detail:""
	}

	$scope.payment = {
		type:"cod",
	}

	$scope.step = 1;

	$scope.checkout = function() {

		isCartValid = alcoholCart.validate($scope.step);

		UserService.GetUser().then(

			function(result){

				if(result.auth===false){

					$('#login').modal('show');

				}else{

					alcoholCart.deployCart();

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
			controller: function($scope, $rootScope, $mdDialog, NgMap, $document) {

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

					if(typeof $scope.marker!=="undefined")
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

                                	if($scope.delivery.address.key===key){
                                		$scope.delivery.address = null;
                                	}

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

		$scope.delivery.address = {};
		$scope.delivery.address.key = key;
		$scope.delivery.address.detail = $scope.addresses[key];

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

		$scope.delivery.contact = parseInt($scope.delivery.contact);

		if($scope.delivery.contact===""  || $scope.delivery.contact===null || isNaN($scope.delivery.contact)){

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

		if($state.previous.state.controller==="CartPaymentController"){
			$scope.step = 2;
			$state.go("mainLayout.checkout.address");
		}else{
			$scope.step = 4;
			$state.go("mainLayout.checkout.payment");
		}
		
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


				$scope.setSlot = function(dateKey,slotKey){				

					if(!$scope.isSlotAvailable(dateKey,slotKey)){						
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
				
				$scope.isSlotAvailable = function(dateKey,slotKey){

					for(key in $scope.timeslots){
						var slot = $scope.timeslots[key];

						if(slot.datekey == dateKey){
							
							if(slot.status==0){
								return false;
							}

							for(currSlotKey in slot.slots){
								if(currSlotKey==slotKey && slot.slots[currSlotKey].status==0){
									return false;
								}
							}

						}

					}

					return true;

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

AlcoholDelivery.controller('CartPaymentController',['$scope','$rootScope','$http','$q', '$mdDialog', '$mdMedia','sweetAlert',function($scope, $rootScope, $http, $q, $mdDialog, $mdMedia, sweetAlert){

}]);

AlcoholDelivery.controller('CartReviewController',['$scope','$rootScope','$http','$q','$state', '$mdDialog', '$mdMedia', '$interval', 'alcoholCart','store','sweetAlert',function($scope, $rootScope, $http, $q, $state, $mdDialog, $mdMedia, $interval, alcoholCart, store, sweetAlert){

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

					alcoholCart.freezCart().then(

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

					            store.orderPlaced();

					            $state.go('orderplaced',{order:response.order},{reload: false, location: 'replace'});

					        })
						},
						function(errorRes){
							console.log(errorRes);
						}

					)

				}
			});
}]);

AlcoholDelivery.controller('OrderplacedController',['$scope','$http','$stateParams','sweetAlert','SocialSharingService',function($scope,$http,$stateParams,sweetAlert,SocialSharingService){

	$scope.order = $stateParams.order;

	$http.get("order/summary/"+$scope.order).success(function(response){
    	$scope.order = response;

    	$scope.orderNumber = $scope.order.reference;

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

		if($scope.order.timeslot.datekey!==false){
			
			var mili = $scope.order.timeslot.datekey * 1000;

		}else{

			var mili = $scope.order.dop * 1000;

		}
		

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

		$scope.hour = $scope.dopDate.getHours() % 12 || 12;
		$scope.minute = $scope.dopDate.getMinutes();
		$scope.aMpM = $scope.dopDate.getHours() > 12 ? 'PM' : 'AM';


    });  

angular.SocialSharing = SocialSharingService;

    $scope.fbShare = function(){

		SocialSharingService.shareFb({

			key:$scope.orderNumber,
			type:'order',

		}).then(

			function(resolveRes){

				sweetAlert.swal({

					title: "Awesome!",
					text: "Share successfully! Loyalty points are credit to your account",
					imageUrl: 'http://54.169.107.156/images/thumbimg.png'

				});
				
			},
			function(rejectRes){

				sweetAlert.swal({

					type:'error',
					title: 'Oops...',
					text:rejectRes.message,
					timer: 2000

				});

			}
		)

    }

    $scope.googleShare = function(){

		SocialSharingService.shareGoogle({

			key:$scope.orderNumber,
			type:'order',

		}).then(

			function(resolveRes){

				sweetAlert.swal({

					title: "Awesome!",
					text: "Share successfully! Loyalty points are credit to your account",
					imageUrl: 'http://54.169.107.156/images/thumbimg.png'

				});
				
			},
			function(rejectRes){

				sweetAlert.swal({

					type:'error',
					title: 'Oops...',
					text:rejectRes.message,
					timer: 2000

				});

			}
		)

    }
    

}]);

AlcoholDelivery.controller('RepeatOrderController',['$scope','$rootScope','$http','$mdDialog','UserService','alcoholCart','sweetAlert',function($scope,$rootScope,$http,$mdDialog,UserService,alcoholCart,sweetAlert){

	$scope.user = UserService.currentUser;	
	$scope.lastorder = {};

	$scope.$watch('user',

		function(newValue, oldValue) {
			
			if(UserService.currentUser === null || typeof UserService.currentUser._id === 'undefined'){

				console.log("Repeat order cannot initialized");
				return false;

			}

			$scope.fetching = true;

			$scope.repeatOrderInit();

		},true
	);

	$scope.repeatOrderInit = function(){
	
		$http.get("user/lastorder").then(

			function(response){
				
				$scope.lastorder = response.data.order;
				$scope.fetching = false;
			},
			function(errorRes){

			}
		)

	}

	$scope.repeatOrder = function(ev) {

		$mdDialog.show({

			controller: "ShopFromPreviousController",
			templateUrl: '/templates/users/repeat-order.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose:false

		})
		.then(function(answer) {

		}, function() {

		});

	};

	$scope.shopFromPrevious = function(ev){
		
		$mdDialog.show({

			controller: "ShopFromPreviousController",
			templateUrl: '/templates/users/shopFromPrevious.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose:false

		})
		.then(function(answer) {

		}, function() {

		});

	}

	$scope.addSelected = function(){

		var selected = {
			products : []
		};
		angular.forEach($scope.lastorder.products, function(product) {

			if(product.selected){
				var selPro = {
					id : product.original._id,
					quantity : 1,
					chilled : product.lastServedChilled
				};

				selected.products.push(selPro);
			}		

		})

		if(selected.products.length){

			$scope.processAdding = true;

			alcoholCart.addBulk(selected).then(
				
				function(response){
					$rootScope.$broadcast('alcoholCart:updated',{msg:"Previous order products added to cart"});
				},
				function(errorRes){

					sweetAlert.swal({
						type:'error',
						title: 'Oops...',
						text:'Something went wrong',
						timer: 2000
					});

				}

			).finally(function(){

				$scope.processAdding = false;

			});

		}else{

			sweetAlert.swal({
				type:'error',
				title: 'Oops...',
				text:'Please select a product to add',
				timer: 2000
			});

		}

	}

}]);

AlcoholDelivery.controller('ShopFromPreviousController',['$scope','$rootScope','$http','$mdDialog','$timeout','alcoholCart','sweetAlert',function($scope,$rootScope,$http,$mdDialog,$timeout,alcoholCart,sweetAlert){

	$scope.orders = {};
	$scope.order = {};
	$scope.fetchingOrders = true;
	$scope.fetchingOrder = true;
	$scope.viewDetail = false;

	$http.get("order/orders").then(

		function(response){
			
			$scope.orders = response.data;

			$timeout(function(){
				$scope.fetchingOrders = false;
			},1000);

		},
		function(errorRes){

		}

	);

	$scope.repeatOrderConfirmed = function(){

		$scope.processAdding = true;
		
		alcoholCart.repeatLastOrder().then(
			
			function(response){
				
				$rootScope.$broadcast('alcoholCart:updated',{msg:"Your last order is added to cart"});

			},
			function(errorRes){

				sweetAlert.swal({
					type:'error',
					title: 'Oops...',
					text:'Something went wrong',
					timer: 2000
				});

			}

		).finally(function(){

			$scope.close();			

		});

	

	}

	$scope.previousOrder = function(reference,ev){

		$scope.viewDetail = true;
		$scope.fetchingOrder = true;

		$http.get("user/lastorder/"+reference).then(
		
			function(response){
				
				$scope.order = response.data.order;
				$timeout(function(){
					$scope.fetchingOrder = false;	
				},1500);
			},
			function(errorRes){

			}
		)

	}

	$scope.viewHistory = function(){

		$scope.viewDetail = false;

	}

	$scope.addToBasket = function(){

		$scope.processAdding = true;

		var selected = {
			products : []
		};

		angular.forEach($scope.order.products, function(product) {

			if(product.selected){
				var selPro = {
					id : product.original._id,
					quantity : product.quantity,
					chilled : product.lastServedChilled
				};

				selected.products.push(selPro);
			}		

		})

		if(selected.products.length){

			alcoholCart.addBulk(selected).then(
				
				function(response){
					
					$rootScope.$broadcast('alcoholCart:updated',{msg:"Previous order products added to cart"});

				},
				function(errorRes){

					sweetAlert.swal({
						type:'error',
						title: 'Oops...',
						text:'Something went wrong',
						timer: 2000
					});

				}

			).finally(function(){

				$scope.close();			

			});

		}else{

			sweetAlert.swal({
				type:'error',
				title: 'Oops...',
				text:'Please select a product to add',
				timer: 2000
			});
			$scope.processAdding = false;

		}

	}

	$scope.close = function(){

		$scope.processAdding = false;
		$scope.viewDetail = false;

		$mdDialog.hide();

	}

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

AlcoholDelivery.controller('PackageDetailController', 
	['$q','$scope', '$rootScope','$state','$http','$stateParams','$timeout','$anchorScroll','alcoholCart','sweetAlert', 
	function($q, $scope, $rootScope,$state,$http,$stateParams,$timeout,$anchorScroll,alcoholCart,sweetAlert){

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
	$scope.hasErrors = false;
	//PARTY PACKAGE CUSTOMISATION FUNCTION
	$scope.collapseCallback = function (index, id) {

		var totalseleted = 0;
		var packageItems = angular.copy($scope.packages.packageItems[index]);
		var maxQuantity = parseInt(packageItems.quantity);
		var packageUpdate = true;		

		var outerloopPromises = angular.forEach($scope.packages.packageItems, function(pkgItem, pkgKey) {
			
			var totalseleted = 0;
			var maxQuantity = parseInt(pkgItem.quantity);			

			angular.forEach(pkgItem.products, function(value, key) {								
				totalseleted+=parseInt(value.customizequantity);				
			});
				
			if(totalseleted!=maxQuantity){
				$scope.errors[pkgKey] = 'You must select total of '+maxQuantity+' items.';				
			}else{
				delete $scope.errors[pkgKey];
			}

		});

		
		if(typeof $scope.errors[index] == 'undefined'){
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
		var c = Object.keys($scope.errors).length;
		if(c!=0){
			alert('Please verify your selection.');
			return;
		}

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

	$scope.validateByIndex = function(index){
		var totalseleted = 0;
		var packageItems = angular.copy($scope.packages.packageItems[index]);
		var maxQuantity = parseInt(packageItems.quantity);
		var packageUpdate = true;
		
		var apromise = angular.forEach($scope.packages.packageItems, function(pkgItem, pkgKey) {

			var totalseleted = 0;
			var maxQuantity = parseInt(pkgItem.quantity);

			angular.forEach(pkgItem.products, function(value, key) {
				totalseleted+=parseInt(value.customizequantity);
			});

			if(totalseleted!=maxQuantity){
				$scope.errors[pkgKey] = 'You must select total of '+maxQuantity+' items.';				
			}else{
				delete $scope.errors[pkgKey];				
			}

		});
		
		if(typeof $scope.errors[index] == 'undefined'){
			//ADD IN CARTQUATITY IF THERE IS NO ERROR
			
			angular.forEach($scope.packages.packageItems[index].products, function(inPkgItem, inPkgKey) {

				$scope.packages.packageItems[index].products[inPkgKey].cartquantity = parseInt(inPkgItem.customizequantity);

			});
			$scope.updatePackage();
		}
	}	

}]);

AlcoholDelivery.controller('SearchController', [
	'$timeout', '$q', '$log', '$http', '$state', '$scope', '$rootScope', '$timeout', '$anchorScroll', '$stateParams', 'ScrollPaging',
	function($timeout, $q, $log, $http, $state, $scope, $rootScope, $timeout, $anchorScroll, $stateParams, ScrollPaging){

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
			$state.go('mainLayout.product',{product:item.slug});
			self.searchText = '';
			$timeout(function() {
				$anchorScroll();
			});
		    $scope.openSearch = false;
		    $scope.searchbar(0);
		}
    }

    function submitQuery(){
    	if(self.searchText!=''){
    		//$log.info(self.searchText);
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
			$(".rightplcholder").removeClass('hide');


			if($.trim($(".searchtop input").val())=="")
				$(".searchtop input").focus();
		}else{
			$(".searchtop").removeClass("searchtop100").addClass("again21");
			$(".search_close").removeClass("search_close_opaque");
			$(".logoss").removeClass("leftminusopacity leftminus100").addClass("again0left againopacity");
			$(".homecallus_cover").removeClass("leftminus2100").addClass("again0left");
			$(".signuplogin_cover").removeClass("rightminus100").addClass("again0right");
			$(".rightplcholder").addClass('hide');
		}
	}

	if($stateParams.keyword){
    	if($stateParams.keyword!=''){
    		$scope.args = {
    			keyword:$stateParams.keyword,
    			filter:$stateParams.filter,
    			sortby:$stateParams.sort    			
    		}    		
    		$scope.url = '/site/searchlist';
			$scope.products = new ScrollPaging($scope.args,$scope.url);
    	}
    }

}]);

AlcoholDelivery.controller('LoyaltyStoreController', ['$q', '$http', '$scope', 'ScrollPagination',"UserService","$stateParams", function($q, $http, $scope, ScrollPagination,userService,$stateParams){
		
		var user = userService.currentUser;
		
		$scope.keyword = $stateParams.keyword;
		$scope.filter = $stateParams.filter;
		$scope.sortby = $stateParams.sort;

    	$scope.products = new ScrollPagination();

}]);

AlcoholDelivery.controller('InviteController', ['$scope', '$rootScope','$state','$http','$stateParams','$timeout','$anchorScroll','sweetAlert', function($scope, $rootScope,$state,$http,$stateParams,$timeout,$anchorScroll,sweetAlert){

	$timeout(function() {
		$anchorScroll();
	});

	$scope.errors = [];

	$scope.sendinvitation = function(){
		$http.post('/user/inviteusers',$scope.invite).success(function(res){
			$scope.errors = [];
			$scope.invite = res;
			

			sweetAlert.swal({
				type:'success',
				title: res.success,
				timer: 2000
			});

		}).error(function(data, status, headers){
			$scope.errors = data;
		});
	}

}]);

AlcoholDelivery.controller('GiftProductController', [
	'$q', '$http', '$scope', '$stateParams', 'ScrollPaging', '$state',
	function($q, $http, $scope, $stateParams,ScrollPaging,$state){
		
		
		$scope.subCategory = '';

		if($stateParams.type){
			$scope.subCategory = $stateParams.type;
		}

		$scope.AppController.category = 'gifts';
		$scope.AppController.subCategory = $scope.subCategory;
		$scope.AppController.showpackage = false;		
		
		$scope.args = {
			category:$stateParams.categorySlug,
			subcategory:$stateParams.type			
		}    		
		
		$scope.url = '/giftcategory/listproducts';

		$scope.giftproducts = new ScrollPaging($scope.args,$scope.url);

}]);

AlcoholDelivery.controller('GiftController', [
	'$q', '$http', '$scope', '$stateParams', '$rootScope','alcoholGifting',
	function($q, $http, $scope, $stateParams, $rootScope, alcoholGifting){
		$rootScope.appSettings.layout.pageRightbarExist = false;

		$scope.btnText = 'add to cart';
		$scope.processing = true;
		$scope.gift = {
			
		}

		if($stateParams.giftid){

			$http.get('/gift/'+$stateParams.giftid).success(function(result){
				
				$scope.gift = result;
				$scope.processing = false;
				angular.alcoholGifting = alcoholGifting;

				$scope.alcoholGifting = alcoholGifting;

				alcoholGifting.setCurrentGift(result);

				$scope.products = alcoholGifting.getProducts();

				$scope._inGift = [];			

				$scope.totalAttached = function(){

					var total = 0;

					angular.forEach($scope.products,function(value,key){
						total+=parseInt(value._inGift);
					});

					angular.forEach($scope.products,function(value,key){

						var maxQuantity = result.limit - total + value._inGift;
						value._maxQuantity = value._quantity>maxQuantity?maxQuantity:value._quantity;
					});
				}

				$scope.addGift = function(){

					$scope.processing = true;
					alcoholGifting.addUpdateGift().then(

						function(successRes){

						},
						function(errorRes){
							console.log(errorRes);
						}

					).finally(function(res){

						$scope.processing = false;

					});

				}

			}).error(function(err){

			});

		}

		$scope.childOwlOptions = {

			items 			  : 6,
			itemsDesktop      : [1199,4],
			itemsDesktopSmall : [979,4],
			itemsTablet       : [768,4],
			itemsMobile       : [479,4],
			pagination 		  : false,
			responsiveRefreshRate : 100,
		}

}]);

AlcoholDelivery.controller('GiftCardController', [
	'$q', '$http', '$scope', '$stateParams', '$rootScope', 'alcoholGifting',
	function($q, $http, $scope, $stateParams, $rootScope, alcoholGifting){
		
		$rootScope.appSettings.layout.pageRightbarExist = false;

		$scope.btnText = 'add to cart';

		$scope.processing = true;

		$scope.gift = {}

		$http.get('/giftcategory/giftcard')
			.success(function(result){
				
				$scope.gift = result;

				$scope.gift.recipient = {price:$scope.gift.cards[0].value,quantity:1};

				$scope.processing = false;

				$scope.addCard = function(){

					$scope.processing = true;

					alcoholGifting.addUpdateGiftCard($scope.gift).then(

						function(successRes){
												
						},
						function(errorRes){

							$scope.errors = errorRes.data;
							

						}

					).finally(function(res){

						$scope.processing = false;

					});

				}

			})
			.error(function(err){});


		
}]);		
