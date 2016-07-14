'use strict';

MetronicApp.controller('OrdersController',['$rootScope', '$scope', '$timeout','$http', function($rootScope, $scope, $timeout,$http) {

    $scope.$on('$viewContentLoaded', function() {   
        Metronic.initAjax(); // initialize core components
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_orders')); // set profile link active in sidebar menu 
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;  


}]); 

MetronicApp.controller('OrderUpdateController',['$rootScope', '$scope', '$timeout','$http','$stateParams','orderModel', function($rootScope, $scope, $timeout,$http,$stateParams,orderModel) {
    
    $scope.errors = {};

	$http.get("/adminapi/global/getcountries").success(function(response){
		$scope.countries = response;
	});

	orderModel.getOrder($stateParams.orderid).success(function(response){
		$scope.order = response;		
		$scope.order.address.country=$scope.order.address.country._id.$id;
	});

		
	$scope.contactRemove = function(i){
		
		$scope.order.contacts.splice(i, 1);
	}

	

	$scope.update = function(){

		var data = $scope.order;	
		
		//POST DATA WITH FILES
		orderModel.updateOrder(data,$stateParams.orderid).success(function(response){
			

		}).error(function(data, status, headers){						

			$scope.errors = data;

		});
	}

   
}]);

MetronicApp.controller('OrderShowController',['$rootScope', '$scope', '$timeout','$http','$stateParams','orderModel', function($rootScope, $scope, $timeout,$http,$stateParams,orderModel) {
   
    $scope.order = [];
    
    orderModel.getOrder($stateParams.order).success(function(response){
		
		$scope.order = response;
		$scope.shipping = response.user.address[response.delivery.address.key];

	});   
	  
}]);


MetronicApp.controller('OrderCreateController',['$scope', '$http', 'alcoholCart', 'NgMap',function($scope, $http, alcoholCart, NgMap){

	$scope.users = [];
	$scope.mobile = '';
	$scope.name = '';	

	angular.alcoholCart = alcoholCart;
	$scope.cart = alcoholCart.getCart();


	$scope.$watch('mobile',function() {

		if($scope.mobile.length < 3){
			return false;
		}
		var param = {mobile_number:$scope.mobile};
		$scope.fetchUser(param);

	});

	$scope.$watch('name',function() {

		if($scope.name.length < 3){
			return false;
		}
		var param = {name:$scope.name};
		$scope.fetchUser(param);

	});

	$scope.fetchUser = function(searchParams){

		$http.get("/adminapi/customer#asasd",{params: searchParams}).then(

			function(successRes){

				$scope.users = successRes.data;
			},
			function(errRes){
				
			}
		)

	}


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



}])

.controller('OrderProductsController',['$scope', '$http', 'alcoholCart', 'categoriesService', 'productFactory',function($scope, $http, alcoholCart, categoriesService, productFactory){

	angular.alcoholCart = alcoholCart;
	angular.categoriesService = categoriesService;

	$scope.alcoholCart = alcoholCart;
	$scope.categories = {};
	$scope.selectedproduct = "";

	$scope.selected = {
		product : '',
	}

	$scope.catSelected = {
		parent : '',
		sub : ''
	};
	
	$scope.$watch("catSelected",function(){

		$scope.itemlist = [];
		$scope.productquery = '';

	},true);

	$scope.itemlist = [];

	categoriesService.init().then(
		function(parentChildCategories){
			$scope.categories = parentChildCategories;
		}
	);

	$scope.$watch('productquery',function(newValue, oldValue){

		if(typeof newValue === 'undefined'){
			return false;
		}

		var qry = newValue;

		if(qry.length>=3){

			$scope.searching = true;		

			var searchParams = {
				qry : qry,
				parentCategory : $scope.catSelected.parent == ''?'':$scope.catSelected.parent._id,
				subCategory : $scope.catSelected.sub == ''?'':$scope.catSelected.sub._id
			};
			

			$http.get("/adminapi/product/searchproduct",{params : searchParams}).success(function(response){

				angular.forEach(response, function(value,key){
					response[key] = new productFactory(value);
				});

				$scope.itemlist = response;
				$scope.searching = false;
			});

			

		}else{

			$scope.itemlist = [];

		}

	})
	
	$scope.checkItem = function(){

		if(!$scope.itemlist) return [];

		return $scope.itemlist.filter(function(item){

			if  (alcoholCart.getProductById(item._id)) {
				item.added = true;
			}

			return item;

		});

	}

}])

.controller('OrderProductDetailController',['$scope', '$http', 'alcoholCart', 'categoriesService', 'productFactory',function($scope, $http, alcoholCart, categoriesService, productFactory){

	// $scope.product = new productFactory($scope.product);
	

	// var isInCart = alcoholCart.getProductById($scope.product._id);

	// $scope.product.qChilled = 0;
	// $scope.product.qNChilled = 0;

	// $scope.product.servechilled=$scope.product.chilled;

	// if(isInCart!==false){

	// 	$scope.isInCart = true;
	// 	$scope.product.qChilled = isInCart.getRQuantity('chilled');
	// 	$scope.product.qNChilled = isInCart.getRQuantity('nonchilled');
	// 	$scope.product.servechilled = isInCart.getLastServedAs();

	// }else{
	
	// 	if($scope.product.chilled){
	// 		$scope.product.qChilled = 1;
	// 	}else{
	// 		$scope.product.qNChilled = 1;
	// 	}
		

	// }

	// $scope.maxQuantity = $scope.product.quantity;

	// var available = $scope.maxQuantity-$scope.product.qNChilled+$scope.product.qChilled;

	// if(available<0){

	// 	$scope.overQunatity = true;
	// 	$scope.product.qNChilled = $scope.product.qNChilled + available;

	// }

	// var available = $scope.maxQuantity-$scope.product.qNChilled+$scope.product.qChilled;

	// if(available<0){

	// 	$scope.product.qChilled = $scope.product.qChilled + available;

	// }

	// $scope.$watchGroup(['product.qNChilled','product.qChilled','maxQuantity'],
	// 			function(newValue, oldValue) {

	// 				$scope.updateQuantity();

	// 			},true
	// 		);

	// $scope.updateQuantity = function(){

	// 	$scope.product.chilledMaxQuantity = $scope.maxQuantity - $scope.product.qNChilled;
	// 	$scope.product.nonChilledMaxQuantity = $scope.maxQuantity - $scope.product.qChilled;
	// 	$scope.tquantity = parseInt($scope.product.qNChilled)+parseInt($scope.product.qChilled);

	// }

	// $scope.addtocart = function(){

	// 	alcoholCart.addItem($scope.product._id,$scope.product.qChilled,true);
	// 	alcoholCart.addItem($scope.product._id,$scope.product.qNChilled,false);
	// 	$scope.isInCart = true;
	// };

}])