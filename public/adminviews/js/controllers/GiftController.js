'use strict';

MetronicApp.controller('GiftController',[
	'$rootScope', '$scope', '$timeout','$http','$state','fileUpload','giftModel',
	function($rootScope, $scope, $timeout,$http,$state,fileUpload, giftModel) {

	$scope.$on('$viewContentLoaded', function() {   
		Metronic.initAjax(); // initialize core components
		Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_gifts')); // set profile link active in sidebar menu         
		
		// set sidebar closed and body solid layout mode
		$rootScope.settings.layout.pageBodySolid = false;
		$rootScope.settings.layout.pageSidebarClosed = false;  		

	});	

	$scope.pricing = {
		setting:{},
		global:{}
	}

	giftModel.getSettings().success(function(result){		
		$scope.pricing.setting = result.settings.gift_packaging;
		$scope.pricing.global = result.settings.gift_packaging;
	});

}]);

MetronicApp.controller('GiftFormController',[
	'$scope', '$location','$stateParams','$state','fileUpload', 'giftModel', '$filter',
	function($scope,$location,$stateParams,$state,fileUpload,giftModel,$filter) {	

	$scope.gift = {
		type:1,
		costprice:null
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

		if(res.length == 0 && categories.length){			
			delete $scope.gift.subcategory;
		}else{
			return res;
		}
	}		

	//REMOVE LIMIT PARAM FROM SCOPE IF NOT REQUIRED
	$scope.$watch('gift.type',function(nval,pval){
		if(nval!=pval && nval == 0){
			delete $scope.gift.limit;
		}
	});

	$scope.itemPricing = function(flg){
		if(flg){
			$scope.gift.gift_packaging = angular.copy($scope.pricing.setting);
		}else{
			delete $scope.gift.gift_packaging;
		}
	}

	$scope.formatNumber = function(i) {	    
	    return i.toFixed(2);	    	    
	}


	//UPDATE PRICING ON CATEGORY CHANGE
	$scope.$watch('gift.category',function(nval,pval){
		if(nval){
			var search = $filter('filter')($scope.giftoption.category, {_id:nval});
			if(search[0].gift_packaging){				
				$scope.pricing.setting = search[0].gift_packaging;	
			}else{
				$scope.pricing.setting = $scope.pricing.global;
			}			
		}else{			
			$scope.pricing.setting = $scope.pricing.global;
		}
	});

	//UPDATE PRICING ON SUBCATEGORY CHANGE
	$scope.$watch('gift.subcategory',function(nval,pval){
		if(nval){
			var search = $filter('filter')($scope.giftoption.category, {_id:nval});
			if(search[0].gift_packaging){				
				$scope.pricing.setting = search[0].gift_packaging;	
			}else{
				var searchparent = $filter('filter')($scope.giftoption.category, {_id:$scope.gift.category});
				if(searchparent[0].gift_packaging){
					$scope.pricing.setting = searchparent[0].gift_packaging;
				}else{
					$scope.pricing.setting = $scope.pricing.global;
				}
			}			
		}else{
			$scope.pricing.setting = $scope.pricing.global;
		}
	});

}]);

MetronicApp.controller('GiftCategoryFormController',
	['$scope', '$location','$stateParams','$state','fileUpload', 'giftcategoryModel', '$filter', 
	function($scope,$location,$stateParams,$state,fileUpload,giftcategoryModel, $filter) {

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

	$scope.editPricing = function(flg){
		if(flg){
			$scope.giftcategory.gift_packaging = angular.copy($scope.pricing.setting);
		}else{
			delete $scope.giftcategory.gift_packaging;
		}
	}	

	$scope.$watch('giftcategory.parent',function(nval,pval){
		if(nval){
			var search = $filter('filter')($scope.category.parentlist, {_id:nval});
			if(search[0].gift_packaging){				
				$scope.pricing.setting = search[0].gift_packaging;	
			}else{
				$scope.pricing.setting = $scope.pricing.global;
			}			
		}else{
			$scope.pricing.setting = $scope.pricing.global;
		}
	});

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