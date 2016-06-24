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

MetronicApp.controller('GiftFormController',[
	'$scope', '$location','$stateParams','$state','fileUpload', 'giftModel', '$filter',
	function($scope,$location,$stateParams,$state,fileUpload,giftModel,$filter) {	

	$scope.gift = {
		type:0,
		gtype:'5767d8b9b190ec4d0b8b4569',
		gsubtype:'576a41e0b190ec9c0b8b4567'
	}

	$scope.giftoption = {
		category : [],
		subcategory: []		
	}

	giftModel.getCategorylist().success(function(result){
		$scope.giftoption.category = result;
	});

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

	$scope.onlyParent = function(categories){
		if(!categories) return [];			
		return categories.filter(function(category){
			return (!category.parent || category.parent == null);
		});
		
	}

	$scope.onlyChild = function(categories,parent){
		if(!categories) return [];

		var res = categories.filter(function(category){
			return (category.parent && category.parent == parent);
		});

		if(res.length == 0){			
			delete $scope.gift.gsubtype;
		}else{
			return res;
		}
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
		if($scope.giftcategory._id){
			cid = $scope.giftcategory._id;	
		}
		giftcategoryModel.store($scope.giftcategory,cid).success(function(){
			$scope.errors = [];
			if($scope.giftcategory.type!='giftcard'){
				$state.go('userLayout.gifts.categorylist');
			}else{
				Metronic.alert({
	                type: 'success',
	                icon: 'info',
	                message: 'Details has been saved successfully.',
	                container: '.portlet-body',
	                place: 'prepend',		                
	            });
			}

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

	$scope.giftcategory = {
		cards : [{}],
		type:'giftcard'
	}

	giftModel.getGiftcard().success(function(result){
		$scope.giftcategory = result;
	});

}]);