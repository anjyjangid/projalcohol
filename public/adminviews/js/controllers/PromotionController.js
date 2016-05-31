'use strict';

MetronicApp.controller('PromotionController',['$rootScope', '$scope', '$timeout','$http', function($rootScope, $scope, $timeout,$http) {

    $scope.$on('$viewContentLoaded', function() {   
        Metronic.initAjax(); // initialize core components
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_promotion')); // set cms link active in sidebar menu 
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;  


}]); 

MetronicApp.controller('PromotionAddController',['$rootScope','$scope','$http','$stateParams','promotionModel','packageModel', function($rootScope,$scope,$http,$stateParams,promotionModel,packageModel) {
	
	$scope.itemlist = [];

	$scope.searching = false;
	$scope.isupdate = false;
	$scope.errors = {};

	$scope.promotion = {		
		status:"1",
		products:[],		
	};

	angular.promotion = $scope.promotion;
	
	if($stateParams.promotionId){

		$scope.isupdate = true;

		promotionModel.getPromotion($stateParams.promotionId).success(function(response){									
			
			$scope.promotion = response;

		}).error(function(data, status, headers){
						
			Metronic.alert({
                type: 'danger',
                icon: 'warning',
                message: 'Promotion not found',
                container: '.portlet-body',
                place: 'prepend',
                closeInSeconds: 3
            });

		});
	}

	$scope.store = function(){
		
		var data = $scope.promotion;
		
		//POST DATA WITH FILES
		promotionModel.storePromotion(data).success(function(response){

		}).error(function(data, status, headers){

			$scope.errors = data;

		});
	}

	$scope.update = function(){
		
		var data = $scope.promotion;
				
		promotionModel.update(data,$stateParams.promotionId).success(function(response){

		}).error(function(data, status, headers){

			$scope.errors = data;

		});
	}


	$scope.addItem = function(p){

		delete $scope.errors.products;

		p.added = true;
		p.quantity = 1;			

		$scope.promotion.products.push(angular.copy(p));			

	};

	$scope.searchItem = function($event){

		var qry = $event.currentTarget.value;
		if(qry.length>=3){
			$scope.searching = true;
			packageModel.searchItem(qry).success(function(response){
				$scope.itemlist = response;
				$scope.searching = false;
			});
		}else{
			$scope.itemlist = [];
		}
	};
	
	$scope.removeProduct = function(index){
		$scope.promotion.products.splice(index,1);
	}

	$scope.checkItem = function(){

		if(!$scope.itemlist) return [];	

		return $scope.itemlist.filter(function(item){

			angular.forEach($scope.promotion.products, function (pro) {
				if  (pro._id === item._id) {
					item.added = true;
				}
			});

			return item;

		});

	}

	$scope.clearSearch = function(cg){
		$scope.currentGroup = cg;
		$scope.searchbox = '';
		$scope.itemlist = [];
	}

}]);