'use strict';

MetronicApp.controller('PromotionalBannersController',
	['$rootScope', '$scope', '$timeout', '$http', 'sweetAlert',
	function($rootScope, $scope, $timeout,$http, sweetAlert){

	    $scope.$on('$viewContentLoaded', function(){
	        Metronic.initAjax(); // initialize core components
	        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_user')); // set profile link active in sidebar menu
	    });

	    // set sidebar closed and body solid layout mode
	    $rootScope.settings.layout.pageBodySolid = false;
	    $rootScope.settings.layout.pageSidebarClosed = false;

	    $scope.removePromotionalBanner = function(tab,checkedKeys){
	    	sweetAlert.swal({
				title: "Are you sure?",
				text: "Your will not be able to recover them!",
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: "#DD6B55",
				confirmButtonText: "Yes, remove !",
				closeOnConfirm: false,
				closeOnCancel: false

			}).then(
				function(isConfirm){
					console.log(isConfirm);
					if(isConfirm){
						$http.delete("/adminapi/"+tab+"/"+checkedKeys)
						.success(function(response){
							if(response.success){
								sweetAlert.swal("Deleted!", response.message, "success");
								grid.getDataTable().ajax.reload();//var grid = new Datatable(); Datatable should be init like this with global scope
							}else{
								sweetAlert.swal("Cancelled!", response.message, "error");
							}
						})
						.error(function(data, status, headers) {
							sweetAlert.swal("Cancelled", data.message, "error");
						})
					}else{
						sweetAlert.swal("Cancelled", "Record(s) safe :)", "error");
					}
				}
			);
	    }
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