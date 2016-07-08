'use strict';

MetronicApp.controller('CouponController',['$rootScope', '$scope', '$timeout','$http', function($rootScope, $scope, $timeout,$http) {

    $scope.$on('$viewContentLoaded', function() {   
        Metronic.initAjax(); // initialize core components
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_coupon')); // set cms link active in sidebar menu 
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;  


}]); 

MetronicApp.controller('CouponAddController',['$rootScope','$scope','$http','$stateParams','couponModel','packageModel', function($rootScope,$scope,$http,$stateParams,couponModel,packageModel) {
	
	$scope.itemlist = [];

	$scope.searching = false;
	$scope.isupdate = false;
	$scope.errors = {};

	$scope.coupon = {		
		status:"1",
		type:"1",
	};

	angular.coupon = $scope.coupon;
	
	if($stateParams.couponId){

		$scope.isupdate = true;

		couponModel.getCoupon($stateParams.couponId).success(function(response){									
			
			$scope.coupon = response;

		}).error(function(data, status, headers){
						
			Metronic.alert({
                type: 'danger',
                icon: 'warning',
                message: 'Coupon not found',
                container: '.portlet-body',
                place: 'prepend',
                closeInSeconds: 3
            });

		});
	}

	$scope.store = function(){
		
		var data = $scope.coupon;
		
		if($stateParams.couponId){

			couponModel.update(data,$stateParams.couponId).success(function(response){

			}).error(function(data, status, headers){

				$scope.errors = data;

			});

		}else{
			couponModel.storeCoupon(data).success(function(response){

			}).error(function(data, status, headers){

				$scope.errors = data;

			});	
		}
		//POST DATA WITH FILES
		
	}

}]);