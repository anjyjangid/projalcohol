'use strict';

MetronicApp.controller('CustomerController',['$rootScope', '$scope', '$timeout','$http','customerModel', function($rootScope, $scope, $timeout,$http,customerModel) {

	$scope.$on('$viewContentLoaded', function() {   
		Metronic.initAjax(); // initialize core components
		Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_customer')); // set profile link active in sidebar menu         
		
		// set sidebar closed and body solid layout mode
		$rootScope.settings.layout.pageBodySolid = false;
		$rootScope.settings.layout.pageSidebarClosed = false;  
		
	});

}]);

MetronicApp.controller('CustomerAddController',['$scope', '$http','customerModel', function($scope,$http,customerModel) {
	
	$scope.errors = {};

	$scope.customer = {		
		status:"1"
	};	
	
	$scope.store = function(){

		var data = $scope.customer;	
		
		//POST DATA WITH FILES
		customerModel.storeCustomer(data).success(function(response){

		}).error(function(data, status, headers){						

			$scope.errors = data;

		});
	}

}]);


MetronicApp.controller('CustomerUpdateController',['$rootScope', '$scope', '$timeout','$http','$stateParams','customerModel', function($rootScope, $scope, $timeout,$http,$stateParams,customerModel) {

	customerModel.getCustomer($stateParams.customerid).success(function(data){
		$scope.customer = data;
		$scope.hideBasicInfo = true; 
	});

	$scope.store = function(){

		var data = $scope.customer;		
		//POST DATA WITH FILES
		customerModel.updateCustomer(data,$stateParams.customerid).success(function(response){
			//$location.path("customer/list");
		}).error(function(data, status, headers){						
			$scope.errors = data;			
		});
	}

}]);