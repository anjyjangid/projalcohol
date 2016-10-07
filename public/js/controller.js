AlcoholDelivery.controller('AppController',
	['$scope', '$rootScope','$http', "$mdToast", "categoriesFac", "$mdDialog", "$filter",'ProductService',
	function($scope, $rootScope,$http,$mdToast,categoriesFac, $mdDialog, $filter, ProductService) {

	$rootScope.setMeta = function(meta){

		if(typeof meta.title == 'undefined') return;

		var title = $filter('ucwords')(meta.title)+ ' - '+$rootScope.settings.general.site_name;
		$rootScope.meta = {
        	title:title,
        	description:meta.description,
        	keyword:meta.keyword,
        }
	};

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


	categoriesFac.getCategories().then(

		function(response){

			categoriesFac.categories = response;
			$scope.categories = response;
			$scope.AppController.categories = response;
			$scope.parentCategories = [];

			$scope.parentChildcategory = {}

			for(key in $scope.categories){

				if(!$scope.categories[key].ancestors){

					$scope.parentCategories.push($scope.categories[key])

				}

			}
		},
		function(errorRes){}
	);

	/*$http.get("/super/category/",{params: {withCount:true}}).success(function(response){



	});*/

	$scope.featuredProducts = function(){

		// $http({

		// 	url: "/getproduct/",
		// 	method: "GET",
		// 	params: {
		// 		type:"featured",
		// 	}

		// })

		ProductService.getProducts({

			filter : 'featured',

		}).then(
			function(response){

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

	$scope.loadingmsg = false;

	$scope.$on('redirecting', function(event, data) {
		$scope.loadingmsg = data;
	});

	$scope.getLinks = function(section,pdata){
		if(typeof pdata == 'undefined') return [];

		return $filter('filter')($rootScope.settings.pages,{section:section});
	}

	//GLOBAL LOGIN FUNCTIONS

	$scope.$on("showLogin", function () {
        $scope.loginOpen();
    });

	$scope.loginOpen = function(ev){
	    $scope.login.errors = {};
	    $mdDialog.show({
			scope: $scope.$new(),
			controller: function(){},
			templateUrl: '/templates/partials/login.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose:true,
			fullscreen:true
		});
	}

	$scope.loginSubmit = function(){
		$scope.login.errors = {};
		$http.post('/auth',$scope.login).success(function(response){
			$scope.loginSuccess(response);
		}).error(function(data, status, headers) {
			$scope.login.errors = data;
        });
	};

}]);

AlcoholDelivery.controller('ProductsController', [
	'$scope', '$rootScope','$state','$http','$stateParams', '$filter', 'ProductService',
	function($scope, $rootScope,$state,$http,$stateParams, $filter, ProductService){

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
		});
	}else{
		$scope.categoriesList = $rootScope.categoriesList;
	}



	$scope.$watch('categoriesList',function(newValue,oldValue){

		if(newValue){
			var mdata = {
				title:newValue[0].metaTitle,
				description:newValue[0].metaDescription,
				keyword:newValue[0].metaKeywords
			};

			if(typeof $stateParams.subcategorySlug!=='undefined'){
				var child = $filter('filter')(newValue[0].children,{slug:$stateParams.subcategorySlug});
				if(typeof child[0] !== 'undefined'){
					mdata = {
						title:child[0].metaTitle,
						description:child[0].metaDescription,
						keyword:child[0].metaKeywords
					};
				}
			}

			$rootScope.setMeta(mdata);
		}

	});



	$scope.fetchproducts = function(){

		// $http.get("/search", config)

		ProductService.getProducts({

			parent:$category,
			filter : $stateParams.toggle,
			sort: $stateParams.sort,

		}).then(function(response) {

		   $scope.products = response;

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

AlcoholDelivery.controller('ProductDetailController', [
			'$scope', '$rootScope','$state','$http','$stateParams','alcoholCart','ProductService',
	function($scope, $rootScope,$state,$http,$stateParams,alcoholCart,ProductService){

	$rootScope.appSettings.layout.pageRightbarExist = false;

	$scope.ProductDetailController = {};

	if(typeof $stateParams.loyalty === 'undefined'){

		$scope.viaLoyaltyStore = false;

	}else{

		$scope.viaLoyaltyStore = true;

	}

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

	ProductService.getProduct({product:$stateParams.product}).then(

		function(response){

			$scope.product = response;

			$scope.$watchGroup(['product.qNChilled','product.qChilled','maxQuantity'],
				function(newValue, oldValue) {

					$scope.updateQuantity();

				},true
			);

			$scope.updateQuantity = function(){

				$scope.tquantity = parseInt($scope.product.qNChilled)+parseInt($scope.product.qChilled);

			}

			$scope.addtocart = function(){

				var quantity = {
					chilled : parseInt($scope.product.qChilled),
					nonChilled : parseInt($scope.product.qNChilled)
				}
				alcoholCart.addItem($scope.product._id,quantity,$scope.product.servechilled).then(
					function(response){
						$scope.isInCart = true;
					}
				);
				//alcoholCart.addItem($scope.product._id,$scope.product.qNChilled,false);


			};

			var mdata = {
	    		title:$scope.product.metaTitle,
	    		description:$scope.product.metaDescription,
	    		keyword:$scope.product.metaKeywords
	    	};

	    	$rootScope.setMeta(mdata);

		},
		function(errRes){
			$scope.product = false;
		}
	);

	// $http.get("/getproductdetail", config).then(function(response) {

	// 	$scope.product = $scope.setPrices(response.data);

	// 	var isInCart = alcoholCart.getProductById($scope.product._id);

	// 	$scope.product.qChilled = 0;
	// 	$scope.product.qNChilled = 0;

	// 	$scope.product.servechilled=$scope.product.chilled;

	// 	if(isInCart!==false){

	// 		$scope.isInCart = true;
	// 		$scope.product.qChilled = isInCart.getRQuantity('chilled');
	// 		$scope.product.qNChilled = isInCart.getRQuantity('nonchilled');
	// 		$scope.product.servechilled = isInCart.getLastServedAs();

	// 	}else{

	// 		if($scope.product.chilled){
	// 			$scope.product.qChilled = 1;
	// 		}else{
	// 			$scope.product.qNChilled = 1;
	// 		}


	// 	}

	// 	$scope.maxQuantity = $scope.product.quantity;

	// 	var available = $scope.maxQuantity-$scope.product.qNChilled+$scope.product.qChilled;

	// 	if(available<0){

	// 		$scope.overQunatity = true;
	// 		$scope.product.qNChilled = $scope.product.qNChilled + available;

	// 	}

	// 	var available = $scope.maxQuantity-$scope.product.qNChilled+$scope.product.qChilled;

	// 	if(available<0){

	// 		$scope.product.qChilled = $scope.product.qChilled + available;

	// 	}

	// 	$scope.$watchGroup(['product.qNChilled','product.qChilled','maxQuantity'],
	// 				function(newValue, oldValue) {

	// 					$scope.updateQuantity();

	// 				},true
	// 			);

	// 	$scope.updateQuantity = function(){

	// 		$scope.product.chilledMaxQuantity = $scope.maxQuantity - $scope.product.qNChilled;
	// 		$scope.product.nonChilledMaxQuantity = $scope.maxQuantity - $scope.product.qChilled;
	// 		$scope.tquantity = parseInt($scope.product.qNChilled)+parseInt($scope.product.qChilled);

	// 	}

	// 	$scope.addtocart = function(){

	// 		alcoholCart.addItem($scope.product._id,$scope.product.qChilled,true);
	// 		alcoholCart.addItem($scope.product._id,$scope.product.qNChilled,false);
	// 		$scope.isInCart = true;
	// 	};

	// 	var mdata = {
 //    		title:$scope.product.metaTitle,
 //    		description:$scope.product.metaDescription,
 //    		keyword:$scope.product.metaKeywords
 //    	};

 //    	$rootScope.setMeta(mdata);


	//  }, function(response) {
	//  	$scope.product = false;
	// });

}]);

AlcoholDelivery.controller('AlsoBoughtThisController',[
			'$scope', '$http', '$stateParams', 'ProductService',
	function($scope, $http, $stateParams, ProductService){

	//$http.get("/product/alsobought/"+$stateParams.product)
	ProductService.getAlsoBought($stateParams.product).then(

		function(products){
			$scope.suggestions = products;
		},
		function(errResponse){}

	);

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

	if(UserService.getIfUser())
		$scope.currentPasswordHide = UserService.getIfUser().loginfb;

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

AlcoholDelivery.controller('OrdersController',['$scope','$rootScope','$state','$http','sweetAlert','UserService'
, function($scope,$rootScope,$state,$http,sweetAlert,UserService){


	$scope.orders = [];

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

	$scope.setRating = function(order) {
		if(!order.rate || order.rate<1) return;

		$http.post('order/'+order._id.$id, {rate: order.rate})
		.then(function(res){
			order.rate = res.data;
		})
		.catch(function(err) {
			order.rate = null;
		})
	}

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

AlcoholDelivery.controller('WishlistController',['$scope','$rootScope','$state','$stateParams','$http','sweetAlert','UserService','alcoholCart','alcoholWishlist',function($scope,$rootScope,$state,$stateParams,$http,sweetAlert,UserService,alcoholCart,alcoholWishlist){

	$scope.page = 0;

	$scope.alcoholCart = alcoholCart;

	$scope.alcoholWishlist = alcoholWishlist;

	$scope.alcoholWishlist.init();

}]);

AlcoholDelivery.controller('LoyaltyController',['$scope','$http','sweetAlert','$timeout',function($scope,$http,sweetAlert,$timeout){

	$scope.pagination = {

		start : 0,
		limit : 10,

	}

	$scope.prev = function(){

		if($scope.pagination.start==0){
			return;
		}
		$scope.pagination.start-=$scope.pagination.limit;
	}

	$scope.next = function(){

		if($scope.loyaltyMore)
			$scope.pagination.start+=$scope.pagination.limit;

	}


	$scope.getLoyalty = function(){

		$scope.process = {
			fetching:true
		};


		$http.get("loyalty",{params: $scope.pagination}).then(

			function(response){

				$scope.loyalty = response.data.data;

				$scope.loyaltyMore = response.data.more;

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

AlcoholDelivery.controller('CreditsController',['$scope','$http','sweetAlert','$timeout',function($scope,$http,sweetAlert,$timeout){

	$scope.pagination = {

		start : 0,
		limit : 1,
		count : 0

	}

angular.pagination = $scope.pagination;

	$scope.prev = function(){

		if($scope.pagination.start==0){
			return;
		}
		$scope.pagination.start--;

	}
	$scope.next = function(){

		if($scope.pagination.count<=(($scope.pagination.start+1) * $scope.pagination.limit)){
			return false;
		}

		$scope.pagination.start++;

	}

	$scope.getCredits = function(){

		$scope.process = {
			fetching:true
		};


		$http.get("credits",{params: $scope.pagination}).then(

			function(response){

				$scope.pagination.count = response.data.count;

				$scope.credits = response.data.credits;

				$http.get("credits/statics").then(

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

			$scope.getCredits();

		},true
	);

}]);




AlcoholDelivery.controller('CartController',['$scope','$rootScope','$state','$http','$q', '$mdDialog', '$mdMedia','$timeout','UserService','sweetAlert','alcoholCart','alcoholGifting','store',function($scope, $rootScope, $state, $http, $q, $mdDialog, $mdMedia, $timeout, UserService, sweetAlert, alcoholCart, alcoholGifting, store){

	$scope.alcoholCart = alcoholCart;

	$scope.alcoholGifting = alcoholGifting;

	angular.alcoholCart = alcoholCart;

	$scope.cart = alcoholCart.$cart;

	$scope.smoke = {

		status:false,
		detail:""
	}

	$scope.payment = {

		type:"cod",
		savecard:true
	}

	$scope.step = 1;

	$scope.checkout = function(ev) {

		isCartValid = alcoholCart.validate($scope.step);

		if(!UserService.getIfUser())
			return $('#login').modal('show');


		$mdDialog.show({

			controller: function($scope, $rootScope, $document, ProductService) {

				$scope.address = {
					step:1
				}

				$scope.hide = function() {
					$mdDialog.hide();
				};
				$scope.cancel = function() {
					$mdDialog.cancel();
				};


				$scope.loading = true;
				//$http.get("suggestion/dontmiss")

				ProductService.getDontMiss().then(

					function(response){

						if(response.length==0){

							$scope.notAvailable = true;
							$timeout(function(){

								$scope.continue();


							},1500)

						}else{

							$scope.products = response;

						}

						$scope.loading = false;

					},
					function(errorRes){


					}
				)

				$scope.continue = function(){


					alcoholCart.deployCart();

					$scope.step = 2;

					$scope.hide();

					$state.go("mainLayout.checkout.address");

				}

				$scope.loadMore = function(dir){
					var owl = $('.dontmissowl').data('owlCarousel');
					if(dir)
						owl.prev();
					else
						owl.next();
				}
			},
			templateUrl: '/templates/checkout/dont-miss.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose:true
		})
		.then(function(answer) {

		}, function() {

		});
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

	$scope.addtocart = function(key,type,direction){

		var proObj = $scope.cart.products[key];

		if(typeof $scope.proUpdateTimeOut!=="undefined"){
			$timeout.cancel($scope.proUpdateTimeOut);
		}

		$scope.proUpdateTimeOut = $timeout(function(){

			var quantity = {
				chilled : parseInt(proObj.qChilled),
				nonChilled : parseInt(proObj.qNChilled)
			}
			alcoholCart.addItem(key,quantity,proObj.servedAs).then(
				function(response){
					$scope.isInCart = true;
				},
				function(errRes){

				}

			);

		},1500)

	};

	$scope.remove = function(key,type){

		if(type=='qChilled'){
			alcoholCart.addItem(key,0,true);
		}else{
			alcoholCart.addItem(key,0,false);
		}

	};

	$scope.removeSale = function(saleObj){

		var id = saleObj.getId();
		id = id.$id;

		alcoholCart.removeSale(id).then(

			function(response){

			},
			function(errRes){

			}
		);

	}

	$scope.updateGiftCard = function(uid){

		alcoholGifting.updateGiftCard(uid);

	}



}]);

AlcoholDelivery.controller('PromotionsController',['$scope', '$rootScope', '$http', '$interval', 'alcoholCart', 'promotionsService', 'AlcoholProduct',function($scope, $rootScope, $http, $interval, alcoholCart, promotionsService, AlcoholProduct){

	$scope.alcoholCart = alcoholCart;
	$scope._promo = promotionsService;

	angular.forEach($scope._promo.$promotions, function(promotion,key){

		angular.forEach(promotion.products, function(product,prokey){

			product.addBtnAllowed = true;

			// $scope._promo.$promotions[key].products[proKey] = new AlcoholProduct(2,product);

		})

	})

}])

AlcoholDelivery.controller('CartSmokeController',[
			'$scope','$rootScope','$state', '$interval','alcoholCart',
	function($scope, $rootScope, $state, $interval, alcoholCart){

	$scope.alcoholCart = alcoholCart;

	$scope.smoke = alcoholCart.$cart.service.smoke;

}])

AlcoholDelivery.controller('CartAddressController',[
			'$scope','$rootScope','$state','$interval','$http','$q', '$mdDialog', '$mdMedia','alcoholCart','sweetAlert',
	function($scope, $rootScope, $state, $interval, $http, $q, $mdDialog, $mdMedia, alcoholCart, sweetAlert){

	$scope.errors = {};

	$scope.delivery = alcoholCart.$cart.delivery;

	/*$scope.setSelectedAddress = function(key){
		console.log(key);
		$scope.delivery.address = {};
		$scope.delivery.address.key = key;
		$scope.delivery.address.detail = $scope.addresses[key];

	}*/

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

AlcoholDelivery.controller('CartDeliveryController',[
			'$scope','$rootScope','$state','$http','$q', '$mdDialog', '$mdMedia','$interval', 'alcoholCart', 'sweetAlert',
	function($scope, $rootScope, $state, $http, $q, $mdDialog, $mdMedia, $interval, alcoholCart, sweetAlert){


	if($scope.$parent.cart.delivery.type==0){

		if($state.previous.state.controller==="CartPaymentController"){
			$scope.step = 2;
			$state.go("mainLayout.checkout.address");
		}else{
			$scope.step = 4;
			$state.go("mainLayout.checkout.payment");
		}

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








}]);

AlcoholDelivery.controller('CartPaymentController',[
			'$scope','$rootScope','$http','$q', '$mdDialog', '$mdMedia','sweetAlert', '$interval', 'alcoholCart', '$state',
	function($scope, $rootScope, $http, $q, $mdDialog, $mdMedia, sweetAlert, $interval, alcoholCart, $state){

		$scope.payment = alcoholCart.$cart.payment;

		if(typeof $scope.payment.savecard == 'undefined'){
			$scope.payment.savecard = true;
		}

		$scope.proceedReview = function(){

			$deployCart = false;

			if($scope.payment.method == 'COD'){
				$deployCart = true;
				//REMOVE CARD ATTR IN CASE OF COD
				delete $scope.payment.card;
				delete $scope.payment.creditCard;
				delete $scope.payment.savecard;
			}else{

				if(typeof $scope.payment.card == 'undefined' || $scope.payment.card == "" || $scope.payment.card == null){
					sweetAlert.swal({
						type:'error',
						text:"Please select card for payment.",
					});
				}else{
					if($scope.payment.card == 'newcard'){
						$scope.$broadcast('addcardsubmit');
					}else{
						$deployCart = true;
					}
				}

			}

			if($deployCart){
				alcoholCart.deployCart().then(
					function(result){
						$state.go('mainLayout.checkout.review');
					}
				);
			}

		}

}]);

AlcoholDelivery.controller('CartReviewController',[
			'$scope','$rootScope','$http','$q','$state', '$mdDialog', '$mdMedia', '$interval', 'alcoholCart','store','sweetAlert','$sce',
	function($scope, $rootScope, $http, $q, $state, $mdDialog, $mdMedia, $interval, alcoholCart, store, sweetAlert,$sce){

	$scope.card = {
		formAction:'',
		formData:{}
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

		        }).success(function(response) {

			        	if($scope.cart.payment.method == 'CARD'){
			        		var payurl = $sce.trustAsResourceUrl(response.formAction);
				            $rootScope.$broadcast('gateway.redirect', {
				                url: payurl,
				                method: 'POST',
				                params: response.formData
				            });
			        		return;
			        	}

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

}]);

AlcoholDelivery.controller('OrderplacedController',[
			'$scope','$http','$stateParams','sweetAlert','SocialSharingService',
	function($scope,$http,$stateParams,sweetAlert,SocialSharingService){

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

AlcoholDelivery.controller('RepeatOrderController',[
			'$scope','$rootScope','$http','$mdDialog','UserService','alcoholCart','sweetAlert',
	function($scope,$rootScope,$http,$mdDialog,UserService,alcoholCart,sweetAlert){

	$scope.user = UserService.getIfUser();
	$scope.lastorder = {};
	$scope.error = true;

	$scope.$watch('user',

		function(newValue, oldValue) {
			if(UserService.currentUser!=null && UserService.currentUser.auth===false){
				return false;
			}

			$scope.fetching = true;

			$scope.repeatOrderInit();

		},true
	);

	$scope.repeatOrderInit = function(){

		if(UserService.getIfUser())
			$http.get("user/lastorder").then(

				function(response){

					$scope.lastorder = response.data.order;
					$scope.fetching = false;
					$scope.error = false;

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

AlcoholDelivery.controller('ShopFromPreviousController',[
			'$scope','$rootScope','$http','$mdDialog','$timeout','alcoholCart','sweetAlert',
	function($scope,$rootScope,$http,$mdDialog,$timeout,alcoholCart,sweetAlert){

	$scope.orders = {};
	$scope.order = {};
	$scope.fetchingOrders = true;
	$scope.fetchingOrder = true;
	$scope.viewDetail = false;

	$scope.selectAll = function(selected) {
		$scope.order.products.forEach(function(product){
			product.selected = selected;
		})
	}

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

AlcoholDelivery.controller('CmsController',[
			'$scope','$http','$stateParams','$rootScope','$state',
	function($scope,$http,$stateParams,$rootScope,$state){
	$scope.querySent = false;
	$http.get("/super/cmsdata/"+$stateParams.slug).success(function(response){

    	if(response.length == 0){
    		$state.go('mainLayout.notfound');
    	}

    	$scope.cmsData = response;

    	$scope.checkForm = function(){
    		return (
    			$scope.cmsData.formType == 'contact-us' ||
    			$scope.cmsData.formType == 'event-planner' ||
    			$scope.cmsData.formType == 'book-a-bartender' ||
    			$scope.cmsData.formType == 'become-a-partner' ||
    			$scope.cmsData.formType == 'sell-on-alcoholdelivery'
    		);
    	}

    	$scope.cmsData.hasForm = $scope.checkForm();

    	$scope.query = {type:$scope.cmsData.formType};

    	var mdata = {
			title:response.metaTitle,
			description:response.metaDescription,
			keyword:response.metaKeywords
		};

		$rootScope.setMeta(mdata);


    });

    $scope.submitQuery = function(){
		$scope.querySubmit = true;
    	$http.post('/site/query',$scope.query).success(function(res){
    		$scope.querySent = true;
		}).error(function(data, status, headers){
			$scope.errors = data;
			$scope.querySubmit = false;
		});
	}

}]);


AlcoholDelivery.controller('PackagesController', ['$scope', '$rootScope','$state','$http','$stateParams','$timeout','$anchorScroll','alcoholCart', function($scope, $rootScope,$state,$http,$stateParams,$timeout,$anchorScroll,alcoholCart){

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

	var title = ($stateParams.type == 'party')?'Party Packages':'Cocktail Packages';

	var mdata = {
		title:title,
		description:$rootScope.settings.general.meta_desc,
		keyword:$rootScope.settings.general.meta_keyword
	};
	$rootScope.setMeta(mdata);

	$scope.addPackage = function(packageId){

		var currPackage = "";
		angular.forEach($scope.packages,function(package,key){
			if(package._id == packageId){
				currPackage = package;
			}
		})

		if(currPackage === ""){
			return false;
		}


		$scope.processing = true;

		alcoholCart.addPackage(packageId,currPackage).then(

			function(response) {

				if(response.success){

					$scope.packages.unique = response.key;
					$scope.processing = false;
					$scope.btnText = "UPDATE CART";

				}

			},
			function(error) {

				console.error(error);
				$scope.processing = false;

			});


	}

}]);

AlcoholDelivery.controller('PackageDetailController',
	['$q','$scope', '$rootScope','$state','$http','$stateParams','$timeout','$anchorScroll','alcoholCart','sweetAlert', '$sce',
	function($q, $scope, $rootScope,$state,$http,$stateParams,$timeout,$anchorScroll,alcoholCart,sweetAlert,$sce){

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

		var mdata = {
			title:$scope.packages.metaTitle,
			description:$scope.packages.metaDescription,
			keyword:$scope.packages.metaKeywords
		};
		$rootScope.setMeta(mdata);
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

	$scope.toTrustedHTML = function( html ){
	    return $sce.trustAsHtml( html );
	}


}]);

AlcoholDelivery.controller('SearchController', [
'$timeout', '$q', '$log', '$http', '$state', '$scope', '$rootScope', '$timeout', '$anchorScroll', '$stateParams', 'ScrollPaging', 'ProductService'
, function($timeout, $q, $log, $http, $state, $scope, $rootScope, $timeout, $anchorScroll, $stateParams, ScrollPaging, ProductService){

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
		    result.data = ProductService.prepareProductObjs(result.data);
		    // console.log(data);
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
			$("#headcontainer").addClass('searchopen');


			if($.trim($(".searchtop input").val())=="")
				$(".searchtop input").focus();
		}else{
			$(".searchtop").removeClass("searchtop100").addClass("again21");
			$(".search_close").removeClass("search_close_opaque");
			$(".logoss").removeClass("leftminusopacity leftminus100").addClass("again0left againopacity");
			$(".homecallus_cover").removeClass("leftminus2100").addClass("again0left");
			$(".signuplogin_cover").removeClass("rightminus100").addClass("again0right");
			$(".rightplcholder").addClass('hide');
			$("#headcontainer").removeClass('searchopen');
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

AlcoholDelivery.controller('LoyaltyStoreController', [
			'$q', '$http', '$scope', 'ScrollPagination',"UserService","$stateParams","alcoholCart","ProductService","$timeout",
	function($q, $http, $scope, ScrollPagination,userService,$stateParams,alcoholCart,ProductService,$timeout){

		var user = userService.currentUser;

		$scope.keyword = $stateParams.keyword;
		$scope.filter = $stateParams.filter;
		$scope.sortby = $stateParams.sort;

		$scope.products = new ScrollPagination();

		$scope.credits = {};
		$scope.availableLoyaltyPoints = alcoholCart.availableLoyaltyPoints;

		alcoholCart.setLoyaltyPointsInCart();

		$scope.$watch(alcoholCart.availableLoyaltyPoints,function(newValue,oldValue){

			angular.forEach($scope.products.items, function(product,key){

				product.setAddBtnState();

			});

		});

		ProductService.getCreditCertificates().then(

    		function(response){

				$scope.credits = response;

    		},
    		function(errorRes){

    		}

    	);
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
	'$q', '$http', '$scope', '$stateParams', 'ScrollPaging', '$state', '$rootScope', '$filter',
	function($q, $http, $scope, $stateParams,ScrollPaging,$state,$rootScope,$filter){


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

		$scope.$watch('giftproducts.data.categoryData',function(newValue,oldValue){
			if(newValue){

				var mdata = {
					title:newValue.metaTitle,
					description:newValue.metaDescription,
					keyword:newValue.metaKeywords
				};

				if($stateParams.type){
					var child = $filter('filter')(newValue.child,{slug:$stateParams.type});

					if(typeof child[0] !== 'undefined'){
						mdata = {
							title:child[0].metaTitle,
							description:child[0].metaDescription,
							keyword:child[0].metaKeywords
						};
					}
				}

				$rootScope.setMeta(mdata);

			}
		});

}]);

AlcoholDelivery.controller('GiftController', [
	'$q', '$http', '$scope', '$stateParams', '$rootScope', '$state', 'alcoholGifting', 'sweetAlert', '$anchorScroll',
	function($q, $http, $scope, $stateParams, $rootScope, $state, alcoholGifting, sweetAlert, $anchorScroll){
		$rootScope.appSettings.layout.pageRightbarExist = false;


		$scope.processing = true;
		$scope.gift = {};

		$scope.errors = {};

		if($stateParams.giftid){

			$http.get('/gift/'+$stateParams.giftid).success(function(result){

				$scope.gift = result;

				var mdata = {
					title:$scope.gift.metaTitle,
					description:$scope.gift.metaDescription,
					keyword:$scope.gift.metaKeywords
				};

				$rootScope.setMeta(mdata);

				$scope.giftData = {
					_uid:$stateParams.uid
				};

				if($scope.giftData._uid==""){

					$scope.btnText = 'add to cart';

				}else{

					$scope.btnText = 'update cart';

				}

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

					alcoholGifting.addUpdateGift($scope.giftData).then(

						function(successRes){

							$scope.giftData._uid = successRes._uid.$id;
							$scope.btnText = 'update cart';

						},
						function(errorRes){

							if(errorRes.data.message){

								sweetAlert.swal({

									type:'error',
									title: 'Oops...',
									text:errorRes.data.message

								}).then(

									function(){

										if(errorRes.data.reload){
											$state.go($state.current, {}, {reload: true});
										}

									}
								);

							}

							$scope.errors = errorRes.data;
							$anchorScroll();

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

				var mdata = {
					title:$scope.gift.metaTitle,
					description:$scope.gift.metaDescription,
					keyword:$scope.gift.metaKeywords
				};

				$rootScope.setMeta(mdata);

				$scope.gift.recipient = {price:$scope.gift.cards[0].value,quantity:1};

				$scope.processing = false;

				$scope.addCard = function(){

					$scope.processing = true;

					alcoholGifting.addGiftCard($scope.gift).then(

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


AlcoholDelivery.controller('ClaimGiftCardController', ['$scope', '$http', '$state', '$stateParams', 'ClaimGiftCard',function($scope, $http, $state, $stateParams, ClaimGiftCard){

	ClaimGiftCard.init($stateParams.token).then(
		function(successRes){

		},
		function(rejectRes){
			$state.go('mainLayout.index');
		}
	);

}]);