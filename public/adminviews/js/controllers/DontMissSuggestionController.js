'use strict';

MetronicApp.controller('DontMissSuggestionController',['$rootScope','$scope','$http','$stateParams','dontmissModel', function($rootScope,$scope,$http,$stateParams,dontmissModel) {

    $scope.$on('$viewContentLoaded', function() {   
        Metronic.initAjax(); // initialize core components
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_dontmiss')); // set cms link active in sidebar menu 
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;  

	$scope.itemlist = [];

	$scope.searching = false;
	$scope.isupdate = false;
	$scope.products = [];
	$scope.errors = {};

	$scope.dontmiss = {};

	

	dontmissModel.get().success(function(response){									
		
		$scope.dontmiss = {
			quantity:response.quantity
		};

		angular.forEach(response.dontMiss, function(product){
			product._id = product._id.$id;
			$scope.products.push(product);
		});
		 

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
	

	$scope.store = function(){
		
		var data = $scope.dontmiss;
		data.products = [];
		angular.forEach($scope.products, function(product){
			data.products.push(product._id);
		});

		dontmissModel.store(data).success(function(response){

		}).error(function(data, status, headers){

			$scope.errors = data;

		});
		
	}



	// Suggestion Product Start

	$scope.addItem = function(p){

		delete $scope.errors.products;

		p.added = true;
		p.quantity = 1;			

		$scope.products.push(angular.copy(p));			

	};

	$scope.searchItem = function($event){

		var qry = $event.currentTarget.value;
		if(qry.length>=3){
			$scope.searching = true;
			dontmissModel.searchItem(qry).success(function(response){
				$scope.itemlist = response;
				$scope.searching = false;
			});
		}else{
			$scope.itemlist = [];
		}
	};
	
	$scope.removeProduct = function(index){
		$scope.products.splice(index,1);
	}

	$scope.checkItem = function(){

		if(!$scope.itemlist) return [];	

		return $scope.itemlist.filter(function(item){

			angular.forEach($scope.products, function (pro) {
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

	// Suggestion Product End

}]);