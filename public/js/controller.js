AlcoholDelivery.controller('AppController',
	['$scope', '$rootScope','$http', "$mdToast", "categoriesFac", "$mdDialog", "$filter",'ProductService', 'alcoholCart','$cookies','$location',
	function($scope, $rootScope,$http,$mdToast,categoriesFac, $mdDialog, $filter, ProductService, alcoholCart,$cookies,$location) {

	$scope.ageVerification = function() {
		// Appending dialog to document.body to cover sidenav in docs app
		
		$mdDialog.show({
			//scope: $scope.$new(),
			controller: function($scope,$cookies){
				
				/*$scope.calculateAge = function(){
					var currentYear = new Date().getFullYear();
					return currentYear - $scope.verification.userYear;
				}*/
				$scope.checkYear = function(){
					
					var currentYear = new Date().getFullYear();
					$scope.verification.cage = currentYear - $scope.verification.userYear;
				}
				
				/*$scope.$watch('verification.userYear',function(newV,oldV){
				
				});*/

				$scope.verifyage = function(){		

					$cookies.remove('ageverfication');					
    				
    				if($scope.verification.rememberme){
    					// this will set the expiration to 12 months
						var now = new Date();
    					now = new Date(now.getFullYear()+1, now.getMonth(), now.getDate());
    					$cookies.putObject('ageverfication', 
							{month:$scope.verification.userMonth,day:$scope.verification.userDay,year:$scope.verification.userYear},
							{expires:now}
						);
    				}else{
						$cookies.putObject('ageverfication', 
							{month:$scope.verification.userMonth,day:$scope.verification.userDay,year:$scope.verification.userYear}							
						);    					
    				}

					$mdDialog.hide();
				};

				$scope.verification = {};

				var offset = 0; range = 100;
				var currentYear = new Date().getFullYear();			
				$scope.verification.years = [];
			    for (var i = (offset*1); i <= range; i++){
			        $scope.verification.years.push(currentYear - i);
			    }

				var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

			    /*$scope.verification.months = [];
			    for (var i = 0; i < 12; i++){
			    	var val = 1+i;
			    	if(val<=9)			    	
			    		val = 0+''+val;
			        $scope.verification.months.push({value:(val),label:monthNames[i]});
			    }
			    
			    $scope.verification.days = [];    
			    
			    for (var d = 1; d <= 31; d++){
			    	var val = d;
			    	if(val<=9)			    	
			    		val = 0+''+val;
			    	$scope.verification.days.push(val);
			    }*/

			},
			templateUrl: '/templates/partials/ageverfication.html',
			parent: angular.element(document.body),			
			clickOutsideToClose:false,
			escapeToClose:false,
			fullscreen:true
		}).then(function(result) {
		  //$scope.status = 'You decided to name your dog ' + result + '.';
		}, function() {
		  //$scope.status = 'You didn\'t name your dog.';
		});

		
	};	

	if(!$cookies.get('ageverfication'))
		$scope.ageVerification();

	$rootScope.setMeta = function(meta){

		if(typeof meta.title == 'undefined') return;

		var title = $filter('ucwords')(meta.title)+ ' - '+$rootScope.settings.general.site_name;
		$rootScope.meta = {        	
			fbid:$rootScope.settings.fbid,
			site_name:$rootScope.settings.general.site_name,
			img:'/img/metalogo.png',
			title:title,
			description:meta.description,
			keyword:meta.keyword,
			url:$location.absUrl()
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
		//LIVE 
		$rootScope.settings.fbid = '1269828463077215';
		//LOCAL
		//$rootScope.settings.fbid = '273669936304095';		
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
							if($scope.parentCategories[key]['featured'].length < 8)
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
				clickOutsideToClose: true,
				fullscreen:true
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
	};

	$scope.sortOptions = [
		//{value:'',label:'Popularity'},
		{value:'name_asc',label:'Alphabetical A-Z'},
		{value:'created_asc',label:'Recently Added'},
		{value:'price_asc',label:'Price - Low to High'},
		{value:'price_desc',label:'Price - High to Low'},		
	];

	$scope.orderstatus = [
		{value:0,label:'Under Process',class:'warning',update:false},
		{value:1,label:'Ready',class:'info',update:false},
		{value:2,label:'Delivered',class:'success',update:true},
		{value:3,label:'Cancelled',class:'danger',update:true},
	];

	$scope.getOrderstatus = function(status){
		var fil = $filter('filter')($scope.orderstatus,{value:status});
		if(fil)
			return fil[0].label;
		else
			return '';
	}

		

	

}]);

AlcoholDelivery.controller('ProductsController', [
	'$scope', '$rootScope','$state','$http','$stateParams', '$filter', 'ProductService',
	function($scope, $rootScope,$state,$http,$stateParams, $filter, ProductService){

	$scope.ProductsController = {};

	$scope.products = {};

	$scope.AppController.category = $stateParams.categorySlug;
	$scope.AppController.subCategory = "";
	$scope.AppController.showpackage = false;

	var parentCategory = $stateParams.categorySlug;
	var subCategory = "";
	if(typeof $stateParams.subcategorySlug!=='undefined'){
		var subCategory = $stateParams.subcategorySlug;
		$scope.AppController.subCategory = $stateParams.subcategorySlug;
	}

	if(typeof $stateParams.toggle==="undefined"){$stateParams.toggle="all";}

	//$scope.currentSort = $filter('filter')($scope.sortOptions,{value:$stateParams.sort})[0];

	var data = {
		category:parentCategory,
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

		ProductService.getProducts({

			parent:parentCategory,
			subParent: subCategory,
			filter : $stateParams.toggle,
			sort: $stateParams.sort,
			productList:1

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

			data.category = $scope.AppController.category;
			data.type = $stateParams.toggle;
			data.sort = $stateParams.sort;

			$scope.fetchproducts();

	});

	$scope.fetchproducts();	

}]);

AlcoholDelivery.controller('ProductsFeaturedController', [
			'$scope', '$rootScope','$state','$http','$stateParams', 'ProductService', 
	function($scope, $rootScope, $state, $http, $stateParams, ProductService){

	$scope.ProductsFeaturedController = {};

	$scope.featured = {};

	$scope.category = $stateParams.categorySlug;

	var parentSlug = $stateParams.categorySlug;
	var childSlug = "";
	if(typeof $stateParams.subcategorySlug!=='undefined'){
		var childSlug = $stateParams.subcategorySlug;
	}

	$scope.loadingfeatured = true;

	ProductService.getProducts({

		filter : 'featured',
		parent : parentSlug,
		subParent : childSlug

	}).then(

		function(response){

			$scope.featured = response;
			$scope.loadingfeatured = false;
			
		},
		function(erroRes){}

	);
	// $http.get("/search",{

	// 			params:{

	// 				category:slug,
	// 				type:'featured',
	// 				limit:10,
	// 				offset:0

	// 			}

	// 	}).success(function(response){

	// 		var products = ProductService.prepareProductObjs(response);

	// 		$scope.featured = products;
	// 		$scope.loadingfeatured = false;
	// });



}]);

AlcoholDelivery.controller('ProductDetailController', [
			'$scope', '$rootScope','$state','$http','$stateParams','alcoholCart','ProductService', 'alcoholWishlist',
	function($scope, $rootScope,$state,$http,$stateParams,alcoholCart,ProductService, alcoholWishlist){

	$rootScope.appSettings.layout.pageRightbarExist = false;

	$scope.ProductDetailController = {};

	if(typeof $stateParams.loyalty === 'undefined'){

		$scope.viaLoyaltyStore = false;

	}else{

		$scope.viaLoyaltyStore = true;

	}

	$scope.$watch('product._id', function(id){
		if(id)
			$scope.isInwishList = alcoholWishlist.getProductById(id);
	});

	$scope.nonChilledFocus = function () {

		$scope.product.servechilled=0;
		if($scope.product.chilled && $scope.product.qNChilled<1){
			$scope.product.qNChilled = 1;
		}

	}

	$scope.saleExists = function () {
		if($scope.product)
			return alcoholWishlist.isNotified($scope.product._id);
	};

	$scope.addToWishlist = function(addInSale){

		alcoholWishlist.add($scope.product._id,addInSale).then(function(response) {

			if(response.success){

				$scope.isInwishList = alcoholWishlist.getProductById($scope.product._id);

			}

		});
	}

	$scope.myWish = function(){
		$state.go('accountLayout.wishlist');
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
		var key = angular.element($("[sortOrder='"+number+"']"));		
		var ind = $('img.sync1').index(key);		
		$scope.sync1.trigger("owl.goTo",ind);
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
			$scope.lastQty = {chilled : 0,nonChilled : 0}

			if(!$scope.product.isInCart){

				if($scope.product.chilled){
					$scope.product.qChilled = 1;
				}else{
					$scope.product.qNChilled = 1;
				}
				
			}else{
				$scope.lastQty.chilled = $scope.product.qChilled;
				$scope.lastQty.nonChilled = $scope.product.qNChilled;
			}



			$scope.addtocart = function(){

				var quantity = {
					chilled : parseInt($scope.product.qChilled),
					nonChilled : parseInt($scope.product.qNChilled)
				}

				if($scope.product.servechilled){
					quantity.nonChilled = $scope.lastQty.nonChilled;
				}else{
					quantity.chilled = $scope.lastQty.chilled;
				}

				$scope.lastQty.chilled = quantity.chilled;
				$scope.lastQty.nonChilled = quantity.nonChilled;

				alcoholCart.addItem($scope.product._id,quantity,$scope.product.servechilled).then(
					function(response){
						$scope.isInCart = true;
					}
				);

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

}]);

AlcoholDelivery.controller('AlsoBoughtThisController',[
			'$scope', '$http', '$stateParams', 'ProductService', 'alcoholCart',
	function($scope, $http, $stateParams, ProductService, alcoholCart){

	//$http.get("/product/alsobought/"+$stateParams.product)
	var cartKey = alcoholCart.getCartKey();
	ProductService.getAlsoBought($stateParams.product,cartKey).then(

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
				});
				$state.go($state.current, {}, {reload: true});
			})
	}

}]);

AlcoholDelivery.controller('OrdersController',['$scope','$rootScope','$state','$http','sweetAlert','UserService'
, function($scope,$rootScope,$state,$http,sweetAlert,UserService){

	$scope.orders = [];

	$scope.pagination = {

		start : 0,
		limit : 10,
		count : 0

	}

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

	$scope.getOrders = function(){

		$scope.process = {
			fetching:true
		};

		$http.get("order/orders",{params: $scope.pagination}).then(

			function(response){

				$scope.pagination.count = response.data.count;

				$scope.orders = response.data.orders;

				if($scope.pagination.count<=(($scope.pagination.start+1) * $scope.pagination.limit)){
					$scope.pagination.next = false;
				}else{
					$scope.pagination.next = true;
				}


			},function(errRes){

				console.log(errRes);

			}

		).finally(function(){

			$timeout(function(){

				$scope.process.fetching = false;

			},1000)

		});

	}

	$scope.$watch('pagination.start',
		function(newValue, oldValue) {

			$scope.getOrders();

		}
	);

	

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

	$scope.orderid = $stateParams.orderid;
	$scope.order = {};
	$scope.loading = true;
	$http.get("order/"+$stateParams.orderid)
	.success(function(response){

		$scope.order = response;
		$scope.address = $scope.order.delivery.address;
		$scope.loading = false;

	})
	.error(function(data, status, headers) {
		sweetAlert.swal({
		
			type:'error',
			title: "Order not found",			

		}).then(
			function(){
				$state.go("accountLayout.orders")
			}
		)
	})

	$scope.getQuantity = function(product) {
		var qChilled = product.chilled.quantity
		  , qNChilled = product.nonchilled.quantity;

		if(product.remainingQty) {
			var usedInSale = product.quantity - product.remainingQty;

			qChilled -= usedInSale;

			if(qChilled<0){
				qNChilled += qChilled;
				qChilled = 0;
			}

		}
		else
			qChilled = qNChilled = 0;
		
		
		product.chilled.remainingQty = qChilled;
		product.nonchilled.remainingQty = qNChilled;
	}

}]);

AlcoholDelivery.controller('WishlistController',['$scope','$rootScope','$state','$stateParams','$http','sweetAlert','UserService','alcoholCart','alcoholWishlist',function($scope,$rootScope,$state,$stateParams,$http,sweetAlert,UserService,alcoholCart,alcoholWishlist){

	$scope.page = 0;

	$scope.alcoholCart = alcoholCart;

	$scope.alcoholWishlist = alcoholWishlist;

	$scope.alcoholWishlist.init();	


}]);

AlcoholDelivery.controller('LoyaltyController',['$scope','$http','sweetAlert','$timeout', '$anchorScroll',
	function($scope,$http,sweetAlert,$timeout,$anchorScroll){

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


		$http.get("loyalty/transactions",{params: $scope.pagination}).then(

			function(response){

				$scope.pagination.count = response.data.count;

				$scope.loyalty = response.data.transactions;

				$scope.statics = response.data.statics;

			},function(errRes){

				console.log(errRes);

			}

		).finally(function(){

			$timeout(function(){

				$scope.process.fetching = false;

			},1000)
			$anchorScroll();

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
		limit : 10,
		count : 0

	}

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


		$http.get("credits/transactions",{params: $scope.pagination}).then(

			function(response){

				$scope.pagination.count = response.data.count;

				$scope.credits = response.data.transactions;

				$scope.statics = response.data.statics;

				if($scope.pagination.count<=(($scope.pagination.start+1) * $scope.pagination.limit)){
					$scope.pagination.next = false;
				}else{
					$scope.pagination.next = true;
				}


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




AlcoholDelivery.controller('CartController',[
			'$scope','$rootScope','$state','$stateParams', '$location','$anchorScroll','$http','$q', '$mdDialog', '$mdMedia','$timeout',
			'UserService','sweetAlert','alcoholCart','alcoholGifting','store', 'cartValidation', 'cartValidate', 'ProductService'
	,function($scope, $rootScope, $state, $stateParams, $location, $anchorScroll, $http, $q, $mdDialog, $mdMedia, $timeout, 
			UserService, sweetAlert, alcoholCart, alcoholGifting, store, cartValidation, cartValidate, ProductService){
	
	
	$scope.$watch(function () {

		try {
			return $state.$current.data.step
		}
		catch(err) {
			return false;
		}
		

	} ,
			function(newValue, oldValue) {
				if(newValue)
				alcoholCart.setCurrentStep(newValue);
		});
	
	// var isStepSet = alcoholCart.setCurrentStep($state.$current.data.step);
	// if(isStepSet===false){
	// 	$state.go("mainLayout.checkout.cart");
	// }

	//alcoholCart.validate();

	$scope.alcoholCart = alcoholCart;

	$scope.alcoholGifting = alcoholGifting;

	// angular.alcoholCart = alcoholCart;
	
	$scope.cart = alcoholCart.$cart;	

	$scope.smoke = {

		status:false,
		detail:""
	}

	$scope.payment = {

		type:"cod",
		savecard:true
	}

	$scope.packageUTOut = [];
	$scope.proUpdateTimeOut = {};
	$scope.lproUpdateTimeOut = [];
	$scope.lproCardUpdateTimeOut = [];

	$scope.step = 1;

	$rootScope.invalidCodeMsg = true;
	
	if(alcoholCart.getCouponCode()){
		$scope.discountCode = alcoholCart.getCouponCode();
		alcoholCart.$coupon.couponInput = false;
		alcoholCart.$coupon.couponOutput = true;
	}else{
		alcoholCart.$coupon.couponInput = true;
		alcoholCart.$coupon.couponOutput = false;
	}

	$scope.checkCoupon = function(discountCode){

		if(!angular.isDefined(discountCode) || !discountCode){
			return false;
		}

		$scope.discountCode = discountCode;
		alcoholCart.checkCoupon(discountCode, alcoholCart.getCartKey());
	}

	$scope.removeCoupon = function(){
		$scope.discountCode = '';
		delete $scope.discountCode;
		alcoholCart.removeCoupon();
	}

	$scope.hideCouponMsg = function(){
		alcoholCart.$coupon.invalidCodeMsg = true;
		alcoholCart.$coupon.invalidCodeMsgTxt = '';
	}

	$scope.checkout = function(ev) {

		//isCartValid = alcoholCart.validate($scope.step);

		cartValidate.check('cart').then(
			function(valid){

				if(valid===true){
				
					if(!UserService.getIfUser())
						return $rootScope.$broadcast('showLogin');

					if(alcoholCart.getDeliveryBaseTime()!==null && alcoholCart.setProductsAvailability()!==0){
						alcoholCart.availabilityPopUp();
						return false;
					}

					var cartKey = alcoholCart.getCartKey();

					ProductService.getDontMiss(cartKey).then(

						function(response){

							if(response.length>0){

								$mdDialog.show({

									controller: function($scope, $rootScope, $document) {

										$scope.products = response;

										$scope.address = {
											step:1
										}

										$scope.hide = function() {
											$mdDialog.hide();
										};
										$scope.cancel = function() {
											$mdDialog.cancel();
										};

										$scope.continue = function(){

											//alcoholCart.deployCart();

											$scope.step = 2;

											$mdDialog.hide();

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
									//targetEvent: ev,
									clickOutsideToClose:true,
									fullscreen:true
								})
								.then(function(answer) {

								}, function() {

								});

							}else{

								$state.go("mainLayout.checkout.address");

							}

							$scope.loading = false;

						},
						function(errorRes){

						}
					);

				}else{
					cartValidate.processValidators();
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

	$scope.addtocart = function(key,type,direction){

		var proObj = $scope.cart.products[key];

		if(angular.isDefined($scope.proUpdateTimeOut[key])){
			$timeout.cancel($scope.proUpdateTimeOut[key]);
		}

		$scope.proUpdateTimeOut[key] = $timeout(function(){

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

	$scope.updateLoyaltyProduct = function(key,type,direction){

		var proObj = $scope.alcoholCart.getLoyaltyProductById(key);

		if(proObj===false){return false;}

		if(angular.isDefined($scope.lproUpdateTimeOut[key])){
			$timeout.cancel($scope.lproUpdateTimeOut[key]);
		}

		$scope.lproUpdateTimeOut[key] = $timeout(function(){

			var quantity = {
				chilled : parseInt(proObj.qChilled),
				nonChilled : parseInt(proObj.qNChilled)
			}
			alcoholCart.addLoyaltyProduct(key,quantity,proObj.servedAs).then(
				function(response){
					$scope.isInCart = true;
				},
				function(errRes){

				}

			);

		},1500)
	};

	$scope.updateLoyaltyCard = function(key){

		var proObj = $scope.alcoholCart.getLoyaltyCardByValue(key);

		if(proObj===false){return false;}

		if(angular.isDefined($scope.lproCardUpdateTimeOut[key])){
			$timeout.cancel($scope.lproCardUpdateTimeOut[key]);
		}

		$scope.lproCardUpdateTimeOut[key] = $timeout(function(){
			var quantity = proObj.quantity;
			alcoholCart.addCreditCertificate(key,quantity).then(
				function(response){
					$scope.isInCart = true;
				},
				function(errRes){

				}

			);

		},1500)
	};
	

	$scope.updatePackage = function(uid){

		if(typeof $scope.packageUTOut[uid]!=="undefined"){

			$timeout.cancel($scope.packageUTOut[uid]);

		}

		$scope.packageUTOut[uid] = $timeout(function(){

			alcoholCart.updatePackage(uid).then(

				function(response){
					
				},
				function(errRes){

				}

			);

		},1000)
	};

	$scope.remove = function(key,type){

		if(type=='qChilled'){

			alcoholCart.removeProduct(key,true);

		}else{

			alcoholCart.removeProduct(key,false);

		}
	};

	$scope.removeLoyaltyProduct = function(key,type){

		if(type=='qChilled'){

			alcoholCart.removeLoyaltyProduct(key,true);

		}else{

			alcoholCart.removeLoyaltyProduct(key,false);

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

AlcoholDelivery.controller('PromotionsController',['$scope', '$rootScope', '$http', '$interval', 'alcoholCart', 'promotionsService', 'AlcoholProduct'
,function($scope, $rootScope, $http, $interval, alcoholCart, promotionsService, AlcoholProduct){

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
			'$scope','$rootScope','$state','$interval','$http','$q', '$mdDialog', '$mdMedia','alcoholCart','sweetAlert', 'UserService'
	, function($scope, $rootScope, $state, $interval, $http, $q, $mdDialog, $mdMedia, alcoholCart, sweetAlert, UserService){

	$scope.errors = {};	

	$scope.delivery = alcoholCart.$cart.delivery;
	
	$scope.user = UserService.getIfUser();
	

	if(!$scope.delivery.contact){		
		if($scope.user.mobile_number){
			$scope.delivery.contact = $scope.user.mobile_number;
		}else if($scope.user.alternate_number){
			$scope.delivery.contact = $scope.user.alternate_number.pop();
		}
	}

	/*$scope.setSelectedAddress = function(key){
		console.log(key);
		$scope.delivery.address = {};
		$scope.delivery.address.key = key;
		$scope.delivery.address.detail = $scope.addresses[key];

	}*/

	$scope.$watch('delivery.contact',
			function(newValue, oldValue) {

				if($scope.cartFrm.deliveryContact.$valid && $scope.user.mobile_number!==newValue){
					$scope.newNumber = true;
				}else{
					$scope.newNumber = false;
				}
			}
		);

	$scope.addressCheckout = function(){

		if($scope.delivery.address==="" || $scope.delivery.address===null){

			sweetAlert.swal({
				
					type:'error',
					title: "Please select an address"

				}).then(

					function () {

						var ele = $("#checkout-middle");
						$('html, body').stop().animate({
							scrollTop: ele.offset().top - 200
						}, 1000);

					},function () {

					}
				);

			return false;
		}

		var deliveryContactErrors = $scope.cartFrm.deliveryContact;
		if(deliveryContactErrors.$invalid){

			if(deliveryContactErrors.$error.required){
				$scope.errors.contact = "Please enter contact person number";
			}

			if(deliveryContactErrors.$error.minlength){
				$scope.errors.contact = "Contact number should be 8 digit long";
			}

			var ele = $("#deliveryContact");
			$('html, body').stop().animate({
				scrollTop: ele.offset().top - 200
			}, 1000);
			$(ele).focus();

			return false;

		}

		if(alcoholCart.getExpressStatus()){
			var deliveryPostalCode = $scope.delivery.address.detail.PostalCode.substr(0,2);
			if(alcoholCart.getApplicablePostalCodes().indexOf(deliveryPostalCode)==-1){
				alcoholCart.setExpressStatus(0);
				$rootScope.$broadcast('alcoholWishlist:change', {message:"We regret to inform you that the Express Delivery service does not cover your delivery area. Please read the Terms & Conditions for more information.",hideDelay:0,targId:'cart-summary-icon'});
				// $rootScope.$broadcast('alcoholCart:notify',"We regret to inform you that the Express Delivery service does not cover your delivery area. Please read the Terms & Conditions for more information.");
			}
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
	'$scope','$rootScope','$state','$http','$q', '$mdDialog', '$mdMedia','$interval', '$timeout', 'alcoholCart', 'sweetAlert', '$filter'
	, function($scope, $rootScope, $state, $http, $q, $mdDialog, $mdMedia, $interval, $timeout, alcoholCart, sweetAlert, $filter){

	$scope.alcoholCart = alcoholCart;

	$scope.timeslot = alcoholCart.$cart.timeslot;
	var skipDays = 0;
	$scope.localDate = new Date();

	if($scope.timeslot.slug){

		$scope.myDate = new Date($scope.timeslot.slug);

	}else{
		$scope.myDate = new Date();
		$scope.myDate.setDate($scope.myDate.getDate()+skipDays);
	}

	$scope.localDate.setDate($scope.localDate.getDate()+skipDays);

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

		$scope.daySlug = $filter('dateSuffix')($scope.myDate);
		$scope.currDate = $filter('date')($scope.myDate,'yyyy-MM-dd');		
		$scope.loadingSlots = true;

		$http.get("cart/timeslots/"+$scope.currDate).success(function(response){
			$scope.timeslots = response;
		}).finally(function() {
			$timeout(function() {
				$scope.loadingSlots = false;
			},1000);
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
		"1110":'6:30pm',
		"1140":'7pm',
		"1170":'7:30pm',
		"1200":'8pm',
		"1230":'8:30pm',
		"1260":'9pm',
		"1290":'9:30pm',
		"1320":'10pm',
		"1350":'10:30pm',
		"1380":'11pm',
		"1410":'11:30pm',
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
						$scope.timeslot.slotTime = timeslots[key].slots[skey].from;

					}

				}

			}
		}

		if(alcoholCart.setProductsAvailability()!==0){
			alcoholCart.availabilityPopUp();			
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

			if(alcoholCart.setProductsAvailability()!==0){
				alcoholCart.availabilityPopUp();
				return false;			
			}

			alcoholCart.deployCart().then(
				function(result){
					$state.go("mainLayout.checkout.payment");
				}
			);



		}

	}








}]);

AlcoholDelivery.controller('CartPaymentController',[
			'$scope','$rootScope','$http','$q', '$mdDialog', '$mdMedia','sweetAlert', '$interval', 'alcoholCart', '$state', '$location', '$anchorScroll'
	, function($scope, $rootScope, $http, $q, $mdDialog, $mdMedia, sweetAlert, $interval, alcoholCart, $state, $location, $anchorScroll){

		$scope.payment = alcoholCart.$cart.payment;

		if(typeof $scope.payment.creditCard != 'undefined'){
			$scope.payment.creditCard.cvc = '';
		}

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
						if(!$scope.payment.creditCard.cvc || $scope.payment.creditCard.cvc == ''){
							sweetAlert.swal({
								type:'error',
								text:"Please enter cvv for the selected card.",
							});
						}else{
							$deployCart = true;
						}
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
			'$scope','$rootScope','$http','$q','$state', '$window', '$mdDialog', '$mdToast',
			'$mdMedia', '$interval', 'alcoholCart','store','sweetAlert', '$sce', '$filter','$stateParams'
	, function($scope, $rootScope, $http, $q, $state, $window, $mdDialog, $mdToast,
			$mdMedia, $interval, alcoholCart, store, sweetAlert, $sce, $filter,$stateParams){

	$scope.card = {
		formAction:'',
		formData:{}
	}

	$scope.alcoholCart = alcoholCart;

	$scope.cart = alcoholCart.$cart;

	$scope.address = alcoholCart.$cart.delivery.address;

	var mili = $scope.cart.timeslot.datekey * 1000;

	$scope.myDate = new Date(mili);	
	
	$scope.daySlug = $filter('dateSuffix')($scope.myDate);

	$scope.slotslug = $scope.$parent.cart.timeslot.slotslug;
	
	$scope.orderConfirm = function(){
		
		$rootScope.processingOrder = true;

		alcoholCart.checkoutValidate().then(

			function (successRes) {
				
				alcoholCart.freezCart().then(

					function(result){
						
						var cartKey = alcoholCart.getCartKey();

						$http.put("confirmorder/"+cartKey, {} ,{

						}).error(function(response, status, headers) {

								sweetAlert.swal({
									type:'error',
									title: 'Oops...',
									text:response.message									
								});

								$rootScope.processingOrder = false;

								stepToRe = 'cart';
								if(angular.isDefined(response.step)){
									var stepToRe = response.step
								}								

								if(angular.isDefined(response.refresh)){
									$state.go("mainLayout.checkout."+stepToRe,{},{reload: true});
									//$window.location.reload();
								}else{
									$state.go("mainLayout.checkout."+stepToRe);
								}


						})
						.success(function(response) {

								if($scope.cart.payment.method == 'CARD'){
									var payurl = $sce.trustAsResourceUrl(response.formAction);
									$scope.$broadcast('gateway.redirect', {
										
										url: payurl,
										method: 'POST',
										params: response.formData

									}).done();
									return;
								}

								if(!response.success){

									sweetAlert.swal({
										type:'error',
										title: 'Oops...',
										text:response.message,
										timer: 2000
									}).done();

								}

								sweetAlert.swal({
									type:'success',
									title: response.message,
									timer: 2000
								}).done();

								store.orderPlaced();

								$rootScope.processingOrder = false;

								$state.go('orderplaced',{order:response.order},{reload: false, location: 'replace'});

						})
						.finally(function(){

							$rootScope.processingOrder = false;

						})

					},
					function(errorRes){
						
						$rootScope.processingOrder = false;
						console.log(errorRes);
					}

				)

			},
			function (errorRes) {

				$rootScope.processingOrder = false;
				if(errorRes==='reload'){
					$state.go("mainLayout.checkout.cart");
				}
				
			}

		);

	}


	if($stateParams.pstatus){
		$scope.paymenterror = 'Payment failed';
		$scope.paymentstatus = $stateParams.pstatus;
	}

}]);

AlcoholDelivery.controller('OrderplacedController',[
	'$scope','$http','$stateParams','$filter','sweetAlert','SocialSharingService','$window',
	function($scope,$http,$stateParams,$filter,sweetAlert,SocialSharingService,$window){

	$scope.order = $stateParams.order;

	$http.get("order/summary/"+$scope.order).success(function(response){
		
		$scope.order = response;

		$scope.orderNumber = $scope.order.reference;    	

		if($scope.order.timeslot.datekey!==false){

			var mili = $scope.order.timeslot.datekey * 1000;

		}else{

			var mili = $scope.order.dop * 1000;

		}


		$scope.myDate = new Date(mili);	

		// $scope.daySlug = $scope.day+' '+$scope.monthName+', '+$scope.year;
		$scope.daySlug = $filter('dateSuffix')($scope.myDate);
		
		$scope.slotslug = $scope.order.timeslot.slotslug;

		var dopmili = $scope.order.dop * 1000;
		$scope.dopDate = new Date(dopmili);

		$scope.dopSlug = $filter('dateSuffix')($scope.dopDate);
		
		if($scope.order.delivery.type == 1){
			$scope.deliveryDateTime = $scope.daySlug+', '+$scope.slotslug;
		}else{
			$scope.deliveryDateTime = $scope.dopSlug+', '+$filter('date')($scope.dopDate,'hh:mm a');

			if($scope.order.service.express.status){
				$scope.deliveryDateTime += ' +30 Minutes';
			}else{
				$scope.deliveryDateTime += ' +1 Hour';
			}
		}

		if($scope.order.payment.method == 'COD'){
			$scope.paymode = 'Cash on Delivery';
		}else{
			$scope.paymode = 'Debit/Credit Card';
		}

		$scope.fireConversion();

		/*$scope.dopDay = $scope.dopDate.getDate();
		$scope.dopYear = $scope.dopDate.getFullYear();
		$scope.dopMonthName = $scope.monthsName[$scope.dopDate.getMonth()];
		$scope.dopSlug = $scope.dopMonthName+' '+$scope.dopDay+', '+$scope.year;

		$scope.hour = $scope.dopDate.getHours() % 12 || 12;
		$scope.minute = $scope.dopDate.getMinutes();
		$scope.aMpM = $scope.dopDate.getHours() > 12 ? 'PM' : 'AM';*/


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

	//GOOGLE CONVERSION SCRIPT
	$scope.fireConversion = function() {		
		$window.google_trackConversion({
			google_conversion_id : 1005306689,
			google_conversion_language : "en",
			google_conversion_format : "3",
			google_conversion_color : "ffffff",
			google_conversion_label : "nlRtCNf-5RUQwYav3wM",
			google_conversion_value : 1.00,
			google_conversion_currency : "SGD",
			google_remarketing_only : false
		});
	}
	//GOOGLE CONVERSION SCRIPT
}]);

AlcoholDelivery.controller('RepeatOrderController',[
			'$scope','$rootScope','$http','$mdDialog','UserService','alcoholCart','sweetAlert', 'ProductService',
	function($scope,$rootScope,$http,$mdDialog,UserService,alcoholCart,sweetAlert, ProductService){

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

					if(response.data.order){

						var products = ProductService.prepareProductObjs(response.data.order.products);

						angular.forEach(products,function(product){

							angular.forEach(response.data.order.products,function(oPro){
								
								if(product._id===oPro._id.$id){

									product.qChilled = oPro.orderQty.chilled;
									product.qNChilled = oPro.orderQty.nonChilled;

								}
							});

						})

						response.data.order.products = products;

						$scope.lastorder = response.data.order;
						
						$scope.fetching = false;
						$scope.error = false;
					}

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
			clickOutsideToClose:false,
			fullscreen:true
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
			clickOutsideToClose:false,
			fullscreen:true

		})
		.then(function(answer) {

		}, function() {

		});

	}

	$scope.$watch('lastorder.products', function() {
		var count = 0;
		angular.forEach($scope.lastorder.products, function(product) {
			if(product.selected)
				count++;
		});
		$scope.selectedCount = count;
	}, true);

	$scope.addSelected = function(){

		var selected = {
			products : []
		};

		angular.forEach($scope.lastorder.products, function(product) {

			var selPro = {
							id : product._id,
							quantity : {
								chilled : product.qChilled,
								nonChilled : product.qNChilled
							}
							
						};			

			if((selPro.quantity.chilled+selPro.quantity.nonChilled)>0){
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

				angular.forEach($scope.lastorder.products, function(product) {
					product.selected = false;
				});

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
			'$scope','$rootScope','$http','$mdDialog','$timeout','alcoholCart','sweetAlert','ProductService',
	function($scope,$rootScope,$http,$mdDialog,$timeout,alcoholCart,sweetAlert,ProductService){

	$scope.orders = {};
	$scope.order = {};
	$scope.fetchingOrders = true;
	$scope.fetchingOrder = true;
	$scope.viewDetail = false;

	$scope.selectAll = function(selected) {
		$scope.order.products.forEach(function(product){
			product['qChilledSelected'] = selected;
			product['qNChilledSelected'] = selected;
		})
	}

	$http.get("order/to-repeat").then(

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

				var products = ProductService.prepareProductObjs(response.data.order.products);

				angular.forEach(products,function(product){

					angular.forEach(response.data.order.products,function(oPro){
						
						if(product._id===oPro._id.$id){

							product.qChilled = oPro.orderQty.chilled;
							product.qNChilled = oPro.orderQty.nonChilled;
							product.qChilledState = true;
							product.qNChilledState = false;
						}
					});

				})

				response.data.order.products = products;

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

			states = ['qChilled','qNChilled'];

			var selPro = {
							id : product._id,
							quantity : {
								chilled : 0,
								nonChilled : 0
							}
							
						};

			angular.forEach(states,function(state){

				if(product[state+'Selected'] && product[state]>0){

					var isChilled = product[state+'State'];
					if(isChilled){
						selPro.quantity.chilled+=product[state];
					}else{
						selPro.quantity.nonChilled+=product[state];
					}					
				}

			})

			if((selPro.quantity.chilled+selPro.quantity.nonChilled)>0){
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
			'$scope','$http','$stateParams','$rootScope','$state','$sce',
	function($scope,$http,$stateParams,$rootScope,$state,$sce){
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

	$scope.trustedHtml = function (plainText) {
		  return $sce.trustAsHtml(plainText);
	}

}]);


AlcoholDelivery.controller('PackagesController', ['$scope', '$rootScope','$state','$http','$stateParams','$timeout','$anchorScroll','alcoholCart', function($scope, $rootScope,$state,$http,$stateParams,$timeout,$anchorScroll,alcoholCart){

	$rootScope.appSettings.layout.pageRightbarExist = false;

	
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

				$scope.processing = false;

			});


	}

	$scope.viewDetail = function(roption){
		$state.go('mainLayout.packagedetail',roption);
	}

}]);

AlcoholDelivery.controller('PackageDetailController',
	['$q','$scope', '$rootScope','$state','$http','$stateParams','$location','$timeout','$anchorScroll','alcoholCart','sweetAlert', '$sce',
	function($q, $scope, $rootScope,$state,$http,$stateParams,$location,$timeout,$anchorScroll,alcoholCart,sweetAlert,$sce){

	$scope.errors = [];

	$scope.processing = false;
	$scope.btnText = "ADD TO CART";

	$rootScope.appSettings.layout.pageRightbarExist = false;

	angular.location = $location;

	$scope.AppController.category = "packages";
	$scope.AppController.subCategory = $stateParams.type;
	$scope.AppController.showpackage = true;

	$scope.packages = [];

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
	
	$http.get('/package/packagedetail/'+$stateParams.type+'/'+$stateParams.id).success(function(response){

		delete response.productlist;

		$scope.packages = response;

		if($stateParams.uid!==''){

			var isInCart = alcoholCart.getPackageByUniqueId($stateParams.uid);

			if(isInCart){

				$scope.btnText = "UPDATE CART";

				var packageProInCartCount = isInCart.getProductsCount();
				
				angular.forEach($scope.packages.packageItems,function(pRow){

					angular.forEach(pRow.products,function(product){

						var inCartProQty = packageProInCartCount[product._id];

						product.customizequantity = 0;
						product.cartquantity = 0;
						if(typeof inCartProQty !== 'undefined'){
							product.customizequantity = inCartProQty;
							product.cartquantity = inCartProQty;
						}

					})

				})

				$scope.packages.packageQuantity = isInCart.getQuantity();

				$scope.packages.isInCart = isInCart;

				$scope.updatePackage();
			}

		}else{

			$scope.packages.isInCart = false;

		}

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

	$scope.addPackage = function(){

		var c = Object.keys($scope.errors).length;
		if(c!=0){
			alert('Please verify your selection.');
			return;
		}

		$scope.processing = true;

		if($scope.packages.isInCart===false){
		alcoholCart.addPackage($stateParams.id,$scope.packages)
			.then(function(response) {

				$scope.packages.unique = response.key;
				$scope.processing = false;

				$scope.btnText = "UPDATE CART";

				$location.path($location.path()+response.key).replace();
				

			}, function(error) {

				console.error(error);
				$scope.processing = false;

			});
		}else{

			alcoholCart.updatePackage($stateParams.uid,$scope.packages)
			.then(function(response) {

				
				$scope.processing = false;
				

			}, function(error) {

				console.error(error);
				$scope.processing = false;

			});

		}

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
'$timeout', '$q', '$log', '$http', '$state', '$scope', '$rootScope', '$timeout', '$anchorScroll', '$stateParams', '$filter', 'ScrollPagination', 'ProductService'
, function($timeout, $q, $log, $http, $state, $scope, $rootScope, $timeout, $anchorScroll, $stateParams, $filter, ScrollPagination, ProductService){

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
			return result.data;
		});
	}
	function searchTextChange(text) {
	  //$log.info('Text changed to ' + text);
	}
	function selectedItemChange(item) {		
		if(item){			
			self.searchText = '';			
			$state.go('mainLayout.product',{product:item.slug});
			$timeout(function() {
				$anchorScroll();		    	
			});		    
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

	//$timeout(clearInputBoxOnBlur, 0);    
	
	function clearInputBoxOnBlur(){
		/*angular.element("#site-search").bind("blur", function(){
			var autoChild = document.getElementById('Auto').firstElementChild;
			var el = angular.element(autoChild);
			el.scope().$mdAutocompleteCtrl.hidden = true;            
			$scope.searchbar(0);                         
		});*/
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
			$(".logos-inner-cover").addClass('hide');
			self.searchText = ''
			//if(self.searchText == '')
			angular.element("#site-search").focus();
		}else{
			
			$(".searchtop").removeClass("searchtop100").addClass("again21");
			$(".search_close").removeClass("search_close_opaque");
			$(".logoss").removeClass("leftminusopacity leftminus100").addClass("again0left againopacity");
			$(".homecallus_cover").removeClass("leftminus2100").addClass("again0left");
			$(".signuplogin_cover").removeClass("rightminus100").addClass("again0right");
			$(".rightplcholder").addClass('hide');
			$("#headcontainer").removeClass('searchopen');
			$(".logos-inner-cover").removeClass('hide');
			
		}
	}

	$scope.currentSort = $filter('filter')($scope.sortOptions,{value:$stateParams.sort})[0];

	if($stateParams.keyword){
		if($stateParams.keyword!=''){
			/*$scope.args = {
				keyword:$stateParams.keyword,
				filter:$stateParams.filter,
				sortby:$stateParams.sort
			}
			$scope.url = '/site/searchlist';
			$scope.products = new ScrollPaging($scope.args,$scope.url);*/
			$scope.keyword = $stateParams.keyword;
			$scope.filter = $stateParams.filter;
			$scope.sortby = $stateParams.sort;

			$scope.products = new ScrollPagination($scope.keyword,$scope.filter,$scope.sortby,'0');
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
		

		$scope.$watch(function(){return alcoholCart.setLoyaltyPointsInCart();},function(newValue,oldValue){

			$scope.availableLoyaltyPoints = newValue;

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
			}).done();

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
	'$q', '$http', '$scope', '$stateParams', '$rootScope', '$state', 'alcoholGifting', 'alcoholCart', 'sweetAlert', '$anchorScroll',
	function($q, $http, $scope, $stateParams, $rootScope, $state, alcoholGifting, alcoholCart, sweetAlert, $anchorScroll){
		$rootScope.appSettings.layout.pageRightbarExist = false;


		$scope.processing = true;
		$scope.gift = {};

		$scope.errors = {};

		if($stateParams.giftid){

			$http.get('/gift/'+$stateParams.giftid)
			.success(function(result){

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
				
				$scope.alcoholGifting = alcoholGifting;

				alcoholGifting.setCurrentGift(result);

				alcoholGifting.$products = [];

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

				if($scope.giftData._uid){

					var gift = alcoholCart.getGiftByUniqueId($scope.giftData._uid);
					$scope.giftData.recipient = gift.recipient;
					
					angular.forEach($scope.products,function(gProduct){

						angular.forEach(gift.products,function(product){

							if(gProduct._id==product.getId()){

								gProduct._quantity+= parseInt(product.quantity);
								gProduct._inGift = parseInt(product.quantity);

							}

						})

					})		

					angular.forEach($scope.products,function(gProduct,index){

						if(gProduct._quantity<1){

							$scope.products.splice(index, 1)[0];

						}

					})

					$scope.totalAttached();

				}

				$scope.addGift = function(){

					$scope.processing = true;

					alcoholGifting.addUpdateGift($scope.giftData).then(

						function(successRes){

							$scope.giftData._uid = successRes._uid.$id;
							$scope.btnText = 'update cart';

							$state.go($state.current, {giftid:$stateParams.giftid,uid:successRes._uid.$id}, {reload: true});

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

						}

					).finally(function(res){
						$scope.processing = false;

					});

				}

			})
			.error(function(err){

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