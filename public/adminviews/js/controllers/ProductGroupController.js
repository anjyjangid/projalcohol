'use strict';

MetronicApp.controller('ProductGroupController',[
	'$rootScope', '$scope', '$timeout','$http','fileUpload',
	function($rootScope, $scope, $timeout,$http,fileUpload) {

	$scope.$on('$viewContentLoaded', function() {   
		Metronic.initAjax(); // initialize core components
		Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_product_grouplist')); // set profile link active in sidebar menu         
		
		// set sidebar closed and body solid layout mode
		$rootScope.settings.layout.pageBodySolid = false;
		$rootScope.settings.layout.pageSidebarClosed = false;
	});

}]);

MetronicApp.controller('ProductGroupFormController',[
	'$rootScope', '$scope', '$location','$stateParams','$timeout','fileUpload','productgroupModel',
	function($rootScope, $scope,$location,$stateParams,$timeout,fileUpload,productgroupModel) {	

	$scope.productgroup = {
		cartonPurchased:1
	};
	$scope.errors = [];		

	if($stateParams.productgroupid){
		
		productgroupModel.getProductgroup($stateParams.productgroupid).success(function(data){
			
			$scope.productgroup = data;

		});	
	}	

	$scope.store = function(){

		if($stateParams.productgroupid){

			productgroupModel.update($scope.productgroup,$stateParams.productgroupid).success(function(response){						
				$location.path("productgroup/list");
			}).error(function(data, status, headers){			
				$scope.errors = data;					
			});

		}else{
			productgroupModel.store($scope.productgroup).success(function(response){						
				$location.path("productgroup/list");
			}).error(function(data, status, headers){			
				$scope.errors = data;							
			});
		}	
		
	};		

}]);