'use strict';

MetronicApp.controller('PromotionalBannersController',
	['$rootScope', '$scope', '$timeout','$http',
	function($rootScope, $scope, $timeout,$http){

	    $scope.$on('$viewContentLoaded', function(){
	        Metronic.initAjax(); // initialize core components
	        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_user')); // set profile link active in sidebar menu
	    });

	    // set sidebar closed and body solid layout mode
	    $rootScope.settings.layout.pageBodySolid = false;
	    $rootScope.settings.layout.pageSidebarClosed = false;
}]);

MetronicApp.controller('PromotionalBannersAddController',
	['$scope','$http','promotionalBannersModel',
	function($scope,$http,promotionalBannersModel){

		$scope.errors = {};
		$scope.promotionalbanner = {};

		$scope.submit = function(){
			$scope.store();
		}

		$scope.store = function(){
			var data = $scope.promotionalbanner;
			//POST DATA WITH FILES
			promotionalBannersModel.storePromotionalBanner(data).success(function(response){

			}).error(function(data, status, headers){
				$scope.errors = data;
			});
		}
}]);

MetronicApp.controller('PromotionalBannersUpdateController',
	['$rootScope', '$scope', '$timeout','$http','$stateParams','promotionalBannersModel',
	function($rootScope, $scope, $timeout,$http,$stateParams,promotionalBannersModel){

	    $scope.errors = {};
	    $scope.promotionalbanner = {};

		promotionalBannersModel.getPromotionalBanner($stateParams.promotionalbannerid).success(function(response){
			$scope.promotionalbanner = response;
		});

		$scope.submit = function(){
			$scope.update();
		}

		$scope.update = function(){
			var data = $scope.promotionalbanner;	
			//POST DATA WITH FILES
			promotionalBannersModel.updatePromotionalBanner(data,$stateParams.promotionalbannerid).success(function(response){

			}).error(function(data, status, headers){						
				$scope.errors = data;
			});
		}
}]);