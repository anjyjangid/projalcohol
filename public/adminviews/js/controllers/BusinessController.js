'use strict';

MetronicApp.controller('BusinessController',['$rootScope', '$scope', '$timeout','$http','businessModel', '$q'
, function($rootScope, $scope, $timeout,$http,businessModel, $q) {

	$scope.$on('$viewContentLoaded', function() {   
		Metronic.initAjax(); // initialize core components
		Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_user')); // set profile link active in sidebar menu         
		
		// set sidebar closed and body solid layout mode
		$rootScope.settings.layout.pageBodySolid = false;
		$rootScope.settings.layout.pageSidebarClosed = false;  
		
	});

}]);

MetronicApp.controller('BusinessAddController',['$scope', '$http','businessModel', function($scope,$http,businessModel) {
	
	$scope.errors = {};
	$scope.business = {		
		status:"1",
		billing_address : [{}],
		delivery_address : [{}]		
	};	
	
	$scope.store = function(){

		var data = $scope.business;	
		
		//POST DATA WITH FILES
		businessModel.storeBusiness(data).success(function(response){

		}).error(function(data, status, headers){						

			$scope.errors = data;

		});
	}

	$scope.billingAddressRemove = function(i){
		
		$scope.business.billing_address.splice(i, 1);
	}

	$scope.deliveryAddressRemove = function(i){
		
		$scope.business.delivery_address.splice(i, 1);
	}	

}]);


MetronicApp.controller('BusinessUpdateController',['$rootScope', '$scope', '$timeout','$http','$stateParams','businessModel', '$q'
, function($rootScope, $scope, $timeout,$http,$stateParams,businessModel, $q) {

	businessModel.getBusiness($stateParams.businessid).success(function(data){

		if(!data.products)
			data.products = [];

		$scope.business = data;
		if(typeof data.billing_address == 'undefined'){
			$scope.business.billing_address = [{}];
		}
		if(typeof data.delivery_address == 'undefined'){
			$scope.business.delivery_address = [{}];
		}
		$scope.hideBasicInfo = true;

	});

	$scope.store = function(){
		businessModel.updateBusiness($scope.business, $stateParams.businessid)
		.success(function(response){
			//$location.path("business/list");
		}).error(function(data, status, headers){						
			$scope.errors = data;			
		});
	}

	$scope.billingAddressRemove = function(i){
		
		$scope.business.billing_address.splice(i, 1);
	}

	$scope.deliveryAddressRemove = function(i){
		
		$scope.business.delivery_address.splice(i, 1);
	}	

	$scope.product = { searchBox: null, waitQueue: null, reqTimeout: $q.defer() };

	$scope.searchItem = function(){
		var qry = $scope.product.searchBox;

		if($scope.product.waitQueue)
			$timeout.cancel($scope.product.waitQueue);

		if(qry && qry.length>=3) {
			$scope.searching = true;

			$scope.product.waitQueue = $timeout(function(){
				$scope.product.reqTimeout.resolve();
				$scope.product.reqTimeout = $q.defer();
				$http.get("/adminapi/package/searchproduct",{params:{length:10,qry:qry}, timeout: $scope.product.reqTimeout.promise})
				.then(function(response) {

					response.data.forEach(function(item){
						for(var i in $scope.business.products){
							if($scope.business.products[i]._id == item._id){
								item.added=true;
								break;
							}
						}
					})

					$scope.itemlist = response.data;
				})
				.finally(function() {
					$scope.searching = false;
				});
			}, 600);
		}
		else {
			$scope.itemlist = [];
		}
	};

	$scope.$watch('product.searchBox', $scope.searchItem);

	$scope.addItem = function(p){
		p.added = true;
		p.quantity = 1;

		$scope.business.products.push(angular.copy(p));
	};

	$scope.removeItem = function(proKey){
		$scope.business.products.splice(proKey,1);
	}

}]);