'use strict';

MetronicApp.controller('DealersController',['$rootScope', '$scope', '$timeout','$http', function($rootScope, $scope, $timeout,$http) {

    $scope.$on('$viewContentLoaded', function() {   
        Metronic.initAjax(); // initialize core components
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_dealers')); // set profile link active in sidebar menu 
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
		$scope.contacts.splice(i, 1);
	}

	$scope.save = function(){
		dealerModel.saveProduct({general:$scope.general, meta:$scope.meta}).success(function(response){
			console.log(response);
		}).error(function(response){
			console.log(response);
		});
	}

	$scope.store = function(){

		var data = $scope.dealer;	
		
		//POST DATA WITH FILES
		dealerModel.storeDealer(data).success(function(response){
			//console.log(response);
		}).error(function(data, status, headers){			
			$scope.errors = data;			
		});
	}

}]);
