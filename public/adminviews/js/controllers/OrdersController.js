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


MetronicApp.controller('OrderCreateController',['$scope','alcoholCart',function($scope){

	$scope.step = 20;

}]);

MetronicApp.controller('OrderCartController',['$scope','$http','alcoholCart',function($scope,$http,alcoholCart){
	
	$scope.users = [];

	$scope.$watch('mobile',function() {

		var param = {mobile_number:$scope.mobile};
		$scope.fetchUser(param);

	});

	$scope.fetchUser = function(searchParams){

		$http.get("/adminapi/customer",{params: searchParams}).then(

			function(successRes){

				$scope.users = successRes.data;
			},
			function(errRes){
				
			}
		)

	}
	

}]);

