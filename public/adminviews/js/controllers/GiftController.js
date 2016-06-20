'use strict';

MetronicApp.controller('GiftController',['$rootScope', '$scope', '$timeout','$http','$state','fileUpload', function($rootScope, $scope, $timeout,$http,$state,fileUpload) {

	$scope.$on('$viewContentLoaded', function() {   
		Metronic.initAjax(); // initialize core components
		Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_gifts')); // set profile link active in sidebar menu         
		
		// set sidebar closed and body solid layout mode
		$rootScope.settings.layout.pageBodySolid = false;
		$rootScope.settings.layout.pageSidebarClosed = false;  		
		
		

	});

	$scope.gift = {
		type:0
	}

	$scope.giftoption = {
		category : ['Greeting Cards','Gift Wrappers','Bags & Basket']		
	}

}]);

MetronicApp.controller('GiftFormController',['$scope', '$location','$stateParams','$state','fileUpload', 'giftModel', function($scope,$location,$stateParams,$state,fileUpload,giftModel) {

	if($stateParams.giftid){
		giftModel.get($stateParams.giftid).success(function(response){
			$scope.gift	= response;
		}).error(function(){
			$location.path('gifts/list');
		});
	}

	$scope.store = function(){
		var url = '/adminapi/gift';
		if($stateParams.giftid){
			url = '/adminapi/gift/update/'+$stateParams.giftid;
		}

		giftModel.store(url,$scope.gift).success(function(){
			$state.go('userLayout.gifts.list');
		}).error(function(data){
			$scope.errors = data;
			Metronic.alert({
                type: 'danger',
                icon: 'warning',
                message: 'Please enter all required fields.',
                container: '.portlet-body',
                place: 'prepend',
                closeInSeconds: 3
            });
		});	

	}	

}]);