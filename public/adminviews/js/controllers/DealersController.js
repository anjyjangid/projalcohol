'use strict';

MetronicApp.controller('DealersController',['$rootScope', '$scope', '$timeout','$http', function($rootScope, $scope, $timeout,$http) {

    $scope.$on('$viewContentLoaded', function() {   
        Metronic.initAjax(); // initialize core components
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_user')); // set profile link active in sidebar menu 
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;  


}]); 


MetronicApp.controller('DealerAddController',['$scope','$http','dealerModel', function($scope,$http,dealerModel) {
	
	$scope.errors = {};

	$scope.dealer = {		
		status:"1",
		contacts : [{}]
	};	
		
	$http.get("/admin/global/getcountries").success(function(response){
		$scope.countries = response;
	});
	
	$scope.contactRemove = function(i){
		
		$scope.dealer.contacts.splice(i, 1);
	}

	$scope.store = function(){

		var data = $scope.dealer;	
		
		//POST DATA WITH FILES
		dealerModel.storeDealer(data).success(function(response){

		}).error(function(data, status, headers){						

			$scope.errors = data;

		});
	}

}]);


MetronicApp.controller('DealerUpdateController',['$rootScope', '$scope', '$timeout','$http','$stateParams','dealerModel', function($rootScope, $scope, $timeout,$http,$stateParams,dealerModel) {
    
    $scope.errors = {};

	$http.get("/admin/global/getcountries").success(function(response){
		$scope.countries = response;
	});

	dealerModel.getDealer($stateParams.dealerid).success(function(response){
		$scope.dealer = response;		
		$scope.dealer.address.country=$scope.dealer.address.country._id.$id;
	});

		
	$scope.contactRemove = function(i){
		
		$scope.dealer.contacts.splice(i, 1);
	}

	

	$scope.update = function(){

		var data = $scope.dealer;	
		
		//POST DATA WITH FILES
		dealerModel.updateDealer(data,$stateParams.dealerid).success(function(response){
			

		}).error(function(data, status, headers){						

			$scope.errors = data;

		});
	}

   
}]);


MetronicApp.controller('DealerShowController',['$rootScope', '$scope', '$timeout','$http','$stateParams','dealerModel', function($rootScope, $scope, $timeout,$http,$stateParams,dealerModel) {
   
    $scope.dealer = [];
    
    dealerModel.getDealer($stateParams.dealerid).success(function(response){
		$scope.dealer = response;
	});   
	  
}]);

MetronicApp.controller('DealerOrderController', function($rootScope, $scope, $http, $timeout, $stateParams) {

	$scope.orders = [];
	$scope.dealer = {};
	$scope.country = {};

	$http.get("/admin/dealer/dealerproduct/"+$stateParams.dealerid).success(function(response) {               
		$scope.orders = response.products;        
		$scope.dealer = response.dealer;        
		$scope.country = response.country;        
    });


    $scope.listOrder = function(type){
    	if($scope.orders.length == 0) return [];

    	if(type == 1){
	    	return $scope.orders.filter(function(order){
	    		return (order.sum <= 0);
	    	});
    	}else{
    		return $scope.orders.filter(function(order){
	    		return (order.sum > 0);
	    	});
    	}

    }

});