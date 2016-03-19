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
