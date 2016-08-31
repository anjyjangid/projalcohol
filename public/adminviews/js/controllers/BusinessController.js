'use strict';

MetronicApp.controller('BusinessController',['$rootScope', '$scope', '$timeout','$http','businessModel', function($rootScope, $scope, $timeout,$http,businessModel) {
console.log('fdas');

	$scope.$on('$viewContentLoaded', function() {   
		Metronic.initAjax(); // initialize core components
		Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_user')); // set profile link active in sidebar menu         
		
		// set sidebar closed and body solid layout mode
		$rootScope.settings.layout.pageBodySolid = false;
		$rootScope.settings.layout.pageSidebarClosed = false;  
		
	});

}]);

MetronicApp.controller('BusinessAddController',['$scope', '$http','businessModel', function($scope,$http,businessModel) {
	
	$scope.errors = {};

	$scope.business = {		
		status:"1",
		billing_address : [{}],
		delivery_address : [{}]		
	};	
	
	$scope.store = function(){

		var data = $scope.business;	
		
		//POST DATA WITH FILES
		businessModel.storeBusiness(data).success(function(response){

		}).error(function(data, status, headers){						

			$scope.errors = data;

		});
	}

	$scope.billingAddressRemove = function(i){
		
		$scope.business.billing_address.splice(i, 1);
	}

	$scope.deliveryAddressRemove = function(i){
		
		$scope.business.delivery_address.splice(i, 1);
	}	

}]);


MetronicApp.controller('BusinessUpdateController',['$rootScope', '$scope', '$timeout','$http','$stateParams','businessModel', function($rootScope, $scope, $timeout,$http,$stateParams,businessModel) {

	businessModel.getBusiness($stateParams.businessid).success(function(data){
		$scope.business = data;
		$scope.hideBasicInfo = true; 
	});

	$scope.store = function(){

		var data = $scope.business;		
		//POST DATA WITH FILES
		businessModel.updateBusiness(data,$stateParams.businessid).success(function(response){
			//$location.path("business/list");
		}).error(function(data, status, headers){						
			$scope.errors = data;			
		});
	}

	$scope.billingAddressRemove = function(i){
		
		$scope.business.billing_address.splice(i, 1);
	}

	$scope.deliveryAddressRemove = function(i){
		
		$scope.business.delivery_address.splice(i, 1);
	}	


}]);