'use strict';

MetronicApp.controller('GiftController',['$rootScope', '$scope', '$timeout','$http','$state','fileUpload','giftcategoryModel', function($rootScope, $scope, $timeout,$http,$state,fileUpload, giftcategoryModel) {

	$scope.$on('$viewContentLoaded', function() {   
		Metronic.initAjax(); // initialize core components
		Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_gifts')); // set profile link active in sidebar menu         
		
		// set sidebar closed and body solid layout mode
		$rootScope.settings.layout.pageBodySolid = false;
		$rootScope.settings.layout.pageSidebarClosed = false;  		

	});	

}]);

MetronicApp.controller('GiftFormController',['$scope', '$location','$stateParams','$state','fileUpload', 'giftModel', function($scope,$location,$stateParams,$state,fileUpload,giftModel) {

	$scope.gift = {
		type:0
	}

	$scope.giftoption = {
		category : ['Greeting Cards','Gift Wrappers','Bags & Basket']		
	}

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

MetronicApp.controller('GiftCategoryFormController',['$scope', '$location','$stateParams','$state','fileUpload', 'giftcategoryModel', function($scope,$location,$stateParams,$state,fileUpload,giftcategoryModel) {

	$scope.category = {
		parentlist:[]
	};
	
	giftcategoryModel.getParentlist().success(function(response){
		$scope.category.parentlist = response;
	});

	if($stateParams.categoryid){
		giftcategoryModel.get($stateParams.categoryid).success(function(response){
			$scope.giftcategory	= response;
		}).error(function(){
			$location.path('gifts/categorylist');
		});
	}

	$scope.storecategory = function(){
		var cid = null;
		if($stateParams.categoryid){
			cid = $stateParams.categoryid;
		}
		giftcategoryModel.store($scope.giftcategory,cid).success(function(){
			$state.go('userLayout.gifts.categorylist');
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

MetronicApp.controller('GiftCardController',['$scope', '$location','$stateParams','$state','fileUpload', 'giftModel', function($scope,$location,$stateParams,$state,fileUpload,giftModel) {

}]);